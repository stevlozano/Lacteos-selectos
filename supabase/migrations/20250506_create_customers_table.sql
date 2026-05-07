-- Create customers table for user registration and management
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB DEFAULT '{"order_updates": true, "credit_status": true, "promotions": false}'::jsonb
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers table
CREATE POLICY "Allow insert customers" 
    ON customers FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow customers to read own data" 
    ON customers FOR SELECT 
    USING (auth.uid()::text = email OR email = current_setting('app.current_customer_email', true));

CREATE POLICY "Allow customers to update own data" 
    ON customers FOR UPDATE 
    USING (auth.uid()::text = email OR email = current_setting('app.current_customer_email', true))
    WITH CHECK (auth.uid()::text = email OR email = current_setting('app.current_customer_email', true));

CREATE POLICY "Allow admins full access" 
    ON customers FOR ALL 
    USING (true);

-- Create user_activity_log table for tracking login/logout
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'register')),
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activity log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for activity log
CREATE POLICY "Allow insert activity logs" 
    ON user_activity_log FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow admins to read all activity logs" 
    ON user_activity_log FOR SELECT 
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_customer_id ON user_activity_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_log(timestamp);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
