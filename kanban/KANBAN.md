# Kanban Board Edu-Test PPDB

Siklus Task Wajib: `To Do` -> `In Progress` (`in_progress`) -> `In Review / Test` (`in_review`) -> `Done` (`closed`).

---

## 🏃 In Progress

*(Tidak ada task in progress)*

---

## ✅ Done

- [x] **EDU-TEST-39**: Optimasi Efisiensi Request & Database Query (Preload-data tap, eliminasi query redundan server, seleksi santri reaktif di klien tanpa reload, form use:enhance, dan dirty checking autosave)
- [x] **EDU-TEST-38**: Implementasi Pengaturan Gelombang & Tahun Ajaran (CRUD, Switch Aktif/Nonaktif, Kuota & Integrasi di `/peserta`)

- [x] **EDU-TEST-37**: Penyatuan Tab Wawancara Santri (Umum + Kepesantrenan), Poin Pertanyaan Dinamis (Bisa Diedit/Ditambah), dan Humanisasi Bahasa di `/wawancara`
- [x] **EDU-TEST-36**: Wajib Konfirmasi Sebelum Buka Kunci Nilai — `ConfirmDialog` generik (tone amber, focus ke Batal, Esc/backdrop, state loading) dipakai di `/tpa` dan `/rubrik` (2 titik unlock)
- [x] **EDU-TEST-35**: Humanisasi Bahasa & Pembersihan Jargon (User-Friendly Wording) pada Halaman Pleno, Rekap Ledger, dan Sidebar Navigasi

- [x] **EDU-TEST-34**: Redesign Modal Pemilih Santri ke Grid 4 Kolom (`max-w-6xl`, kartu vertikal kaya info, toolbar 4 kolom, empty state reset filter, Esc/backdrop) pada `/tpa`, `/rubrik`, dan `/wawancara`
- [x] **EDU-TEST-33**: Wajib Konfirmasi Sebelum Keluar — Modal Konfirmasi Logout Estetik (backdrop blur, focus trap, Esc, state loading) di `+layout.svelte`
- [x] **EDU-TEST-32**: Redesign Candidate Header Selector Bar Opsi 1 (Interactive Identity, Grouped Stepper, & Progress Meter) pada `/tpa`, `/rubrik`, dan `/wawancara`
- [x] **EDU-TEST-31**: Implementasi Tabel Users, Seeding Super Admin admin@skillage.com ke Neon DB, dan Eliminasi Akses Cepat Demo
- [x] **EDU-TEST-30**: Enforce Wajib Login (Auth Hook & Session Guard) dan Eliminasi Profil Ust. Nurul Huda di Login UI
- [x] **EDU-TEST-29**: Integrasi Komponen Login Auth-Section-3 (Svelte 5 / TSX) & Halaman `/login`
- [x] **EDU-TEST-28**: Deploy Edu-Test ke Cloudflare Pages dengan Neon PostgreSQL & Adapter Cloudflare
- [x] **EDU-TEST-27**: Pembaruan Modul Wawancara (Wawancara Umum murni, Form Tanya-Jawab Bebas Wawancara Ortu) & Integrasi Tes STIFIn
- [x] **EDU-TEST-26**: Implementasi Modal Popup Pemilih Santri Berfilter (Status, Ruang, Jurusan) & Stepper Prev/Next (`/tpa`, `/rubrik`, `/wawancara`)

- [x] **EDU-TEST-25**: Sprint 4: Redesign Master Ledger & Pleno (`/ledger`, `/pleno`, verifikasi empiris build)
- [x] **EDU-TEST-24**: Sprint 3: Redesign Lembar Ujian Asatidz (`/tpa`, `/rubrik`, `/wawancara`, quick selector santri)
- [x] **EDU-TEST-23**: Sprint 2: Redesign Dashboard Seleksi (`/ +page.svelte`, eliminasi teks narasi AI & card glanceable)
- [x] **EDU-TEST-22**: Sprint 2: Redesign Data Calon Santri (`/peserta`, eliminasi banner raksasa & optimasi tabel/modal)
- [x] **EDU-TEST-21**: Sprint 1: Redesign Shell & Layout (`+layout.svelte`, `layout.css`, eliminasi subheader slop & token biru)
- [x] **EDU-TEST-20**: Implementasi Format Dual-Display Skor TPA (Skala 100 + Poin Mentah /69)
- [x] **EDU-TEST-19**: Perbaikan Logika Status Active Menu Navigasi (Mencegah Dual Active Menu)
- [x] **EDU-TEST-18**: Optimasi Layout Canvas Full-Width (Eliminasi Margin Kiri-Kanan Berlebih & Whitespace Kosong)
- [x] **EDU-TEST-17**: Perbaikan Tampilan Icon & Alignment pada State Collapsed Sidebar
- [x] **EDU-TEST-16**: Redesign Total Sidebar Navigasi (Sleek Pro SaaS, Eliminasi Truncate & Bubbly Bloat)
- [x] **EDU-TEST-15**: Instalasi shadcn-svelte & Restrukturisasi Layout Shell dengan Sidebar Navigasi Modern
