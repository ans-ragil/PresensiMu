# TODO Migrasi Penuh Vercel + Turso

## Fase 1 — Fondasi Serverless ✅
- [x] Pisahkan konfigurasi Express dari `app.listen()`
- [x] Tambahkan local server entrypoint `server/src/index.ts`
- [x] Tambahkan Vercel Function catch-all `api/[...path].ts`
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

## Fase 5 — QA, Security, dan Dokumentasi
- [ ] Jalankan seluruh backend tests
- [ ] Jalankan frontend production build
- [ ] Audit bundle/dependency dan secret tracking
- [ ] Update `.env.example`, README, dan AGENTS.md
- [ ] Dokumentasikan environment variables dan langkah deploy Vercel
- [ ] Final verification checklist
