# Flow 06: Sidang Pleno & Penetapan Kelulusan

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Pimpinan as Pimpinan / Kepala Sekolah
    actor Admin as Ketua Panitia PPDB
    participant Screen as Layar Sidang Pleno
    participant Engine as Decision Engine
    participant DB as Database

    Pimpinan->>Screen: Buka Layar Pleno Kelulusan
    Screen->>DB: Ambil Data Peringkat Paralel & Dossier Wawancara
    Pimpinan->>Screen: Masukkan Kuota Penerimaan (misal: Kuota = 20)
    
    Screen->>Engine: Simulasi Cut-Off Line (Limit = 20)
    Engine->>Engine: Rank 1 - 20 -> Label "LULUS"
    Engine->>Engine: Rank 21+ -> Label "WAITING LIST"
    Engine-->>Screen: Tampilkan Garis Pemisah & Status Peserta
    
    opt Tinjau Dossier Khusus
        Pimpinan->>Screen: Klik Nama Santri Tertentu
        Screen-->>Pimpinan: Buka Modal Teks Wawancara Ortu & Santri
    end

    Pimpinan->>Screen: Klik "Kunci & Sahkan Keputusan Pleno"
    Screen->>DB: Update Final Status: LULUS / WAITING_LIST
    Screen->>DB: Catat Berita Acara Pleno
    Screen-->>Admin: Buka Akses Cetak SK & Export Laporan
```

## 2. Deskripsi Langkah
1. Pimpinan sekolah dan ketua panitia menggelar sidang pleno.
2. Pimpinan menginput daya tampung santri baru.
3. Sistem secara otomatis menerapkan garis batas:
   - Santri di dalam kuota berstatus: **LULUS**.
   - Santri di luar kuota berstatus: **WAITING LIST GELOMBANG BERIKUTNYA** (bukan tidak lulus).
4. Pimpinan mengesahkan keputusan, dan surat pengumuman dapat langsung diunduh/dicetak.

