# 13. KPI & Success Metrics

Keberhasilan implementasi **Edu-Test** diukur melalui indikator-indikator empiris berikut:

| Kategori Metrik | Indikator Kinerja Utama (KPI) | Target Kinerja | Metode Pengukuran |
|---|---|:---:|---|
| **Kecepatan Operasional** | Waktu kalkulasi rekap nilai dan ranking pasca-ujian | $\le 5\text{ Menit}$ | Log sistem dari submit penguji terakhir hingga ledger lengkap |
| **Akurasi Data** | Kesalahan kalkulasi skor & pemeringkatan | $0\%\text{ Error}$ | Verifikasi silang dengan lembar kontrol matematika |
| **Efisiensi Penguji** | Waktu rata-rata input nilai per santri di tablet | $< 2\text{ Menit}$ | Pengamatan durasi sesi input rubrik |
| **Keandalan Sistem** | Insiden data nilai hilang akibat jaringan terputus | $0\text{ Kasus}$ | Uji failover & efektivitas mekanisme autosave draft |
| **Kepuasan Pimpinan** | Waktu pelaksanaan sidang pleno kelulusan | $\le 2\text{ Jam}$ | Durasi sidang pleno penentuan kuota |
| **Integritas Penilaian** | Laporan ketidaksesuaian nilai santri | $0\text{ Dispute}$ | Rekam jejak audit trail penguji |
