import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';

export class AttendanceController {
  async clockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { latitude, longitude, selfie } = req.body;

      // Validation
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Lokasi GPS wajib diisi'
        });
      }

      if (!selfie) {
        return res.status(400).json({
          success: false,
          message: 'Selfie wajib diambil'
        });
      }

      // Validate selfie size (max 2MB)
      const selfieSize = Buffer.byteLength(selfie, 'base64');
      if (selfieSize > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Ukuran foto maksimal 2MB'
        });
      }

      const result = await attendanceService.clockIn({
        userId,
        latitude,
        longitude,
        selfie
      });

      res.status(201).json({
        success: true,
        message: 'Clock in berhasil',
        data: result.attendance,
        radiusWarning: result.radiusWarning
      });
    } catch (error) {
      next(error);
    }
  }

  async clockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { latitude, longitude, selfie } = req.body;

      // Validation
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Lokasi GPS wajib diisi'
        });
      }

      if (!selfie) {
        return res.status(400).json({
          success: false,
          message: 'Selfie wajib diambil'
        });
      }

      // Validate selfie size (max 2MB)
      const selfieSize = Buffer.byteLength(selfie, 'base64');
      if (selfieSize > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Ukuran foto maksimal 2MB'
        });
      }

      const result = await attendanceService.clockOut({
        userId,
        latitude,
        longitude,
        selfie
      });

      res.json({
        success: true,
        message: 'Clock out berhasil',
        data: result.attendance,
        radiusWarning: result.radiusWarning
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await attendanceService.getTodayStatus(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate } = req.query;

      const history = await attendanceService.getHistory(
        userId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const schedule = await attendanceService.getSchedule(userId);

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await attendanceService.getCompanyLocation();

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate } = req.query;

      const stats = await attendanceService.getHistoryStats(
        userId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
