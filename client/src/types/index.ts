export interface User {
  id: string;
  nama: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
  noTelp: string | null;
  nik: string | null;
  jabatan: string | null;
  divisi: string | null;
  alamat: string | null;
  foto: string | null;
  tanggalBergabung: string | null;
}

export interface Attendance {
  id: string;
  tanggal: string;
  clockIn: string | null;
  clockOut: string | null;
  lokasiIn: string | null;
  lokasiOut: string | null;
  fotoIn: string | null;
  fotoOut: string | null;
  status: string;
}

export interface Schedule {
  id: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType: string;
  toleransiMenit: number;
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

export interface LeaveBalance {
  cuti: number;
  izin: number;
}

export interface PendingLeave {
  id: string;
  tipeIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
}

export interface Holiday {
  id: string;
  nama: string;
  tanggal: string;
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
    leaveBalance: LeaveBalance;
  };
  pendingLeaves: PendingLeave[];
  holidays: Holiday[];
  weeklyAttendance: WeeklyData[];
}
