import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LeaveBalance {
  cutiTahunan: { total: number; used: number; remaining: number };
  izinSakit: { total: number; used: number; remaining: number };
  izinPribadi: { total: number; used: number; remaining: number };
}

const leaveTypes = [
  { value: 'CUTI_TAHUNAN', label: 'Cuti Tahunan', icon: '🏖️', desc: 'Cuti tahunan karyawan' },
  { value: 'IZIN_SAKIT', label: 'Izin Sakit', icon: '🤒', desc: 'Izin karena sakit' },
  { value: 'IZIN_PRIBADI', label: 'Izin Pribadi', icon: '📋', desc: 'Izin keperluan pribadi' },
  { value: 'LIBUR_LOKAL', label: 'Libur Lokal', icon: '🎊', desc: 'Libur hari lokal' },
];

const steps = ['Jenis', 'Tanggal', 'Dokumen', 'Review', 'Submit'];

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [formData, setFormData] = useState({
    tipeIzin: 'CUTI_TAHUNAN',
    tanggalMulai: '',
    tanggalSelesai: '',
    keterangan: '',
  });
  const [bukti, setBukti] = useState<string | null>(null);
  const [buktiName, setBuktiName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/leave-request/balance').then(r => setBalance(r.data.data)).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Ukuran bukti maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setBukti((reader.result as string).split(',')[1]); setBuktiName(file.name); setError(null); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.tanggalMulai || !formData.tanggalSelesai) { setError('Tanggal wajib diisi'); return; }
    if (new Date(formData.tanggalMulai) > new Date(formData.tanggalSelesai)) { setError('Tanggal mulai harus sebelum tanggal selesai'); return; }

    setIsLoading(true);
    try {
      await api.post('/leave-request', { ...formData, bukti });
      setSuccess(true);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat pengajuan');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = leaveTypes.find(t => t.value === formData.tipeIzin);
  const days = formData.tanggalMulai && formData.tanggalSelesai
    ? Math.ceil((new Date(formData.tanggalSelesai).getTime() - new Date(formData.tanggalMulai).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const canNext = () => {
    if (step === 0) return true;
    if (step === 1) return formData.tanggalMulai && formData.tanggalSelesai && new Date(formData.tanggalMulai) <= new Date(formData.tanggalSelesai);
    if (step === 2) return true;
    return false;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => step > 0 && !success ? setStep(step - 1) : navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Pengajuan Cuti/Izin</h1>
      </div>

      {/* Progress Steps */}
      {!success && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-6" />
            <div className="absolute top-4 left-0 h-0.5 bg-blue-500 mx-6 transition-all duration-500" style={{ width: `calc(${step * (100 / (steps.length - 1))}% - 1.5rem)` }} />
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-blue-500 text-white' : i === step ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <p className={`text-[10px] mt-1 font-medium ${i === step ? 'text-blue-600' : i < step ? 'text-blue-500' : 'text-gray-400'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-[300px]">
        {/* Step 0: Jenis */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">Pilih Jenis Cuti/Izin</h2>
            {leaveTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, tipeIzin: type.value })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.tipeIzin === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.desc}</p>
                  </div>
                </div>
              </button>
            ))}
            {balance && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-2">Saldo Tersedia</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold text-blue-600">{balance.cutiTahunan.remaining}</p><p className="text-[10px] text-gray-500">Cuti</p></div>
                  <div><p className="text-lg font-bold text-amber-600">{balance.izinSakit.remaining}</p><p className="text-[10px] text-gray-500">Sakit</p></div>
                  <div><p className="text-lg font-bold text-emerald-600">{balance.izinPribadi.remaining}</p><p className="text-[10px] text-gray-500">Pribadi</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Tanggal */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Pilih Tanggal</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
              <input type="date" value={formData.tanggalMulai} onChange={e => setFormData({ ...formData, tanggalMulai: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
              <input type="date" value={formData.tanggalSelesai} onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {days > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-sm text-blue-700 font-medium">{days} hari kerja</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <textarea value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Keterangan (opsional)" />
            </div>
          </div>
        )}

        {/* Step 2: Dokumen */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Upload Dokumen</h2>
            <p className="text-sm text-gray-500">Unggah bukti pendukung (opsional). Format: JPG, PNG, PDF. Maks 2MB.</p>
            <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              {bukti ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-emerald-600">{buktiName}</p>
                  <p className="text-xs text-gray-400">Klik untuk mengganti</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Klik untuk upload</p>
                  <p className="text-xs text-gray-400">atau seret file ke sini</p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">Review Pengajuan</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Jenis</span>
                <span className="text-sm font-medium text-gray-900">{selectedType?.icon} {selectedType?.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Tanggal Mulai</span>
                <span className="text-sm font-medium text-gray-900">{formData.tanggalMulai ? new Date(formData.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Tanggal Selesai</span>
                <span className="text-sm font-medium text-gray-900">{formData.tanggalSelesai ? new Date(formData.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Durasi</span>
                <span className="text-sm font-medium text-gray-900">{days} hari</span>
              </div>
              {formData.keterangan && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Keterangan</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formData.keterangan}</p>
                </div>
              )}
              {bukti && (
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Dokumen</span>
                  <span className="text-sm font-medium text-emerald-600">✓ {buktiName}</span>
                </div>
              )}
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Pengajuan Berhasil!</h2>
            <p className="text-sm text-gray-500 mb-6">Pengajuan cuti/izin Anda telah dikirim dan menunggu persetujuan admin.</p>
            <button onClick={() => navigate('/employee/leave-history')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Lihat Riwayat
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {!success && (
        <div className="flex gap-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            {step === 0 ? 'Batal' : 'Kembali'}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Selanjutnya
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;
