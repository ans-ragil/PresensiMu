import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { leaveService } from '../services/leave.service';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await adminService.getDashboard();

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const leaveRequests = await adminService.getAllLeaveRequests(status as string);

      res.json({
        success: true,
        data: leaveRequests
      });
    } catch (error) {
      next(error);
    }
  }

  async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { catatanAdmin } = req.body;
      const approvedBy = (req as any).user.id;

      const updated = await leaveService.approveLeave({
        id,
        approvedBy,
        catatanAdmin
      });

      res.json({
        success: true,
        message: 'Pengajuan cuti/izin berhasil disetujui',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { catatanAdmin } = req.body;
      const approvedBy = (req as any).user.id;

      const updated = await leaveService.rejectLeave({
        id,
        approvedBy,
        catatanAdmin
      });

      res.json({
        success: true,
        message: 'Pengajuan cuti/izin berhasil ditolak',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, divisiId, shiftId, status } = req.query;
      const attendance = await adminService.getAllAttendance({
        startDate: startDate as string,
        endDate: endDate as string,
        divisiId: divisiId as string,
        shiftId: shiftId as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await adminService.getAllEmployees();

      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
