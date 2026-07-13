import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    noTelp: user?.noTelp || '',
    alamat: user?.alamat || '',
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMsg(null);
    try {
      await api.put('/auth/profile', formData);
      setMsg({ type: 'success', text: 'Profil berhasil diperbarui' });
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg({ type: 'error', text: 'Ukuran foto maksimal 2MB' }); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsSaving(true);
      try {
        await api.put('/auth/profile', { foto: base64 });
        setMsg({ type: 'success', text: 'Foto profil berhasil diperbarui' });
        window.location.reload();
      } catch (err: any) {
        setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal upload foto' });
      } finally { setIsSaving(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' }); return;
    }
    if (passwordData.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password baru minimal 6 karakter' }); return;
    }
    setIsSaving(true);
    setMsg(null);
    try {
      await api.put('/auth/change-password', passwordData);
      setMsg({ type: 'success', text: 'Password berhasil diubah' });
      setShowPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah password' });
    } finally { setIsSaving(false); }
  };

  const infoItems = [
    { label: 'NIK', value: user?.nik || '-', icon: '🪪' },
    { label: 'Email', value: user?.email, icon: '📧' },
    { label: 'No. HP', value: user?.noTelp || '-', icon: '📱' },
    { label: 'Jabatan', value: user?.jabatan || '-', icon: '💼' },
    { label: 'Divisi', value: user?.divisi || '-', icon: '🏢' },
    { label: 'Status', value: 'Aktif', icon: '✅' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.type === 'success' ? '✓' : '✗'} {msg.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="relative inline-block mb-3">
          {user?.foto ? (
            <img src={`data:image/jpeg;base64,${user.foto}`} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()} disabled={isSaving}
            className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{user?.nama}</h2>
        <p className="text-sm text-gray-500">{user?.jabatan || 'Karyawan'}</p>
        {user?.divisi && <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{user.divisi}</span>}
      </div>

      {/* Info List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isEditing ? (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Edit Profil</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama</label>
              <input value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">No. HP</label>
              <input value={formData.noTelp} onChange={e => setFormData({ ...formData, noTelp: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alamat</label>
              <textarea value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl">Batal</button>
              <button onClick={handleSaveProfile} disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {infoItems.map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between px-4 py-3 ${i < infoItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-gray-500">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
            <button onClick={() => setIsEditing(true)}
              className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100">
              ✏️ Edit Profil
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button onClick={() => setShowPassword(!showPassword)}
          className="w-full px-4 py-3 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <span className="text-base">🔒</span>
            <span className="text-sm font-medium text-gray-900">Ganti Password</span>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${showPassword ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showPassword && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password Lama</label>
              <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password Baru</label>
              <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Konfirmasi Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleChangePassword} disabled={isSaving}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        )}
      </div>

      <div className="h-2" />
    </div>
  );
};

export default Profile;
