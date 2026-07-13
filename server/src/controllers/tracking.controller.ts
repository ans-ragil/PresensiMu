import { Request, Response, NextFunction } from 'express';
import { trackingService } from '../services/tracking.service';

export class TrackingController {
  async setCompanyLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { nama, latitude, longitude, radius } = req.body;

      // Validation
      if (!nama || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nama, latitude, dan longitude wajib diisi'
        });
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude harus antara -90 dan 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude harus antara -180 dan 180'
        });
      }

      // Validate radius
      if (radius && (radius < 100 || radius > 10000)) {
        return res.status(400).json({
          success: false,
          message: 'Radius harus antara 100 dan 10000 meter'
        });
      }

      const location = await trackingService.setCompanyLocation({
        nama,
        latitude,
        longitude,
        radius
      });

      res.json({
        success: true,
        message: 'Lokasi kantor berhasil disimpan',
        data: location
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await trackingService.getCompanyLocation();

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const tracking = await trackingService.getLiveTracking();

      res.json({
        success: true,
        data: tracking
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrackingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, startDate, endDate } = req.query;

      const history = await trackingService.getTrackingHistory(
        userId as string,
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

  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await trackingService.getAlerts();

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }
}

export const trackingController = new TrackingController();
