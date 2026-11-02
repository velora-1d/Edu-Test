# 7. User Flow Architecture & Workflows

Modul 07 mendefinisikan seluruh alur kerja sistem **Edu-Test** dari awal pendaftaran hingga publikasi hasil akhir seleksi:

```mermaid
flowchart TD
    subgraph S1["Tahap 1: Setup & Import Data"]
        A1["Import Peserta / Input Satuan"] --> A2["Penerbitan No Tes & Pembagian Sesi"]
    end

    subgraph S2["Tahap 2: Pelaksanaan Ujian Seleksi"]
        A2 --> B1["Meja 1: Ujian TPA"]
        A2 --> B2["Meja 2: Ujian Kepesantrenan"]
        A2 --> B3["Meja 3: Wawancara Ortu & Santri"]
        
        B1 --> C1["Input Skor 12 Subtes TPA"]
        B2 --> C2["Input Rubrik 7 Bidang (Skala 1-4)"]
        B3 --> C3["Input Narasi Esai Deskriptif"]
    end

    subgraph S3["Tahap 3: Pemrosesan & Auto-Ranking"]
        C1 & C2 --> D1["Kalkulasi Otomatis Backend Engine"]
        D1 --> D2["Peringkat TPA & Peringkat Kepesantrenan"]
        D2 --> D3["Peringkat Paralel (Skor Komposit)"]
    end

    subgraph S4["Tahap 4: Sidang Pleno & Keputusan"]
        D3 & C3 --> E1["Sidang Pleno Pimpinan"]
        E1 --> E2["Input Daya Tampung / Kuota"]
        E2 --> E3{"Ambang Kuota"}
        E3 -->|Peringkat <= Kuota| F1["Status: LULUS"]
        E3 -->|Peringkat > Kuota| F2["Status: WAITING LIST"]
        F1 & F2 --> G1["Penerbitan SK & Cetak Laporan"]
    end
```

## Daftar Berkas Alur Rinci:
1. [01-flow-import-dan-sesi-ujian.md](./01-flow-import-dan-sesi-ujian.md)
2. [02-flow-skoring-tpa.md](./02-flow-skoring-tpa.md)
3. [03-flow-rubrik-kepesantrenan.md](./03-flow-rubrik-kepesantrenan.md)
4. [04-flow-wawancara-kualitatif.md](./04-flow-wawancara-kualitatif.md)
5. [05-flow-auto-ranking-paralel.md](./05-flow-auto-ranking-paralel.md)
6. [06-flow-sidang-pleno-dan-hasil.md](./06-flow-sidang-pleno-dan-hasil.md)
