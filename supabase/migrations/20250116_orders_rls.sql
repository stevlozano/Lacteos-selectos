-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create orders (customers don't need to authenticate)
CREATE POLICY "Allow anyone to create orders" 
    ON orders FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to read orders
CREATE POLICY "Allow anyone to read orders" 
    ON orders FOR SELECT 
    USING (true);

-- Allow anyone to update orders (for admin status changes)
CREATE POLICY "Allow anyone to update orders" 
    ON orders FOR UPDATE 
    USING (true);

-- Allow anyone to delete orders
CREATE POLICY "Allow anyone to delete orders" 
    ON orders FOR DELETE 
    USING (true);
