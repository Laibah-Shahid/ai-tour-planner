"""
Orchestration layer — adapted from orches_layer.py.
Chains multi-city chatbot output into per-segment itinerary generation.
Also handles converting raw engine output into frontend-friendly ItineraryData.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any

from app.services.itinerary_engine import get_generator
from app.services.supabase_data import (
    get_attractions_by_district,
    get_food_by_district,
    get_hotels_by_city,
    get_shops_by_district,
)

logger = logging.getLogger(__name__)


def generate_from_form(trip_request: dict) -> dict:
    """
    Generate itinerary from form data (TripRequest).
    Handles both single and multi-city trips.
    Returns frontend-compatible ItineraryData.
    """
    generator = get_generator()
    graph = generator.create_graph()

    destinations = trip_request.get("destinations", [])
    days = trip_request.get("days", 3)
    spots = trip_request.get("spots", [])
    include_food = trip_request.get("include_food", True)
    include_souvenirs = trip_request.get("include_souvenirs", True)
    budget = trip_request.get("budget", 0)
    start_date_str = trip_request.get("start_date", "")

    # For single destination
    if len(destinations) == 1:
        preferences = spots if spots else ["sightseeing", "culture"]
        state = {
            "user_query": f"Plan a {days}-day trip to {destinations[0]}",
            "parsed_location": destinations[0].strip().lower(),
            "parsed_days": days,
            "parsed_preferences": preferences,
            "query_parse_error": None,
            "include_food": include_food,
            "include_souvenirs": include_souvenirs,
            "retrieved_attractions": [],
            "retrieval_metadata": {},
            "place_coordinates": {},
            "draft_itinerary": None,
            "retry_count": 0,
            "clusters": {},
            "clustered_optional_places": {},
            "budget_needed": 0.0,
        }
        result = graph.invoke(state)
        raw_itinerary = json.loads(result.get("draft_itinerary", "{}"))
        return _transform_to_frontend(
            raw_itinerary, result, destinations[0], days, budget, start_date_str
        )

    # Multi-city: split days evenly or use available info
    days_per_city = max(1, days // len(destinations))
    remainder = days - (days_per_city * len(destinations))

    all_segments = []
    total_budget_needed = 0.0

    for i, dest in enumerate(destinations):
        city_days = days_per_city + (1 if i < remainder else 0)
        preferences = spots if spots else ["sightseeing", "culture"]

        state = {
            "user_query": f"Plan a {city_days}-day trip to {dest}",
            "parsed_location": dest.strip().lower(),
            "parsed_days": city_days,
            "parsed_preferences": preferences,
            "query_parse_error": None,
            "include_food": include_food,
            "include_souvenirs": include_souvenirs,
            "retrieved_attractions": [],
            "retrieval_metadata": {},
            "place_coordinates": {},
            "draft_itinerary": None,
            "retry_count": 0,
            "clusters": {},
            "clustered_optional_places": {},
            "budget_needed": 0.0,
        }
        result = graph.invoke(state)
        total_budget_needed += result.get("budget_needed", 0)
        raw = json.loads(result.get("draft_itinerary", "{}"))
        all_segments.append({"city": dest, "days": city_days, "raw": raw, "result": result})

    # Merge multi-city into single itinerary
    return _merge_multi_city(
        all_segments, destinations, days, budget, start_date_str, total_budget_needed
    )


def generate_from_chat(trip_json: dict) -> dict:
    """
    Generate itinerary from chat planner output (structured JSON).
    """
    generator = get_generator()
    graph = generator.create_graph()

    segments = trip_json.get("segments", [])
    global_food = trip_json.get("food", False)
    global_souvenirs = trip_json.get("souvenir_shopping", False)
    budget = trip_json.get("budget", {}).get("amount", 0) or 0
    start_date_str = trip_json.get("total_start_date", "")

    all_segments = []
    total_budget_needed = 0.0

    for segment in segments:
        city = segment.get("city", "")
        city_days = segment.get("number_of_days", 2)
        preferences = segment.get("preferences", ["sightseeing"])

        state = {
            "user_query": f"Plan a {city_days}-day trip to {city} with preferences: {', '.join(preferences)}",
            "parsed_location": city.strip().lower(),
            "parsed_days": city_days,
            "parsed_preferences": preferences,
            "query_parse_error": None,
            "include_food": global_food,
            "include_souvenirs": global_souvenirs,
            "retrieved_attractions": [],
            "retrieval_metadata": {},
            "place_coordinates": {},
            "draft_itinerary": None,
            "retry_count": 0,
            "clusters": {},
            "clustered_optional_places": {},
            "budget_needed": 0.0,
        }
        result = graph.invoke(state)
        total_budget_needed += result.get("budget_needed", 0)
        raw = json.loads(result.get("draft_itinerary", "{}"))
        all_segments.append({"city": city, "days": city_days, "raw": raw, "result": result})

    destinations = [s["city"] for s in segments]
    total_days = sum(s.get("number_of_days", 0) for s in segments)

    return _merge_multi_city(
        all_segments, destinations, total_days, budget, start_date_str, total_budget_needed
    )


# ---------------------------------------------------------------------------
# Transform helpers
# ---------------------------------------------------------------------------

def _transform_to_frontend(
    raw_itinerary: dict,
    engine_result: dict,
    destination: str,
    total_days: int,
    budget: int,
    start_date_str: str,
) -> dict:
    """Convert engine output to frontend ItineraryData format."""
    days_list = []
    clustered_optional = engine_result.get("clustered_optional_places", {})

    day_index = 0
    for day_key in sorted(raw_itinerary.keys()):
        day_data = raw_itinerary[day_key]
        day_index += 1

        # Build places list
        places = []
        for attr_name in day_data.get("attractions", []):
            attr_info = _find_attraction_info(attr_name, engine_result)
            places.append({
                "name": attr_name,
                "image": "",
                "description": attr_info.get("Desc", attr_info.get("desc", "")),
            })

        # Build hotels list
        hotels = _build_hotels_for_day(day_data, engine_result, day_index - 1)

        # Build souvenirs
        souvenirs = [
            {"name": s, "description": ""} for s in day_data.get("souvenir_shops", [])
        ]

        # Build food
        food = [{"name": f, "description": ""} for f in day_data.get("food", [])]

        days_list.append({
            "id": day_index,
            "title": f"Day {day_index} - {destination}",
            "tagline": _generate_tagline(day_data),
            "image": "",
            "durationHours": len(day_data.get("attractions", [])) * 2,
            "distanceKm": 0,
            "hotels": hotels,
            "places": places,
            "souvenirs": souvenirs,
            "food": food,
        })

    # Cost breakdown
    costs = _estimate_costs(engine_result, budget, total_days)

    # Tips
    tips = [
        {"id": 1, "text": "Carry cash as many places don't accept cards."},
        {"id": 2, "text": "Respect local customs and dress modestly."},
        {"id": 3, "text": "Keep a copy of your ID and travel documents."},
        {"id": 4, "text": "Check weather conditions before traveling to northern areas."},
    ]

    return {
        "destination": destination.title(),
        "totalDays": total_days,
        "bestSeason": "",
        "totalCost": budget or int(engine_result.get("budget_needed", 0) * total_days),
        "days": days_list,
        "costs": costs,
        "tips": tips,
    }


def _merge_multi_city(
    segments: list[dict],
    destinations: list[str],
    total_days: int,
    budget: int,
    start_date_str: str,
    total_budget_needed: float,
) -> dict:
    """Merge multiple city segments into a single ItineraryData."""
    days_list = []
    day_counter = 0

    for seg in segments:
        city = seg["city"]
        raw = seg["raw"]
        result = seg["result"]

        for day_key in sorted(raw.keys()):
            day_data = raw[day_key]
            day_counter += 1

            places = []
            for attr_name in day_data.get("attractions", []):
                attr_info = _find_attraction_info(attr_name, result)
                places.append({
                    "name": attr_name,
                    "image": "",
                    "description": attr_info.get("Desc", attr_info.get("desc", "")),
                })

            hotels = _build_hotels_for_day(day_data, result, day_counter - 1)
            souvenirs = [{"name": s, "description": ""} for s in day_data.get("souvenir_shops", [])]
            food = [{"name": f, "description": ""} for f in day_data.get("food", [])]

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

    dest_label = " & ".join([d.title() for d in destinations])
    costs = []
    if budget:
        costs = [
            {"label": "Accommodation", "amount": int(budget * 0.4)},
            {"label": "Transport", "amount": int(budget * 0.25)},
            {"label": "Food", "amount": int(budget * 0.2)},
            {"label": "Activities", "amount": int(budget * 0.15)},
        ]

    return {
        "destination": dest_label,
        "totalDays": total_days,
        "bestSeason": "",
        "totalCost": budget or int(total_budget_needed * total_days),
        "days": days_list,
        "costs": costs,
        "tips": [
            {"id": 1, "text": "Carry cash as many places don't accept cards."},
            {"id": 2, "text": "Respect local customs and dress modestly."},
            {"id": 3, "text": "Keep a copy of your ID and travel documents."},
            {"id": 4, "text": "Check weather conditions before traveling to northern areas."},
        ],
    }


def _find_attraction_info(name: str, engine_result: dict) -> dict:
    """Find attraction details from engine result."""
    for attr in engine_result.get("retrieved_attractions", []):
        if attr.get("_key") == name:
            return attr
    return {}


def _build_hotels_for_day(day_data: dict, engine_result: dict, cluster_idx: int) -> list[dict]:
    """Build frontend-compatible hotel objects."""
    clustered_optional = engine_result.get("clustered_optional_places", {})
    hotels = []

    lodging_names = day_data.get("lodging", [])
    # Find lodging details from clustered data
    all_lodging = []
    for cluster_data in clustered_optional.values():
        all_lodging.extend(cluster_data.get("lodging", []))

    for lname in lodging_names:
        lodge_info = next((l for l in all_lodging if l.get("_key") == lname), {})
        amenities = []
        if lodge_info.get("amenities_wifi"):
            amenities.append("wifi")
        if lodge_info.get("amenities_ac"):
            amenities.append("ac")
        if lodge_info.get("amenities_breakfast"):
            amenities.append("breakfast")
        if lodge_info.get("amenities_parking"):
            amenities.append("parking")

        reviews_list = []
        outer_reviews = lodge_info.get("reviews")
        if isinstance(outer_reviews, list):
            for r in outer_reviews[:3]:
                if isinstance(r, dict):
                    reviews_list.append({
                        "user": r.get("author_name", "Guest"),
                        "rating": r.get("rating", 4),
                        "comment": r.get("text", ""),
                    })

        hotels.append({
            "name": lname,
            "image": "",
            "rating": float(lodge_info.get("rating", 0)),
            "address": lodge_info.get("address", lodge_info.get("vicinity", "")),
            "pricePerNight": int(lodge_info.get("price", 0)),
            "images": [],
            "rooms": [],
            "reviews": reviews_list,
            "amenities": amenities,
        })

    return hotels


def _generate_tagline(day_data: dict) -> str:
    """Generate a short tagline for the day."""
    attractions = day_data.get("attractions", [])
    if not attractions:
        return "Explore the city"
    if len(attractions) == 1:
        return f"Visit {attractions[0]}"
    return f"Explore {attractions[0]} & {len(attractions)-1} more"


def _estimate_costs(engine_result: dict, budget: int, total_days: int) -> list[dict]:
    """Estimate cost breakdown."""
    budget_needed = engine_result.get("budget_needed", 0)
    if budget:
        return [
            {"label": "Accommodation", "amount": int(budget * 0.4)},
            {"label": "Transport", "amount": int(budget * 0.25)},
            {"label": "Food", "amount": int(budget * 0.2)},
            {"label": "Activities", "amount": int(budget * 0.15)},
        ]
    total = int(budget_needed * total_days) if budget_needed else 50000
    return [
        {"label": "Accommodation", "amount": int(total * 0.5)},
        {"label": "Transport", "amount": int(total * 0.25)},
        {"label": "Food", "amount": int(total * 0.15)},
        {"label": "Activities", "amount": int(total * 0.1)},
    ]
