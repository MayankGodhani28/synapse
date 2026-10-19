-- =============================================================
-- Synapse — Database Schema
-- PostgreSQL 16 + pgvector 0.8.6
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users: Authentication for personal web app & developers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT,
  display_name TEXT,
  profile_pic TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  last_login_at TIMESTAMP
);

-- API Keys: Issued to developers and bots for integration
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  key_hash TEXT UNIQUE NOT NULL,
  app_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  last_used_at TIMESTAMP
);

-- API Key Users: Maps external apps/bots to user identifiers
CREATE TABLE IF NOT EXISTS api_key_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Memories: Raw saved content (notes, webpages, extracted chat facts)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('webpage', 'note', 'chat', 'pdf', 'selection')),
  created_at TIMESTAMP DEFAULT now()
);

-- Embeddings: Chunked text + 384-dimensional vector embedding
-- Using BAAI/bge-small-en-v1.5 (384 dims, fast on CPU & ONNX)
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384),
  created_at TIMESTAMP DEFAULT now()
);

-- Tags: Auto-generated categorization for memories
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- Indexes for vector similarity search and fast lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_memory_id ON embeddings(memory_id);
CREATE INDEX IF NOT EXISTS idx_tags_memory_id ON tags(memory_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
