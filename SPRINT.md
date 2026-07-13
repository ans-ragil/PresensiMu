# Sprint Plan: Sistem Absensi Online Karyawan

## Overview

| Item | Detail |
|------|--------|
| **Proyek** | Absensi Online Karyawan |
| **Total Sprint** | 6 Sprint (1 sprint = 1 minggu) |
| **Durasi** | 6 minggu |
| **Flow per Sprint** | Perencanaan → Implementasi → QA Test → Security Test → Update Docs |

---

## Sprint 1: Foundation & Authentication (Minggu 1)

### Goals
- Setup project structure dan environment
- Implementasi autentikasi lengkap (register, login, role-based access)

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S1.1 | Sebagai pengguna, saya ingin mendaftar akun baru dengan role karyawan/admin | High |
| S1.2 | Sebagai pengguna, saya ingin login ke sistem dengan email dan password | High |
| S1.3 | Sebagai pengguna, saya ingin logout dari sistem | High |
| S1.4 | Sebagai admin, saya ingin membuat akun karyawan baru | High |

### Tasks

#### Backend
- [x] Setup Node.js + Express.js project
- [x] Setup PostgreSQL database dan connection pool (Prisma)
- [x] Buat database schema: `users` table (id, nama, email, password, role, no_telp, created_at, updated_at)
- [x] Buat model User (CRUD operations via Prisma)
- [x] Implementasi endpoint `POST /api/auth/register` dengan validasi input
- [x] Implementasi endpoint `POST /api/auth/login` dengan JWT + bcrypt
- [x] Implementasi endpoint `GET /api/auth/me` (get current user)
- [x] Implementasi middleware RBAC (role-based access control)
- [x] Implementasi middleware JWT verification
- [x] Setup error handling middleware

#### Frontend
- [x] Setup React.js + Vite + Tailwind CSS project
- [x] Buat halaman Login (form email + password)
- [x] Buat halaman Register (form nama, email, password, no_telp, role)
- [x] Implementasi auth context/store (manajemen token di localStorage)
- [x] Buat protected route wrapper (redirect ke login jika未autentikasi)
- [x] Buat layout dasar (dashboard placeholder)
- [x] Implementasi responsive design untuk semua halaman auth

#### Infrastructure
- [x] Setup Docker + docker-compose (Node.js, PostgreSQL, Nginx)
- [x] Buat `.env.example` dengan konfigurasi environment variables
- [x] Setup Nginx config untuk reverse proxy

### Acceptance Criteria
- [x] User dapat register dengan role employee atau admin
- [x] User dapat login dan mendapat JWT token
- [x] Token expired otomatis setelah 30 menit idle
- [x] Password di-enkripsi dengan bcrypt (minimal 10 rounds)
- [x] Error message ditampilkan dengan jelas pada UI
- [x] Semua endpoint menggunakan HTTPS (di Docker/Nginx)
- [x] Responsive di mobile (<640px), tablet (640-1024px), dan desktop (>1024px)

---

## Sprint 2: Clock In/Out & Attendance (Minggu 2)

### Goals
- Implementasi fitur clock in/out dengan GPS dan selfie
- Dashboard karyawan untuk melihat status hari ini

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S2.1 | Sebagai karyawan, saya ingin clock in dengan GPS lokasi dan selfie | High |
| S2.2 | Sebagai karyawan, saya ingin clock out dengan GPS lokasi dan selfie | High |
| S2.3 | Sebagai karyawan, saya ingin melihat status kehadiran hari ini | High |
| S2.4 | Sebagai karyawan, saya ingin melihat riwayat absensi saya | Medium |
| S2.5 | Sebagai karyawan, saya ingin melihat jadwal kerja saya | High |

### Tasks

