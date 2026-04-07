-- Migration: extend_tenants_and_bots
-- Description: Adds personalization and dimensioning fields for SaaS scaling.

-- 1. Extend Tenants Table (Business Context & Capacity)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS estimated_monthly_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_interactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_voice BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_multimedia BOOLEAN DEFAULT TRUE;

-- 2. Extend Bots Table (Visual & Personality Identity)
ALTER TABLE public.bots 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS tone_style TEXT DEFAULT 'friendly' CHECK (tone_style IN ('friendly', 'formal', 'paisa', 'direct', 'expert')),
ADD COLUMN IF NOT EXISTS use_emojis TEXT DEFAULT 'high' CHECK (use_emojis IN ('none', 'low', 'high')),
ADD COLUMN IF NOT EXISTS custom_stickers_url TEXT,
ADD COLUMN IF NOT EXISTS specialized_industry TEXT;

-- 3. Industry Templates (Conceptual helper for AI)
-- These will be used in the system prompt wrapper to adjust the bot's nature.
COMMENT ON COLUMN public.bots.specialized_industry IS 'e.g., gym, restaurant, real_estate, ecommerce, healthcare';

-- 4. Update the trigger (optional, if we want to auto-assign industry from tenant)
-- For now, we will handle it via UI during onboarding.
