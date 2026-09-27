import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.ts';
import { serviceRole } from './supabase.ts';
import adminRouter from './routes/admin.ts';
import authRouter from './routes/auth.ts';
import forgotRouter from './routes/forgot-password.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json({ limit: '100kb' }));

// ---- public read-only token status (no consumption) ----
app.get('/api/verify/:token', async (req, res) => {
  const token = String(req.params.token || '').trim();
  if (!token) return res.status(422).json({ valid: false });
  try {
    const { data, error } = await serviceRole
      .from('e_passes')
      .select('status')
      .eq('qr_token', token)
      .maybeSingle();
    if (error || !data) return res.json({ valid: false });
    return res.json({ valid: true, status: data.status });
  } catch {
    return res.status(500).json({ valid: false });
  }
});

// ---- API routes ----
// NOTE: Pass issuance requires a student account. The ONLY server path that
// can create or link an E-Pass is /api/auth/signup (which verifies the Student
// (auth.ts) and finalizes the pass for the logged-in user).
// The legacy unauthenticated /api/register and /api/otp routes are removed.
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/forgot', forgotRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'western-college-garba-epass' });
});

// ---- public pass-capacity counter (drives the live meter) ----
app.get('/api/stats', async (_req, res) => {
  try {
    const { count, error } = await serviceRole
      .from('e_passes')
      .select('*', { count: 'exact', head: true })
      .in('status', ['ACTIVE', 'USED']);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ claimed: count ?? 0, max: config.maxPasses });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---- search-engine files (SEO). Base URL = APP_URL, else the request host so
// absolute URLs are always correct on any deployment ----
function seoBaseUrl(req: express.Request): string {
  return config.appUrl || `${req.protocol}://${req.get('host')}`;
}

app.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /dashboard',
        'Disallow: /admin',
        'Disallow: /verify/',
        '',
        `Sitemap: ${seoBaseUrl(req)}/sitemap.xml`,
        '',
      ].join('\n'),
    );
});

app.get('/sitemap.xml', (req, res) => {
  const base = seoBaseUrl(req);
  const urls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/signup`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${base}/login`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${base}/forgot-password`, changefreq: 'monthly', priority: '0.4' },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

// ---- serve built frontend (production) ----
const distDir = [
  path.resolve(__dirname, '..', 'dist'),
  path.resolve(process.cwd(), 'dist'),
  '/var/task/dist',
].find((p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
});

if (distDir) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}