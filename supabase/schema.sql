-- ============================================================================
-- Western College Garba & Dandiya Night 2026 — E-Pass System
-- Run this SQL in the Supabase SQL Editor (once per project).
-- Tables, constraints, atomic RPC functions, and Row Level Security.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Students / registered users (one row per student)
create table if not exists public.students (
  id                       uuid primary key default gen_random_uuid(),
  student_id               text not null unique,                 -- roll number / student ID
  full_name                text not null,
  email                    text,
  mobile                   text not null unique,                 -- one mobile = one student / pass
  course                   text not null,
  year                     text not null,
  division                 text,
  dandiya_pair_requested   boolean not null default false,
  created_at               timestamptz not null default now()
);

-- Admin / scanner users (link to Supabase Auth users)
create table if not exists public.admin_users (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  role           text not null check (role in ('admin', 'scanner')),
  display_name   text,
  created_at     timestamptz not null default now()
);

-- E-Passes (ONE per student — enforced by UNIQUE(student_id))
create table if not exists public.e_passes (
  id                 uuid primary key default gen_random_uuid(),
  pass_id            text not null unique,                       -- display id, e.g. WC-8F3A2B
  student_id         uuid not null unique references public.students (id) on delete cascade,
  qr_token           text not null unique,                       -- cryptographically random token
  qr_token_hash      text not null unique,                       -- sha256 hex of qr_token
  status             text not null default 'ACTIVE'
                       check (status in ('ACTIVE','USED','EXPIRED','CANCELLED')),
  event_name         text not null default 'Garba & Dandiya Night 2026',
  event_date         text,
  venue              text not null default 'Western College Main Quadrangle',
  issued_at          timestamptz not null default now(),
  scanned_at         timestamptz,
  scanned_by         uuid references auth.users (id) on delete set null,
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Audit log of every QR scan attempt
create table if not exists public.scan_logs (
  id                   uuid primary key default gen_random_uuid(),
  pass_id              uuid references public.e_passes (id) on delete set null,
  scanned_by           uuid references auth.users (id) on delete set null,
  scan_result          text not null,
  scanned_at           timestamptz not null default now(),
  device_information   text,
  created_at           timestamptz not null default now()
);

create index if not exists idx_e_passes_status  on public.e_passes (status);
create index if not exists idx_e_passes_student on public.e_passes (student_id);
create index if not exists idx_scan_logs_pass   on public.scan_logs (pass_id);
create index if not exists idx_scan_logs_time   on public.scan_logs (scanned_at desc);

-- ============================================================================
-- ATOMIC RPC FUNCTIONS (server uses these with the service role key)
-- ============================================================================

-- Helper: is the current auth user an admin or scanner?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  );
$$;

