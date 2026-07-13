# PresensiMu - Sistem Absensi Online Karyawan

Sistem absensi online berbasis web untuk mengelola kehadiran karyawan dengan fitur lengkap.

## Fitur

### Employee Self Service (ESS)
- **Dashboard Modern** — greeting dinamis, profile card, attendance summary, quick menu
- **Clock In/Out** — progress steps (GPS → Selfie → Validasi → Selesai), live timer, jarak dari kantor
- **Riwayat Absensi** — search, filter bulan/tahun/status, statistik, grafik mingguanan & bulanan
- **Jadwal Kerja** — kalender bulanan, shift mingguan/bulanan, hari libur, WFH/WFO
- **Pengajuan Cuti/Izin** — wizard 5 langkah, saldo cuti, timeline approval
- **Profil** — lihat/edit profil, upload foto, ganti password
- **Notifikasi** — center dengan kategori (Approval, Reminder, Pengumuman, HR, Sistem)
- **Export PDF** — cetak riwayat absensi pribadi

### Admin
- **Dashboard Admin** — monitoring kehadiran
- **Live Tracking** — lokasi karyawan real-time dengan peta
- **Laporan & Export** — Excel, PDF, CSV
- **Manajemen Jadwal** — shift, import Excel
- **Manajemen Cuti** — approve/reject pengajuan

### Roles (RBAC)
- **Super Admin** — full access ke semua fitur admin
- **HR** — akses fitur admin (karyawan, absensi, cuti, laporan)
- **Admin** — akses fitur admin dasar
- **Employee** — akses ESS (dashboard, absensi, riwayat, jadwal, cuti, profil)

## Tech Stack

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** PostgreSQL
- **Maps:** Leaflet + OpenStreetMap
- **Export:** ExcelJS + PDFKit
- **Auth:** JWT + bcrypt
- **Deployment:** Docker + Nginx

## Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose terinstall

### Steps

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd presensimu
   ```

2. **Jalankan deployment script**
   
   **Linux/Mac:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   
   **Windows:**
   ```cmd
   deploy.bat
   ```

3. **Buka browser**
   - Frontend: http://localhost
   - API: http://localhost/api

4. **Login dengan akun default**
   - Admin: admin@presensimu.com / admin123
   - Karyawan: karyawan@presensimu.com / karyawan123

## Manual Setup (Tanpa Docker)

### Backend

```bash
cd server

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed database
npm run db:seed

# Jalankan development
npm run dev
```

### Frontend

```bash
cd client

# Install dependencies
npm install

# Jalankan development
npm run dev
```

## Environment Variables

### Server (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/absensi_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile (nama, noTelp, alamat, foto)
- `PUT /api/auth/change-password` - Change password

### Attendance Endpoints
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/history/stats` - Get attendance statistics (weekly/monthly)
- `GET /api/attendance/company-location` - Get company location info
- `GET /api/attendance/schedule` - Get user schedule

### Dashboard Endpoints
- `GET /api/dashboard` - Get aggregated dashboard data

### Leave Endpoints
- `POST /api/leave-request` - Create leave request
- `GET /api/leave-request/history` - Get leave history
- `GET /api/leave-request/balance` - Get leave balance

### Notification Endpoints
- `GET /api/notifications` - Get notifications (with unread count)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard summary
- `GET /api/admin/employees` - All employees
- `GET /api/admin/leave-requests` - All leave requests
- `PUT /api/admin/leave-request/:id/approve` - Approve leave
- `PUT /api/admin/leave-request/:id/reject` - Reject leave
- `GET /api/admin/schedules` - All schedules
- `POST /api/admin/schedule` - Create schedule
- `PUT /api/admin/schedule/:id` - Update schedule
- `DELETE /api/admin/schedule/:id` - Delete schedule
- `POST /api/admin/holiday` - Create holiday
- `GET /api/admin/holidays` - All holidays
- `DELETE /api/admin/holiday/:id` - Delete holiday
- `POST /api/admin/company-location` - Set company location
- `GET /api/admin/company-location` - Get company location
- `GET /api/admin/tracking/live` - Live tracking
- `GET /api/admin/tracking/history` - Tracking history
- `GET /api/admin/reports/daily` - Daily report
- `GET /api/admin/reports/weekly` - Weekly report
- `GET /api/admin/reports/monthly` - Monthly report
- `GET /api/admin/reports/export` - Export report

## Testing

### API Endpoints (19/19 PASSED)
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

### Unit Tests
- Backend: **121/121 pass** (16 test files)
- Frontend TypeScript: **clean compilation**
- Backend TypeScript: **clean compilation**

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

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@presensimu.com | superadmin123 |
| HR | hr@presensimu.com | hr123 |
| Admin | admin@presensimu.com | admin123 |
| Karyawan | karyawan@presensimu.com | karyawan123 |

## License

MIT License
