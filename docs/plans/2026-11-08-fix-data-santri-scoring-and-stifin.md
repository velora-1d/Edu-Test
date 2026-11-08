# Perbaikan Komprehensif: CRUD Santri, STIFIn Dropdown, Filter Gelombang & Sinkronisasi Skor TPA Implementation Plan

> **For Claude / Antigravity:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Memperbaiki bug gagal edit/hapus data santri (ID peserta tidak valid), menstandarkan dropdown STIFIn dengan format `[Singkatan] - [Kepanjangan]`, memperbaiki badge jurusan yang salah defaulting ke "BD", menyelaraskan filter gelombang antara TPA (14 santri) dan Kepesantrenan (6 santri), serta memastikan reaktivitas form skor TPA akurat tanpa desinkronisasi.

**Architecture:** Memperbaiki form parameter contract di SvelteKit Server Actions (`candidateId` vs `id`), mendinamisasi rendering badge jurusan pada tabel peserta, merapikan opsi STIFIn pada lembar wawancara, dan menyelaraskan query gelombang aktif/selector pada lembar penilaian TPA dan Kepesantrenan agar seluruh 14 calon santri dapat diakses serta dinilai secara empiris.

**Tech Stack:** SvelteKit 2.x, Svelte 5 (Runes: `$state`, `$derived`, `$effect`), Drizzle ORM, Neon PostgreSQL, Tailwind CSS v4, shadcn-svelte bits-ui.

---

### Task 1: Fix Parameter Contract Edit & Hapus Santri di Server Action

**Files:**
- Modify: `src/routes/peserta/+page.server.ts:132-187`
- Modify: `src/routes/peserta/+page.svelte:774-780,965-970`
- Test: Manual curl & server action test via browser/HTTP

**Step 1: Inspect existing contract mismatch**
- Frontend mengirim `<input type="hidden" name="candidateId" value={...} />` dan `<input type="hidden" name="id" value={...} />`.
- Backend saat ini hanya membaca `data.get('id') as string`.

**Step 2: Update Server Action di `src/routes/peserta/+page.server.ts`**
- Ubah `updateCandidate` untuk membaca `const id = ((data.get('candidateId') || data.get('id')) as string) || '';`.
- Ubah `deleteCandidate` untuk membaca `const id = ((data.get('candidateId') || data.get('id')) as string) || '';`.
- Tambahkan dual-input di frontend modal edit & delete (`name="candidateId"` dan `name="id"`) sebagai pertahanan ganda (backward & forward compatibility).

**Step 3: Verifikasi build & check**
- Jalankan: `pnpm check`
- Expected: 0 errors, 0 warnings.

**Step 4: Commit checkpoint**
- Git commit: `fix(peserta): perbaiki contract parameter id dan candidateId pada update dan delete`

---

### Task 2: Standarisasi Format Dropdown STIFIn di Lembar Wawancara

**Files:**
- Modify: `src/routes/wawancara/+page.svelte:760-798`
- Modify: `src/routes/peserta/+page.svelte:400-410` (tampilan badge STIFIn di tabel)
- Modify: `src/routes/pleno/+page.svelte:550-562` (tampilan STIFIn di dossier pleno)

**Step 1: Rampingkan dan seragamkan opsi Tipe Karakter STIFIn**
- Format diseragamkan menjadi `[Singkatan] - [Kepanjangan]` tanpa teks tambahan panjang dalam kurung:
  * `Si - Sensing Introvert`
  * `Se - Sensing Extrovert`
  * `Ti - Thinking Introvert`
  * `Te - Thinking Extrovert`
  * `Ii - Intuiting Introvert`
  * `Ie - Intuiting Extrovert`
  * `Fi - Feeling Introvert`
  * `Fe - Feeling Extrovert`
  * `In - Instinct`
  * `Belum Tes - Belum Tes STIFIn`
- Seragamkan dropdown Mesin Kecerdasan:
  * `S - Sensing`
  * `T - Thinking`
  * `I - Intuiting`
  * `F - Feeling`
  * `In - Instinct`

**Step 2: Verifikasi tampilan di browser**
- Jalankan `pnpm check`
- Pastikan form wawancara dapat menyimpan draf dan final tanpa error tipe data.

**Step 3: Commit checkpoint**
- Git commit: `refactor(wawancara): standarisasi format dropdown STIFIn [Singkatan] - [Kepanjangan]`

---

### Task 3: Perbaikan Tampilan Jurusan di Tabel Peserta (Eliminasi "BD Semua")

**Files:**
- Modify: `src/routes/peserta/+page.svelte:420-431`

**Step 1: Analisis logika fallback hardcoded**
- Baris 428 saat ini: `{c.majorChoice === 'Rekayasa Perangkat Lunak' ? 'RPL' : c.majorChoice === 'Desain Komunikasi Visual' ? 'DKV' : 'Bisnis Digital'}`.
- Calon santri dengan jurusan seperti `Programmer, Designer dan Game Developer`, `Sipil, Arsitektur dan Perumahan`, `Bisnis Pertanian Terpadu`, atau `Bisnis Digital Plus` semuanya dipaksa tampil sebagai 'Bisnis Digital'.

