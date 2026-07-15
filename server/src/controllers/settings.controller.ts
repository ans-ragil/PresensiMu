import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';

export class SettingsController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getAll();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyProfile(_req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await settingsService.getCompanyProfile();
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async setCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address, phone, email } = req.body;
      await settingsService.setCompanyProfile({ name, address, phone, email });
      res.json({ success: true, message: 'Profil perusahaan berhasil disimpan' });
    } catch (error) {
      next(error);
    }
  }

  async getWorkTime(_req: Request, res: Response, next: NextFunction) {
    try {
      const workTime = await settingsService.getWorkTime();
      res.json({ success: true, data: workTime });
    } catch (error) {
      next(error);
    }
  }

  async setWorkTime(req: Request, res: Response, next: NextFunction) {
    try {
      const { workStart, workEnd, toleranceMinutes } = req.body;
      await settingsService.setWorkTime({ workStart, workEnd, toleranceMinutes });
      res.json({ success: true, message: 'Jam kerja berhasil disimpan' });
    } catch (error) {
      next(error);
    }
  }

  async getSmtpSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const smtp = await settingsService.getSmtpSettings();
      res.json({ success: true, data: smtp });
    } catch (error) {
      next(error);
    }
  }

  async setSmtpSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { host, port, user, pass, from } = req.body;
      await settingsService.setSmtpSettings({ host, port, user, pass, from });
      res.json({ success: true, message: 'SMTP settings berhasil disimpan' });
    } catch (error) {
      next(error);
    }
  }

  async getLogo(_req: Request, res: Response, next: NextFunction) {
    try {
      const logo = await settingsService.getLogo();
      res.json({ success: true, data: { logo } });
    } catch (error) {
      next(error);
    }
  }

  async setLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const { logo } = req.body;
      if (!logo) {
        return res.status(400).json({ success: false, message: 'Logo wajib diisi' });
      }
      // Validate base64 size (max 2MB)
      const sizeInBytes = Math.ceil((logo.length * 3) / 4);
      if (sizeInBytes > 2 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Ukuran logo maksimal 2MB' });
      }
      await settingsService.setLogo(logo);
      res.json({ success: true, message: 'Logo berhasil disimpan' });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
