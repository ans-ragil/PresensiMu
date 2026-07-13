import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveController } from './leave.controller';

// Mock services
vi.mock('../services/leave.service', () => ({
  leaveService: {
    createLeave: vi.fn(),
    getLeaveHistory: vi.fn(),
    getLeaveById: vi.fn()
  }
}));

import { leaveService } from '../services/leave.service';

describe('LeaveController', () => {
  let controller: LeaveController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new LeaveController();
    mockReq = { body: {}, params: {}, user: { id: 'user-id', role: 'EMPLOYEE' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('createLeave', () => {
    it('should return 400 if required fields missing', async () => {
      mockReq.body = {};

      await controller.createLeave(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid leave type', async () => {
      mockReq.body = {
        tipeIzin: 'INVALID_TYPE',
        tanggalMulai: '2024-07-01',
        tanggalSelesai: '2024-07-03'
      };

      await controller.createLeave(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tipe izin tidak valid'
        })
      );
    });

    it('should create leave successfully', async () => {
      mockReq.body = {
        tipeIzin: 'CUTI_TAHUNAN',
        tanggalMulai: '2024-07-01',
        tanggalSelesai: '2024-07-03'
      };
      const mockLeave = { id: 'leave-id', status: 'PENDING' };
      (leaveService.createLeave as any).mockResolvedValue(mockLeave);

      await controller.createLeave(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockLeave
        })
      );
    });

    it('should call next on error', async () => {
      mockReq.body = {
        tipeIzin: 'CUTI_TAHUNAN',
        tanggalMulai: '2024-07-01',
        tanggalSelesai: '2024-07-03'
      };
      const error = new Error('Sudah ada pengajuan');
      (leaveService.createLeave as any).mockRejectedValue(error);

      await controller.createLeave(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getLeaveHistory', () => {
    it('should return leave history', async () => {
      const mockHistory = [{ id: '1', status: 'PENDING' }];
      (leaveService.getLeaveHistory as any).mockResolvedValue(mockHistory);

      await controller.getLeaveHistory(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory
      });
    });
  });

  describe('getLeaveById', () => {
    it('should return leave by id', async () => {
      mockReq.params = { id: 'leave-id' };
      const mockLeave = { id: 'leave-id', status: 'PENDING' };
      (leaveService.getLeaveById as any).mockResolvedValue(mockLeave);

      await controller.getLeaveById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockLeave
      });
    });

    it('should pass userId for employee role', async () => {
      mockReq.params = { id: 'leave-id' };
      mockReq.user = { id: 'user-id', role: 'EMPLOYEE' };
      (leaveService.getLeaveById as any).mockResolvedValue({});

      await controller.getLeaveById(mockReq, mockRes, mockNext);

      expect(leaveService.getLeaveById).toHaveBeenCalledWith('leave-id', 'user-id');
    });

    it('should not pass userId for admin role', async () => {
      mockReq.params = { id: 'leave-id' };
      mockReq.user = { id: 'admin-id', role: 'ADMIN' };
      (leaveService.getLeaveById as any).mockResolvedValue({});

      await controller.getLeaveById(mockReq, mockRes, mockNext);

      expect(leaveService.getLeaveById).toHaveBeenCalledWith('leave-id', undefined);
    });
  });
});
