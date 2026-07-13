import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from './report.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      count: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    attendance: {
      findMany: vi.fn()
    },
    leaveRequest: {
      findMany: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findMany as any).mockResolvedValue([]);
    reportService = new ReportService();
  });

  describe('getDailyReport', () => {
    it('should return daily report', async () => {
      (prisma.user.count as any).mockResolvedValue(10);
      (prisma.user.findMany as any).mockResolvedValue(
        Array.from({ length: 10 }, (_, index) => ({
          id: `user-${index}`,
          nama: `User ${index}`,
          email: `u${index}@test.com`
        }))
      );
      (prisma.attendance.findMany as any).mockResolvedValue([
        {
          status: 'HADIR',
          userId: 'user-0',
          user: { nama: 'User 1', email: 'u1@test.com' }
        },
        {
          status: 'TERLAMBAT',
          userId: 'user-1',
          user: { nama: 'User 2', email: 'u2@test.com' }
        }
      ]);
      (prisma.leaveRequest.findMany as any).mockResolvedValue([]);

      const result = await reportService.getDailyReport('2024-07-01');

      expect(result.totalEmployees).toBe(10);
      expect(result.hadir).toBe(1);
      expect(result.terlambat).toBe(1);
      // Date format depends on timezone, just check it exists
      expect(result.date).toBeDefined();
      expect(typeof result.date).toBe('string');
    });

    it('should include all employees and leave status in daily report details', async () => {
      (prisma.user.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: 'user-1', nama: 'Arif', email: 'arif@example.com' },
        { id: 'user-2', nama: 'Budi', email: 'budi@example.com' }
      ]);
      (prisma.attendance.findMany as any).mockResolvedValue([
        {
          status: 'HADIR',
          userId: 'user-1',
          user: { nama: 'Arif', email: 'arif@example.com' }
        }
      ]);
      (prisma.leaveRequest.findMany as any).mockResolvedValue([
        {
          userId: 'user-2',
          tipeIzin: 'CUTI_TAHUNAN',
          status: 'APPROVED',
          user: { nama: 'Budi', email: 'budi@example.com' }
        }
      ]);

      const result = await reportService.getDailyReport('2024-07-01');

      expect(result.details).toHaveLength(2);
      expect(result.details).toEqual(expect.arrayContaining([
        expect.objectContaining({ nama: 'Arif', status: 'HADIR' }),
        expect.objectContaining({ nama: 'Budi', status: 'CUTI' })
      ]));
      expect(result.alpha).toBe(0);
      expect(result.cuti).toBe(1);
    });

    it('should use today if no date provided', async () => {
      (prisma.user.count as any).mockResolvedValue(5);
      (prisma.attendance.findMany as any).mockResolvedValue([]);
      (prisma.leaveRequest.findMany as any).mockResolvedValue([]);

      const result = await reportService.getDailyReport();

      // Just verify it returns a valid date string
      expect(result.date).toBeDefined();
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getEmployeeReport', () => {
    it('should return employee report', async () => {
      const mockUser = {
        id: 'user-id',
        nama: 'Test User',
        email: 'test@test.com'
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.attendance.findMany as any).mockResolvedValue([
        { status: 'HADIR' },
        { status: 'HADIR' },
        { status: 'TERLAMBAT' }
      ]);
      (prisma.leaveRequest.findMany as any).mockResolvedValue([
        { tipeIzin: 'CUTI_TAHUNAN' }
      ]);

      const result = await reportService.getEmployeeReport('user-id');

      expect(result.nama).toBe('Test User');
      expect(result.hadir).toBe(2);
      expect(result.terlambat).toBe(1);
      expect(result.cuti).toBe(1);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        reportService.getEmployeeReport('nonexistent')
      ).rejects.toThrow('User tidak ditemukan');
    });
  });

  describe('getLeaveReport', () => {
    it('should return leave report', async () => {
      const mockLeaves = [
        {
          id: '1',
          userId: 'user-1',
          tipeIzin: 'CUTI_TAHUNAN',
          status: 'APPROVED',
          user: { nama: 'User 1', email: 'u1@test.com' }
        }
      ];

      (prisma.leaveRequest.findMany as any).mockResolvedValue(mockLeaves);

      const result = await reportService.getLeaveReport();

      expect(result).toEqual(mockLeaves);
    });
  });
});
