import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for Client Components.
 * Uses only the anon key (public, safe for browser). RLS applies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
