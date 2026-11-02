# 15. User Acceptance Testing (UAT) & Maintenance Plan

## 15.1 Skenario Pengujian Penerimaan (UAT Test Cases)

| ID Uji | Modul | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|:---:|
| **UAT-TPA-01** | TPA | Menginput nilai 12 subtes dengan jawaban benar acak | Skor mentah max 69 dihitung presisi, konversi ke skala 100 akurat tanpa persentase | Ready |
| **UAT-TPA-02** | TPA | Menguji batas skor 20, 40, 60, 80 | Kategori kualitatif (Sangat Buruk s/d Sangat Baik) terpilih tepat pada nilai batas | Ready |
| **UAT-KPS-01** | Kepesantrenan | Menginput skor skala 1–4 pada 7 bidang uji | CHOOSE mapping menghasilkan nilai 100 per bidang sesuai bobot persentase | Ready |
| **UAT-KPS-02** | Kepesantrenan | Menguji santri dengan `Punya Hafalan = "Tidak"` | Skor akhir Tahsin & Tahfidz murni diambil dari nilai Tahsin tanpa error formula | Ready |
| **UAT-KPS-03** | Kepesantrenan | Menguji santri dengan `Punya Hafalan = "Ya"` | Skor akhir adalah rata-rata Tahsin dan Tahfidz | Ready |
| **UAT-WCR-01** | Wawancara | Mengisi esai paragraf panjang pada 3 form | Tersimpan penuh tanpa terpotong, autosave berjalan setiap 5 detik jeda ketik | Ready |
| **UAT-RNK-01** | Ranking | Menginput 20 santri dengan variasi skor | Peringkat paralel terurut otomatis dari nilai tertinggi ke terendah | Ready |
| **UAT-RNK-02** | Ranking | Simulasi 2 santri dengan nilai komposit persis sama | Tie-breaker memprioritaskan santri dengan nilai kepesantrenan lebih tinggi | Ready |
| **UAT-PLN-01** | Pleno | Menyetel kuota kelulusan = 15 pada 20 peserta | Peringkat 1–15 berstatus LULUS, peringkat 16–20 berstatus WAITING LIST | Ready |
| **UAT-EXP-01** | Export | Mengunduh berkas Master Ledger Excel (.xlsx) | File terunduh sempurna, formula utuh, dan data identik dengan tampilan web | Ready |

## 15.2 Rencana Pemeliharaan & Dukungan Pasca-Rilis
1. **Dukungan Hari-H Seleksi**: Tim teknis standby di ruang server sekolah selama berlangsungnya ujian seleksi.
2. **Prosedur Darurat (Failover Plan)**:
   - Jika jaringan WiFi ruangan terputus, penguji tetap dapat mengisi data secara offline di browser (PWA/LocalStorage).
   - Data tersinkronisasi otomatis saat koneksi tersambung kembali.
3. **Backup Snapshot**: Snapshot database diambil setiap selesai 1 sesi ujian dan sesaat sebelum sidang pleno dimulai.
