# 4. Scope & Deliverables (MVP Scope)

## 4.1 In-Scope (Fitur Termasuk)

1. **Modul Manajemen Peserta & Gelombang**:
   - Pendaftaran peserta per gelombang seleksi dan per jalur pendaftaran.
   - Penomoran nomor tes terstruktur dan kartu ujian/lembar penilaian per peserta.
2. **Modul Scoring TPA**:
   - Input nilai 12 subkategori TPA (total 39 soal, 69 poin mentah).
   - Konversi otomatis ke nilai skala 0–100 (non-persentase).
   - Penentuan otomatis 5 kategori kualitatif (Sangat Buruk s/d Sangat Baik).
3. **Modul Rubrik Kepesantrenan**:
   - Input rubrik 7 bidang dengan skala 1–4 (Kurang, Cukup, Baik, Sangat Baik):
     - Tahsin & Tahfidz (alur bersyarat hafalan)
     - Kitab Kuning (bobot 25% per kriteria)
     - Bahasa Inggris (Speaking 40%, Pronunciation/Writing/Vocab @ 20%)
     - Bahasa Arab (Speaking 40%, Pronunciation/Writing/Vocab @ 20%)
     - Hadits (Hafalan 40%, Kelancaran/Makna/Adab @ 20%)
     - Adzan (Kelancaran 50%, Makhraj 30%, Suara 20%)
     - Bacaan Sholat (Kelancaran 50%, Makhraj 30%, Adab 20%)
   - Rekap nilai rata-rata kepesantrenan (skala 100).
4. **Modul Wawancara Kualitatif**:
   - Formulir isian narasi teks bebas untuk Wawancara Umum Santri.
   - Formulir isian narasi teks bebas untuk Wawancara Kepesantrenan.
   - Formulir isian narasi teks bebas untuk Wawancara Orang Tua.
5. **Ranking Engine Paralel**:
   - Peringkat otomatis TPA dan Peringkat otomatis Kepesantrenan.
   - Peringkat paralel komposit gabungan TPA dan Kepesantrenan.
   - Logika penanganan skor seri (*tie-breaker*).
6. **Layar Sidang Pleno & Keputusan Kelulusan**:
   - Filter kuota daya tampung (simulasi cut-off line).
   - Pelabelan otomatis status **LULUS** atau **WAITING LIST GELOMBANG BERIKUTNYA**.
   - Export master rekap ke Excel (.xlsx) dan dokumen surat kelulusan (PDF).

---

## 4.2 Out-of-Scope (Eksplisit Dikecualikan)
Untuk mencegah *scope creep*, fitur-fitur berikut secara tegas **TIDAK termasuk** dalam cakupan sistem Edu-Test:
- Sistem pembayaran keuangan sekolah/SPP/uang pangkal (ditangani oleh sistem ERP terpisah).
- Manajemen absensi harian guru/karyawan dan penggajian (*payroll*).
- Sistem manajemen kurikulum sekolah harian dan rapor berkala siswa aktif.
- CBT online penuh dengan timer ketat untuk siswa (Edu-Test fokus sebagai instrumen lembar skoring dan rubrik penguji).

---

## 4.3 Deliverables (Hasil Serah Terima)
1. **Source Code Aplikasi**: Repositori kode bersih, modular, dan terdokumentasi.
2. **Dokumen PRD & Skema Database**: Panduan arsitektur lengkap beserta relasi tabel dan formula matematis.
3. **Panduan Pengguna (User Manual)**:
   - Panduan Penguji Tablet (tata cara tap rubrik dan kunci nilai).
   - Panduan Administrator & Sidang Pleno Pimpinan.
4. **Environment Deployment**: Konfigurasi deployment siap pakai di server target.
