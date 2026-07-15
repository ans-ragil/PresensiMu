<div align="center">

# PresensiMu

### Sistem Absensi Online Karyawan

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Sistem presensi digital berbasis web untuk pencatatan kehadiran karyawan secara **real-time** dengan verifikasi **GPS** dan **selfie**.

[Demo](#cara-instalasi) &bull; [Fitur](#fitur-utama) &bull; [Dokumentasi API](#api-documentation) &bull; [Screenshots](#screenshots)

</div>

---

## Daftar Isi

- [Tentang](#tentang)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Screenshots](#screenshots)
- [Struktur Project](#struktur-project)
- [Cara Instalasi](#cara-instalasi)
- [Akun Default](#akun-default)
- [Dokumentasi API](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## Tentang

**PresensiMu** adalah aplikasi Sistem Informasi Manajemen Absensi (SIMA) yang dirancang untuk memudahkan perusahaan dalam mengelola kehadiran karyawan. Aplikasi ini menyediakan fitur pencatatan kehadiran berbasis GPS dan selfie, manajemen jadwal kerja, pengajuan cuti/izin, serta laporan kehadiran yang komprehensif.

### Menggunakan PresensiMu?

- **Karyawan** dapat melakukan clock in/out dari mana saja dengan verifikasi GPS & selfie
- **HR/Admin** dapat memantau kehadiran seluruh karyawan secara real-time
- **Management** mendapatkan laporan kehadiran yang akurat dan terautomasi

---

## Fitur Utama

### Employee Self Service (ESS)

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Greeting dinamis, ringkasan kehadiran, grafik mingguan, menu cepat |
| **Clock In/Out** | Progress steps (GPS → Selfie → Validasi → Selesai), timer real-time, jarak dari kantor |
| **Riwayat Absensi** | Search, filter bulan/tahun/status, statistik, grafik mingguanan & bulanan |
| **Jadwal Kerja** | Kalender bulanan, shift mingguan, hari libur, tipe WFH/WFO/SHIFT |
| **Pengajuan Cuti** | Wizard 5 langkah, saldo cuti, timeline approval |
| **Profil** | Lihat/edit profil, upload foto, ganti password |
| **Notifikasi** | Pusat notifikasi dengan kategori (Approval, Reminder, Pengumuman, HR, Sistem) |

### HR & Admin Dashboard

| Fitur | Deskripsi |
|-------|-----------|
| **Monitoring Absensi** | Tabel monitoring dengan filter (tanggal/status/divisi/shift), detail selfie & maps |
| **Jadwal Kerja** | Calendar view, CRUD jadwal, bulk assign karyawan, kelola hari libur |
| **Persetujuan Cuti** | Tab-based workflow (Menunggu/Disetujui/Ditolak), approve/reject dengan catatan |
| **Laporan** | 5 tipe laporan (harian/mingguan/bulanan/per karyawan/cuti), export PDF/Excel/CSV |
| **Manajemen Karyawan** | CRUD karyawan, divisi, jabatan, shift |
| **Live Tracking** | Lokasi karyawan real-time dengan peta Leaflet |
| **Pengaturan** | Profil perusahaan, lokasi kantor (GPS), jam kerja, SMTP, logo |

### Role-Based Access Control (RBAC)

| Role | Akses |
|------|-------|
| **Super Admin** | Full access ke semua fitur |
| **HR** | Akses fitur HR (karyawan, absensi, cuti, laporan, pengaturan) |
| **Admin** | Akses fitur admin dasar |
| **Employee** | Akses ESS (dashboard, absensi, riwayat, jadwal, cuti, profil) |

---

## Teknologi

### Backend

| Teknologi | Fungsi |
|-----------|--------|
| Node.js | Runtime JavaScript |
| Express.js | Web framework |
| TypeScript | Type-safe JavaScript |
| Prisma | Database ORM |
| PostgreSQL | Database |
| JWT + bcrypt | Autentikasi & enkripsi password |
| Leaflet + OpenStreetMap | Maps & GPS |
| ExcelJS + PDFKit | Export laporan |
| Multer | File upload |

### Frontend

| Teknologi | Fungsi |
|-----------|--------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first CSS |
| Material UI | Component library (Admin) |
| React Router | Client-side routing |
| Axios | HTTP client |

### Infrastructure

| Teknologi | Fungsi |
|-----------|--------|
| Docker + Docker Compose | Containerization |
| Nginx | Reverse proxy |

---

## Screenshots

### Login & Register
> Halaman login dengan split-panel layout, branding gradient, dan password toggle

### Dashboard Karyawan
> Greeting dinamis, kartu profil, ringkasan kehadiran dengan progress bar, grafik mingguan

### Clock In/Out
> Progress steps GPS → Selfie → Validasi → Selesai, info lokasi, timer real-time

### Admin Dashboard
> Monitoring kehadiran karyawan, statistik, menu cepat

### Monitoring Absensi
> Tabel data absensi dengan filter, detail modal (selfie, Google Maps, durasi)

### Jadwal Kerja
> Calendar view bulanan dengan CRUD jadwal dan bulk assign

<!-- Tambahkan screenshot di folder screenshots/ dan uncomment baris di bawah -->
<!-- ![Dashboard](screenshots/dashboard.png) -->

---

## Struktur Project

```
PresensiMu/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.tsx      # Layout admin dengan sidebar
│   │   │   ├── EmployeeLayout.tsx   # Layout karyawan dengan bottom nav
│   │   │   ├── CameraCapture.tsx    # Komponen kamera selfie
│   │   │   ├── ProtectedRoute.tsx   # Route guard (auth + RBAC)
│   │   │   └── hr/                  # Komponen HR bersama
│   │   ├── pages/
│   │   │   ├── Login.tsx            # Halaman login
│   │   │   ├── Register.tsx         # Halaman registrasi
│   │   │   ├── Dashboard.tsx        # Dashboard karyawan
│   │   │   ├── Attendance.tsx       # Clock in/out
│   │   │   ├── History.tsx          # Riwayat absensi
│   │   │   ├── Schedule.tsx         # Jadwal kerja karyawan
│   │   │   ├── LeaveRequest.tsx     # Pengajuan cuti/izin
│   │   │   ├── LeaveHistory.tsx     # Riwayat cuti
│   │   │   ├── Profile.tsx          # Profil karyawan
│   │   │   ├── Notification.tsx     # Pusat notifikasi
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx    # Dashboard admin
│   │   │       ├── HrSchedule.tsx   # Kalender jadwal kerja
│   │   │       ├── HrAttendance.tsx # Monitoring absensi
│   │   │       ├── HrLeaveApproval.tsx # Persetujuan cuti
│   │   │       ├── HrReports.tsx    # Laporan & export
│   │   │       ├── HrSettings.tsx   # Pengaturan perusahaan
│   │   │       ├── EmployeeList.tsx # Manajemen karyawan
│   │   │       ├── LiveTracking.tsx # Tracking lokasi real-time
│   │   │       └── CompanyLocation.tsx # Pengaturan lokasi kantor
│   │   ├── contexts/                # React contexts (auth)
│   │   ├── hooks/                   # Custom hooks
│   │   ├── services/                # API service layer
│   │   ├── types/                   # TypeScript interfaces
│   │   └── theme/                   # MUI theme config
│   └── package.json
│
├── server/                          # Backend Express
│   ├── src/
│   │   ├── app.ts                   # Express app setup
│   │   ├── config/                  # Database config
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/               # Auth, RBAC, error handler
│   │   ├── routes/                  # API routes
│   │   ├── services/                # Business logic
│   │   └── utils/                   # Helpers (JWT, location, export)
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                  # Seed data
│   └── package.json
│
├── nginx/                           # Nginx config
├── docker-compose.yml               # Docker orchestration
├── deploy.sh                        # Deploy script (Linux/Mac)
└── deploy.bat                       # Deploy script (Windows)
```

---

## Cara Instalasi

### Prerequisites

- [Node.js](https://nodejs.org/) v20 atau lebih tinggi
- [npm](https://www.npmjs.com/) v10 atau lebih tinggi
- [PostgreSQL](https://www.postgresql.org/) v14 atau lebih tinggi
- (Opsional) [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### 1. Clone Repository

```bash
git clone https://github.com/ans-ragil/PresensiMu.git
cd PresensiMu
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Buat file .env (sesuaikan dengan konfigurasi database Anda)
cp ../.env.example .env

# Generate Prisma client
npx prisma generate

# Jalankan migration
npx prisma migrate dev

# Seed database dengan data default
npm run db:seed

# Jalankan development server
npm run dev
```

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

### 4. Buka Browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

### Menggunakan Docker

```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Lihat logs
docker-compose logs -f

# Stop semua services
docker-compose down
```

Akses:
- Frontend: http://localhost
- API: http://localhost/api

---

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@presensimu.com | superadmin123 |
| HR | hr@presensimu.com | hr123 |
| Admin | admin@presensimu.com | admin123 |
| Karyawan | karyawan@presensimu.com | karyawan123 |

> **Catatan:** Register hanya menghasilkan akun dengan role EMPLOYEE.

---

## Environment Variables

### Server (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/absensi_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

---

## API Documentation

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register akun baru |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profil |
| PUT | `/api/auth/change-password` | Ganti password |

### Attendance
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/attendance/clock-in` | Clock in |
| POST | `/api/attendance/clock-out` | Clock out |
| GET | `/api/attendance/today` | Status hari ini |
| GET | `/api/attendance/history` | Riwayat absensi |
| GET | `/api/attendance/history/stats` | Statistik mingguan/bulanan |
| GET | `/api/attendance/company-location` | Lokasi kantor |
| GET | `/api/attendance/schedule` | Jadwal karyawan |

### Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard` | Data dashboard karyawan |

### Leave
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/leave-request` | Ajukan cuti/izin |
| GET | `/api/leave-request/history` | Riwayat cuti |
| GET | `/api/leave-request/balance` | Saldo cuti |

### Notification
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/notifications` | Daftar notifikasi |
| PUT | `/api/notifications/:id/read` | Tandai sudah dibaca |
| PUT | `/api/notifications/read-all` | Tandai semua sudah dibaca |

### Admin - Dashboard & Employees
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Dashboard summary |
| GET | `/api/employees` | Daftar karyawan (filter/search/pagination) |
| POST | `/api/employees` | Tambah karyawan |
| PUT | `/api/employees/:id` | Edit karyawan |
| DELETE | `/api/employees/:id` | Nonaktifkan karyawan |
| GET | `/api/employees/divisions/list` | Daftar divisi |
| GET | `/api/employees/positions/list` | Daftar jabatan |
| GET | `/api/employees/shifts/list` | Daftar shift |

### Admin - Schedule & Attendance
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/schedules` | Semua jadwal |
| POST | `/api/admin/schedule` | Buat jadwal |
| PUT | `/api/admin/schedule/:id` | Edit jadwal |
| DELETE | `/api/admin/schedule/:id` | Hapus jadwal |
| POST | `/api/admin/schedule/bulk` | Bulk assign jadwal |
| GET | `/api/admin/attendance` | Semua data absensi (filter) |
| GET | `/api/admin/holidays` | Daftar hari libur |
| POST | `/api/admin/holiday` | Tambah hari libur |

### Admin - Leave Management
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/leave-requests` | Semua pengajuan cuti |
| PUT | `/api/admin/leave-request/:id/approve` | Setujui cuti |
| PUT | `/api/admin/leave-request/:id/reject` | Tolak cuti |

### Admin - Reports & Tracking
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/reports/daily` | Laporan harian |
| GET | `/api/admin/reports/weekly` | Laporan mingguan |
| GET | `/api/admin/reports/monthly` | Laporan bulanan |
| GET | `/api/admin/reports/employee` | Laporan per karyawan |
| GET | `/api/admin/reports/export` | Export laporan |
| GET | `/api/admin/tracking/live` | Live tracking |
| GET | `/api/admin/company-location` | Lokasi kantor |

### Settings
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/settings` | Semua pengaturan |
| GET | `/api/settings/company-profile` | Profil perusahaan |
| PUT | `/api/settings/company-profile` | Update profil perusahaan |
| GET | `/api/settings/work-time` | Pengaturan jam kerja |
| PUT | `/api/settings/work-time` | Update jam kerja |

---

## Testing

### Unit Tests

```bash
cd server
npm test
```

**Hasil: 121/121 tests passed** (16 test files)

| Module | Tests |
|--------|-------|
| Attendance Service | 9 |
| Auth Service | 8 |
| Auth Controller | 9 |
| Admin Service | 4 |
| Admin Controller | 8 |
| Leave Service | 8 |
| Leave Controller | 8 |
| Schedule Service | 9 |
| Tracking Service | 8 |
| Report Service | 6 |
| Location Utils | 12 |
| Export Utils | 7 |
| JWT Utils | 6 |
| Auth Middleware | 5 |
| RBAC Middleware | 4 |
| Error Handler | 10 |

### Integration Tests

| Endpoint | Status |
|----------|--------|
| POST /api/auth/login | PASS |
| GET /api/auth/me | PASS |
| PUT /api/auth/profile | PASS |
| GET /api/leave-request/balance | PASS |
| GET /api/notifications | PASS |
| PUT /api/notifications/read-all | PASS |
| GET /api/attendance/today | PASS |
| GET /api/attendance/company-location | PASS |
| GET /api/attendance/history/stats | PASS |
| GET /api/attendance/schedule | PASS |
| GET /api/dashboard | PASS |
| GET /api/admin/dashboard | PASS |
| GET /api/admin/employees | PASS |
| GET /api/admin/schedules | PASS |
| GET /api/admin/reports/daily | PASS |
| GET /api/admin/holidays | PASS |
| GET /api/admin/leave-requests | PASS |
| RBAC: Employee blocked from admin | PASS |

---

## Deployment

### Docker Production

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Production

```bash
# Build server
cd server && npm run build

# Build client
cd client && npm run build

# Start server
cd server && npm start
```

---

## Changelog

### v1.0 (2026-07-15)
- Employee Self Service (ESS) - Dashboard, Clock In/Out, Riwayat, Jadwal, Cuti, Profil, Notifikasi
- Admin Dashboard - Monitoring, Manajemen Karyawan, Jadwal, Laporan, Live Tracking
- HR Module - Kalender Jadwal, Monitoring Absensi, Persetujuan Cuti, Laporan, Pengaturan
- RBAC 4 Level (Super Admin, HR, Admin, Employee)
- GPS & Selfie verification
- Export PDF/Excel/CSV
- Docker deployment

---

## License

MIT License - Lihat [LICENSE](./LICENSE) untuk informasi lebih lanjut.

---

<div align="center">

**PresensiMu** &copy; 2026 | Dibuat dengan 

</div>
