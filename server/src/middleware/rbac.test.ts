import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rbacMiddleware } from './rbac';

describe('RBAC Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should return 401 if user is not attached', () => {
    const middleware = rbacMiddleware(['ADMIN']);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not allowed', () => {
    mockReq.user = { id: '1', email: 'test@test.com', role: 'EMPLOYEE' };
    const middleware = rbacMiddleware(['ADMIN']);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Akses ditolak. Tidak memiliki izin yang cukup'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next if user role is allowed', () => {
    mockReq.user = { id: '1', email: 'test@test.com', role: 'ADMIN' };
    const middleware = rbacMiddleware(['ADMIN']);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should allow multiple roles', () => {
    mockReq.user = { id: '1', email: 'test@test.com', role: 'EMPLOYEE' };
    const middleware = rbacMiddleware(['ADMIN', 'EMPLOYEE']);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
