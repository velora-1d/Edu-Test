# 6. Menu & Features Architecture

Modul 06 mendefinisikan struktur antarmuka dan spesifikasi fitur sistem **Edu-Test** yang dirancang modular sesuai dengan peran operasional seleksi:

| No | Modul Menu | File Spesifikasi | Deskripsi | Peran Pengguna |
|---|---|---|---|---|
| 1 | **Dashboard Admisi** | [01-dashboard-admisi/](./01-dashboard-admisi/) | Monitoring progres seleksi & statistik penilaian | Super Admin, Pimpinan |
| 2 | **Manajemen Peserta** | [02-manajemen-peserta/](./02-manajemen-peserta/) | Master data calon santri, gelombang, nomor tes | Super Admin |
| 3 | **TPA Scoring** | [03-tpa-scoring/](./03-tpa-scoring/) | Input 12 subtes TPA, bobot max 69, konversi 100 | Penguji TPA, Admin |
| 4 | **Rubrik Kepesantrenan** | [04-rubrik-kepesantrenan/](./04-rubrik-kepesantrenan/) | Instrumen skala 1-4 untuk 7 cabang ibadah/bahasa | Penguji Kepesantrenan |
| 5 | **Wawancara Kualitatif** | [05-wawancara-kualitatif/](./05-wawancara-kualitatif/) | Form esai deskriptif santri dan orang tua | Pewawancara Khusus |
| 6 | **Ledger & Ranking** | [06-ledger-dan-ranking/](./06-ledger-dan-ranking/) | Rekapitulasi nilai & mesin auto-ranking paralel | Super Admin, Pimpinan |
| 7 | **Pleno & Kelulusan** | [07-pleno-dan-kelulusan/](./07-pleno-dan-kelulusan/) | Sidang penetapan cut-off: Lulus vs Waiting List | Pimpinan, Super Admin |
