import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  disabled?: boolean;
}

const CameraCapture = ({ onCapture, disabled = false }: CameraCaptureProps) => {
  const [status, setStatus] = useState<'idle' | 'starting' | 'streaming' | 'captured' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStatus(prev => prev === 'streaming' ? 'idle' : prev);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCapturedImage(null);
      setStatus('starting');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser tidak mendukung akses kamera. Silakan upload foto.');
        setStatus('error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      setStatus('streaming');
    } catch (err: any) {
      console.error('Camera error:', err);

      let msg = 'Tidak dapat mengakses kamera. Silakan upload foto.';
      if (err.name === 'NotAllowedError') {
        msg = 'Akses kamera ditolak. Silakan izinkan akses kamera di browser atau upload foto.';
      } else if (err.name === 'NotFoundError') {
        msg = 'Kamera tidak ditemukan. Silakan upload foto.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Kamera sedang digunakan aplikasi lain. Silakan upload foto.';
      }
      setError(msg);
      setStatus('error');
    }
  }, []);

  // Attach stream to video element once it's in the DOM
  useEffect(() => {
    if (status === 'streaming' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [status]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(base64);
      stopCamera();
      setStatus('captured');

      const base64Data = base64.split(',')[1];
      onCapture(base64Data);
    }
  }, [stopCamera, onCapture]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(null);
        setTimeout(() => capturePhoto(), 100);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [capturePhoto]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      setError(null);
      setStatus('captured');

      const base64Data = base64.split(',')[1];
      onCapture(base64Data);
    };
    reader.readAsDataURL(file);
  }, [onCapture]);

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    setCountdown(null);
    setStatus('idle');
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const isStreaming = status === 'streaming';
  const isCaptured = status === 'captured';
  const isStarting = status === 'starting';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-sm aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden shadow-lg">
        {/* Video is ALWAYS in DOM when streaming or captured, just hidden visually when not needed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isStreaming ? '' : 'hidden'}`}
        />

        {isStreaming && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-7xl font-bold text-white drop-shadow-lg animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-3">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm">Menghubungkan kamera...</p>
          </div>
        )}

        {isCaptured && capturedImage && (
          <img
            src={capturedImage}
            alt="Hasil foto"
            className="w-full h-full object-cover"
          />
        )}

        {!isStreaming && !isCaptured && !isStarting && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            {error ? (
              <p className="text-sm text-center px-4 text-red-400">{error}</p>
            ) : (
              <p className="text-sm">Klik tombol di bawah untuk mengaktifkan kamera</p>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {!isStreaming && !isCaptured && (
          <>
            <button
              type="button"
              onClick={startCamera}
              disabled={disabled || isStarting}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {isStarting ? 'Menghubungkan...' : 'Aktifkan Kamera'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">atau</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
              id="camera-upload"
            />
            <label
              htmlFor="camera-upload"
              className={`w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              Upload Foto
            </label>
          </>
        )}

        {isStreaming && (
          <>
            <button
              type="button"
              onClick={startCountdown}
              disabled={disabled || countdown !== null}
              className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              {countdown !== null ? `Foto dalam ${countdown}...` : 'Ambil Foto (3 detik)'}
            </button>
            <button
              type="button"
              onClick={() => { stopCamera(); resetCapture(); }}
              disabled={disabled}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </>
        )}

        {isCaptured && (
          <button
            type="button"
            onClick={resetCapture}
            disabled={disabled}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Ambil Ulang
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
