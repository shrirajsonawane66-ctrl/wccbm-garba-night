import { createClient } from '@supabase/supabase-js';
import { config } from './config.ts';

if (!config.supabaseUrl || !config.serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
}

export const serviceRole = createClient(config.supabaseUrl, config.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Dedicated client for admin sign-in. Using signInWithPassword on `serviceRole`
// would store the user (authenticated) session on that shared client, downgrading
// every later service-role RPC/table call and causing "permission denied".
export const adminAuth = createClient(config.supabaseUrl, config.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export * from './config.ts';