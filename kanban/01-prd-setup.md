# Kanban Board: Edu-Test

## 📋 Task List

### [TASK-001] Setup & Normalisasi Folder PRD Edu-Test
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Membersihkan file-file peninggalan modul ERP Edu-sistem dan menyiapkan template PRD murni di 15 folder standar PRD.
- **Sub-tasks**:
  - [x] Konfirmasi kebutuhan dengan user
  - [x] Buat Obsidian AGY-Memory (`CONTEXT.md` & `Sesi-00_Init.md`)
  - [x] Bersihkan file warisan Edu-sistem di folder `PRD/`
  - [x] Buat template murni di 15 folder PRD (`01-overview-vision` s/d `15-uat-maintenance` + `README.md`)
  - [x] Verifikasi integritas folder dan isi template PRD

### [TASK-002] Penulisan PRD Komprehensif Edu-Test
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menulis dan mendokumentasikan spesifikasi PRD lengkap untuk seluruh 15 modul berdasarkan hasil persetujuan plan.
- **Sub-tasks**:
  - [x] Pembuatan subdirektori 06, 07, 08, 09
  - [x] Penulisan Modul 01 - 05
  - [x] Penulisan Modul 06 (7 Menu & Fitur)
  - [x] Penulisan Modul 07 (User Flow & Diagram)
  - [x] Penulisan Modul 08 (Functional Requirements & Formula Matematis)
  - [x] Penulisan Modul 09 (Business Process & Waiting List SOP)
  - [x] Penulisan Modul 10 - 15 (Tech Stack, Security, KPI, UAT)
  - [x] Update Master Index PRD/README.md & Verifikasi Kualitas

### [TASK-003] Penyesuaian Tech Stack PRD: SvelteKit Fullstack & PostgreSQL
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Mengadaptasi modul 10-technical-stack ke SvelteKit fullstack dan PostgreSQL, lengkap dengan arsitektur server actions, reaktivitas Svelte 5 runes, dan skema database PostgreSQL.
- **Sub-tasks**:
  - [x] Perbarui dokumen PRD/10-technical-stack/README.md
  - [x] Verifikasi konsistensi arsitektur dan relasi skema database
  - [x] Update status task ke Done

### [TASK-004] Penyelarasan Form Wawancara dengan TES WAWANCARA.docx
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Mengintegrasikan rincian butir pertanyaan spesifik dari dokumen TES WAWANCARA.docx (Wawancara Umum: prestasi, screening perilaku, anti-bullying, kemandirian; Wawancara Kepesantrenan: tes hafalan juz, kitab, komitmen spiritual) ke dalam PRD Modul 06 dan Modul 08.
- **Sub-tasks**:
  - [x] Update PRD/06-menu-features/05-wawancara-kualitatif/01-deskripsi-menu.md & 02-list-fitur.md
  - [x] Update PRD/08-functional-requirements/04-fr-dossier-wawancara.md
  - [x] Sinkronisasi skema database PostgreSQL di Modul 10 jika ada penambahan kolom
  - [x] Update status ke Done

### [TASK-005] Provisioning Database Neon PostgreSQL (Singapore)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Membuat project database baru di Neon MCP dengan nama Edu-Test di region AWS Singapore (aws-ap-southeast-1), mengambil connection string, dan menguji konektivitas SQL.
- **Sub-tasks**:
  - [x] Eksekusi create_project Neon MCP (Edu-Test, PG 18, aws-ap-southeast-1)
  - [x] Ambil dan simpan connection string ke .env.example
  - [x] Uji eksekusi query (SELECT version()) via run_sql
  - [x] Sinkronisasi Obsidian AGY-Memory CONTEXT.md

### [TASK-006] Implementasi Paralel Edu-Test (3 Sub-Agents)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menjalankan 3 sub-agent paralel secara simultan untuk membangun arsitektur penuh Edu-Test.
- **Sub-tasks**:
  - [x] Inisialisasi SvelteKit + Tailwind + Drizzle + Neon Database Migrasi (Fase 1)
  - [x] Launch Sub-Agent 1: Backend & Database Engineer (Selesai: Zod validation, queries, server endpoints)
  - [x] Launch Sub-Agent 2: Frontend UI Specialist (Selesai: Layout tablet, Form TPA grid, Rubrik 7-domain, Form wawancara 26 butir)
  - [x] Launch Sub-Agent 3: Analytics & Ranking Specialist (Selesai: Dashboard, Peserta, Ledger, Pleno, Excel Export)
  - [x] Verifikasi laporan selesai dari ketiga sub-agent
  - [x] Final check pnpm check & build verification (0 errors, 100% build pass)

