import prisma from '../config/database';

interface DashboardSummary {
  totalEmployees: number;
  todayAttendance: {
    hadir: number;
    terlambat: number;
    alpha: number;
    cuti: number;
    izin: number;
  };
  pendingLeaves: number;
  recentLeaves: any[];
}

export class AdminService {
  async getDashboard(): Promise<DashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await prisma.user.count({
      where: { role: 'EMPLOYEE' }
    });

    // Today's attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        tanggal: today
      }
    });

    const todayAttendance = {
      hadir: attendance.filter(a => a.status === 'HADIR').length,
      terlambat: attendance.filter(a => a.status === 'TERLAMBAT').length,
      alpha: 0, // Will be calculated
      cuti: attendance.filter(a => a.status === 'CUTI').length,
      izin: attendance.filter(a => a.status === 'IZIN').length
    };

    // Calculate alpha (employees with no attendance today who should have)
    todayAttendance.alpha = totalEmployees - attendance.length;

    // Pending leaves
    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: 'PENDING' }
    });

    // Recent leaves
    const recentLeaves = await prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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

    return {
      totalEmployees,
      todayAttendance,
      pendingLeaves,
      recentLeaves
    };
  }

  async getAllLeaveRequests(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });

    return leaveRequests;
  }

  async getAllAttendance(startDate?: string, endDate?: string) {
    const where: any = {};

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
      orderBy: [
        { tanggal: 'desc' },
        { clockIn: 'asc' }
      ],
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

    return attendance;
  }

  async getAllEmployees() {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        id: true,
        nama: true,
        email: true,
        noTelp: true,
        createdAt: true
      },
      orderBy: { nama: 'asc' }
    });

    return employees;
  }
}

export const adminService = new AdminService();
