import prisma from '../config/database';

export class DashboardService {
  async getDashboardData(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Current month range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Day of week for today's schedule
    const dayOfWeek = today.getDay();

    // Parallel queries
    const [
      user,
      todayAttendance,
      todaySchedule,
      monthlyAttendance,
      pendingLeaves,
      approvedLeaves,
      holidays,
      weeklyAttendance
    ] = await Promise.all([
      // User profile
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          noTelp: true,
          nik: true,
          jabatan: true,
          divisi: true,
          alamat: true,
          foto: true,
          tanggalBergabung: true,
        }
      }),

      // Today's attendance
      prisma.attendance.findUnique({
        where: {
          userId_tanggal: {
            userId,
            tanggal: today
          }
        }
      }),

      // Today's schedule
      prisma.schedule.findUnique({
        where: {
          userId_hari: {
            userId,
            hari: dayOfWeek
          }
        }
      }),

      // Monthly attendance stats
      prisma.attendance.findMany({
        where: {
          userId,
          tanggal: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          status: true,
          clockIn: true,
          clockOut: true
        }
      }),

      // Pending leaves
      prisma.leaveRequest.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        select: {
          id: true,
          tipeIzin: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          status: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Approved leaves (for balance calculation)
      prisma.leaveRequest.findMany({
        where: {
          userId,
          status: 'APPROVED'
        },
        select: {
          tipeIzin: true,
          tanggalMulai: true,
          tanggalSelesai: true
        }
      }),

      // Upcoming holidays
      prisma.holiday.findMany({
        where: {
          tanggal: {
            gte: today
          }
        },
        orderBy: { tanggal: 'asc' },
        take: 3
      }),

      // Weekly attendance (last 7 days)
      prisma.attendance.findMany({
        where: {
          userId,
          tanggal: {
            gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
            lte: monthEnd
          }
        },
        select: {
          tanggal: true,
          status: true,
          clockIn: true,
          clockOut: true
        },
        orderBy: { tanggal: 'asc' }
      })
    ]);

    // Calculate monthly statistics
    const stats = {
      hadir: 0,
      terlambat: 0,
      alpha: 0,
      izin: 0,
      cuti: 0,
      wfh: 0
    };

    monthlyAttendance.forEach(a => {
      switch (a.status) {
        case 'HADIR': stats.hadir++; break;
        case 'TERLAMBAT': stats.terlambat++; break;
        case 'ALPHA': stats.alpha++; break;
        case 'IZIN': stats.izin++; break;
        case 'CUTI': stats.cuti++; break;
        case 'WFH': stats.wfh++; break;
      }
    });

    // Count approved leaves by type
    const leaveBalance = { CUTI: 12, IZIN: 3 }; // Default balance
    const usedLeave = { CUTI: 0, IZIN: 0 };

    approvedLeaves.forEach(l => {
      if (l.tipeIzin === 'CUTI' || l.tipeIzin === 'TAHUNAN') {
        const days = Math.ceil(
          (new Date(l.tanggalSelesai).getTime() - new Date(l.tanggalMulai).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        usedLeave.CUTI += days;
      } else {
        const days = Math.ceil(
          (new Date(l.tanggalSelesai).getTime() - new Date(l.tanggalMulai).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        usedLeave.IZIN += days;
      }
    });

    // Calculate work duration for today
    let workDuration = null;
    let workProgress = 0;
    if (todayAttendance?.clockIn) {
      const clockInTime = new Date(todayAttendance.clockIn);
      const now = todayAttendance.clockOut ? new Date(todayAttendance.clockOut) : new Date();
      const diffMs = now.getTime() - clockInTime.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      workDuration = { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };

      // Calculate progress based on schedule
      if (todaySchedule) {
        const [startH] = todaySchedule.jamMulai.split(':').map(Number);
        const [endH] = todaySchedule.jamSelesai.split(':').map(Number);
        const totalWorkMinutes = (endH - startH) * 60;
        workProgress = Math.min(100, Math.round((workDuration.totalMinutes / totalWorkMinutes) * 100));
      }
    }

    // Lateness in minutes
    let latenessMinutes = 0;
    if (todaySchedule && todayAttendance?.clockIn) {
      const [jamMulai] = todaySchedule.jamMulai.split(':').map(Number);
      const scheduleStart = new Date(today);
      scheduleStart.setHours(jamMulai, 0, 0, 0);
      const clockInTime = new Date(todayAttendance.clockIn);
      if (clockInTime > scheduleStart) {
        latenessMinutes = Math.round((clockInTime.getTime() - scheduleStart.getTime()) / (1000 * 60));
      }
    }

    return {
      user,
      today: {
        attendance: todayAttendance || null,
        schedule: todaySchedule || null,
        workDuration,
        workProgress,
        latenessMinutes
      },
      monthly: {
        stats,
        leaveBalance: {
          cuti: leaveBalance.CUTI - usedLeave.CUTI,
          izin: leaveBalance.IZIN - usedLeave.IZIN
        }
      },
      pendingLeaves,
      holidays,
      weeklyAttendance
    };
  }
}

export const dashboardService = new DashboardService();
