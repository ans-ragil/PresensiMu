import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';

interface LeaveRequest {
  id: string;
  tipeIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string | null;
  status: string;
  catatanAdmin: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface LeaveBalance {
  cutiTahunan: { total: number; used: number; remaining: number };
  izinSakit: { total: number; used: number; remaining: number };
  izinPribadi: { total: number; used: number; remaining: number };
}

const leaveTypeLabels: Record<string, string> = {
  CUTI_TAHUNAN: 'Cuti Tahunan', IZIN_SAKIT: 'Izin Sakit', IZIN_PRIBADI: 'Izin Pribadi', LIBUR_LOKAL: 'Libur Lokal',
};

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Menunggu', icon: '⏳' },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Disetujui', icon: '✓' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak', icon: '✗' },
};

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        api.get('/leave-request/history'),
        api.get('/leave-request/balance').catch(() => ({ data: { data: null } })),
      ]);
      setLeaves(leavesRes.data.data);
      setBalance(balanceRes.data.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredLeaves = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);

  const getTimelineSteps = (leave: LeaveRequest) => {
    const steps = [
      { label: 'Diajukan', date: leave.createdAt, done: true },
      { label: 'Review Admin', date: null, done: leave.status !== 'PENDING', current: leave.status === 'PENDING' },
      { label: leave.status === 'REJECTED' ? 'Ditolak' : 'Disetujui', date: leave.status !== 'PENDING' ? leave.updatedAt || leave.createdAt : null, done: leave.status === 'APPROVED', rejected: leave.status === 'REJECTED' },
    ];
    return steps;
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Cuti</h1>
        <Link to="/employee/leave-request" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
          + Ajukan
        </Link>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'cutiTahunan', label: 'Cuti', color: 'blue' },
            { key: 'izinSakit', label: 'Sakit', color: 'amber' },
            { key: 'izinPribadi', label: 'Pribadi', color: 'emerald' },
          ].map(item => {
            const b = (balance as any)[item.key];
            const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
            return (
              <div key={item.key} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                <p className={`text-2xl font-bold text-${item.color}-600`}>{b.remaining}</p>
                <p className="text-[10px] text-gray-500">Sisa {item.label}</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`bg-${item.color}-400 h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">{b.used}/{b.total} terpakai</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[{ k: 'ALL', l: 'Semua' }, { k: 'PENDING', l: 'Menunggu' }, { k: 'APPROVED', l: 'Disetujui' }, { k: 'REJECTED', l: 'Ditolak' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${filter === f.k ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Leave List */}
      <div className="space-y-3">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Tidak ada data</p>
            <Link to="/employee/leave-request" className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium">Ajukan cuti sekarang</Link>
          </div>
        ) : (
          filteredLeaves.map(leave => {
            const sc = statusConfig[leave.status] || statusConfig.PENDING;
            const isExpanded = expandedId === leave.id;
            const timeline = getTimelineSteps(leave);
            return (
              <div key={leave.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : leave.id)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{leaveTypeLabels[leave.tipeIzin] || leave.tipeIzin}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(leave.tanggalMulai)} - {formatDate(leave.tanggalSelesai)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.icon} {sc.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDate(leave.createdAt)}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    {/* Timeline */}
                    <div className="pt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status Approval</p>
                      <div className="space-y-0">
                        {timeline.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-emerald-500' : step.current ? 'bg-blue-500 animate-pulse' : step.rejected ? 'bg-red-500' : 'bg-gray-300'}`} />
                              {i < timeline.length - 1 && <div className={`w-0.5 h-6 ${step.done ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                            </div>
                            <div className="pb-4">
                              <p className={`text-xs font-medium ${step.done ? 'text-gray-900' : step.current ? 'text-blue-600' : 'text-gray-400'}`}>{step.label}</p>
                              {step.date && <p className="text-[10px] text-gray-400">{formatDate(step.date)}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {leave.keterangan && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-medium text-gray-500 mb-1">Keterangan</p>
                        <p className="text-xs text-gray-700">{leave.keterangan}</p>
                      </div>
                    )}
                    {leave.catatanAdmin && (
                      <div className={`p-3 rounded-xl ${leave.status === 'REJECTED' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        <p className="text-[10px] font-medium text-gray-500 mb-1">Catatan Admin</p>
                        <p className={`text-xs ${leave.status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'}`}>{leave.catatanAdmin}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="h-2" />
    </div>
  );
};

export default LeaveHistory;
