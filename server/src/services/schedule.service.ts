import prisma from '../config/database';
import ExcelJS from 'exceljs';

interface CreateScheduleInput {
  userId: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType?: string;
  toleransiMenit?: number;
}

interface BulkScheduleInput {
  userIds: string[];
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType?: string;
  toleransiMenit?: number;
}

interface CreateHolidayInput {
  nama: string;
  tanggal: string;
}

export class ScheduleService {
  async createSchedule(data: CreateScheduleInput) {
    const { userId, hari, jamMulai, jamSelesai, shiftType, toleransiMenit } = data;

    // Validate times
    if (jamMulai >= jamSelesai) {
      throw new Error('Jam mulai harus sebelum jam selesai');
    }

    // Check for existing schedule
    const existing = await prisma.schedule.findUnique({
      where: {
        userId_hari: { userId, hari }
      }
    });

    if (existing) {
      throw new Error('Jadwal untuk hari ini sudah ada');
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId,
        hari,
        jamMulai,
        jamSelesai,
        shiftType: shiftType || 'NORMAL',
        toleransiMenit: toleransiMenit || 30
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

    return schedule;
  }

  async updateSchedule(id: string, data: Partial<CreateScheduleInput>) {
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      throw new Error('Jadwal tidak ditemukan');
    }

    // Validate times if provided
    if (data.jamMulai && data.jamSelesai) {
      if (data.jamMulai >= data.jamSelesai) {
        throw new Error('Jam mulai harus sebelum jam selesai');
      }
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        jamMulai: data.jamMulai,
        jamSelesai: data.jamSelesai,
        shiftType: data.shiftType,
        toleransiMenit: data.toleransiMenit
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

  async deleteSchedule(id: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      throw new Error('Jadwal tidak ditemukan');
    }

    await prisma.schedule.delete({
      where: { id }
    });

    return { message: 'Jadwal berhasil dihapus' };
  }

  async getSchedules(userId?: string, hari?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (hari !== undefined) where.hari = hari;

    const schedules = await prisma.schedule.findMany({
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
        { userId: 'asc' },
        { hari: 'asc' }
      ]
    });

    return schedules;
  }

  async bulkAssign(data: BulkScheduleInput) {
    const { userIds, hari, jamMulai, jamSelesai, shiftType, toleransiMenit } = data;

    // Validate times
    if (jamMulai >= jamSelesai) {
      throw new Error('Jam mulai harus sebelum jam selesai');
    }

    // Create schedules for each user
    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const userId of userIds) {
      try {
        // Check if schedule exists
        const existing = await prisma.schedule.findUnique({
          where: {
            userId_hari: { userId, hari }
          }
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.schedule.create({
          data: {
            userId,
            hari,
            jamMulai,
            jamSelesai,
            shiftType: shiftType || 'NORMAL',
            toleransiMenit: toleransiMenit || 30
          }
        });

        results.success++;
      } catch (error: any) {
        results.errors.push(`User ${userId}: ${error.message}`);
      }
    }

    return results;
  }

  async previewImport(fileBuffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const sheet = workbook.worksheets[0];

    if (!sheet) {
      throw new Error('File Excel tidak memiliki worksheet');
    }

    const headerRow = sheet.getRow(1);
    const headers = new Map<string, number>();
    headerRow.eachCell((cell, column) => {
      headers.set(String(cell.text).trim().toLowerCase(), column);
    });

    const getCellValue = (rowNumber: number, header: string) => {
      const column = headers.get(header);
      if (!column) return undefined;
      const cell = sheet.getRow(rowNumber).getCell(column);
      return cell.value === null ? undefined : cell.text.trim();
    };

    const data: Record<string, any>[] = [];
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const email = getCellValue(rowNumber, 'email');
      const hariText = getCellValue(rowNumber, 'hari');
      const jamMulai = getCellValue(rowNumber, 'jam_mulai');
      const jamSelesai = getCellValue(rowNumber, 'jam_selesai');

      if (!email && hariText === undefined && !jamMulai && !jamSelesai) continue;

      data.push({
        __row: rowNumber,
        email,
        hari: hariText === undefined || hariText === '' ? undefined : Number(hariText),
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        shift_type: getCellValue(rowNumber, 'shift_type'),
        toleransi_menit: Number(getCellValue(rowNumber, 'toleransi_menit') || 30)
      });
    }

    const rows: Array<{
      row: number;
      email: string;
      hari: number;
      jamMulai: string;
      jamSelesai: string;
      shiftType: string;
      toleransiMenit: number;
      status: 'valid' | 'error' | 'skip';
      message: string;
      userName?: string;
    }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNum = row.__row;

      const entry: any = {
        row: rowNum,
        email: row.email || '',
        hari: row.hari,
        jamMulai: row.jam_mulai || '',
        jamSelesai: row.jam_selesai || '',
        shiftType: row.shift_type || 'NORMAL',
        toleransiMenit: row.toleransi_menit || 30,
        status: 'valid',
        message: ''
      };

      if (!row.email || row.hari === undefined || !row.jam_mulai || !row.jam_selesai) {
        entry.status = 'error';
        entry.message = 'Email, hari, jam_mulai, jam_selesai wajib diisi';
        rows.push(entry);
        continue;
      }

      if (row.hari < 0 || row.hari > 6) {
        entry.status = 'error';
        entry.message = 'Hari harus antara 0-6';
        rows.push(entry);
        continue;
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(row.jam_mulai) || !timeRegex.test(row.jam_selesai)) {
        entry.status = 'error';
        entry.message = 'Format jam harus HH:MM';
        rows.push(entry);
        continue;
      }

      if (row.jam_mulai >= row.jam_selesai) {
        entry.status = 'error';
        entry.message = 'Jam mulai harus sebelum jam selesai';
        rows.push(entry);
        continue;
      }

      const user = await prisma.user.findUnique({
        where: { email: row.email }
      });

      if (!user) {
        entry.status = 'error';
        entry.message = `User dengan email ${row.email} tidak ditemukan`;
        rows.push(entry);
        continue;
      }

      entry.userName = user.nama;

      const existing = await prisma.schedule.findUnique({
        where: {
          userId_hari: { userId: user.id, hari: row.hari }
        }
      });

      if (existing) {
        entry.status = 'skip';
        entry.message = 'Jadwal untuk hari ini sudah ada';
      }

      rows.push(entry);
    }

