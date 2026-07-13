import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';

interface LeaveRequest {
  id: string;
  user: {
    id: string;
    nama: string;
    email: string;
  };
  tipeIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string | null;
  status: string;
  catatanAdmin: string | null;
  createdAt: string;
}

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/leave-requests', {
        params: { status: filter === 'ALL' ? undefined : filter }
      });
      setLeaves(response.data.data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setModalAction(action);
    setCatatanAdmin('');
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedLeave) return;

    setIsProcessing(true);
    try {
      if (modalAction === 'approve') {
        await api.put(`/admin/leave-request/${selectedLeave.id}/approve`, {
          catatanAdmin
        });
      } else {
        await api.put(`/admin/leave-request/${selectedLeave.id}/reject`, {
          catatanAdmin
        });
      }

      setIsModalOpen(false);
      fetchLeaveRequests();
    } catch (err: any) {
      console.error('Error processing leave:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'CUTI_TAHUNAN': 'Cuti Tahunan',
      'IZIN_SAKIT': 'Izin Sakit',
      'IZIN_PRIBADI': 'Izin Pribadi',
      'LIBUR_LOKAL': 'Libur Lokal'
    };
    return types[type] || type;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' };
      case 'APPROVED':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' };
      case 'REJECTED':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Pengajuan Cuti</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusConfig(status).label}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada pengajuan cuti</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Izin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map(leave => {
                  const statusConfig = getStatusConfig(leave.status);
                  return (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{leave.user.nama}</p>
                        <p className="text-sm text-gray-500">{leave.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getLeaveTypeLabel(leave.tipeIzin)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(leave.tanggalMulai)} - {formatDate(leave.tanggalSelesai)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {leave.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(leave, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleAction(leave, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalAction === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
      >
        <div>
          {selectedLeave && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {selectedLeave.user.nama} mengajukan {getLeaveTypeLabel(selectedLeave.tipeIzin)}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedLeave.tanggalMulai)} - {formatDate(selectedLeave.tanggalSelesai)}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={catatanAdmin}
              onChange={(e) => setCatatanAdmin(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan catatan..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={confirmAction}
              disabled={isProcessing}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                modalAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isProcessing ? 'Memproses...' : modalAction === 'approve' ? 'Setujui' : 'Tolak'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
