import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGreeting } from '../hooks/useGreeting';
import { useClock } from '../hooks/useClock';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { DashboardSkeleton } from '../components/Skeleton';
import SectionHeader from '../components/SectionHeader';
import type { DashboardData } from '../types';

const quickMenuItems = [
  { to: '/attendance', label: 'Absensi', bg: 'bg-blue-100', iconColor: 'text-blue-500', icon: ClockIcon },
  { to: '/history', label: 'Riwayat', bg: 'bg-emerald-100', iconColor: 'text-emerald-500', icon: ChartIcon },
  { to: '/schedule', label: 'Jadwal', bg: 'bg-violet-100', iconColor: 'text-violet-500', icon: CalendarIcon },
  { to: '/leave-history', label: 'Cuti', bg: 'bg-amber-100', iconColor: 'text-amber-500', icon: UmbrellaIcon },
  { to: '/leave-request', label: 'Izin', bg: 'bg-rose-100', iconColor: 'text-rose-500', icon: FileIcon },
  { to: '/schedule', label: 'Profile', bg: 'bg-slate-100', iconColor: 'text-slate-500', icon: UserIcon },
];

const statColors: Record<string, string> = {
  hadir: 'bg-emerald-100 text-emerald-600',
  terlambat: 'bg-amber-100 text-amber-600',
  alpha: 'bg-red-100 text-red-600',
  izin: 'bg-blue-100 text-blue-600',
  cuti: 'bg-purple-100 text-purple-600',
  wfh: 'bg-cyan-100 text-cyan-600',
};

const statLabels: Record<string, string> = {
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  alpha: 'Alpha',
  izin: 'Izin',
  cuti: 'Cuti',
  wfh: 'WFH',
};

const statIcons: Record<string, string> = {
  hadir: '✓',
  terlambat: '⏰',
  alpha: '✗',
  izin: '📋',
  cuti: '🏖',
  wfh: '🏠',
};

export default function Dashboard() {
  const { user } = useAuth();
  const greeting = useGreeting();
  const currentTime = useClock();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getDaysUntil = (dateString: string) => {
    const target = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getWeekDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'short' });
  };

  const getWeeklyStatus = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      HADIR: { bg: 'bg-emerald-400', text: 'H' },
      TERLAMBAT: { bg: 'bg-amber-400', text: 'T' },
      ALPHA: { bg: 'bg-red-400', text: 'A' },
      CUTI: { bg: 'bg-purple-400', text: 'C' },
      IZIN: { bg: 'bg-blue-400', text: 'I' },
      WFH: { bg: 'bg-cyan-400', text: 'W' },
    };
    return map[status] || { bg: 'bg-gray-200', text: '-' };
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const today = data?.today;
  const monthly = data?.monthly;

  return (
    <div className="p-4 space-y-4">
      {/* Greeting Section */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{greeting}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-2xl font-bold text-blue-600 font-mono mt-1">
          {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
            {user?.nama?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">{user?.nama}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {user?.nik && (
                <span className="text-xs text-gray-500">NIK: {user.nik}</span>
              )}
              {user?.jabatan && (
                <span className="text-xs text-gray-500">{user.jabatan}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {user?.divisi && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{user.divisi}</span>
              )}
              {today?.schedule && (
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  {today.schedule.jamMulai} - {today.schedule.jamSelesai}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <SectionHeader title="Status Hari Ini" />
        {today?.attendance ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge status={today.attendance.status} />
              {today.latenessMinutes > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Terlambat {today.latenessMinutes} menit
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-medium">Clock In</p>
                <p className="text-xl font-bold text-emerald-700">{formatTime(today.attendance.clockIn)}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-orange-600 font-medium">Clock Out</p>
                <p className="text-xl font-bold text-orange-700">{formatTime(today.attendance.clockOut)}</p>
              </div>
            </div>

            {/* Work Duration & Progress */}
            {today.workDuration && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total: {today.workDuration.hours}j {today.workDuration.minutes}m</span>
                  <span>{today.workProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(today.workProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Belum ada absensi hari ini</p>
            <Link
              to="/attendance"
              className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Clock In Sekarang
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Weekly Attendance Chart */}
      {data?.weeklyAttendance && data.weeklyAttendance.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionHeader title="Kehadiran Minggu Ini" />
          <div className="flex justify-between gap-1">
            {data.weeklyAttendance.slice(-7).map((day, i) => {
              const s = getWeeklyStatus(day.status);
              return (
                <div key={i} className="flex-1 text-center">
                  <p className="text-[10px] text-gray-400 mb-1">{getWeekDayName(day.tanggal)}</p>
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center text-white text-xs font-bold mx-auto`}>
                    {s.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Statistics */}
      {monthly && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionHeader title="Statistik Bulan Ini" />
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(monthly.stats).map(([key, value]) => (
              <div key={key} className="text-center p-2">
                <div className={`w-10 h-10 ${statColors[key]} rounded-full flex items-center justify-center mx-auto text-sm`}>
                  {statIcons[key]}
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-[11px] text-gray-500">{statLabels[key]}</p>
              </div>
            ))}
          </div>

          {/* Leave Balance */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Saldo Cuti</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-purple-600">{monthly.leaveBalance.cuti}</p>
                <p className="text-[10px] text-purple-500">Hari Cuti</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-600">{monthly.leaveBalance.izin}</p>
                <p className="text-[10px] text-blue-500">Hari Izin</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Menu */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <SectionHeader title="Menu Cepat" />
        <div className="grid grid-cols-3 gap-3">
          {quickMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Leaves */}
      {data?.pendingLeaves && data.pendingLeaves.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionHeader
            title="Pengajuan Pending"
            action={
              <Link to="/leave-history" className="text-xs text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            }
          />
          <div className="space-y-2">
            {data.pendingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{leave.tipeIzin}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(leave.tanggalMulai)} - {formatDate(leave.tanggalSelesai)}
                  </p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Holidays */}
      {data?.holidays && data.holidays.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionHeader title="Hari Libur Mendatang" />
          <div className="space-y-2">
            {data.holidays.map((holiday) => {
              const daysUntil = getDaysUntil(holiday.tanggal);
              return (
                <div key={holiday.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎉</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{holiday.nama}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(holiday.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {daysUntil <= 0 ? 'Hari ini' : `${daysUntil} hari lagi`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer for bottom nav */}
      <div className="h-4" />
    </div>
  );
}

/* SVG Icon Components */
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UmbrellaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
