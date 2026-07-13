import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './errorHandler';

describe('Error Handler Middleware', () => {
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
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 500 for unknown errors', () => {
    const error = new Error('Something went wrong');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error'
    });
  });

  it('should return 409 for duplicate email', () => {
    const error = new Error('Email sudah terdaftar');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email sudah terdaftar'
    });
  });

  it('should return 401 for wrong password', () => {
    const error = new Error('Email atau password salah');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('should return 404 for user not found', () => {
    const error = new Error('User tidak ditemukan');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 for validation errors', () => {
    const error = new Error('Nama wajib diisi');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for clock in errors', () => {
    const error = new Error('Anda sudah melakukan clock in hari ini');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for clock out errors', () => {
    const error = new Error('Anda sudah melakukan clock out hari ini');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for schedule errors', () => {
    const error = new Error('Jadwal untuk hari ini sudah ada');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
  });

  it('should return 404 for schedule not found', () => {
    const error = new Error('Jadwal tidak ditemukan');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 for location errors', () => {
    const error = new Error('Latitude harus antara -90 dan 90');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
