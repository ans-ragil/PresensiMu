import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { unreadOnly } = req.query;
      const data = await notificationService.getNotifications(userId, unreadOnly === 'true');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      await notificationService.markAsRead(id, userId);
      res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