-- Register a student and issue EXACTLY ONE pass.
-- - One student = one pass (UNIQUE constraint + atomic function).
-- - If a pass already exists it is returned (removed: no duplicate pass).
-- - The raw token is stored (DB protected by RLS) together with its hash.
create or replace function public.register_pass(
  p_full_name          text,
  p_student_id         text,
  p_email              text,
  p_mobile             text,
  p_course             text,
  p_year               text,
  p_division           text,
  p_dandiya_pair       boolean,
  p_event_name         text,
  p_event_date         text,
  p_venue              text,
  p_expires_at         timestamptz,
  p_capacity_limit     integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student        public.students%rowtype;
  v_pass           public.e_passes%rowtype;
  v_token          text;
  v_hash           text;
  v_pass_id        text;
  v_count          bigint;
  v_mobile         text;
  v_dup            public.students%rowtype;
begin
  v_mobile := regexp_replace(coalesce(p_mobile, ''), '[^0-9]', '', 'g');

  -- capacity guard (optional)
  select count(*) into v_count from public.e_passes;
  if p_capacity_limit > 0 and v_count >= p_capacity_limit then
    return jsonb_build_object('created', false, 'full', true, 'message', 'All E-Passes have been claimed.');
  end if;

  -- find the student by roll number (do not insert yet)
  select * into v_student from public.students
   where student_id = upper(trim(p_student_id));

  -- one mobile = one student: reject BEFORE any insert (avoids unique violation
  -- and lets the owner reuse their own row when re-displaying their pass)
  if v_student.id is not null then
    select * into v_dup from public.students
     where mobile = v_mobile and id <> v_student.id
     limit 1;
  else
    select * into v_dup from public.students
     where mobile = v_mobile limit 1;
  end if;
  if v_dup.id is not null then
    return jsonb_build_object(
      'created',         false,
      'duplicate_mobile', true,
      'message',         'This mobile number already has an E-Pass. One E-Pass per mobile number.'
    );
  end if;

  -- create the student only if the roll number is new
  if v_student.id is null then
    insert into public.students
      (student_id, full_name, email, mobile, course, year, division, dandiya_pair_requested)
    values
      (upper(trim(p_student_id)), p_full_name, p_email, v_mobile, p_course, p_year, p_division, coalesce(p_dandiya_pair, false))
    on conflict (student_id) do nothing
    returning * into v_student;
    if v_student.id is null then
      select * into v_student from public.students
       where student_id = upper(trim(p_student_id));
    end if;
  end if;

  -- existing pass? do NOT create a second one.
  -- Return it ONLY to the person holding the registered mobile number.
  select * into v_pass from public.e_passes where student_id = v_student.id;
  if v_pass.id is not null then
    if v_student.mobile <> v_mobile then
      return jsonb_build_object(
        'created',       false,
        'denied_mobile', true,
        'message',       'An E-Pass already exists for this Student ID. Only the registered mobile number can view it.'
      );
    end if;
    return jsonb_build_object(
      'created',        false,
      'alreadyIssued',  true,
      'message',        'You already have an E-Pass.',
      'pass_id',        v_pass.pass_id,
      'qr_token',       v_pass.qr_token,
      'status',         v_pass.status,
      'event_name',     v_pass.event_name,
      'event_date',     v_pass.event_date,
      'venue',          v_pass.venue,
      'issued_at',      v_pass.issued_at,
      'expires_at',     v_pass.expires_at,
      'student', jsonb_build_object(
        'student_id', v_student.student_id,
        'full_name',  v_student.full_name,
        'email',      v_student.email,
        'mobile',     v_student.mobile,
        'course',     v_student.course,
        'year',       v_student.year,
        'division',   v_student.division,
        'dandiya_pair_requested', v_student.dandiya_pair_requested
      )
    );
  end if;

  -- generate a unique high-entropy token (32 random bytes, URL-safe base64)
  loop
    v_token := encode(gen_random_bytes(32), 'base64');
    v_token := translate(v_token, '+/', '-_');
    v_token := rtrim(v_token, '=');
    v_hash  := encode(digest(v_token, 'sha256'), 'hex');
    exit when not exists (select 1 from public.e_passes where qr_token = v_token or qr_token_hash = v_hash);
  end loop;

  -- generate a unique display pass id
  loop
    v_pass_id := 'WC-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 7));
    exit when not exists (select 1 from public.e_passes where pass_id = v_pass_id);
  end loop;

  insert into public.e_passes
    (pass_id, student_id, qr_token, qr_token_hash, status, event_name, event_date, venue, expires_at)
  values
    (v_pass_id, v_student.id, v_token, v_hash, 'ACTIVE', p_event_name, p_event_date, p_venue, p_expires_at)
  returning * into v_pass;

  return jsonb_build_object(
    'created',        true,
    'alreadyIssued',  false,
    'message',        'E-Pass issued successfully.',
    'pass_id',        v_pass.pass_id,
    'qr_token',       v_pass.qr_token,
    'status',         v_pass.status,
    'event_name',     v_pass.event_name,
    'event_date',     v_pass.event_date,
    'venue',          v_pass.venue,
    'issued_at',      v_pass.issued_at,
    'expires_at',     v_pass.expires_at,
    'student', jsonb_build_object(
      'student_id', v_student.student_id,
      'full_name',  v_student.full_name,
      'email',      v_student.email,
      'mobile',     v_student.mobile,
      'course',     v_student.course,
      'year',       v_student.year,
      'division',   v_student.division,
      'dandiya_pair_requested', v_student.dandiya_pair_requested
    )
  );
end;
$$;

-- ATOMIC single-use verification.
-- The UPDATE consumes the pass and ONLY returns a row for a valid, unused,
-- un-expired pass. Two admins scanning simultaneously: only the first wins.
create or replace function public.consume_pass(
  p_qr_token  text,
  p_scanned_by uuid,
  p_device    text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_pass     public.e_passes%rowtype;
  v_student  public.students%rowtype;
  v_hash     text;
  v_admin    text;
begin
  v_hash := encode(digest(coalesce(p_qr_token,''), 'sha256'), 'hex');

  -- single atomic statement = single-use guarantee
  update public.e_passes
     set status     = 'USED',
         scanned_at = now(),
         scanned_by = p_scanned_by,
         updated_at = now()
   where qr_token_hash = v_hash
     and status = 'ACTIVE'
     and (expires_at is null or expires_at > now())
  returning * into v_pass;

  if found then
    select * into v_student from public.students where id = v_pass.student_id;
    insert into public.scan_logs (pass_id, scanned_by, scan_result, device_information)
    values (v_pass.id, p_scanned_by, 'VALID_SCAN', p_device);
    return jsonb_build_object(
      'result', 'VALID_SCAN',
      'message', '✓ VALID E-PASS',
      'pass_id', v_pass.pass_id,
      'scanned_at', v_pass.scanned_at,
      'scanned_by', p_scanned_by,
      'student', jsonb_build_object(
        'student_id', v_student.student_id,
        'full_name',  v_student.full_name,
        'course',     v_student.course,
        'year',       v_student.year,
        'division',   v_student.division,
        'event_name', v_pass.event_name,
        'event_date', v_pass.event_date,
        'venue',      v_pass.venue
      )
    );
  end if;

  -- not consumed -> classify the reason
  select * into v_pass from public.e_passes where qr_token_hash = v_hash;
  if not found then
    insert into public.scan_logs (scanned_by, scan_result, device_information)
    values (p_scanned_by, 'INVALID_TOKEN', p_device);
    return jsonb_build_object('result', 'INVALID_TOKEN', 'message', 'INVALID E-PASS');
  end if;

  if v_pass.status = 'CANCELLED' then
    insert into public.scan_logs (pass_id, scanned_by, scan_result, device_information)
    values (v_pass.id, p_scanned_by, 'CANCELLED', p_device);
    return jsonb_build_object('result', 'CANCELLED', 'message', 'PASS CANCELLED', 'pass_id', v_pass.pass_id);
  end if;

  if v_pass.status = 'USED' then
    select display_name into v_admin from public.admin_users where user_id = v_pass.scanned_by;
    select * into v_student from public.students where id = v_pass.student_id;
    insert into public.scan_logs (pass_id, scanned_by, scan_result, device_information)
    values (v_pass.id, p_scanned_by, 'ALREADY_USED', p_device);
    return jsonb_build_object(
      'result', 'ALREADY_USED',
      'message', 'PASS ALREADY USED',
      'pass_id', v_pass.pass_id,
      'first_scanned_at', v_pass.scanned_at,
      'first_scanned_by', v_admin,
      'student', jsonb_build_object(
        'student_id', v_student.student_id,
        'full_name',  v_student.full_name,
        'course',     v_student.course,
        'year',       v_student.year,
        'division',   v_student.division
      )
    );
  end if;

  if v_pass.expires_at is not null and v_pass.expires_at <= now() then
    update public.e_passes set status = 'EXPIRED', updated_at = now() where id = v_pass.id;
    insert into public.scan_logs (pass_id, scanned_by, scan_result, device_information)
    values (v_pass.id, p_scanned_by, 'EXPIRED', p_device);
    return jsonb_build_object('result', 'EXPIRED', 'message', 'PASS EXPIRED', 'pass_id', v_pass.pass_id);
  end if;

  -- fallback (should be unreachable)
  insert into public.scan_logs (pass_id, scanned_by, scan_result, device_information)
  values (v_pass.id, p_scanned_by, 'INVALID_TOKEN', p_device);
  return jsonb_build_object('result', 'INVALID_TOKEN', 'message', 'INVALID E-PASS');
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.students    enable row level security;
alter table public.e_passes    enable row level security;
alter table public.scan_logs   enable row level security;
alter table public.admin_users enable row level security;

-- Remove risky default grants on our application tables.
revoke all on public.students  from anon, authenticated;
revoke all on public.e_passes  from anon, authenticated;
revoke all on public.scan_logs from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

-- Students / passes are readable only by verified admins (via service backed API too).
grant select on public.students, public.e_passes, public.admin_users to authenticated;

-- Admin/scanner can read student & pass rows (RLS gates this below).
drop policy if exists "admins_can_read_students" on public.students;
create policy "admins_can_read_students" on public.students
  for select to authenticated using (public.is_admin());

drop policy if exists "admins_can_read_passes" on public.e_passes;
create policy "admins_can_read_passes" on public.e_passes
  for select to authenticated using (public.is_admin());

-- Admin users can always see their own profile row.
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own" on public.admin_users
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "admins_can_read_scan_logs" on public.scan_logs;
create policy "admins_can_read_scan_logs" on public.scan_logs
  for select to authenticated using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies exist for authenticated on students,
-- e_passes, or scan_logs -> those operations are DENIED by default.
-- The service-role backed API is the only path that mutates these tables.

-- ============================================================================
-- RPC FUNCTION EXECUTION ACCESS
-- Only the service-role key (used by the Express server) may call the atomic
-- functions. Anonymous and authenticated (student) roles are REVOKED.
-- ============================================================================
revoke execute on function public.register_pass(text, text, text, text, text, text, text, boolean, text, text, text, timestamptz, integer) from anon, authenticated, public;
revoke execute on function public.consume_pass(text, uuid, text) from anon, authenticated, public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.register_pass(text, text, text, text, text, text, text, boolean, text, text, text, timestamptz, integer) to service_role;
grant execute on function public.consume_pass(text, uuid, text) to service_role;

-- ============================================================================
-- STUDENT ACCOUNT AUTHENTICATION (Supabase Auth)
-- Added on top of the original schema for the Sign Up -> Login -> Dashboard
-- -> E-Pass flow. Idempotent, safe to re-run.
-- ============================================================================

-- Link each student to exactly ONE Supabase Auth user (one account per student).
alter table public.students add column if not exists user_id uuid references auth.users (id) on delete cascade;
create unique index if not exists students_user_id_key on public.students (user_id) where user_id is not null;
create unique index if not exists students_email_key on public.students (email) where email is not null;
create index if not exists idx_students_user_id on public.students (user_id);

-- e_passes also carry the owner's auth user id; UNIQUE => one user cannot own two passes.
alter table public.e_passes add column if not exists user_id uuid references auth.users (id) on delete cascade;
create unique index if not exists e_passes_user_id_key on public.e_passes (user_id) where user_id is not null;

-- Password-recovery OTP mailbox (service-role only). OTP is stored hashed,
-- single-use, expires, has an attempt cap, and is rate limited in the API.
create table if not exists public.password_reset_otps (
  id           uuid primary key default gen_random_uuid(),
  student_id   text not null,
  email        text not null,
  user_id      uuid references auth.users (id) on delete cascade,
  otp_hash     text not null,
  expires_at   timestamptz not null,
  attempts     integer not null default 0,
  verified     boolean not null default false,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_reset_otps_email   on public.password_reset_otps (email);
create index if not exists idx_reset_otps_student on public.password_reset_otps (student_id);

-- ============================================================================
-- ATOMIC ACCOUNT FINALIZATION  (create profile + EXACTLY ONE pass in one go)
-- Called with the service-role key after Supabase Auth created the user.
-- Idempotent: re-running never creates a second student profile or a second
-- pass. Unique constraints + `on conflict` give duplicate protection even if
-- the client double-submits, refreshes, or races multiple requests.
-- ============================================================================
create or replace function public.finalize_registration(
  p_user_id      uuid,
  p_student_id   text,
  p_full_name    text,
  p_email        text,
  p_mobile       text,
  p_course       text,
  p_year         text,
  p_division     text,
  p_event_name   text,
  p_event_date   text,
  p_venue        text,
  p_expires_at   timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student   public.students%rowtype;
  v_pass      public.e_passes%rowtype;
  v_token     text;
  v_hash      text;
  v_pass_id   text;
  v_mobile    text;
begin
  v_mobile := regexp_replace(coalesce(p_mobile, ''), '[^0-9]', '', 'g');

  -- 1) student profile (existing-owned rows are reused; legacy rows get claimed)
  select * into v_student from public.students
   where student_id = upper(trim(p_student_id));

  if v_student.id is null then
    insert into public.students
      (user_id, student_id, full_name, email, mobile, course, year, division)
    values
      (p_user_id, upper(trim(p_student_id)), p_full_name, lower(trim(p_email)),
       v_mobile, p_course, p_year, coalesce(nullif(trim(p_division), ''), null))
    on conflict (student_id) do update
      set user_id = coalesce(public.students.user_id, excluded.user_id)
    returning * into v_student;
  end if;

  if v_student.id is null then
    select * into v_student from public.students
     where student_id = upper(trim(p_student_id));
  end if;
  if v_student.id is null then
    return jsonb_build_object('ok', false, 'code', 'PROFILE_FAILED', 'message', 'Could not create your profile. Please try again.');
  end if;

  -- 2) exactly ONE E-Pass (atomic insert with a generated secure token)
  select * into v_pass from public.e_passes where student_id = v_student.id;

  if v_pass.id is null then
    loop
      v_token := translate(rtrim(encode(gen_random_bytes(32), 'base64'), '='), '+/', '-_');
      v_hash  := encode(digest(v_token, 'sha256'), 'hex');
      exit when not exists (select 1 from public.e_passes where qr_token = v_token or qr_token_hash = v_hash);
    end loop;

    loop
      v_pass_id := 'WC-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 7));
      exit when not exists (select 1 from public.e_passes where pass_id = v_pass_id);
    end loop;

    insert into public.e_passes
      (pass_id, student_id, user_id, qr_token, qr_token_hash, status,
       event_name, event_date, venue, expires_at)
    values
      (v_pass_id, v_student.id, p_user_id, v_token, v_hash, 'ACTIVE',
       p_event_name, p_event_date, p_venue, p_expires_at)
    returning * into v_pass;
  end if;

  return jsonb_build_object(
    'ok',            true,
    'alreadyIssued', true,
    'message',       'E-Pass issued successfully.',
    'pass_id',       v_pass.pass_id,
    'qr_token',      v_pass.qr_token,
    'status',        v_pass.status,
    'event_name',    v_pass.event_name,
    'event_date',    v_pass.event_date,
    'venue',         v_pass.venue,
    'issued_at',     v_pass.issued_at,
    'expires_at',    v_pass.expires_at,
    'scanned_at',    v_pass.scanned_at,
    'scanned_by',    v_pass.scanned_by,
    'student', jsonb_build_object(
      'student_id', v_student.student_id,
      'full_name',  v_student.full_name,
      'email',      v_student.email,
      'mobile',     v_student.mobile,
      'course',     v_student.course,
      'year',       v_student.year,
      'division',   v_student.division
    )
  );
end;
$$;

revoke execute on function public.finalize_registration(uuid, text, text, text, text, text, text, text, text, text, text, timestamptz) from anon, authenticated, public;
grant  execute on function public.finalize_registration(uuid, text, text, text, text, text, text, text, text, text, text, timestamptz) to service_role;

-- ============================================================================
-- RLS FOR STUDENT ACCOUNTS
-- Authenticated students may read ONLY their own profile + their own pass.
-- Everything else (insert/update/delete) stays service-role only.
-- ============================================================================

alter table public.password_reset_otps enable row level security;

revoke all on public.password_reset_otps from anon, authenticated;

drop policy if exists "students_select_own" on public.students;
create policy "students_select_own" on public.students
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "e_passes_select_own" on public.e_passes;
create policy "e_passes_select_own" on public.e_passes
  for select to authenticated using (auth.uid() = user_id);