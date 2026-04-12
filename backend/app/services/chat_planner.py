"""
Chat-based travel planner — adapted from multi_city_val.py.
Manages per-session state for conversational trip planning.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)

MIN_BUDGET = 5000
MAX_BUDGET = 5000000
ALLOWED_TRANSPORT = ["car", "plane", "bus", "train"]


def _get_llm() -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        base_url=settings.LLM_BASE_URL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.OPENAI_API_KEY,
    )


# ===============================
# Data Classes (minimal changes from original)
# ===============================

@dataclass
class CitySegment:
    city: str
    number_of_days: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    transport_from_previous: Optional[str] = None
    preferences: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "city": self.city,
            "number_of_days": self.number_of_days,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "transport_from_previous": self.transport_from_previous,
            "preferences": self.preferences,
        }


@dataclass
class TravelState:
    starting_city: Optional[str] = None
    adults: Optional[int] = None
    kids: Optional[int] = None
    food: bool = False
    souvenir_shopping: bool = False
    budget: Dict[str, Optional[int]] = field(
        default_factory=lambda: {"amount": None, "currency": None}
    )
    total_start_date: Optional[str] = None
    total_end_date: Optional[str] = None
    segments: List[CitySegment] = field(default_factory=list)

    def to_dict(self):
        return {
            "starting_city": self.starting_city,
            "adults": self.adults,
            "kids": self.kids,
            "food": self.food,
            "souvenir_shopping": self.souvenir_shopping,
            "budget": self.budget,
            "total_start_date": self.total_start_date,
            "total_end_date": self.total_end_date,
            "segments": [s.to_dict() for s in self.segments],
        }


# ===============================
# Travel Planner (adapted from original)
# ===============================

class TravelPlanner:
    def __init__(self):
        self.state = TravelState()
        self.messages: list[dict] = []
        self.llm = _get_llm()

    def merge_state(self, new_data: dict):
        global_fields = [
            "starting_city", "adults", "kids", "food",
            "souvenir_shopping", "total_start_date", "total_end_date",
        ]
        for f in global_fields:
            if f in new_data and new_data[f] not in (None, ""):
                setattr(self.state, f, new_data[f])

        if "budget" in new_data:
            for k, v in new_data["budget"].items():
                if v not in (None, ""):
                    self.state.budget[k] = v

        if "segments" in new_data:
            for seg_data in new_data["segments"]:
                city_name = seg_data.get("city")
                if not city_name:
                    continue
                existing = next(
                    (s for s in self.state.segments if s.city.lower() == city_name.lower()),
                    None,
                )
                if not existing:
                    existing = CitySegment(city=city_name)
                    self.state.segments.append(existing)
                for f in ["number_of_days", "start_date", "end_date", "transport_from_previous", "preferences"]:
                    if f in seg_data and seg_data[f] not in (None, ""):
                        setattr(existing, f, seg_data[f])

    def auto_compute_segment_dates(self) -> List[str]:
        errors = []
        s = self.state
        if not s.total_start_date or not all(seg.number_of_days for seg in s.segments):
            return errors
        try:
            current_date = datetime.strptime(s.total_start_date, "%Y-%m-%d")
        except ValueError:
            return ["Trip start date format is invalid."]

        for seg in s.segments:
            seg.start_date = current_date.strftime("%Y-%m-%d")
            seg.end_date = (current_date + timedelta(days=seg.number_of_days - 1)).strftime("%Y-%m-%d")
            current_date += timedelta(days=seg.number_of_days)
        return errors

    def validate_global_fields(self) -> List[str]:
        errors = []
        s = self.state
        if not s.starting_city:
            errors.append("Starting city is required.")
        if s.adults is None:
            errors.append("Number of adults is required.")
        elif s.adults <= 0:
            errors.append("At least one adult is required.")
        if s.kids is None:
            errors.append("Number of kids is required.")
        elif s.kids < 0:
            errors.append("Number of kids cannot be negative.")
        if not s.budget.get("amount"):
            errors.append("Budget amount is required.")
        elif not (MIN_BUDGET <= s.budget["amount"] <= MAX_BUDGET):
            errors.append(f"Budget must be between {MIN_BUDGET} and {MAX_BUDGET} PKR.")
        if not s.total_start_date:
            errors.append("Trip start date is required.")
        if not s.total_end_date:
            errors.append("Trip end date is required.")
        return errors

    def validate_segments_structure(self) -> List[str]:
        errors = []
        if not self.state.segments:
            errors.append("At least one destination city is required.")
            return errors
        for idx, seg in enumerate(self.state.segments):
            if not seg.city:
                errors.append(f"Segment {idx+1}: City name missing.")
            if seg.number_of_days is not None and seg.number_of_days <= 0:
                errors.append(f"{seg.city}: Number of days must be positive.")
            if seg.transport_from_previous and seg.transport_from_previous.lower() not in ALLOWED_TRANSPORT:
                errors.append(f"{seg.city}: Transport must be one of {', '.join(ALLOWED_TRANSPORT)}.")
        return errors

    def validate_total_day_consistency(self) -> List[str]:
        errors = []
        s = self.state
        if not s.total_start_date or not s.total_end_date or not s.segments:
            return errors
        try:
            trip_start = datetime.strptime(s.total_start_date, "%Y-%m-%d")
            trip_end = datetime.strptime(s.total_end_date, "%Y-%m-%d")
        except ValueError:
            return ["Trip date format is invalid."]
        if trip_end < trip_start:
            return ["Trip end date cannot be before start date."]
        total_trip_days = (trip_end - trip_start).days + 1
        allocated = sum(seg.number_of_days for seg in s.segments if seg.number_of_days)
        if allocated:
            if allocated > total_trip_days:
                errors.append(f"Total allocated city days ({allocated}) exceed trip duration ({total_trip_days}).")
            elif total_trip_days - allocated > 1:
                errors.append(f"There are {total_trip_days - allocated} unplanned days in the trip.")
        return errors

    def validate_business_rules(self) -> List[str]:
        errors = []
        for seg in self.state.segments:
            if seg.number_of_days and seg.number_of_days > 365:
                errors.append(f"{seg.city}: Stay cannot exceed 365 days.")
        return errors

    def validate(self) -> List[str]:
        errors = []
        errors.extend(self.validate_global_fields())
        errors.extend(self.validate_segments_structure())
        errors.extend(self.auto_compute_segment_dates())
        errors.extend(self.validate_total_day_consistency())
        errors.extend(self.validate_business_rules())
        return errors

    def process_input(self, user_input: str) -> Tuple[str, bool, dict | None]:
        """Process user input and return (reply, is_complete, extracted_details)."""
        current_state_json = json.dumps(self.state.to_dict(), indent=2)

        system_prompt = """
