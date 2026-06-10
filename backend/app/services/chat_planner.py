"""
Chat-based travel planner.
Manages per-session state for conversational trip planning.

Guard rails applied (from validation_layer.py):
- segment_index-based identity (fixes duplicate city bug)
- Budget range 100K–2M PKR
- Days per segment: 1–365
- Transport: car / plane / bus / train
- Date consistency: end >= start, allocated <= trip duration, ≤1 unplanned day
- Conversation history capped at 8 turns to prevent context bloat
- trip_complete only set when is_ready_to_finalize() passes all validators
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import get_settings
from app.utils.date_utils import safe_parse_date

logger = logging.getLogger(__name__)

MIN_BUDGET = 100000
MAX_BUDGET = 2000000
ALLOWED_TRANSPORT = ["car", "plane", "bus", "train"]
MAX_HISTORY_TURNS = 8


def _get_llm() -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        base_url=settings.LLM_BASE_URL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.OPENAI_API_KEY,
    )


# ===============================
# Data Classes
# ===============================

@dataclass
class CitySegment:
    city: str
    segment_index: int = 0          # 0-based — the canonical identity key (not city name)
    number_of_days: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    transport_from_previous: Optional[str] = None
    preferences: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "segment_index": self.segment_index,
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
# Travel Planner
# ===============================

class TravelPlanner:
    def __init__(self):
        self.state = TravelState()
        self.messages: list[dict] = []
        self.llm = _get_llm()

    def merge_state(self, new_data: dict):
        date_fields = {"total_start_date", "total_end_date"}
        global_fields = [
            "starting_city", "adults", "kids", "food",
            "souvenir_shopping", "total_start_date", "total_end_date",
        ]
        for f in global_fields:
            if f in new_data and new_data[f] not in (None, ""):
                val = safe_parse_date(new_data[f]) if f in date_fields else new_data[f]
                setattr(self.state, f, val)

        if "budget" in new_data:
            for k, v in new_data["budget"].items():
                if v not in (None, ""):
                    self.state.budget[k] = v

        # ---------------------------------------------------------------
        # Segments — reconcile by segment_index, NOT by city name.
        # This allows the same city to appear multiple times as separate
        # segments (e.g. Lahore → Islamabad → Lahore = indices 0, 1, 2).
        # ---------------------------------------------------------------
        if "segments" in new_data:
            new_segs = new_data["segments"]

            # If LLM forgot segment_index, assign by position
            for pos, sd in enumerate(new_segs):
                if sd.get("segment_index") is None:
                    sd["segment_index"] = pos

            incoming_indices = {int(sd["segment_index"]) for sd in new_segs}

            # Drop segments intentionally removed by the LLM
            self.state.segments = [
                seg for seg in self.state.segments
                if seg.segment_index in incoming_indices
            ]

            existing_by_index: Dict[int, CitySegment] = {
                seg.segment_index: seg for seg in self.state.segments
            }

            rebuilt: List[CitySegment] = []
            seg_date_fields = {"start_date", "end_date"}
            for sd in new_segs:
                idx = int(sd["segment_index"])
                city_name = (sd.get("city") or "").strip()
                if not city_name:
                    continue

                seg = existing_by_index.get(idx)
                if seg is None:
                    seg = CitySegment(city=city_name, segment_index=idx)
                else:
                    seg.city = city_name  # allow in-place city rename

                for f in ["number_of_days", "start_date", "end_date",
                          "transport_from_previous", "preferences"]:
                    val = sd.get(f)
                    if val not in (None, ""):
                        val = safe_parse_date(val) if f in seg_date_fields else val
                        setattr(seg, f, val)

                rebuilt.append(seg)

            self.state.segments = sorted(rebuilt, key=lambda s: s.segment_index)

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

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

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
            errors.append(
                f"Budget must be between {MIN_BUDGET:,} and {MAX_BUDGET:,} PKR."
            )
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
            label = f"Stop {idx + 1} ({seg.city})" if seg.city else f"Stop {idx + 1}"
            if not seg.city:
                errors.append(f"Stop {idx + 1}: City name is missing.")
            if seg.number_of_days is not None and seg.number_of_days <= 0:
                errors.append(f"{label}: Number of days must be positive.")
            if seg.number_of_days is not None and seg.number_of_days > 365:
                errors.append(f"{label}: Stay cannot exceed 365 days.")
            if seg.transport_from_previous:
                if seg.transport_from_previous.lower() not in ALLOWED_TRANSPORT:
                    errors.append(
                        f"{label}: Transport must be one of {', '.join(ALLOWED_TRANSPORT)}."
                    )
            if not seg.preferences:
                errors.append(
                    f"{label}: Preferences are required — please say what you'd like to do there."
                )
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
                errors.append(
                    f"Total allocated days ({allocated}) exceed trip duration ({total_trip_days} days)."
                )
            elif total_trip_days - allocated > 1:
                errors.append(
                    f"There are {total_trip_days - allocated} unplanned days. Please allocate them to a city."
                )
        return errors

    def validate(self) -> List[str]:
        errors = []
        errors.extend(self.validate_global_fields())
        errors.extend(self.validate_segments_structure())
        errors.extend(self.auto_compute_segment_dates())
        errors.extend(self.validate_total_day_consistency())
        return errors

    def is_ready_to_finalize(self) -> bool:
        """True only when all validators pass and every segment has preferences."""
        if self.validate():
            return False
        for seg in self.state.segments:
            if not seg.preferences:
                return False
        return True

    # ------------------------------------------------------------------
    # LLM interaction
    # ------------------------------------------------------------------

    def _build_messages(self, system_prompt: str, user_input: str):
        msgs = [SystemMessage(content=system_prompt)]
        # Cap history to avoid context bloat
        for turn in self.messages[-MAX_HISTORY_TURNS * 2:]:
            if turn["role"] == "user":
                msgs.append(HumanMessage(content=turn["content"]))
            else:
                msgs.append(AIMessage(content=turn["content"]))
        msgs.append(HumanMessage(content=user_input))
        return msgs

    def process_input(self, user_input: str) -> Tuple[str, bool, dict | None]:
        """Process user input and return (reply, is_complete, extracted_details)."""
        current_state_json = json.dumps(self.state.to_dict(), indent=2)
        current_errors = self.validate()
        validation_context = (
            "\n".join(f"- {e}" for e in current_errors)
            if current_errors else "None"
        )

        system_prompt = f"""
