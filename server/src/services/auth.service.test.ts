import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import bcrypt from 'bcryptjs';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        nama: 'Test User',
        email: 'test@test.com',
        role: 'EMPLOYEE',
        noTelp: null,
        createdAt: new Date()
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const result = await authService.register({
        nama: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' }
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register({
          nama: 'Test User',
          email: 'existing@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Email sudah terdaftar');
    });

    it('should hash password before storing', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({});

      await authService.register({
        nama: 'Test',
        email: 'test@test.com',
        password: 'mypassword'
      });

      const createCall = (prisma.user.create as any).mock.calls[0][0];
      const hashedPassword = createCall.data.password;

      // Password should be hashed, not plain text
      expect(hashedPassword).not.toBe('mypassword');
      expect(await bcrypt.compare('mypassword', hashedPassword)).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-id',
        nama: 'Test User',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        noTelp: null
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123'
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'notfound@test.com',
          password: 'password123'
        })
      ).rejects.toThrow('Email atau password salah');
    });

    it('should throw error if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'EMPLOYEE'
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Email atau password salah');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: 'user-id',
        nama: 'Test',
        email: 'test@test.com',
        role: 'EMPLOYEE',
        noTelp: null,
        createdAt: new Date()
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await authService.getUserById('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(authService.getUserById('nonexistent')).rejects.toThrow(
        'User tidak ditemukan'
      );
    });
  });
});
