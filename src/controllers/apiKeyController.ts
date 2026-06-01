import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDb } from '../services/db';

export async function getApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authUser = (req as any).user;
    const db = getDb();

    const keys = await db.apiKey.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ keys });
  } catch (error) {
    next(error);
  }
}

export async function createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, expiresDays } = req.body;
    const authUser = (req as any).user;

    if (!name) {
       res.status(400).json({ error: 'Please supply a descriptive name identifier for this API Key.' });
       return;
    }

    const db = getDb();

    // Generate secure randomized base64 standard key string with unique prefix
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const secureKey = `sds_live_${randomBytes}`;

    let expiresAt: Date | null = null;
    if (expiresDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(String(expiresDays), 10));
    }

    const newKey = await db.apiKey.create({
      data: {
        userId: authUser.id,
        name,
        key: secureKey,
        expiresAt
      }
    });

    // Audit logs
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'API_KEY_CREATE',
        details: `Issued new developer integration access key: "${name}"`,
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      message: 'Developer API key generated successfully. COPY this key now, as it cannot be viewed again!',
      apiKey: newKey
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const apiKey = await db.apiKey.findUnique({ where: { id } });
    if (!apiKey || apiKey.userId !== authUser.id) {
       res.status(404).json({ error: 'Access token not found in user register context.' });
       return;
    }

    await db.apiKey.delete({ where: { id } });

    // Audit logs
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'API_KEY_REVOKE',
        details: `Revoked and wiped dev secret key: "${apiKey.name}"`,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'API key successfully revoked.' });
  } catch (error) {
    next(error);
  }
}
