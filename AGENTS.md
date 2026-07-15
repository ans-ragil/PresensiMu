Agent Coding AI wajib patuhi aturan ini
-selalu catat progres di setiap langkah.tambahkan dibagian paling bawah file ini
-setiap pengerjaan sprint yang diinstruksikan oleh manusia (user) flow yang harus diikuti
    - perencanaan->implementasi->qa test->security test->update docs
-setiap promt yang aku kirim dan kamu jawab (kapanpun) diterminal, itu dianggap progres dan wajib dicatat

---

## Progres

### 2026-07-01: Sprint Plan Created
- **Status:** Selesai
- **Detail:** Membuat sprint breakdown untuk Sistem Absensi Online Karyawan
- **File:** `SPRINT.md` (6 sprint, 1 sprint = 1 minggu)
- **Sprint Overview:**
  - Sprint 1: Foundation & Authentication
  - Sprint 2: Clock In/Out & Attendance
  - Sprint 3: Leave Request & Admin Dashboard
  - Sprint 4: Schedule Management & Shift
  - Sprint 5: Live Tracking & Maps
  - Sprint 6: Reports, Export & Finalization

### 2026-07-01: Sprint 1 - Foundation & Authentication
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Setup project structure, autentikasi (register, login, logout), RBAC, Docker
- **Files Created (38 files):**
  - Backend: `server/src/` (app.ts, routes, controllers, services, middleware, utils)
  - Frontend: `client/src/` (App.tsx, pages, contexts, services, components)
  - Infrastructure: docker-compose.yml, nginx/default.conf, Dockerfiles
  - Config: package.json, tsconfig.json, prisma/schema.prisma
- **Tech Stack:** Node.js + Express + TypeScript + Prisma + React + Vite + Tailwind
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - Password: bcrypt 10 rounds
  - JWT: 30m access, 7d refresh
  - Rate limiting: 10 req/15min on auth endpoints
  - CORS + Helmet security headers
  - Generic error messages (no user enumeration)
- **Next:** Sprint 2 - Clock In/Out & Attendance

### 2026-07-01: Sprint 2 - Clock In/Out & Attendance
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Clock in/out dengan GPS + selfie, dashboard, riwayat, jadwal
- **Files Created (10 new):**
  - Backend: `attendance.routes.ts`, `attendance.controller.ts`, `attendance.service.ts`, `location.ts`
  - Frontend: `Attendance.tsx`, `History.tsx`, `Schedule.tsx`, `CameraCapture.tsx`, `StatusBadge.tsx`
  - Updated: `schema.prisma` (Attendance + Schedule models)
- **Database Models:** Attendance, Schedule
- **API Endpoints:** 5 new (clock-in, clock-out, today, history, schedule)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - GPS validation (latitude/longitude required)
  - Selfie size validation (max 2MB)
  - User ID from JWT token (not request body)
  - One clock in/out per day enforcement
- **Next:** Sprint 3 - Leave Request & Admin Dashboard

### 2026-07-01: Sprint 3 - Leave Request & Admin Dashboard
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Pengajuan cuti/izin, dashboard admin, approve/reject cuti
- **Files Created (12 new):**
  - Backend: `leave.routes.ts`, `admin.routes.ts`, `leave.controller.ts`, `admin.controller.ts`, `leave.service.ts`, `admin.service.ts`
  - Frontend: `LeaveRequest.tsx`, `LeaveHistory.tsx`, `Modal.tsx`, `admin/Dashboard.tsx`, `admin/LeaveManagement.tsx`, `admin/AdminAttendance.tsx`
  - Updated: `schema.prisma` (LeaveRequest model), `app.ts`, `errorHandler.ts`, `App.tsx`, `Dashboard.tsx`
- **Database Models:** LeaveRequest (with LeaveType and LeaveStatus enums)
- **API Endpoints:** 9 new (leave-request CRUD, admin dashboard, admin leave management, admin attendance, admin employees)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - RBAC: Admin routes require ADMIN role
  - Employee只能查看自己的数据
  - Validasi tipe izin (hanya type yang diizinkan)
  - Validasi tanggal (mulai <= selesai)
  - Prevent overlapping leave requests
  - Validasi ukuran bukti (max 2MB)
- **Next:** Sprint 4 - Schedule Management & Shift

### 2026-07-01: Sprint 4 - Schedule Management & Shift
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Manajemen jadwal kerja, shift, import Excel, hari libur
- **Files Created (4 new):**
  - Backend: `schedule.service.ts`, `schedule.controller.ts`
  - Frontend: `admin/ScheduleManagement.tsx`, `admin/EmployeeList.tsx`
  - Updated: `schema.prisma` (Holiday model, toleransiMenit field), `admin.routes.ts`, `errorHandler.ts`, `App.tsx`, `admin/Dashboard.tsx`
- **Database Models:** Holiday (new), Schedule (updated with toleransiMenit)
- **API Endpoints:** 9 new (schedule CRUD, bulk assign, import, holiday CRUD)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - RBAC: All admin routes require ADMIN role
  - File upload: multer memory storage
  - Input validation: time format (HH:MM), hari range (0-6)
  - Schedule validation: jamMulai < jamSelesai
  - Holiday validation: prevent duplicate dates
- **Next:** Sprint 5 - Live Tracking & Maps

### 2026-07-01: Sprint 5 - Live Tracking & Maps
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Live tracking karyawan dengan peta, history lokasi, validasi radius
- **Files Created (4 new):**
  - Backend: `tracking.service.ts`, `tracking.controller.ts`
  - Frontend: `admin/LiveTracking.tsx`, `admin/CompanyLocation.tsx`
  - Updated: `schema.prisma` (CompanyLocation model), `admin.routes.ts`, `errorHandler.ts`, `App.tsx`, `admin/Dashboard.tsx`, `utils/location.ts` (export Coordinates)
- **Database Models:** CompanyLocation (new)
- **API Endpoints:** 5 new (company-location CRUD, tracking live, tracking history, tracking alerts)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - RBAC: All admin routes require ADMIN role
  - Only admins can view live tracking
  - Employee locations not accessible by other employees
  - Company location only configurable by admin
- **Next:** Sprint 6 - Reports, Export & Finalization

### 2026-07-01: Sprint 6 - Reports, Export & Finalization
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Laporan, export Excel/PDF/CSV, email settings
- **Files Created (6 new):**
  - Backend: `report.service.ts`, `report.controller.ts`, `utils/export.ts`
  - Frontend: `admin/Reports.tsx`, `admin/EmailSettings.tsx`
  - Updated: `schema.prisma` (EmailSetting model), `admin.routes.ts`, `errorHandler.ts`, `App.tsx`, `admin/Dashboard.tsx`
