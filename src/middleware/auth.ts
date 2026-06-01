import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { getDb } from '../services/db';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Automatically auto-authenticate as the default developer profile
    // since registration, login, and external proxy accounts are disabled
    (req as any).user = {
      id: 'local-session-owner',
      email: 'singharyan5011@gmail.com',
      role: 'Admin'
    };
    next();
  } catch (error: any) {
     res.status(401).json({ error: 'Auth error', details: error.message });
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions' });
      return;
    }

    next();
  };
}
