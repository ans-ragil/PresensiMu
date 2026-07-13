import { Request, Response, NextFunction } from 'express';
import { leaveService } from '../services/leave.service';

export class LeaveController {
  async createLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { tipeIzin, tanggalMulai, tanggalSelesai, keterangan, bukti } = req.body;

      // Validation
      if (!tipeIzin || !tanggalMulai || !tanggalSelesai) {
        return res.status(400).json({
          success: false,
          message: 'Tipe izin, tanggal mulai, dan tanggal selesai wajib diisi'
        });
      }

      // Validate leave type
      const allowedTypes = ['CUTI_TAHUNAN', 'IZIN_SAKIT', 'IZIN_PRIBADI', 'LIBUR_LOKAL'];
      if (!allowedTypes.includes(tipeIzin)) {
        return res.status(400).json({
          success: false,
          message: 'Tipe izin tidak valid'
        });
      }

      // Validate bukti size if provided
      if (bukti) {
        const buktiSize = Buffer.byteLength(bukti, 'base64');
        if (buktiSize > 2 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Ukuran bukti maksimal 2MB'
          });
        }
      }

      const leaveRequest = await leaveService.createLeave({
        userId,
        tipeIzin,
        tanggalMulai,
        tanggalSelesai,
        keterangan,
        bukti
      });

      res.status(201).json({
        success: true,
        message: 'Pengajuan cuti/izin berhasil dibuat',
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const history = await leaveService.getLeaveHistory(userId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // Employees can only view their own leave requests
      const leaveRequest = await leaveService.getLeaveById(
        id,
        userRole === 'EMPLOYEE' ? userId : undefined
      );

      res.json({
        success: true,
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const balance = await leaveService.getLeaveBalance(userId);
      res.json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  }
}

export const leaveController = new LeaveController();