- **Database Models:** EmailSetting (new)
- **API Endpoints:** 8 new (reports daily/weekly/monthly/employee/leave, export, email-settings CRUD)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - RBAC: All admin routes require ADMIN role
  - Only admins can view reports
  - Export files don't contain sensitive data
  - Email settings protected by RBAC
- **Next:** Project Complete - All 6 Sprints Done!

### 2026-07-08: Daily Report Coverage Improvement
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Menyempurnakan laporan harian agar mencakup seluruh karyawan, termasuk yang sedang cuti dan yang belum absen.
- **Files Updated:** `server/src/services/report.service.ts`, `server/src/services/report.service.test.ts`
- **QA Test:** `npm test` di folder server berhasil, 120 test lulus.
- **Next:** Lanjutkan verifikasi alur end-to-end aplikasi.

### 2026-07-08: UI/UX Overhaul - Navigation, Camera Fix, Layout System
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Perbaikan menyeluruh UI/UX agar seperti sistem absensi pada umumnya. Masalah kritis: tidak ada navigasi di semua halaman, kamera tidak cleanup stream, tidak ada jam real-time, admin pages terisolasi.
- **Files Created (2):**
  - `client/src/components/EmployeeLayout.tsx` — shared layout dengan bottom nav bar (5 items: Beranda, Absensi, Riwayat, Jadwal, Cuti)
  - `client/src/components/AdminLayout.tsx` — shared layout dengan responsive sidebar + hamburger menu (9 nav items)
- **Files Updated (16):**
  - `client/src/App.tsx` — routes wrapped dengan layout components
  - `client/src/components/CameraCapture.tsx` — stream cleanup on unmount, 3 detik countdown timer, improved UI
  - `client/src/pages/Dashboard.tsx` — real-time clock, card grid, 4 quick action buttons
  - `client/src/pages/Attendance.tsx` — real-time clock, GPS watchPosition + refresh button, countdown camera
  - `client/src/pages/History.tsx` — card-based list, auto-fetch on date change
  - `client/src/pages/Schedule.tsx` — toleransiMenit display, Senin-Minggu order
  - `client/src/pages/LeaveRequest.tsx` — tombol back, form lebih ringkas
  - `client/src/pages/LeaveHistory.tsx` — filter tabs lebih bersih
  - `client/src/pages/Register.tsx` — hapus role dropdown (security fix)
  - `client/src/pages/admin/Dashboard.tsx` — removed wrapper, uses AdminLayout
  - `client/src/pages/admin/LeaveManagement.tsx` — removed wrapper
  - `client/src/pages/admin/AdminAttendance.tsx` — removed wrapper
  - `client/src/pages/admin/ScheduleManagement.tsx` — removed wrapper
  - `client/src/pages/admin/EmployeeList.tsx` — removed wrapper
  - `client/src/pages/admin/Reports.tsx` — removed wrapper
  - `client/src/pages/admin/LiveTracking.tsx` — removed wrapper
  - `client/src/pages/admin/CompanyLocation.tsx` — removed wrapper
  - `client/src/pages/admin/EmailSettings.tsx` — removed wrapper
- **Security Fix:**
  - Self-registration sekarang selalu registrasi sebagai EMPLOYEE (tidak bisa pilih ADMIN)
- **QA Test:** TypeScript compilation clean, no errors
- **Next:** Restart server & test di browser

### 2026-07-09: ESS Sprint 1 - Modern Dashboard
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Redesign halaman Dashboard karyawan menjadi modern ESS-style dengan greeting, profile card, attendance summary, monthly stats, quick menu, information cards
- **Files Created (7 new):**
  - Backend: `server/src/services/dashboard.service.ts`, `server/src/controllers/dashboard.controller.ts`, `server/src/routes/dashboard.routes.ts`
  - Frontend: `client/src/types/index.ts`, `client/src/hooks/useGreeting.ts`, `client/src/hooks/useClock.ts`, `client/src/components/Skeleton.tsx`, `client/src/components/EmptyState.tsx`, `client/src/components/SectionHeader.tsx`
- **Files Updated (3):**
  - `client/src/pages/Dashboard.tsx` — complete rewrite (396 lines): greeting, profile card, attendance summary w/ progress bar, weekly chart, monthly stats, quick menu, pending leaves, upcoming holidays
  - `server/prisma/schema.prisma` — added User fields: nik, jabatan, divisi, alamat, foto, tanggalBergabung
  - `server/src/services/auth.service.ts` — register, login, getUserById return new fields
  - `server/src/app.ts` — mounted `/api/dashboard` route
- **API Endpoints:** 1 new (GET `/api/dashboard` — aggregated dashboard data)
- **QA Test:** TypeScript compilation clean, no errors
- **Security Test:**
  - Dashboard API requires authMiddleware (JWT token)
  - User只能查看自己的dashboard数据
  - New User fields are optional (backward compatible)
- **Next:** ESS Sprint 2 - Halaman Absensi

### 2026-07-09: ESS Sprint 2 - Modern Attendance & History
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Redesign halaman Absensi dan Riwayat menjadi modern ESS-style
- **Files Created (0):** (no new files, only rewrites)
- **Files Updated (5):**
  - `client/src/pages/Attendance.tsx` — complete rewrite (330 lines): progress steps (GPS→Selfie→Validasi→Selesai), location info card (company name, radius, distance, within/outside status), live timer (elapsed time, countdown to target), modern selfie section with loading/success states
  - `client/src/pages/History.tsx` — complete rewrite (350 lines): search bar, month/year/status filters, tab list/stats, statistics cards (6 statuses), weekly & monthly bar charts, Google Maps link, PDF export via print
  - `server/src/services/attendance.service.ts` — added getCompanyLocation(), getHistoryStats() with weekly/monthly aggregation
  - `server/src/controllers/attendance.controller.ts` — added getCompanyLocation(), getHistoryStats() handlers
  - `server/src/routes/attendance.routes.ts` — added GET /company-location, GET /history/stats
- **API Endpoints:** 2 new (GET `/api/attendance/company-location`, GET `/api/attendance/history/stats`)
- **Bug Fix:** Fixed pre-existing test bug in admin.service.test.ts (getAllAttendance params)
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 tests pass
- **Security Test:**
  - All new endpoints require authMiddleware (JWT token)
  - User只能查看自己的数据
  - Company location endpoint is read-only for employees
  - PDF export is client-side only (no sensitive data sent)
