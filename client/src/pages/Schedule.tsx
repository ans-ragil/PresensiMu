import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';

interface Schedule {
  id: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType: string;
  toleransiMenit?: number;
}

interface Holiday {
  id: string;
  nama: string;
  tanggal: string;
}

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const shiftConfig: Record<string, { label: string; color: string; dot: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  MORNING: { label: 'Pagi', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  AFTERNOON: { label: 'Siang', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  EVENING: { label: 'Malam', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  WFH: { label: 'WFH', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  WFO: { label: 'WFO', color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
};

const Schedule = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedRes, holidayRes] = await Promise.all([
        api.get('/attendance/schedule'),
        api.get('/admin/holidays').catch(() => ({ data: { data: [] } })),
      ]);
      setSchedules(schedRes.data.data);
      setHolidays(holidayRes.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleMap = useMemo(() => {
    const map: Record<number, Schedule> = {};
    schedules.forEach(s => { map[s.hari] = s; });
    return map;
  }, [schedules]);

  const holidayMap = useMemo(() => {
    const map: Record<string, Holiday> = {};
    holidays.forEach(h => {
      const d = new Date(h.tanggal);
      map[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = h;
    });
    return map;
  }, [holidays]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days: { day: number; date: Date; isToday: boolean; isPast: boolean; schedule?: Schedule; holiday?: Holiday }[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: new Date(), isToday: false, isPast: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const key = `${year}-${month}-${d}`;
      days.push({
        day: d,
        date,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today && date.toDateString() !== today.toDateString(),
        schedule: scheduleMap[dayOfWeek],
        holiday: holidayMap[key],
      });
    }

    return days;
  }, [currentMonth, scheduleMap, holidayMap]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const weeklySchedule = useMemo(() => {
    const days = [1, 2, 3, 4, 5, 6, 0];
    const today = new Date().getDay();
    return days.map(day => ({
      day,
      name: dayNames[day === 0 ? 0 : day],
      schedule: scheduleMap[day],
      isToday: day === today,
    }));
  }, [scheduleMap]);

  const upcomingHolidays = useMemo(() => {
    const now = new Date();
    return holidays
      .filter(h => new Date(h.tanggal) >= now)
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(0, 3);
  }, [holidays]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Jadwal Kerja</h1>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Kalender
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Daftar
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Belum Ada Jadwal</h3>
          <p className="text-sm text-gray-500">Hubungi admin untuk mengatur jadwal kerja Anda</p>
        </div>
      ) : view === 'calendar' ? (
        <>
          {/* Month Navigation */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, i) => (
                <div
                  key={i}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs relative ${
                    item.day === 0 ? '' :
                    item.isToday ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-200' :
                    item.holiday ? 'bg-red-50 text-red-600' :
                    item.schedule ? 'bg-emerald-50 text-emerald-700' :
                    item.isPast ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {item.day > 0 && (
                    <>
                      <span>{item.day}</span>
                      {item.holiday && <span className="text-[8px] leading-none">🔴</span>}
                      {item.schedule && !item.holiday && (
                        <span className={`w-1 h-1 rounded-full mt-0.5 ${shiftConfig[item.schedule.shiftType]?.dot || 'bg-blue-500'}`} />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Keterangan</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-xs text-gray-600">Hari Ini</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-xs text-gray-600">Ada Jadwal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs text-gray-600">Hari Libur</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* List View */
        <div className="space-y-2">
          {weeklySchedule.map(item => (
            <div
              key={item.day}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all ${
                item.isToday ? 'ring-2 ring-blue-200 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                    item.isToday ? 'bg-blue-500 text-white' :
                    item.schedule ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.name}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${item.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][item.day]}
                      {item.isToday && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Hari Ini</span>
                      )}
                    </p>
                    {item.schedule ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{item.schedule.jamMulai} - {item.schedule.jamSelesai}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${shiftConfig[item.schedule.shiftType]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {shiftConfig[item.schedule.shiftType]?.label || item.schedule.shiftType}
                        </span>
                        {item.schedule.toleransiMenit && item.schedule.toleransiMenit > 0 && (
                          <span className="text-[10px] text-gray-400">±{item.schedule.toleransiMenit}m</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Libur</p>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${item.isToday ? 'bg-blue-500 animate-pulse' : item.schedule ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Hari Libur Mendatang</h3>
          <div className="space-y-2">
            {upcomingHolidays.map(h => {
              const diff = Math.ceil((new Date(h.tanggal).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={h.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">🎉</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{h.nama}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(h.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    {diff <= 0 ? 'Hari ini' : `${diff} hari lagi`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
};

export default Schedule;
