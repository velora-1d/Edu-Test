# Flow 01: Import Peserta & Pembagian Sesi Ujian

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Panitia PPDB
    participant Sys as Sistem Edu-Test
    participant DB as Database

    Admin->>Sys: Upload File Excel Peserta (.xlsx)
    Sys->>Sys: Validasi Struktur & Cek Duplikasi (NISN/Nama)
    alt Ada Error Validasi
        Sys-->>Admin: Tampilkan Baris Error & Minta Perbaikan
    else Validasi Sukses
        Sys->>DB: Simpan Data Calon Santri
        Sys->>Sys: Generate Nomor Tes Unik (misal: G1-RPL-001)
        Sys-->>Admin: Tampilkan Daftar Peserta Siap Uji
    end
    Admin->>Sys: Plotting Peserta ke Ruang / Sesi Ujian
    Sys->>DB: Update Session Assignment
    Sys-->>Admin: Cetak Lembar Presensi Ujian
```

## 2. Deskripsi Langkah
1. Panitia mengunggah berkas Excel data calon pendaftar dari formulir pendaftaran awal.
2. Sistem memvalidasi apakah kolom-kolom utama terisi (Nama, NISN, Asal Sekolah, Pilihan Jurusan).
3. Sistem secara otomatis membentuk Nomor Tes sesuai pola gelombang dan jurusan.
4. Panitia menetapkan jadwal sesi uji (misal Sesi Pagi 08.00–12.00) dan mencetak kartu/daftar hadir.

