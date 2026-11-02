# BP-04: Integritas Audit Trail & Pencatatan Log Sistem

## 1. Standar Audit Trail
Untuk memastikan akuntabilitas dan objektivitas penuh dalam penerimaan santri baru, setiap aksi manipulasi data di dalam sistem Edu-Test dicatat secara permanen (*immutable logging*):

```
Timestamp | User ID | Role | Event Type | Target (No Tes) | Detail Perubahan (Old -> New)
```

## 2. Aksi Wajib Dicatat dalam Log
1. **Pencatatan Skor TPA & Rubrik**: Siapa penguji yang menginput, nilai mentah yang dimasukkan, waktu penyimpanan draft, dan waktu submit final.
2. **Pembukaan Kunci (Unlock)**: Rekam otorisasi admin dan alasan pembukaan kunci.
3. **Penetapan Kuota Pleno**: Kuota awal, kuota revisi, dan nama pimpinan yang mengesahkan.
4. **Manual Override Status**: Alasan pengubahan status santri dari waiting list ke lulus (atau sebaliknya).
5. **Ekspor Data**: Siapa yang mengunduh master ledger nilai dan mencetak surat kelulusan.

