import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 8787),
  supabaseUrl: process.env.SUPABASE_URL || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  appUrl: (process.env.APP_URL || '').replace(/\/$/, ''),
  eventName: process.env.EVENT_NAME || 'Garba & Dandiya Night 2026',
  eventDate: process.env.EVENT_DATE || 'October 2026',
  venue: process.env.EVENT_VENUE || 'Western College Main Quadrangle',
  eventEndIso: process.env.EVENT_END_ISO || '2026-10-31T23:59:59+05:30',
  maxPasses: Number(process.env.MAX_PASSES || 1000),
  // OTP by SMS. smsProvider is 'msg91' (real SMS) when an auth key is set,
  // 'dummy' when overridden for testing (code is echoed/logged, never sent),
  // otherwise 'none' -> OTP disabled -> mobile-number-match protection only.
  smsProvider:
    process.env.SMS_PROVIDER === 'dummy'
      ? 'dummy'
      : (process.env.SMS_MSG91_AUTHKEY || '').trim()
        ? 'msg91'
        : 'none',
  smsAuthKey: process.env.SMS_MSG91_AUTHKEY || '',
  smsSenderId: process.env.SMS_MSG91_SENDER_ID || 'WCLEGE',
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS || 300),
  otpResendCooldownMs: Number(process.env.OTP_RESEND_COOLDOWN_MS || 60000),
  get smsEnabled() {
    return this.smsProvider !== 'none';
  },
  // ---- Self service student accounts (Supabase Auth) ----
  // Set EMAIL_VERIFICATION_REQUIRED="true" once Supabase email/SMTP has been
  // configured; otherwise accounts are auto-confirmed and students can log in
  // straight away.
  emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
  // Forgot-password OTP (delivered by email)
  resetOtpTtlSeconds: Number(process.env.RESET_OTP_TTL_SECONDS || 600),
  resetOtpCooldownMs: Number(process.env.RESET_OTP_COOLDOWN_MS || 60000),
  resetOtpMaxAttempts: Number(process.env.RESET_OTP_MAX_ATTEMPTS || 5),
  resetOtpRateLimitPerHour: Number(process.env.RESET_OTP_RATE_LIMIT_PER_HOUR || 5),
  // SMTP (nodemailer) for the password-reset email. When SMTP host/user are
  // empty the code is logged and echoed in dev mode (never in production).
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'Western College <no-reply@westerncollege.in>',
  get smtpEnabled() {
    return !!(this.smtpHost && this.smtpUser);
  },
  isProd: process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
};