import prisma from '../config/database';

interface DailyReport {
  date: string;
  totalEmployees: number;
  hadir: number;
  terlambat: number;
  pulangCepat: number;
  alpha: number;
  cuti: number;
  izin: number;
  details: any[];
}

interface EmployeeReport {
  userId: string;
  nama: string;
  email: string;
  totalDays: number;
  hadir: number;
  terlambat: number;
  alpha: number;
  cuti: number;
  izin: number;
}

export class ReportService {
  async getDailyReport(date?: string): Promise<DailyReport> {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all employees so the report always includes them
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        id: true,
        nama: true,
        email: true
      }
    });

    const totalEmployees = employees.length;

    // Get attendance for the date
    const attendance = await prisma.attendance.findMany({
      where: {
        tanggal: targetDate
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

    // Get approved leaves covering the date
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        tanggalMulai: { lte: targetDate },
        tanggalSelesai: { gte: targetDate }
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

    const attendanceByUser = new Map(attendance.map(a => [a.userId, a]));
    const leaveByUser = new Map(leaves.map(l => [l.userId, l]));

    const details = employees.map(employee => {
      const attendanceRecord = attendanceByUser.get(employee.id);
      const leaveRecord = leaveByUser.get(employee.id);

      if (attendanceRecord) {
        return {
          nama: employee.nama,
          email: employee.email,
          clockIn: attendanceRecord.clockIn,
          clockOut: attendanceRecord.clockOut,
          status: attendanceRecord.status
        };
      }

      if (leaveRecord) {
        return {
          nama: employee.nama,
          email: employee.email,
          clockIn: null,
          clockOut: null,
          status: leaveRecord.tipeIzin === 'CUTI_TAHUNAN' ? 'CUTI' : 'IZIN'
        };
      }

      return {
        nama: employee.nama,
        email: employee.email,
        clockIn: null,
        clockOut: null,
        status: 'ALPHA'
      };
    });

    // Calculate statistics from the detailed view so every employee is accounted for
    const hadir = details.filter(d => d.status === 'HADIR').length;
    const terlambat = details.filter(d => d.status === 'TERLAMBAT').length;
    const pulangCepat = details.filter(d => d.status === 'PULANG_CEPAT').length;
    const cuti = details.filter(d => d.status === 'CUTI').length;
    const izin = details.filter(d => d.status === 'IZIN').length;
    const alpha = details.filter(d => d.status === 'ALPHA').length;

    return {
      date: targetDate.toISOString().split('T')[0],
      totalEmployees,
      hadir,
      terlambat,
      pulangCepat,
      alpha,
      cuti,
      izin,
      details
    };
  }

  async getWeeklyReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    return this.getReportByDateRange(start, end);
  }

  async getMonthlyReport(month?: number, year?: number) {
    const targetMonth = month || new Date().getMonth();
    const targetYear = year || new Date().getFullYear();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    return this.getReportByDateRange(start, end);
  }

  async getEmployeeReport(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true, email: true }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        tanggal: { gte: start, lte: end }
      }
    });

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: 'APPROVED',
        tanggalMulai: { lte: end },
        tanggalSelesai: { gte: start }
      }
    });

    const totalDays = await this.getWorkingDays(start, end);

    return {
      ...user,
      totalDays,
      hadir: attendance.filter(a => a.status === 'HADIR').length,
      terlambat: attendance.filter(a => a.status === 'TERLAMBAT').length,
      pulangCepat: attendance.filter(a => a.status === 'PULANG_CEPAT').length,
      alpha: Math.max(0, totalDays - attendance.length - leaves.length),
      cuti: leaves.filter(l => l.tipeIzin === 'CUTI_TAHUNAN').length,
      izin: leaves.filter(l => l.tipeIzin !== 'CUTI_TAHUNAN').length
    };
  }

  async getLeaveReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        tanggalMulai: { lte: end },
        tanggalSelesai: { gte: start }
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return leaves;
  }

  private async getReportByDateRange(start: Date, end: Date) {
    const totalEmployees = await prisma.user.count({
      where: { role: 'EMPLOYEE' }
    });

    const attendance = await prisma.attendance.findMany({
      where: {
        tanggal: { gte: start, lte: end }
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

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        tanggalMulai: { lte: end },
        tanggalSelesai: { gte: start }
      }
    });

    // Group by employee
    const employeeReports: Record<string, EmployeeReport> = {};

    attendance.forEach(a => {
      if (!employeeReports[a.userId]) {
        employeeReports[a.userId] = {
          userId: a.userId,
          nama: a.user.nama,
          email: a.user.email,
          totalDays: 0,
          hadir: 0,
          terlambat: 0,
          alpha: 0,
          cuti: 0,
          izin: 0
        };
      }

      const report = employeeReports[a.userId];
      if (a.status === 'HADIR') report.hadir++;
      else if (a.status === 'TERLAMBAT') report.terlambat++;
    });

    leaves.forEach(l => {
      if (!employeeReports[l.userId]) {
        // This shouldn't happen, but just in case
        return;
      }

      const report = employeeReports[l.userId];
      if (l.tipeIzin === 'CUTI_TAHUNAN') report.cuti++;
      else report.izin++;
    });

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalEmployees,
      totalRecords: attendance.length,
      summary: {
        hadir: attendance.filter(a => a.status === 'HADIR').length,
        terlambat: attendance.filter(a => a.status === 'TERLAMBAT').length,
        pulangCepat: attendance.filter(a => a.status === 'PULANG_CEPAT').length,
        cuti: leaves.filter(l => l.tipeIzin === 'CUTI_TAHUNAN').length,
        izin: leaves.filter(l => l.tipeIzin !== 'CUTI_TAHUNAN').length
      },
      employees: Object.values(employeeReports)
    };
  }

  private async getWorkingDays(start: Date, end: Date): Promise<number> {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

export const reportService = new ReportService();
