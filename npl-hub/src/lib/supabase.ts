import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser client ────────────────────────────────────────────────────────────
// Safe to import in Client Components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);