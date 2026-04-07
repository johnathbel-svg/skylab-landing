-- Migration: 20260308000700_create_knowledge_vectors
-- Description: Enable pgvector and create knowledge_docs and knowledge_chunks tables with RLS.

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create knowledge_docs table
CREATE TABLE public.knowledge_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'url', 'text', 'csv')),
    source_uri TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'active', 'error')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create knowledge_chunks table
CREATE TABLE public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    doc_id UUID NOT NULL REFERENCES public.knowledge_docs(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(3072),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for knowledge_docs
CREATE POLICY "knowledge_docs are viewable by tenant members"
ON public.knowledge_docs FOR SELECT
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_docs can be created by tenant members"
ON public.knowledge_docs FOR INSERT
WITH CHECK (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_docs can be updated by tenant members"
ON public.knowledge_docs FOR UPDATE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_docs can be deleted by tenant members"
ON public.knowledge_docs FOR DELETE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

-- 6. RLS Policies for knowledge_chunks
CREATE POLICY "knowledge_chunks are viewable by tenant members"
ON public.knowledge_chunks FOR SELECT
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_chunks can be created by tenant members"
ON public.knowledge_chunks FOR INSERT
WITH CHECK (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_chunks can be updated by tenant members"
ON public.knowledge_chunks FOR UPDATE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

CREATE POLICY "knowledge_chunks can be deleted by tenant members"
ON public.knowledge_chunks FOR DELETE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));

-- NOTA VECTORIAL: Se omite HNSW index debido a que superamos el límite de 2000D 
-- de la versión alojada. Ejecutaremos Exact Math Scan respaldado por el hardware de servidor.
