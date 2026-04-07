-- Migration: 20260308001100_create_products_table
-- Description: Crea la tabla de productos para el catálogo multimodal del RAG B2B.

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE, -- Nullable, si es null aplica a todos los bots del tenant
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Products are viewable by tenant members"
ON public.products FOR SELECT
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "Products can be created by tenant members"
ON public.products FOR INSERT
WITH CHECK (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "Products can be updated by tenant members"
ON public.products FOR UPDATE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()))
WITH CHECK (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "Products can be deleted by tenant members"
ON public.products FOR DELETE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));
