import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from './auth';
import { generateAccessToken } from '../utils/jwt';

// Mock prisma
vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

import prisma from '../config/database';

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should return 401 if no authorization header', async () => {
    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token tidak ditemukan'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    mockReq.headers.authorization = 'Basic abc123';

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token tidak valid atau sudah expired'
    });
  });

  it('should return 401 if user not found', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@test.com',
      role: 'EMPLOYEE'
    };
    const token = generateAccessToken(mockUser);

    mockReq.headers.authorization = `Bearer ${token}`;
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'User tidak ditemukan'
    });
  });

  it('should call next and attach user for valid token', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@test.com',
      role: 'EMPLOYEE'
    };
    const token = generateAccessToken(mockUser);

    mockReq.headers.authorization = `Bearer ${token}`;
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role
    });
  });
});
