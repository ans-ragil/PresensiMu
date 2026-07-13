import { useState, useEffect } from 'react';
import api from '../../services/api';

interface EmployeeReport {
  userId: string;
  nama: string;
  email: string;
  totalDays: number;
  hadir: number;
  terlambat: number;
  alpha: number;
  cuti: number;
  izin: number;
}

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, date, startDate, endDate, userId]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'daily':
          response = await api.get('/admin/reports/daily', { params: { date } });
          break;
        case 'weekly':
          response = await api.get('/admin/reports/weekly', { params: { startDate, endDate } });
          break;
        case 'monthly':
          response = await api.get('/admin/reports/monthly');
          break;
        case 'employee':
          if (userId) {
            response = await api.get('/admin/reports/employee', { params: { userId, startDate, endDate } });
          }
          break;
        case 'leave':
          response = await api.get('/admin/reports/leave', { params: { startDate, endDate } });
          break;
      }
      if (response) {
        setReportData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const params: any = { format, type: reportType };
      if (reportType === 'daily') params.date = date;
      if (reportType === 'weekly' || reportType === 'leave') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (reportType === 'employee') {
        params.userId = userId;
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await api.get('/admin/reports/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_${reportType}_${date || startDate}.${format === 'xlsx' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const renderDailyReport = () => {
    if (!reportData) return null;
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{reportData.hadir}</p>
            <p className="text-sm text-gray-600">Hadir</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{reportData.terlambat}</p>
            <p className="text-sm text-gray-600">Terlambat</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{reportData.alpha}</p>
            <p className="text-sm text-gray-600">Alpha</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{reportData.totalEmployees}</p>
            <p className="text-sm text-gray-600">Total Karyawan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.details.map((detail: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{detail.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{detail.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {detail.clockIn ? new Date(detail.clockIn).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {detail.clockOut ? new Date(detail.clockOut).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      detail.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                      detail.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {detail.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWeeklyMonthlyReport = () => {
    if (!reportData) return null;
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{reportData.summary?.hadir || 0}</p>
            <p className="text-sm text-gray-600">Hadir</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{reportData.summary?.terlambat || 0}</p>
            <p className="text-sm text-gray-600">Terlambat</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{reportData.summary?.pulangCepat || 0}</p>
            <p className="text-sm text-gray-600">Pulang Cepat</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{reportData.summary?.cuti || 0}</p>
            <p className="text-sm text-gray-600">Cuti</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{reportData.summary?.izin || 0}</p>
            <p className="text-sm text-gray-600">Izin</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cuti</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Izin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.employees?.map((emp: EmployeeReport) => (
                <tr key={emp.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{emp.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{emp.email}</td>
                  <td className="px-4 py-3 text-sm text-center">{emp.hadir}</td>
                  <td className="px-4 py-3 text-sm text-center">{emp.terlambat}</td>
                  <td className="px-4 py-3 text-sm text-center">{emp.cuti}</td>
                  <td className="px-4 py-3 text-sm text-center">{emp.izin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="employee">Per Karyawan</option>
              <option value="leave">Cuti</option>
            </select>
          </div>

          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(reportType === 'weekly' || reportType === 'employee' || reportType === 'leave') && (
            <>
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
            </>
          )}

          {reportType === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Karyawan</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nama}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Pilih tipe laporan dan filter untuk menampilkan data</p>
          </div>
        ) : reportType === 'daily' ? (
          renderDailyReport()
        ) : (
          renderWeeklyMonthlyReport()
        )}
      </div>
    </div>
  );
};

export default Reports;
