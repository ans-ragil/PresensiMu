import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    attendance: {
      findMany: vi.fn()
    },
    leaveRequest: {
      count: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    adminService = new AdminService();
  });

  describe('getDashboard', () => {
    it('should return dashboard summary', async () => {
      (prisma.user.count as any).mockResolvedValue(10);
      (prisma.attendance.findMany as any).mockResolvedValue([
        { status: 'HADIR' },
        { status: 'HADIR' },
        { status: 'TERLAMBAT' }
      ]);
      (prisma.leaveRequest.count as any).mockResolvedValue(1);
      (prisma.leaveRequest.findMany as any).mockResolvedValue([]);

      const result = await adminService.getDashboard();

      expect(result.totalEmployees).toBe(10);
      expect(result.todayAttendance.hadir).toBe(2);
      expect(result.todayAttendance.terlambat).toBe(1);
      expect(result.pendingLeaves).toBe(1);
    });
  });

  describe('getAllEmployees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [
        { id: '1', nama: 'User 1', email: 'user1@test.com', role: 'EMPLOYEE' },
        { id: '2', nama: 'User 2', email: 'user2@test.com', role: 'EMPLOYEE' }
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockEmployees);

      const result = await adminService.getAllEmployees();

      expect(result).toEqual(mockEmployees);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'EMPLOYEE' },
        select: expect.any(Object),
        orderBy: { nama: 'asc' }
      });
    });
  });

  describe('getAllAttendance', () => {
    it('should return all attendance with filters', async () => {
      const mockAttendance = [
        { id: '1', userId: 'user-1', status: 'HADIR' }
      ];

      (prisma.attendance.findMany as any).mockResolvedValue(mockAttendance);

      const result = await adminService.getAllAttendance('2024-07-01', '2024-07-31');

      expect(result).toEqual(mockAttendance);
    });
  });

  describe('getAllLeaveRequests', () => {
    it('should return all leave requests', async () => {
      const mockLeaves = [
        { id: '1', userId: 'user-1', status: 'PENDING' }
      ];

      (prisma.leaveRequest.findMany as any).mockResolvedValue(mockLeaves);

      const result = await adminService.getAllLeaveRequests();

      expect(result).toEqual(mockLeaves);
    });
  });
});
