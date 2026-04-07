-- Migration: 20260318010000_crm_fields
-- Description: Adds lead_stage to contacts and human_in_control to conversations for Phase 3 CRM.

-- Add lead_stage to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS lead_stage TEXT DEFAULT 'new' 
CHECK (lead_stage IN ('new', 'qualified', 'proposal', 'won', 'lost'));

-- Add human_in_control to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS human_in_control BOOLEAN DEFAULT false;
