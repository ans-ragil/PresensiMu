import prisma from '../config/database';

// Using any cast until prisma generate is run after schema update
const prismaAny = prisma as any;

export class NotificationService {
  async getNotifications(userId: string, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const notifications = await prismaAny.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prismaAny.notification.count({
      where: { userId, isRead: false }
    });

    return { notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    await prismaAny.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
    return true;
  }

  async markAllAsRead(userId: string) {
    await prismaAny.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return true;
  }

  async createNotification(userId: string, title: string, message: string, category: string = 'SISTEM', link?: string) {
    return prismaAny.notification.create({
      data: { userId, title, message, category, link }
    });
  }
}

export const notificationService = new NotificationService();
