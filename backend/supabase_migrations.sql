-- ============================================================
-- PakTour AI — Supabase Migration Script
-- Run this in your Supabase SQL Editor to create the
-- tables needed for trip storage, sharing, and profiles.
--
-- Existing tables (Attractions, Cities, Food, Hotels, Shops,
-- Tourist Attractions) are NOT modified.
-- ============================================================

-- 1. Itineraries table — stores generated trip plans
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    itinerary JSONB NOT NULL,
    trip_request JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated'
        CHECK (status IN ('draft', 'generated', 'shared')),
    share_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id
    ON public.itineraries(user_id);

-- Index for share lookups
CREATE INDEX IF NOT EXISTS idx_itineraries_share_id
    ON public.itineraries(share_id)
    WHERE share_id IS NOT NULL;

-- 2. Itinerary shares table — shareable links
CREATE TABLE IF NOT EXISTS public.itinerary_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id TEXT NOT NULL UNIQUE,
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shares_share_id
    ON public.itinerary_shares(share_id);

CREATE INDEX IF NOT EXISTS idx_shares_itinerary_id
    ON public.itinerary_shares(itinerary_id);

-- 3. RLS Policies — Row Level Security
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_shares ENABLE ROW LEVEL SECURITY;

-- Users can read their own itineraries
CREATE POLICY "Users can view own itineraries"
    ON public.itineraries FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own itineraries
CREATE POLICY "Users can create itineraries"
    ON public.itineraries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own itineraries
CREATE POLICY "Users can update own itineraries"
    ON public.itineraries FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own itineraries
CREATE POLICY "Users can delete own itineraries"
    ON public.itineraries FOR DELETE
    USING (auth.uid() = user_id);

-- Shared itineraries are publicly readable
CREATE POLICY "Shared itineraries are publicly readable"
    ON public.itineraries FOR SELECT
    USING (share_id IS NOT NULL);

-- Share records: users can create for their own itineraries
CREATE POLICY "Users can create shares"
    ON public.itinerary_shares FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Share records: anyone can read (for public share links)
CREATE POLICY "Shares are publicly readable"
    ON public.itinerary_shares FOR SELECT
    USING (true);

-- Service role bypass (for backend operations)
-- The service_role key bypasses RLS automatically in Supabase.
-- No additional policy needed.

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itineraries TO authenticated;
GRANT SELECT ON public.itineraries TO anon;
GRANT SELECT, INSERT ON public.itinerary_shares TO authenticated;
GRANT SELECT ON public.itinerary_shares TO anon;