**Step 2: Implementasi Helper Pemetaan Kode & Warna Jurusan Dinamis**
- Buat fungsi helper `getMajorBadge(majorChoice: string)`:
  * Jika memuat `RPL` atau `Rekayasa Perangkat Lunak` atau `Programmer`: Tampilkan badge biru `RPL` (atau singkatan kodenya).
  * Jika memuat `DKV` atau `Komunikasi Visual` atau `Designer`: Tampilkan badge amber `DKV`.
  * Jika memuat `BD` atau `Bisnis Digital`: Tampilkan badge emerald `BD`.
  * Jika memuat `TKP` atau `Sipil` atau `Arsitektur`: Tampilkan badge cyan `TKP`.
  * Jika memuat `UPT` atau `Pertanian`: Tampilkan badge lime `UPT`.
  * Fallback umum: Tampilkan singkatan kata depan atau nama lengkap jurusan yang dipilih santri, bukan dipaksa 'Bisnis Digital'.

**Step 3: Verifikasi tabel peserta**
- Periksa seluruh 14 santri di tabel `/peserta` untuk memastikan jurusannya tampil akurat sesuai yang terdaftar di database.

**Step 4: Commit checkpoint**
- Git commit: `fix(peserta): perbaiki mapping badge jurusan dinamis dan hilangkan hardcoded fallback BD`

---

### Task 4: Penyelarasan Filter Gelombang (Wave Sync) antara /tpa dan /rubrik

**Files:**
- Modify: `src/routes/rubrik/+page.server.ts:10-40`
- Modify: `src/routes/rubrik/+page.svelte:180-260`
- Modify: `src/routes/tpa/+page.server.ts:10-45`
- Modify: `src/routes/tpa/+page.svelte:40-70`

**Step 1: Identifikasi ketidaksesuaian query**
- `/rubrik` memanggil `getCandidatesWithScores()` yang memfilter ketat hanya `where: eq(candidates.waveId, targetWaveId)` (hanya menghasilkan 6 santri Gelombang 1).
- `/tpa` memanggil `db.query.candidates.findMany()` tanpa filter waveId (menghasilkan seluruh 14 santri).

**Step 2: Implementasi Dukungan Wave Filter Konsisten**
- Di `src/routes/rubrik/+page.server.ts`:
  * Baca query param `waveId` dari URL (`url.searchParams.get('waveId')`).
  * Jika `waveId === 'ALL'`, muat seluruh 14 santri di semua gelombang.
  * Sediakan daftar `allWaves` di PageData agar penguji/panitia dapat memilih gelombang atau melihat seluruh peserta.
- Di `src/routes/tpa/+page.server.ts`:
  * Dukung query param `waveId` dan kembalikan `allWaves` secara simetris.

**Step 3: Uji sinkronisasi**
- Buka modal "Pilih Santri Ujian Kepesantrenan" di `/rubrik`, pastikan seluruh santri dapat dipilih atau difilter per gelombang secara transparan.

**Step 4: Commit checkpoint**
- Git commit: `feat(scoring): selaraskan query gelombang di rubrik kepesantrenan dan lembar TPA`

---

### Task 5: Perbaikan Sinkronisasi Reaktivitas Form Skor TPA & Reset State

**Files:**
- Modify: `src/routes/tpa/+page.svelte:50-130, 920-960`
- Modify: `src/routes/tpa/+page.server.ts:150-250`

**Step 1: Analisis desinkronisasi state client**
- Pergantian calon santri dengan `customSelectedId` dan `window.history.replaceState` tidak memperbarui `data.candidates` saat nilai dikunci atau dibuka.
- Pastikan setelah submit `lockScore`, `saveDraft`, atau `unlockScore`, form meng-invalidate data server dengan benar (`await update({ reset: false })` atau full navigation).

**Step 2: Implementasi State Sync yang Robust**
- Tambahkan validasi reaktif agar saat kandidat berganti, nilai `$state` subtes (eyd, kohesi, dst) langsung terinisialisasi bersih sesuai data skor kandidat terpilih.
- Pastikan tampilan skor dan kategori kualitatif langsung terhitung secara live tanpa menampilkan nilai "Sangat Buruk" / 0 jika skor sebenarnya sudah terisi.

**Step 3: Verifikasi pengujian TPA**
- Uji alur penilaian pada calon santri baru (misal: Muhammad Rafa Hayfa), isi nilai subtes, verifikasi skor terhitung otomatis di sisi kanan, klik Simpan Draf / Kunci Nilai, dan verifikasi data tersimpan di database Neon PostgreSQL.

**Step 4: Commit checkpoint**
- Git commit: `fix(tpa): perbaiki reaktivitas seleksi kandidat dan kalkulasi skor live TPA`

---

### Task 6: Verifikasi Menyeluruh (End-to-End Test & Build Production)

**Files:**
- All touched files

**Step 1: Typecheck & Build**
- Jalankan `pnpm check` (harus 0 errors, 0 warnings).
- Jalankan `pnpm build` (harus 100% lulus build produksi).

**Step 2: Uji HTTP Endpoint**
- Curl `/peserta`, `/tpa`, `/rubrik`, `/wawancara`, `/ledger`, `/pleno`.
- Pastikan seluruh endpoint merespons HTTP 200 OK.

**Step 3: Update Kanban, Beads, dan Obsidian Memory**
- Catat task baru di `.beads/issues.jsonl` dan `kanban/01-prd-setup.md`.
- Buat catatan sesi di Obsidian Vault: `00-AGY-Memory/Edu-Test/Sessions/Sesi-16_Fix_CRUD_Santri_STIFIn_WaveSync.md`.

