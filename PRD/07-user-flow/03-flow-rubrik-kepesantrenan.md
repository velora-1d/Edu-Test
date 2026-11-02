# Flow 03: Penilaian Rubrik Kepesantrenan & Ibadah

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Penguji as Asatidz / Penguji Kepesantrenan
    participant UI as Form Rubrik Tablet
    participant Calc as Rubric Calc Engine
    participant DB as Database

    Penguji->>UI: Pilih Santri dari Antrean Uji
    UI-->>Penguji: Tampilkan Tab Rubrik 7 Bidang
    
    loop Untuk Setiap Bidang Uji
        Penguji->>UI: Tap Skor 1-4 pada Indikator
        opt Bidang Tahsin & Tahfidz
            Penguji->>UI: Isi Tahsin -> Pilih "Punya Hafalan?"
            alt Jika Ya
                Penguji->>UI: Tap Skor Hafalan Tahfidz (1-4)
            else Jika Tidak
                UI->>UI: Nilai Tahfidz dilewati (Hafalan = Nihil)
            end
        end
        UI->>Calc: Kirim Indikator Skor 1-4
        Calc->>Calc: Mapping ke Bobot Poin Persentase (Skala 100)
        Calc-->>UI: Update Skor Bidang & Indikator Lulus/Tidak Lulus
    end

    Penguji->>UI: Tulis Catatan Fasilitator per Bidang
    Penguji->>UI: Klik "Kunci Nilai Kepesantrenan"
    UI->>Calc: Hitung Rata-Rata Total 7 Bidang
    Calc->>DB: Simpan Nilai Akhir & Lock Status = LOCKED_PESANTREN
    UI-->>Penguji: Notifikasi Berhasil & Kembali ke Antrean
```

## 2. Deskripsi Langkah
1. Penguji membuka instrumen rubrik di tablet saat santri masuk ruangan.
2. Menilai ke-7 bidang secara berurutan:
   - **Tahsin & Tahfidz**: Uji baca 5 baris $\to$ Cek kepemilikan hafalan $\to$ Jika punya hafalan, uji hafalan.
   - **Kitab Kuning**: Baca teks gundul, nahwu-shorof, terjemah pegon, pemahaman isi.
   - **Bahasa Inggris & Arab**: Speaking, pronunciation, writing, vocabulary.
   - **Hadits**: Hafalan hadits, kelancaran, makna, adab.
   - **Adzan**: Kelancaran lafazh, makhraj, kualitas suara.
   - **Bacaan Sholat**: Kelancaran lafazh bacaan sholat, makhraj/tajwid, adab.
3. Mesin kalkulasi menghitung rata-rata total dan memeriksa passing grade per bidang.
4. Penguji mengunci nilai.