#### Backend
- [x] Buat database schema: `attendance` table (id, user_id, tanggal, clock_in, clock_out, lokasi_in, lokasi_out, foto_in, foto_out, status)
- [x] Buat database schema: `schedules` table (id, user_id, hari, jam_mulai, jam_selesai, shift_type)
- [x] Implementasi endpoint `POST /api/attendance/clock-in` (validasi GPS, ambil selfie)
- [x] Implementasi endpoint `POST /api/attendance/clock-out` (validasi GPS, ambil selfie)
- [x] Implementasi endpoint `GET /api/attendance/history` (filter by user, date range)
- [x] Implementasi endpoint `GET /api/attendance/today` (status hari ini)
- [x] Implementasi endpoint `GET /api/attendance/schedule` (jadwal kerja)
- [x] Implementasi validasi waktu (toleransi terlambat sesuai jadwal)
- [x] Implementasi validasi lokasi (radius dari koordinat kantor)
- [x] Implementasi penyimpanan foto selfie (base64)
- [x] Implementasi logic status otomatis: Hadir, Terlambat, Pulang Cepat, Alpha

#### Frontend
- [x] Buat halaman Dashboard Karyawan (status hari ini, jam kerja, tombol clock in/out)
- [x] Implementasi fitur clock in dengan GPS + selfie (akses kamera)
- [x] Implementasi fitur clock out dengan GPS + selfie
- [x] Tampilkan notifikasi lokasi di luar radius (jika ada)
- [x] Buat halaman Riwayat Absensi (tabel dengan filter tanggal)
- [x] Buat halaman Jadwal Kerja (tampilan mingguan)
- [x] Implementasi loading state dan error handling pada setiap API call
- [x] Implementasi camera access untuk selfie (constraint kamera depan)

#### Security
- [x] Validasi ukuran foto maksimal (2MB)
- [x] Validasi GPS (latitude/longitude wajib)
- [x] User ID dari JWT token (bukan dari request body)
- [x] One clock in/out per day enforcement

### Acceptance Criteria
- [x] Karyawan dapat clock in dengan timestamp otomatis
- [x] GPS lokasi tercatat dan divalidasi
- [x] Selfie terambil dan tersimpan sebagai bukti
- [x] Status otomatis: Hadir (tepat waktu), Terlambat (>toleransi), Pulang Cepat (clock out sebelum jam selesai)
- [x] Clock in/out hanya bisa dilakukan sekali per hari
- [x] Riwayat absensi ditampilkan dengan benar
- [x] Jadwal kerja karyawan tampil sesuai role

---

## Sprint 3: Leave Request & Admin Dashboard (Minggu 3)

### Goals
- Implementasi pengajuan cuti/izin
- Dashboard admin untuk melihat rekap kehadiran

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S3.1 | Sebagai karyawan, saya ingin mengajukan cuti/izin dengan form online | High |
| S3.2 | Sebagai karyawan, saya ingin melihat status pengajuan cuti saya | High |
| S3.3 | Sebagai admin, saya ingin melihat dashboard rekap kehadiran semua karyawan | High |
| S3.4 | Sebagai admin, saya ingin menyetujui/tolak pengajuan cuti | High |
| S3.5 | Sebagai admin, saya ingin melihat karyawan yang terlambat/hadir tidak tepat waktu | High |

### Tasks

#### Backend
- [x] Buat database schema: `leave_requests` table (id, user_id, tipe_izin, tanggal_mulai, tanggal_selesai, keterangan, bukti, status, approved_by)
- [x] Implementasi endpoint `POST /api/leave-request` (buat pengajuan cuti)
- [x] Implementasi endpoint `GET /api/leave-request/history` (riwayat pengajuan user)
- [x] Implementasi endpoint `GET /api/leave-request/:id` (detail pengajuan)
- [x] Implementasi endpoint `GET /api/admin/leave-requests` (semua pengajuan untuk admin)
- [x] Implementasi endpoint `PUT /api/admin/leave-request/:id/approve` (setujui)
- [x] Implementasi endpoint `PUT /api/admin/leave-request/:id/reject` (tolak)
- [x] Implementasi endpoint `GET /api/admin/dashboard` (rekap kehadiran)
- [x] Implementasi endpoint `GET /api/admin/attendance` (semua data kehadiran)
- [x] Implementasi endpoint `GET /api/admin/employees` (daftar karyawan)
- [x] Implementasi upload bukti dokumen (base64)
- [x] Implementasi validasi overlap cuti (tidak boleh cuti di hari yang sudah ada pengajuan)

