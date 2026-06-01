import { Request, Response, NextFunction } from 'express';
import { getDb } from '../services/db';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authUser = (req as any).user;
    const db = getDb();

    const notifications = await db.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    if (id === 'all') {
      await db.notification.updateMany({
        where: { userId: authUser.id, read: false },
        data: { read: true }
      });
      res.json({ message: 'All notifications successfully marked read.' });
      return;
    }

    const item = await db.notification.findUnique({ where: { id } });
    if (!item || item.userId !== authUser.id) {
       res.status(404).json({ error: 'Notification item not found' });
       return;
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({ message: 'Marked read successfully', notification: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const item = await db.notification.findUnique({ where: { id } });
    if (!item || item.userId !== authUser.id) {
       res.status(404).json({ error: 'Notification template not found' });
       return;
    }

    await db.notification.delete({ where: { id } });
    res.json({ message: 'Notification item cleared' });
  } catch (error) {
    next(error);
  }
}
