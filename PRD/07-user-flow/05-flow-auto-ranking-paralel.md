# Flow 05: Auto-Ranking Paralel & Ledger Rekap

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin / Pimpinan
    participant Ledger as Master Ledger UI
    participant Engine as Ranking Engine
    participant DB as Database

    Admin->>Ledger: Buka Halaman Master Ledger & Ranking
    Ledger->>DB: Query Seluruh Nilai (TPA + Kepesantrenan)
    DB-->>Engine: Raw Scores & Final Category
    
    Engine->>Engine: Hitung Peringkat TPA per Gelombang
    Engine->>Engine: Hitung Peringkat Kepesantrenan per Gelombang
    Engine->>Engine: Hitung Skor Komposit Paralel
    Engine->>Engine: Terapkan Tie-Breaker untuk Skor Identik
    Engine->>Engine: Urutkan Peringkat Paralel (Rank 1 s/d N)
    
    Engine-->>Ledger: Tampilkan Tabel Ranking Lengkap Real-Time
    Admin->>Ledger: Filter Berdasarkan Jurusan / Gelombang
    Ledger-->>Admin: Tampilkan Tampilan Terfilter Instan
```

## 2. Deskripsi Langkah
1. Sistem mengumpulkan nilai akhir dari meja TPA dan meja Kepesantrenan.
2. Mesin ranking secara otomatis menyusun:
   - **Peringkat TPA**
   - **Peringkat Kepesantrenan**
   - **Peringkat Paralel Umum**
3. Jika ada dua santri dengan skor gabungan sama, sistem menerapkan urutan penentu (*tie-breaker*):
   - Prioritas 1: Nilai Rata-rata Kepesantrenan lebih tinggi.
   - Prioritas 2: Nilai Karakter & Logika TPA lebih tinggi.
   - Prioritas 3: Waktu pendaftaran lebih awal.

