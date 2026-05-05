-- Add late_fee column to orders table for automatic late payment fee
ALTER TABLE orders ADD COLUMN IF NOT EXISTS late_fee DECIMAL(10,2) DEFAULT 0;

-- Add delivery_date column to orders table for delivery scheduling
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- Add late_fee_notified column to track if customer was notified about late fee
ALTER TABLE orders ADD COLUMN IF NOT EXISTS late_fee_notified BOOLEAN DEFAULT FALSE;
