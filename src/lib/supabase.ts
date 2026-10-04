import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase yapılandırması eksik: VITE_SUPABASE_URL ve VITE_SUPABASE_PUBLISHABLE_KEY tanımlanmalı.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
