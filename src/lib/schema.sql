-- Kept as plain SQL rather than an ORM migration tool — two small tables,
-- applied once by hand against the direct (non-pooled) connection.

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  company TEXT,
  product TEXT NOT NULL,
  price INTEGER NOT NULL, -- total contracted price, not just what's been collected
  stripe_payment_intent_id TEXT NOT NULL UNIQUE, -- the deposit charge
  deposit_amount INTEGER NOT NULL DEFAULT 0,
  balance_amount INTEGER NOT NULL DEFAULT 0,
  balance_payment_intent_id TEXT,
  balance_paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',
  project_link TEXT,
  brand_file_name TEXT,
  brand_file_url TEXT,
  current_product_link TEXT,
  current_product_file_name TEXT,
  current_product_file_url TEXT,
  dieline_file_name TEXT,
  dieline_file_url TEXT,
  inspiration_links TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  site_type TEXT,
  platform TEXT,
  sku_count INTEGER,
  revisions_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (author IN ('client', 'studio')),
  message TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revisions_project_id_idx ON revisions(project_id);
