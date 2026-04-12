"""
Itinerary API routes — generate, CRUD, share, edit.
"""

from fastapi import APIRouter, Body, Depends
from app.middleware.auth import get_current_user, get_optional_user
from app.models.schemas import (
    TripRequest,
    ItineraryResponse,
    ItineraryUpdateRequest,
    ShareResponse,
    UserTripsResponse,
)
from app.services import trip_orchestrator, trip_store
from app.core.exceptions import BadRequestError, NotFoundError
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/itinerary", tags=["Itinerary"])


@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(
    request: TripRequest,
    user: dict = Depends(get_current_user),
):
    """Generate an itinerary from form data and save it."""
    try:
        trip_dict = request.model_dump()
        # Convert date objects to strings for JSON serialization
        trip_dict["start_date"] = str(trip_dict["start_date"])
        trip_dict["end_date"] = str(trip_dict["end_date"])
        trip_dict["transport_type"] = trip_dict["transport_type"].value

        itinerary_data = trip_orchestrator.generate_from_form(trip_dict)

        saved = trip_store.save_itinerary(
            user_id=user["id"],
            itinerary_data=itinerary_data,
            trip_request=trip_dict,
        )
        return saved
    except ValueError as e:
        logger.error("Itinerary generation value error: %s", e)
        raise BadRequestError(f"Could not generate itinerary: {str(e)}")
    except Exception as e:
        logger.error("Itinerary generation failed: %s\n%s", e, traceback.format_exc())
        raise BadRequestError(f"Itinerary generation failed: {str(e)}")


@router.post("/generate-from-chat", response_model=ItineraryResponse)
async def generate_from_chat(
    trip_json: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    """Generate itinerary from chat planner structured output."""
    try:
        itinerary_data = trip_orchestrator.generate_from_chat(trip_json)

        saved = trip_store.save_itinerary(
            user_id=user["id"],
            itinerary_data=itinerary_data,
            trip_request=trip_json,
        )
        return saved
    except ValueError as e:
        raise BadRequestError(f"Could not generate itinerary: {str(e)}")
    except Exception as e:
        logger.error("Chat itinerary generation failed: %s\n%s", e, traceback.format_exc())
        raise BadRequestError(f"Itinerary generation failed: {str(e)}")


@router.get("/my-trips", response_model=UserTripsResponse)
async def get_my_trips(user: dict = Depends(get_current_user)):
    """Get all itineraries for the authenticated user."""
    trips = trip_store.get_user_itineraries(user["id"])
    return {"trips": trips, "total": len(trips)}


@router.get("/{itinerary_id}", response_model=ItineraryResponse)
async def get_itinerary(
    itinerary_id: str,
    user: dict | None = Depends(get_optional_user),
):
    """Get a specific itinerary by ID."""
    return trip_store.get_itinerary(itinerary_id)


@router.put("/{itinerary_id}", response_model=ItineraryResponse)
async def update_itinerary(
    itinerary_id: str,
    request: ItineraryUpdateRequest,
    user: dict = Depends(get_current_user),
):
    """Update/edit an itinerary. Only the owner can edit."""
    updates = {}
    if request.itinerary is not None:
        updates["itinerary"] = request.itinerary.model_dump()
    if request.status is not None:
        updates["status"] = request.status.value

    if not updates:
        raise BadRequestError("No updates provided")

    return trip_store.update_itinerary(itinerary_id, user["id"], updates)


@router.delete("/{itinerary_id}")
async def delete_itinerary(
    itinerary_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete an itinerary. Only the owner can delete."""
    trip_store.delete_itinerary(itinerary_id, user["id"])
    return {"message": "Itinerary deleted successfully"}


@router.post("/{itinerary_id}/share", response_model=ShareResponse)
async def share_itinerary(
    itinerary_id: str,
    user: dict = Depends(get_current_user),
):
    """Create a shareable link for an itinerary."""
    share = trip_store.create_share(itinerary_id, user["id"])
    share_id = share["share_id"]
    return {
        "share_id": share_id,
        "share_url": f"/itinerary/shared/{share_id}",
    }


@router.get("/shared/{share_id}", response_model=ItineraryResponse)
async def get_shared_itinerary(share_id: str):
    """Get a shared itinerary by share ID (no auth required)."""
    return trip_store.get_shared_itinerary(share_id)
