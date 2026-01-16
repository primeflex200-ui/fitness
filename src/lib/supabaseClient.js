import { createClient } from "@supabase/supabase-js";

// Use VITE environment variables for web builds
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "YOUR_ANON_PUBLIC_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
