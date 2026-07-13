import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

interface AttendanceRecord {
  id: string;
  user: {
    id: string;
    nama: string;
    email: string;
  };
  tanggal: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

const AdminAttendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/attendance', {
        params: { startDate, endDate }
      });
      setRecords(response.data.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Absensi Karyawan</h1>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchAttendance}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data absensi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{record.user.nama}</p>
                      <p className="text-sm text-gray-500">{record.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(record.tanggal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatTime(record.clockIn)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatTime(record.clockOut)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ringkasan</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              <p className="text-xs text-gray-500">Total Record</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {records.filter(r => r.status === 'HADIR').length}
              </p>
              <p className="text-xs text-gray-500">Hadir</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === 'TERLAMBAT').length}
              </p>
              <p className="text-xs text-gray-500">Terlambat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {records.filter(r => r.status === 'PULANG_CEPAT').length}
              </p>
              <p className="text-xs text-gray-500">Pulang Cepat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {records.filter(r => r.status === 'ALPHA').length}
              </p>
              <p className="text-xs text-gray-500">Alpha</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
