-- User profiles with plan info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  request_limit INTEGER NOT NULL DEFAULT 1000,
  endpoint_limit INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly usage tracking
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Request logs for detailed analytics (optional, can be disabled for cost savings)
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_request_logs_endpoint ON request_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_date ON request_logs(user_id, created_at);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS for usage
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- RLS for request_logs
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own request logs"
  ON request_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment usage (called by edge function)
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, limit_count INTEGER, is_allowed BOOLEAN) AS $$
DECLARE
  v_month TEXT := to_char(now(), 'YYYY-MM');
  v_current INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user's limit
  SELECT request_limit INTO v_limit FROM profiles WHERE id = p_user_id;
  IF v_limit IS NULL THEN
    v_limit := 1000; -- Default free tier
  END IF;

  -- Upsert usage record and increment
  INSERT INTO usage (user_id, month, request_count)
  VALUES (p_user_id, v_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    request_count = usage.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO v_current;

  RETURN QUERY SELECT v_current, v_limit, v_current <= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Plan definitions (for reference)
COMMENT ON TABLE profiles IS 'Plan limits: free=1000 req/mo + 5 endpoints, pro=100000 req/mo + unlimited endpoints, enterprise=custom';