#### Frontend
- [x] Buat halaman Pengajuan Cuti (form: tipe izin, tanggal mulai/selesai, keterangan, upload bukti)
- [x] Buat halaman Riwayat Pengajuan Cuti (status: Pending, Disetujui, Ditolak)
- [x] Buat halaman Dashboard Admin (summary: total hadir, terlambat, alpha, cuti)
- [x] Buat halaman Manajemen Cuti (tabel pengajuan, tombol setujui/tolak)
- [x] Buat halaman Absensi Karyawan (admin view)
- [x] Implementasi modal/konfirmasi saat menyetujui/menolak
- [x] Implementasi filter pada dashboard admin (status)
- [x] Komponen Modal reusable

#### Security
- [x] Validasi tipe izin hanya boleh: Cuti Tahunan, Izin Sakit, Izin Pribadi, Libur Lokal
- [x] Validasi tanggal Mulai <= tanggal Selesai
- [x] Hanya admin yang bisa approve/reject (RBAC)
- [x] Karyawan hanya bisa melihat data sendiri

### Acceptance Criteria
- [x] Karyawan dapat mengajukan cuti dengan upload bukti
- [x] Status pengajuan berubah otomatis saat admin approve/reject
- [x] Dashboard admin menampilkan rekap yang akurat
- [x] Admin dapat menyetujui/menolak pengajuan cuti
- [x] Karyawan tidak bisa mengajukan cuti di tanggal yang sudah ada pengajuan
- [x] Modal konfirmasi muncul saat approve/reject
- [x] Semua data hanya bisa diakses oleh yang berwenang

---

## Sprint 4: Schedule Management & Shift (Minggu 4)

### Goals
- Implementasi manajemen jadwal kerja dan shift
- Support import jadwal dari Excel/CSV

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S4.1 | Sebagai admin, saya ingin membuat jadwal kerja untuk karyawan | High |
| S4.2 | Sebagai admin, saya ingin mengatur shift kerja (pagi, siang, malam) | Medium |
| S4.3 | Sebagai admin, saya ingin mengatur hari libur nasional | Medium |
| S4.4 | Sebagai admin, saya ingin import jadwal dari file Excel/CSV | Medium |
| S4.5 | Sebagai karyawan, saya ingin melihat jadwal shift saya minggu ini | High |

### Tasks

#### Backend
- [x] Implementasi endpoint `POST /api/admin/schedule` (buat jadwal)
- [x] Implementasi endpoint `PUT /api/admin/schedule/:id` (update jadwal)
- [x] Implementasi endpoint `DELETE /api/admin/schedule/:id` (hapus jadwal)
- [x] Implementasi endpoint `GET /api/admin/schedules` (semua jadwal)
- [x] Implementasi endpoint `POST /api/admin/schedule/bulk` (bulk assign)
- [x] Implementasi endpoint `POST /api/admin/schedule/import` (import Excel/CSV)
- [x] Implementasi endpoint `POST /api/admin/holiday` (buat hari libur)
- [x] Implementasi endpoint `GET /api/admin/holidays` (daftar hari libur)
- [x] Implementasi endpoint `DELETE /api/admin/holiday/:id` (hapus hari libur)
- [x] Buat library parser Excel/CSV untuk import jadwal (menggunakan xlsx)
- [x] Implementasi validasi jadwal (jam_mulai < jam_selesai)

#### Frontend
- [x] Buat halaman Manajemen Jadwal (tabel jadwal, form tambah/edit)
- [x] Implementasi form buat jadwal: pilih karyawan, hari, jam, shift type
- [x] Implementasi fitur import jadwal dari Excel/CSV (drag & drop file)
- [x] Tampilkan hasil import (success/error)
- [x] Buat halaman Daftar Karyawan (employee list)
- [x] Implementasi bulk assign jadwal (assign ke beberapa karyawan sekaligus)
- [x] Filter jadwal berdasarkan karyawan dan hari

