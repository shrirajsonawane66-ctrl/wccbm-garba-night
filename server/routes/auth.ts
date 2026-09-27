import { Router, Request, Response } from 'express';
import { serviceRole, adminAuth, config } from '../supabase.ts';
import { requireStudent, StudentContext } from '../student-auth.ts';

const router = Router();

const NAME_RE = /^[A-Za-z][A-Za-z .'-]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_RE = /^[A-Za-z0-9\-/._]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

interface SignupBody {
  fullName?: string;
  studentId?: string;
  email?: string;
  mobile?: string;
  course?: string;
  year?: string;
  division?: string;
  password?: string;
}

function buildPayload(ctx: StudentContext) {
  const p = ctx.profile;
  const pass = ctx.pass;
  return {
    user: {
      uid: ctx.uid,
      email: ctx.email,
      name: p?.full_name || '',
    },
    profile: {
      student_id: p?.student_id || '',
      full_name: p?.full_name || '',
      email: p?.email || null,
      mobile: p?.mobile || '',
      course: p?.course || '',
      year: p?.year || '',
      division: p?.division || null,
    },
    pass: pass
      ? {
          pass_id: pass.pass_id,
          qr_token: pass.qr_token,
          status: pass.status,
          event_name: pass.event_name,
          event_date: pass.event_date,
          venue: pass.venue,
          issued_at: pass.issued_at,
          expires_at: pass.expires_at,
          scanned_at: pass.scanned_at,
          scanned_by: pass.scanned_by,
        }
      : null,
  };
}

async function loadStudentByUid(uid: string): Promise<StudentContext | null> {
  const { data: student } = await serviceRole
    .from('students')
    .select('*, e_passes(*)')
    .eq('user_id', uid)
    .maybeSingle();
  if (!student) return null;
  const pass = Array.isArray(student.e_passes) ? student.e_passes[0] : student.e_passes || null;
  return {
    uid,
    email: student.email || undefined,
    profile: student,
    pass,
  };
}

// ---- Sign up: open registration -> create Auth user -> profile -> ONE E-Pass ----
router.post('/signup', async (req: Request, res: Response) => {
  const b = (req.body || {}) as SignupBody;

  const fullName = (b.fullName || '').trim();
  const studentId = (b.studentId || '').trim().toUpperCase();
  const email = (b.email || '').trim().toLowerCase();
  const mobile = (b.mobile || '').trim().replace(/[\s-]/g, '');
  const course = (b.course || '').trim();
  const year = (b.year || '').trim();
  const division = (b.division || '').trim() || null;
  const password = String(b.password || '');

  // ---- server-side validation (never trust the frontend) ----
  if (!NAME_RE.test(fullName) || fullName.length < 3) {
    return res.status(422).json({ error: 'Please enter your full name as on ID card (letters only, min 3).' });
  }
  if (!STUDENT_ID_RE.test(studentId)) {
    return res.status(422).json({ error: 'Student ID is required and can contain only letters, numbers, dashes, slashes.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(422).json({ error: 'Enter a valid college email address.' });
  }
  if (!MOBILE_RE.test(mobile)) {
    return res.status(422).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
  }
  if (!course || !year) {
    return res.status(422).json({ error: 'Course and year are required.' });
  }
  if (!PASSWORD_RE.test(password)) {
    return res.status(422).json({
      error: 'Password must be at least 8 characters, with one uppercase letter, one lowercase letter and one number.',
    });
  }

  try {
    // ---- 1) duplicate protection (one Student ID / one email = one account) ----
    const { data: existingByStudent } = await serviceRole
      .from('students')
      .select('user_id')
      .eq('student_id', studentId)
      .maybeSingle();
    if (existingByStudent?.user_id) {
      return res.status(409).json({ error: 'An account already exists for this Student ID. Please log in instead.' });
    }

    const { data: existingByEmail } = await serviceRole
      .from('students')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();
    if (existingByEmail?.user_id) {
      return res.status(409).json({ error: 'An account already exists for this email. Please log in instead.' });
    }

    // ---- 2) create the Supabase Auth account (passwords live in Supabase) ----
    const { data: created, error: createError } = await serviceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: !config.emailVerificationRequired,
    });

    if (createError) {
      if (/already registered|already been registered|user already/i.test(createError.message)) {
        return res.status(409).json({ error: 'An account already exists for this email. Please log in instead.' });
      }
      return res.status(500).json({ error: 'Could not create your account. Please try again.' });
    }

    const uid = created.user.id;

    // ---- 3) profile + exactly one E-Pass (atomic, idempotent RPC) ----
    const { data: result, error: rpcError } = await serviceRole.rpc('finalize_registration', {
      p_user_id: uid,
      p_student_id: studentId,
      p_full_name: fullName,
      p_email: email,
      p_mobile: mobile,
      p_course: course,
      p_year: year,
      p_division: division,
      p_event_name: config.eventName,
      p_event_date: config.eventDate,
      p_venue: config.venue,
      p_expires_at: new Date(config.eventEndIso).toISOString(),
    });

    if (rpcError || !result?.ok) {
      await serviceRole.auth.admin.deleteUser(uid).catch(() => {});
      console.error('finalize_registration failed:', rpcError?.message || result?.message);
      return res.status(500).json({ error: 'Could not finish setting up your account. Please try again.' });
    }

    const studentCtx = await loadStudentByUid(uid);
    const payload = studentCtx ? buildPayload(studentCtx) : null;

    if (config.emailVerificationRequired) {
      return res.status(201).json({
        ok: true,
        email_verification_required: true,
        message: 'Please verify your college email before continuing.',
        ...(payload || {}),
      });
    }

    // ---- 4) create a session so the new student lands straight on /dashboard ----
    const { data: session } = await adminAuth.auth.signInWithPassword({ email, password });

    if (!session?.session) {
      return res.status(201).json({ ok: true, message: 'Account created. Please log in.', ...(payload || {}) });
    }

    res.status(201).json({
      ok: true,
      message: 'Account created and E-Pass issued.',
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
      expires_at: session.session.expires_at,
      ...(payload || {}),
    });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'Unexpected server error. Please try again.' });
  }
});

// ---- Login (email + password against Supabase Auth) ----
router.post('/login', async (req: Request, res: Response) => {
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  const password = String((req.body || {}).password || '');
  if (!email || !password) {
    return res.status(422).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await adminAuth.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      if (error?.message && /confirm/i.test(error.message)) {
        return res.status(403).json({ error: 'Please verify your college email before logging in.' });
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const ctx = await loadStudentByUid(data.user.id);
    if (!ctx) {
      return res.status(403).json({ error: 'This account is not linked to a student profile. Please sign up.' });
    }

    res.json({
      ok: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      ...buildPayload(ctx),
    });
  } catch (err) {
    console.error('student login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ---- Current student session (used on /dashboard load) ----
router.get('/me', requireStudent, (req: Request, res: Response) => {
  res.json({ ok: true, ...buildPayload(req.studentCtx!) });
});

// ---- Logout (client clears its stored token) ----
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;