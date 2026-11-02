# FR-06: Reporting & Export Engine

## 1. Spesifikasi Export Spreadsheet (.xlsx)
- **FR-REP-001**: Sistem harus menyediakan export Master Ledger ke dalam format Excel (.xlsx) yang kompatibel dengan Microsoft Excel dan Google Sheets.
- **FR-REP-002**: Format export Excel mencakup lembar:
  1. *Sheet Rekap Utama*: No, No Tes, Nama, Asal Sekolah, Jurusan, Skor TPA, Skor Kepesantrenan, Skor Komposit, Peringkat Paralel, Status (LULUS / WAITING LIST).
  2. *Sheet Rincian TPA*: Rincian perolehan poin per 12 subtes.
  3. *Sheet Rincian Kepesantrenan*: Rincian nilai perolehan per 7 bidang ibadah/bahasa.

## 2. Spesifikasi Dokumen Surat Keputusan (PDF)
- **FR-REP-003**: Sistem harus dapat men-generate dokumen resmi hasil seleksi format PDF:
  - *Surat Keputusan Santri Lulus*: Memuat nomor tes, nama, ucapan selamat, informasi daftar ulang, dan tanggal tenggat.
  - *Surat Pemberitahuan Waiting List*: Memuat nomor tes, nama, informasi nomor urut antrean waiting list, serta ketentuan pemanggilan untuk seleksi gelombang berikutnya.
- **FR-REP-004**: Dokumen PDF harus memuat kop resmi sekolah, QR-code verifikasi keaslian dokumen, dan tanda tangan digital pimpinan sekolah.

