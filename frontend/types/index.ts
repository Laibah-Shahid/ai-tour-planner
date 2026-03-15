import type { ReactNode } from "react";

export interface Destination {
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
}

export interface CostItem {
  label: string;
  amount: number;
}

export interface TravelTip {
  id: number;
  text: string;
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
