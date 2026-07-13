import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleService } from './schedule.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    schedule: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    holiday: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;

  beforeEach(() => {
    vi.clearAllMocks();
    scheduleService = new ScheduleService();
  });

  describe('createSchedule', () => {
    it('should create schedule successfully', async () => {
      const mockSchedule = {
        id: 'schedule-id',
        userId: 'user-id',
        hari: 1,
        jamMulai: '08:00',
        jamSelesai: '17:00',
        shiftType: 'NORMAL',
        toleransiMenit: 30,
        user: { id: 'user-id', nama: 'Test', email: 'test@test.com' }
      };

      (prisma.schedule.findUnique as any).mockResolvedValue(null);
      (prisma.schedule.create as any).mockResolvedValue(mockSchedule);

      const result = await scheduleService.createSchedule({
        userId: 'user-id',
        hari: 1,
        jamMulai: '08:00',
        jamSelesai: '17:00'
      });

      expect(result).toEqual(mockSchedule);
    });

    it('should throw error if schedule already exists for the day', async () => {
      (prisma.schedule.findUnique as any).mockResolvedValue({ id: 'existing' });

      await expect(
        scheduleService.createSchedule({
          userId: 'user-id',
          hari: 1,
          jamMulai: '08:00',
          jamSelesai: '17:00'
        })
      ).rejects.toThrow('Jadwal untuk hari ini sudah ada');
    });

    it('should throw error if jam mulai >= jam selesai', async () => {
      (prisma.schedule.findUnique as any).mockResolvedValue(null);

      await expect(
        scheduleService.createSchedule({
          userId: 'user-id',
          hari: 1,
          jamMulai: '17:00',
          jamSelesai: '08:00'
        })
      ).rejects.toThrow('Jam mulai harus sebelum jam selesai');
    });
  });

  describe('updateSchedule', () => {
    it('should update schedule successfully', async () => {
      const mockSchedule = { id: 'schedule-id', userId: 'user-id', hari: 1 };
      const mockUpdated = { ...mockSchedule, jamMulai: '09:00' };

      (prisma.schedule.findUnique as any).mockResolvedValue(mockSchedule);
      (prisma.schedule.update as any).mockResolvedValue(mockUpdated);

      const result = await scheduleService.updateSchedule('schedule-id', {
        jamMulai: '09:00'
      });

      expect(result).toEqual(mockUpdated);
    });

    it('should throw error if schedule not found', async () => {
      (prisma.schedule.findUnique as any).mockResolvedValue(null);

      await expect(
        scheduleService.updateSchedule('nonexistent', { jamMulai: '09:00' })
      ).rejects.toThrow('Jadwal tidak ditemukan');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule successfully', async () => {
      (prisma.schedule.findUnique as any).mockResolvedValue({ id: 'schedule-id' });
      (prisma.schedule.delete as any).mockResolvedValue({});

      const result = await scheduleService.deleteSchedule('schedule-id');
      expect(result.message).toBe('Jadwal berhasil dihapus');
    });

    it('should throw error if schedule not found', async () => {
      (prisma.schedule.findUnique as any).mockResolvedValue(null);

      await expect(
        scheduleService.deleteSchedule('nonexistent')
      ).rejects.toThrow('Jadwal tidak ditemukan');
    });
  });

  describe('createHoliday', () => {
    it('should create holiday successfully', async () => {
      const mockHoliday = {
        id: 'holiday-id',
        nama: 'Natal',
        tanggal: new Date('2024-12-25')
      };

      (prisma.holiday.findFirst as any).mockResolvedValue(null);
      (prisma.holiday.create as any).mockResolvedValue(mockHoliday);

      const result = await scheduleService.createHoliday({
        nama: 'Natal',
        tanggal: '2024-12-25'
      });

      expect(result).toEqual(mockHoliday);
    });

    it('should throw error if holiday already exists', async () => {
      (prisma.holiday.findFirst as any).mockResolvedValue({ id: 'existing' });

      await expect(
        scheduleService.createHoliday({
          nama: 'Natal',
          tanggal: '2024-12-25'
        })
      ).rejects.toThrow('Hari libur untuk tanggal tersebut sudah ada');
    });
  });
});
