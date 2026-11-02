# 2. Problem Statement & Goals

## 2.1 Problem Statement
Proses seleksi penerimaan santri baru sebelumnya menghadapi kendala operasional dan validitas penilaian:
1. **Beban Rekapitulasi Multitier yang Lambat**: Panitia harus mengumpulkan nilai dari minimal 3 meja penguji berbeda (Meja TPA, Meja Kepesantrenan, dan Meja Wawancara Keluarga). Rekap manual butuh 2–4 hari setelah hari ujian.
2. **Formula Rumit & Rentan Kerusakan pada Spreadsheet**: TPA memiliki 39 butir soal dengan 12 subkategori berbobot majemuk (skor mentah max 69 dikonversi ke skala 100), sedangkan rubrik kepesantrenan memiliki logika bersyarat (Tahsin wajib, Tahfidz opsional tergantung kepemilikan hafalan). File Excel manual kerap terhapus formulanya secara tidak sengaja oleh penguji.
3. **Penyusunan Ranking Manual yang Melelahkan**: Pemeringkatan gabungan (paralel) membutuhkan sorting berulang di spreadsheet yang berisiko menukar baris data siswa (*row mismatch*).
4. **Stigma Kegagalan pada Calon Santri**: Pengumuman dengan status "Tidak Lulus" memberikan dampak psikologis negatif bagi calon santri dan orang tua, padahal kuota gelombang berikutnya masih terbuka.

## 2.2 Goals & Objectives

### A. Business Goals
- **Real-Time Result Calculation**: Rekapitulasi nilai dan peringkat langsung tersaji maksimal **5 menit** setelah penguji terakhir menyelesaikan input.
- **100% Zero Calculation Error**: Seluruh kalkulasi skor mentah, pembobotan, rata-rata, dan pemeringkatan paralel dieksekusi secara otomatis oleh backend engine yang teruji.
- **Seamless Ergonomic Scoring for Testers**: Memudahkan penguji menginput skor melalui perangkat seluler/tablet dengan antarmuka sentuh sederhana (skala 1–4) tanpa perlu membuka spreadsheet rumit.

### B. User Experience Goals
- **Dossier Portofolio Terpadu**: Memberikan pimpinan ringkasan satu layar yang memuat skor angka, grafik kompetensi, dan catatan narasi wawancara kualitatif saat sidang pleno.
- **Empathetic Decision Policy**: Menggantikan label penolakan menjadi status yang bermartabat: **LULUS** atau **WAITING LIST GELOMBANG BERIKUTNYA**.

## 2.3 Success Metrics (KPI)
- **Tingkat Adopsi Penguji**: 100% penguji menginput langsung ke sistem tanpa menggunakan kertas cakar lembar nilai terpisah.
- **Waktu Pleno**: Pengambilan keputusan kelulusan terpangkas dari 3 hari menjadi 1 sesi pertemuan 2 jam pasca-tes.
- **Integritas Nilai**: 0 insiden formula tertimpa atau data siswa tertukar.
