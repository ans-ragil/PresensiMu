import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveService } from './leave.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    leaveRequest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    user: {
      findMany: vi.fn().mockResolvedValue([])
    }
  }
}));

// Mock notification service
vi.mock('./notification.service', () => ({
  notificationService: {
    createNotification: vi.fn().mockResolvedValue({})
  }
}));

import prisma from '../config/database';

describe('LeaveService', () => {
  let leaveService: LeaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    leaveService = new LeaveService();
  });

  describe('createLeave', () => {
    it('should create leave request successfully', async () => {
      const mockLeave = {
        id: 'leave-id',
        userId: 'user-id',
        tipeIzin: 'CUTI_TAHUNAN',
        tanggalMulai: new Date('2024-07-01'),
        tanggalSelesai: new Date('2024-07-03'),
        status: 'PENDING',
        user: { id: 'user-id', nama: 'Test', email: 'test@test.com' }
      };

      (prisma.leaveRequest.findFirst as any).mockResolvedValue(null);
      (prisma.leaveRequest.create as any).mockResolvedValue(mockLeave);

      const result = await leaveService.createLeave({
        userId: 'user-id',
        tipeIzin: 'CUTI_TAHUNAN',
        tanggalMulai: '2024-07-01',
        tanggalSelesai: '2024-07-03'
      });

      expect(result).toEqual(mockLeave);
    });

    it('should throw error if dates are invalid (mulai > selesai)', async () => {
      await expect(
        leaveService.createLeave({
          userId: 'user-id',
          tipeIzin: 'CUTI_TAHUNAN',
          tanggalMulai: '2024-07-05',
          tanggalSelesai: '2024-07-01'
        })
      ).rejects.toThrow('Tanggal mulai harus sebelum tanggal selesai');
    });

    it('should throw error if overlapping leave exists', async () => {
      (prisma.leaveRequest.findFirst as any).mockResolvedValue({ id: 'existing' });

      await expect(
        leaveService.createLeave({
          userId: 'user-id',
          tipeIzin: 'CUTI_TAHUNAN',
          tanggalMulai: '2024-07-01',
          tanggalSelesai: '2024-07-03'
        })
      ).rejects.toThrow('Sudah ada pengajuan cuti/izin pada tanggal tersebut');
    });
  });

  describe('approveLeave', () => {
    it('should approve leave request successfully', async () => {
      const mockLeave = {
        id: 'leave-id',
        userId: 'user-id',
        status: 'PENDING'
      };
      const mockApproved = { ...mockLeave, status: 'APPROVED' };

      (prisma.leaveRequest.findUnique as any).mockResolvedValue(mockLeave);
      (prisma.leaveRequest.update as any).mockResolvedValue(mockApproved);

      const result = await leaveService.approveLeave({
        id: 'leave-id',
        approvedBy: 'admin-id'
      });

      expect(result.status).toBe('APPROVED');
    });

    it('should throw error if leave not found', async () => {
      (prisma.leaveRequest.findUnique as any).mockResolvedValue(null);

      await expect(
        leaveService.approveLeave({
          id: 'nonexistent',
          approvedBy: 'admin-id'
        })
      ).rejects.toThrow('Pengajuan cuti tidak ditemukan');
    });

    it('should throw error if leave already processed', async () => {
      (prisma.leaveRequest.findUnique as any).mockResolvedValue({
        id: 'leave-id',
        status: 'APPROVED'
      });

      await expect(
        leaveService.approveLeave({
          id: 'leave-id',
          approvedBy: 'admin-id'
        })
      ).rejects.toThrow('Pengajuan sudah diproses');
    });
  });

  describe('rejectLeave', () => {
    it('should reject leave request successfully', async () => {
      const mockLeave = {
        id: 'leave-id',
        userId: 'user-id',
        status: 'PENDING'
      };
      const mockRejected = { ...mockLeave, status: 'REJECTED' };

      (prisma.leaveRequest.findUnique as any).mockResolvedValue(mockLeave);
      (prisma.leaveRequest.update as any).mockResolvedValue(mockRejected);

      const result = await leaveService.rejectLeave({
        id: 'leave-id',
        approvedBy: 'admin-id',
        catatanAdmin: 'Tidak disetujui'
      });

      expect(result.status).toBe('REJECTED');
    });
  });

  describe('getLeaveHistory', () => {
    it('should return leave history for user', async () => {
      const mockHistory = [
        { id: '1', userId: 'user-id', status: 'APPROVED' },
        { id: '2', userId: 'user-id', status: 'PENDING' }
      ];

      (prisma.leaveRequest.findMany as any).mockResolvedValue(mockHistory);

      const result = await leaveService.getLeaveHistory('user-id');
      expect(result).toEqual(mockHistory);
    });
  });
});
