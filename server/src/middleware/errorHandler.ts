import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err.message);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Custom error messages
  if (err.message === 'Origin tidak diizinkan oleh CORS') {
    statusCode = 403;
    message = err.message;
  } else if (err.message === 'Email sudah terdaftar') {
    statusCode = 409;
    message = err.message;
  } else if (err.message === 'Email atau password salah') {
    statusCode = 401;
    message = err.message;
  } else if (err.message === 'User tidak ditemukan') {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('wajib diisi')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('minimal')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('sudah melakukan clock in')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('sudah melakukan clock out')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('belum melakukan clock in')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Ukuran foto')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Tanggal mulai')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Sudah ada pengajuan')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Pengajuan cuti tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Pengajuan sudah diproses')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Tipe izin tidak valid')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Ukuran bukti')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Jam mulai harus')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Jadwal untuk hari ini sudah ada')) {
    statusCode = 409;
    message = err.message;
  } else if (err.message.includes('Jadwal tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Hari libur untuk tanggal')) {
    statusCode = 409;
    message = err.message;
  } else if (err.message.includes('Hari libur tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Latitude harus')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Longitude harus')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Radius harus')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Format email tidak valid')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes('Pengaturan email tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Karyawan tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Divisi tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Jabatan tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Shift tidak ditemukan')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Nama divisi sudah ada')) {
    statusCode = 409;
    message = err.message;
  } else if (err.message.includes('Nama jabatan sudah ada')) {
    statusCode = 409;
    message = err.message;
  } else if (err.message.includes('Nama shift sudah ada')) {
    statusCode = 409;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};