### [TASK-007] Penyelarasan Rute Penilaian & Navigasi (Fix 404 Meja Penilaian)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Memperbaiki 404 error saat mengklik Meja TPA, Kepesantrenan, dan Wawancara dengan menyelaraskan link navigasi di layout dan menambahkan route alias/redirector di /penilaian/*.
- **Sub-tasks**:
  - [x] Update navItems di `src/routes/+layout.svelte` (/tpa, /rubrik, /wawancara)
  - [x] Tambahkan route redirector di `/penilaian/tpa`, `/penilaian/pesantren`, `/penilaian/rubrik`, `/penilaian/wawancara`
  - [x] Verifikasi `pnpm check` dan `pnpm build` (0 error, build lulus)
  - [x] Verifikasi empiris via curl HTTP status (200 OK & 302 Redirect)

### [TASK-008] Fix SSR Head Favicon Import (500 Error di /wawancara)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Memperbaiki error SSR saat evaluasi <svelte:head> yang memicu 500 error di /wawancara dengan memindahkan favicon langsung ke `static/favicon.svg`.
- **Sub-tasks**:
  - [x] Salin `favicon.svg` ke folder `static/`
  - [x] Bersihkan runtime asset import di `src/routes/+layout.svelte`
  - [x] Pengujian empiris via curl ke seluruh 7 route (seluruhnya 200 OK)
  - [x] Verifikasi `pnpm check` (0 error, 0 warning)

### [TASK-009] Fix Effect Loop di Wawancara (effect_update_depth_exceeded)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Memperbaiki loop reaktivitas di form wawancara (+page.svelte:100) dengan memisahkan DEFAULT_FORM_DATA dan membungkus mutasi state form ke dalam untrack().
- **Sub-tasks**:
  - [x] Definisikan konstanta DEFAULT_FORM_DATA murni non-reaktif
  - [x] Bungkus sinkronisasi interview data di $effect dengan untrack()
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings)
  - [x] Verifikasi `pnpm build` (100% lulus build)
  - [x] Pengujian beban request via curl ke /wawancara (200 OK konsisten)

### [TASK-010] Adopsi & Integrasi Sistem Desain DESIGN.md (EdTech Clean Minimalist)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Mengintegrasikan DESIGN.md dari MCP designmd (kit Osutsuki93/ssss) ke dalam repositori serta menyelaraskan token CSS tema Tailwind v4.
- **Sub-tasks**:
  - [x] Download & simpan DESIGN.md via designmd MCP
  - [x] Sinkronisasi token tema di `src/routes/layout.css` (@theme Be Vietnam Pro + Inter & palet #004ac6 / #2563eb)
  - [x] Setup webfont Google Fonts di `src/app.html`
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% build lulus)
  - [x] Pengujian empiris 7 rute utama (seluruhnya 200 OK)

### [TASK-011] Eliminasi Dialog Bawaan Browser & Implementasi Modal Custom Estetik
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menghapus seluruh confirm/alert bawaan browser dan menggantinya dengan modal konfirmasi custom bertema EdTech Clean Minimalist (Tailwind backdrop-blur, rounded-2xl, icon badge, dan rekap aksi).
- **Sub-tasks**:
  - [x] Hapus browser `confirm()` di `src/routes/pleno/+page.svelte`
  - [x] Implementasikan Modal Pengesahan Sidang Pleno custom estetik (rekap kuota, nama pimpinan, alert permanen)
  - [x] Implementasikan Modal Override Diskresi Pleno custom estetik (alasan diskresi, skor komposit, target status)
  - [x] Implementasikan Modal Kunci Dossier Wawancara custom estetik di `src/routes/wawancara/+page.svelte`
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus build)
  - [x] Verifikasi 0 `confirm/alert/prompt` tersisa di seluruh codebase

