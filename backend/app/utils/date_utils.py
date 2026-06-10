"""
Date parsing utilities — handles both strict ISO format and natural language dates.
Ported from the reference repo's utils/helper.py.
"""

from __future__ import annotations

import re
from datetime import date, datetime, timedelta

_MONTH_MAP: dict[str, int] = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12,
}


def ensure_date(val) -> date:
    """Normalize a date/datetime/str value to a date object."""
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        val = val.strip()
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(val, fmt).date()
            except ValueError:
                continue
        parsed = parse_date_from_text(val)
        if parsed:
            return parsed
    raise TypeError(f"Cannot convert {val!r} to date")


def next_date(d) -> date | datetime:
    """Return the next calendar day, preserving the input type."""
    if isinstance(d, datetime):
        return d + timedelta(days=1)
    return d + timedelta(days=1)


def parse_date_from_text(text: str) -> date | None:
    """
    Extract a date from natural language text such as '24 Feb 2025' or 'February 24 2025'.
    Returns None if no date can be parsed.
    """
    text = text.strip().lower()
    # Try patterns: "24 feb 2025", "feb 24 2025", "24 february 2025"
    patterns = [
        r"(\d{1,2})\s+([a-z]+)\s+(\d{4})",   # 24 feb 2025
        r"([a-z]+)\s+(\d{1,2})\s*,?\s*(\d{4})",  # feb 24 2025
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if not m:
            continue
        groups = m.groups()
        try:
            if pattern.startswith(r"(\d"):
                day, month_str, year = int(groups[0]), groups[1], int(groups[2])
            else:
                month_str, day, year = groups[0], int(groups[1]), int(groups[2])
            month = _MONTH_MAP.get(month_str)
            if not month:
                continue
            return date(year, month, day)
        except (ValueError, TypeError):
            continue
    return None


def safe_parse_date(value: str) -> str:
    """
    Accept any date string (ISO or natural language) and return YYYY-MM-DD.
    Returns the original string unchanged if parsing fails, so callers can
    still attempt datetime.strptime and get a meaningful error.
    """
    if not value:
        return value
    try:
        d = ensure_date(value)
        return d.strftime("%Y-%m-%d")
    except (TypeError, ValueError):
        return value
