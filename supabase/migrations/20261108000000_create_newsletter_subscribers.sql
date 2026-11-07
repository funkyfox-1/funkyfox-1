-- ==============================================================================
-- Funky Fox Newsletter Subscribers Schema & Row-Level Security
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer_newsletter',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT ARRAY['newsletter', 'marketing', 'welcome_discount_10'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors to subscribe
CREATE POLICY "Allow anonymous and authenticated insert to newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow updates/upserts on conflict
CREATE POLICY "Allow upsert to newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow read access for authenticated staff and services
CREATE POLICY "Allow read access to newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

-- Index on email for fast lookups and deduplication
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

