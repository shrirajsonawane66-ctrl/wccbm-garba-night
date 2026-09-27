import { Request, Response, NextFunction } from 'express';
import { serviceRole } from './supabase.ts';

export interface StudentContext {
  uid: string;
  email?: string;
  profile: any;
  pass: any | null;
}

declare global {
  namespace Express {
    interface Request {
      studentCtx?: StudentContext;
    }
  }
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization || '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  return header.slice(7).trim() || null;
}

/**
 * Verifies the JWT against Supabase and resolves the student's profile + pass.
 * Students can only ever resolve their OWN row (the lookup is by auth user id).
 */
export async function requireStudent(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const { data, error } = await serviceRole.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    const uid = data.user.id;

    const { data: student, error: profileError } = await serviceRole
      .from('students')
      .select('*, e_passes(*)')
      .eq('user_id', uid)
      .maybeSingle();

    if (profileError) {
      console.error('student profile lookup error:', profileError.message);
      return res.status(500).json({ error: 'Could not load your account.' });
    }
    if (!student) {
      return res.status(403).json({ error: 'This account is not linked to a student profile.' });
    }

    const pass = Array.isArray(student.e_passes) ? student.e_passes[0] : student.e_passes || null;

    req.studentCtx = {
      uid,
      email: data.user.email || undefined,
      profile: student,
      pass,
    };
    next();
  } catch (err) {
    console.error('student auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
}