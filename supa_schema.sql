-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables and functions to cleanly apply the new 3072 dimension sizing
DROP TABLE IF EXISTS meme_history CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP FUNCTION IF EXISTS match_templates;

-- Create the templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    metadata JSONB,
    embedding vector(3072) -- Updated to natively match model output
);

-- Create the meme_history table
CREATE TABLE meme_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_prompt TEXT NOT NULL,
    ai_caption JSONB,
    image_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    template_name TEXT REFERENCES templates(name)
);

-- Create a function to search templates by vector using cosine distance
CREATE OR REPLACE FUNCTION match_templates(
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    templates.name,
    1 - (templates.embedding <=> query_embedding) AS similarity
  FROM templates
  WHERE 1 - (templates.embedding <=> query_embedding) > match_threshold
  ORDER BY templates.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