#### Security
- [x] Validasi file upload: multer memory storage
- [x] Validasi input: time format (HH:MM), hari range (0-6)
- [x] Hanya admin yang bisa mengelola jadwal (RBAC)

### Acceptance Criteria
- [x] Admin dapat membuat jadwal kerja untuk karyawan
- [x] Admin dapat mengatur shift pagi/siang/malam
- [x] Admin dapat import jadwal dari Excel/CSV
- [x] Karyawan dapat melihat jadwal kerja sendiri
- [x] Jadwal tidak boleh overlap untuk karyawan yang sama
- [x] Hari libur dapat diatur
- [x] Data import ditampilkan preview sebelum disimpan

### Progress Update (2026-07-08)
- [x] Laporan harian sekarang mencakup seluruh karyawan, termasuk status cuti dan alpha yang jelas.
- [x] Ditambahkan pengujian backend untuk memastikan laporan harian tetap mencakup semua karyawan.

---

## Sprint 5: Live Tracking & Maps (Minggu 5)

### Goals
- Implementasi live tracking karyawan dengan peta
- History lokasi dan validasi radius

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S5.1 | Sebagai admin, saya ingin melihat lokasi karyawan secara real-time pada peta | High |
| S5.2 | Sebagai admin, saya ingin melihat history lokasi check-in/check-out | High |
| S5.3 | Sebagai admin, saya ingin set radius lokasi kantor | Medium |
| S5.4 | Sebagai admin, saya ingin filter tracking berdasarkan tanggal/karyawan | Medium |
| S5.5 | Sebagai admin, saya ingin notifikasi jika karyawan check-in di luar radius | Medium |

### Tasks

#### Backend
- [x] Buat database schema: `company_locations` table (id, nama, latitude, longitude, radius)
- [x] Implementasi endpoint `POST /api/admin/company-location` (set lokasi kantor)
- [x] Implementasi endpoint `GET /api/admin/company-location` (ambil lokasi kantor)
- [x] Implementasi endpoint `GET /api/admin/tracking/live` (live location semua karyawan)
- [x] Implementasi endpoint `GET /api/admin/tracking/history` (history lokasi)
- [x] Implementasi endpoint `GET /api/admin/tracking/alerts` (karyawan di luar radius)
- [x] Implementasi validasi radius (haversine formula untuk hitung jarak)

#### Frontend
- [x] Implementasi integrasi peta (OpenStreetMap via Leaflet)
- [x] Buat halaman Live Tracking (peta dengan marker karyawan)
- [x] Tampilkan marker karyawan dengan status (warna hijau/merah)
- [x] Implementasi auto-refresh marker setiap 30 detik
- [x] Buat form set lokasi kantor (latitude, longitude, radius)
- [x] Tampilkan notifikasi/alert untuk karyawan di luar radius

#### Security
- [x] Hanya admin yang bisa melihat live tracking (RBAC)
- [x] Lokasi karyawan tidak bisa diakses karyawan lain
- [x] Company location hanya bisa diatur admin

### Acceptance Criteria
- [x] Admin dapat melihat lokasi karyawan real-time pada peta
- [x] Marker karyawan update secara otomatis
- [x] Admin dapat melihat history lokasi per karyawan
- [x] Radius lokasi kantor dapat diatur
- [x] Karyawan di luar radius mendapat peringatan
- [x] Filter tracking berfungsi dengan benar
- [x] Live tracking tidak mengalami delay > 5 detik

---

## Sprint 6: Reports, Export & Finalization (Minggu 6)

### Goals
- Implementasi laporan dan ekspor data (Excel, PDF, CSV)
- Email notification untuk laporan otomatis
- Final testing dan deployment

### User Stories
| ID | Story | Priority |
|----|-------|----------|
| S6.1 | Sebagai admin, saya ingin melihat laporan harian kehadiran | High |
| S6.2 | Sebagai admin, saya ingin mengekspor data absensi ke Excel untuk payroll | High |
| S6.3 | Sebagai admin, saya ingin menerima laporan otomatis via email | Medium |
| S6.4 | Sebagai admin, saya ingin melihat laporan cuti per karyawan | Medium |
| S6.5 | Sebagai admin, saya ingin mengekspor laporan dalam format PDF | Medium |

