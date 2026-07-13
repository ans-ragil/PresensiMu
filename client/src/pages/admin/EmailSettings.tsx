import { useState, useEffect } from 'react';
import api from '../../services/api';

interface EmailSetting {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const EmailSettings = () => {
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/email-settings');
      setSettings(response.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail) {
      setError('Email wajib diisi');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/admin/email-settings', { email: newEmail, isActive: true });
      setSuccess('Email berhasil ditambahkan');
      setNewEmail('');
      fetchSettings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const setting = settings.find(s => s.id === id);
      if (setting) {
        await api.post('/admin/email-settings', { email: setting.email, isActive: !isActive });
        fetchSettings();
      }
    } catch (err) {
      console.error('Error toggling setting:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus email ini?')) return;

    try {
      await api.delete(`/admin/email-settings/${id}`);
      fetchSettings();
    } catch (err) {
      console.error('Error deleting setting:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Email</h1>

      {/* Add Email Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Email</h2>
        <div className="flex gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Masukkan email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={isSaving || !newEmail}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Menambahkan...' : 'Tambah'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Email</h2>
          <p className="text-sm text-gray-500 mt-1">
            Email yang aktif akan menerima laporan otomatis
          </p>
        </div>

        {settings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Belum ada email yang ditambahkan
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {settings.map(setting => (
              <div key={setting.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{setting.email}</p>
                  <p className="text-sm text-gray-500">
                    Status: {setting.isActive ? (
                      <span className="text-green-600">Aktif</span>
                    ) : (
                      <span className="text-gray-500">Nonaktif</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(setting.id, setting.isActive)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                      setting.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {setting.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tentang Laporan Otomatis</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>- Laporan harian akan dikirim setiap hari jam 18:00</li>
          <li>- Laporan mingguan akan dikirim setiap hari Senin jam 08:00</li>
          <li>- Laporan bulanan akan dikirim tanggal 1 setiap bulan</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailSettings;
