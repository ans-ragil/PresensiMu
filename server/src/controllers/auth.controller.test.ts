import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';

// Mock authService
vi.mock('../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getUserById: vi.fn()
  }
}));

import { authService } from '../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController();
    mockReq = { body: {}, user: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('register', () => {
    it('should return 400 if name is missing', async () => {
      mockReq.body = { email: 'test@test.com', password: '123456' };

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Nama, email, dan password wajib diisi'
      });
    });

    it('should return 400 if password is too short', async () => {
      mockReq.body = { nama: 'Test', email: 'test@test.com', password: '123' };

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    });

    it('should register successfully', async () => {
      mockReq.body = { nama: 'Test', email: 'test@test.com', password: '123456' };
      const mockUser = { id: '1', nama: 'Test', email: 'test@test.com' };
      (authService.register as any).mockResolvedValue(mockUser);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registrasi berhasil',
        data: mockUser
      });
    });

    it('should call next on error', async () => {
      mockReq.body = { nama: 'Test', email: 'test@test.com', password: '123456' };
      const error = new Error('Email sudah terdaftar');
      (authService.register as any).mockRejectedValue(error);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      mockReq.body = { password: '123456' };

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    });

    it('should login successfully', async () => {
      mockReq.body = { email: 'test@test.com', password: '123456' };
      const mockResult = {
        user: { id: '1', email: 'test@test.com' },
        accessToken: 'token',
        refreshToken: 'refresh'
      };
      (authService.login as any).mockResolvedValue(mockResult);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login berhasil',
        data: mockResult
      });
    });

    it('should call next on error', async () => {
      mockReq.body = { email: 'test@test.com', password: 'wrong' };
      const error = new Error('Email atau password salah');
      (authService.login as any).mockRejectedValue(error);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      mockReq.user = { id: 'user-id' };
      const mockUser = { id: 'user-id', nama: 'Test', email: 'test@test.com' };
      (authService.getUserById as any).mockResolvedValue(mockUser);

      await controller.getMe(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should call next on error', async () => {
      mockReq.user = { id: 'user-id' };
      const error = new Error('User tidak ditemukan');
      (authService.getUserById as any).mockRejectedValue(error);

      await controller.getMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
