from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import date, datetime
from enum import Enum


# ---------- Enums ----------
class TransportType(str, Enum):
    car = "car"
    bus = "bus"
    plane = "plane"
    train = "train"


class BudgetLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ItineraryStatus(str, Enum):
    draft = "draft"
    generated = "generated"
    shared = "shared"


# ---------- Trip Request ----------
class TripRequest(BaseModel):
    source: str = Field(..., min_length=1, description="Starting city")
    destinations: list[str] = Field(..., min_length=1, description="Destination cities")
    adults: int = Field(..., ge=1, description="Number of adults")
    kids: int = Field(0, ge=0, description="Number of kids")
    budget: int = Field(..., ge=100000, le=2000000, description="Budget in PKR (100,000–2,000,000)")
    start_date: date
    end_date: date
    days: int = Field(..., ge=1, le=365, description="Number of days (1–365)")
    transport_type: TransportType = TransportType.car
    spots: list[str] = Field(default_factory=list, description="Specific spots to visit")
    notes: str = ""
    include_food: bool = True
    include_souvenirs: bool = True

    @model_validator(mode="after")
    def end_after_start(self) -> "TripRequest":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


# ---------- Chat ----------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str = Field(..., description="Unique chat session ID")
    history: list[dict] = Field(default_factory=list, description="Previous messages")


class ChatResponse(BaseModel):
    reply: str
    trip_complete: bool = False
    extracted_details: dict | None = None
    session_id: str


# ---------- Hotel ----------
class HotelRoom(BaseModel):
    type: str
    beds: int = 1
    size: str = ""
    price: int = 0


class HotelReview(BaseModel):
    user: str
    rating: float
    comment: str


class Hotel(BaseModel):
    name: str
    key: str = ""            # Supabase PK (the original _key column)
    hotel_id: str = ""
    place_id: str = ""
    image: str = ""
    rating: float = 0.0
    address: str = ""
    pricePerNight: int = 0
    google_url: str = ""     # Google Maps URL for this hotel
    website: str = ""        # Hotel's own website (for booking)
    lodging_type: str = ""   # Hotel / Guest House / Resort etc.
    num_reviews: int = 0
    images: list[str] = []
    rooms: list[HotelRoom] = []
    reviews: list[HotelReview] = []
    amenities: list[str] = []


# ---------- Itinerary ----------
class PlaceReview(BaseModel):
    author: str = ""
    rating: float = 0.0
    text: str = ""


class ItineraryPlace(BaseModel):
    name: str
    key: str = ""            # Supabase PK — fetch details via /api/explore/place/{key}
    image: str = ""
    images: list[str] = []   # All images from attraction_images table
    description: str = ""
    category: str = ""
    city: str = ""
    district: str = ""
    reviews: list[PlaceReview] = []


class Souvenir(BaseModel):
    name: str
    key: str = ""            # Supabase PK
    description: str = ""


class FoodSpot(BaseModel):
    name: str
    key: str = ""            # Supabase PK
    description: str = ""


class ItineraryDay(BaseModel):
    id: int
    date: str = ""
    title: str
    tagline: str = ""
    image: str = ""
    durationHours: float = 0
    distanceKm: float = 0
    hotels: list[Hotel] = []
    places: list[ItineraryPlace] = []
    souvenirs: list[Souvenir] = []
    food: list[FoodSpot] = []


class CostItem(BaseModel):
    label: str
    amount: int


class TravelTip(BaseModel):
    id: int
    text: str


class ItineraryData(BaseModel):
    destination: str
    totalDays: int
    bestSeason: str = ""
    totalCost: int = 0
    days: list[ItineraryDay]
    costs: list[CostItem] = []
    tips: list[TravelTip] = []
    alternative_pool: dict = Field(default_factory=dict)


class ItineraryResponse(BaseModel):
    id: str
    user_id: str | None = None
    itinerary: ItineraryData
    trip_request: dict
    status: ItineraryStatus = ItineraryStatus.generated
    share_id: str | None = None
    created_at: str
    updated_at: str


# ---------- Itinerary Update (editing) ----------
class ItineraryUpdateRequest(BaseModel):
    itinerary: ItineraryData | None = None
    status: ItineraryStatus | None = None


# ---------- Share ----------
class ShareResponse(BaseModel):
    share_id: str
    share_url: str


# ---------- Disaster ----------
class DisasterAlert(BaseModel):
    city: str
    date: str
    event: str
    impact: str
    severity: str = "medium"


class DisasterCheckRequest(BaseModel):
    itinerary_id: str | None = None
    cities: list[str] = []
    dates: list[str] = []


class DisasterCheckResponse(BaseModel):
    alerts: list[DisasterAlert]
    checked_cities: list[str]
    message: str


# ---------- Destination ----------
class DestinationAttraction(BaseModel):
    id: str
    name: str
    description: str = ""
    image: str = ""
    category: str = ""
    district: str = ""
    latitude: float | None = None
    longitude: float | None = None
    reviews: str = ""
    place_id: str = ""


class DestinationHotel(BaseModel):
    id: str
    name: str
    rating: float = 0.0
    price: int = 0
    image: str = ""
    address: str = ""
    images: list[str] = []
    amenities: list[str] = []
    rooms: list[HotelRoom] = []
    reviews: list[HotelReview] = []


class DestinationExperience(BaseModel):
    id: str
    title: str
    duration: str = ""
    price: int = 0


class DestinationDetail(BaseModel):
    id: str
    name: str
    description: str = ""
    rating: float = 0.0
    category: str = ""
    district: str = ""
    images: list[str] = []
    best_season: list[str] = []
    budget: BudgetLevel = BudgetLevel.medium
    avg_trip_cost: int = 0
    ideal_duration: str = ""
    attractions: list[DestinationAttraction] = []
    hotels: list[DestinationHotel] = []
    experiences: list[DestinationExperience] = []


class DestinationSummary(BaseModel):
    id: str
    name: str
    image: str = ""
    description: str = ""
    rating: float = 0.0
    location: str = ""
    tag: str = ""


# ---------- Contribute ----------

PLACE_CATEGORIES = [
    "Historical / Heritage",
    "Nature / Scenic",
    "Adventure",
    "Religious",
    "Cultural",
    "Food & Dining",
    "Shopping",
    "Recreational",
    "Other",
]


class PlaceSearchResult(BaseModel):
    key: str
    name: str
    category: str = ""
    district: str = ""
    description: str = ""


class ReviewSubmit(BaseModel):
    place_key: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=1000)


class ContributionSubmit(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str
    description: str = Field(default="", max_length=1000)
    city: str = Field(..., min_length=2, max_length=100)
    area: str = Field(default="", max_length=100)
    latitude: float | None = None
    longitude: float | None = None


class ContributeResponse(BaseModel):
    id: str
    message: str


# ---------- Profile ----------
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str = ""
    avatar_url: str = ""
    trips_count: int = 0


class UserTripsResponse(BaseModel):
    trips: list[ItineraryResponse]
    total: int
