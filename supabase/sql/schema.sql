-- ============================================================
-- BudgetBuddy Database Setup
-- Combined SQL Schema + RLS + Extra Tables
-- ============================================================

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('Free', 'Pro', 'Business');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE goal_status AS ENUM ('Active', 'Completed', 'Failed', 'Overdue');
CREATE TYPE transaction_type AS ENUM ('Spending', 'Saving');
CREATE TYPE transaction_category AS ENUM ('Food', 'Transport', 'Bills', 'Entertainment', 'Other');
CREATE TYPE currency_type AS ENUM ('USD', 'LBP');
CREATE TYPE usage_metric AS ENUM ('transactions', 'goals', 'salaries', 'team_members');


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subscription_tier subscription_tier DEFAULT 'Free',
  stripe_customer_id TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency currency_type DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category transaction_category NOT NULL,
  user_category TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency currency_type NOT NULL DEFAULT 'USD',
  type transaction_type NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- GOALS
-- ============================================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  target_currency currency_type NOT NULL DEFAULT 'USD',
  current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  status goal_status DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- SALARIES
-- ============================================================

CREATE TABLE salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salary_name TEXT,
  company_name TEXT,
  base_salary DECIMAL(12,2) NOT NULL CHECK (base_salary > 0),
  currency currency_type NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);


-- ============================================================
-- SALARY ALLOCATIONS
-- ============================================================

CREATE TABLE salary_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_id UUID NOT NULL REFERENCES salaries(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  allocated_amount DECIMAL(12,2) NOT NULL CHECK (allocated_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_salary_category UNIQUE(salary_id, category)
);


-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status subscription_status DEFAULT 'active',
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- USAGE TRACKING
-- ============================================================

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric usage_metric NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_metric_period UNIQUE(user_id, metric, period_start, period_end)
);


-- ============================================================
-- USER ACTIVITY LOGS
-- ============================================================

CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- ERROR LOGS
-- ============================================================

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- USERS POLICIES
-- ============================================================

CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- TRANSACTIONS POLICIES
-- ============================================================

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- GOALS POLICIES
-- ============================================================

CREATE POLICY "Users can view own goals"
ON goals FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goals"
ON goals FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
ON goals FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- SALARIES POLICIES
-- ============================================================

CREATE POLICY "Users can view own salaries"
ON salaries FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own salaries"
ON salaries FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own salaries"
ON salaries FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own salaries"
ON salaries FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- SALARY ALLOCATIONS POLICIES
-- ============================================================

CREATE POLICY "Users can view own salary allocations"
ON salary_allocations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM salaries
    WHERE salaries.id = salary_allocations.salary_id
    AND salaries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own salary allocations"
ON salary_allocations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM salaries
    WHERE salaries.id = salary_allocations.salary_id
    AND salaries.user_id = auth.uid()
  )
);


-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================

CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE USING (user_id = auth.uid());


-- ============================================================
-- USAGE TRACKING POLICIES
-- ============================================================

CREATE POLICY "Users can view own usage"
ON usage_tracking FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage"
ON usage_tracking FOR INSERT WITH CHECK (user_id = auth.uid());


-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE POLICY "Users can view own activity logs"
ON user_activity_logs FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs"
ON user_activity_logs FOR INSERT WITH CHECK (true);


-- ============================================================
-- ERROR LOGS
-- ============================================================

CREATE POLICY "Users can view own error logs"
ON error_logs FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert error logs"
ON error_logs FOR INSERT WITH CHECK (true);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_deadline ON goals(deadline);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

CREATE INDEX idx_salaries_user_id ON salaries(user_id);
CREATE INDEX idx_salaries_created_at ON salaries(created_at DESC);

CREATE INDEX idx_salary_allocations_salary_id ON salary_allocations(salary_id);
CREATE INDEX idx_salary_allocations_category ON salary_allocations(category);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start DESC);

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);


-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salaries_updated_at
BEFORE UPDATE ON salaries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_allocations_updated_at
BEFORE UPDATE ON salary_allocations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- AUTH SIGNUP HANDLER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STORAGE BUCKET NOTES
-- ============================================================

-- Bucket: avatars (private)
-- Bucket: reports (private)
-- Bucket: receipts (private)


-- ============================================================
-- CUSTOM CATEGORIES
-- ============================================================

CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'saving', 'allocation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_category_type UNIQUE(user_id, name, type)
);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom categories"
ON custom_categories FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own custom categories"
ON custom_categories FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own custom categories"
ON custom_categories FOR DELETE
USING (user_id = auth.uid());

CREATE INDEX idx_custom_categories_user_id
ON custom_categories(user_id);


-- ============================================================
-- SYSTEM CONFIGURATION
-- ============================================================

CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view system config
CREATE POLICY "Authenticated users can view system config"
ON system_config FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Initial configuration data
INSERT INTO system_config (key, value, description)
VALUES ('exchange_rate_lbp_usd', '89699.58', 'The current exchange rate for LBP to USD');

CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON system_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
