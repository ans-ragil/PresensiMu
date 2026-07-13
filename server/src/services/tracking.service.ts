import prisma from '../config/database';
import { parseLocation, isWithinRadius } from '../utils/location';

interface CompanyLocationInput {
  nama: string;
  latitude: number;
  longitude: number;
  radius?: number;
}

interface LiveTrackingData {
  userId: string;
  nama: string;
  email: string;
  clockIn: Date | null;
  clockOut: Date | null;
  lokasiIn: { lat: number; lng: number } | null;
  status: string;
  distance: number | null;
  isWithinRadius: boolean;
}

// Simple in-memory cache
let liveTrackingCache: { data: LiveTrackingData[]; timestamp: number } | null = null;
const CACHE_TTL = 3000; // 3 seconds

export class TrackingService {
  async setCompanyLocation(data: CompanyLocationInput) {
    // Check if location already exists
    const existing = await prisma.companyLocation.findFirst();

    if (existing) {
      // Update existing
      const updated = await prisma.companyLocation.update({
        where: { id: existing.id },
        data: {
          nama: data.nama,
          latitude: data.latitude,
          longitude: data.longitude,
          radius: data.radius || 500
        }
      });
      return updated;
    }

    // Create new
    const location = await prisma.companyLocation.create({
      data: {
        nama: data.nama,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius || 500
      }
    });

    return location;
  }

  async getCompanyLocation() {
    const location = await prisma.companyLocation.findFirst();
    return location;
  }

  async getLiveTracking(): Promise<LiveTrackingData[]> {
    // Return cached data if still valid
    if (liveTrackingCache && Date.now() - liveTrackingCache.timestamp < CACHE_TTL) {
      return liveTrackingCache.data;
    }

    // Get company location
    const companyLocation = await prisma.companyLocation.findFirst();

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all attendance for today
    const attendance = await prisma.attendance.findMany({
      where: {
        tanggal: today,
        clockIn: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });

    // Map to tracking data
    const trackingData: LiveTrackingData[] = attendance.map(record => {
      const lokasiIn = parseLocation(record.lokasiIn);
      let distance: number | null = null;
      let withinRadius = true;

      if (lokasiIn && companyLocation) {
        // Calculate distance using Haversine
        const R = 6371000; // Earth's radius in meters
        const lat1 = companyLocation.latitude * Math.PI / 180;
        const lat2 = lokasiIn.lat * Math.PI / 180;
        const deltaLat = (lokasiIn.lat - companyLocation.latitude) * Math.PI / 180;
        const deltaLng = (lokasiIn.lng - companyLocation.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        distance = R * c;
        withinRadius = distance <= companyLocation.radius;
      }

      return {
        userId: record.user.id,
        nama: record.user.nama,
        email: record.user.email,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        lokasiIn,
        status: record.status,
        distance,
        isWithinRadius: withinRadius
      };
    });

    // Update cache
    liveTrackingCache = { data: trackingData, timestamp: Date.now() };

    return trackingData;
  }

  async getTrackingHistory(userId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        where.tanggal.lte = new Date(endDate);
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      },
      orderBy: [
        { tanggal: 'desc' },
        { clockIn: 'desc' }
      ]
    });

    // Parse locations
    const history = attendance.map(record => ({
      id: record.id,
      user: record.user,
      tanggal: record.tanggal,
      clockIn: record.clockIn,
      clockOut: record.clockOut,
      lokasiIn: parseLocation(record.lokasiIn),
      lokasiOut: parseLocation(record.lokasiOut),
      status: record.status
    }));

    return history;
  }

  async getAlerts() {
    // Get company location
    const companyLocation = await prisma.companyLocation.findFirst();

    if (!companyLocation) {
      return [];
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all attendance for today
    const attendance = await prisma.attendance.findMany({
      where: {
        tanggal: today,
        clockIn: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });

    // Filter out-of-radius
    const alerts = attendance
      .map(record => {
        const lokasiIn = parseLocation(record.lokasiIn);
        if (!lokasiIn) return null;

        const R = 6371000;
        const lat1 = companyLocation.latitude * Math.PI / 180;
        const lat2 = lokasiIn.lat * Math.PI / 180;
        const deltaLat = (lokasiIn.lat - companyLocation.latitude) * Math.PI / 180;
        const deltaLng = (lokasiIn.lng - companyLocation.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;
        const isWithinRadius = distance <= companyLocation.radius;

        if (!isWithinRadius) {
          return {
            userId: record.user.id,
            nama: record.user.nama,
            email: record.user.email,
            clockIn: record.clockIn,
            lokasiIn,
            distance: Math.round(distance),
            radius: companyLocation.radius
          };
        }
        return null;
      })
      .filter(alert => alert !== null);

    return alerts;
  }
}

export const trackingService = new TrackingService();
