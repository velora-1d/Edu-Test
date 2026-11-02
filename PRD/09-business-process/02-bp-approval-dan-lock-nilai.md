# BP-02: Prosedur Penguncian Nilai & Permohonan Koreksi

## 1. Alur Penguncian Nilai (Score Locking)
1. **Penyimpanan Draft**: Saat sesi ujian berlangsung, penguji dapat mengedit skor secara bebas. Data tersimpan dengan status `DRAFT`.
2. **Penguncian Mandiri (Submit Final)**: Setelah santri selesai diuji, penguji menekan tombol *Kunci & Submit*. Status berubah menjadi `LOCKED`.
3. **Imutabilitas Nilai**: Setelah berstatus `LOCKED`, kolom nilai pada antarmuka penguji menjadi *disabled / read-only*.

## 2. Prosedur Pembukaan Kunci (Unlock Request Protocol)
Apabila terjadi kekeliruan fatal (misal salah memilih nama peserta saat menilai):
1. Penguji mendatangi meja Ketua Panitia PPDB (Super Admin).
2. Penguji menyampaikan alasan koreksi secara lisan dan tertulis.
3. Super Admin membuka kunci nilai peserta bersangkutan melalui menu override admin dengan memasukkan alasan pembukaan kunci.
4. Sistem mencatat di audit trail: Nama Penguji, Nama Admin yang meng-unlock, Alasan Koreksi, dan Timestamp.
5. Penguji melakukan perbaikan skor dan mengunci kembali nilainya.

