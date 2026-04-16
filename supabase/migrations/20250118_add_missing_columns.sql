-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'efectivo';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS credit_due_date DATE;
