-- Migration: 20260308000900_create_match_knowledge_rpc
-- Description: RPC para ejecutar la búsqueda de similitud coseno B2B respetando el Tenant RLS.

CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_bot_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
    AND (p_bot_id IS NULL OR kc.bot_id = p_bot_id OR kc.bot_id IS NULL)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
