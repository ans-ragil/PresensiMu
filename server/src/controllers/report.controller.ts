import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { generateExcel, generateCSV, generatePDF } from '../utils/export';
import prisma from '../config/database';

export class ReportController {
  async getDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const report = await reportService.getDailyReport(date as string);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getWeeklyReport(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await reportService.getMonthlyReport(
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID wajib diisi'
        });
      }

      const report = await reportService.getEmployeeReport(
        userId as string,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getLeaveReport(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { format, type, date, startDate, endDate, userId, month, year } = req.query;

      if (!format || !type) {
        return res.status(400).json({
          success: false,
          message: 'Format dan type wajib diisi'
        });
      }

      // Get report data based on type
      let reportData: any;
      let title: string;

      switch (type) {
        case 'daily':
          reportData = await reportService.getDailyReport(date as string);
          title = `Laporan Harian ${reportData.date}`;
          break;
        case 'weekly':
          reportData = await reportService.getWeeklyReport(startDate as string, endDate as string);
          title = `Laporan Mingguan ${reportData.startDate} - ${reportData.endDate}`;
          break;
        case 'monthly':
          reportData = await reportService.getMonthlyReport(
            month ? parseInt(month as string) : undefined,
            year ? parseInt(year as string) : undefined
          );
          title = `Laporan Bulanan`;
          break;
        case 'employee':
          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID wajib diisi untuk laporan karyawan'
            });
          }
          reportData = await reportService.getEmployeeReport(userId as string, startDate as string, endDate as string);
          title = `Laporan Karyawan ${reportData.nama}`;
          break;
        case 'leave':
          reportData = await reportService.getLeaveReport(startDate as string, endDate as string);
          title = `Laporan Cuti`;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Type laporan tidak valid'
          });
      }

      // Prepare export data
      const exportData = this.prepareExportData(type as string, reportData);

      // Generate file based on format
      switch (format) {
        case 'xlsx': {
          const buffer = await generateExcel(exportData, title);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.xlsx"`);
          res.send(buffer);
          break;
        }
        case 'csv': {
          const csv = generateCSV(exportData);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.csv"`);
          res.send(csv);
          break;
        }
        case 'pdf': {
          const buffer = await generatePDF(exportData, title);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
          res.send(buffer);
          break;
        }
        default:
          return res.status(400).json({
            success: false,
            message: 'Format tidak valid'
          });
      }
    } catch (error) {
      next(error);
    }
  }

  private prepareExportData(type: string, data: any) {
    switch (type) {
      case 'daily':
        return {
          headers: ['Nama', 'Email', 'Clock In', 'Clock Out', 'Status'],
          rows: data.details.map((d: any) => [
            d.nama,
            d.email,
            d.clockIn ? new Date(d.clockIn).toLocaleTimeString('id-ID') : '-',
            d.clockOut ? new Date(d.clockOut).toLocaleTimeString('id-ID') : '-',
            d.status
          ]),
          summary: {
            'Total Karyawan': data.totalEmployees,
            'Hadir': data.hadir,
            'Terlambat': data.terlambat,
            'Pulang Cepat': data.pulangCepat,
            'Alpha': data.alpha,
            'Cuti': data.cuti,
            'Izin': data.izin
          }
        };
      case 'weekly':
      case 'monthly':
        return {
          headers: ['Nama', 'Email', 'Hadir', 'Terlambat', 'Cuti', 'Izin'],
          rows: data.employees.map((e: any) => [
            e.nama,
            e.email,
            e.hadir,
            e.terlambat,
            e.cuti,
            e.izin
          ]),
          summary: data.summary
        };
      case 'employee':
        return {
          headers: ['Metrik', 'Nilai'],
          rows: [
            ['Total Hari Kerja', data.totalDays],
            ['Hadir', data.hadir],
            ['Terlambat', data.terlambat],
            ['Pulang Cepat', data.pulangCepat || 0],
            ['Alpha', data.alpha],
            ['Cuti', data.cuti],
            ['Izin', data.izin]
          ]
        };
      case 'leave':
        return {
          headers: ['Nama', 'Tipe Izin', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Keterangan'],
          rows: data.map((l: any) => [
            l.user.nama,
            l.tipeIzin,
            new Date(l.tanggalMulai).toLocaleDateString('id-ID'),
            new Date(l.tanggalSelesai).toLocaleDateString('id-ID'),
            l.status,
            l.keterangan || '-'
          ])
        };
      default:
        return { headers: [], rows: [] };
    }
  }

  async setEmailSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, isActive } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email wajib diisi'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      const setting = await prisma.emailSetting.upsert({
        where: { email },
        update: { isActive: isActive !== undefined ? isActive : true },
        create: { email, isActive: isActive !== undefined ? isActive : true }
      });

      res.json({
        success: true,
        message: 'Pengaturan email berhasil disimpan',
        data: setting
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmailSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.emailSetting.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmailSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const setting = await prisma.emailSetting.findUnique({
        where: { id }
      });

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'Pengaturan email tidak ditemukan'
        });
      }

      await prisma.emailSetting.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Pengaturan email berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
