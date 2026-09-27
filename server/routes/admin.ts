import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { serviceRole, adminAuth } from '../supabase.ts';
import { authenticate, requireRole } from '../auth.ts';

const router = Router();

interface PassRow {
  pass_id: string;
  status: string;
  qr_token: string;
  qr_token_hash: string;
  issued_at: string;
  scanned_at: string | null;
  scanned_by: string | null;
  expires_at: string;
  event_name: string;
  event_date: string | null;
  venue: string;
  created_at: string;
  student: {
    student_id: string;
    full_name: string;
    email: string | null;
    mobile: string;
    course: string;
    year: string;
    division: string | null;
    dandiya_pair_requested: boolean;
  };
}

function maskToken(token: string): string {
  if (!token || token.length < 10) return '••••••••••';
  return `${token.slice(0, 6)}…${token.slice(-6)}`;
}

function effectiveStatus(row: PassRow): string {
  if (row.status === 'ACTIVE' && row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return 'EXPIRED';
  }
  return row.status;
}

const TRANSFORM = (row: any) => ({
  pass_id: row.pass_id,
  pass_number: row.pass_id,
  status: effectiveStatus(row),
  qr_token: row.qr_token,
  qr_token_hash: row.qr_token_hash,
  event_name: row.event_name,
  event_date: row.event_date,
  venue: row.venue,
  issued_at: row.issued_at,
  scanned_at: row.scanned_at,
  scanned_by: row.scanned_by,
  expires_at: row.expires_at,
  created_at: row.created_at,
  student: {
    student_id: row.students?.student_id,
    full_name: row.students?.full_name,
    email: row.students?.email,
    mobile: row.students?.mobile,
    course: row.students?.course,
    year: row.students?.year,
    division: row.students?.division,
    dandiya_pair_requested: row.students?.dandiya_pair_requested,
  },
});

