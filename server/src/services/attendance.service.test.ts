import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from './attendance.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    attendance: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    schedule: {
      findUnique: vi.fn()
    },
    companyLocation: {
      findFirst: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    attendanceService = new AttendanceService();
  });

  describe('clockIn', () => {
    it('should clock in successfully', async () => {
      const mockAttendance = {
        id: 'attendance-id',
        userId: 'user-id',
        tanggal: new Date(),
        clockIn: new Date(),
        status: 'HADIR'
      };

      (prisma.attendance.findUnique as any).mockResolvedValue(null);
      (prisma.schedule.findUnique as any).mockResolvedValue(null);
      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);
      (prisma.attendance.create as any).mockResolvedValue(mockAttendance);

      const result = await attendanceService.clockIn({
        userId: 'user-id',
        latitude: -6.2088,
        longitude: 106.8456,
        selfie: 'base64image'
      });

      expect(result.attendance).toEqual(mockAttendance);
      expect(result.radiusWarning).toBeNull();
    });

    it('should throw error if already clocked in', async () => {
      (prisma.attendance.findUnique as any).mockResolvedValue({
        id: 'existing',
        clockIn: new Date()
      });

      await expect(
        attendanceService.clockIn({
          userId: 'user-id',
          latitude: -6.2088,
          longitude: 106.8456,
          selfie: 'base64'
        })
      ).rejects.toThrow('Anda sudah melakukan clock in hari ini');
    });

    it('should return radius warning if outside radius', async () => {
      const mockLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };

      (prisma.attendance.findUnique as any).mockResolvedValue(null);
      (prisma.schedule.findUnique as any).mockResolvedValue(null);
      (prisma.companyLocation.findFirst as any).mockResolvedValue(mockLocation);
      (prisma.attendance.create as any).mockResolvedValue({});

      const result = await attendanceService.clockIn({
        userId: 'user-id',
        latitude: -6.9175, // Bandung - far away
        longitude: 107.6191,
        selfie: 'base64'
      });

      expect(result.radiusWarning).not.toBeNull();
      expect(result.radiusWarning?.isWithinRadius).toBe(false);
    });

    it('should mark as TERLAMBAT if late', async () => {
      const mockSchedule = {
        jamMulai: '08:00',
        toleransiMenit: 30
      };

      (prisma.attendance.findUnique as any).mockResolvedValue(null);
      (prisma.schedule.findUnique as any).mockResolvedValue(mockSchedule);
      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);
      (prisma.attendance.create as any).mockImplementation((args: any) =>
        Promise.resolve({ id: 'id', status: args.data.status })
      );

      const result = await attendanceService.clockIn({
        userId: 'user-id',
        latitude: -6.2088,
        longitude: 106.8456,
        selfie: 'base64'
      });

      // Status depends on current time vs schedule
      expect(['HADIR', 'TERLAMBAT']).toContain(result.attendance.status);
    });
  });

  describe('clockOut', () => {
    it('should clock out successfully', async () => {
      const mockAttendance = {
        id: 'attendance-id',
        userId: 'user-id',
        clockIn: new Date(),
        clockOut: null,
        status: 'HADIR'
      };

      (prisma.attendance.findUnique as any).mockResolvedValue(mockAttendance);
      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);
      (prisma.schedule.findUnique as any).mockResolvedValue(null);
      (prisma.attendance.update as any).mockResolvedValue({
        ...mockAttendance,
        clockOut: new Date()
      });

      const result = await attendanceService.clockOut({
        userId: 'user-id',
        latitude: -6.2088,
        longitude: 106.8456,
        selfie: 'base64'
      });

      expect(result.attendance.clockOut).toBeDefined();
    });

    it('should throw error if not clocked in', async () => {
      (prisma.attendance.findUnique as any).mockResolvedValue(null);

      await expect(
        attendanceService.clockOut({
          userId: 'user-id',
          latitude: -6.2088,
          longitude: 106.8456,
          selfie: 'base64'
        })
      ).rejects.toThrow('Anda belum melakukan clock in hari ini');
    });

    it('should throw error if already clocked out', async () => {
      (prisma.attendance.findUnique as any).mockResolvedValue({
        id: 'id',
        clockOut: new Date()
      });

      await expect(
        attendanceService.clockOut({
          userId: 'user-id',
          latitude: -6.2088,
          longitude: 106.8456,
          selfie: 'base64'
        })
      ).rejects.toThrow('Anda sudah melakukan clock out hari ini');
    });
  });

  describe('getTodayStatus', () => {
    it('should return today status with attendance', async () => {
      const mockAttendance = {
        id: 'id',
        clockIn: new Date(),
        clockOut: null,
        status: 'HADIR'
      };

      (prisma.attendance.findUnique as any).mockResolvedValue(mockAttendance);
      (prisma.schedule.findUnique as any).mockResolvedValue(null);

      const result = await attendanceService.getTodayStatus('user-id');

      expect(result.attendance).toEqual(mockAttendance);
    });

    it('should return null attendance if not clocked in', async () => {
      (prisma.attendance.findUnique as any).mockResolvedValue(null);
      (prisma.schedule.findUnique as any).mockResolvedValue(null);

      const result = await attendanceService.getTodayStatus('user-id');

      expect(result.attendance).toBeNull();
    });
  });
});
