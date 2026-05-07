-- Add customer_id to orders table for personalized notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Add customer_email to orders for easier lookup
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Create index for faster customer lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Update push_subscriptions to support customer-specific notifications
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE CASCADE;

-- Create index for customer subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_customer_id ON push_subscriptions(customer_id);

-- Function to send personalized notifications
CREATE OR REPLACE FUNCTION send_customer_notification(
    customer_email_param TEXT,
    notification_title TEXT,
    notification_body TEXT,
    notification_type TEXT DEFAULT 'order_update'
)
RETURNS BOOLEAN AS $$
DECLARE
    customer_id_val UUID;
BEGIN
    -- Get customer ID from email
    SELECT id INTO customer_id_val 
    FROM customers 
    WHERE email = customer_email_param AND is_active = true;
    
    IF customer_id_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check notification preferences
    IF notification_type = 'order_update' AND 
       NOT EXISTS (
         SELECT 1 FROM customers 
         WHERE id = customer_id_val 
         AND (notification_preferences->>'order_updates')::boolean = true
       ) THEN
        RETURN FALSE;
    END IF;
    
    IF notification_type = 'credit_status' AND 
       NOT EXISTS (
         SELECT 1 FROM customers 
         WHERE id = customer_id_val 
         AND (notification_preferences->>'credit_status')::boolean = true
       ) THEN
        RETURN FALSE;
    END IF;
    
    -- Send notification to all customer's subscriptions
    INSERT INTO notification_queue (customer_id, title, body, type, created_at)
    VALUES (customer_id_val, notification_title, notification_body, notification_type, NOW());
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create notification_queue table for managing notifications
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'order_update',
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for notification queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Policies for notification queue
CREATE POLICY "Allow insert notifications" 
    ON notification_queue FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow admins to read notifications" 
    ON notification_queue FOR SELECT 
    USING (true);

CREATE POLICY "Allow admins to update notifications" 
    ON notification_queue FOR UPDATE 
    USING (true);

-- Create indexes for notification queue
CREATE INDEX IF NOT EXISTS idx_notification_queue_customer_id ON notification_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_sent ON notification_queue(sent);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON notification_queue(created_at);
