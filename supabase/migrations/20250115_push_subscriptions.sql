-- Create push_subscriptions table for Web Push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create subscriptions (needed for customers)
CREATE POLICY "Allow insert push_subscriptions" 
    ON push_subscriptions FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to read subscriptions (needed for admin to notify customers)
CREATE POLICY "Allow select push_subscriptions" 
    ON push_subscriptions FOR SELECT 
    USING (true);

-- Allow update on conflict
CREATE POLICY "Allow update push_subscriptions" 
    ON push_subscriptions FOR UPDATE 
    USING (true);

-- Allow delete
CREATE POLICY "Allow delete push_subscriptions" 
    ON push_subscriptions FOR DELETE 
    USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_type 
    ON push_subscriptions(user_type);
