"""
Contribute router — place search, review submission, and new-place contribution.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Query

from app.core.supabase_client import get_supabase_admin
from app.models.schemas import (
    ContributionSubmit,
    ContributeResponse,
    PLACE_CATEGORIES,
    PlaceSearchResult,
    ReviewSubmit,
)
from app.services.supabase_data import get_attractions_df

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contribute", tags=["Contribute"])


# ---------------------------------------------------------------------------
# Search — check if place already exists
# ---------------------------------------------------------------------------

@router.get("/search", response_model=list[PlaceSearchResult])
async def search_places(q: str = Query(..., min_length=1)):
    """
    Fuzzy search for a place name across the Attractions, Food, and Shops tables.
    Returns up to 8 matches so the frontend can decide 'exists vs new'.
    """
    q_lower = q.strip().lower()
    supabase = get_supabase_admin()
    results: list[PlaceSearchResult] = []

    for table in ("Attractions", "Food", "Shops"):
        try:
            res = (
                supabase.table(table)
                .select("_key, category, district, Desc")
                .ilike("_key", f"%{q_lower}%")
                .limit(4)
                .execute()
            )
            for row in res.data or []:
                results.append(PlaceSearchResult(
                    key=row.get("_key", ""),
                    name=row.get("_key", ""),
                    category=row.get("category", ""),
                    district=row.get("district", ""),
                    description=row.get("Desc") or row.get("desc", ""),
                ))
        except Exception as exc:
            logger.warning("Search failed for table %s: %s", table, exc)

    # Deduplicate by key, keep first 8
    seen: set[str] = set()
    unique: list[PlaceSearchResult] = []
    for r in results:
        if r.key and r.key not in seen:
            seen.add(r.key)
            unique.append(r)
    return unique[:8]


@router.get("/categories")
async def get_categories():
    """Return allowed place categories for the contribution form."""
    return {"categories": PLACE_CATEGORIES}


# ---------------------------------------------------------------------------
# Review an existing place
# ---------------------------------------------------------------------------

@router.post("/review", response_model=ContributeResponse)
async def submit_review(body: ReviewSubmit):
    """Save a user review for an existing place."""
    supabase = get_supabase_admin()
    try:
        res = (
            supabase.table("user_reviews")
            .insert({
                "place_key": body.place_key,
                "rating": body.rating,
                "comment": body.comment,
            })
            .execute()
        )
        record = (res.data or [{}])[0]
        return ContributeResponse(
            id=str(record.get("id", "")),
            message="Thank you! Your review has been submitted.",
        )
    except Exception as exc:
        logger.error("Failed to save review: %s", exc)
        raise


# ---------------------------------------------------------------------------
# Submit a new place
# ---------------------------------------------------------------------------

@router.post("/place", response_model=ContributeResponse)
async def submit_place(body: ContributionSubmit):
    """Save a new place contribution (status=pending, reviewed by admin)."""
    supabase = get_supabase_admin()
    try:
        res = (
            supabase.table("user_contributions")
            .insert({
                "name": body.name,
                "category": body.category,
                "description": body.description,
                "city": body.city,
                "area": body.area,
                "latitude": body.latitude,
                "longitude": body.longitude,
                "status": "pending",
            })
            .execute()
        )
        record = (res.data or [{}])[0]
        return ContributeResponse(
            id=str(record.get("id", "")),
            message="Thank you! Your submission is under review and will be added soon.",
        )
    except Exception as exc:
        logger.error("Failed to save contribution: %s", exc)
        raise
