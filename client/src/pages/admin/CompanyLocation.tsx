import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CompanyLocation {
  id: string;
  nama: string;
  latitude: number;
  longitude: number;
  radius: number;
}

const CompanyLocation = () => {
  const [location, setLocation] = useState<CompanyLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 500
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMap();
    }
  }, [formData.latitude, formData.longitude, formData.radius]);

  const initMap = () => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView(
      [formData.latitude, formData.longitude],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add marker
    const marker = L.marker([formData.latitude, formData.longitude]).addTo(map);
    markerRef.current = marker;

    // Add circle
    const circle = L.circle([formData.latitude, formData.longitude], {
      radius: formData.radius,
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.1
    }).addTo(map);
    circleRef.current = circle;

    // Click handler to set location
    map.on('click', (e: L.LeafletMouseEvent) => {
      setFormData({
        ...formData,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    });
  };

  const updateMap = () => {
    if (!mapInstanceRef.current) return;

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLatLng([formData.latitude, formData.longitude]);
    }

    // Update circle
    if (circleRef.current) {
      circleRef.current.setLatLng([formData.latitude, formData.longitude]);
      circleRef.current.setRadius(formData.radius);
    }

    // Pan map
    mapInstanceRef.current.setView([formData.latitude, formData.longitude]);
  };

  const fetchLocation = async () => {
    try {
      const response = await api.get('/admin/company-location');
      if (response.data.data) {
        setLocation(response.data.data);
        setFormData({
          nama: response.data.data.nama,
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude,
          radius: response.data.data.radius
        });
      }
    } catch (err) {
      console.error('Error fetching location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/admin/company-location', formData);
      setSuccess('Lokasi kantor berhasil disimpan');
      fetchLocation();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan lokasi');
    } finally {
      setIsSaving(false);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lokasi Kantor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Lokasi</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lokasi</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Kantor Pusat"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (meter): {formData.radius}m
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100m</span>
                <span>5000m</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSaving || !formData.nama}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Lokasi'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Cara menggunakan:</strong> Klik pada peta untuk menentukan lokasi kantor, atau masukkan koordinat secara manual.
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-[400px] lg:h-full min-h-[400px]"
          />
        </div>
      </div>

      {/* Current Location Info */}
      {location && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lokasi Tersimpan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nama</p>
              <p className="font-medium">{location.nama}</p>
            </div>
            <div>
              <p className="text-gray-500">Latitude</p>
              <p className="font-medium">{location.latitude}</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p className="font-medium">{location.longitude}</p>
            </div>
            <div>
              <p className="text-gray-500">Radius</p>
              <p className="font-medium">{location.radius}m</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyLocation;
