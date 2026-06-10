"""
Profile API routes — user profile and trip history.
"""

from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.models.schemas import UserProfile
from app.services import trip_store
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/me", response_model=UserProfile)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile with trip count."""
    trips = trip_store.get_user_itineraries(user["id"])
    return UserProfile(
        id=user["id"],
        email=user["email"],
        full_name=user.get("full_name", ""),
        avatar_url=user.get("avatar_url", ""),
        trips_count=len(trips),
    )
