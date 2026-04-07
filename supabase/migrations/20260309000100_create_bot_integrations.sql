-- Migration: 20260309000100_create_bot_integrations
-- Description: Table for storing bot integration credentials for external platforms like Telegram and WhatsApp.

-- 1. Create bot_integrations table
CREATE TABLE public.bot_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'messenger', 'instagram')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bot_id, channel)
);

-- 2. Add platform_id to contacts to track users on external platforms
-- This allows us to link a Telegram Chat ID or WhatsApp Number to a CRM Contact.
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS platform_id TEXT;
ALTER TABLE public.contacts ADD CONSTRAINT unique_contact_platform UNIQUE (tenant_id, channel, platform_id);

-- 3. Enable RLS
ALTER TABLE public.bot_integrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Polices for bot_integrations
CREATE POLICY "Bot integrations are viewable by tenant members"
ON public.bot_integrations FOR SELECT
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "Bot integrations can be managed by tenant members"
ON public.bot_integrations FOR ALL
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()))
WITH CHECK (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_integrations_updated_at
BEFORE UPDATE ON public.bot_integrations
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