You are a friendly AI travel planning assistant for inter-city trips within Pakistan ONLY.

=== CURRENT TRAVEL STATE ===
{current_state_json}

=== CURRENT VALIDATION ISSUES (detected by the system) ===
{validation_context}

=== YOUR RESPONSIBILITIES ===

1. FIRST MESSAGE: Welcome the user and ask about their travel plans.
   You handle inter-city travel only — not activities within a single city.

2. DUPLICATE CITY NAMES — CRITICAL RULE:
   A user can visit the same city more than once (e.g. Lahore → Islamabad → Lahore).
   Each visit is a SEPARATE segment with its own unique segment_index.
   NEVER merge two visits to the same city into one segment.
   Example route: Karachi → Lahore → Islamabad → Lahore
     segment_index 0: Lahore    (first visit)
     segment_index 1: Islamabad
     segment_index 2: Lahore    (second visit — different index, same city name)
   The segment_index is the ONLY unique identity. City name alone is NOT unique.

3. SEGMENT HANDLING:
   - Preserve the order cities are mentioned.
   - When removing a city, drop it and tell the user how many days are unallocated.
   - If a user gives a vague region (e.g. "Balochistan"), ask for the specific city.
     Replace the vague entry at its existing segment_index — do NOT add a new one.
   - Return the FULL segments list every single time (even unchanged ones).
   - Indices must stay stable after additions/removals.
   - After a removal, compact indices so they start from 0 with no gaps.

4. GLOBAL FIELDS: starting_city, adults, kids, budget, total_start_date, total_end_date
   - "solo" → 1 adult, 0 kids
   - "family" → ask how many adults and kids
   - food/dining/restaurant → food: true
   - shopping/souvenirs → souvenir_shopping: true
   - Budget must be between 100,000 and 2,000,000 PKR. If outside range, explain and ask to revise.

5. PREFERENCES (MANDATORY):
   Every segment must have a non-empty preferences list before trip_complete = true.
   General preferences (e.g. "adventurous trip") → apply to ALL segments.
   Geographically inappropriate preferences → flag politely and suggest alternatives.

