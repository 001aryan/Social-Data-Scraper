import { Request, Response, NextFunction } from 'express';
import { getDb } from '../services/db';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    
    // Fetch logs with pagination, including optional user metadata
    const { page = '1', limit = '50', action } = req.query;
    const parsedPage = parseInt(String(page), 10) || 1;
    const parsedLimit = parseInt(String(limit), 10) || 50;
    const skip = (parsedPage - 1) * parsedLimit;

    const whereClause: any = {};
    if (action) {
      whereClause.action = String(action);
    }

    const [total, items] = await Promise.all([
      db.auditLog.count({ where: whereClause }),
      db.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsedLimit,
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      })
    ]);

    res.json({
      logs: items,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
}
