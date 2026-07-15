export type UserRole = 'EMPLOYEE' | 'ADMIN' | 'HR' | 'SUPER_ADMIN';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  noTelp: string | null;
  nik: string | null;
  jabatan: string | null;
  divisi: string | null;
  alamat: string | null;
  foto: string | null;
  tanggalBergabung: string | null;
  isActive?: boolean;
  divisiId?: string | null;
  jabatanId?: string | null;
  shiftId?: string | null;
  division?: Division | null;
  position?: Position | null;
  shift?: Shift | null;
  createdAt?: string;
}

export interface Division {
  id: string;
  nama: string;
  description: string | null;
  isActive: boolean;
  _count?: { users: number };
}

export interface Position {
  id: string;
  nama: string;
  description: string | null;
  level: number;
  isActive: boolean;
  _count?: { users: number };
}

export interface Shift {
  id: string;
  nama: string;
  jamMulai: string;
  jamSelesai: string;
  toleransiMenit: number;
  isActive: boolean;
  _count?: { users: number };
}

export interface Attendance {
  id: string;
  userId: string;
  tanggal: string;
  clockIn: string | null;
  clockOut: string | null;
  lokasiIn: string | null;
  lokasiOut: string | null;
  fotoIn: string | null;
  fotoOut: string | null;
  status: string;
  keterangan: string | null;
  user?: User;
  employee?: User;
}

export interface Schedule {
  id: string;
  userId: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType: string;
  toleransiMenit: number;
  user?: User;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  tipeIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string | null;
  bukti: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy: string | null;
  catatanAdmin: string | null;
  user?: User;
  approver?: User | null;
  createdAt: string;
}

export interface Holiday {
  id: string;
  nama: string;
  tanggal: string;
}

export interface CompanyLocation {
  id: string;
  nama: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface WorkDuration {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

export interface MonthlyStats {
  hadir: number;
  terlambat: number;
  alpha: number;
  izin: number;
  cuti: number;
  wfh: number;
}

export interface WeeklyData {
  tanggal: string;
  status: string;
  clockIn: string | null;
  clockOut: string | null;
}

export interface DashboardData {
  user: User;
  today: {
    attendance: Attendance | null;
    schedule: Schedule | null;
    workDuration: WorkDuration | null;
    workProgress: number;
    latenessMinutes: number;
  };
  monthly: {
    stats: MonthlyStats;
    leaveBalance: { cuti: number; izin: number };
  };
  pendingLeaves: { id: string; tipeIzin: string; tanggalMulai: string; tanggalSelesai: string; status: string }[];
  holidays: Holiday[];
  weeklyAttendance: WeeklyData[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeFilter {
  search?: string;
  divisiId?: string;
  jabatanId?: string;
  shiftId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DailyReport {
  date: string;
  totalEmployees: number;
  hadir: number;
  terlambat: number;
  pulangCepat: number;
  alpha: number;
  cuti: number;
  izin: number;
  details: {
    userId: string;
    nama: string;
    email: string;
    status: string;
    clockIn: string | null;
    clockOut: string | null;
    keterangan: string | null;
  }[];
}