### [TASK-012] Penataan Arsitektur Flow Seleksi & CRUD Master Peserta Komprehensif
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menata ulang relasi antar menu dengan hierarki alur seleksi (Admisi -> 3 Meja Penilaian -> Ledger -> Pleno), menambahkan navigasi berantai antar meja, dan membangun fitur CRUD lengkap (Create, Edit, Delete) pada Data Peserta.
- **Sub-tasks**:
  - [x] Tambahkan helper CRUD candidate (create, update, delete) di `src/lib/server/db/queries.ts`
  - [x] Implementasikan server actions (create, update, delete) di `src/routes/peserta/+page.server.ts`
  - [x] Bangun Modal Tambah Santri, Modal Edit Santri, dan Modal Hapus Santri di `src/routes/peserta/+page.svelte`
  - [x] Tautkan badge meja (T, K, W) dan aksi tabel peserta langsung ke meja ujian masing-masing kandidat
  - [x] Reorganisasi navigasi topbar layout dengan pengelompokan hierarki alur (Admisi, Meja Seleksi, Yudisium Pleno)
  - [x] Tambahkan breadcrumb dan tombol alur berantai di meja TPA, Rubrik, Wawancara, dan Ledger
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus build)
  - [x] Update status ke Done

### [TASK-013] Penyederhanaan UI/UX Sesuai Kebutuhan Bahan (Eliminasi Kata Meja & 3-Peran Alur)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menghapus total kata "meja" dari seluruh antarmuka dan menggantinya dengan istilah natural akademik/pesantren (Tes TPA, Tes Kepesantrenan, Wawancara), menyederhanakan alur navigasi menjadi 3 peran utama (Data Santri, Penilaian Seleksi, Rekap & Kelulusan), serta menyatukan fitur rekap nilai dengan kontrol kuota pleno.
- **Sub-tasks**:
  - [x] Eliminasi total kata "meja" di `+layout.svelte`, `peserta/+page.svelte`, `+page.svelte`, `tpa/+page.svelte`, `rubrik/+page.svelte`, `wawancara/+page.svelte`, dan `ledger/+page.svelte`
  - [x] Sederhanakan topbar layout menjadi 3 tab peran: Data Santri, Penilaian Seleksi, Rekap & Kelulusan
  - [x] Perjelas istilah status: Belum Diuji, Sedang Ujian, Sudah Lengkap
  - [x] Pertegas rumus nilai akhir: Rata-rata 50% TPA + 50% Kepesantrenan (Wawancara sebagai profil kualitatif)
  - [x] Integrasikan kontrol kuota pleno langsung di tabel Rekap Nilai & Kelulusan
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus build)
  - [x] Update status ke Done

### [TASK-014] Implementasi CRUD Master Data Jurusan & Alokasi Ruang Ujian
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Mengubah opsi pilihan jurusan dan alokasi ruang ujian dari hardcoded static menjadi entitas database dinamis di PostgreSQL lengkap dengan CRUD (Create, Read, Update, Delete) dan modal kustom estetik.
- **Sub-tasks**:
  - [x] Tambahkan tabel `majors` dan `exam_rooms` di `src/lib/server/db/schema.ts` dan eksekusi migrasi Drizzle
  - [x] Buat query helper dan auto-seed default master data di `src/lib/server/db/queries.ts`
  - [x] Implementasikan server actions di `src/routes/peserta/+page.server.ts` (`createMajor`, `updateMajor`, `deleteMajor`, `createExamRoom`, `updateExamRoom`, `deleteExamRoom`)
  - [x] Buat Modal Kustom Estetik "Kelola Jurusan & Ruang" dengan tab switcher dan dialog hapus di `src/routes/peserta/+page.svelte`
  - [x] Sinkronisasi opsi dropdown dinamis di form Tambah Santri, Edit Santri, dan Toolbar Filter (Peserta & Ledger)
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus build)
  - [x] Update status ke Done

### [TASK-015] Instalasi shadcn-svelte & Restrukturisasi Layout Shell dengan Sidebar Navigasi Modern
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Mengintegrasikan shadcn-svelte (bits-ui, clsx, tailwind-merge) dan merestrukturisasi layout global aplikasi (`src/routes/+layout.svelte`) menjadi Modern App Shell berbasis Sidebar Navigasi yang estetik, responsif, collapsible, berpalet biru (non-ungu), dan terbagi rapi ke dalam 3 alur seleksi utama (Admisi, Penilaian Seleksi, Hasil & Pleno).
- **Sub-tasks**:
  - [x] Setup shadcn-svelte dependencies (`clsx`, `tailwind-merge`, `bits-ui`) dan konfigurasi `components.json`
  - [x] Pasang utilitas helper `cn` di `src/lib/utils.ts`
  - [x] Desain dan bangun komponen Sidebar Navigasi terstruktur di `src/routes/+layout.svelte`
  - [x] Sediakan Toggle Sidebar (Expand/Collapse) responsif untuk desktop dan mobile
  - [x] Navigasi sidebar terbagi jelas: Admisi (Dashboard, Santri), Penilaian (1. TPA, 2. Kepesantrenan, 3. Wawancara), Hasil (Rekap Nilai, Sidang Pleno)
  - [x] Quick Action / Status Footer di Sidebar (Akses Cepat Kelola Jurusan & Ruang, Status Sesi Gelombang)
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus build)
  - [x] Verifikasi seluruh route (`/`, `/peserta`, `/tpa`, `/rubrik`, `/wawancara`, `/ledger`, `/pleno`)

