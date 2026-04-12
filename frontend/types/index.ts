import type { ReactNode } from "react";

export interface Destination {
  id?: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  location: string;
  tag?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  image?: string;
  quote: string;
  rating?: number;
}

export interface Experience {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  destinationId?: string;
}

export interface SeasonalHighlight {
  id: number;
  title: string;
  location: string;
  image: string;
  tag: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

// ── Itinerary ────────────────────────────────────────────────────────────────

export interface HotelRoom {
  type: string;
  beds: number;
  size: string;
  price: number;
}

export interface HotelReview {
  user: string;
  rating: number;
  comment: string;
}

export interface Hotel {
  name: string;
  image: string;
  rating: number;
  address: string;
  pricePerNight: number;
  images?: string[];
  rooms?: HotelRoom[];
  reviews?: HotelReview[];
  amenities?: string[];
}

export interface ItineraryPlace {
  name: string;
  image: string;
  description: string;
}

export interface Souvenir {
  name: string;
  description: string;
}

export interface FoodSpot {
  name: string;
  description?: string;
}

export interface ItineraryDay {
  id: number;
  title: string;
  tagline: string;
  image: string;
  durationHours: number;
  distanceKm: number;
  hotels: Hotel[];
  places: ItineraryPlace[];
  souvenirs: Souvenir[];
  food?: FoodSpot[];
}

export interface CostItem {
  label: string;
  amount: number;
}

export interface TravelTip {
  id: number;
  text: string;
}

// ── Destination Detail ────────────────────────────────────────────────────────

export type BudgetLevel = "low" | "medium" | "high";

export interface DestinationAttraction {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface DestinationHotel {
  id: string;
  name: string;
  rating: number;
  price: number;
  image: string;
  address?: string;
  images?: string[];
  amenities?: string[];
  rooms?: HotelRoom[];
  reviews?: HotelReview[];
}

export interface DestinationExperience {
  id: string;
  title: string;
  duration: string;
  price: number;
}

export interface DestinationDetail {
  id: string;
  name: string;
  description: string;
  rating: number;
  category: string;
  district: string;
  images: string[];
  best_season: string[];
  budget: BudgetLevel;
  avg_trip_cost: number;
  ideal_duration: string;
  attractions: DestinationAttraction[];
  hotels: DestinationHotel[];
  experiences: DestinationExperience[];
}

// ── Chat / Build-Trip ─────────────────────────────────────────────────────────

export type ChatRole = "user" | "bot";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface GatheredTripDetails {
  destination: string[];
  source: string;
  budget: string;
  spots: string[]; // now an array
  notes: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string (auto or user)
  days: string;       // number of days (auto or user)
  kids: string;       // number of kids
  adults: string;     // number of adults
  transport_type: string; // e.g., car, bus, train
}

export interface ItineraryData {
  destination: string;
  totalDays: number;
  bestSeason: string;
  totalCost: number;
  days: ItineraryDay[];
  costs: CostItem[];
  tips: TravelTip[];
}
