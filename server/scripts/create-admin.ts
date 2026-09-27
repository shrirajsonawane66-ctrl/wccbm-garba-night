import { createClient } from '@supabase/supabase-js';
import { config } from '../config.ts';

export async function main() {
  const [email, password, roleArg] = process.argv.slice(2);
  const role = (roleArg || 'admin') === 'scanner' ? 'scanner' : 'admin';

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> [admin|scanner]');
    process.exit(1);
  }

  const url = config.supabaseUrl;
  const key = config.serviceRoleKey;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env first.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // 1) create the auth user (or reuse if already present)
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Could not list users:', listError.message);
    process.exit(1);
  }
  let userId = existing.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;

  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error('Could not create user:', createError.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log('Created Supabase Auth user:', email);
  } else {
    console.log('Auth user already exists:', email);
  }

  // 2) upsert the role in admin_users
  const { error: upsertError } = await supabase.from('admin_users').upsert(
    { user_id: userId, role, display_name: email },
    { onConflict: 'user_id' },
  );
  if (upsertError) {
    console.error('Could not set admin role:', upsertError.message);
    process.exit(1);
  }

  console.log(`Role "${role}" assigned to ${email}. They can log in at /admin.`);
}

main();