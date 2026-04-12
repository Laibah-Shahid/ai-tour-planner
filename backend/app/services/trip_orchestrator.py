"""
Orchestration layer — adapted from orches_layer.py.
Chains multi-city chatbot output into per-segment itinerary generation.
Converts raw engine output into a lean frontend-friendly ItineraryData.

Design: Each place/hotel/food/souvenir returns only {name, key}.
The `key` is the Supabase primary key (originally `_key` column),
so the frontend fetches full details on demand via /api/explore
endpoints. This keeps LLM token usage and JSON payload minimal.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.services.itinerary_engine import get_generator

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_from_form(trip_request: dict) -> dict:
    """Generate itinerary from form data (TripRequest)."""
    generator = get_generator()
    graph = generator.create_graph()

    destinations = trip_request.get("destinations", [])
    days = trip_request.get("days", 3)
    spots = trip_request.get("spots", [])
    include_food = trip_request.get("include_food", True)
    include_souvenirs = trip_request.get("include_souvenirs", True)
    budget = trip_request.get("budget", 0)

    if len(destinations) == 1:
        result = _run_segment(
            graph, destinations[0], days,
            spots or ["sightseeing", "culture"],
            include_food, include_souvenirs,
        )
        raw = json.loads(result.get("draft_itinerary", "{}"))
        return _build_itinerary_data(
            segments=[{"city": destinations[0], "raw": raw, "result": result}],
            destinations=destinations,
            total_days=days,
            budget=budget,
        )

    # Multi-city
    days_per_city = max(1, days // len(destinations))
    remainder = days - (days_per_city * len(destinations))
    all_segments = []

    for i, dest in enumerate(destinations):
        city_days = days_per_city + (1 if i < remainder else 0)
        result = _run_segment(
            graph, dest, city_days,
            spots or ["sightseeing", "culture"],
            include_food, include_souvenirs,
        )
        raw = json.loads(result.get("draft_itinerary", "{}"))
        all_segments.append({"city": dest, "raw": raw, "result": result})

    return _build_itinerary_data(all_segments, destinations, days, budget)


def generate_from_chat(trip_json: dict) -> dict:
    """Generate itinerary from chat planner output."""
    generator = get_generator()
    graph = generator.create_graph()

    segments = trip_json.get("segments", [])
    global_food = trip_json.get("food", False)
    global_souvenirs = trip_json.get("souvenir_shopping", False)
    budget = trip_json.get("budget", {}).get("amount", 0) or 0

    all_segments = []
    for seg in segments:
        city = seg.get("city", "")
        city_days = seg.get("number_of_days", 2)
        prefs = seg.get("preferences", ["sightseeing"])
        result = _run_segment(graph, city, city_days, prefs, global_food, global_souvenirs)
        raw = json.loads(result.get("draft_itinerary", "{}"))
        all_segments.append({"city": city, "raw": raw, "result": result})

    destinations = [s.get("city", "") for s in segments]
    total_days = sum(s.get("number_of_days", 0) for s in segments)
    return _build_itinerary_data(all_segments, destinations, total_days, budget)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _run_segment(graph, city: str, days: int, prefs: list, food: bool, souvenirs: bool) -> dict:
    """Run the itinerary engine for a single city segment."""
    state = {
        "user_query": f"Plan a {days}-day trip to {city}",
        "parsed_location": city.strip().lower(),
        "parsed_days": days,
        "parsed_preferences": prefs,
        "query_parse_error": None,
        "include_food": food,
        "include_souvenirs": souvenirs,
        "retrieved_attractions": [],
        "retrieval_metadata": {},
        "place_coordinates": {},
        "draft_itinerary": None,
        "retry_count": 0,
        "clusters": {},
        "clustered_optional_places": {},
        "budget_needed": 0.0,
    }
    return graph.invoke(state)


def _build_itinerary_data(
    segments: list[dict],
    destinations: list[str],
    total_days: int,
    budget: int,
) -> dict:
    """
    Build the final ItineraryData JSON from engine segments.
    Every place/hotel/food/souvenir is returned as {name, _key}
    so the frontend can fetch full details from Supabase by _key.
    """
    days_list = []
    day_counter = 0
    total_budget_needed = 0.0

    for seg in segments:
        city = seg["city"]
        raw = seg["raw"]
        result = seg["result"]
        total_budget_needed += result.get("budget_needed", 0)

        # Gather all optional-place dicts for _key lookups
        all_lodging = _collect_optional(result, "lodging")
        all_food = _collect_optional(result, "food")
        all_souvenirs = _collect_optional(result, "souvenirs")

        for day_key in sorted(raw.keys()):
            day_data = raw[day_key]
            day_counter += 1

            # Places: name + key (the Attractions PK)
            places = []
            for attr_name in day_data.get("attractions", []):
                places.append({"name": attr_name, "key": attr_name})

            # Hotels: name + key + hotel_id + price + rating
            hotels = []
            for lname in day_data.get("lodging", []):
                info = _find_in_pool(lname, all_lodging)
                hotels.append({
                    "name": lname,
                    "key": lname,
                    "hotel_id": info.get("hotel_id", ""),
                    "place_id": info.get("place_id", info.get("place_id_ref", "")),
                    "pricePerNight": int(info.get("price", 0)),
                    "rating": float(info.get("rating", 0)),
                })

            # Food: name + key
            food = [
                {"name": f, "key": f}
                for f in day_data.get("food", [])
            ]

            # Souvenirs: name + key
            souvenirs = [
                {"name": s, "key": s}
                for s in day_data.get("souvenir_shops", [])
            ]

            days_list.append({
                "id": day_counter,
                "title": f"Day {day_counter} - {city.title()}",
                "tagline": _generate_tagline(day_data),
                "image": "",
                "durationHours": len(day_data.get("attractions", [])) * 2,
                "distanceKm": 0,
                "hotels": hotels,
                "places": places,
                "souvenirs": souvenirs,
                "food": food,
            })

    dest_label = " & ".join(d.title() for d in destinations)
    effective_budget = budget or int(total_budget_needed * total_days) or 50000
    costs = [
        {"label": "Accommodation", "amount": int(effective_budget * 0.4)},
        {"label": "Transport", "amount": int(effective_budget * 0.25)},
        {"label": "Food", "amount": int(effective_budget * 0.2)},
        {"label": "Activities", "amount": int(effective_budget * 0.15)},
    ]

    return {
        "destination": dest_label,
        "totalDays": total_days,
        "bestSeason": "",
        "totalCost": effective_budget,
        "days": days_list,
        "costs": costs,
        "tips": [
            {"id": 1, "text": "Carry cash as many places don't accept cards."},
            {"id": 2, "text": "Respect local customs and dress modestly."},
            {"id": 3, "text": "Keep a copy of your ID and travel documents."},
            {"id": 4, "text": "Check weather conditions before traveling to northern areas."},
        ],
    }


def _collect_optional(result: dict, category: str) -> list[dict]:
    """Flatten all items of a given category from clustered optional places."""
    items: list[dict] = []
    for cluster_data in result.get("clustered_optional_places", {}).values():
        items.extend(cluster_data.get(category, []))
    return items


def _find_in_pool(name: str, pool: list[dict]) -> dict:
    """Find an item by _key in a flat pool."""
    return next((p for p in pool if p.get("_key") == name), {})


def _generate_tagline(day_data: dict) -> str:
    attractions = day_data.get("attractions", [])
    if not attractions:
        return "Explore the city"
    if len(attractions) == 1:
        return f"Visit {attractions[0]}"
    return f"Explore {attractions[0]} & {len(attractions) - 1} more"
