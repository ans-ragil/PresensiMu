# PRD: Sistem Absensi Online Karyawan Berbasis Web

## 1. Ringkasan Eksekutif

**Nama Produk:** Absensi Online Karyawan  
**Target Pengguna:** UMKM, Startup Kelas Kecil-Menengah, Perusahaan  
**Platform:** Web Responsive (Laptop & Mobile Friendly)  
**Tujuan:** Menyediakan solusi absensi digital yang mudah digunakan, terjangkau, dan efisien untuk mengelola kehadiran karyawan serta otomasi laporan.

---

## 2. Latar Belakang & Problem Statement

### Masalah yang Dihadapi:
- Manual tracking absensi kurang akurat dan berpotensi data double input
- Proses pengajuan cuti/izin masih menggunakan form fisik atau email
- Kurangnya transparansi data kehadiran bagi admin
- Kesulitan tracking lokasi karyawan saat remote/hybrid work
- Proses ekspor laporan manual memakan waktu

---

## 3. Ruang Lingkup Produk

### 3.1 Fitur Karyawan

#### 3.1.1 Clock In/Clock Out
- **Clock In:** Check-in kehadiran dengan timestamp otomatis
- **Clock Out:** Check-out kehadiran dengan timestamp otomatis
- **Validasi Waktu:** Batasan waktu clock in (misal: kerja jam 08.00, toleransi 30 menit)
- **Deteksi Lokasi:** GPS/Geolocation untuk validasi lokasi kerja
- **Selfie Verification:** Capture foto saat clock in/out untuk verifikasi identitas
- **Status Kehadiran:** Hadir, Terlambat, Pulang Cepat, Alpha

#### 3.1.2 Pengajuan Cuti/Izin Libur
- **Form Pengajuan:** Form online untuk pengajuan cuti/izin
- **Tipe Izin:** Cuti Tahunan, Izin Sakit, Izin Pribadi, Libur Lokal
- **Upload Dokumen:** Lampirkan surat dokter/gambar bukti (opsional)
- **Notifikasi Admin:** Otomatis mengirim notifikasi ke admin untuk persetujuan
- **Status Pengajuan:** Pending, Disetujui, Ditolak
- **Riwayat Pengajuan:** History pengajuan yang pernah diajukan

### 3.2 Fitur Admin

#### 3.2.1 Manajemen Jadwal
- **Buat Jadwal:** Atur jadwal kerja harian/mingguan untuk setiap karyawan
- **Jadwal Shift:** Dukungan shift kerja (pagi, siang, malam)
- **Libur Tetap:** Atur hari libur nasional dan cuti bersama
- **Jadwal Fleksibel:** Support flexible time untuk UMKM
- **Import Jadwal:** Import jadwal dari file Excel/CSV

#### 3.2.2 Live Tracking & Maps
- **Peta Interaktif:** Tampilkan lokasi karyawan secara real-time pada peta
- **History Lokasi:** Riwayat lokasi check-in/check-out hari ini
- **Radius Lokasi:** Set radius lokasi kantor (misal: 500m)
- **Peringatan Keluar Radius:** Notifikasi jika karyawan check-in di luar radius
- **Filter Tracking:** Filter berdasarkan tanggal, karyawan, status

#### 3.2.3 Otomasi Laporan & Ekspor Data
- **Laporan Harian:** Rekap kehadiran harian otomatis
- **Laporan Mingguan/Bulanan:** Ringkasan absensi periode tertentu
- **Laporan Karyawan:** History lengkap absensi per karyawan
- **Laporan Cuti:** Rekap penggunaan cuti per karyawan/perusahaan
- **Ekspor Format:** Export ke Excel (.xlsx), PDF, CSV
- **Jadwal Ekspor Otomatis:** Email laporan otomatis ke admin HRD setiap minggu/bulan

---

## 4. User Stories

### 4.1 Karyawan

| No | User Story | Priority |
|----|-----------|----------|
| 1 | Sebagai karyawan, saya ingin clock in dengan selfie agar admin dapat verifikasi kehadiran | High |
| 2 | Sebagai karyawan, saya ingin melihat status pengajuan cuti saya agar mengetahui apakah cuti disetujui | High |
| 3 | Sebagai karyawan, saya ingin mengajukan izin dengan mengupload bukti dokter | Medium |
| 4 | Sebagai karyawan, saya ingin melihat jadwal kerja saya minggu ini | High |

### 4.2 Admin

