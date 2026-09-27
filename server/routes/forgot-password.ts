import crypto from 'crypto';
import { Router } from 'express';
import { serviceRole, config } from '../supabase.ts';
import { sendPasswordResetEmail } from '../mailer.ts';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_RE = /^[A-Za-z0-9\-/._]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const OTP_RE = /^\d{6}$/;

// Internal pepper used when hashing reset codes. Never exposed to the browser.
const OTP_PEPPER = 'western-college-garba-reset-v1';

const hashOtp = (code: string) => crypto.createHash('sha256').update(`${OTP_PEPPER}:${code}`).digest('hex');

interface ResetOtpRow {
  id: string;
  student_id: string;
  email: string;
  user_id: string | null;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  verified: boolean;
  used_at: string | null;
  created_at: string;
}

const GENERIC_OK = 'If the Student ID and email match a registered account, a password reset code has been sent to the registered email address.';

async function latestRequest(studentId: string, email: string): Promise<ResetOtpRow | null> {
  const { data } = await serviceRole
    .from('password_reset_otps')
    .select('*')
    .eq('student_id', studentId)
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ResetOtpRow | null) || null;
}

function secureCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ---- 1) Request a reset code (Student ID + registered college email) ----
router.post('/send', async (req, res) => {
  const studentId = String((req.body || {}).studentId || '').trim().toUpperCase();
  const email = String((req.body || {}).email || '').trim().toLowerCase();

  if (!studentId || !STUDENT_ID_RE.test(studentId)) {
    return res.status(422).json({ error: 'Enter a valid Student ID.' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(422).json({ error: 'Enter a valid email address.' });
  }

  try {
    // Look up the registered student. If Student ID + email do not match we
    // deliberately return the same neutral success message (no enumeration).
    const { data: student } = await serviceRole
      .from('students')
      .select('id, student_id, email, full_name, user_id')
      .eq('student_id', studentId)
      .maybeSingle();

    const accountMatches = !!student && !!student.user_id && normalizeEmail(student.email) === email;
    if (!accountMatches) {
      res.json({ ok: true, message: GENERIC_OK });
      return;
    }

    // Resend cooldown: block new codes within the cooldown window.
    const last = await latestRequest(studentId, email);
    if (
      last &&
      !last.used_at &&
      Date.now() - new Date(last.created_at).getTime() < config.resetOtpCooldownMs
    ) {
      const wait = Math.ceil((config.resetOtpCooldownMs - (Date.now() - new Date(last.created_at).getTime())) / 1000);
      return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.` });
    }

    // Hourly rate limit: max N reset-code emails per student per hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await serviceRole
      .from('password_reset_otps')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('email', email)
      .gte('created_at', since);
    if ((count || 0) >= config.resetOtpRateLimitPerHour) {
      return res.status(429).json({ error: 'Too many reset requests. Please try again in an hour.' });
    }

    // Generate a cryptographically secure, single-use, expiring code.
    const code = secureCode();
    const expiresAt = new Date(Date.now() + config.resetOtpTtlSeconds * 1000).toISOString();
    const { error: insErr } = await serviceRole.from('password_reset_otps').insert({
      student_id: studentId,
      email,
      user_id: student.user_id,
      otp_hash: hashOtp(code),
      expires_at: expiresAt,
      attempts: 0,
      verified: false,
    });
    if (insErr) throw insErr;

    const { sent, provider } = await sendPasswordResetEmail(email, student.full_name || 'Student', code);

    const payload: Record<string, unknown> = {
      ok: true,
      sent,
      provider,
      otp_ttl: config.resetOtpTtlSeconds,
      resend_after: Math.round(config.resetOtpCooldownMs / 1000),
      message: 'A 6-digit password reset code has been sent to your registered email.',
    };
    if (!config.isProd) payload.dev_otp = code;
    res.json(payload);
  } catch (err: any) {
    console.error('forgot send error:', err);
    res.status(500).json({ error: 'Could not send the reset code. Please try again.' });
  }
});

// ---- 2) Verify the code (marks it verified; it stays single-use) ----
router.post('/verify', async (req, res) => {
  const studentId = String((req.body || {}).studentId || '').trim().toUpperCase();
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  const otp = String((req.body || {}).otp || '').trim();

  if (!studentId || !email) {
    return res.status(422).json({ error: 'Student ID and email are required.' });
  }
  if (!OTP_RE.test(otp)) {
    return res.status(422).json({ error: 'Enter the 6-digit code you received.' });
  }

  try {
    const last = await latestRequest(studentId, email);
    if (!last || last.verified || last.used_at) {
      return res.status(410).json({ error: 'No pending verification code. Request a new one.', otp_expired: true });
    }
    if (new Date(last.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: 'This code has expired. Request a new one.', otp_expired: true });
    }
    if (last.attempts >= config.resetOtpMaxAttempts) {
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new code.', otp_invalid: true });
    }

    if (!safeCompare(hashOtp(otp), last.otp_hash)) {
      const attempts = last.attempts + 1;
      await serviceRole.from('password_reset_otps').update({ attempts }).eq('id', last.id);
      const left = config.resetOtpMaxAttempts - attempts;
      return res.status(401).json({
        error: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many wrong attempts. Request a new code.',
        otp_invalid: true,
      });
    }

    await serviceRole.from('password_reset_otps').update({ verified: true }).eq('id', last.id);
    res.json({ ok: true, message: 'Code verified. Set your new password.' });
  } catch (err: any) {
    console.error('forgot verify error:', err);
    res.status(500).json({ error: 'Could not verify the code. Please try again.' });
  }
});

// ---- 3) Set the new password via Supabase Auth. Profile and E-Pass untouched. ----
router.post('/reset', async (req, res) => {
  const studentId = String((req.body || {}).studentId || '').trim().toUpperCase();
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  const otp = String((req.body || {}).otp || '').trim();
  const newPassword = String((req.body || {}).newPassword || '');

  if (!studentId || !email || !OTP_RE.test(otp)) {
    return res.status(422).json({ error: 'Student ID, email and code are required.' });
  }
  if (!PASSWORD_RE.test(newPassword)) {
    return res.status(422).json({
      error: 'Password must be at least 8 characters, with one uppercase letter, one lowercase letter and one number.',
    });
  }

  try {
    const last = await latestRequest(studentId, email);
    if (!last || last.used_at) {
      return res.status(410).json({ error: 'No verified reset code. Please start over.', otp_expired: true });
    }
    if (!last.verified) {
      return res.status(410).json({ error: 'Code not verified yet. Validate the code first.', otp_expired: true });
    }
    if (new Date(last.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: 'This code has expired. Request a new one.', otp_expired: true });
    }
    if (!safeCompare(hashOtp(otp), last.otp_hash)) {
      return res.status(401).json({ error: 'Code verification failed. Please start over.' });
    }
    if (!last.user_id) {
      return res.status(500).json({ error: 'This account cannot be reset automatically. Contact the helpdesk.' });
    }

    // Consume the code atomically so two concurrent resets cannot both succeed.
    const { data: consumed } = await serviceRole
      .from('password_reset_otps')
      .update({ used_at: new Date().toISOString() })
      .eq('id', last.id)
      .is('used_at', null)
      .select('id')
      .maybeSingle();
    if (!consumed) {
      return res.status(410).json({ error: 'This code has already been used. Please log in.', otp_expired: true });
    }

    // Supabase Auth handles the secure password update. The student profile and
    // E-Pass (pass id, barcode token, status) are untouched.
    const { error: updateError } = await serviceRole.auth.admin.updateUserById(last.user_id, {
      password: newPassword,
    });
    if (updateError) {
      console.error('password update failed:', updateError.message);
      return res.status(500).json({ error: 'Could not update your password. Please try again.' });
    }

    res.json({ ok: true, message: 'Password updated. You can now log in with your new password.' });
  } catch (err: any) {
    console.error('forgot reset error:', err);
    res.status(500).json({ error: 'Could not reset your password. Please try again.' });
  }
});

function normalizeEmail(email: string | null | undefined): string {
  return String(email || '').trim().toLowerCase();
}

export default router;