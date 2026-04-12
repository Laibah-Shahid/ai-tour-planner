"""
Explore/destinations API routes — browse destinations, attractions, hotels.
"""

from fastapi import APIRouter, Query
from app.services.supabase_data import (
    get_attractions_by_district,
    get_food_by_district,
    get_hotels_by_city,
    get_shops_by_district,
    get_cities,
)
from app.core.supabase_client import get_supabase_admin
from app.core.exceptions import NotFoundError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/explore", tags=["Explore"])


@router.get("/destinations")
async def list_destinations():
    """Get all available destination cities."""
    try:
        cities = get_cities()
        return {
            "destinations": [
                {
                    "id": str(c.get("#", c.get("Name", ""))).lower().replace(" ", "-"),
                    "name": c.get("Name", ""),
                    "country": c.get("Country", "Pakistan"),
                    "latitude": c.get("Latitude"),
                    "longitude": c.get("Longitude"),
                }
                for c in cities
            ],
            "total": len(cities),
        }
    except Exception as e:
        logger.error("Failed to list destinations: %s", e)
        return {"destinations": [], "total": 0}


@router.get("/destinations/{city_name}")
async def get_destination_detail(city_name: str):
    """
    Get detailed info about a destination including attractions, hotels, and food.
    """
    try:
        attractions = get_attractions_by_district(city_name)
        hotels = get_hotels_by_city(city_name)
        food = get_food_by_district(city_name)
        shops = get_shops_by_district(city_name)

        if not attractions and not hotels:
            raise NotFoundError(f"No data found for destination '{city_name}'")

        return {
            "id": city_name.lower().replace(" ", "-"),
            "name": city_name.title(),
            "attractions": [
                {
                    "id": a.get("_key", ""),
                    "name": a.get("_key", ""),
                    "description": a.get("Desc", a.get("desc", "")),
                    "category": a.get("category", ""),
                    "district": a.get("district", ""),
                    "latitude": a.get("latitude"),
                    "longitude": a.get("longitude"),
                    "image": "",
                    "reviews": a.get("reviews", ""),
                    "place_id": a.get("place_id", ""),
                }
                for a in attractions
            ],
            "hotels": [
                {
                    "id": h.get("hotel_id", h.get("place_id", "")),
                    "name": h.get("name", ""),
                    "rating": h.get("rating", 0),
                    "price": h.get("price", 0),
                    "address": h.get("address", h.get("vicinity", "")),
                    "amenities": _extract_amenities(h),
                    "image": "",
                }
                for h in hotels
            ],
            "food": [
                {
                    "id": f.get("_key", ""),
                    "name": f.get("_key", ""),
                    "description": f.get("Desc", f.get("desc", "")),
                    "category": f.get("category", ""),
                    "district": f.get("district", ""),
                }
                for f in food
            ],
            "shops": [
                {
                    "id": s.get("_key", ""),
                    "name": s.get("_key", ""),
                    "description": s.get("Desc", s.get("desc", "")),
                    "category": s.get("category", ""),
                }
                for s in shops
            ],
        }
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to get destination '%s': %s", city_name, e)
        raise NotFoundError(f"Error loading destination '{city_name}'")


