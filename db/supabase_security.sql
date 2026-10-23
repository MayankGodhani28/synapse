-- Execute in Supabase SQL editor only after reviewing the canonical schema.
-- Browser clients do not directly query these app tables; Express uses PostgreSQL.
-- Deny data API access by default unless explicitly authorized later.
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_key_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.users, public.api_keys, public.api_key_users,
  public.memories, public.embeddings, public.tags FROM anon, authenticated;
