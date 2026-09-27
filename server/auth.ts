import { Request, Response, NextFunction } from 'express';
import { serviceRole } from './supabase.ts';

export type AdminRole = 'admin' | 'scanner';

export interface AdminContext {
  uid: string;
  email?: string;
  role: AdminRole;
  displayName?: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminContext;
    }
  }
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization || '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  return header.slice(7).trim() || null;
}

/**
 * Verifies the JWT against Supabase and loads the role from admin_users.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const { data, error } = await serviceRole.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }
    const uid = data.user.id;

    const { data: profile, error: profileError } = await serviceRole
      .from('admin_users')
      .select('role, display_name')
      .eq('user_id', uid)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'You do not have administrator access.' });
    }

    req.admin = {
      uid,
      email: data.user.email || undefined,
      role: profile.role as AdminRole,
      displayName: profile.display_name || undefined,
    };
    next();
  } catch (err) {
    console.error('auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
}

/** Restrict to specific roles (default: only full admins). */
export function requireRole(roles: AdminRole[] = ['admin']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) return res.status(401).json({ error: 'Authentication required.' });
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'This action requires additional privileges.' });
    }
    next();
  };
}