# 02 - List Fitur: Rubrik Kepesantrenan

## Daftar Fitur
1. **Selector Pilihan Skor Skala 1–4**:
   - Pilihan: `1 = Kurang`, `2 = Cukup`, `3 = Baik`, `4 = Sangat Baik`.
2. **Formulir 7 Bidang Uji**:
   - **Bidang 1: Tahsin & Tahfidz**:
     - *Tahsin (Baca 5 Baris)*: 4 indikator (Makhraj, Tajwid, Kelancaran, Adab) @ 25% (Poin: 10, 15, 20, 25).
     - *Syarat Lanjut Hafalan*: Toggle `Punya Hafalan?` (Ya / Tidak).
     - *Tahfidz (Uji Hafalan)*: Jika Ya, nilai 4 indikator (Kelancaran, Muroja'ah, Target, Adab) @ 25% (Poin: 10, 15, 20, 25).
     - *Kalkulasi Gabungan*: Jika punya hafalan $\to (Tahsin + Tahfidz) / 2$. Jika tidak punya $\to$ Nilai Tahsin murni.
   - **Bidang 2: Kitab Kuning**:
     - 4 indikator: Baca gundul (25%), Nahwu-shorof (25%), Terjemah pegon (25%), Pemahaman isi (25%). (Poin: 10, 15, 20, 25).
   - **Bidang 3: Bahasa Inggris**:
     - Speaking (40% - Poin: 10, 20, 30, 40)
     - Pronunciation (20% - Poin: 5, 10, 15, 20)
     - Writing (20% - Poin: 5, 10, 15, 20)
     - Vocabulary (20% - Poin: 5, 10, 15, 20)
   - **Bidang 4: Bahasa Arab**:
     - Identik dengan Bahasa Inggris (Speaking 40%, Pronunciation 20%, Writing 20%, Vocab 20%).
   - **Bidang 5: Hadits**:
     - Hafalan Hadits (40% - Poin: 10, 20, 30, 40)
     - Kelancaran & Ketepatan (20% - Poin: 5, 10, 15, 20)
     - Pemahaman Makna (20% - Poin: 5, 10, 15, 20)
     - Adab (20% - Poin: 5, 10, 15, 20)
   - **Bidang 6: Adzan**:
     - Kelancaran lafazh (50% - Poin: 20, 30, 40, 50)
     - Ketepatan makhraj & tajwid (30% - Poin: 10, 15, 20, 30)
     - Kualitas suara / nada (20% - Poin: 5, 10, 15, 20)
   - **Bidang 7: Bacaan Sholat**:
     - Kelancaran lafazh (50% - Poin: 20, 30, 40, 50)
     - Ketepatan makhraj & tajwid (30% - Poin: 10, 15, 20, 30)
     - Adab (20% - Poin: 5, 10, 15, 20)
3. **Catatan Fasilitator per Bidang**: Kolom input teks catatan pengamatan asatidz.
4. **Indikator Passing Grade Real-Time**:
   - Status kelulusan per bidang: Tahsin & Kitab Kuning ($\ge 60$), B. Inggris/Arab/Hadits ($\ge 50$), Adzan/Sholat ($\ge 55$).
5. **Kunci Nilai Meja Kepesantrenan**: Mengunci nilai santri setelah seluruh 7 bidang diuji.