- **Next:** ESS Sprint 3 - Halaman Riwayat

### 2026-07-09: ESS Sprint 3+ - Schedule, Leave, Profile, Notification, UI Polish
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Rewrite halaman Jadwal, Cuti (wizard), Profile, Notification, dan UI Polish
- **Files Created (5):**
  - `client/src/pages/Profile.tsx` — new page: view/edit profile, upload photo, change password
  - `client/src/pages/Notification.tsx` — new page: notification center with categories, read/unread, mark all read
  - `server/src/services/notification.service.ts` — notification CRUD
  - `server/src/controllers/notification.controller.ts` — 3 handlers
  - `server/src/routes/notification.routes.ts` — 3 routes
- **Files Updated (12):**
  - `client/src/pages/Schedule.tsx` — complete rewrite: monthly calendar, weekly list, holidays, shift types, modern empty state
  - `client/src/pages/LeaveRequest.tsx` — complete rewrite: 5-step wizard (Jenis→Tanggal→Dokumen→Review→Submit), balance display
  - `client/src/pages/LeaveHistory.tsx` — complete rewrite: balance cards, timeline approval, expandable details
  - `client/src/components/EmployeeLayout.tsx` — SVG icons, 7 nav items (added Profile, Notification)
  - `client/src/App.tsx` — lazy loading for all pages, new routes
  - `client/src/contexts/AuthContext.tsx` — added alamat, foto, tanggalBergabung to User interface
  - `server/prisma/schema.prisma` — added Notification model
  - `server/src/services/auth.service.ts` — added updateProfile(), changePassword()
  - `server/src/services/leave.service.ts` — added getLeaveBalance()
  - `server/src/controllers/auth.controller.ts` — added updateProfile(), changePassword()
  - `server/src/controllers/leave.controller.ts` — added getLeaveBalance()
  - `server/src/app.ts` — mounted /api/notifications
- **API Endpoints:** 6 new (PUT /auth/profile, PUT /auth/change-password, GET /leave-request/balance, GET /notifications, PUT /notifications/:id/read, PUT /notifications/read-all)
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 tests pass
- **Security Test:**
  - Profile update requires authMiddleware
  - Password change validates current password
  - Leave balance only shows own data
  - Notifications only show own data
  - Photo upload max 2MB validation
- **Next:** UI Polish & Finalization

### 2026-07-09: Full Integration Test
- **Status:** Selesai
- **Flow:** QA Test + Security Test
- **Detail:** Full API integration testing - 19 endpoints tested, all passed
- **Test Results (19/19 PASSED):**
  - Employee Login, Profile, UpdateProfile, LeaveBalance, Notifications, MarkAllRead
  - Attendance Today, CompanyLocation, HistoryStats, Schedule, Dashboard
  - Admin Login, Dashboard, Employees, Schedules, Reports, Holidays, LeaveRequests
  - RBAC: Employee blocked from admin (403)
- **Unit Tests:** 121/121 pass (16 test files)
- **TypeScript:** Clean compilation (frontend + backend)
- **Security Test:**
  - RBAC properly blocks employee from admin routes
  - All endpoints require JWT authentication
  - Password change validates current password
  - Profile photo upload max 2MB
- **Final Status:** Application ready for deployment

### 2026-07-13: Admin Dashboard - Layout & RBAC Foundation
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Setup struktur Admin Dashboard dengan Material UI, role-based routing, dan RBAC 3 level (Super Admin, HR, Employee)
- **Files Created (0):** (no new files, only modifications)
- **Files Updated (10):**
  - `client/package.json` — added @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
  - `client/src/App.tsx` — restructured routes: `/employee/*` prefix for employee, `/admin/*` for admin, backward compatibility redirects, role-based PublicRoute redirect
  - `client/src/contexts/AuthContext.tsx` — added UserRole type (EMPLOYEE, ADMIN, HR, SUPER_ADMIN), updated User interface
  - `client/src/components/ProtectedRoute.tsx` — added isAdminRole helper, role-aware redirect
  - `client/src/components/AdminLayout.tsx` — complete rewrite with Material UI: collapsible sidebar with gradient logo, top navbar with profile/menu/notifications, responsive mobile drawer, modern SVG icons
  - `client/src/components/EmployeeLayout.tsx` — updated nav paths to `/employee/*`, role check for admin badge
  - `client/src/pages/Login.tsx` — role-based redirect (employee→/employee/dashboard, admin→/admin/dashboard)
  - `client/src/pages/Dashboard.tsx` — updated internal links to `/employee/*` prefix
  - `client/src/pages/LeaveHistory.tsx` — updated links to `/employee/*` prefix
  - `client/src/pages/LeaveRequest.tsx` — updated links to `/employee/*` prefix
  - `client/src/pages/admin/Dashboard.tsx` — updated links from `/admin/schedule-management` to `/admin/schedule`
  - `client/src/pages/admin/EmployeeList.tsx` — updated links from `/admin/schedule-management` to `/admin/schedule`
  - `server/src/middleware/rbac.ts` — added ADMIN_ROLES constant, exported adminOnly convenience middleware
  - `server/src/routes/admin.routes.ts` — updated to allow ADMIN, HR, SUPER_ADMIN roles
  - `server/prisma/seed.ts` — added Super Admin and HR seed accounts
- **New Roles:**
  - SUPER_ADMIN: superadmin@presensimu.com / superadmin123
  - HR: hr@presensimu.com / hr123
  - ADMIN: admin@presensimu.com / admin123 (existing)
  - EMPLOYEE: karyawan@presensimu.com / karyawan123 (existing)
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 backend tests pass
- **Security Test:**
  - RBAC: ADMIN/HR/SUPER_ADMIN can access admin routes
  - Employee cannot access admin routes (403)
  - Registration still creates EMPLOYEE only (security fix preserved)
  - Login redirects based on role
