import prisma from '../config/database';

interface CreateLeaveInput {
  userId: string;
  tipeIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan?: string;
  bukti?: string;
}

interface UpdateLeaveInput {
  id: string;
  approvedBy: string;
  catatanAdmin?: string;
}

export class LeaveService {
  async createLeave(data: CreateLeaveInput) {
    const { userId, tipeIzin, tanggalMulai, tanggalSelesai, keterangan, bukti } = data;

    // Parse dates
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    // Validate dates
    if (startDate > endDate) {
      throw new Error('Tanggal mulai harus sebelum tanggal selesai');
    }

    // Check for overlapping leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            tanggalMulai: { lte: endDate },
            tanggalSelesai: { gte: startDate }
          }
        ]
      }
    });

    if (overlapping) {
      throw new Error('Sudah ada pengajuan cuti/izin pada tanggal tersebut');
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        tipeIzin,
        tanggalMulai: startDate,
        tanggalSelesai: endDate,
        keterangan,
        bukti
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

    return leaveRequest;
  }

  async getLeaveHistory(userId: string) {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return leaveRequests;
  }

  async getLeaveById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where,
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

    if (!leaveRequest) {
      throw new Error('Pengajuan cuti tidak ditemukan');
    }

    return leaveRequest;
  }

  async approveLeave(data: UpdateLeaveInput) {
    const { id, approvedBy, catatanAdmin } = data;

    // Find leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      throw new Error('Pengajuan cuti tidak ditemukan');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new Error('Pengajuan sudah diproses');
    }

    // Update status
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        catatanAdmin
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

    return updated;
  }

  async rejectLeave(data: UpdateLeaveInput) {
    const { id, approvedBy, catatanAdmin } = data;

    // Find leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      throw new Error('Pengajuan cuti tidak ditemukan');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new Error('Pengajuan sudah diproses');
    }

    // Update status
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy,
        catatanAdmin
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

    return updated;
  }

  async getLeaveBalance(userId: string) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: 'APPROVED',
        tanggalMulai: { gte: yearStart, lte: yearEnd }
      },
      select: { tipeIzin: true, tanggalMulai: true, tanggalSelesai: true }
    });

    const balance = { CUTI_TAHUNAN: 12, IZIN_SAKIT: 30, IZIN_PRIBADI: 3 };
    const used: Record<string, number> = { CUTI_TAHUNAN: 0, IZIN_SAKIT: 0, IZIN_PRIBADI: 0 };

    approvedLeaves.forEach(l => {
      const days = Math.ceil((new Date(l.tanggalSelesai).getTime() - new Date(l.tanggalMulai).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      used[l.tipeIzin] = (used[l.tipeIzin] || 0) + days;
    });

    return {
      cutiTahunan: { total: balance.CUTI_TAHUNAN, used: used.CUTI_TAHUNAN, remaining: balance.CUTI_TAHUNAN - used.CUTI_TAHUNAN },
      izinSakit: { total: balance.IZIN_SAKIT, used: used.IZIN_SAKIT, remaining: balance.IZIN_SAKIT - used.IZIN_SAKIT },
      izinPribadi: { total: balance.IZIN_PRIBADI, used: used.IZIN_PRIBADI, remaining: balance.IZIN_PRIBADI - used.IZIN_PRIBADI },
    };
  }
}

export const leaveService = new LeaveService();
