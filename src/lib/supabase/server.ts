// This file can be removed if no server-side client is needed outside of actions.
// For simplicity, we can reuse the client creation logic.
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'

// Note: This server client does not have user context automatically.
// User identity must be managed manually (e.g., by passing user ID to functions).
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
       auth: {
        // We are using a manual auth system, so we disable automatic session management
        // on the server client.
        autoRefreshToken: false,
        persistSession: false
       }
    }
  )
}
