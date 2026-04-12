# PakTour AI — Process Flows Documentation

This document describes every major process in the system: how it starts, what functions/endpoints are called, what happens at each step, and what comes next.

## Table of Contents
1. [Authentication Flow](#1-authentication-flow)
2. [Itinerary Generation (Form Mode)](#2-itinerary-generation--form-mode)
3. [Itinerary Generation (Chat Mode)](#3-itinerary-generation--chat-mode)
4. [Viewing a Saved Itinerary](#4-viewing-a-saved-itinerary)
5. [Place / Hotel Detail Hydration](#5-place--hotel-detail-hydration)
6. [Editing an Itinerary](#6-editing-an-itinerary)
7. [Sharing an Itinerary](#7-sharing-an-itinerary)
8. [Viewing a Shared Itinerary (Public)](#8-viewing-a-shared-itinerary-public)
9. [Deleting an Itinerary](#9-deleting-an-itinerary)
10. [Disaster Alert Check](#10-disaster-alert-check)
11. [Browsing Destinations & Search](#11-browsing-destinations--search)
12. [Profile / My Trips Page](#12-profile--my-trips-page)

---

## Conventions

- `[Frontend]` — code runs in the browser (Next.js client component)
- `[Backend]` — code runs in the FastAPI server
- `[Supabase]` — hosted PostgreSQL / Auth
- `[LLM]` — DeepSeek v3.2 via OpenRouter
- Arrow `→` means "calls" or "triggers"
- Arrow `⇒` means "returns"

---

## 1. Authentication Flow

**Trigger:** User visits `/signin`, `/signup`, or clicks Google OAuth.

### Sign-Up
```
[Frontend] AuthPage.tsx
  user submits email+password
  → supabase.auth.signUp({email, password, options: {data: {full_name}}})
  ⇒ Supabase sends confirmation email
  → [redirect] /

[Frontend] email link click
  → Supabase confirms email
  → session JWT stored in localStorage by supabase-js
  → useUserSession() hook picks it up via onAuthStateChange
```

### Sign-In
```
[Frontend] AuthPage.tsx
  → supabase.auth.signInWithPassword({email, password})
  ⇒ {session: {access_token, refresh_token}, user}
  → [redirect] /
```

### Protected Page Access
```
[Frontend] useUserSession()
  → supabase.auth.getSession()
  ⇒ {user, loading}
  if !user → router.push('/signin')
```

### Backend Request Auth
```
[Frontend] api.ts → getAuthHeaders()
  → supabase.auth.getSession()
  ⇒ access_token
  → fetch(API, {headers: {Authorization: `Bearer ${token}`}})

[Backend] middleware/auth.py → get_current_user()
  → supabase.auth.get_user(token)
  ⇒ user object or 401 UnauthorizedError
```

---

## 2. Itinerary Generation — Form Mode

**Trigger:** User fills the form on `/build-trip` and clicks "Generate My Itinerary".

### Flow
```
[Frontend] build-trip/page.tsx → handleGenerate()
  assembles TripRequestPayload {source, destinations[], adults, kids,
    budget, start_date, end_date, days, transport_type, spots[],
    notes, include_food, include_souvenirs}
  → api.ts → generateItinerary(payload)
    → POST /api/itinerary/generate with Bearer JWT

[Backend] routers/itinerary.py → generate_itinerary()
  → middleware/auth.py → get_current_user()   [verify JWT]
  → trip_orchestrator.generate_from_form(trip_dict)
```

### Inside `generate_from_form()`:
```
[Backend] services/trip_orchestrator.py
  → itinerary_engine.get_generator()           [thread-safe singleton]
      first call only: _load_data() → Supabase fetches for Attractions,
                                       Food, Shops, Hotels; encodes
                                       attractions with sentence-transformers
  → generator.create_graph()                   [LangGraph pipeline]

  for each destination city:
    build initial state {user_query, parsed_location, parsed_days, ...}
    → graph.invoke(state)

    LangGraph runs 4 nodes in sequence:

    Node 1: semantic_search(state)
      → encode(f"{city} {preferences}")
      → cosine similarity vs all attraction embeddings
      → filter by district match
      ⇒ top (days * 4) attractions

    Node 2: enrich_data(state)
      → extract {lat, lng} for each attraction
      ⇒ place_coordinates dict

    Node 3: select_optional_places(state)
      → cluster_attractions() using DBSCAN (haversine, 10km)
      → auto_balance_clusters() → merge/redistribute to target_days
      → for each cluster, nearest_from_pool() on food, shops, hotels
      → sort hotels by price, sum cheapest per cluster into budget_needed
      ⇒ clusters, clustered_optional_places

    Node 4: generate_itinerary(state)
      → LLM call: "Order these clusters for a {days}-day trip"
      ⇒ cluster_order: [0, 2, 1, ...]
      → deterministically build JSON: day_N → {attractions, food,
         souvenir_shops, lodging}
      → allowlist validation (anti-hallucination)
      ⇒ draft_itinerary JSON string

  → _build_itinerary_data(segments, ...)
    transforms engine output to lean frontend format:
      - places: [{name, key}]
      - hotels: [{name, key, hotel_id, place_id, pricePerNight, rating}]
      - food: [{name, key}]
      - souvenirs: [{name, key}]
    builds costs, tips, taglines
```

### Persistence
```
[Backend] routers/itinerary.py
  → trip_store.save_itinerary(user_id, itinerary_data, trip_request)
    → supabase.table("itineraries").insert({id, user_id, itinerary,
       trip_request, status='generated', timestamps})
  ⇒ ItineraryResponse {id, user_id, itinerary, ...}
```

### Back to Frontend
```
[Frontend] build-trip/page.tsx
  ⇒ receives ItineraryResponseData
  → localStorage.setItem("itineraryResult", result)
  → router.push(`/itinerary?id=${result.id}`)
```

Next process: [Viewing a Saved Itinerary](#4-viewing-a-saved-itinerary).

---

## 3. Itinerary Generation — Chat Mode

**Trigger:** User on `/build-trip?mode=chat` (or switches to chat mode) and converses with AI.

### Per-Message Flow
```
[Frontend] TripChatbot.tsx → handleSend()
  → api.ts → sendChatMessage({message, session_id})
    → POST /api/chat/message

[Backend] routers/chat.py → send_message()
  → chat_planner.get_or_create_session(session_id)
    returns or creates TravelPlanner instance (in-memory dict)

  → planner.process_input(user_input)
    builds system_prompt with current state injected as JSON
    → LLM call with SystemMessage + HumanMessage
    ⇒ raw JSON response
    → json.loads → {updated_travel_info, assistant_message, trip_complete}
    → planner.merge_state(updated_travel_info)
    → if trip_complete: planner.validate() → list of errors
    ⇒ (reply, is_complete_no_errors, state_dict_or_None)

  ⇒ ChatResponse {reply, trip_complete, extracted_details, session_id}

[Frontend] TripChatbot.tsx
  appends bot reply to messages
  if trip_complete: transform extracted_details to GatheredTripDetails
  → onDetailsGathered(gathered) callback to parent page
```

### On "Generate My Itinerary" Click
```
[Frontend] build-trip/page.tsx → handleGenerate()
  → converts chatDetails to backend's expected format with segments[]
  → api.ts → generateFromChat(chatPayload)
    → POST /api/itinerary/generate-from-chat

[Backend] routers/itinerary.py → generate_from_chat()
  → trip_orchestrator.generate_from_chat(trip_json)
    same engine pipeline as form mode, but uses segments[] from chat state
  → trip_store.save_itinerary(...)
  ⇒ ItineraryResponse

[Frontend] → router.push(`/itinerary?id=${result.id}`)
```

---

## 4. Viewing a Saved Itinerary

**Trigger:** Navigate to `/itinerary?id={uuid}` (from profile, from generation redirect, or direct URL).

```
[Frontend] itinerary/page.tsx
  wrapped in <Suspense> for Next.js 15 compliance
  useSearchParams() reads `id` param

  useEffect → loadData()
    if itineraryId:
      → api.ts → getItinerary(id)
        → GET /api/itinerary/{id}

[Backend] routers/itinerary.py → get_itinerary()
  → middleware/auth.py → get_optional_user()   [optional; shared view possible]
  → trip_store.get_itinerary(id)
    → supabase.table("itineraries").select("*").eq("id", id).limit(1)
    → JSON-decode stored itinerary and trip_request fields
  ⇒ dict serialized as ItineraryResponse

[Frontend]
  setData(result.itinerary)
  setResponseData(result)
  if result.share_id: setShareUrl(`${origin}/itinerary?shared=${share_id}`)
  render:
    hero header (destination, days, season chips)
    Edit / Share / Check Alerts buttons (if owner and not shared view)
    <ItineraryDaysSection days={days} />
    <TravelTips> + <CostBreakdown>
    <ItineraryCTA onShare={handleShare} shareUrl={shareUrl} />
```

Each day card's places/food/souvenirs/hotels arrive as `{name, key}` pairs. Full details are lazy-hydrated — see next flow.

---

## 5. Place / Hotel Detail Hydration

**Trigger:** User clicks a place card, hotel card, or food item on the itinerary page.

```
[Frontend] (anywhere an itinerary item is rendered)
  on click:
  → api.ts → getPlaceDetails(place.key)       [for attractions/food/souvenirs]
      or getHotelDetails(hotel.hotel_id)      [for hotels]
    → GET /api/explore/place/{key}
      or GET /api/explore/hotel/{hotel_id}

[Backend] routers/explore.py → get_place_by_key()
  → get_supabase_admin()
  for each table in [Attractions, Food, Shops, Tourist Attractions]:
    → supabase.table(name).select("*").eq("_key", key).limit(1)
    if found: return {table: name, ...row}
  if nothing matched: raise NotFoundError

[Backend] routers/explore.py → get_hotel_by_id()
  → supabase.table("Hotel inner features").select("*").eq("hotel_id", id)
  if found:
    → supabase.table("Hotel-outer-features").select("*").eq("place_id", place_id_from_inner)
    merge inner + outer
    add amenities array via _extract_amenities()
  ⇒ full hotel object

[Frontend]
  ⇒ receives full detail dict
  populates a drawer (HotelDetailsDrawer) or expanded card
```

**Why:** The itinerary JSON is deliberately lean — only `{name, key}` per item — so the LLM output stays small and deterministic. Full details are fetched only when the user actually clicks.

---

## 6. Editing an Itinerary

**Trigger:** Owner clicks "Edit" button on their itinerary.

```
[Frontend] itinerary/page.tsx → handleStartEdit()
  setEditData(deep clone of data)
  setEditing(true)
  render:
    blue editing banner
    DayCard shows inline <input> fields instead of static text
    Save / Cancel buttons replace Edit button

  user modifies title/tagline:
  → onEditDay(dayId, field, value) updates editData

  on Save click → handleSaveEdit()
  → api.ts → updateItinerary(id, {itinerary: editData})
    → PUT /api/itinerary/{id}

[Backend] routers/itinerary.py → update_itinerary()
  → middleware/auth.py → get_current_user()   [JWT required]
  → trip_store.update_itinerary(id, user_id, updates)
    → trip_store.get_itinerary(id)            [fetch existing]
    if existing.user_id != user_id → raise ForbiddenError
    → supabase.table("itineraries").update({itinerary, updated_at}).eq("id", id)
  ⇒ updated record

[Frontend]
  ⇒ setData(result.itinerary); setEditing(false)
```

---

## 7. Sharing an Itinerary

**Trigger:** Owner clicks "Share" button (first time; subsequent clicks copy the existing URL).

```
[Frontend] itinerary/page.tsx → handleShare()
  → api.ts → shareItinerary(itinerary_id)
    → POST /api/itinerary/{id}/share

[Backend] routers/itinerary.py → share_itinerary()
  → middleware/auth.py → get_current_user()
  → trip_store.create_share(itinerary_id, user_id)
    → verify owner
    → check if share already exists for this itinerary (idempotent)
    if exists: return existing
    else:
      → generate share_id = uuid4()[:8]
      → supabase.table("itinerary_shares").insert({id, share_id,
         itinerary_id, created_by, created_at})
      → supabase.table("itineraries").update({status: 'shared',
         share_id}).eq("id", itinerary_id)
  ⇒ {share_id, share_url: `/itinerary/shared/{share_id}`}

[Frontend]
  build full URL: `${window.location.origin}${share_url}`
  setShareUrl(url)
  navigator.clipboard.writeText(url)
  show "Copied!" toast for 3s
```

---

## 8. Viewing a Shared Itinerary (Public)

**Trigger:** Anyone (authed or not) visits `/itinerary?shared={share_id}`.

```
[Frontend] itinerary/page.tsx
  useSearchParams() detects `shared` param
  → api.ts → getSharedItinerary(share_id)
    → GET /api/itinerary/shared/{share_id}     [no auth required]

[Backend] routers/itinerary.py → get_shared_itinerary()
  → trip_store.get_shared_itinerary(share_id)
    → supabase.table("itinerary_shares").select("*").eq("share_id", share_id)
    if not found → NotFoundError
    → trip_store.get_itinerary(itinerary_id)
      [RLS allows this because itinerary.share_id is set — public read policy]
  ⇒ full ItineraryResponse

[Frontend]
  isSharedView = true
  hero shows "Shared Trip to X"
  hides Edit / Share / Check Alerts buttons
  shows "Build My Own" link instead of "Refine My Plan"
```

---

## 9. Deleting an Itinerary

**Trigger:** Owner clicks trash icon on `/profile`.

```
[Frontend] profile/page.tsx → handleDelete(id)
  confirm dialog
  → api.ts → deleteItinerary(id)
    → DELETE /api/itinerary/{id}

[Backend] routers/itinerary.py → delete_itinerary()
  → get_current_user()
  → trip_store.delete_itinerary(id, user_id)
    → get_itinerary(id); check owner
    → supabase.table("itineraries").delete().eq("id", id)
    → supabase.table("itinerary_shares").delete().eq("itinerary_id", id)
      [cascade cleanup]

[Frontend]
  ⇒ setTrips(prev → filter out id)
```

---

## 10. Disaster Alert Check

**Trigger:** Itinerary owner clicks "Check Alerts" button on `/itinerary?id=...`.

```
[Frontend] itinerary/page.tsx → handleCheckDisasters()
  extract cities from day.title strings ("Day 1 - Lahore")
  → api.ts → checkDisasters(cities, [], itineraryId)
    → POST /api/disaster/check {cities, dates, itinerary_id}

[Backend] routers/disaster.py → check_disasters()
  if itinerary_id provided:
    → trip_store.get_itinerary(itinerary_id)
    → enrich cities list from day titles

  → disaster_service.check_itinerary_for_disasters(cities, dates)

[Backend] services/disaster_service.py
  for each unique city:
    → fetch_news(city)
      for each configured source (TheNewsAPI, WorldNewsAPI, RSS feeds):
        → requests.get(url, params, timeout=10)
        accumulate articles

    → filter_disaster_news(articles)
      keep articles containing DISASTER_KEYWORDS
      (flood, earthquake, landslide, storm, snowfall, avalanche, ...)

    for each filtered article (max 10 per city):
      → extract_event_with_llm(article, llm)
        → LLM call: "Extract structured disaster info as JSON"
        ⇒ {event_type, location, date, impact, severity}

    for each item in the itinerary matching this city:
      → check_conflict(events, item)
        → map_to_city(event.location) using REGION_MAP
        if mapped_city == item.city AND event.date == item.date:
          append alert

  ⇒ list of alerts

[Frontend]
  setAlerts(result.alerts)
  render amber banner at top of page:
    "Travel Alerts (N)"
    each alert: city (date): event — impact [severity badge]
```

---

## 11. Browsing Destinations & Search

### Destination List Page
**Trigger:** Navigate to `/explore`.

```
[Frontend] explore/page.tsx
  renders ExploreHero, ExploreFilters, ExploreGrid, ...
  [currently uses local data — future: fetch from /api/explore/destinations]
```

### Destination Detail Page
**Trigger:** Navigate to `/destination/{id}` (e.g. from explore grid, footer, or hero select).

```
[Frontend] destination/[id]/page.tsx
  [currently uses local destinationDetails.ts]
  future: → api.ts → getDestinationDetail(cityName)
            → GET /api/explore/destinations/{city}

[Backend] routers/explore.py → get_destination_detail()
  → get_attractions_by_district(city)
  → get_hotels_by_city(city)
  → get_food_by_district(city)
  → get_shops_by_district(city)
  ⇒ {id, name, attractions, hotels, food, shops}
```

### Plan Trip from Destination
**Trigger:** Click "Plan Trip with AI" sticky button.

```
[Frontend] destination/[id]/page.tsx
  → router.push(`/build-trip?destination=${id}`)
  [future: pre-fill destination field]
```

---

## 12. Profile / My Trips Page

**Trigger:** User clicks avatar → "Profile" in dropdown, or navigates to `/profile`.

```
[Frontend] profile/page.tsx
  useUserSession() hook
  if !user → router.push('/signin')

  useEffect on mount:
  → api.ts → getMyTrips()
    → GET /api/itinerary/my-trips with Bearer JWT

[Backend] routers/itinerary.py → get_my_trips()
  → get_current_user()                         [JWT required]
  → trip_store.get_user_itineraries(user.id)
    → supabase.table("itineraries").select("*").eq("user_id", user_id)
       .order("created_at", desc=True)
    → JSON-decode stored itinerary fields
  ⇒ {trips: [...], total: N}

[Frontend]
  setTrips(result.trips)
  render each trip card with:
    - title, dates, cost, status badge
    - Open button → /itinerary?id={trip.id}
    - Share button → handleShare(id) [see flow 7]
    - Delete button → handleDelete(id) [see flow 9]

  empty state: CTA to /build-trip
```

---

## Cross-Cutting Concerns

### Error Propagation
Every backend endpoint wraps business logic in try/except. Custom exceptions from `core/exceptions.py`:
- `NotFoundError` → 404
- `UnauthorizedError` → 401
- `ForbiddenError` → 403
- `BadRequestError` → 400
- `ServiceUnavailableError` → 503
- Anything unhandled → global handler → 500 with generic message (full traceback logged)

Frontend `api.ts → apiFetch` parses the `detail` field from the JSON error body and throws a JS `Error` with that message. Pages display it via `alert()` or inline error UI.

### Session Management
- **Frontend:** Supabase JS client auto-refreshes JWT; `useUserSession` hook syncs state via `onAuthStateChange`.
- **Backend:** Stateless — every request re-verifies JWT via Supabase admin client.
- **Chat planner:** Stateful per-session in-memory dict, keyed by client-generated `session_id`. Evicted only on process restart or explicit `DELETE /api/chat/session/{id}`.

### Caching
- `services/supabase_data.py` caches DataFrames (`_cache` dict) after first load to avoid re-fetching the whole Attractions/Food/Shops/Hotels tables on every generation.
- `itinerary_engine.get_generator()` caches the loaded generator (including embeddings) for the lifetime of the process.
- Both can be cleared via `clear_cache()` and `reload_data()` respectively.
