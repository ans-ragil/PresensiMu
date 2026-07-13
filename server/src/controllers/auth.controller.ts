import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { nama, email, password, noTelp, role } = req.body;

      // Validation
      if (!nama || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama, email, dan password wajib diisi'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal 6 karakter'
        });
      }

      const user = await authService.register({ nama, email, password, noTelp, role });

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi'
        });
      }

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getUserById(userId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { nama, noTelp, alamat, foto } = req.body;

      if (foto) {
        const fotoSize = Buffer.byteLength(foto, 'base64');
        if (fotoSize > 2 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Ukuran foto maksimal 2MB' });
        }
      }

      const user = await authService.updateProfile(userId, { nama, noTelp, alamat, foto });
      res.json({ success: true, message: 'Profil berhasil diperbarui', data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
