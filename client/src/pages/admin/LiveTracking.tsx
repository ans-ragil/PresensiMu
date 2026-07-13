import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingData {
  userId: string;
  nama: string;
  email: string;
  clockIn: string | null;
  clockOut: string | null;
  lokasiIn: { lat: number; lng: number } | null;
  status: string;
  distance: number | null;
  isWithinRadius: boolean;
}

interface CompanyLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

const LiveTracking = () => {
  const [tracking, setTracking] = useState<TrackingData[]>([]);
  const [allTracking, setAllTracking] = useState<TrackingData[]>([]);
  const [companyLocation, setCompanyLocation] = useState<CompanyLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filterDate]);

  useEffect(() => {
    applyFilters();
  }, [allTracking, filterStatus, filterEmployee]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && companyLocation) {
      updateMap();
    }
  }, [tracking, companyLocation]);

  const initMap = () => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
  };

  const updateMap = () => {
    if (!mapInstanceRef.current || !companyLocation) return;

    // Update map center
    mapInstanceRef.current.setView([companyLocation.latitude, companyLocation.longitude], 14);

    // Remove existing circle
    if (circleRef.current) {
      mapInstanceRef.current.removeLayer(circleRef.current);
    }

    // Add company radius circle
    const circle = L.circle(
      [companyLocation.latitude, companyLocation.longitude],
      {
        radius: companyLocation.radius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1
      }
    ).addTo(mapInstanceRef.current);
    circleRef.current = circle;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add employee markers
    tracking.forEach(employee => {
      if (!employee.lokasiIn) return;

      const statusColor = employee.isWithinRadius ? '#22C55E' : '#EF4444';
      const statusIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background-color: ${statusColor};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">${employee.nama.charAt(0)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(
        [employee.lokasiIn.lat, employee.lokasiIn.lng],
        { icon: statusIcon }
      ).addTo(mapInstanceRef.current!);

      // Add popup
      marker.bindPopup(`
        <div style="min-width: 150px;">
          <strong>${employee.nama}</strong><br/>
          <small>${employee.email}</small><br/>
          <br/>
          <strong>Status:</strong> ${employee.status}<br/>
          <strong>Clock In:</strong> ${employee.clockIn ? new Date(employee.clockIn).toLocaleTimeString('id-ID') : '-'}<br/>
          <strong>Jarak:</strong> ${employee.distance ? Math.round(employee.distance) + 'm' : '-'}<br/>
          <strong>Lokasi:</strong> ${employee.isWithinRadius ? 'Dalam radius' : 'Luar radius'}
        </div>
      `);

      markersRef.current.set(employee.userId, marker);
    });
  };

  const fetchData = async () => {
    try {
      let trackingRes;

      if (filterDate) {
        // Fetch history for specific date
        trackingRes = await api.get('/admin/tracking/history', {
          params: { startDate: filterDate, endDate: filterDate }
        });
        // Map history data to match TrackingData interface
        const historyData = trackingRes.data.data.map((item: any) => ({
          userId: item.user.id,
          nama: item.user.nama,
          email: item.user.email,
          clockIn: item.clockIn,
          clockOut: item.clockOut,
          lokasiIn: item.lokasiIn,
          status: item.status,
          distance: null,
          isWithinRadius: true
        }));
        setAllTracking(historyData);
      } else {
        // Fetch live tracking
        const [liveRes, locationRes] = await Promise.all([
          api.get('/admin/tracking/live'),
          api.get('/admin/company-location')
        ]);
        trackingRes = liveRes;
        setAllTracking(liveRes.data.data);
        if (locationRes.data.data) {
          setCompanyLocation(locationRes.data.data);
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching tracking data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTracking];

    if (filterStatus) {
      if (filterStatus === 'OUT_OF_RADIUS') {
        filtered = filtered.filter(t => !t.isWithinRadius);
      } else {
        filtered = filtered.filter(t => t.status === filterStatus);
      }
    }

    if (filterEmployee) {
      const search = filterEmployee.toLowerCase();
      filtered = filtered.filter(t =>
        t.nama.toLowerCase().includes(search) ||
        t.email.toLowerCase().includes(search)
      );
    }

    setTracking(filtered);
  };

  const getStatusColor = (status: string, isWithinRadius: boolean) => {
    if (!isWithinRadius) return 'bg-red-100 text-red-800';
    switch (status) {
      case 'HADIR':
        return 'bg-green-100 text-green-800';
      case 'TERLAMBAT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string, isWithinRadius: boolean) => {
    if (!isWithinRadius) return 'Luar Radius';
    switch (status) {
      case 'HADIR':
        return 'Hadir';
      case 'TERLAMBAT':
        return 'Terlambat';
      case 'ACTIVE':
        return 'Aktif';
      default:
        return status;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
        <div className="text-sm text-gray-500">
          Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-blue-600 hover:text-blue-700 mt-1"
              >
                Lihat Live
              </button>
            )}
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="HADIR">Hadir</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="OUT_OF_RADIUS">Luar Radius</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Karyawan</label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Nama atau email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-[500px] lg:h-[600px]"
          />
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-900">
              Karyawan {filterDate ? 'Tanggal ' + new Date(filterDate).toLocaleDateString('id-ID') : 'Hari Ini'} ({tracking.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[560px] overflow-y-auto">
            {tracking.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Tidak ada karyawan yang sudah clock in
              </div>
            ) : (
              tracking.map(employee => (
                <div key={employee.userId} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{employee.nama}</p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Clock In: {employee.clockIn
                          ? new Date(employee.clockIn).toLocaleTimeString('id-ID')
                          : '-'}
                      </p>
                      {employee.distance !== null && (
                        <p className="text-xs text-gray-400">
                          Jarak: {Math.round(employee.distance)}m
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status, employee.isWithinRadius)}`}>
                      {getStatusLabel(employee.status, employee.isWithinRadius)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-gray-50 border-t">
            <p className="text-xs font-medium text-gray-700 mb-2">Legenda:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Hadir
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Terlambat
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Luar Radius
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Hadir</p>
          <p className="text-2xl font-bold text-green-600">
            {tracking.filter(t => t.isWithinRadius && t.status === 'HADIR').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Terlambat</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tracking.filter(t => t.status === 'TERLAMBAT').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Luar Radius</p>
          <p className="text-2xl font-bold text-red-600">
            {tracking.filter(t => !t.isWithinRadius).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Karyawan</p>
          <p className="text-2xl font-bold text-gray-900">{tracking.length}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
