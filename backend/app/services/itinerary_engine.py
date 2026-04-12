"""
Itinerary generation engine — adapted from Integrate.py with minimal changes.
Key change: reads data from Supabase instead of Excel files.
"""

from __future__ import annotations

import difflib
import json
import logging
import threading
from math import atan2, cos, radians, sin, sqrt
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from typing_extensions import TypedDict

from app.core.config import get_settings
from app.services.supabase_data import (
    get_attractions_df,
    get_food_df,
    get_lodging_df,
    get_shops_df,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LLM factory
# ---------------------------------------------------------------------------

def _get_llm() -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        base_url=settings.LLM_BASE_URL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.OPENAI_API_KEY,
    )


# ---------------------------------------------------------------------------
# Haversine helper (unchanged from original)
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def cluster_attractions(
    place_coordinates: Dict[str, Dict[str, float]],
    max_distance_km: float = 40.0,
) -> Dict[int, List[str]]:
    if not place_coordinates:
        return {}

    names = list(place_coordinates.keys())
    coords = np.array(
        [[radians(v["lat"]), radians(v["lng"])] for v in place_coordinates.values()]
    )
    epsilon = max_distance_km / 6371.0
    db = DBSCAN(eps=epsilon, min_samples=1, metric="haversine").fit(coords)

    clusters: Dict[int, List[str]] = {}
    for label, name in zip(db.labels_, names):
        clusters.setdefault(int(label), []).append(name)
    return clusters


def compute_centroid(
    place_names: List[str], place_coordinates: Dict[str, Dict[str, float]]
) -> Dict[str, float]:
    lat_sum = lng_sum = 0.0
    count = 0
    for name in place_names:
        coords = place_coordinates.get(name)
        if coords:
            lat_sum += coords["lat"]
            lng_sum += coords["lng"]
            count += 1
    if count == 0:
        return {"lat": 0.0, "lng": 0.0}
    return {"lat": lat_sum / count, "lng": lng_sum / count}


def auto_balance_clusters(
    clusters: Dict[int, List[str]],
    place_coordinates: Dict[str, Dict[str, float]],
    target_days: int,
) -> Dict[int, List[str]]:
    if not clusters:
        return clusters

    clusters = {k: list(v) for k, v in clusters.items()}

    # Merge if more clusters than days
    while len(clusters) > target_days:
        cluster_ids = list(clusters.keys())
        min_dist = float("inf")
        pair_to_merge = None
        for i in range(len(cluster_ids)):
            for j in range(i + 1, len(cluster_ids)):
                c1, c2 = cluster_ids[i], cluster_ids[j]
                centroid1 = compute_centroid(clusters[c1], place_coordinates)
                centroid2 = compute_centroid(clusters[c2], place_coordinates)
                dist = haversine_km(
                    centroid1["lat"], centroid1["lng"],
                    centroid2["lat"], centroid2["lng"],
                )
                if dist < min_dist:
                    min_dist = dist
                    pair_to_merge = (c1, c2)
        c1, c2 = pair_to_merge
        clusters[c1].extend(clusters[c2])
        del clusters[c2]

    # Redistribute if uneven
    changed = True
    while changed:
        changed = False
        sorted_clusters = sorted(clusters.items(), key=lambda x: len(x[1]))
        smallest_id, smallest_list = sorted_clusters[0]
        largest_id, largest_list = sorted_clusters[-1]
        if len(largest_list) - len(smallest_list) <= 1:
            break
        smallest_centroid = compute_centroid(smallest_list, place_coordinates)
        best_candidate = None
        min_dist = float("inf")
        for attraction in largest_list:
            coords = place_coordinates.get(attraction)
            if not coords:
                continue
            dist = haversine_km(
                coords["lat"], coords["lng"],
                smallest_centroid["lat"], smallest_centroid["lng"],
            )
            if dist < min_dist:
                min_dist = dist
                best_candidate = attraction
        if best_candidate:
            clusters[largest_id].remove(best_candidate)
            clusters[smallest_id].append(best_candidate)
            changed = True
    return clusters