// ---- Admin login (email + password against Supabase Auth) ----
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({ error: 'Email and password are required.' });
  }
  try {
    const { data, error } = await adminAuth.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });
    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const uid = data.user.id;

    const { data: profile } = await serviceRole
      .from('admin_users')
      .select('role, display_name')
      .eq('user_id', uid)
      .maybeSingle();

    if (!profile) {
      return res.status(403).json({ error: 'This account has no administrator role.' });
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        uid,
        email: data.user.email,
        role: profile.role,
        displayName: profile.display_name,
      },
    });
  } catch (err) {
    console.error('admin login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ---- Current admin identity (used on app load) ----
router.get('/me', authenticate, (req, res) => {
  res.json(req.admin);
});

// ---- ATOMIC single-use QR verification (admin + scanner) ----
router.post('/verify', authenticate, requireRole(['admin', 'scanner']), async (req, res) => {
  const qrText = String((req.body || {}).token || '').trim();
  const device = String((req.body || {}).device || '').trim() || null;
  if (!qrText) {
    return res.status(422).json({ error: 'No QR data received.' });
  }

  // Accept a bare token or the /verify/<token> URL a QR encodes.
  const urlMatch = qrText.match(/\/verify\/([A-Za-z0-9_-]+)/);
  const qrToken = urlMatch ? urlMatch[1] : qrText;
  if (!qrToken) {
    return res.status(422).json({ error: 'Could not read a token from the QR data.' });
  }

  try {
    const { data, error } = await serviceRole.rpc('consume_pass', {
      p_qr_token: qrToken,
      p_scanned_by: req.admin!.uid,
      p_device: device,
    });
    if (error) {
      console.error('consume_pass rpc failed:', error.message);
      return res.status(500).json({ error: 'Verification failed. Please try again.' });
    }
    res.json(data);
  } catch (err) {
    console.error('verify route error:', err);
    res.status(500).json({ error: 'Unexpected verification error.' });
  }
});

// ---- Dashboard stats ----
router.get('/stats', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { count: studentsCount } = await serviceRole
      .from('students')
      .select('id', { count: 'exact', head: true });
    const { data: passes } = await serviceRole
      .from('e_passes')
      .select('status, expires_at');
    const { data: students } = await serviceRole
      .from('students')
      .select('year, course, dandiya_pair_requested, e_passes(pass_id)');

    let active = 0;
    let used = 0;
    let expired = 0;
    let cancelled = 0;
    (passes || []).forEach((p: any) => {
      const eff = p.status === 'ACTIVE' && p.expires_at && new Date(p.expires_at).getTime() <= Date.now()
        ? 'EXPIRED'
        : p.status;
      if (eff === 'ACTIVE') active += 1;
      else if (eff === 'USED') used += 1;
      else if (eff === 'EXPIRED') expired += 1;
      else cancelled += 1;
    });

    const byYear: Record<string, number> = {};
    const byCourse: Record<string, number> = {};
    let dandiya_pairs = 0;
    (students || []).forEach((s: any) => {
      if (s.dandiya_pair_requested) dandiya_pairs += 1;
      const related = Array.isArray(s.e_passes) ? s.e_passes : s.e_passes ? [s.e_passes] : [];
      if (related.length > 0) {
        const y = String(s.year || 'Unknown');
        const c = String(s.course || 'Unknown');
        byYear[y] = (byYear[y] || 0) + 1;
        byCourse[c] = (byCourse[c] || 0) + 1;
      }
    });
    const toSorted = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

    const { count: scans_total } = await serviceRole.from('scan_logs').select('id', { count: 'exact', head: true });
    const { count: valid_scans } = await serviceRole
      .from('scan_logs')
      .select('id', { count: 'exact', head: true })
      .eq('scan_result', 'VALID_SCAN');

    res.json({
      total_students: studentsCount || 0,
      total_passes: (passes || []).length,
      active,
      used,
      expired,
      cancelled,
      dandiya_pairs,
      scans_total: scans_total || 0,
      valid_scans: valid_scans || 0,
      by_year: toSorted(byYear),
      by_course: toSorted(byCourse),
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ error: 'Could not load dashboard statistics.' });
  }
});

// ---- Pass listing with search + filters (admin) ----
router.get('/passes', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || 'ALL').trim().toUpperCase();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));

    let query = serviceRole
      .from('e_passes')
      .select('*, students(*)');

    const { data, error } = await query;
    if (error) throw error;

    let rows = (data || []).map(TRANSFORM);

    if (status !== 'ALL') {
      rows = rows.filter((r: any) => r.status === status);
    }
    if (search) {
      rows = rows.filter((r: any) =>
        [r.pass_id, r.student?.student_id, r.student?.full_name, r.student?.email, r.student?.mobile, r.qr_token]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(search)),
      );
    }

    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = rows.slice(start, start + limit).map((r: any) => ({
      ...r,
      qr_token: undefined, // never send raw token in the dashboard list
      qr_token_hash: undefined,
    }));

    res.json({
      rows: paged,
      total,
      page,
      limit,
      total_pages: totalPages,
    });
  } catch (err) {
    console.error('list passes error:', err);
    res.status(500).json({ error: 'Could not load passes.' });
  }
});

