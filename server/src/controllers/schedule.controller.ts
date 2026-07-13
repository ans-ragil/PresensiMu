import { Request, Response, NextFunction } from 'express';
import { scheduleService } from '../services/schedule.service';

export class ScheduleController {
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, hari, jamMulai, jamSelesai, shiftType, toleransiMenit } = req.body;

      // Validation
      if (!userId || hari === undefined || !jamMulai || !jamSelesai) {
        return res.status(400).json({
          success: false,
          message: 'User ID, hari, jam mulai, dan jam selesai wajib diisi'
        });
      }

      // Validate hari (0-6)
      if (hari < 0 || hari > 6) {
        return res.status(400).json({
          success: false,
          message: 'Hari harus antara 0 (Minggu) - 6 (Sabtu)'
        });
      }

      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(jamMulai) || !timeRegex.test(jamSelesai)) {
        return res.status(400).json({
          success: false,
          message: 'Format jam harus HH:MM'
        });
      }

      const schedule = await scheduleService.createSchedule({
        userId,
        hari,
        jamMulai,
        jamSelesai,
        shiftType,
        toleransiMenit
      });

      res.status(201).json({
        success: true,
        message: 'Jadwal berhasil dibuat',
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { jamMulai, jamSelesai, shiftType, toleransiMenit } = req.body;

      // Validate time format if provided
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (jamMulai && !timeRegex.test(jamMulai)) {
        return res.status(400).json({
          success: false,
          message: 'Format jam mulai harus HH:MM'
        });
      }
      if (jamSelesai && !timeRegex.test(jamSelesai)) {
        return res.status(400).json({
          success: false,
          message: 'Format jam selesai harus HH:MM'
        });
      }

      const schedule = await scheduleService.updateSchedule(id, {
        jamMulai,
        jamSelesai,
        shiftType,
        toleransiMenit
      });

      res.json({
        success: true,
        message: 'Jadwal berhasil diupdate',
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await scheduleService.deleteSchedule(id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, hari } = req.query;
      const schedules = await scheduleService.getSchedules(
        userId as string,
        hari !== undefined ? parseInt(hari as string) : undefined
      );

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds, hari, jamMulai, jamSelesai, shiftType, toleransiMenit } = req.body;

      // Validation
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs wajib diisi dan harus berupa array'
        });
      }

      if (hari === undefined || !jamMulai || !jamSelesai) {
        return res.status(400).json({
          success: false,
          message: 'Hari, jam mulai, dan jam selesai wajib diisi'
        });
      }

      const result = await scheduleService.bulkAssign({
        userIds,
        hari,
        jamMulai,
        jamSelesai,
        shiftType,
        toleransiMenit
      });

      res.json({
        success: true,
        message: `Berhasil: ${result.success}, Dilewati: ${result.skipped}`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async previewImport(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      const result = await scheduleService.previewImport(file.buffer);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async importFromExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      const result = await scheduleService.importFromExcel(file.buffer);

      res.json({
        success: true,
        message: `Import selesai. Berhasil: ${result.success}, Dilewati: ${result.skipped}`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async createHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const { nama, tanggal } = req.body;

      // Validation
      if (!nama || !tanggal) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan tanggal wajib diisi'
        });
      }

      const holiday = await scheduleService.createHoliday({ nama, tanggal });

      res.status(201).json({
        success: true,
        message: 'Hari libur berhasil dibuat',
        data: holiday
      });
    } catch (error) {
      next(error);
    }
  }

  async getHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const holidays = await scheduleService.getHolidays();

      res.json({
        success: true,
        data: holidays
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await scheduleService.deleteHoliday(id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const scheduleController = new ScheduleController();
