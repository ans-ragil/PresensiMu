# TODO Migrasi Penuh Vercel + Turso

## Fase 1 — Fondasi Serverless ✅
- [x] Pisahkan konfigurasi Express dari `app.listen()`
- [x] Tambahkan local server entrypoint `server/src/index.ts`
- [x] Tambahkan Vercel Function catch-all `api/[...path].ts`
- [x] Hapus static serving frontend dari Express
- [x] Tambahkan API 404 handler
- [x] QA: TypeScript backend dan 121 unit test

## Fase 2 — Monorepo Build & Routing Vercel
- [ ] Ubah root project menjadi npm workspaces (`client`, `server`)
- [ ] Tambahkan build scripts untuk Vercel
- [ ] Update `vercel.json` untuk Vite static output + SPA fallback + API Function
- [ ] Pastikan production frontend memakai same-origin `/api`
- [ ] QA: install workspace, backend build, frontend production build

## Fase 3 — Turso Serverless Reliability
- [ ] Jadikan Prisma + LibSQL client singleton untuk warm invocation
- [ ] Validasi environment Turso secara eksplisit
- [ ] Perketat CORS ke origin environment yang dikenal
- [ ] QA: TypeScript, unit test, dan koneksi Turso

## Fase 4 — Distributed Rate Limiting & Migration
- [ ] Tambahkan model rate-limit bucket di Prisma
- [ ] Implementasikan Express rate-limit store berbasis Turso
- [ ] Buat migration runner Turso yang versioned dan idempotent
- [ ] Tambahkan migration awal + rate-limit
- [ ] QA migration terhadap database lokal/cloud dan test middleware

## Fase 5 — QA, Security, dan Dokumentasi
- [ ] Jalankan seluruh backend tests
- [ ] Jalankan frontend production build
- [ ] Audit bundle/dependency dan secret tracking
- [ ] Update `.env.example`, README, dan AGENTS.md
- [ ] Dokumentasikan environment variables dan langkah deploy Vercel
- [ ] Final verification checklist
