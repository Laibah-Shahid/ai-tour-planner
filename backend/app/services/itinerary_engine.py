"""
Itinerary generation engine — adapted from Integrate.py with minimal changes.
Key change: reads data from Supabase instead of Excel files.
"""

from __future__ import annotations

import difflib
import hashlib
import json
import logging
import threading
import time
from datetime import datetime, timedelta
from math import atan2, cos, radians, sin, sqrt
from pathlib import Path
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

# Disk cache paths — all live under app/data/
_EMBED_CACHE_DIR = Path(__file__).parent.parent / "data"
_EMBED_CACHE_NPY  = _EMBED_CACHE_DIR / "embeddings_cache.npy"
_EMBED_CACHE_META = _EMBED_CACHE_DIR / "embeddings_cache.meta"

# DataFrame pkl caches — skip Supabase fetches on restart (24-hour TTL)
_DF_CACHE_TTL_HOURS = 24.0
_DF_CACHE_PKLS: dict[str, Path] = {
    "attractions": _EMBED_CACHE_DIR / "df_attractions.pkl",
    "food":        _EMBED_CACHE_DIR / "df_food.pkl",
    "souvenirs":   _EMBED_CACHE_DIR / "df_souvenirs.pkl",
    "lodging":     _EMBED_CACHE_DIR / "df_lodging.pkl",
}

# ---------------------------------------------------------------------------
# Retrieval & selection constants
# Retrieve FACTOR × what the itinerary needs so alternatives are always available.
# ---------------------------------------------------------------------------
ATTRACTIONS_PER_DAY       = 3   # shown in itinerary per day
ATTRACTIONS_EXTRA_FACTOR  = 3   # retrieve this many × per day (2× become alternatives)
FOOD_IN_ITINERARY         = 2   # food spots shown per day
FOOD_POOL_PER_CLUSTER     = 6   # fetched per cluster (4 become alternatives)
SOUVENIR_IN_ITINERARY     = 1   # souvenir shops shown per day
SOUVENIR_POOL_PER_CLUSTER = 4   # fetched per cluster (3 become alternatives)
HOTEL_IN_ITINERARY        = 2   # hotels shown per day
HOTEL_POOL_PER_CLUSTER    = 6   # fetched per cluster (4 become alternatives)


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


