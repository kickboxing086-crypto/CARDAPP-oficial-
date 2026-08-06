-- Run this in your Supabase SQL Editor

-- 1. Create a stores table
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  password TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  orders JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at_local BIGINT,
  last_saved_to_firestore BIGINT -- keeping for compatibility during migration
);

-- 2. Create transactions table for the Super Admin billing
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  store_name TEXT,
  plan_type TEXT,
  amount NUMERIC(10, 2),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Set up Row Level Security (RLS) if needed, but for now we can enable read access or leave it unrestricted for the backend to use the Service Role key
-- (The backend Express server uses the Service Role key to bypass RLS, or you can configure RLS for client-side access)

