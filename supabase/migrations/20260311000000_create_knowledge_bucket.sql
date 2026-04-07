-- Migration: 20260311000000_create_knowledge_bucket.sql
-- Description: Crea el Bucket privado "knowledge" en Supabase Storage para documentos RAG

-- Insert bucket if it doesn't exist (Privado por seguridad, el bot accederá via Service Role o RLS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge', 'knowledge', false)
ON CONFLICT (id) DO NOTHING;

-- Permiso de subida (Solo dueños de empresas autenticados)
CREATE POLICY "Tenant owners can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'knowledge' 
    AND auth.role() = 'authenticated'
);

-- Permiso de lectura (Solo dueños de empresas autenticados para su propio tenant o vía Service Role)
-- Por ahora simplificado a 'authenticated' ya que el RLS de storage.objects es complejo de filtrar por metadatos de tenant_id sin hooks.
CREATE POLICY "Tenant owners can read documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'knowledge' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Tenant owners can delete documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'knowledge' 
    AND auth.role() = 'authenticated'
);