@router.get("/attractions")
async def search_attractions(
    district: str = Query("", description="Filter by district"),
    category: str = Query("", description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
):
    """Search attractions with optional filters."""
    try:
        if district:
            results = get_attractions_by_district(district)
        else:
            from app.services.supabase_data import get_attractions_df
            df = get_attractions_df()
            results = df.to_dict("records") if not df.empty else []

        # Apply category filter
        if category:
            results = [
                r for r in results
                if category.lower() in (r.get("category", "") or "").lower()
            ]

        return {
            "attractions": results[:limit],
            "total": len(results),
        }
    except Exception as e:
        logger.error("Attractions search failed: %s", e)
        return {"attractions": [], "total": 0}


@router.get("/hotels")
async def search_hotels(
    city: str = Query(..., description="City to search hotels in"),
    max_price: int = Query(0, description="Max price per night (0 = no limit)"),
    min_rating: float = Query(0, description="Minimum rating"),
):
    """Search hotels with filters."""
    try:
        hotels = get_hotels_by_city(city)

        if max_price > 0:
            hotels = [h for h in hotels if (h.get("price", 0) or 0) <= max_price]
        if min_rating > 0:
            hotels = [h for h in hotels if (h.get("rating", 0) or 0) >= min_rating]

        return {
            "hotels": [
                {
                    "id": h.get("hotel_id", h.get("place_id", "")),
                    "name": h.get("name", ""),
                    "rating": h.get("rating", 0),
                    "price": h.get("price", 0),
                    "address": h.get("address", h.get("vicinity", "")),
                    "amenities": _extract_amenities(h),
                    "image": "",
                }
                for h in hotels
            ],
            "total": len(hotels),
        }
    except Exception as e:
        logger.error("Hotel search failed: %s", e)
        return {"hotels": [], "total": 0}


def _extract_amenities(hotel: dict) -> list[str]:
    """Extract amenity keys from hotel data."""
    amenities = []
    if hotel.get("amenities_wifi"):
        amenities.append("wifi")
    if hotel.get("amenities_ac"):
        amenities.append("ac")
    if hotel.get("amenities_breakfast"):
        amenities.append("breakfast")
    if hotel.get("amenities_parking"):
        amenities.append("parking")
    if hotel.get("amenities_scenic_view"):
        amenities.append("scenic_view")
    return amenities


# ---------------------------------------------------------------------------
# Detail-by-key endpoints — used by frontend to hydrate itinerary items
# ---------------------------------------------------------------------------

@router.get("/place/{key}")
async def get_place_by_key(key: str):
    """
    Fetch full details of an attraction, food place, or shop by its _key.
    Searches Attractions first, then Food, then Shops.
    """
    supabase = get_supabase_admin()
    try:
        # Try Attractions
        res = supabase.table("Attractions").select("*").eq("_key", key).limit(1).execute()
        if res.data:
            row = res.data[0]
            return {"table": "Attractions", **row}

        # Try Food
        res = supabase.table("Food").select("*").eq("_key", key).limit(1).execute()
        if res.data:
            row = res.data[0]
            return {"table": "Food", **row}

        # Try Shops
        res = supabase.table("Shops").select("*").eq("_key", key).limit(1).execute()
        if res.data:
            row = res.data[0]
            return {"table": "Shops", **row}

        # Try Tourist Attractions
        res = supabase.table("Tourist Attractions").select("*").eq("_key", key).limit(1).execute()
        if res.data:
            row = res.data[0]
            return {"table": "Tourist Attractions", **row}

        raise NotFoundError(f"No place found with key '{key}'")
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to fetch place '%s': %s", key, e)
        raise NotFoundError(f"Error looking up place '{key}'")


@router.get("/hotel/{hotel_id}")
async def get_hotel_by_id(hotel_id: str):
    """
    Fetch full hotel details by hotel_id.
    Joins inner features with outer features.
    """
    supabase = get_supabase_admin()
    try:
        inner = (
            supabase.table("Hotel inner features")
            .select("*")
            .eq("hotel_id", hotel_id)
            .limit(1)
            .execute()
        )
        if not inner.data:
            raise NotFoundError(f"No hotel found with id '{hotel_id}'")

        hotel = inner.data[0]
        place_id = hotel.get("place id") or hotel.get("place_id")

        # Enrich with outer features
        if place_id:
            try:
                outer = (
                    supabase.table("Hotel-outer-features")
                    .select("*")
                    .eq("place_id", place_id)
                    .limit(1)
                    .execute()
                )
                if outer.data:
                    hotel = {**hotel, **outer.data[0]}
            except Exception:
                pass

        hotel["amenities"] = _extract_amenities(hotel)
        return hotel
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to fetch hotel '%s': %s", hotel_id, e)
        raise NotFoundError(f"Error looking up hotel '{hotel_id}'")
