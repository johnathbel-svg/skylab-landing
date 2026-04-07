-- Migration: 20260308000800_alter_vector_dimensions
-- Description: Ampliar la capacidad de la tabla knowledge_chunks a 3072 dimensiones para soportar gemini-embedding-001 de manera nativa sin perder precisión geométrica.

-- 1. Eliminar el índice antiguo de 768 dimensiones (no soportado para 3072d)
DROP INDEX IF EXISTS public.knowledge_chunks_embedding_idx;

-- 2. Alterar la columna "embedding" de 768 a 3072 de manera segura
ALTER TABLE public.knowledge_chunks 
ALTER COLUMN embedding TYPE vector(3072);

-- NOTA: No se recrea el índice HNSW dado que supabase/pgvector 
-- restringe los índices a 2000 dimensiones.
-- El buscador hará una "Búsqueda Científica Exacta" (Sequential Scan) que soporta hasta 16,000D
-- y es extremadamente rápida para volúmenes pequeños/medianos.