def _load_or_fetch_df(name: str, fetcher) -> "pd.DataFrame":
    """Load a DataFrame from disk pkl cache if fresh; otherwise fetch and cache it."""
    path = _DF_CACHE_PKLS.get(name)
    if path and path.exists():
        age_hours = (time.time() - path.stat().st_mtime) / 3600
        if age_hours < _DF_CACHE_TTL_HOURS:
            try:
                df = pd.read_pickle(path)
                logger.info("Loaded %s DataFrame from disk cache (%d rows).", name, len(df))
                return df
            except Exception as exc:
                logger.warning("Could not load df cache '%s': %s", name, exc)
    df = fetcher()
    if not df.empty and path:
        try:
            _EMBED_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            df.to_pickle(path)
            logger.info("Cached %s DataFrame to disk (%d rows).", name, len(df))
        except Exception as exc:
            logger.warning("Could not write df cache '%s': %s", name, exc)
    return df


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

    # Split if fewer clusters than days (city has few geographic groups)
    while len(clusters) < target_days:
        largest_id = max(clusters, key=lambda k: len(clusters[k]))
        largest_list = clusters[largest_id]
        if len(largest_list) < 2:
            break  # Can't split a single-attraction cluster
        mid = len(largest_list) // 2
        new_id = max(clusters.keys()) + 1
        clusters[new_id] = largest_list[mid:]
        clusters[largest_id] = largest_list[:mid]

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
    start_date: Optional[str]          # ISO YYYY-MM-DD for segment start
    include_food: bool
    include_souvenirs: bool
    retrieved_attractions: List[Dict[str, Any]]      # top-K used for clustering & itinerary
    all_city_attractions: List[Dict[str, Any]]       # ALL attractions for the city (for alternatives)
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
        self._graph = self._compile_graph()  # compile once, reuse forever

    def _load_data(self) -> None:
        self.df_attractions = _load_or_fetch_df("attractions", get_attractions_df)
        self.df_food        = _load_or_fetch_df("food",        get_food_df)
        self.df_souvenirs   = _load_or_fetch_df("souvenirs",   get_shops_df)
        self.df_lodging     = _load_or_fetch_df("lodging",     get_lodging_df)

        if not self.df_attractions.empty:
            self.df_attractions["search_text"] = self.df_attractions.apply(
                lambda r: f"{r.get('_key', '')} {r.get('category', '')} {r.get('Desc', '')} {r.get('district', '')}",
                axis=1,
            )
            self.embeddings = self._load_or_compute_embeddings(
                self.df_attractions["search_text"].tolist()
            )
        else:
            self.embeddings = np.array([])

    def _load_or_compute_embeddings(self, texts: list[str]) -> np.ndarray:
        """Return embeddings from disk cache when the corpus is unchanged; else recompute."""
        corpus_hash = hashlib.md5("\n".join(texts).encode()).hexdigest()

        if _EMBED_CACHE_NPY.exists() and _EMBED_CACHE_META.exists():
            if _EMBED_CACHE_META.read_text().strip() == corpus_hash:
                logger.info("Loaded attraction embeddings from disk cache (%d vectors).", len(texts))
                return np.load(_EMBED_CACHE_NPY)

        logger.info("Computing embeddings for %d attractions (will cache to disk)...", len(texts))
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        try:
            _EMBED_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            np.save(_EMBED_CACHE_NPY, embeddings)
            _EMBED_CACHE_META.write_text(corpus_hash)
            logger.info("Embeddings cached to %s", _EMBED_CACHE_NPY)
        except Exception as exc:
            logger.warning("Could not write embedding cache: %s", exc)
        return embeddings

    def reload_data(self) -> None:
        """Reload data from Supabase (call after data changes). Clears all disk caches."""
        from app.services.supabase_data import clear_cache
        clear_cache()
        for path in list(_DF_CACHE_PKLS.values()) + [_EMBED_CACHE_NPY, _EMBED_CACHE_META]:
            try:
                if path.exists():
                    path.unlink()
            except Exception:
                pass
        self._load_data()

    def _compile_graph(self):
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

    def create_graph(self):
        """Return the pre-compiled graph (no recompilation per request)."""
        return self._graph

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

        retrieve_limit = state.get("parsed_days", 3) * ATTRACTIONS_PER_DAY * ATTRACTIONS_EXTRA_FACTOR

        # Collect ALL city attractions ordered by similarity — don't stop at retrieve_limit.
        # The top retrieve_limit go into the itinerary pipeline; ALL of them form the pool
        # so the swap bar always has options even when the city has few attractions.
        all_city: List[Dict[str, Any]] = []
        for i in top_idx:
            row = self.df_attractions.iloc[i]
            if location_str and row["district"] != location_str:
                continue
            all_city.append({**row.to_dict(), "similarity_score": float(sims[i])})

        # Top-K go into clustering / itinerary generation
        pipeline_attractions = all_city[:retrieve_limit]

        logger.info(
            "Semantic search for '%s': total_city=%d, pipeline=%d (limit=%d)",
            location_str, len(all_city), len(pipeline_attractions), retrieve_limit,
        )

        return {
            **state,
            "retrieved_attractions": pipeline_attractions,
            "all_city_attractions": all_city,
            "retrieval_metadata": {
                "total_results": len(pipeline_attractions),
                "avg_score": float(np.mean([a["similarity_score"] for a in pipeline_attractions])) if pipeline_attractions else 0.0,
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
                nearest_from_pool(anchors, self.df_food, top_n=FOOD_POOL_PER_CLUSTER, max_radius_km=40.0)
                if state.get("include_food") else []
            )
            cluster_data["souvenirs"] = (
                nearest_from_pool(anchors, self.df_souvenirs, top_n=SOUVENIR_POOL_PER_CLUSTER, max_radius_km=40.0)
                if state.get("include_souvenirs") else []
            )
            lodging_candidates = nearest_from_pool(anchors, self.df_lodging, top_n=HOTEL_POOL_PER_CLUSTER, max_radius_km=60.0)
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

Your task:
Given numbered clusters, return ONLY a JSON array representing the order of clusters for the itinerary.

Example:
[0, 1, 2]

Rules:
- Use each cluster exactly once.
- Do not add extra numbers.
- Do not skip any cluster.
- Return raw JSON only."""

        user_prompt = (
            f"We have {len(cluster_ids)} clusters for a {state['parsed_days']}-day trip.\n"
            f"Cluster IDs: {cluster_ids}\n"
            f"Return the best visiting order."
        )

        try:
            response = self.llm.invoke([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ])
            cluster_order = json.loads(response.content)
        except Exception:
            cluster_order = cluster_ids

        # Similarity lookup so we pick the highest-scoring attractions per cluster
        sim_scores: Dict[str, float] = {
            str(a.get("_key", "")): a.get("similarity_score", 0.0)
            for a in state.get("retrieved_attractions", [])
        }

        # Resolve segment start date for per-day date assignment
        start_str = (state.get("start_date") or "").strip()
        try:
            start_dt: datetime | None = datetime.strptime(start_str, "%Y-%m-%d") if start_str else None
        except ValueError:
            start_dt = None

        final_output = {}
        for day_index, cluster_id in enumerate(cluster_order):
            all_cluster_attractions = clusters.get(cluster_id, [])
            optional = clustered_optional.get(cluster_id, {})
            food = optional.get("food", [])
            souvenirs = optional.get("souvenirs", [])
            lodging = optional.get("lodging", [])

            # Pick best attractions by similarity score; rest remain as alternatives
            sorted_attractions = sorted(
                all_cluster_attractions,
                key=lambda x: sim_scores.get(x, 0.0),
                reverse=True,
            )
            itinerary_attractions = sorted_attractions[:ATTRACTIONS_PER_DAY]

            day_date = (
                (start_dt + timedelta(days=day_index)).strftime("%Y-%m-%d")
                if start_dt else ""
            )

            final_output[f"day_{day_index + 1}"] = {
                "date": day_date,
                "attractions": itinerary_attractions,
                "food": [f.get("_key") for f in food[:FOOD_IN_ITINERARY] if f.get("_key")],
                "souvenir_shops": [s.get("_key") for s in souvenirs[:SOUVENIR_IN_ITINERARY] if s.get("_key")],
                "lodging": [l.get("_key") for l in lodging[:HOTEL_IN_ITINERARY] if l.get("_key")],
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
