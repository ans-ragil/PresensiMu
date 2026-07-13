import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { DashboardSkeleton } from '../components/Skeleton';

interface AttendanceRecord {
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

interface HistoryStats {
  stats: {
    hadir: number;
    terlambat: number;
    alpha: number;
    izin: number;
    cuti: number;
    pulangCepat: number;
    total: number;
  };
  weeklyData: { minggu: string; hadir: number; terlambat: number; alpha: number }[];
  monthlyData: { bulan: string; hadir: number; terlambat: number; alpha: number }[];
}

const statusFilters = ['Semua', 'HADIR', 'TERLAMBAT', 'ALPHA', 'IZIN', 'CUTI', 'PULANG_CEPAT'];
const statusLabels: Record<string, string> = {
  Semua: 'Semua',
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  ALPHA: 'Alpha',
  IZIN: 'Izin',
  CUTI: 'Cuti',
  PULANG_CEPAT: 'Pulang Cepat',
};

const History = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}`;

      const [historyRes, statsRes] = await Promise.all([
        api.get('/attendance/history', { params: { startDate, endDate } }),
        api.get('/attendance/history/stats', { params: { startDate, endDate } }).catch(() => ({ data: { data: null } })),
      ]);
      setRecords(historyRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedStatus !== 'Semua' && r.status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const date = new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
        const status = statusLabels[r.status]?.toLowerCase() || '';
        if (!date.includes(q) && !status.includes(q)) return false;
      }
      return true;
    });
  }, [records, selectedStatus, searchQuery]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const calculateDuration = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return '-';
    const diff = Math.max(0, new Date(clockOut).getTime() - new Date(clockIn).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  const openMaps = (location: string) => {
    try {
      const parsed = JSON.parse(location);
      if (parsed.lat && parsed.lng) {
        window.open(`https://www.google.com/maps?q=${parsed.lat},${parsed.lng}`, '_blank');
      }
    } catch {}
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = filteredRecords
      .map(
        (r) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd">${formatDate(r.tanggal)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${formatTime(r.clockIn)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${formatTime(r.clockOut)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${calculateDuration(r.clockIn, r.clockOut)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${statusLabels[r.status] || r.status}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <html><head><title>Riwayat Absensi - ${months[selectedMonth]} ${selectedYear}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#333}
        h1{font-size:18px;margin-bottom:4px}
        h2{font-size:14px;color:#666;margin-bottom:20px;font-weight:normal}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th{background:#f3f4f6;padding:8px;border:1px solid #ddd;text-align:left;font-size:12px}
        td{font-size:12px}
        .summary{display:flex;gap:20px;margin-bottom:20px}
        .summary div{text-align:center;padding:10px;background:#f9fafb;border-radius:8px;flex:1}
        .summary .num{font-size:24px;font-weight:bold}
        .summary .label{font-size:11px;color:#666}
        @media print{body{padding:10px}}
      </style></head><body>
      <h1>Riwayat Absensi</h1>
      <h2>${months[selectedMonth]} ${selectedYear}</h2>
      ${
        stats
          ? `<div class="summary">
              <div><div class="num" style="color:#16a34a">${stats.stats.hadir}</div><div class="label">Hadir</div></div>
              <div><div class="num" style="color:#d97706">${stats.stats.terlambat}</div><div class="label">Terlambat</div></div>
              <div><div class="num" style="color:#dc2626">${stats.stats.alpha}</div><div class="label">Alpha</div></div>
              <div><div class="num" style="color:#2563eb">${stats.stats.izin}</div><div class="label">Izin</div></div>
              <div><div class="num" style="color:#9333ea">${stats.stats.cuti}</div><div class="label">Cuti</div></div>
            </div>`
          : ''
      }
      <table>
        <thead><tr><th>Tanggal</th><th>Masuk</th><th>Pulang</th><th>Durasi</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:20px;font-size:11px;color:#999">Dicetak: ${new Date().toLocaleString('id-ID')}</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  // Bar chart component
  const BarChart = ({ data, labelKey }: { data: { [k: string]: any }[]; labelKey: string }) => {
    const maxVal = Math.max(...data.map((d) => d.hadir + d.terlambat + d.alpha), 1);
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12 shrink-0">{d[labelKey]}</span>
            <div className="flex-1 flex gap-0.5 h-5 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-emerald-400 h-full transition-all" style={{ width: `${(d.hadir / maxVal) * 100}%` }} />
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${(d.terlambat / maxVal) * 100}%` }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: `${(d.alpha / maxVal) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{d.hadir + d.terlambat + d.alpha}</span>
          </div>
        ))}
        <div className="flex gap-4 justify-center mt-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 bg-emerald-400 rounded-full" />Hadir</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 bg-amber-400 rounded-full" />Terlambat</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 bg-red-400 rounded-full" />Alpha</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Absensi</h1>
        <button
          onClick={handleExportPDF}
          disabled={filteredRecords.length === 0}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          Daftar
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'stats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          Statistik
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari tanggal atau status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                selectedStatus === s ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : activeTab === 'list' ? (
        <>
          {/* Records */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Tidak ada data ditemukan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRecords.map((record) => {
                  const isExpanded = expandedId === record.id;
                  return (
                    <div key={record.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">{formatDate(record.tanggal)}</p>
                          <StatusBadge status={record.status} />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Masuk</p>
                            <p className="font-medium text-gray-900">{formatTime(record.clockIn)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Pulang</p>
                            <p className="font-medium text-gray-900">{formatTime(record.clockOut)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Durasi</p>
                            <p className="font-medium text-gray-900">{calculateDuration(record.clockIn, record.clockOut)}</p>
                          </div>
                        </div>
                        <div className="flex justify-center mt-2">
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-100">
                          {/* Clock In Detail */}
                          {record.clockIn && (
                            <div className="bg-white rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Clock In</p>
                                <p className="text-xs text-gray-500 ml-auto">{formatTime(record.clockIn)}</p>
                              </div>
                              <div className="flex gap-3">
                                {record.fotoIn && (
                                  <img src={`data:image/jpeg;base64,${record.fotoIn}`} alt="Selfie In" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                )}
                                <div className="flex-1 min-w-0 space-y-1">
                                  {record.lokasiIn && (
                                    <button onClick={() => openMaps(record.lokasiIn!)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Lihat di Maps
                                    </button>
                                  )}
                                  {!record.fotoIn && !record.lokasiIn && (
                                    <p className="text-xs text-gray-400 italic">Tidak ada data</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Clock Out Detail */}
                          {record.clockOut && (
                            <div className="bg-white rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Clock Out</p>
                                <p className="text-xs text-gray-500 ml-auto">{formatTime(record.clockOut)}</p>
                              </div>
                              <div className="flex gap-3">
                                {record.fotoOut && (
                                  <img src={`data:image/jpeg;base64,${record.fotoOut}`} alt="Selfie Out" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                )}
                                <div className="flex-1 min-w-0 space-y-1">
                                  {record.lokasiOut && (
                                    <button onClick={() => openMaps(record.lokasiOut!)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Lihat di Maps
                                    </button>
                                  )}
                                  {!record.fotoOut && !record.lokasiOut && (
                                    <p className="text-xs text-gray-400 italic">Tidak ada data</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {!record.clockIn && !record.clockOut && (
                            <p className="text-xs text-gray-400 italic text-center py-2">Tidak ada data detail</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Stats Tab */
        <div className="space-y-4">
          {stats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'hadir', label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { key: 'terlambat', label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { key: 'alpha', label: 'Alpha', color: 'text-red-600', bg: 'bg-red-50' },
                  { key: 'izin', label: 'Izin', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { key: 'cuti', label: 'Cuti', color: 'text-purple-600', bg: 'bg-purple-50' },
                  { key: 'pulangCepat', label: 'Pulang Cepat', color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((s) => (
                  <div key={s.key} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{(stats.stats as any)[s.key]}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Weekly Chart */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Kehadiran Mingguan</h3>
                <BarChart data={stats.weeklyData} labelKey="minggu" />
              </div>

              {/* Monthly Chart */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Kehadiran Bulanan</h3>
                <BarChart data={stats.monthlyData} labelKey="bulan" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="h-2" />
    </div>
  );
};

export default History;