    const summary = {
      total: rows.length,
      valid: rows.filter(r => r.status === 'valid').length,
      error: rows.filter(r => r.status === 'error').length,
      skip: rows.filter(r => r.status === 'skip').length
    };

    return { rows, summary };
  }

  async importFromExcel(fileBuffer: Buffer) {
    const preview = await this.previewImport(fileBuffer);

    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const entry of preview.rows) {
      if (entry.status === 'error') {
        results.errors.push(`Baris ${entry.row}: ${entry.message}`);
        continue;
      }
      if (entry.status === 'skip') {
        results.skipped++;
        continue;
      }

      const user = await prisma.user.findUnique({
        where: { email: entry.email }
      });

      if (!user) {
        results.errors.push(`Baris ${entry.row}: User tidak ditemukan`);
        continue;
      }

      try {
        await prisma.schedule.create({
          data: {
            userId: user.id,
            hari: entry.hari,
            jamMulai: entry.jamMulai,
            jamSelesai: entry.jamSelesai,
            shiftType: entry.shiftType,
            toleransiMenit: entry.toleransiMenit
          }
        });
        results.success++;
      } catch (error: any) {
        results.errors.push(`Baris ${entry.row}: ${error.message}`);
      }
    }

    return results;
  }

  async createHoliday(data: CreateHolidayInput) {
    const { nama, tanggal } = data;

    const holidayDate = new Date(tanggal);

    // Check for duplicate
    const existing = await prisma.holiday.findFirst({
      where: { tanggal: holidayDate }
    });

    if (existing) {
      throw new Error('Hari libur untuk tanggal tersebut sudah ada');
    }

    const holiday = await prisma.holiday.create({
      data: {
        nama,
        tanggal: holidayDate
      }
    });

    return holiday;
  }

  async getHolidays() {
    const holidays = await prisma.holiday.findMany({
      orderBy: { tanggal: 'asc' }
    });

    return holidays;
  }

  async deleteHoliday(id: string) {
    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      throw new Error('Hari libur tidak ditemukan');
    }

    await prisma.holiday.delete({
      where: { id }
    });

    return { message: 'Hari libur berhasil dihapus' };
  }
}

export const scheduleService = new ScheduleService();