### Tasks

#### Backend
- [x] Implementasi endpoint `GET /api/admin/reports/daily` (laporan harian)
- [x] Implementasi endpoint `GET /api/admin/reports/weekly` (laporan mingguan)
- [x] Implementasi endpoint `GET /api/admin/reports/monthly` (laporan bulanan)
- [x] Implementasi endpoint `GET /api/admin/reports/employee` (laporan per karyawan)
- [x] Implementasi endpoint `GET /api/admin/reports/leave` (laporan cuti)
- [x] Implementasi endpoint `GET /api/admin/reports/export` (ekspor Excel/PDF/CSV)
- [x] Implementasi library ekspor Excel (menggunakan exceljs)
- [x] Implementasi library ekspor PDF (menggunakan pdfkit)
- [x] Implementasi endpoint `POST /api/admin/email-settings` (atur email recipient)
- [x] Implementasi endpoint `GET /api/admin/email-settings` (ambil email settings)
- [x] Implementasi endpoint `DELETE /api/admin/email-settings/:id` (hapus email)

#### Frontend
- [x] Buat halaman Laporan (filter tanggal, karyawan, tipe laporan)
- [x] Tampilkan summary statistics pada laporan
- [x] Implementasi tombol export: Excel, PDF, CSV
- [x] Implementasi download file langsung dari browser
- [x] Buat halaman Pengaturan Email (atur email HRD untuk laporan otomatis)

#### Finalization
- [x] TypeScript compilation clean, no errors
- [x] Security review: RBAC, input validation
- [x] Update dokumentasi (SPRINT.md, AGENTS.md)

### Acceptance Criteria
- [x] Admin dapat melihat laporan harian/mingguan/bulanan
- [x] Data dapat diekspor ke Excel (.xlsx), PDF, CSV
- [x] Email settings dapat diatur oleh admin
- [x] Summary statistics ditampilkan dengan benar
- [x] Semua fitur berfungsi tanpa error
- [x] Tidak ada vulnerability keamanan kritis
- [ ] Loading time < 3 detik untuk semua halaman
- [ ] Sistem support 100+ karyawan concurrent

---

## ESS Enhancement Sprints (Post-Sprint 6)

### ESS Sprint 1: Modern Dashboard (2026-07-09)
- [x] Greeting dinamis berdasarkan waktu
- [x] Profile Card (inisial, nama, NIK, jabatan, divisi, shift)
- [x] Attendance Summary dengan progress bar
- [x] Weekly Attendance Chart
- [x] Monthly Statistics (6 status)
- [x] Quick Menu dengan 6 icon
- [x] Pending Leaves & Upcoming Holidays
- [x] Skeleton Loading
- **Backend:** GET `/api/dashboard` (aggregated data)
- **Files:** `Dashboard.tsx`, `dashboard.service.ts`, `dashboard.controller.ts`, `dashboard.routes.ts`, `hooks/useGreeting.ts`, `hooks/useClock.ts`, `types/index.ts`, `components/Skeleton.tsx`, `components/SectionHeader.tsx`

### ESS Sprint 2: Modern Attendance & History (2026-07-09)
- [x] Progress Steps (GPS → Selfie → Validasi → Selesai)
- [x] Location Info (nama kantor, radius, jarak, status dalam/di luar)
- [x] Live Timer (jam masuk, target pulang, countdown, lama bekerja)
- [x] Selfie section modern dengan loading/success states
- [x] Search bar pada riwayat
- [x] Filter bulan, tahun, status
- [x] Tab Daftar & Statistik
- [x] Statistics cards (6 status)
- [x] Weekly & Monthly bar charts
- [x] Google Maps link pada detail
- [x] Export PDF via browser print
- **Backend:** GET `/api/attendance/company-location`, GET `/api/attendance/history/stats`
- **Files:** `Attendance.tsx` (rewrite), `History.tsx` (rewrite), `attendance.service.ts`, `attendance.controller.ts`, `attendance.routes.ts`

