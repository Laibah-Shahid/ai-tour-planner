/**
 * API client for the PakTour AI backend.
 * All API calls go through this module for consistency and error handling.
 */

import { supabase } from "./utils";
import type { ItineraryData } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Itinerary
// ---------------------------------------------------------------------------

export interface TripRequestPayload {
  source: string;
  destinations: string[];
  adults: number;
  kids: number;
  budget: number;
  start_date: string;
  end_date: string;
  days: number;
  transport_type: string;
  spots: string[];
  notes: string;
  include_food: boolean;
  include_souvenirs: boolean;
}

export interface ItineraryResponseData {
  id: string;
  user_id: string | null;
  itinerary: ItineraryData;
  trip_request: Record<string, unknown>;
  status: string;
  share_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function generateItinerary(
  payload: TripRequestPayload
): Promise<ItineraryResponseData> {
  return apiFetch<ItineraryResponseData>("/api/itinerary/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateFromChat(
  tripJson: Record<string, unknown>
): Promise<ItineraryResponseData> {
  return apiFetch<ItineraryResponseData>("/api/itinerary/generate-from-chat", {
    method: "POST",
    body: JSON.stringify(tripJson),
  });
}

export async function getItinerary(
  id: string
): Promise<ItineraryResponseData> {
  return apiFetch<ItineraryResponseData>(`/api/itinerary/${id}`);
}

export async function updateItinerary(
  id: string,
  updates: { itinerary?: ItineraryData; status?: string }
): Promise<ItineraryResponseData> {
  return apiFetch<ItineraryResponseData>(`/api/itinerary/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteItinerary(id: string): Promise<void> {
  await apiFetch(`/api/itinerary/${id}`, { method: "DELETE" });
}

export async function getMyTrips(): Promise<{
  trips: ItineraryResponseData[];
  total: number;
}> {
  return apiFetch("/api/itinerary/my-trips");
}

export async function shareItinerary(
  id: string
): Promise<{ share_id: string; share_url: string }> {
  return apiFetch(`/api/itinerary/${id}/share`, { method: "POST" });
}

export async function getSharedItinerary(
  shareId: string
): Promise<ItineraryResponseData> {
  return apiFetch<ItineraryResponseData>(`/api/itinerary/shared/${shareId}`);
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessagePayload {
  message: string;
  session_id: string;
  history?: { role: string; content: string }[];
}

export interface ChatResponseData {
  reply: string;
  trip_complete: boolean;
  extracted_details: Record<string, unknown> | null;
  session_id: string;
}

export async function sendChatMessage(
  payload: ChatMessagePayload
): Promise<ChatResponseData> {
  return apiFetch<ChatResponseData>("/api/chat/message", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function clearChatSession(sessionId: string): Promise<void> {
  await apiFetch(`/api/chat/session/${sessionId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Disaster
// ---------------------------------------------------------------------------

export interface DisasterAlert {
  city: string;
  date: string;
  event: string;
  impact: string;
  severity: string;
}

export async function checkDisasters(
  cities: string[],
  dates: string[] = [],
  itineraryId?: string
): Promise<{
  alerts: DisasterAlert[];
  checked_cities: string[];
  message: string;
}> {
  return apiFetch("/api/disaster/check", {
    method: "POST",
    body: JSON.stringify({
      cities,
      dates,
      itinerary_id: itineraryId,
    }),
  });
}

// ---------------------------------------------------------------------------
// Explore
// ---------------------------------------------------------------------------

export async function getDestinations(): Promise<{
  destinations: { id: string; name: string; country: string }[];
  total: number;
}> {
  return apiFetch("/api/explore/destinations");
}

export async function getDestinationDetail(
  cityName: string
): Promise<Record<string, unknown>> {
  return apiFetch(`/api/explore/destinations/${encodeURIComponent(cityName)}`);
}

export async function searchHotels(
  city: string,
  maxPrice = 0,
  minRating = 0
): Promise<{ hotels: Record<string, unknown>[]; total: number }> {
  const params = new URLSearchParams({ city });
  if (maxPrice > 0) params.set("max_price", String(maxPrice));
  if (minRating > 0) params.set("min_rating", String(minRating));
  return apiFetch(`/api/explore/hotels?${params}`);
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<{
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  trips_count: number;
}> {
  return apiFetch("/api/profile/me");
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function healthCheck(): Promise<{
  status: string;
  version: string;
}> {
  return apiFetch("/api/health");
}
