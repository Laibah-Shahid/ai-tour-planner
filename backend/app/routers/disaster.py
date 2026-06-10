"""
Disaster monitoring API routes.
"""

from fastapi import APIRouter, Depends
from app.middleware.auth import get_optional_user
from app.models.schemas import DisasterCheckRequest, DisasterCheckResponse
from app.services import disaster_service, trip_store
from app.core.exceptions import BadRequestError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/disaster", tags=["Disaster"])


@router.post("/check", response_model=DisasterCheckResponse)
async def check_disasters(
    request: DisasterCheckRequest,
    user: dict | None = Depends(get_optional_user),
):
    """
    Check for disaster alerts for given cities and dates.
    Can optionally reference an existing itinerary by ID.
    """
    cities = request.cities
    dates = request.dates

    # If itinerary_id provided, extract cities/dates from it
    if request.itinerary_id:
        try:
            itinerary = trip_store.get_itinerary(request.itinerary_id)
            itin_data = itinerary.get("itinerary", {})
            if isinstance(itin_data, str):
                import json
                itin_data = json.loads(itin_data)

            for day in itin_data.get("days", []):
                title = day.get("title", "")
                # Extract city from title like "Day 1 - Lahore"
                if " - " in title:
                    city = title.split(" - ", 1)[1].strip()
                    if city and city not in cities:
                        cities.append(city)
        except Exception as e:
            logger.warning("Could not extract cities from itinerary: %s", e)

    if not cities:
        raise BadRequestError("No cities provided for disaster check")

    try:
        alerts = disaster_service.check_itinerary_for_disasters(cities, dates)
        message = (
            f"Found {len(alerts)} potential risk(s) for your trip."
            if alerts
            else "No disaster risks detected for your planned destinations."
        )
        return DisasterCheckResponse(
            alerts=alerts,
            checked_cities=cities,
            message=message,
        )
    except Exception as e:
        logger.error("Disaster check failed: %s", e)
        return DisasterCheckResponse(
            alerts=[],
            checked_cities=cities,
            message="Disaster check temporarily unavailable. Please try again later.",
        )


@router.get("/alerts")
async def get_general_alerts(cities: str = ""):
    """
    Get general disaster alerts for given cities (comma-separated).
    No date matching — returns all recent disaster events.
    """
    if not cities:
        raise BadRequestError("Provide cities as a comma-separated query parameter")

    city_list = [c.strip() for c in cities.split(",") if c.strip()]

    try:
        events = disaster_service.check_general_alerts(city_list)
        return {
            "events": events,
            "checked_cities": city_list,
            "total": len(events),
        }
    except Exception as e:
        logger.error("General alerts failed: %s", e)
        return {"events": [], "checked_cities": city_list, "total": 0}
