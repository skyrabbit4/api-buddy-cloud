-- Create endpoints table
CREATE TABLE IF NOT EXISTS endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 200,
  response_body JSONB NOT NULL DEFAULT '{}',
  delay INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_endpoints_user_id ON endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_endpoints_is_active ON endpoints(is_active);

-- Enable Row Level Security
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own endpoints
CREATE POLICY "Users can view own endpoints"
  ON endpoints FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own endpoints
CREATE POLICY "Users can create own endpoints"
  ON endpoints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own endpoints
CREATE POLICY "Users can update own endpoints"
  ON endpoints FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own endpoints
CREATE POLICY "Users can delete own endpoints"
  ON endpoints FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Anyone can read active endpoints (for mock serving)
CREATE POLICY "Anyone can read active endpoints for serving"
  ON endpoints FOR SELECT
  USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_endpoints_updated_at
  BEFORE UPDATE ON endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
