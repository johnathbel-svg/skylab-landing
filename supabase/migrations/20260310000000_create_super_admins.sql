-- Migration: Create super_admins and update RLS helper

CREATE TABLE public.super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_sa BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE user_id = auth.uid()
  ) INTO is_sa;
  RETURN is_sa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only super admins can read the super_admins table
CREATE POLICY "Super admins are viewable by super admins"
ON public.super_admins FOR SELECT
USING (public.is_super_admin());

-- Modify get_current_user_tenant_ids to return ALL tenant IDs if the user is a super_admin
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_ids() 
RETURNS SETOF UUID AS $$
BEGIN
  IF public.is_super_admin() THEN
    -- If super admin, return all tenant IDs + a dummy null to ensure it triggers access if needed
    RETURN QUERY SELECT id FROM public.tenants;
  ELSE
    -- Normal users only see their linked tenants
    RETURN QUERY SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
