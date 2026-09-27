# Western College Garba & Dandiya Night — E-Pass

Official event landing page and instant E-Pass booking portal for the Western
College Garba & Dandiya Night. Students register once, receive a signed QR
E-Pass, and gate staff scan it for single-use entry.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4, animated with `motion`
- **Backend:** Express + TypeScript (serverless-compatible for Vercel)
- **Database:** Supabase (Postgres + Auth) with Postgres RPC for pass issue/consume
- **Deployment:** Vercel (single serverless function in `api/index.ts`)

## Features

- Public landing page with event details, schedule, FAQ, and a live capacity meter
- Online registration with automatic E-Pass + QR code generation
- Public pass verification page `/verify/<token>`
- Admin dashboard (`/admin`) with:
  - `admin` role: pass list, scanning, stats, scan history, Excel export
  - `scanner` role: scan-only gate access (camera-based QR scanning)
- Single-use pass enforcement and full scan audit log (Postgres RPC)
- Capacity cap (`MAX_PASSES`) enforced atomically by `register_pass`

## Project Layout

```
api/            Vercel serverless entrypoint
server/         Express app (routes, auth, Supabase clients, scripts)
src/            React frontend
supabase/       Database schema (schema.sql)
public/         Static public assets (non-SPA)
```

## Getting Started

1. Install dependencies: `npm install`
2. Create a Supabase project and apply `supabase/schema.sql`
   (edit first, per the notes in the file).
3. Copy `.env.example` to `.env` and fill in your values
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, event details, `MAX_PASSES`).
4. Create your admin credentials in Supabase Auth, then insert the row into
   `admin_users` (role `admin` or `scanner`) — or run
   `npm run create-admin -- <email> <password> <admin|scanner>`.
5. Run locally: `npm run dev` (web on :3000, API on :8787 with Vite proxy)

## Production

- Build: `npm run build` then serve with `npm start`
- Deploy to Vercel: `vercel --prod`
  - Set the same env vars from `.env` in Vercel project settings
  - `vercel.json` rewrites all traffic to `api/index.ts`; the Express app
    serves the SPA fallback so `/admin` and `/verify/<token>` work

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Web + API dev servers |
| `npm run build` | Production frontend build |
| `npm start` | Run the Express server (serves `dist/`) |
| `npm run lint` | Type-check frontend and server |
| `npm run create-admin` | Create admin/scanner login |