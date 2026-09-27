import type {
  DashboardStats,
  ForgotSendResult,
  SignupPayload,
  StudentSession,
  VerifyResult,
} from '../types.ts';

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}, adminToken?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  const text = await res.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: text || 'Unexpected server response.' };
  }

  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    (err as any).status = res.status;
    throw err;
  }
  return body as T;
}

export const api = {
  // NOTE: the legacy unauthenticated /register and /otp endpoints were removed.
  // A pass can ONLY be created after signing up / logging in (see authSignup).

  publicStats: () => request<{ claimed: number; max: number }>('/stats'),

  publicVerify: (token: string) => request<{ valid: boolean; status?: string }>(`/verify/${encodeURIComponent(token)}`),

  adminGetToken: () => {
    try {
      return localStorage.getItem('garba_admin_token');
    } catch {
      return null;
    }
  },

  adminLogin: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; expires_at: number; user: { role: string; displayName?: string } }>(
      '/admin/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),

  adminMe: (token: string) => request<{ role: string; email?: string; displayName?: string }>('/admin/me', {}, token),

  adminVerify: (token: string, qrText: string, device?: string) =>
    request<VerifyResult>('/admin/verify', { method: 'POST', body: JSON.stringify({ token: qrText, device }) }, token),

  adminStats: (token: string) => request<DashboardStats>('/admin/stats', {}, token),

  adminPasses: (token: string, params: { search?: string; status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.status && params.status !== 'ALL') q.set('status', params.status);
    q.set('page', String(params.page || 1));
    q.set('limit', String(params.limit || 10));
    return request<any>(`/admin/passes?${q.toString()}`, {}, token);
  },

  adminCancelPass: (token: string, passId: string) =>
    request<{ ok: boolean }>(`/admin/passes/${encodeURIComponent(passId)}/cancel`, { method: 'POST' }, token),

  adminScans: (token: string, limit = 50) => request<any>(`/admin/scans?limit=${limit}`, {}, token),

  // ---- Student self-service auth (Supabase Auth backed) ----
  studentGetToken: () => {
    try {
      return localStorage.getItem('garba_student_token');
    } catch {
      return null;
    }
  },

  studentSetToken: (token: string) => {
    try {
      localStorage.setItem('garba_student_token', token);
    } catch {
      // ignore
    }
  },

  studentClearToken: () => {
    try {
      localStorage.removeItem('garba_student_token');
    } catch {
      // ignore
    }
  },

  authSignup: (payload: SignupPayload) =>
    request<StudentSession>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  authLogin: (email: string, password: string) =>
    request<StudentSession & { access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  authMe: (token: string) => request<StudentSession>('/auth/me', {}, token),

  authLogout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  forgotSend: (studentId: string, email: string) =>
    request<ForgotSendResult>('/forgot/send', {
      method: 'POST',
      body: JSON.stringify({ studentId, email }),
    }),

  forgotVerify: (studentId: string, email: string, otp: string) =>
    request<{ ok: boolean }>('/forgot/verify', {
      method: 'POST',
      body: JSON.stringify({ studentId, email, otp }),
    }),

  forgotReset: (studentId: string, email: string, otp: string, newPassword: string) =>
    request<{ ok: boolean }>('/forgot/reset', {
      method: 'POST',
      body: JSON.stringify({ studentId, email, otp, newPassword }),
    }),
};

/** Trigger a browser download from an admin endpoint that returns a file. */
async function downloadAdminExport(token: string, path: string, filenamePrefix: string, format: 'csv' | 'xlsx') {
  const res = await fetch(`${BASE}${path}?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Export failed.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Download the E-Pass list (admin). */
export async function downloadExport(token: string, format: 'csv' | 'xlsx') {
  await downloadAdminExport(token, '/admin/passes/export', 'garba-epass-export', format);
}

/** Download the scan history / audit log (admin). */
export async function downloadScansExport(token: string, format: 'csv' | 'xlsx') {
  await downloadAdminExport(token, '/admin/scans/export', 'garba-scan-log', format);
}

/** Extract the raw QR token from arbitrary scanner input (URL or bare token). */
export function extractTokenFromQr(text: string): string {
  const t = (text || '').trim();
  if (!t) return '';
  const match = t.match(/\/verify\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : t;
}