// ---- Shared CSV (UTF-8 BOM) / real .xlsx writer for admin exports ----
async function sendExport(
  res: Response,
  opts: { format: string; filename: string; sheetName: string; columns: string[]; rows: (string | number)[][] },
) {
  if (opts.format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Western College E-Pass System';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(opts.sheetName);

    sheet.columns = opts.columns.map((header) => ({ header, key: header.toLowerCase().replace(/[^a-z]/g, ''), width: 22 }));
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8C5B00' } };

    opts.rows.forEach((r) => sheet.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${opts.filename}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  const escapeCsv = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines: string[] = [opts.columns.map(escapeCsv).join(',')];
  opts.rows.forEach((r) => lines.push(r.map(escapeCsv).join(',')));

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${opts.filename}.csv"`);
  res.send('\uFEFF' + lines.join('\r\n'));
}

const PASS_EXPORT_COLUMNS = [
  'Pass ID',
  'Student ID',
  'Student Name',
  'Email',
  'Mobile',
  'Course',
  'Year',
  'Division',
  'Pass Status',
  'QR Token (masked)',
  'Issued At',
  'Scanned At',
  'Scanned By',
  'Event',
  'Expires At',
  'Created At',
];

router.get('/passes/export', authenticate, requireRole(['admin']), async (req, res) => {
  const format = String(req.query.format || 'csv').toLowerCase();
  try {
    const { data, error } = await serviceRole
      .from('e_passes')
      .select('*, students(*)');
    if (error) throw error;

    const rows = (data || []).map((r: any) => {
      const t = TRANSFORM(r);
      return [
        t.pass_id,
        t.student?.student_id ?? '',
        t.student?.full_name ?? '',
        t.student?.email ?? '',
        t.student?.mobile ?? '',
        t.student?.course ?? '',
        t.student?.year ?? '',
        t.student?.division ?? '',
        t.status,
        maskToken(t.qr_token),
        t.issued_at,
        t.scanned_at ?? '',
        t.scanned_by ?? '',
        `${t.event_name}${t.event_date ? ` (${t.event_date})` : ''}`,
        t.expires_at,
        t.created_at,
      ];
    });

    await sendExport(res, {
      format,
      filename: `garba-epass-export-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'E-Passes',
      columns: PASS_EXPORT_COLUMNS,
      rows,
    });
  } catch (err) {
    console.error('export error:', err);
    res.status(500).json({ error: 'Could not generate the export.' });
  }
});

const SCAN_EXPORT_COLUMNS = [
  'Scanned At',
  'Result',
  'Pass ID',
  'Student ID',
  'Student Name',
  'Scanned By',
  'Device',
];

router.get('/scans/export', authenticate, requireRole(['admin']), async (req, res) => {
  const format = String(req.query.format || 'csv').toLowerCase();
  try {
    const { data, error } = await serviceRole
      .from('scan_logs')
      .select('*, e_passes(pass_id, students(student_id, full_name))')
      .order('scanned_at', { ascending: false });
    if (error) throw error;

    const rows = (data || []).map((s: any) => [
      s.scanned_at,
      s.scan_result,
      s.e_passes?.pass_id ?? '',
      s.e_passes?.students?.student_id ?? '',
      s.e_passes?.students?.full_name ?? '',
      s.scanned_by ?? '',
      s.device_information ?? '',
    ]);

    await sendExport(res, {
      format,
      filename: `garba-scan-log-${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Scan Log',
      columns: SCAN_EXPORT_COLUMNS,
      rows,
    });
  } catch (err) {
    console.error('scan export error:', err);
    res.status(500).json({ error: 'Could not generate the scan export.' });
  }
});

// ---- Cancel a pass (admin only) ----
router.post('/passes/:id/cancel', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { error } = await serviceRole
      .from('e_passes')
      .update({ status: 'CANCELLED' })
      .eq('pass_id', req.params.id)
      .eq('status', 'ACTIVE');
    if (error) throw error;
    res.json({ ok: true, message: 'Pass cancelled.' });
  } catch (err) {
    console.error('cancel pass error:', err);
    res.status(500).json({ error: 'Could not cancel the pass.' });
  }
});

// ---- Scan history / audit log (admin only) ----
router.get('/scans', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
    const { data, error } = await serviceRole
      .from('scan_logs')
      .select('*, e_passes(pass_id, students(student_id, full_name))')
      .order('scanned_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ rows: data || [] });
  } catch (err) {
    console.error('scan logs error:', err);
    res.status(500).json({ error: 'Could not load scan history.' });
  }
});

export default router;