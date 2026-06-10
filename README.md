# PakTour AI

AI-powered travel planning platform for Pakistan tourism.

## Quick Start

### Backend (FastAPI)

```bash
cd backend

# Activate virtual environment
venv\Scripts\activate            # Windows CMD / PowerShell
source venv/Scripts/activate     # Git Bash

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your keys (see Environment Variables below)

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend (Next.js)

```bash
cd frontend

npm install
npm run dev
```

App: http://localhost:3000

### Environment Variables

**Backend (`backend/.env`)**

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (Settings > API) |
| `OPENAI_API_KEY` | Yes | OpenRouter API key for LLM |
| `THENEWS_API_KEY` | No | TheNewsAPI key (disaster alerts) |
| `WORLD_NEWS_API_KEY` | No | WorldNewsAPI key (disaster alerts) |
| `CORS_ORIGINS` | No | Allowed origins (default: http://localhost:3000) |

**Frontend (`frontend/.env.local`)**

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (default: http://localhost:8000) |

### Database Setup

Run `backend/supabase_migrations.sql` in your Supabase Dashboard SQL Editor to create the `itineraries` and `itinerary_shares` tables.

### Docker (alternative)

```bash
docker-compose up --build
```

## Architecture

See [ARCHITECTURE.doc.md](ARCHITECTURE.doc.md) for full system design documentation.
