export interface EPassTicket {
  id: string;
  passNumber: string;
  fullName: string;
  rollNumber: string;
  mobileNumber: string;
  department: string;
  year: string;
  division?: string;
  email?: string;
  bookingTimestamp: string;
  entryGate: string;
  verificationCode: string;
  dandiyaPairRequested: boolean;
  status: 'CONFIRMED' | 'VERIFIED' | 'USED' | 'EXPIRED' | 'CANCELLED';
  /** Server-issued cryptographic QR token (raw). Kept for re-display only. */
  qrToken?: string;
  /** QR payload URL used to render the code. */
  verifyUrl?: string;
  expiresAt?: string;
}

export interface BookingFormData {
  fullName: string;
  rollNumber: string;
  mobileNumber: string;
  department: string;
  year: string;
  email: string;
  dandiyaPairRequested: boolean;
  termsAgreed: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface EventHighlight {
  id: string;
  title: string;
  time: string;
  description: string;
  tag: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'passes' | 'dress-code' | 'entry' | 'rules';
}

// ---- Backend wire types (@/lib/api) ----
export type VerifyResult =
  | {
      result: 'VALID_SCAN';
      message: string;
      pass_id: string;
      scanned_at: string;
      scanned_by: string;
      student: {
        student_id: string;
        full_name: string;
        course: string;
        year: string;
        division: string | null;
        event_name: string;
        event_date: string | null;
        venue: string;
      };
    }
  | {
      result: 'ALREADY_USED';
      message: string;
      pass_id: string;
      first_scanned_at: string | null;
      first_scanned_by: string | null;
      student: { student_id: string; full_name: string; course: string; year: string; division: string | null };
    }
  | {
      result: 'INVALID_TOKEN' | 'CANCELLED' | 'EXPIRED';
      message: string;
      pass_id?: string;
    };

export interface DashboardStats {
  total_students: number;
  total_passes: number;
  active: number;
  used: number;
  expired: number;
  cancelled: number;
  dandiya_pairs: number;
  scans_total: number;
  valid_scans: number;
  by_year: { key: string; count: number }[];
  by_course: { key: string; count: number }[];
}

// ---- Student self-service accounts (Supabase Auth) ----
export interface StudentProfile {
  student_id: string;
  full_name: string;
  email: string | null;
  mobile: string;
  course: string;
  year: string;
  division: string | null;
}

export interface StudentPass {
  pass_id: string;
  qr_token: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  event_name: string;
  event_date: string | null;
  venue: string;
  issued_at: string;
  expires_at: string;
  scanned_at: string | null;
  scanned_by: string | null;
}

export interface StudentSession {
  ok: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  email_verification_required?: boolean;
  user?: { uid: string; email?: string; name?: string };
  profile?: StudentProfile | null;
  pass?: StudentPass | null;
}

export interface SignupPayload {
  fullName: string;
  studentId: string;
  email: string;
  mobile: string;
  course: string;
  year: string;
  division?: string;
  password: string;
}

export interface ForgotSendResult {
  ok: boolean;
  sent: boolean;
  provider: 'smtp' | 'dev';
  otp_ttl: number;
  resend_after: number;
  message: string;
  dev_otp?: string;
}