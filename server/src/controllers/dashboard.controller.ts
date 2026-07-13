import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await dashboardService.getDashboardData(userId);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