6. TRANSPORT: car, plane, bus, train
   Suggest car/bus if plane is chosen for a city without an airport.
   transport_from_previous applies to every segment except the first.

7. DATE RULES:
   Store dates as YYYY-MM-DD. Convert any format the user gives (e.g. "24 Feb 2025").
   Do NOT compute or invent segment-level start/end dates — the system does this.
   Flag ambiguous dates conversationally.

8. CONVERSATION QUALITY:
   - Never re-ask for information already in the current state.
   - Group all missing questions in one message (max 2-3 questions at a time).
   - Address CURRENT VALIDATION ISSUES conversationally — not as raw error strings.

9. GEOGRAPHIC GUARDRAIL:
   Only accept destinations inside Pakistan. If the user requests somewhere outside
   Pakistan, politely explain this service covers Pakistan only.

10. TRIP COMPLETION:
    trip_complete = true ONLY when ALL of the following are present:
    - starting_city, adults (≥1), kids (≥0), budget amount
    - total_start_date and total_end_date
    - at least one segment with city, number_of_days, and non-empty preferences
    - every segment (except the first) has transport_from_previous

11. OUTPUT FORMAT — return ONLY valid JSON, nothing else:
{{
    "updated_travel_info": {{
        "starting_city": null,
        "adults": null,
        "kids": null,
        "food": null,
        "souvenir_shopping": null,
        "budget": {{"amount": null, "currency": null}},
        "total_start_date": null,
        "total_end_date": null,
        "segments": [
            {{
                "segment_index": 0,
                "city": null,
                "number_of_days": null,
                "start_date": null,
                "end_date": null,
                "transport_from_previous": null,
                "preferences": []
            }}
        ]
    }},
    "assistant_message": "natural conversational reply",
    "trip_complete": false
}}

RULES:
- segment_index is MANDATORY on every segment object. Never omit it.
- Return the complete segments list every time.
- No markdown, no text outside the JSON object.
"""

        messages = self._build_messages(system_prompt, user_input)

        try:
            response = self.llm.invoke(messages)
            raw = response.content.strip()
            if not raw:
                return "Temporary system issue. Please try again.", False, None

            # Strip markdown fences if the model wraps the response
            if raw.startswith("```"):
                parts = raw.split("```")
                raw = parts[1] if len(parts) > 1 else parts[0]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            result = json.loads(raw)
        except json.JSONDecodeError:
            # One retry
            try:
                retry = self.llm.invoke(messages)
                raw = retry.content.strip()
                if raw.startswith("```"):
                    parts = raw.split("```")
                    raw = parts[1] if len(parts) > 1 else parts[0]
                    if raw.startswith("json"):
                        raw = raw[4:]
                    raw = raw.strip()
                result = json.loads(raw)
            except (json.JSONDecodeError, Exception):
                return "I'm having trouble formatting the response. Please try again.", False, None
        except Exception as e:
            logger.error("Chat planner error: %s", e)
            return "Something went wrong. Please try again.", False, None

        self.merge_state(result.get("updated_travel_info", {}))
        self.messages.append({"role": "user", "content": user_input})
        self.messages.append({"role": "assistant", "content": result.get("assistant_message", "")})

        # Use is_ready_to_finalize() — do NOT blindly trust the LLM's trip_complete flag
        llm_says_complete = result.get("trip_complete", False)
        actually_complete = llm_says_complete and self.is_ready_to_finalize()
        extracted = self.state.to_dict() if actually_complete else None

        return result.get("assistant_message", ""), actually_complete, extracted

    def get_state_dict(self) -> dict:
        return self.state.to_dict()

    def get_final_json(self) -> str:
        return json.dumps(self.state.to_dict(), indent=2)


# ---------------------------------------------------------------------------
# Session store — in-memory, keyed by session_id
# ---------------------------------------------------------------------------

_sessions: dict[str, TravelPlanner] = {}


def get_or_create_session(session_id: str) -> TravelPlanner:
    if session_id not in _sessions:
        _sessions[session_id] = TravelPlanner()
    return _sessions[session_id]


def delete_session(session_id: str):
    _sessions.pop(session_id, None)
