import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';

interface Employee {
  id: string;
  nama: string;
  email: string;
}

interface Schedule {
  id: string;
  user: {
    id: string;
    nama: string;
    email: string;
  };
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType: string;
  toleransiMenit: number;
}

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{
    rows: Array<{
      row: number;
      email: string;
      hari: number;
      jamMulai: string;
      jamSelesai: string;
      shiftType: string;
      toleransiMenit: number;
      status: 'valid' | 'error' | 'skip';
      message: string;
      userName?: string;
    }>;
    summary: { total: number; valid: number; error: number; skip: number };
  } | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    hari: 0,
    jamMulai: '08:00',
    jamSelesai: '17:00',
    shiftType: 'NORMAL',
    toleransiMenit: 30
  });

  // Bulk form state
  const [bulkData, setBulkData] = useState({
    userIds: [] as string[],
    hari: 0,
    jamMulai: '08:00',
    jamSelesai: '17:00',
    shiftType: 'NORMAL',
    toleransiMenit: 30
  });

  // Filter state
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDay, setFilterDay] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/admin/schedules');
      setSchedules(response.data.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        userId: schedule.user.id,
        hari: schedule.hari,
        jamMulai: schedule.jamMulai,
        jamSelesai: schedule.jamSelesai,
        shiftType: schedule.shiftType,
        toleransiMenit: schedule.toleransiMenit
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        userId: '',
        hari: 0,
        jamMulai: '08:00',
        jamSelesai: '17:00',
        shiftType: 'NORMAL',
        toleransiMenit: 30
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingSchedule) {
        await api.put(`/admin/schedule/${editingSchedule.id}`, formData);
      } else {
        await api.post('/admin/schedule', formData);
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err: any) {
      console.error('Error saving schedule:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      await api.delete(`/admin/schedule/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const handleBulkAssign = async () => {
    try {
      await api.post('/admin/schedule/bulk', bulkData);
      setIsBulkModalOpen(false);
      fetchSchedules();
    } catch (err: any) {
      console.error('Error bulk assigning:', err);
    }
  };

  const handlePreview = async () => {
    if (!importFile) return;

    setIsPreviewLoading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      const response = await api.post('/admin/schedule/import/preview', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportPreview(response.data.data);
    } catch (err: any) {
      console.error('Error previewing import:', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      const response = await api.post('/admin/schedule/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResults(response.data.data);
      setImportPreview(null);
      fetchSchedules();
    } catch (err: any) {
      console.error('Error importing:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportPreview(null);
    setImportResults(null);
    setImportFile(null);
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };

  const getShiftLabel = (shiftType: string) => {
    const types: Record<string, string> = {
      'NORMAL': 'Normal',
      'MORNING': 'Pagi',
      'AFTERNOON': 'Siang',
      'EVENING': 'Malam'
    };
    return types[shiftType] || shiftType;
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(s => {
    if (filterEmployee && s.user.id !== filterEmployee) return false;
    if (filterDay && s.hari !== parseInt(filterDay)) return false;
    return true;
  });

  // Group schedules by employee
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const userId = schedule.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        employee: schedule.user,
        schedules: []
      };
    }
    acc[userId].schedules.push(schedule);
    return acc;
  }, {} as Record<string, { employee: Employee; schedules: Schedule[] }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Jadwal</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Import Excel
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
          >
            Bulk Assign
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            + Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Karyawan</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nama}</option>
            ))}
          </select>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Hari</option>
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <option key={day} value={day}>{getDayName(day)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {Object.values(groupedSchedules).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Tidak ada jadwal</p>
          </div>
        ) : (
          Object.values(groupedSchedules).map(({ employee, schedules }) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">{employee.nama}</h3>
                <p className="text-sm text-gray-500">{employee.email}</p>
              </div>
              <div className="divide-y divide-gray-200">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{getDayName(schedule.hari)}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-gray-600">{schedule.jamMulai} - {schedule.jamSelesai}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-sm text-gray-500">{getShiftLabel(schedule.shiftType)}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-sm text-gray-500">Toleransi: {schedule.toleransiMenit} menit</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(schedule)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
      >
        <div className="space-y-4">
          {!editingSchedule && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Pilih Karyawan</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nama}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
            <select
              value={formData.hari}
              onChange={(e) => setFormData({ ...formData, hari: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <option key={day} value={day}>{getDayName(day)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={formData.jamMulai}
                onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                value={formData.jamSelesai}
                onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
              <select
                value={formData.shiftType}
                onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="NORMAL">Normal</option>
                <option value="MORNING">Pagi</option>
                <option value="AFTERNOON">Siang</option>
                <option value="EVENING">Malam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toleransi (menit)</label>
              <input
                type="number"
                value={formData.toleransiMenit}
                onChange={(e) => setFormData({ ...formData, toleransiMenit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                max="120"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Assign Jadwal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Karyawan</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {employees.map(emp => (
                <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={bulkData.userIds.includes(emp.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkData({ ...bulkData, userIds: [...bulkData.userIds, emp.id] });
                      } else {
                        setBulkData({ ...bulkData, userIds: bulkData.userIds.filter(id => id !== emp.id) });
                      }
                    }}
                  />
                  <span>{emp.nama}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
            <select
              value={bulkData.hari}
              onChange={(e) => setBulkData({ ...bulkData, hari: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <option key={day} value={day}>{getDayName(day)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={bulkData.jamMulai}
                onChange={(e) => setBulkData({ ...bulkData, jamMulai: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                value={bulkData.jamSelesai}
                onChange={(e) => setBulkData({ ...bulkData, jamSelesai: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkAssign}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        title="Import Jadwal dari Excel"
      >
        <div className="space-y-4">
          {/* Step 1: Pilih file */}
          {!importPreview && !importResults && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-500">
                    <p>Klik untuk memilih file</p>
                    <p className="text-sm mt-1">Format: .xlsx atau .csv</p>
                  </div>
                </label>
                {importFile && (
                  <p className="mt-2 text-sm text-green-600">{importFile.name}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Format kolom:</p>
                <p>email, hari (0-6), jam_mulai (HH:MM), jam_selesai (HH:MM), shift_type, toleransi_menit</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseImportModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handlePreview}
                  disabled={!importFile || isPreviewLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPreviewLoading ? 'Memuat preview...' : 'Preview'}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Preview data */}
          {importPreview && !importResults && (
            <>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{importPreview.summary.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{importPreview.summary.valid}</p>
                  <p className="text-xs text-green-600">Valid</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">{importPreview.summary.error}</p>
                  <p className="text-xs text-red-600">Error</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-yellow-600">{importPreview.summary.skip}</p>
                  <p className="text-xs text-yellow-600">Dilewati</p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Baris</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Nama</th>
                      <th className="px-3 py-2 text-left">Hari</th>
                      <th className="px-3 py-2 text-left">Jam</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {importPreview.rows.map((r, i) => (
                      <tr key={i} className={
                        r.status === 'error' ? 'bg-red-50' :
                        r.status === 'skip' ? 'bg-yellow-50' : 'bg-white'
                      }>
                        <td className="px-3 py-2">{r.row}</td>
                        <td className="px-3 py-2">{r.email}</td>
                        <td className="px-3 py-2">{r.userName || '-'}</td>
                        <td className="px-3 py-2">{getDayName(r.hari)}</td>
                        <td className="px-3 py-2">{r.jamMulai} - {r.jamSelesai}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.status === 'valid' ? 'bg-green-100 text-green-700' :
                            r.status === 'error' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.status === 'valid' ? 'Valid' :
                             r.status === 'error' ? 'Error' : 'Dilewati'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{r.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setImportPreview(null); setImportFile(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importPreview.summary.valid === 0 || isImporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isImporting ? 'Mengimport...' : `Import ${importPreview.summary.valid} Data`}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Hasil import */}
          {importResults && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">Berhasil: {importResults.success}</p>
                <p className="text-yellow-800">Dilewati: {importResults.skipped}</p>
              </div>
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-2">Errors:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResults.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={handleCloseImportModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tutup
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;