### ESS Sprint 3+: Schedule, Leave, Profile, Notification, UI Polish (2026-07-09)
- [x] Schedule: monthly calendar, weekly list, shift types, holidays, WFH/WFO, empty state
- [x] Leave: 5-step wizard (Jenis→Tanggal→Dokumen→Review→Submit), balance display
- [x] LeaveHistory: balance cards, timeline approval, expandable details
- [x] Profile: view/edit profile, upload photo, change password
- [x] Notification: categories (Approval/Reminder/Pengumuman/HR/Sistem), read/unread, mark all read
- [x] UI Polish: SVG icons nav, lazy loading, reusable EmptyState component
- **Backend:** PUT /auth/profile, PUT /auth/change-password, GET /leave-request/balance, Notification CRUD
- **New Files:** Profile.tsx, Notification.tsx, notification.service.ts, notification.controller.ts, notification.routes.ts
- **Updated Files:** Schedule.tsx, LeaveRequest.tsx, LeaveHistory.tsx, EmployeeLayout.tsx, App.tsx, AuthContext.tsx, schema.prisma, auth.service.ts, leave.service.ts, auth.controller.ts, leave.controller.ts, app.ts

### Full Integration Test (2026-07-09)
- [x] 19 API endpoints tested and passed
- [x] Employee endpoints: login, profile, updateProfile, leaveBalance, notifications, markAllRead, attendance, companyLocation, historyStats, schedule, dashboard
- [x] Admin endpoints: login, dashboard, employees, schedules, reports, holidays, leaveRequests
- [x] RBAC: Employee blocked from admin routes (403)
- [x] Unit tests: 121/121 pass (16 test files)
- [x] TypeScript: clean compilation (frontend + backend)
- [x] Security: JWT auth, RBAC, password validation, photo upload limit

### Admin Dashboard - Layout & RBAC Foundation (2026-07-13)
- [x] Install Material UI (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled)
- [x] Add new roles: SUPER_ADMIN, HR (alongside existing ADMIN, EMPLOYEE)
- [x] AdminLayout rewrite with Material UI: collapsible sidebar, top navbar, profile menu, responsive drawer
- [x] Role-based routing: /employee/* for employees, /admin/* for admin/HR/super admin
- [x] Backward compatibility redirects (old routes → new routes)
- [x] Login redirect based on role (employee→/employee/dashboard, admin→/admin/dashboard)
- [x] ProtectedRoute with isAdminRole helper and role-aware redirect
- [x] Backend RBAC: ADMIN_ROLES constant, adminOnly middleware
- [x] Admin routes updated to allow ADMIN, HR, SUPER_ADMIN
- [x] Seed data: Super Admin + HR accounts
- [x] TypeScript: clean compilation (frontend + backend)
- [x] Unit tests: 121/121 pass
- [x] Admin sidebar menu: Dashboard, Manajemen Karyawan, Absensi, Jadwal Kerja, Persetujuan Cuti, Laporan, Live Tracking, Lokasi Kantor, Pengaturan Email
- **Next:** Admin Dashboard content implementation

---

## Risk & Mitigation

| Sprint | Risiko | Mitigasi |
|--------|--------|----------|
| 1 | JWT token bocor | Gunakan HTTPS, set expiry pendek, refresh token |
| 2 | GPS tidak akurat | Implementasi fallback manual check-in |
| 3 | File upload bocor | Validasi tipe file, enkripsi, batasi ukuran |
| 4 | Import data corrupt | Preview sebelum import, validasi format |
| 5 | Live tracking lambat | Gunakan WebSocket, caching, optimize query |
| 6 | Export file corrupt | Validate output, test dengan data besar |

---

## Definition of Done (DoD) per Sprint

- [x] Semua tasks dalam sprint selesai
- [x] Semua acceptance criteria terpenuhi
- [ ] Unit test passing (>80% coverage)
- [x] Code review selesai
- [x] Tidak ada bug kritis/medium yang terbuka
- [x] Documentation updated
- [ ] Deploy ke staging environment
- [x] QA testing selesai
- [x] Security testing selesai
