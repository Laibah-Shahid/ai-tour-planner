# PakTour AI - Architecture & Implementation Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Backend Design](#3-backend-design)
4. [Frontend Integration](#4-frontend-integration)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Security Measures](#7-security-measures)
8. [Deployment Guide](#8-deployment-guide)
9. [Decisions & Rationale](#9-decisions--rationale)

---

## 1. Project Overview

PakTour AI is an AI-powered travel planning platform for Pakistan tourism. It generates personalized itineraries using semantic search, geographic clustering, and LLM-based planning, while monitoring disaster news to keep travelers safe.

### Key Features
- **AI Itinerary Generation** - Semantic search + DBSCAN clustering + LLM ordering
- **Conversational Trip Planning** - LLM-powered chatbot for natural language trip building
- **Disaster Monitoring** - Real-time news fetching, filtering, and conflict detection
- **Shareable Itineraries** - UUID-based public share links
- **Editable Plans** - Inline editing of generated itineraries
- **User Trip Management** - Save, view, edit, delete, and share trips

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI (Python 3.12), Pydantic v2 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI/ML | LangGraph, sentence-transformers, scikit-learn DBSCAN |
| LLM | DeepSeek v3.2 via OpenRouter |
| Container | Docker Compose |

---

## 2. System Architecture

```
                    +------------------+
                    |   Next.js 15     |
                    |   Frontend       |
                    |   (port 3000)    |
                    +--------+---------+
                             |
                      REST API calls
                      (Bearer JWT)
                             |
                    +--------v---------+
                    |   FastAPI        |
                    |   Backend        |
                    |   (port 8000)    |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v--------+
     |  Supabase  |  | OpenRouter  |  |  News APIs  |
     |  (DB+Auth) |  | (LLM)      |  | (disaster)  |
     +------------+  +-------------+  +-------------+
```

### Data Flow for Itinerary Generation
1. User fills form or chats with AI on frontend
2. Frontend sends TripRequest to `POST /api/itinerary/generate`
3. Backend authenticates via Supabase JWT
4. ItineraryGenerator runs 4-node LangGraph pipeline:
   - **Semantic Search**: Embeds user preferences, finds matching attractions from Supabase
   - **Data Enrichment**: Extracts coordinates for geographic clustering
   - **Optional Places**: DBSCAN clusters attractions, finds nearby food/hotels/shops
   - **Itinerary Generation**: LLM orders clusters, builds day-by-day plan deterministically
5. Result transformed to frontend-compatible ItineraryData format
6. Saved to Supabase `itineraries` table with user_id
7. Returned to frontend for display

---

## 3. Backend Design

### Directory Structure
```
backend/
  app/
    core/
      config.py          - Settings from env vars (pydantic-settings)
      supabase_client.py - Singleton Supabase client (anon + admin)
      exceptions.py      - HTTP exception classes
    middleware/
      auth.py            - JWT verification via Supabase
    models/
      schemas.py         - Pydantic request/response models
    routers/
      itinerary.py       - Generate, CRUD, share endpoints
      chat.py            - Conversational planning endpoints
      disaster.py        - Disaster monitoring endpoints
      explore.py         - Browse destinations, attractions, hotels
      profile.py         - User profile endpoint
    services/
      supabase_data.py   - Data access layer (replaces Excel files)
      itinerary_engine.py - Core generation (adapted from Integrate.py)
      chat_planner.py    - Chat state machine (adapted from multi_city_val.py)
      disaster_service.py - News monitoring (adapted from news repo)
      trip_orchestrator.py - Multi-city orchestration + format transform
      trip_store.py      - Itinerary CRUD + sharing in Supabase
  requirements.txt
  Dockerfile
  supabase_migrations.sql
```

### Service Adaptation Strategy (Minimal Changes)

**Itinerary Engine** (`itinerary_engine.py`)
- Original: `Integrate.py` - reads Excel files, uses global LLM
- Changed: Reads from Supabase via `supabase_data.py`, LLM created from config
- Preserved: All algorithms (haversine, DBSCAN, auto-balance, nearest_from_pool)
- Added: Singleton pattern via `get_generator()` for thread safety

**Chat Planner** (`chat_planner.py`)
- Original: `multi_city_val.py` - CLI interactive loop
- Changed: Stateless per-session, returns tuple instead of printing
- Preserved: TravelState, CitySegment, all validation logic, LLM system prompt
- Added: Session store (in-memory dict keyed by session_id)

**Disaster Service** (`disaster_service.py`)
- Original: 6 separate files in the news repo
- Changed: Merged into single module, reads API keys from config
- Preserved: Keyword filtering, LLM extraction, regional mapping, conflict checking
- Added: Rate limiting (max 10 articles per city for LLM extraction)

### Error Handling Pattern
Every service wraps operations in try/except. HTTP errors use custom exception classes:
- `NotFoundError` (404) - Resource not found
- `UnauthorizedError` (401) - Missing/invalid JWT
- `ForbiddenError` (403) - User doesn't own the resource
- `BadRequestError` (400) - Invalid input
- `ServiceUnavailableError` (503) - External service down
- Global exception handler catches unhandled errors and returns 500

---

## 4. Frontend Integration

### API Client (`lib/api.ts`)
Centralized fetch wrapper with:
- Automatic Supabase JWT injection via `getAuthHeaders()`
- Typed request/response for all endpoints
- Error extraction from API response body

### Page Changes

| Page | What Changed |
|------|-------------|
| **build-trip** | Replaced `localStorage` + simulated delay with real API calls (`generateItinerary`, `generateFromChat`). Navigation now includes itinerary ID in URL. |
| **itinerary** | Complete rewrite. Loads from API by ID or share_id. Added: editing mode (inline title/tagline editing), share button (clipboard), disaster alert checker, Suspense wrapper. Falls back to dummy data gracefully. |
| **profile** | New page. Loads user trips from API, displays trip cards with view/share/delete actions. Protected route (redirects to signin). |
| **TripChatbot** | Replaced regex-based extraction with real LLM backend calls via `sendChatMessage`. Each chat session gets unique ID. Extracts structured data from backend response. |
| **DayCard** | Added food spots section, inline editing inputs, graceful handling of missing images/data. |

### New Components/Features
- **Disaster Alert Banner** - Amber-colored alert section showing travel risks
- **Edit Mode** - Blue banner + inline inputs for day titles and taglines
- **Share Button** - Generates UUID link, copies to clipboard with visual feedback
- **Profile Trip Cards** - List view of saved itineraries with status badges

---

## 5. Database Schema

### Existing Tables (Unchanged)
- `Attractions` - Tourist attractions with coordinates and reviews
- `Cities` - Pakistani cities with lat/lng
- `Food` - Food places with coordinates
- `Hotel inner features` - Hotel amenities, pricing
- `Hotel-outer-features` - Hotel location, reviews, contact info
- `Shops` - Souvenir/shopping places
- `Tourist Attractions` - Additional attractions data

### New Tables

```sql
-- User-generated itineraries
CREATE TABLE itineraries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    itinerary JSONB NOT NULL,     -- Full ItineraryData object
    trip_request JSONB NOT NULL,  -- Original user input
    status TEXT CHECK (status IN ('draft', 'generated', 'shared')),
    share_id TEXT UNIQUE,         -- Short UUID for sharing
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Shareable links
CREATE TABLE itinerary_shares (
    id UUID PRIMARY KEY,
    share_id TEXT NOT NULL UNIQUE,
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ
);
```

### Row Level Security (RLS)
- Users can only CRUD their own itineraries
- Shared itineraries (where `share_id IS NOT NULL`) are publicly readable
- Share records are publicly readable (for resolving share links)
- Service role key bypasses RLS for backend operations

---

## 6. API Reference

### Itinerary Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/itinerary/generate` | Required | Generate from form data |
| POST | `/api/itinerary/generate-from-chat` | Required | Generate from chat output |
| GET | `/api/itinerary/my-trips` | Required | List user's itineraries |
| GET | `/api/itinerary/{id}` | Optional | Get itinerary by ID |
| PUT | `/api/itinerary/{id}` | Required | Update itinerary (owner only) |
| DELETE | `/api/itinerary/{id}` | Required | Delete itinerary (owner only) |
| POST | `/api/itinerary/{id}/share` | Required | Create share link |
| GET | `/api/itinerary/shared/{share_id}` | None | Get shared itinerary |

### Chat Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chat/message` | Optional | Send message to chat planner |
| DELETE | `/api/chat/session/{id}` | None | Clear chat session |
| GET | `/api/chat/session/{id}/state` | None | Get session state (debug) |

### Disaster Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/disaster/check` | Optional | Check for disaster conflicts |
| GET | `/api/disaster/alerts?cities=X,Y` | None | General disaster alerts |

### Explore Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/explore/destinations` | None | List all destinations |
| GET | `/api/explore/destinations/{city}` | None | Destination detail |
| GET | `/api/explore/attractions` | None | Search attractions |
| GET | `/api/explore/hotels?city=X` | None | Search hotels |

### Profile Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile/me` | Required | Get user profile + trip count |

---

## 7. Security Measures

1. **Authentication**: Supabase JWT tokens verified on every protected endpoint
2. **Authorization**: Owner-only checks on update/delete/share operations
3. **RLS**: PostgreSQL Row Level Security prevents direct database access bypass
4. **CORS**: Configurable allowed origins (defaults to localhost:3000)
5. **Input Validation**: Pydantic models validate all request bodies
6. **SQL Injection**: Supabase client uses parameterized queries
7. **XSS Prevention**: React's default JSX escaping + no dangerouslySetInnerHTML
8. **Rate Limiting**: LLM extraction limited to 10 articles per disaster check
9. **Error Masking**: Global exception handler returns generic 500 messages
10. **Secrets Management**: All credentials via environment variables, .gitignore excludes .env files

---

## 8. Deployment Guide

### Prerequisites
- Docker & Docker Compose
- Supabase project (with existing tables)
- OpenRouter API key
- (Optional) News API keys

### Steps

1. **Run Supabase Migration**
   ```sql
   -- Execute backend/supabase_migrations.sql in Supabase SQL Editor
   ```

2. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Fill in all required values
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Or run locally**
   ```bash
   # Backend
   cd backend && pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000

   # Frontend
   cd frontend && npm install && npm run dev
   ```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_ANON_KEY | Yes | Supabase anon/public key |
| SUPABASE_SERVICE_ROLE_KEY | Recommended | Supabase service role key (bypasses RLS) |
| OPENAI_API_KEY | Yes | OpenRouter API key for LLM |
| THENEWS_API_KEY | No | TheNewsAPI key for disaster monitoring |
| WORLD_NEWS_API_KEY | No | WorldNewsAPI key for disaster monitoring |
| CORS_ORIGINS | No | Comma-separated allowed origins |

---

## 9. Decisions & Rationale

### Why Supabase Instead of Raw PostgreSQL?
- **Auth built-in**: Supabase Auth handles JWT, OAuth, password reset natively
- **RLS**: Row-level security policies are cleaner than application-level auth checks
- **Frontend compatibility**: The frontend already used Supabase Auth
- **Hosting**: Managed service reduces ops burden

### Why FastAPI?
- **User requirement**: Explicitly requested
- **Async support**: Handles concurrent requests well
- **Pydantic integration**: Type-safe request/response validation
- **Auto-documentation**: OpenAPI/Swagger docs at `/docs`

### Why In-Memory Chat Sessions?
- Sessions are ephemeral (chat state only matters during active conversation)
- No need for persistence (chat always leads to itinerary generation)
- Simple and fast for the current scale
- Can be upgraded to Redis for horizontal scaling

### Why Singleton ItineraryGenerator?
- Loading embeddings model takes ~5s
- Loading and embedding all attractions from Supabase is expensive
- Singleton ensures this happens once per server lifecycle
- Thread-safe for concurrent requests (read-only after initialization)

### Why Merged Disaster Service?
- Original was 6 files with circular imports
- Single module is easier to maintain and test
- Shared LLM initialization reduces resource usage
- Added rate limiting (10 articles/city) to control LLM costs

### Why DBSCAN for Clustering?
- Density-based: naturally groups nearby attractions without specifying cluster count
- Haversine metric: proper distance on Earth's surface
- No assumption about cluster shapes (unlike K-means)
- Auto-balance step ensures even day distribution

### Frontend Design Decisions
- **Fallback to dummy data**: Itinerary page works even without backend (graceful degradation)
- **localStorage bridge**: Generated itinerary stored temporarily for page transition
- **Inline editing**: Simple title/tagline editing vs. complex form-based editing (matches existing UI patterns)
- **Suspense boundary**: Required by Next.js 15 for useSearchParams

---

## Branch Structure

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Stable frontend baseline | Base |
| `ft/backend-setup` | FastAPI backend with all services and APIs | Complete |
| `ft/integration-frontend` | Frontend integration with backend + fixes | Complete |
