import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrackingService } from './tracking.service';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    companyLocation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    attendance: {
      findMany: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('TrackingService', () => {
  let trackingService: TrackingService;

  beforeEach(() => {
    vi.clearAllMocks();
    trackingService = new TrackingService();
  });

  describe('setCompanyLocation', () => {
    it('should create new location if none exists', async () => {
      const mockLocation = {
        id: 'location-id',
        nama: 'Kantor Pusat',
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };

      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);
      (prisma.companyLocation.create as any).mockResolvedValue(mockLocation);

      const result = await trackingService.setCompanyLocation({
        nama: 'Kantor Pusat',
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      });

      expect(result).toEqual(mockLocation);
      expect(prisma.companyLocation.create).toHaveBeenCalled();
    });

    it('should update existing location', async () => {
      const existingLocation = { id: 'existing-id' };
      const updatedLocation = {
        id: 'existing-id',
        nama: 'Updated',
        latitude: -6.2,
        longitude: 106.8,
        radius: 1000
      };

      (prisma.companyLocation.findFirst as any).mockResolvedValue(existingLocation);
      (prisma.companyLocation.update as any).mockResolvedValue(updatedLocation);

      const result = await trackingService.setCompanyLocation({
        nama: 'Updated',
        latitude: -6.2,
        longitude: 106.8,
        radius: 1000
      });

      expect(result).toEqual(updatedLocation);
      expect(prisma.companyLocation.update).toHaveBeenCalled();
    });
  });

  describe('getCompanyLocation', () => {
    it('should return company location', async () => {
      const mockLocation = {
        id: 'location-id',
        nama: 'Kantor',
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };

      (prisma.companyLocation.findFirst as any).mockResolvedValue(mockLocation);

      const result = await trackingService.getCompanyLocation();
      expect(result).toEqual(mockLocation);
    });

    it('should return null if no location configured', async () => {
      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);

      const result = await trackingService.getCompanyLocation();
      expect(result).toBeNull();
    });
  });

  describe('getLiveTracking', () => {
    it('should return live tracking data', async () => {
      const mockLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };
      const mockAttendance = [
        {
          userId: 'user-1',
          clockIn: new Date(),
          clockOut: null,
          lokasiIn: '{"lat":-6.209,"lng":106.846}',
          status: 'HADIR',
          user: { id: 'user-1', nama: 'User 1', email: 'user1@test.com' }
        }
      ];

      (prisma.companyLocation.findFirst as any).mockResolvedValue(mockLocation);
      (prisma.attendance.findMany as any).mockResolvedValue(mockAttendance);

      const result = await trackingService.getLiveTracking();

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-1');
      expect(result[0].isWithinRadius).toBe(true);
    });

    it('should return empty array if no attendance today', async () => {
      // Wait for cache to expire (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3100));

      (prisma.companyLocation.findFirst as any).mockResolvedValue(null);
      (prisma.attendance.findMany as any).mockResolvedValue([]);

      const result = await trackingService.getLiveTracking();
      expect(result).toHaveLength(0);
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for out-of-radius employees', async () => {
      const mockLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };
      const mockAttendance = [
        {
          userId: 'user-1',
          clockIn: new Date(),
          lokasiIn: '{"lat":-6.9175,"lng":107.6191}', // Bandung - far away
          user: { id: 'user-1', nama: 'User 1', email: 'user1@test.com' }
        }
      ];

      (prisma.companyLocation.findFirst as any).mockResolvedValue(mockLocation);
      (prisma.attendance.findMany as any).mockResolvedValue(mockAttendance);

      const result = await trackingService.getAlerts();

      expect(result).toHaveLength(1);
      expect(result[0].distance).toBeGreaterThan(500);
    });

    it('should return empty array if no alerts', async () => {
      const mockLocation = {
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      };
      const mockAttendance = [
        {
          userId: 'user-1',
          clockIn: new Date(),
          lokasiIn: '{"lat":-6.209,"lng":106.846}', // Within radius
          user: { id: 'user-1', nama: 'User 1', email: 'user1@test.com' }
        }
      ];

      (prisma.companyLocation.findFirst as any).mockResolvedValue(mockLocation);
      (prisma.attendance.findMany as any).mockResolvedValue(mockAttendance);

      const result = await trackingService.getAlerts();
      expect(result).toHaveLength(0);
    });
  });
});