### [TASK-016] Redesign Total Sidebar Navigasi (Sleek Pro SaaS, Eliminasi Truncate & Bubbly Bloat)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Melakukan redesign total terhadap sidebar navigasi agar tidak terpotong (truncate teks), menghilangkan bentuk bubble/pill yang tebal, menghapus badge berlebih yang menyempitkan label, mengatur lebar ideal sidebar (280px / 17.5rem), menerapkan tipografi modern clean ala dashboard profesional (Linear/Supabase/Stripe), serta memperbaiki hierarki visual header dan footer.
- **Sub-tasks**:
  - [x] Audit ukuran sidebar width dan padding di CSS & constants (`--sidebar-width: 17.5rem / 280px`)
  - [x] Fix bug `data-active` di `sidebar-menu-button.svelte` agar elemen non-aktif tidak terkena styling background
  - [x] Hapus badge berlebih yang menyebabkan teks menu terpotong dengan elipsis (`...`)
  - [x] Desain ulang item navigasi: background transparan default, indikator aktif solid blue `bg-blue-600` yang tegas dan elegan, icon stroke halus
  - [x] Perbaiki visual header (logo kompak modern 36x36px, title & subtitle serasi)
  - [x] Rampingkan footer menjadi 1 consolidated widget elegan (status gelombang aktif LIVE + user card)
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus)
  - [x] Uji responsivitas & visual rendering di seluruh rute aplikasi (HTTP 200 OK)

### [TASK-017] Perbaikan Tampilan Icon & Alignment pada State Collapsed Sidebar
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Memperbaiki tampilan sidebar saat di-collapse agar seluruh icon navigasi, logo header, dan avatar footer tampil presisi di tengah (perfectly centered), tidak terpotong (clipped/overflow), serta label teks dan padding berlebih disembunyikan saat mode collapsed icon aktif.
- **Sub-tasks**:
  - [x] Sesuaikan lebar ikon collapsed di `constants.ts` (`SIDEBAR_WIDTH_ICON = "3.75rem"` / 60px)
  - [x] Tambahkan modifier `group-data-[collapsible=icon]` pada `SidebarContent`, `SidebarMenuItem`, `SidebarMenuButton`, dan anchor tag
  - [x] Pastikan label teks disembunyikan secara eksplisit saat collapsed (`group-data-[collapsible=icon]:hidden`)
  - [x] Pastikan icon button berukuran `size-10` (40x40px) dan terpusat (`mx-auto justify-center`)
  - [x] Pusatkan logo di Header dan Avatar di Footer saat collapsed
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus)
  - [x] Verifikasi rendering collapsed icon di browser

### [TASK-018] Optimasi Layout Canvas Full-Width (Eliminasi Margin Kiri-Kanan Berlebih & Whitespace Kosong)
- **Status**: Done
- **Prioritas**: High
- **Deskripsi**: Menghapus pembatasan `max-w-7xl mx-auto` yang menyebabkan margin kiri-kanan terlalu lebar dan banyak ruang kosong pada layar monitor lebar/desktop. Mengubah container layout dan halaman utama menjadi fluid responsive layout (`w-full px-4 sm:px-6 md:px-8 py-6`) ala modern SaaS dashboard sehingga dashboard cards, tabel peserta, rubric grid, dan ledger memanfaatkan layar secara optimal.
- **Sub-tasks**:
  - [x] Ubah container `<main>` di `src/routes/+layout.svelte` dari `max-w-7xl mx-auto` menjadi `w-full px-4 sm:px-6 md:px-8 py-6`
  - [x] Sesuaikan container header, subheader, dan footer di `src/routes/+layout.svelte` agar konsisten full-width
  - [x] Hapus `max-w-7xl mx-auto` di `src/routes/rubrik/+page.svelte`, `src/routes/tpa/+page.svelte`, dan `src/routes/wawancara/+page.svelte`
  - [x] Verifikasi `pnpm check` (0 errors, 0 warnings) dan `pnpm build` (100% lulus)
  - [x] Verifikasi rendering di browser pada berbagai ukuran layar











