# Flow 02: Skoring Tes Potensi Akademik (TPA)

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Penguji as Penguji TPA
    participant App as Antarmuka Input TPA
    participant Engine as TPA Scoring Engine
    participant DB as Database

    Penguji->>App: Pilih Santri (Cari No Tes / Nama)
    App-->>Penguji: Buka Lembar 12 Subtes TPA
    Penguji->>App: Input Jumlah Jawaban Benar per Subtes
    App->>Engine: Kirim Raw Correct Answers
    Engine->>Engine: Kalikan Jawaban Benar x Bobot Subtes
    Engine->>Engine: Hitung Total Raw Poin (0 - 69)
    Engine->>Engine: Konversi Skala 100 & Tentukan Kategori
    Engine-->>App: Tampilkan Skor Akhir & Badge Kategori Real-Time
    alt Simpan Sementara
        Penguji->>App: Klik "Simpan Draft"
        App->>DB: Update Status = DRAFT_TPA
    else Submit Final
        Penguji->>App: Klik "Kunci Nilai TPA (Submit)"
        App->>DB: Simpan Nilai & Lock State = LOCKED_TPA
        App-->>Penguji: Konfirmasi Berhasil Dikunci
    end
```

## 2. Deskripsi Langkah
1. Penguji membuka form TPA santri bersangkutan.
2. Mengisi angka jawaban benar untuk masing-masing dari 12 subkategori:
   - Bahasa Indonesia (EYD, Kohesi, Logika, Analogi, Wacana).
   - Matematika (Operasi Hitung, Bangun Ruang).
   - Bahasa (Inggris, Arab).
   - Al-Qur'an (Tahfidz, Tahsin).
   - Karakter.
3. Mesin otomatis mengalikan bobot, menjumlahkan skor mentah, dan memetakan ke skor skala 100 serta kategori kualitatif.
4. Penguji melakukan submit final yang mengunci form dari perubahan tidak sengaja.

