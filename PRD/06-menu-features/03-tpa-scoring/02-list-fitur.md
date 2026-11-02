# 02 - List Fitur: TPA Scoring

## Daftar Fitur
1. **Form Input Grid Subtes Terstruktur**:
   - **Bahasa Indonesia (5 subtes)**:
     - EYD: Input benar (0–3), Bobot: 1 (Max: 3)
     - Kohesi & Koherensi: Input benar (0–3), Bobot: 1 (Max: 3)
     - Logika: Input benar (0–3), Bobot: 2 (Max: 6)
     - Analogi: Input benar (0–3), Bobot: 2 (Max: 6)
     - Pemahaman Wacana: Input benar (0–3), Bobot: 2 (Max: 6)
   - **Matematika (2 subtes)**:
     - Operasi Perhitungan: Input benar (0–3), Bobot: 3 (Max: 9)
     - Dasar Bangun Ruang: Input benar (0–3), Bobot: 3 (Max: 9)
   - **Kemampuan Bahasa (2 subtes)**:
     - Bahasa Inggris: Input benar (0–3), Bobot: 2 (Max: 6)
     - Bahasa Arab: Input benar (0–3), Bobot: 2 (Max: 6)
   - **Kemampuan Al-Qur'an (2 subtes)**:
     - Tahfidz: Input benar (0–3), Bobot: 2 (Max: 6)
     - Tahsin: Input benar (0–3), Bobot: 1 (Max: 3)
   - **Karakter (1 subtes)**:
     - Soal Karakter: Input benar (0–6), Bobot: 1 (Max: 6)
2. **Kalkulator Real-Time Otomatis**:
   - Menampilkan total skor mentah (perolehan dari 69 poin maksimum).
   - Menghitung nilai konversi skala 100 langsung secara non-persentase: $\text{Skor} = (\text{Poin} / 69) \times 100$.
   - Menampilkan badge kategori otomatis:
     - 0–20: `Sangat Buruk`
     - 21–40: `Buruk`
     - 41–60: `Sedang`
     - 61–80: `Baik`
     - 81–100: `Sangat Baik`
3. **Draft & Lock Mechanism**:
   - Tombol **Simpan Draft** (bisa diedit sewaktu-waktu).
   - Tombol **Kunci Nilai TPA (Final Submit)** (mengunci perubahan dan mengirim ke ledger).

