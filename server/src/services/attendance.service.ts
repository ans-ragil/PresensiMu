import prisma from '../config/database';
import { calculateDistance, formatLocation } from '../utils/location';

interface ClockInInput {
  userId: string;
  latitude: number;
  longitude: number;
  selfie: string; // base64 encoded
}

interface ClockOutInput {
  userId: string;
  latitude: number;
  longitude: number;
  selfie: string;
}

interface LocationInput {
  latitude: number;
  longitude: number;
}

// Default company location (can be configured per company later)
const DEFAULT_COMPANY_LOCATION = {
  lat: -6.2088, // Jakarta coordinates as default
  lng: 106.8456
};
const DEFAULT_RADIUS = 500; // 500 meters

export class AttendanceService {
  async clockIn(data: ClockInInput) {
    const { userId, latitude, longitude, selfie } = data;

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_tanggal: {
          userId,
          tanggal: today
        }
      }
    });

    if (existingAttendance && existingAttendance.clockIn) {
      throw new Error('Anda sudah melakukan clock in hari ini');
    }

    // Get user's schedule for today
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
    const schedule = await prisma.schedule.findUnique({
      where: {
        userId_hari: {
          userId,
          hari: dayOfWeek
        }
      }
    });

    // Validate location against company radius
    const companyLocation = await prisma.companyLocation.findFirst();
    const location = formatLocation({ lat: latitude, lng: longitude });

    let radiusWarning: { isWithinRadius: boolean; distance: number; radius: number } | null = null;

    if (companyLocation) {
      const distance = calculateDistance(
        { lat: latitude, lng: longitude },
        { lat: companyLocation.latitude, lng: companyLocation.longitude }
      );
      const withinRadius = distance <= companyLocation.radius;

      if (!withinRadius) {
        radiusWarning = {
          isWithinRadius: false,
          distance: Math.round(distance),
          radius: companyLocation.radius
        };
      }
    }

    // Determine status based on schedule
    let status: string = 'HADIR';
    const now = new Date();
    
    if (schedule) {
      const [jamMulai] = schedule.jamMulai.split(':').map(Number);
      const toleransi = schedule.toleransiMenit || 30;
      
      const scheduleStart = new Date(today);
      scheduleStart.setHours(jamMulai, 0, 0, 0);
      scheduleStart.setMinutes(scheduleStart.getMinutes() + toleransi);
      
      if (now > scheduleStart) {
        status = 'TERLAMBAT';
      }
    }

    // Create or update attendance record
    let attendance;
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          clockIn: now,
          lokasiIn: location,
          fotoIn: selfie,
          status
        }
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          userId,
          tanggal: today,
          clockIn: now,
          lokasiIn: location,
          fotoIn: selfie,
          status
        }
      });
    }

    return {
      attendance,
      radiusWarning
    };
  }

  async clockOut(data: ClockOutInput) {
    const { userId, latitude, longitude, selfie } = data;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_tanggal: {
          userId,
          tanggal: today
        }
      }
    });

    if (!attendance) {
      throw new Error('Anda belum melakukan clock in hari ini');
    }

    if (attendance.clockOut) {
      throw new Error('Anda sudah melakukan clock out hari ini');
    }

    // Validate location against company radius
    const companyLocation = await prisma.companyLocation.findFirst();
    const location = formatLocation({ lat: latitude, lng: longitude });

    let radiusWarning: { isWithinRadius: boolean; distance: number; radius: number } | null = null;

    if (companyLocation) {
      const distance = calculateDistance(
        { lat: latitude, lng: longitude },
        { lat: companyLocation.latitude, lng: companyLocation.longitude }
      );
      const withinRadius = distance <= companyLocation.radius;

      if (!withinRadius) {
        radiusWarning = {
          isWithinRadius: false,
          distance: Math.round(distance),
          radius: companyLocation.radius
        };
      }
    }

    // Get schedule to check if early leave
    const dayOfWeek = today.getDay();
    const schedule = await prisma.schedule.findUnique({
      where: {
        userId_hari: {
          userId,
          hari: dayOfWeek
        }
      }
    });

    let status = attendance.status;
    const now = new Date();

    if (schedule) {
      const [jamSelesai] = schedule.jamSelesai.split(':').map(Number);
      const toleransi = schedule.toleransiMenit || 30;
      
      const scheduleEnd = new Date(today);
      scheduleEnd.setHours(jamSelesai, 0, 0, 0);
      scheduleEnd.setMinutes(scheduleEnd.getMinutes() - toleransi);
      
      if (now < scheduleEnd) {
        status = 'PULANG_CEPAT';
      }
    }

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: now,
        lokasiOut: location,
        fotoOut: selfie,
        status
      }
    });

    return {
      attendance: updatedAttendance,
      radiusWarning
    };
  }

  async getTodayStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_tanggal: {
          userId,
          tanggal: today
        }
      }
    });

    // Get today's schedule
    const dayOfWeek = today.getDay();
    const schedule = await prisma.schedule.findUnique({
      where: {
        userId_hari: {
          userId,
          hari: dayOfWeek
        }
      }
    });

    return {
      attendance: attendance || null,
      schedule: schedule || null,
      date: today
    };
  }

  async getHistory(userId: string, startDate?: string, endDate?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate) : new Date(today);
    start.setDate(start.getDate() - 30); // Default: last 30 days
    
    const end = endDate ? new Date(endDate) : today;
    end.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        tanggal: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return attendance;
  }

  async getSchedule(userId: string) {
    const schedules = await prisma.schedule.findMany({
      where: { userId },
      orderBy: { hari: 'asc' }
    });

    return schedules;
  }

  async getCompanyLocation() {
    const location = await prisma.companyLocation.findFirst();
    return location || null;
  }

  async getHistoryStats(userId: string, startDate?: string, endDate?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate) : new Date(today);
    start.setDate(start.getDate() - 30);

    const end = endDate ? new Date(endDate) : today;
    end.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        userId,
        tanggal: { gte: start, lte: end }
      },
      orderBy: { tanggal: 'desc' }
    });

    const stats = {
      hadir: 0,
      terlambat: 0,
      alpha: 0,
      izin: 0,
      cuti: 0,
      pulangCepat: 0,
      total: records.length
    };

    for (const r of records) {
      switch (r.status) {
        case 'HADIR': stats.hadir++; break;
        case 'TERLAMBAT': stats.terlambat++; break;
        case 'ALPHA': stats.alpha++; break;
        case 'IZIN': stats.izin++; break;
        case 'CUTI': stats.cuti++; break;
        case 'PULANG_CEPAT': stats.pulangCepat++; break;
      }
    }

    // Weekly data (last 4 weeks)
    const weeklyData: { minggu: string; hadir: number; terlambat: number; alpha: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (w * 7 + today.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekRecords = records.filter(r => {
        const t = new Date(r.tanggal);
        return t >= weekStart && t <= weekEnd;
      });

      weeklyData.push({
        minggu: `Minggu ${4 - w}`,
        hadir: weekRecords.filter(r => r.status === 'HADIR').length,
        terlambat: weekRecords.filter(r => r.status === 'TERLAMBAT').length,
        alpha: weekRecords.filter(r => r.status === 'ALPHA').length
      });
    }

    // Monthly data (last 6 months)
    const monthlyData: { bulan: string; hadir: number; terlambat: number; alpha: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - m);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthRecords = records.filter(r => {
        const t = new Date(r.tanggal);
        return t >= monthStart && t <= monthEnd;
      });

      const bulan = monthDate.toLocaleDateString('id-ID', { month: 'short' });
      monthlyData.push({
        bulan,
        hadir: monthRecords.filter(r => r.status === 'HADIR').length,
        terlambat: monthRecords.filter(r => r.status === 'TERLAMBAT').length,
        alpha: monthRecords.filter(r => r.status === 'ALPHA').length
      });
    }

    return { stats, weeklyData, monthlyData };
  }
}

export const attendanceService = new AttendanceService();
