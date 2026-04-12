"""
Service for fetching data from Supabase tables.
Replaces the Excel-based data loading from the original scripts.
"""

import logging
from typing import Any

import pandas as pd
from app.core.supabase_client import get_supabase_admin

logger = logging.getLogger(__name__)

# Cache DataFrames in memory after first load
_cache: dict[str, pd.DataFrame] = {}


def _fetch_table(table_name: str, columns: str = "*") -> list[dict[str, Any]]:
    """Fetch all rows from a Supabase table."""
    try:
        supabase = get_supabase_admin()
        response = supabase.table(table_name).select(columns).execute()
        return response.data or []
    except Exception as e:
        logger.error("Failed to fetch table '%s': %s", table_name, e)
        return []


def _normalize_location(df: pd.DataFrame, col: str) -> pd.DataFrame:
    """Normalize location column to lowercase stripped strings."""
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip().str.lower()
    return df


def get_attractions_df() -> pd.DataFrame:
    """Fetch attractions from Supabase 'Attractions' table as a DataFrame."""
    if "attractions" in _cache:
        return _cache["attractions"]

    rows = _fetch_table("Attractions")
    if not rows:
        logger.warning("No attractions found in Supabase, returning empty DataFrame")
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    # Rename to match original script expectations
    if "Desc" not in df.columns and "desc" in df.columns:
        df = df.rename(columns={"desc": "Desc"})

    df = _normalize_location(df, "district")
    _cache["attractions"] = df
    return df


def get_food_df() -> pd.DataFrame:
    """Fetch food places from Supabase 'Food' table."""
    if "food" in _cache:
        return _cache["food"]

    rows = _fetch_table("Food")
    df = pd.DataFrame(rows) if rows else pd.DataFrame()
    df = _normalize_location(df, "district")
    _cache["food"] = df
    return df


def get_shops_df() -> pd.DataFrame:
    """Fetch souvenir shops from Supabase 'Shops' table."""
    if "shops" in _cache:
        return _cache["shops"]

    rows = _fetch_table("Shops")
    df = pd.DataFrame(rows) if rows else pd.DataFrame()
    df = _normalize_location(df, "district")
    _cache["shops"] = df
    return df


def get_lodging_df() -> pd.DataFrame:
    """Fetch hotels from Supabase 'Hotel inner features' table,
    joined with outer features for complete hotel data."""
    if "lodging" in _cache:
        return _cache["lodging"]

    inner_rows = _fetch_table("Hotel inner features")
    outer_rows = _fetch_table("Hotel-outer-features")

    if not inner_rows:
        logger.warning("No hotel inner features found")
        return pd.DataFrame()

    df_inner = pd.DataFrame(inner_rows)
    df_outer = pd.DataFrame(outer_rows) if outer_rows else pd.DataFrame()

    # Join inner and outer on place_id
    if not df_outer.empty and "place id" in df_inner.columns:
        df_inner = df_inner.rename(columns={"place id": "place_id_ref"})
        df = df_inner.merge(
            df_outer[["place_id", "address", "vicinity", "website", "google_url",
                       "reviews", "formatted_phone_number", "opening_hours"]],
            left_on="place_id_ref",
            right_on="place_id",
            how="left",
            suffixes=("", "_outer"),
        )
    else:
        df = df_inner

    # Rename columns to match original script expectations
    rename_map = {}
    if "name" in df.columns:
        rename_map["name"] = "_key"
    if "city" in df.columns:
        rename_map["city"] = "district"
    if "lat" in df.columns:
        rename_map["lat"] = "latitude"
    if "lon" in df.columns:
        rename_map["lon"] = "longitude"

    if rename_map:
        df = df.rename(columns=rename_map)

    df = _normalize_location(df, "district")
    _cache["lodging"] = df
    return df


def get_cities() -> list[dict]:
    """Fetch all cities."""
    return _fetch_table("Cities")


def get_tourist_attractions() -> list[dict]:
    """Fetch from Tourist Attractions table (may overlap with Attractions)."""
    return _fetch_table("Tourist Attractions")


def get_attractions_by_district(district: str) -> list[dict]:
    """Fetch attractions filtered by district."""
    try:
        supabase = get_supabase_admin()
        response = (
            supabase.table("Attractions")
            .select("*")
            .ilike("district", f"%{district}%")
            .execute()
        )
        return response.data or []
    except Exception as e:
        logger.error("Failed to fetch attractions for district '%s': %s", district, e)
        return []


def get_hotels_by_city(city: str) -> list[dict]:
    """Fetch hotels filtered by city with full details."""
    try:
        supabase = get_supabase_admin()
        inner = (
            supabase.table("Hotel inner features")
            .select("*")
            .ilike("city", f"%{city}%")
            .execute()
        )
        inner_data = inner.data or []

        # Enrich with outer features
        enriched = []
        for hotel in inner_data:
            place_id = hotel.get("place id") or hotel.get("place_id")
            outer_data = {}
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
                        outer_data = outer.data[0]
                except Exception:
                    pass

            enriched.append({**hotel, **outer_data})
        return enriched
    except Exception as e:
        logger.error("Failed to fetch hotels for city '%s': %s", city, e)
        return []


def get_food_by_district(district: str) -> list[dict]:
    """Fetch food places by district."""
    try:
        supabase = get_supabase_admin()
        response = (
            supabase.table("Food")
            .select("*")
            .ilike("district", f"%{district}%")
            .execute()
        )
        return response.data or []
    except Exception as e:
        logger.error("Failed to fetch food for district '%s': %s", district, e)
        return []


def get_shops_by_district(district: str) -> list[dict]:
    """Fetch shops by district."""
    try:
        supabase = get_supabase_admin()
        response = (
            supabase.table("Shops")
            .select("*")
            .ilike("district", f"%{district}%")
            .execute()
        )
        return response.data or []
    except Exception as e:
        logger.error("Failed to fetch shops for district '%s': %s", district, e)
        return []


def clear_cache():
    """Clear all cached DataFrames. Call when data needs refreshing."""
    _cache.clear()
