import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import CameraCapture from '../components/CameraCapture';
import StatusBadge from '../components/StatusBadge';
import { DashboardSkeleton } from '../components/Skeleton';

interface Attendance {
  id: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

interface Schedule {
  id: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  shiftType: string;
  toleransiMenit: number;
}

interface TodayStatus {
  attendance: Attendance | null;
  schedule: Schedule | null;
  date: string;
}

interface CompanyLocation {
  id: string;
  nama: string;
  latitude: number;
  longitude: number;
  radius: number;
}

type Step = 'gps' | 'selfie' | 'validasi' | 'berhasil';

const steps: { key: Step; label: string }[] = [
  { key: 'gps', label: 'GPS' },
  { key: 'selfie', label: 'Selfie' },
  { key: 'validasi', label: 'Validasi' },
  { key: 'berhasil', label: 'Selesai' },
];

const Attendance = () => {
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [companyLocation, setCompanyLocation] = useState<CompanyLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('gps');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const gpsWatchRef = useRef<number | null>(null);

  const hasClockedIn = !!todayStatus?.attendance?.clockIn;
  const hasClockedOut = !!todayStatus?.attendance?.clockOut;

  // Calculate distance to company
  const distanceInfo = useMemo(() => {
    if (!gpsLocation || !companyLocation) return null;
    const R = 6371000;
    const lat1 = (gpsLocation.lat * Math.PI) / 180;
    const lat2 = (companyLocation.latitude * Math.PI) / 180;
    const dLat = ((companyLocation.latitude - gpsLocation.lat) * Math.PI) / 180;
    const dLng = ((companyLocation.longitude - gpsLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return {
      distance: Math.round(distance),
      radius: companyLocation.radius,
      within: distance <= companyLocation.radius,
    };
  }, [gpsLocation, companyLocation]);

  // Countdown to target pulang
  const countdownInfo = useMemo(() => {
    if (!hasClockedIn || hasClockedOut || !todayStatus?.schedule || !todayStatus?.attendance?.clockIn) return null;
    const now = new Date();
    const [jamSelesai] = todayStatus.schedule.jamSelesai.split(':').map(Number);
    const target = new Date(now);
    target.setHours(jamSelesai, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { text: 'Waktu habis', expired: true };
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { text: `${h}j ${m}m ${s}s`, expired: false };
  }, [hasClockedIn, hasClockedOut, todayStatus, currentTime]);

  useEffect(() => {
    fetchAll();
    startGpsWatch();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(timer);
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, []);

  // Elapsed timer after clock in
  useEffect(() => {
    if (!hasClockedIn || hasClockedOut || !todayStatus?.attendance?.clockIn) return;
    const clockInTime = new Date(todayStatus.attendance.clockIn).getTime();
    const update = () => setElapsedSeconds(Math.floor((Date.now() - clockInTime) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [hasClockedIn, hasClockedOut, todayStatus]);

  // Auto-advance steps
  useEffect(() => {
    if (hasClockedIn && hasClockedOut) {
      setCurrentStep('berhasil');
    } else if (hasClockedIn) {
      if (capturedPhoto) setCurrentStep('validasi');
      else setCurrentStep('selfie');
    } else {
      if (gpsLocation && capturedPhoto) setCurrentStep('validasi');
      else if (gpsLocation) setCurrentStep('selfie');
      else setCurrentStep('gps');
    }
  }, [gpsLocation, capturedPhoto, hasClockedIn, hasClockedOut]);

  const fetchAll = async () => {
    try {
      const [statusRes, locRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/company-location').catch(() => ({ data: { data: null } })),
      ]);
      setTodayStatus(statusRes.data.data);
      setCompanyLocation(locRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startGpsWatch = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Browser tidak mendukung GPS');
      return;
    }
    setGpsError(null);
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      () => setGpsError('Tidak dapat mengakses lokasi GPS'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const refreshGps = () => {
    setGpsLocation(null);
    setGpsError(null);
    if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current);
    startGpsWatch();
  };

  const handlePhotoCaptured = (base64: string) => {
    setCapturedPhoto(base64);
    setError(null);
  };

  const handleClockIn = async () => {
    if (!gpsLocation || !capturedPhoto) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/attendance/clock-in', {
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
        selfie: capturedPhoto,
      });
      setSuccess('Clock in berhasil!');
      setCapturedPhoto(null);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal melakukan clock in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!gpsLocation || !capturedPhoto) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/attendance/clock-out', {
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
        selfie: capturedPhoto,
      });
      setSuccess('Clock out berhasil!');
      setCapturedPhoto(null);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal melakukan clock out');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatElapsed = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStepIndex = (step: Step) => steps.findIndex((s) => s.key === step);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 space-y-4">
      {/* Real-time Clock */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white text-center shadow-lg">
        <p className="text-xs opacity-80">
          {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-4xl font-bold mt-1 font-mono tracking-wider">
          {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        {todayStatus?.schedule && (
          <p className="text-sm mt-2 opacity-90">
            Jadwal: {todayStatus.schedule.jamMulai} - {todayStatus.schedule.jamSelesai}
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-blue-500 mx-8 transition-all duration-500"
            style={{ width: `calc(${getStepIndex(currentStep) * (100 / (steps.length - 1))}% - 2rem)` }}
          />
          {steps.map((step, i) => {
            const isActive = step.key === currentStep;
            const isDone = getStepIndex(step.key) < getStepIndex(currentStep);
            return (
              <div key={step.key} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-blue-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <p className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-blue-600' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Info - After Clock In */}
      {hasClockedIn && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Status Absensi</h3>
            <StatusBadge status={todayStatus?.attendance?.status || 'ACTIVE'} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600 font-medium">Jam Masuk</p>
              <p className="text-xl font-bold text-emerald-700">
                {todayStatus?.attendance?.clockIn
                  ? new Date(todayStatus.attendance.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : '-'}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-600 font-medium">
                {hasClockedOut ? 'Jam Pulang' : 'Target Pulang'}
              </p>
              <p className="text-xl font-bold text-orange-700">
                {hasClockedOut && todayStatus?.attendance?.clockOut
                  ? new Date(todayStatus.attendance.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : todayStatus?.schedule?.jamSelesai || '-'}
              </p>
            </div>
          </div>

          {/* Live Timer */}
          {hasClockedIn && !hasClockedOut && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 font-medium mb-1">Lama Bekerja</p>
              <p className="text-3xl font-bold text-blue-700 font-mono">{formatElapsed(elapsedSeconds)}</p>
              {countdownInfo && (
                <p className={`text-xs mt-2 font-medium ${countdownInfo.expired ? 'text-red-500' : 'text-blue-500'}`}>
                  {countdownInfo.expired ? 'Melewati jam pulang' : `Sisa waktu: ${countdownInfo.text}`}
                </p>
              )}
            </div>
          )}

          {hasClockedOut && (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Absensi hari ini selesai</p>
            </div>
          )}
        </div>
      )}

      {/* Location Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Lokasi</h3>
          <button onClick={refreshGps} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {companyLocation && (
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{companyLocation.nama}</span>
            </div>
            <p className="text-xs text-gray-500">Radius: {companyLocation.radius}m</p>
          </div>
        )}

        {gpsError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700">{gpsError}</p>
            <button onClick={refreshGps} className="mt-1 text-xs text-red-600 underline">Coba lagi</button>
          </div>
        ) : gpsLocation ? (
          <div className="space-y-2">
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-sm text-emerald-700 font-medium">Lokasi aktif</p>
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-mono">
                {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
              </p>
            </div>
            {distanceInfo && (
              <div className={`rounded-xl p-3 ${distanceInfo.within ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Jarak dari kantor</span>
                  <span className={`text-sm font-bold ${distanceInfo.within ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {distanceInfo.distance}m
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {distanceInfo.within ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <span className={`text-xs font-medium ${distanceInfo.within ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {distanceInfo.within ? 'Dalam Radius' : 'Di Luar Radius'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-blue-700">Mendapatkan lokasi GPS...</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Section - Only show when not completed */}
      {!hasClockedOut && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Selfie Verifikasi</h3>
          {capturedPhoto ? (
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={`data:image/jpeg;base64,${capturedPhoto}`}
                  alt="Selfie"
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-medium mt-2">Foto siap</p>
              <button onClick={() => setCapturedPhoto(null)} className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                Ambil Ulang
              </button>
            </div>
          ) : (
            <CameraCapture onCapture={handlePhotoCaptured} disabled={isSubmitting} />
          )}
        </div>
      )}

      {/* Error/Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      {/* Action Buttons */}
      {!hasClockedIn ? (
        <button
          onClick={handleClockIn}
          disabled={isSubmitting || !gpsLocation || !capturedPhoto}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Memproses...
            </span>
          ) : (
            'CLOCK IN'
          )}
        </button>
      ) : !hasClockedOut ? (
        <button
          onClick={handleClockOut}
          disabled={isSubmitting || !gpsLocation || !capturedPhoto}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg shadow-orange-200 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Memproses...
            </span>
          ) : (
            'CLOCK OUT'
          )}
        </button>
      ) : (
        <div className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl text-center text-lg">
          Absensi Hari Ini Selesai
        </div>
      )}

      <div className="h-2" />
    </div>
  );
};

export default Attendance;
