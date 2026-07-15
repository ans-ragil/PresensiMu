import prisma from '../config/database';
import bcrypt from 'bcryptjs';

interface CreateEmployeeInput {
  nama: string;
  email: string;
  password: string;
  noTelp?: string;
  nik?: string;
  jabatan?: string;
  divisi?: string;
  alamat?: string;
  tanggalBergabung?: string;
  divisiId?: string;
  jabatanId?: string;
  shiftId?: string;
}

interface UpdateEmployeeInput {
  nama?: string;
  email?: string;
  noTelp?: string;
  nik?: string;
  jabatan?: string;
  divisi?: string;
  alamat?: string;
  tanggalBergabung?: string;
  divisiId?: string;
  jabatanId?: string;
  shiftId?: string;
  isActive?: boolean;
}

interface EmployeeFilter {
  search?: string;
  divisiId?: string;
  jabatanId?: string;
  shiftId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class EmployeeService {
  async getAll(filter: EmployeeFilter) {
    const { search, divisiId, jabatanId, shiftId, isActive, page = 1, limit = 10 } = filter;

    const where: any = { role: 'EMPLOYEE' };

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
        { nik: { contains: search } },
        { noTelp: { contains: search } }
      ];
    }

    if (divisiId) where.divisiId = divisiId;
    if (jabatanId) where.jabatanId = jabatanId;
    if (shiftId) where.shiftId = shiftId;
    if (isActive !== undefined) where.isActive = isActive;

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          isActive: true,
          divisiId: true,
          jabatanId: true,
          shiftId: true,
          createdAt: true,
          division: { select: { id: true, nama: true } },
          position: { select: { id: true, nama: true, level: true } },
          shift: { select: { id: true, nama: true, jamMulai: true, jamSelesai: true } }
        },
        orderBy: { nama: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    const employee = await prisma.user.findUnique({
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
        isActive: true,
        divisiId: true,
        jabatanId: true,
        shiftId: true,
        createdAt: true,
        updatedAt: true,
        division: { select: { id: true, nama: true, description: true } },
        position: { select: { id: true, nama: true, level: true, description: true } },
        shift: { select: { id: true, nama: true, jamMulai: true, jamSelesai: true, toleransiMenit: true } }
      }
    });

    if (!employee) {
      throw new Error('Karyawan tidak ditemukan');
    }

    return employee;
  }

  async create(data: CreateEmployeeInput) {
    const { nama, email, password, noTelp, nik, jabatan, divisi, alamat, tanggalBergabung, divisiId, jabatanId, shiftId } = data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email sudah terdaftar');
    }

    // Validate FK references
    if (divisiId) {
      const div = await prisma.division.findUnique({ where: { id: divisiId } });
      if (!div) throw new Error('Divisi tidak ditemukan');
    }
    if (jabatanId) {
      const pos = await prisma.position.findUnique({ where: { id: jabatanId } });
      if (!pos) throw new Error('Jabatan tidak ditemukan');
    }
    if (shiftId) {
      const sft = await prisma.shift.findUnique({ where: { id: shiftId } });
      if (!sft) throw new Error('Shift tidak ditemukan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        noTelp,
        nik,
        jabatan,
        divisi,
        alamat,
        tanggalBergabung: tanggalBergabung ? new Date(tanggalBergabung) : undefined,
        divisiId,
        jabatanId,
        shiftId,
        role: 'EMPLOYEE'
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
        alamat: true,
        foto: true,
        tanggalBergabung: true,
        isActive: true,
        divisiId: true,
        jabatanId: true,
        shiftId: true,
        createdAt: true
      }
    });

    return employee;
  }

  async update(id: string, data: UpdateEmployeeInput) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Karyawan tidak ditemukan');
    }

    // Check email uniqueness if changed
    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new Error('Email sudah terdaftar');
    }

    // Validate FK references
    if (data.divisiId) {
      const div = await prisma.division.findUnique({ where: { id: data.divisiId } });
      if (!div) throw new Error('Divisi tidak ditemukan');
    }
    if (data.jabatanId) {
      const pos = await prisma.position.findUnique({ where: { id: data.jabatanId } });
      if (!pos) throw new Error('Jabatan tidak ditemukan');
    }
    if (data.shiftId) {
      const sft = await prisma.shift.findUnique({ where: { id: data.shiftId } });
      if (!sft) throw new Error('Shift tidak ditemukan');
    }

    const updateData: any = { ...data };
    if (data.tanggalBergabung) {
      updateData.tanggalBergabung = new Date(data.tanggalBergabung);
    }

    const employee = await prisma.user.update({
      where: { id },
      data: updateData,
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
        isActive: true,
        divisiId: true,
        jabatanId: true,
        shiftId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return employee;
  }

  async delete(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Karyawan tidak ditemukan');
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return true;
  }

  async restore(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Karyawan tidak ditemukan');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });

    return true;
  }

  async changePassword(id: string, newPassword: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Karyawan tidak ditemukan');
    }

    if (newPassword.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashed }
    });

    return true;
  }

  // Division CRUD
  async getDivisions() {
    return prisma.division.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
      include: { _count: { select: { users: true } } }
    });
  }

  async createDivision(data: { nama: string; description?: string }) {
    const existing = await prisma.division.findUnique({ where: { nama: data.nama } });
    if (existing) throw new Error('Nama divisi sudah ada');

    return prisma.division.create({
      data: { nama: data.nama, description: data.description }
    });
  }

  async updateDivision(id: string, data: { nama?: string; description?: string; isActive?: boolean }) {
    const existing = await prisma.division.findUnique({ where: { id } });
    if (!existing) throw new Error('Divisi tidak ditemukan');

    if (data.nama && data.nama !== existing.nama) {
      const nameTaken = await prisma.division.findUnique({ where: { nama: data.nama } });
      if (nameTaken) throw new Error('Nama divisi sudah ada');
    }

    return prisma.division.update({ where: { id }, data });
  }

  async deleteDivision(id: string) {
    const existing = await prisma.division.findUnique({ where: { id } });
    if (!existing) throw new Error('Divisi tidak ditemukan');

    await prisma.division.update({ where: { id }, data: { isActive: false } });
    return true;
  }

  // Position CRUD
  async getPositions() {
    return prisma.position.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' },
      include: { _count: { select: { users: true } } }
    });
  }

  async createPosition(data: { nama: string; description?: string; level?: number }) {
    const existing = await prisma.position.findUnique({ where: { nama: data.nama } });
    if (existing) throw new Error('Nama jabatan sudah ada');

    return prisma.position.create({
      data: { nama: data.nama, description: data.description, level: data.level ?? 0 }
    });
  }

  async updatePosition(id: string, data: { nama?: string; description?: string; level?: number; isActive?: boolean }) {
    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) throw new Error('Jabatan tidak ditemukan');

    if (data.nama && data.nama !== existing.nama) {
      const nameTaken = await prisma.position.findUnique({ where: { nama: data.nama } });
      if (nameTaken) throw new Error('Nama jabatan sudah ada');
    }

    return prisma.position.update({ where: { id }, data });
  }

  async deletePosition(id: string) {
    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) throw new Error('Jabatan tidak ditemukan');

    await prisma.position.update({ where: { id }, data: { isActive: false } });
    return true;
  }

  // Shift CRUD
  async getShifts() {
    return prisma.shift.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
      include: { _count: { select: { users: true } } }
    });
  }

  async createShift(data: { nama: string; jamMulai: string; jamSelesai: string; toleransiMenit?: number }) {
    const existing = await prisma.shift.findUnique({ where: { nama: data.nama } });
    if (existing) throw new Error('Nama shift sudah ada');

    if (data.jamMulai >= data.jamSelesai) {
      throw new Error('Jam mulai harus sebelum jam selesai');
    }

    return prisma.shift.create({
      data: {
        nama: data.nama,
        jamMulai: data.jamMulai,
        jamSelesai: data.jamSelesai,
        toleransiMenit: data.toleransiMenit ?? 30
      }
    });
  }

  async updateShift(id: string, data: { nama?: string; jamMulai?: string; jamSelesai?: string; toleransiMenit?: number; isActive?: boolean }) {
    const existing = await prisma.shift.findUnique({ where: { id } });
    if (!existing) throw new Error('Shift tidak ditemukan');

    if (data.nama && data.nama !== existing.nama) {
      const nameTaken = await prisma.shift.findUnique({ where: { nama: data.nama } });
      if (nameTaken) throw new Error('Nama shift sudah ada');
    }

    if (data.jamMulai && data.jamSelesai && data.jamMulai >= data.jamSelesai) {
      throw new Error('Jam mulai harus sebelum jam selesai');
    }

    return prisma.shift.update({ where: { id }, data });
  }

  async deleteShift(id: string) {
    const existing = await prisma.shift.findUnique({ where: { id } });
    if (!existing) throw new Error('Shift tidak ditemukan');

    await prisma.shift.update({ where: { id }, data: { isActive: false } });
    return true;
  }
}

export const employeeService = new EmployeeService();