- **Files Changed Summary:**
  | File | Reason |
  |------|--------|
  | `client/package.json` | Add Material UI dependencies |
  | `client/src/App.tsx` | Role-based routing with /employee/ and /admin/ prefixes |
  | `client/src/contexts/AuthContext.tsx` | Add UserRole type (SUPER_ADMIN, HR) |
  | `client/src/components/ProtectedRoute.tsx` | Role-aware redirect + isAdminRole helper |
  | `client/src/components/AdminLayout.tsx` | Complete rewrite with Material UI sidebar/topbar |
  | `client/src/components/EmployeeLayout.tsx` | Update nav paths to /employee/* |
  | `client/src/pages/Login.tsx` | Role-based redirect after login |
  | `client/src/pages/Dashboard.tsx` | Update links to /employee/* prefix |
  | `client/src/pages/LeaveHistory.tsx` | Update links to /employee/* prefix |
  | `client/src/pages/LeaveRequest.tsx` | Update links to /employee/* prefix |
  | `client/src/pages/admin/Dashboard.tsx` | Update link to /admin/schedule |
  | `client/src/pages/admin/EmployeeList.tsx` | Update links to /admin/schedule |
  | `server/src/middleware/rbac.ts` | Add ADMIN_ROLES constant + adminOnly middleware |
  | `server/src/routes/admin.routes.ts` | Allow HR/SUPER_ADMIN access |
  | `server/prisma/seed.ts` | Add Super Admin + HR seed accounts |
- **Next:** Admin Dashboard content implementation

### 2026-07-13: Backend API - Employee Management CRUD
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Backend API untuk manajemen karyawan: CRUD, filter, search, pagination, plus Division/Position/Shift management
- **Files Created (3 new):**
  - `server/src/services/employee.service.ts` — EmployeeService class: CRUD karyawan + Division/Position/Shift CRUD + filter/search/pagination + soft delete + restore + change password
  - `server/src/controllers/employee.controller.ts` — EmployeeController: 18 handler methods for all employee/division/position/shift operations
  - `server/src/routes/employee.routes.ts` — 20 API endpoints under /api/employees with RBAC
- **Files Updated (2):**
  - `server/src/app.ts` — mounted /api/employees route
  - `server/src/middleware/errorHandler.ts` — added error handlers for Karyawan/Divisi/Jabatan/Shift not found + duplicate name errors
- **API Endpoints (20 new):**
  - Employee: GET / (list+filter), GET /:id, POST /, PUT /:id, DELETE /:id, PUT /:id/restore, PUT /:id/change-password
  - Division: GET /divisions/list, POST /divisions, PUT /divisions/:id, DELETE /divisions/:id
  - Position: GET /positions/list, POST /positions, PUT /positions/:id, DELETE /positions/:id
  - Shift: GET /shifts/list, POST /shifts, PUT /shifts/:id, DELETE /shifts/:id
- **QA Test:** TypeScript compilation clean, 121 backend tests pass (no regressions)
- **Security Test:**
  - All endpoints require authMiddleware (JWT) + adminOnly (ADMIN/HR/SUPER_ADMIN)
  - Employee cannot access employee management routes (403)
  - Email uniqueness validation on create/update
  - FK reference validation (divisiId, jabatanId, shiftId checked against DB)
  - Soft delete pattern (isActive=false) preserves data integrity
- **Next:** Frontend Employee Management pages

### 2026-07-13: HR Module Frontend - 5 Modul Material UI
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Implementasi 5 modul HR frontend dengan Material UI: Jadwal Kerja, Monitoring Absensi, Persetujuan Cuti, Laporan, Pengaturan
- **Files Created (11 new):**
  - `client/src/theme/adminTheme.ts` — MUI theme dengan primary #6366f1, custom card/button/chip/table styles
  - `client/src/components/hr/HrPageContainer.tsx` — Shared page layout dengan title, subtitle, breadcrumbs, actions
  - `client/src/components/hr/HrSkeleton.tsx` — Skeleton loading: TableSkeleton, CardSkeleton, CalendarSkeleton, FormSkeleton
  - `client/src/components/hr/HrEmptyState.tsx` — Empty state component dengan icon, title, description, action
  - `client/src/services/hrApi.ts` — API service layer: employeeApi, divisionApi, positionApi, shiftApi, scheduleApi, holidayApi, attendanceApi, leaveApi, reportApi, locationApi, dashboardApi
  - `client/src/pages/admin/HrSchedule.tsx` — Calendar View dengan CRUD jadwal, bulk assign, holiday management (655 lines)
  - `client/src/pages/admin/HrAttendance.tsx` — Tabel monitoring absensi dengan filter (date/status/divisi/shift), detail modal selfie/maps/duration (488 lines)
  - `client/src/pages/admin/HrLeaveApproval.tsx` — Approval workflow dengan tab (Menunggu/Disetujui/Ditolak/Semua), approve/reject dengan catatan (413 lines)
  - `client/src/pages/admin/HrReports.tsx` — 5 tipe laporan (harian/mingguan/bulanan/per karyawan/cuti), export PDF/Excel/CSV (342 lines)
  - `client/src/pages/admin/HrSettings.tsx` — Company profile, lokasi (Google Maps embed), jam kerja, SMTP, logo upload, holiday management (489 lines)
- **Files Updated (4):**
  - `client/src/types/index.ts` — Added UserRole type, Division, Position, Shift, LeaveRequest, CompanyLocation, Pagination, EmployeeFilter, DailyReport interfaces
  - `client/src/components/AdminLayout.tsx` — Updated navigation menu: HR Module section (5 items) + Management section + Settings section
  - `client/src/App.tsx` — Added 5 HR module routes under /admin/hr/*, lazy imports for all new pages
- **Modules Implemented:**
  1. **Jadwal Kerja** — Calendar View bulanan, CRUD jadwal per hari, bulk assign karyawan, kelola hari libur
  2. **Monitoring Absensi** — Tabel dengan filter (tanggal/cari/status/divisi/shift), summary cards, detail modal (selfie, Google Maps, durasi)
  3. **Persetujuan Cuti** — Tab-based workflow, approve/reject dengan catatan, badge notification pending
  4. **Laporan** — 5 tipe laporan, filter dinamis, export ke PDF/Excel/CSV
  5. **Pengaturan** — 6 tab (Profil/Lokasi/Jam Kerja/SMTP/Logo/Hari Libur), Google Maps embed, GPS detection
- **Tech Stack:** Material UI v9, React Router, Axios, TypeScript
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 backend tests pass (no regressions)
- **Security Test:**
  - All HR module routes require ADMIN_ROLES authentication
  - Employee portal unchanged (tidak ada perubahan)
  - RBAC maintained: ADMIN/HR/SUPER_ADMIN only
- **Employee Portal Status:** TIDAK BERUBAH - semua halaman employee tetap berfungsi normal
- **Next:** Employee Portal verification, update README.md, update SPRINT.md

### 2026-07-13: Backend HR Module - Settings API + Enhanced Attendance
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Backend API untuk Company Settings (profil, jam kerja, SMTP, logo) + enhanced attendance filter
- **Files Created (3 new):**
  - `server/src/services/settings.service.ts` — SettingsService: getAll, get/set company profile, work time, SMTP, logo dengan key-value pattern
  - `server/src/controllers/settings.controller.ts` — SettingsController: 9 handler methods untuk semua settings endpoints
  - `server/src/routes/settings.routes.ts` — 9 API endpoints under /api/settings dengan RBAC
- **Files Updated (4):**
  - `server/prisma/schema.prisma` — added CompanySetting model (key-value pattern)
  - `server/src/app.ts` — mounted /api/settings route
  - `server/src/services/admin.service.ts` — enhanced getAllAttendance with filter (divisiId, shiftId, status) + more user fields
  - `server/src/controllers/admin.controller.ts` — updated getAllAttendance to pass new filter params
  - `server/src/services/admin.service.test.ts` — fixed test for new getAllAttendance signature
  - `client/src/services/hrApi.ts` — added settingsApi (company profile, work time, SMTP, logo)
  - `client/src/pages/admin/HrSettings.tsx` — updated to use settingsApi for all save operations
- **API Endpoints (9 new):**
  - Company Profile: GET /settings/company-profile, PUT /settings/company-profile
  - Work Time: GET /settings/work-time, PUT /settings/work-time
  - SMTP: GET /settings/smtp, PUT /settings/smtp
  - Logo: GET /settings/logo, PUT /settings/logo
  - All Settings: GET /settings
- **Enhanced Endpoints:**
  - GET /admin/attendance — now supports filter: ?divisiId=&shiftId=&status= (before only ?startDate=&endDate=)
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 backend tests pass (no regressions)
- **Security Test:**
  - All settings endpoints require authMiddleware + adminOnly (ADMIN/HR/SUPER_ADMIN)
  - Employee cannot access settings routes (403)
  - Logo upload validates base64 size (max 2MB)
  - Settings stored as key-value in CompanySetting table
- **Employee Portal Status:** TIDAK BERUBAH
- **Next:** Integration testing seluruh modul HR

### 2026-07-13: Progress Logging - Login Error & Notification Fix
- **Status:** Dikerjakan
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Mencatat progres terkait perbaikan error login yang sebelumnya tampil generic `terjadi kesalahan` serta pengecekan alur notifikasi setelah perubahan autentikasi dan role-based access.
- **Scope:**
  - Backend auth: validasi credential login secara eksplisit
  - Error handling: mempertahankan `statusCode` dari auth error agar frontend tidak hanya menerima pesan generic
  - Notification flow: memastikan endpoint notifikasi tetap aman dan sesuai user yang sedang login
- **Files Targeted:** `server/src/services/auth.service.ts`, `server/src/middleware/errorHandler.ts`, `server/src/controllers/notification.controller.ts`
- **QA Test:** Menunggu verifikasi ulang login dan response notifikasi setelah patch
- **Security Test:** Pastikan auth failure tidak membuka user enumeration, serta role-based access untuk notifikasi tetap berlaku
- **Next:** Jalankan uji login ulang, cek pesan error spesifik, lalu validasi endpoint notifikasi untuk user HR/Admin/Employee

### 2026-07-13: User Clarification - Backend Login Fix Need
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** User menanyakan apakah perlu mengirim prompt terminal atau bug sudah selesai.
- **Kesimpulan:** Masalah login backend belum selesai; perlu patch auth service dan error handler sebelum menjalankan terminal seed/migrate.
- **Next:** Terapkan patch 401 untuk credential invalid, lalu jalankan migrate/seed di terminal.

### 2026-07-13: User Guidance - Admin/HR Testing Access
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** User menanyakan cara testing sistem sebagai admin/HR.
- **Decision:** Untuk testing role HR/Admin, gunakan akun seed yang tersedia di sistem. Register biasa hanya menghasilkan EMPLOYEE. Akun seed yang tersedia:
  - HR: `hr@presensimu.com` / `hr123`
  - ADMIN: `admin@presensimu.com` / `admin123`
  - SUPER_ADMIN: `superadmin@presensimu.com` / `superadmin123`
- **Outcome:** User tidak perlu membuat akun HR melalui form register untuk testing role admin/HR.

### 2026-07-15: UI Enhancement - Login & Register Page Redesign
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Redesign halaman Login dan Register agar lebih profesional dan modern
- **Files Updated (2):**
  - `client/src/pages/Login.tsx` — complete rewrite: split-panel layout (branding left, form right), email icon, password icon, **show/hide password toggle** (eye icon), "Ingat saya" checkbox, "Lupa password" link, gradient background with decorative blurs, feature highlights, modern card styling with rounded-xl
  - `client/src/pages/Register.tsx` — complete rewrite: same split-panel layout, person/email/phone/lock icons on all inputs, **show/hide password toggle** on both password fields, terms & conditions link, feature checklist on branding panel, modern card styling
- **Features Added:**
  - Eye icon (Visibility/VisibilityOff) untuk toggle show/hide password di Login & Register
  - MUI icons di setiap input field (EmailOutlined, LockOutlined, PersonOutlined, PhoneOutlined)
  - Split-panel layout: branding panel di kiri (gradient blue), form di kanan
  - Responsive: branding panel hanya tampil di desktop (lg breakpoint)
  - Mobile: logo centered di atas form
  - Decorative gradient blur effects di branding panel
  - "Ingat saya" checkbox & "Lupa password" link di Login
  - Terms & conditions text di Register
  - Feature highlights di branding panel (Login: Real-time/GPS/Laporan; Register: fitur checklist)
  - Footer copyright
  - Shadow & hover effects pada tombol submit
- **Tech Stack:** MUI Icons (@mui/icons-material) + Tailwind CSS
- **QA Test:** TypeScript compilation clean, 121 backend tests pass (no regressions)
- **Security Test:**
  - Password仍然hidden by default (type="password")
  - Toggle hanya frontend only (tidak mengubah security backend)
  - Form validation tetap berfungsi (required fields, email format, password min 6 chars)
  - Register tetap hanya menghasilkan EMPLOYEE role (security fix preserved)
- **Employee Portal Status:** TIDAK BERUBAH - semua halaman employee tetap berfungsi normal
- **Next:** UI Enhancement modul lain jika diperlukan

### 2026-07-15: Branding Rename - PresensiKu → PresensiMu
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Mengubah nama sistem dari "PresensiKu" menjadi "PresensiMu" di seluruh aplikasi
- **Files Updated (3):**
  - `client/src/pages/Login.tsx` — PresensiKu → PresensiMu (branding title + footer copyright)
  - `client/src/pages/Register.tsx` — PresensiKu → PresensiMu (branding title + footer copyright)
  - `client/src/components/EmployeeLayout.tsx` — Header navbar "Absensi" → "PresensiMu"
- **QA Test:** TypeScript compilation clean
- **Security Test:** No security impact (branding change only)
- **Next:** Tunggu instruksi selanjutnya

### 2026-07-15: UI Enhancement - Login & Register Page Redesign
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Redesign halaman Login dan Register agar lebih profesional dan modern
- **Files Updated (2):**
  - `client/src/pages/Login.tsx` — complete rewrite: split-panel layout (branding left, form right), email icon, password icon, **show/hide password toggle** (eye icon), "Ingat saya" checkbox, "Lupa password" link, gradient background with decorative blurs, feature highlights, modern card styling with rounded-xl
  - `client/src/pages/Register.tsx` — complete rewrite: same split-panel layout, person/email/phone/lock icons on all inputs, **show/hide password toggle** on both password fields, terms & conditions link, feature checklist on branding panel, modern card styling
- **Features Added:**
  - Eye icon (Visibility/VisibilityOff) untuk toggle show/hide password di Login & Register
  - MUI icons di setiap input field (EmailOutlined, LockOutlined, PersonOutlined, PhoneOutlined)
  - Split-panel layout: branding panel di kiri (gradient blue), form di kanan
  - Responsive: branding panel hanya tampil di desktop (lg breakpoint)
  - Mobile: logo centered di atas form
  - Decorative gradient blur effects di branding panel
  - "Ingat saya" checkbox & "Lupa password" link di Login
  - Terms & conditions text di Register
  - Feature highlights di branding panel (Login: Real-time/GPS/Laporan; Register: fitur checklist)
  - Footer copyright
  - Shadow & hover effects pada tombol submit
- **Tech Stack:** MUI Icons (@mui/icons-material) + Tailwind CSS
- **QA Test:** TypeScript compilation clean, 121 backend tests pass (no regressions)
- **Security Test:**
  - Password仍然hidden by default (type="password")
  - Toggle hanya frontend only (tidak mengubah security backend)
  - Form validation tetap berfungsi (required fields, email format, password min 6 chars)
  - Register tetap hanya menghasilkan EMPLOYEE role (security fix preserved)
- **Employee Portal Status:** TIDAK BERUBAH - semua halaman employee tetap berfungsi normal
- **Next:** UI Enhancement modul lain jika diperlukan

### 2026-07-15: Branding Rename - PresensiKu → PresensiMu
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Mengubah nama sistem dari "PresensiKu" menjadi "PresensiMu" di seluruh aplikasi
- **Files Updated (3):**
  - `client/src/pages/Login.tsx` — PresensiKu → PresensiMu (branding title + footer copyright)
  - `client/src/pages/Register.tsx` — PresensiKu → PresensiMu (branding title + footer copyright)
  - `client/src/components/EmployeeLayout.tsx` — Header navbar "Absensi" → "PresensiMu"
- **QA Test:** TypeScript compilation clean
- **Security Test:** No security impact (branding change only)
- **Next:** Tunggu instruksi selanjutnya

### 2026-07-15: HR Module Bug Fix - White Screen & Sync Issues
- **Status:** Selesai
- **Flow:** Investigasi → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Fix 2 bug pada modul HR/Admin:
  1. **Jadwal Kerja (HrSchedule.tsx) white screen** — root cause: `empRes.data.employees` should be `empRes.data.data.employees` (API returns `{ success, data: { employees, pagination } }`)
  2. **Monitoring Absensi (HrAttendance.tsx) tidak sync** — same bug + attendance enrichment uses `employees` list which was empty
  3. **Laporan (HrReports.tsx) employee list empty** — same bug
- **Root Cause:** `employeeApi.list()` returns `{ success: true, data: { employees: [...], pagination: {...} } }` but frontend accessed `res.data.employees` instead of `res.data.data.employees`
- **Files Fixed (4):**
  - `client/src/pages/admin/HrSchedule.tsx` — `empRes.data.employees` → `empRes.data.data.employees`
  - `client/src/pages/admin/HrAttendance.tsx` — same fix + added `r.user` as fallback in enrichment
  - `client/src/pages/admin/HrReports.tsx` — same fix
  - `client/src/services/hrApi.ts` — updated `employeeApi.list()` type annotation to match server response
- **QA Test:** TypeScript compilation clean, 121 backend tests pass (no regressions)
- **Security Test:** No security impact (data fetching fix only)
- **Next:** Monitoring Absensi masih belum sync — investigasi date filter backend

### 2026-07-15: Monitoring Absensi Date Filter Fix
- **Status:** Selesai
- **Flow:** Investigasi → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Monitoring Absensi menampilkan "Tidak ada data absensi" padahal data sudah ada di dashboard. Root cause: timezone mismatch pada date filter backend — `new Date("2026-07-15")` adalah midnight UTC, sedangkan `tanggal` attendance disimpan sebagai midnight timezone lokal. Akibatnya `lte` filter tidak match.
- **Root Cause:** `admin.service.ts` `getAllAttendance()` menggunakan `lte = new Date(filters.endDate)` yang hanya sampai midnight UTC, tidak mencakup seluruh hari dalam timezone lokal.
- **Fix:** Set `endDate` ke `23:59:59.999` agar mencakup seluruh hari:
  ```typescript
  // Before
  where.tanggal.lte = new Date(filters.endDate);
  // After
  const end = new Date(filters.endDate);
  end.setHours(23, 59, 59, 999);
  where.tanggal.lte = end;
  ```
  Sama dengan `startDate` — set ke `00:00:00.000` explicit.
- **File Fixed (1):**
  - `server/src/services/admin.service.ts` — `getAllAttendance()` date filter: `start.setHours(0,0,0,0)` + `end.setHours(23,59,59,999)`
- **QA Test:** TypeScript compilation clean, 121 backend tests pass (no regressions)
- **Security Test:** No security impact (query filter fix only)
- **Next:** Tunggu instruksi selanjutnya

### 2026-07-15: README.md Complete Rewrite
- **Status:** Selesai
- **Flow:** Implementasi → Update Docs
- **Detail:** Menulis ulang README.md agar lebih profesional dan lengkap
- **Sections:**
  - Nama proyek & badges (Node.js, React, TypeScript, Prisma, Tailwind, MIT)
  - Deskripsi singkat dengan link navigasi
  - Daftar Isi
  - Tentang (penjelasan proyek)
  - Fitur Utama (ESS, HR/Admin, RBAC) dalam tabel
  - Teknologi (Backend, Frontend, Infrastructure) dalam tabel
  - Screenshots (placeholder)
  - Struktur Project (tree diagram lengkap)
  - Cara Instalasi (manual + Docker)
  - Akun Default
  - Environment Variables
  - Dokumentasi API (lengkap semua endpoints dalam tabel)
  - Testing (unit 121/121 + integration 19/19)
  - Deployment (Docker + Manual)
  - Changelog v1.0
  - License
- **File Updated (1):** `README.md` — complete rewrite (350+ lines)
- **QA Test:** TypeScript compilation clean
- **Next:** Tunggu instruksi selanjutnya

### 2026-07-15: Vercel Deployment Preparation (Continued)
- **Status:** Selesai
- **Flow:** Investigasi → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Melanjutkan pekerjaan Vercel deployment preparation yang terputus. Semua config sudah ada, tinggal finalisasi dan .gitignore update.
- **Changes Already Made (from previous session):**
  - `client/src/services/api.ts` — dynamic `baseURL` via `VITE_API_URL` env var (fallback `/api` for local dev)
  - `server/src/app.ts` — multi-origin CORS (localhost + Vercel `.vercel.app`), conditional `app.listen()` for Vercel serverless
  - `vercel.json` — SPA rewrite rule for React Router
  - `client/.env.example` — env vars template
  - `client/.env.production` — Railway backend URL placeholder
  - `client/src/vite-env.d.ts` — Vite type definitions for `VITE_API_URL`
- **This Session:**
  - Updated `.gitignore` — added `server/prisma/dev.db`, `server/server.err`, `.vercel/`, `client/.env.production`
  - QA Test: TypeScript clean (frontend + backend), 121 backend tests pass, frontend production build successful (460KB gzip 151KB)
- **QA Test:** TypeScript compilation clean, 121 backend tests pass, frontend production build successful
- **Security Test:**
  - `VITE_API_URL` only exposed in browser (not sensitive — it's a public API URL)
  - `.env.production` excluded from git (contains deployed URL)
  - CORS whitelist prevents unauthorized origins
  - Serverless conditional listen prevents double-start on Vercel
- **Deployment Architecture:**
  - Frontend → Vercel (static SPA, auto-deploy from git)
  - Backend → Railway (Node.js server, separate deploy)
  - `.env.production` → set `VITE_API_URL` to Railway backend URL
- **Next:** Tunggu instruksi selanjutnya (deploy atau fitur lain)

### 2026-07-15: Fix Vercel 404 on Refresh & Login Error
- **Status:** Selesai
- **Flow:** Investigasi → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Fix 2 bug pada deployment Vercel:
  1. **404 saat refresh** — `vercel.json` rewrite `/(.*)` menangkap `/api/*` juga, jadi request ke backend diarahkan ke `index.html`. Fix: gunakan negative lookahead `((?!api/).*)` untuk exclude `/api/*` paths.
  2. **Login error "Terjadi Kesalahan Login"** — error handling tidak spesifik. Fix: tambah pengecekan network error (`!err.response`), rate limit (429), dan response error.
- **Files Updated (4):**
  - `vercel.json` — rewrite pattern exclude `/api/*`: `((?!api/).*)`
  - `client/vercel.json` — SPA rewrite untuk Vercel deployment dari `client/` directory
  - `client/src/pages/Login.tsx` — improved error handling: network error, rate limit, specific backend messages
- **Root Cause 404:** Vercel SPA routing — refresh pada route seperti `/admin/dashboard` tidak dikenali sebagai file, harus di-rewrite ke `index.html`. Tapi rewrite sebelumnya `/(.*)` juga menangkap `/api/auth/login`, sehingga login request diarahkan ke SPA bukan backend.
- **Root Cause Login:** Network error (backend tidak terjangkau) atau rate limiting — error handling sebelumnya selalu menampilkan fallback generic.
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 backend tests pass
- **Security Test:**
  - Rewrite pattern hanya mengecualikan `/api/*`, tidak mengubah security backend
  - Error handling tidak membuka informasi sensitif (hanya pesan umum)
  - Rate limit (20/5min) tetap berlaku
- **Next:** Deploy ke Vercel + Railway, atau lanjut fitur lain

### 2026-07-15: Railway Backend Deployment Fix
- **Status:** Selesai
- **Flow:** Investigasi → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Fix backend deployment ke Railway — 3 masalah ditemukan:
  1. **Prisma schema pakai SQLite** — Railway butuh PostgreSQL
  2. **Tidak ada `railway.json`** — Railway tidak tahu cara build monorepo
  3. **Build script tidak include Prisma generate** — Prisma client harus di-generate sebelum TypeScript compile
- **Files Updated (3):**
  - `server/prisma/schema.prisma` — provider `sqlite` → `postgresql`
  - `server/package.json` — build script: `tsc` → `prisma generate && tsc`
  - `client/.env.production` — URL: `presensimu-api.up.railway.app` → `presensimu-production.up.railway.app`
- **Files Created (2):**
  - `railway.json` — monorepo deployment config (`buildContext: "server"`)
  - `server/.env.example` — environment variables template
- **QA Test:** TypeScript compilation clean (frontend + backend), 121 backend tests pass
- **Security Test:** PostgreSQL connection uses DATABASE_URL env var (no hardcoded credentials)
- **Deployment Steps for User:**
  1. Add PostgreSQL addon on Railway (database tab)
  2. Set `DATABASE_URL` in Railway environment variables (from PostgreSQL addon)
  3. Run `prisma db push` to create tables (via Railway shell or locally)
  4. Run `prisma db seed` to seed data
  5. Set `VITE_API_URL` in Vercel environment variables = `https://presensimu-production.up.railway.app/api`
  6. Redeploy both Vercel and Railway
- **Next:** Jalankan deployment steps, test login

### 2026-07-15: Database Migration - PostgreSQL → Turso (LibSQL/SQLite)
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Migrasi database dari PostgreSQL ke Turso (LibSQL/SQLite) untuk deployment lebih mudah dan murah
- **Files Updated (6):**
  - `server/prisma/schema.prisma` — provider `postgresql` → `sqlite`
  - `server/src/config/database.ts` — gunakan Turso adapter (`@libsql/client` + `@prisma/adapter-libsql`)
  - `server/package.json` — tambah dependency `@libsql/client@^0.8.0` + `@prisma/adapter-libsql@^5.22.0`
  - `.env.example` — update format URL Turso
  - `server/.env.example` — update format URL Turso
  - `server/.env` — buat baru dengan local SQLite (`file:./prisma/dev.db`)
  - `docker-compose.yml` — hapus PostgreSQL service, update env vars ke Turso
  - `server/prisma/schema.prisma` — tambah `previewFeatures = ["driverAdapters"]` (fix adapter error)
- **Files Deleted:**
  - `server/prisma/migrations/` — hapus migration PostgreSQL lama (tidak kompatibel SQLite)
- **Database Created:** SQLite `dev.db` dengan 13 tabel (schema push)
- **Seed Data:** 4 akun (Super Admin, HR, Admin, Employee) + company location + 20 holidays
- **QA Test:** TypeScript compilation clean (frontend + backend), 121/121 backend tests pass
- **Security Test:**
  - Turso auth token via env var (tidak hardcoded)
  - Local dev menggunakan file-based SQLite (tidak perlu auth token)
  - `.gitignore` sudah exclude `dev.db` dan `dev.db-journal`
- **Catatan Teknis:**
  - `@libsql/client` harus versi `^0.8.0` (bukan `^0.14.0`) karena peer dependency `@prisma/adapter-libsql`
  - PrismaClient `adapter` option perlu `as any` cast karena type definitions Prisma v5 belum lengkap
  - Tidak ada raw SQL atau PostgreSQL-specific query di codebase → migrasi bersih
  - `contains` filter di Prisma untuk field `String` tetap works di SQLite
- **Deployment (Turso Cloud):**
  1. Buat database di turso.io
  2. Set `TURSO_DATABASE_URL=libsql://your-db.turso.io` dan `TURSO_AUTH_TOKEN` di environment
  3. Jalankan `npx prisma db push` untuk buat tabel
  4. Jalankan `npx tsx prisma/seed.ts` untuk seed data
- **Next:** Tunggu instruksi selanjutnya

### 2026-07-15: Fix Prisma Driver Adapter Error
- **Status:** Selesai
- **Detail:** Error `"adapter" property can only be provided... when "driverAdapters" preview feature is enabled` — fix dengan tambahkan `previewFeatures = ["driverAdapters"]` di generator client
- **File Updated:** `server/prisma/schema.prisma`
- **QA Test:** TypeScript clean, 121/121 tests pass

### 2026-07-15: Railway Prisma OpenSSL & Musl Runtime Fix
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Memperbaiki crash Railway akibat service memakai `server/Dockerfile` Alpine, sehingga libSQL dan Prisma memuat binary `linux-musl` yang membutuhkan `libssl.so.1.1`.
- **Root Cause:** Railway Root Directory masih `/server`; root `Dockerfile` tidak digunakan. `server/Dockerfile` sebelumnya memakai `node:20-alpine`.
- **Files Updated:** `Dockerfile`, `server/Dockerfile`
- **Fix:** Kedua image menggunakan `node:20-bookworm-slim` serta memasang `openssl` dan `ca-certificates` sebelum `prisma generate`.
- **QA Test:** Backend TypeScript clean, 121/121 tests pass, frontend production build sukses.
- **Security Test:** `server/.env` tetap di-ignore Git; credentials tidak masuk commit.
- **Deployment Requirement:** Untuk deploy frontend + backend dalam satu Railway service, Root Directory Railway harus dikosongkan atau `/`, bukan `/server`.

### 2026-07-15: Railway Frontend Static Path Diagnosis
- **Status:** Terdiagnosis
- **Detail:** Container berjalan pada port 8080 tetapi gagal menemukan `/client/dist/index.html`.
- **Root Cause:** Railway masih memakai service Root Directory `/server`, sehingga image dibangun dari `server/Dockerfile`; folder frontend tidak masuk Docker build context. Pada deployment gabungan yang benar, static file berada di `/app/client/dist/index.html`.
- **Required Action:** Kosongkan Root Directory Railway atau set ke `/`, gunakan root `Dockerfile`, hapus build cache, lalu redeploy commit terbaru.

### 2026-07-15: Railway Production Login API URL Fix
- **Status:** Selesai
- **Flow:** Perencanaan → Implementasi → QA Test → Security Test → Update Docs
- **Detail:** Memperbaiki login production yang masih mengarah ke URL backend Railway lama dari `VITE_API_URL`, padahal frontend dan backend kini satu domain.
- **Files Updated:** `client/src/services/api.ts`, `.dockerignore`
- **Fix:** Production selalu menggunakan same-origin `/api`; environment variable `VITE_API_URL` hanya dipakai saat development. `client/.env.production` juga tidak dimasukkan Docker context.
- **QA Test:** Frontend production build sukses; bundle tidak mengandung `presensimu-api.railway.app`; backend TypeScript clean dan 121/121 tests pass.
- **Security Test:** Same-origin API mengurangi kebutuhan CORS lintas domain dan mencegah request login terkirim ke host backend yang salah.

### 2026-07-15: Railway Final Environment Variables Guidance
- **Status:** Selesai
- **Detail:** Menetapkan variable deployment satu-service Railway: `DATABASE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`, expiry token, `NODE_ENV`, dan `CORS_ORIGIN`. `VITE_API_URL` serta `PORT` tidak perlu diset.
- **Security:** Turso token yang pernah terekspos harus dirotasi sebelum digunakan di production.

### 2026-07-15: Railway Public Domain Guidance
- **Status:** Selesai
- **Detail:** Menjelaskan pembuatan domain melalui Service → Settings/Networking → Public Networking → Generate Domain, pengujian `/api/health`, dan penyelarasan `CORS_ORIGIN`.

### 2026-07-15: Railway Frontend Access Guidance
- **Status:** Selesai
- **Detail:** Menetapkan bahwa frontend deployment gabungan diakses langsung dari root public domain Railway; `/api/*` hanya untuk backend dan route React seperti `/login` dilayani melalui SPA fallback.

### 2026-07-15: Live Railway Domain Verification
- **Status:** Backend sehat, frontend gagal termuat
- **Domain:** `presensimu-production.up.railway.app`
- **Results:** `/api/health` HTTP 200; `POST /api/auth/login` HTTP 200 dan credential admin valid; `/` dan `/login` HTTP 500 karena frontend `index.html` tidak tersedia dalam container.
- **Conclusion:** Login backend/Turso bukan masalah. Railway masih menjalankan build context backend-only (`/server`) sehingga `client/dist` tidak ikut ter-build.
