-- Add credit_due_date column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS credit_due_date DATE;
