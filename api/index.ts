import { app } from '../server/app.ts';

// Vercel serverless function: imports the Express app (no listen() — the
// platform handles requests). Rewrites in vercel.json send all traffic here.
export default app;