def nearest_from_pool(
    anchor_coords: List[Dict[str, float]],
    pool_df: pd.DataFrame,
    top_n: int = 5,
    max_radius_km: float = 80.0,
) -> List[Dict[str, Any]]:
    if pool_df.empty or not anchor_coords:
        return []

    scored: List[tuple] = []
    for row in pool_df.to_dict("records"):
        try:
            rlat = float(row["latitude"])
            rlng = float(row["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        min_dist = min(
            haversine_km(a["lat"], a["lng"], rlat, rlng) for a in anchor_coords
        )
        if min_dist <= max_radius_km:
            entry = dict(row)
            entry["_nearest_km"] = round(min_dist, 2)
            scored.append((min_dist, entry))

    scored.sort(key=lambda x: x[0])
    return [item for _, item in scored[:top_n]]


def find_close_district(district_name: str, df_attractions: pd.DataFrame) -> str | int:
    target = str(district_name).strip().lower()
    vals = df_attractions["district"].astype(str).str.strip().str.lower().tolist()
    matches = difflib.get_close_matches(target, vals, n=5, cutoff=0.6)
    return matches[0] if matches else 0


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class ItineraryState(TypedDict):
    user_query: str
    parsed_days: Optional[int]
    parsed_location: Optional[str]
    parsed_preferences: Optional[List[str]]
    query_parse_error: Optional[str]
    include_food: bool
    include_souvenirs: bool
    retrieved_attractions: List[Dict[str, Any]]
    retrieval_metadata: Dict[str, Any]
    place_coordinates: Dict[str, Dict[str, float]]
    draft_itinerary: Optional[str]
    retry_count: int
    clusters: Dict[int, List[str]]
    clustered_optional_places: Dict[int, Dict[str, List[Dict[str, Any]]]]
    budget_needed: float


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class ItineraryGenerator:
    """Thread-safe itinerary generator. Loads data once, reuses across requests."""

    def __init__(self) -> None:
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.llm = _get_llm()
        self._load_data()

    def _load_data(self) -> None:
        self.df_attractions = get_attractions_df()
        self.df_food = get_food_df()
        self.df_souvenirs = get_shops_df()
        self.df_lodging = get_lodging_df()

        if not self.df_attractions.empty:
            self.df_attractions["search_text"] = self.df_attractions.apply(
                lambda r: f"{r.get('_key', '')} {r.get('category', '')} {r.get('Desc', '')} {r.get('district', '')}",
                axis=1,
            )
            self.embeddings = self.embedding_model.encode(
                self.df_attractions["search_text"].tolist(), show_progress_bar=False
            )
        else:
            self.embeddings = np.array([])

    def reload_data(self) -> None:
        """Reload data from Supabase (call after data changes)."""
        from app.services.supabase_data import clear_cache
        clear_cache()
        self._load_data()

    def create_graph(self):
        wf = StateGraph(ItineraryState)
        wf.add_node("semantic_searcher", self.semantic_search)
        wf.add_node("data_enricher", self.enrich_data)
        wf.add_node("select_optional_places", self.select_optional_places)
        wf.add_node("itinerary_generator", self.generate_itinerary)
        wf.set_entry_point("semantic_searcher")
        wf.add_edge("semantic_searcher", "data_enricher")
        wf.add_edge("data_enricher", "select_optional_places")
        wf.add_edge("select_optional_places", "itinerary_generator")
        wf.add_edge("itinerary_generator", END)
        return wf.compile()

    # --- Node: Semantic Search ---
    def semantic_search(self, state: ItineraryState) -> ItineraryState:
        if self.df_attractions.empty:
            return {**state, "retrieved_attractions": [], "retrieval_metadata": {"total_results": 0, "avg_score": 0.0}}

        location = state.get("parsed_location")
        if location:
            location = find_close_district(location, self.df_attractions)
        if location:
            state["parsed_location"] = location

        prefs = state.get("parsed_preferences") or []
        query_txt = f"{state['parsed_location']} {' '.join(prefs)}"
        q_emb = self.embedding_model.encode([query_txt])
        sims = np.dot(self.embeddings, q_emb.T).flatten()
        top_idx = np.argsort(sims)[::-1]
        location_str = (state.get("parsed_location") or "").strip().lower()

        filtered = []
        for i in top_idx:
            row = self.df_attractions.iloc[i]
            if location_str and row["district"] != location_str:
                continue
            filtered.append({**row.to_dict(), "similarity_score": float(sims[i])})
            if len(filtered) >= state.get("parsed_days", 3) * 4:
                break

        return {
            **state,
            "retrieved_attractions": filtered,
            "retrieval_metadata": {
                "total_results": len(filtered),
                "avg_score": float(np.mean([a["similarity_score"] for a in filtered])) if filtered else 0.0,
            },
        }

    # --- Node: Data Enricher ---
    def enrich_data(self, state: ItineraryState) -> ItineraryState:
        place_coordinates: Dict[str, Dict[str, float]] = {}
        enriched = []
        for attr in state["retrieved_attractions"]:
            name = str(attr.get("_key", "unknown"))
            try:
                place_coordinates[name] = {
                    "lat": float(attr["latitude"]),
                    "lng": float(attr["longitude"]),
                }
            except (KeyError, TypeError, ValueError):
                pass
            attr.setdefault("estimated_duration_hrs", 2)
            enriched.append(attr)
        return {**state, "retrieved_attractions": enriched, "place_coordinates": place_coordinates}

    # --- Node: Select Optional Places ---
    def select_optional_places(self, state: ItineraryState) -> ItineraryState:
        clusters = cluster_attractions(state["place_coordinates"], max_distance_km=10.0)
        clusters = auto_balance_clusters(clusters, state["place_coordinates"], target_days=state["parsed_days"])

        clustered_optional: Dict[int, Dict] = {}
        budget_needed = 0.0

        for cluster_id, place_names in clusters.items():
            anchors = [state["place_coordinates"][n] for n in place_names if n in state["place_coordinates"]]
            cluster_data: Dict[str, Any] = {}

            cluster_data["food"] = (
                nearest_from_pool(anchors, self.df_food, top_n=3, max_radius_km=40.0)
                if state.get("include_food") else []
            )
            cluster_data["souvenirs"] = (
                nearest_from_pool(anchors, self.df_souvenirs, top_n=2, max_radius_km=40.0)
                if state.get("include_souvenirs") else []
            )
            lodging_candidates = nearest_from_pool(anchors, self.df_lodging, top_n=5, max_radius_km=60.0)
            if lodging_candidates:
                lodging_candidates.sort(key=lambda x: float(x.get("price", float("inf"))))
                cluster_data["lodging"] = lodging_candidates
                budget_needed += float(lodging_candidates[0].get("price", 0))
            else:
                cluster_data["lodging"] = []

            clustered_optional[cluster_id] = cluster_data

        return {
            **state,
            "clusters": clusters,
            "clustered_optional_places": clustered_optional,
            "budget_needed": budget_needed,
        }

    # --- Node: Generate Itinerary ---
    def generate_itinerary(self, state: ItineraryState) -> ItineraryState:
        clusters = state.get("clusters", {})
        clustered_optional = state.get("clustered_optional_places", {})

        if not clusters:
            return {**state, "draft_itinerary": "{}"}

        cluster_ids = sorted(clusters.keys())

        # Ask LLM for cluster ordering
        system_prompt = """You are a travel planner.
Given numbered clusters, return ONLY a JSON array representing the order of clusters for the itinerary.
Example: [0, 1, 2]
Rules: Use each cluster exactly once. Return raw JSON only."""

        user_prompt = f"We have {len(cluster_ids)} clusters for a {state['parsed_days']}-day trip.\nCluster IDs: {cluster_ids}\nReturn the best visiting order."

        try:
            response = self.llm.invoke([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ])
            cluster_order = json.loads(response.content)
        except Exception:
            cluster_order = cluster_ids

        final_output = {}
        for day_index, cluster_id in enumerate(cluster_order):
            attractions = clusters.get(cluster_id, [])
            optional = clustered_optional.get(cluster_id, {})
            food = optional.get("food", [])
            souvenirs = optional.get("souvenirs", [])
            lodging = optional.get("lodging", [])

            final_output[f"day_{day_index + 1}"] = {
                "attractions": attractions,
                "food": [f.get("_key") for f in food if f.get("_key")],
                "souvenir_shops": [s.get("_key") for s in souvenirs if s.get("_key")],
                "lodging": [l.get("_key") for l in lodging if l.get("_key")][:2],
            }

        # Anti-hallucination validation
        allowed_names = set()
        for c in clusters.values():
            allowed_names.update(c)
        for opt in clustered_optional.values():
            for category in opt.values():
                if isinstance(category, list):
                    for place in category:
                        if isinstance(place, dict) and "_key" in place:
                            allowed_names.add(place["_key"])

        for day in final_output.values():
            for category_name in day:
                for name in day[category_name]:
                    if name not in allowed_names:
                        logger.error("Hallucination detected: %s not in allowed names", name)
                        raise ValueError(f"Hallucination detected: {name}")

        return {**state, "draft_itinerary": json.dumps(final_output, indent=4)}


# ---------------------------------------------------------------------------
# Singleton instance (loaded once at startup)
# ---------------------------------------------------------------------------

_generator: ItineraryGenerator | None = None
_generator_lock = threading.Lock()


def get_generator() -> ItineraryGenerator:
    """Thread-safe singleton accessor with double-checked locking."""
    global _generator
    if _generator is None:
        with _generator_lock:
            if _generator is None:
                logger.info("Initializing ItineraryGenerator (first request)...")
                _generator = ItineraryGenerator()
                logger.info("ItineraryGenerator ready.")
    return _generator
