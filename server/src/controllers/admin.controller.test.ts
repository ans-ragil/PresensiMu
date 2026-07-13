import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminController } from './admin.controller';

// Mock services
vi.mock('../services/admin.service', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getAllLeaveRequests: vi.fn(),
    getAllAttendance: vi.fn(),
    getAllEmployees: vi.fn()
  }
}));

vi.mock('../services/leave.service', () => ({
  leaveService: {
    approveLeave: vi.fn(),
    rejectLeave: vi.fn()
  }
}));

import { adminService } from '../services/admin.service';
import { leaveService } from '../services/leave.service';

describe('AdminController', () => {
  let controller: AdminController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminController();
    mockReq = { body: {}, params: {}, query: {}, user: { id: 'admin-id' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockDashboard = { totalEmployees: 10, todayAttendance: { hadir: 5 } };
      (adminService.getDashboard as any).mockResolvedValue(mockDashboard);

      await controller.getDashboard(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDashboard
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Database error');
      (adminService.getDashboard as any).mockRejectedValue(error);

      await controller.getDashboard(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllLeaveRequests', () => {
    it('should return all leave requests', async () => {
      const mockLeaves = [{ id: '1', status: 'PENDING' }];
      (adminService.getAllLeaveRequests as any).mockResolvedValue(mockLeaves);

      await controller.getAllLeaveRequests(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockLeaves
      });
    });

    it('should filter by status if provided', async () => {
      mockReq.query = { status: 'PENDING' };
      (adminService.getAllLeaveRequests as any).mockResolvedValue([]);

      await controller.getAllLeaveRequests(mockReq, mockRes, mockNext);

      expect(adminService.getAllLeaveRequests).toHaveBeenCalledWith('PENDING');
    });
  });

  describe('approveLeave', () => {
    it('should approve leave request', async () => {
      mockReq.params = { id: 'leave-id' };
      mockReq.body = { catatanAdmin: 'Disetujui' };
      const mockUpdated = { id: 'leave-id', status: 'APPROVED' };
      (leaveService.approveLeave as any).mockResolvedValue(mockUpdated);

      await controller.approveLeave(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdated
        })
      );
    });
  });

  describe('rejectLeave', () => {
    it('should reject leave request', async () => {
      mockReq.params = { id: 'leave-id' };
      mockReq.body = { catatanAdmin: 'Tidak disetujui' };
      const mockUpdated = { id: 'leave-id', status: 'REJECTED' };
      (leaveService.rejectLeave as any).mockResolvedValue(mockUpdated);

      await controller.rejectLeave(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdated
        })
      );
    });
  });

  describe('getAllAttendance', () => {
    it('should return all attendance', async () => {
      const mockAttendance = [{ id: '1', status: 'HADIR' }];
      (adminService.getAllAttendance as any).mockResolvedValue(mockAttendance);

      await controller.getAllAttendance(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockAttendance
      });
    });
  });

  describe('getAllEmployees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [{ id: '1', nama: 'User 1' }];
      (adminService.getAllEmployees as any).mockResolvedValue(mockEmployees);

      await controller.getAllEmployees(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockEmployees
      });
    });
  });
});
