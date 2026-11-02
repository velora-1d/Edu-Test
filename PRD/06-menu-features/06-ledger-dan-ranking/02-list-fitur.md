# 02 - List Fitur: Ledger & Ranking

## Daftar Fitur
1. **Tabel Master Ledger Interaktif**:
   - Kolom: Nomor Urut, No Tes, Nama Santri, Jurusan Pilihan.
   - Kolom Nilai TPA: Skor TPA (0–100), Kategori TPA, Peringkat TPA.
   - Kolom Nilai Kepesantrenan: Rata-rata 7 Bidang (0–100), Predikat Kepesantrenan, Peringkat Kepesantrenan.
   - Kolom Nilai Akhir Komposit: Skor Gabungan Paralel, **Peringkat Paralel**.
   - Kolom Status Saat Ini: `Belum Lengkap` / `Siap Pleno`.
2. **Mesin Pemeringkatan Otomatis (Auto-Ranking Engine)**:
   - Kalkulasi ranking dinamis setiap kali ada nilai baru yang masuk.
   - Pengurutan leksikografis ketika nilai komposit identik (*tie-breaker*: Nilai Kepesantrenan $\to$ Nilai TPA $\to$ Waktu Pendaftaran).
3. **Toggle Detail Per Bidang (Accordion View)**:
   - Tombol *expand* untuk melihat rincian nilai 7 sub-bidang kepesantrenan dan 12 subtes TPA secara *in-line*.
4. **Export Master Ledger**:
   - Export ke Excel (.xlsx) dengan format baku panitia PPDB.

