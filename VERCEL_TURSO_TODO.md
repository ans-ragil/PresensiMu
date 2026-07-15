# TODO Migrasi Penuh Vercel + Turso

## Fase 1 — Fondasi Serverless ✅
- [x] Pisahkan konfigurasi Express dari `app.listen()`
- [x] Tambahkan local server entrypoint `server/src/index.ts`
- [x] Tambahkan single Vercel Function `api/index.ts` + rewrite `/api/:path*`
- [x] Hapus static serving frontend dari Express
- [x] Tambahkan API 404 handler
- [x] QA: TypeScript backend dan 121 unit test

## Fase 2 — Monorepo Build & Routing Vercel ✅
- [x] Ubah root project menjadi npm workspaces (`client`, `server`)
- [x] Tambahkan build scripts untuk Vercel
- [x] Update `vercel.json` untuk Vite static output + SPA fallback + API Function
- [x] Pastikan production frontend memakai same-origin `/api`
- [x] QA: install workspace, backend build, frontend production build

## Fase 3 — Turso Serverless Reliability ✅
- [x] Jadikan Prisma + LibSQL client singleton untuk warm invocation
- [x] Validasi environment Turso secara eksplisit
- [x] Perketat CORS ke origin environment yang dikenal
- [x] QA: TypeScript, 122 unit test, singleton, dan koneksi Turso (4 user)

## Fase 4 — Distributed Rate Limiting & Migration ✅
- [x] Tambahkan model rate-limit bucket di Prisma
- [x] Implementasikan Express rate-limit store berbasis Turso
- [x] Buat migration runner Turso yang versioned dan idempotent
- [x] Tambahkan migration awal + rate-limit
- [x] QA: 126 tests, migration cloud applied + idempotent, login sukses, bucket Turso tercatat

## Fase 5 — QA, Security, dan Dokumentasi ✅
- [x] Jalankan seluruh backend tests — 127/127 lulus
- [x] Jalankan frontend production build — sukses
- [x] Audit bundle/dependency dan secret tracking — high vulnerability dihapus; 2 moderate transitif terdokumentasi
- [x] Update `.env.example`, README, dan AGENTS.md
- [x] Dokumentasikan environment variables dan langkah deploy Vercel
- [x] Final verification: config valid, API entry bundle 128KB, migration idempotent, Turso/login aktif
