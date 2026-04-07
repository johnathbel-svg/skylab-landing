import { createClient } from '@supabase/supabase-js';

// Cliente con SERVICE_ROLE para bypass de RLS en Webhooks
// Si no se encuentra la key, fallará con gracia.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