You are a friendly AI travel planning assistant for trips within Pakistan.

You must:

1. When prompted for the first time:
- Welcome the user naturally.
- Ask about their travel plans in a friendly manner.

2. Multi-City Handling:
- If the user mentions multiple cities, treat the trip as multi-segment.
- Preserve the order in which cities are mentioned.
- Create one segment per city.

3. Global Fields: Store at top-level: starting_city, adults, kids, budget, total_start_date, total_end_date

4. Extraction Rules:
- If user says "solo", infer 1 adult and 0 kids.
- If user says "family", ask how many adults and kids.
- If user gives total trip dates but not per-city days, ask once for number of days per city.
- If user mentions food/cuisine/restaurants, set "food" to true.
- If user mentions shopping/souvenirs, set "souvenir_shopping" to true.

5. Transportation: Allowed types: car, plane, bus, train.

6. Preferences apply per city.

7. Date Rules: Store all dates in YYYY-MM-DD format.

8. Trip Completion: Mark trip_complete = true ONLY when all required fields are filled.

Current structured travel state:
__STATE_JSON__

Return ONLY valid JSON:
{
    "updated_travel_info": { ... },
    "assistant_message": "natural conversational reply",
    "trip_complete": false
}
Return JSON only. No explanations outside JSON.
"""
        system_prompt = system_prompt.replace("__STATE_JSON__", current_state_json)

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_input),
        ]

        try:
            response = self.llm.invoke(messages)
            raw = response.content.strip()
            if not raw:
                return "Temporary system issue. Please try again.", False, None

            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

            result = json.loads(raw)
        except json.JSONDecodeError:
            # One retry
            try:
                retry = self.llm.invoke(messages)
                raw = retry.content.strip()
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                result = json.loads(raw)
            except (json.JSONDecodeError, Exception):
                return "I'm having trouble formatting the response. Please try again.", False, None
        except Exception as e:
            logger.error("Chat planner error: %s", e)
            return "Something went wrong. Please try again.", False, None

        self.merge_state(result.get("updated_travel_info", {}))

        is_complete = result.get("trip_complete", False)
        errors = self.validate() if is_complete else []

        extracted = self.state.to_dict() if is_complete and not errors else None

        return result.get("assistant_message", ""), is_complete and not errors, extracted

    def get_state_dict(self) -> dict:
        return self.state.to_dict()

    def get_final_json(self) -> str:
        return json.dumps(self.state.to_dict(), indent=2)


# ---------------------------------------------------------------------------
# Session store — in-memory for now, keyed by session_id
# ---------------------------------------------------------------------------

_sessions: dict[str, TravelPlanner] = {}


def get_or_create_session(session_id: str) -> TravelPlanner:
    if session_id not in _sessions:
        _sessions[session_id] = TravelPlanner()
    return _sessions[session_id]


def delete_session(session_id: str):
    _sessions.pop(session_id, None)
