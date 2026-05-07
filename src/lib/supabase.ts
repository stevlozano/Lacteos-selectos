import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqpnbcikisxlwbxwblyc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcG5iY2lraXN4bHdieHdibHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjc1OTIsImV4cCI6MjA5MTc0MzU5Mn0.hwAGjzc6eKUBL76PgAXCYbG2Z7Og7TGOeMast7ObD_M';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'Accept': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
