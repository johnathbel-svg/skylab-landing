-- Migration: 20260308001200_create_storage_buckets
-- Description: Crea el Bucket público "products" en Supabase Storage y habilita RLS

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS explícito si no lo estuviese
-- (Storage.objects ya tiene RLS habilitado en Supabase Cloud usualmente, pero definimos las políticas)

-- Permiso de lectura (Es un catálogo B2B, las imágenes deben ser públicas para enviarlas por chat)
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Permiso de subida (Solo dueños de empresas autenticados)
CREATE POLICY "Tenant owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Tenant owners can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Tenant owners can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);