| No | User Story | Priority |
|----|-----------|----------|
| 1 | Sebagai admin, saya ingin melihat semua karyawan yang hadir tidak tepat waktu | High |
| 2 | Sebagai admin, saya ingin menyetujui/tolak pengajuan cuti secara online | High |
| 3 | Sebagai admin, saya ingin melihat peta lokasi karyawan yang clock in | High |
| 4 | Sebagai admin, saya ingin mengekspor data absensi ke Excel untuk proses payroll | High |
| 5 | Sebagai admin, saya ingin mengatur jadwal shift untuk tim sales | Medium |

---

## 5. Spesifikasi Teknis

### 5.1 Teknologi
- **Frontend:** React.js + Tailwind CSS (responsive mobile-first)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Maps API:** Google Maps API atau OpenStreetMap
- **Authentication:** JWT Token + Bcrypt
- **Deployment:** Docker + Nginx

### 5.2 Responsive Design Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 5.3 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 6. Wireframe & UI Flow

### 6.1 Halaman Karyawan (Mobile)
```
Login → Dashboard (Today Status) → Clock In/Out → Pengajuan Izin → Riwayat
```

### 6.2 Halaman Admin (Desktop/Mobile)
```
Login → Dashboard Admin → 
  ├─ Manajemen Jadwal
  ├─ Live Tracking
  ├─ Laporan
  └─ Persetujuan Izin
```

---

## 7. Database Schema

### 7.1 Tabel Utama
- **users:** id, nama, email, password, role (employee/admin), no_telp
- **attendance:** id, user_id, tanggal, clock_in, clock_out, lokasi_in, lokasi_out, foto_in, foto_out, status
- **leave_requests:** id, user_id, tipe_izin, tanggal_mulai, tanggal_selesai, keterangan, bukti, status, approved_by
- **schedules:** id, user_id, hari, jam_mulai, jam_selesai, shift_type
- **companies:** id, nama, alamat, latitude, longitude, radius

---

## 8. Integrasi & API

### 8.1 Internal API
- `POST /api/auth/login` - Autentikasi pengguna
- `POST /api/attendance/clock-in` - Proses clock in
- `POST /api/attendance/clock-out` - Proses clock out
- `GET /api/attendance/history` - Ambil history absensi
- `POST /api/leave-request` - Buat pengajuan cuti
- `GET /api/admin/tracking` - Live tracking karyawan
- `GET /api/reports/export` - Generate laporan

---

## 9. Keamanan & Privasi

- Enkripsi password dengan bcrypt
- HTTPS wajib untuk semua endpoint
- Data lokasi hanya disimpan untuk keperluan absensi
- Role-based access control (RBAC)
- Session timeout otomatis (30 menit idle)

---

## 10. Non-Functional Requirements

| No | Requirement | Target |
|----|-------------|--------|
| 1 | Responsivitas Mobile | Loading time < 3 detik |
| 2 | Ketersediaan Sistem | 99% uptime |
| 3 | Keamanan Data | Enkripsi end-to-end |
| 4 | Backup Data | Harian |
| 5 | User Capacity | Support 100-1000 karyawan |

---

## 11. Roadmap Pengembangan

### Phase 1 (Minggu 1-2): MVP Core
- [x] Sistem autentikasi (login/register)
- [x] Clock in/out dengan lokasi dan selfie
- [x] Database schema dasar
- [x] UI responsive mobile

### Phase 2 (Minggu 3-4): Fitur Admin Dasar
- [x] Dashboard admin
- [x] Manajemen jadwal
- [x] Persetujuan cuti
- [x] Laporan harian

### Phase 3 (Minggu 5-6): Advanced Features
- [x] Live tracking maps
- [x] Export laporan (Excel/PDF)
- [x] Email notification
- [x] Testing & deployment

---

## 12. Success Metrics

- Tingkat kehadiran tepat waktu > 90%
- Pengurangan waktu proses absensi 75%
- Kepuasan pengguna > 4.5/5
- Time to export report < 30 detik

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Karyawan tidak nyaman dengan GPS | Gunakan validasi manual sebagai alternatif |
| Data selfie bocor | Enkripsi dan hapus otomatis setelah 30 hari |
| Offline mode | Cache data lokal, sync ketika online kembali |

---

## 14. Budget & Resource

- Development: 1 Fullstack Developer, 1 UI/UX Designer
- Estimasi Timeline: 6 minggu
- Estimasi Biaya: Rp 50.000.000 - Rp 75.000.000
