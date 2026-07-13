import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

interface RegisterInput {
  nama: string;
  email: string;
  password: string;
  noTelp?: string;
  role?: 'EMPLOYEE' | 'ADMIN';
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterInput) {
    const { nama, email, password, noTelp, role } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        noTelp,
        role: role || 'EMPLOYEE'
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        nik: true,
        jabatan: true,
        divisi: true,
        createdAt: true
      }
    });

    return user;
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Email atau password salah');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        noTelp: user.noTelp,
        nik: user.nik,
        jabatan: user.jabatan,
        divisi: user.divisi
      },
      accessToken,
      refreshToken
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        nik: true,
        jabatan: true,
        divisi: true,
        alamat: true,
        foto: true,
        tanggalBergabung: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return user;
  }

  async updateProfile(id: string, data: { nama?: string; noTelp?: string; alamat?: string; foto?: string }) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        nik: true,
        jabatan: true,
        divisi: true,
        alamat: true,
        foto: true,
        tanggalBergabung: true,
        createdAt: true
      }
    });
    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User tidak ditemukan');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('Password lama salah');

    if (newPassword.length < 6) throw new Error('Password baru minimal 6 karakter');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return true;
  }
}

export const authService = new AuthService();
