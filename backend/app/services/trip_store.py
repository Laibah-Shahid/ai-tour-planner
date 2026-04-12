"""
Service for persisting and retrieving user trips/itineraries in Supabase.
Uses two tables: 'itineraries' for trip data, 'itinerary_shares' for share links.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime

from app.core.supabase_client import get_supabase_admin
from app.core.exceptions import NotFoundError, ForbiddenError

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CRUD operations for itineraries table
# ---------------------------------------------------------------------------

def save_itinerary(
    user_id: str,
    itinerary_data: dict,
    trip_request: dict,
    status: str = "generated",
) -> dict:
    """Save a generated itinerary to the database."""
    supabase = get_supabase_admin()
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "itinerary": json.dumps(itinerary_data),
        "trip_request": json.dumps(trip_request),
        "status": status,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    try:
        result = supabase.table("itineraries").insert(record).execute()
        if result.data:
            row = result.data[0]
            row["itinerary"] = json.loads(row["itinerary"])
            row["trip_request"] = json.loads(row["trip_request"])
            return row
        raise Exception("Insert returned no data")
    except Exception as e:
        logger.error("Failed to save itinerary: %s", e)
        raise


def get_itinerary(itinerary_id: str) -> dict:
    """Fetch a single itinerary by ID."""
    supabase = get_supabase_admin()
    try:
        result = (
            supabase.table("itineraries")
            .select("*")
            .eq("id", itinerary_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise NotFoundError(f"Itinerary '{itinerary_id}' not found")
        row = result.data[0]
        if isinstance(row.get("itinerary"), str):
            row["itinerary"] = json.loads(row["itinerary"])
        if isinstance(row.get("trip_request"), str):
            row["trip_request"] = json.loads(row["trip_request"])
        return row
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to get itinerary '%s': %s", itinerary_id, e)
        raise


def get_user_itineraries(user_id: str) -> list[dict]:
    """Fetch all itineraries for a user."""
    supabase = get_supabase_admin()
    try:
        result = (
            supabase.table("itineraries")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        rows = result.data or []
        for row in rows:
            if isinstance(row.get("itinerary"), str):
                row["itinerary"] = json.loads(row["itinerary"])
            if isinstance(row.get("trip_request"), str):
                row["trip_request"] = json.loads(row["trip_request"])
        return rows
    except Exception as e:
        logger.error("Failed to get itineraries for user '%s': %s", user_id, e)
        return []


def update_itinerary(
    itinerary_id: str,
    user_id: str,
    updates: dict,
) -> dict:
    """Update an existing itinerary. Only the owner can edit."""
    existing = get_itinerary(itinerary_id)
    if existing["user_id"] != user_id:
        raise ForbiddenError("You can only edit your own itineraries")

    supabase = get_supabase_admin()
    update_data = {"updated_at": datetime.utcnow().isoformat()}

    if "itinerary" in updates:
        update_data["itinerary"] = json.dumps(updates["itinerary"])
    if "status" in updates:
        update_data["status"] = updates["status"]

    try:
        result = (
            supabase.table("itineraries")
            .update(update_data)
            .eq("id", itinerary_id)
            .execute()
        )
        if result.data:
            row = result.data[0]
            if isinstance(row.get("itinerary"), str):
                row["itinerary"] = json.loads(row["itinerary"])
            if isinstance(row.get("trip_request"), str):
                row["trip_request"] = json.loads(row["trip_request"])
            return row
        raise Exception("Update returned no data")
    except (NotFoundError, ForbiddenError):
        raise
    except Exception as e:
        logger.error("Failed to update itinerary '%s': %s", itinerary_id, e)
        raise


def delete_itinerary(itinerary_id: str, user_id: str) -> bool:
    """Delete an itinerary. Only the owner can delete."""
    existing = get_itinerary(itinerary_id)
    if existing["user_id"] != user_id:
        raise ForbiddenError("You can only delete your own itineraries")

    supabase = get_supabase_admin()
    try:
        supabase.table("itineraries").delete().eq("id", itinerary_id).execute()
        # Also delete any shares
        supabase.table("itinerary_shares").delete().eq("itinerary_id", itinerary_id).execute()
        return True
    except Exception as e:
        logger.error("Failed to delete itinerary '%s': %s", itinerary_id, e)
        raise


# ---------------------------------------------------------------------------
# Share operations
# ---------------------------------------------------------------------------

def create_share(itinerary_id: str, user_id: str) -> dict:
    """Create a shareable link for an itinerary."""
    existing = get_itinerary(itinerary_id)
    if existing["user_id"] != user_id:
        raise ForbiddenError("You can only share your own itineraries")

    supabase = get_supabase_admin()

    # Check if share already exists
    try:
        existing_share = (
            supabase.table("itinerary_shares")
            .select("*")
            .eq("itinerary_id", itinerary_id)
            .limit(1)
            .execute()
        )
        if existing_share.data:
            return existing_share.data[0]
    except Exception:
        pass

    share_id = str(uuid.uuid4())[:8]
    record = {
        "id": str(uuid.uuid4()),
        "share_id": share_id,
        "itinerary_id": itinerary_id,
        "created_by": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        result = supabase.table("itinerary_shares").insert(record).execute()
        if result.data:
            # Also update itinerary status
            supabase.table("itineraries").update(
                {"status": "shared", "share_id": share_id, "updated_at": datetime.utcnow().isoformat()}
            ).eq("id", itinerary_id).execute()
            return result.data[0]
        raise Exception("Insert returned no data")
    except Exception as e:
        logger.error("Failed to create share for itinerary '%s': %s", itinerary_id, e)
        raise


def get_shared_itinerary(share_id: str) -> dict:
    """Fetch an itinerary by its share ID (public access, no auth required)."""
    supabase = get_supabase_admin()
    try:
        share_result = (
            supabase.table("itinerary_shares")
            .select("*")
            .eq("share_id", share_id)
            .limit(1)
            .execute()
        )
        if not share_result.data:
            raise NotFoundError(f"Shared itinerary '{share_id}' not found")

        itinerary_id = share_result.data[0]["itinerary_id"]
        return get_itinerary(itinerary_id)
    except NotFoundError:
        raise
    except Exception as e:
        logger.error("Failed to get shared itinerary '%s': %s", share_id, e)
        raise
