import type { EPassTicket, StudentPass, StudentProfile } from '../types.ts';

/** Convert the server student profile + pass into the UI ticket shape. */
export function toEPassTicket(profile: StudentProfile, pass: StudentPass): EPassTicket {
  return {
    id: pass.pass_id,
    passNumber: pass.pass_id,
    fullName: profile.full_name,
    rollNumber: profile.student_id,
    mobileNumber: profile.mobile,
    department: profile.course,
    year: profile.year,
    division: profile.division || undefined,
    email: profile.email || undefined,
    bookingTimestamp: new Date(pass.issued_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    entryGate: pass.venue,
    verificationCode: (pass.qr_token || '').slice(0, 8).toUpperCase(),
    dandiyaPairRequested: false,
    status: pass.status === 'ACTIVE' ? 'CONFIRMED' : pass.status,
    qrToken: pass.qr_token,
    verifyUrl: `${window.location.origin}/verify/${pass.qr_token}`,
    expiresAt: pass.expires_at,
  };
}