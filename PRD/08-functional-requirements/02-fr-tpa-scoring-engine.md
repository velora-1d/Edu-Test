# FR-02: Mesin Skoring Tes Potensi Akademik (TPA)

## 1. Spesifikasi Struktur Subtes & Butir Soal
Sistem TPA terdiri dari 12 subkategori dengan total 39 butir soal dan poin maksimum mentah sebesar 69 poin:

| No | Kategori Utama | Subtes | Jml Soal | Batas Benar (Min–Max) | Bobot per Benar | Max Poin Mentah |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Bahasa Indonesia | EYD | 3 | 0 – 3 | 1 | 3 |
| 2 | Bahasa Indonesia | Kohesi & Koherensi | 3 | 0 – 3 | 1 | 3 |
| 3 | Bahasa Indonesia | Logika | 3 | 0 – 3 | 2 | 6 |
| 4 | Bahasa Indonesia | Analogi | 3 | 0 – 3 | 2 | 6 |
| 5 | Bahasa Indonesia | Pemahaman Wacana | 3 | 0 – 3 | 2 | 6 |
| 6 | Matematika | Operasi Perhitungan | 3 | 0 – 3 | 3 | 9 |
| 7 | Matematika | Dasar Bangun Ruang | 3 | 0 – 3 | 3 | 9 |
| 8 | Kemampuan Bahasa | Bahasa Inggris | 3 | 0 – 3 | 2 | 6 |
| 9 | Kemampuan Bahasa | Bahasa Arab | 3 | 0 – 3 | 2 | 6 |
| 10 | Kemampuan Al-Qur'an | Tahfidz | 3 | 0 – 3 | 2 | 6 |
| 11 | Kemampuan Al-Qur'an | Tahsin | 3 | 0 – 3 | 1 | 3 |
| 12 | Karakter | Soal Karakter / Nilai Diri | 6 | 0 – 6 | 1 | 6 |
| **TOTAL** | **5 Bidang** | **12 Subtes** | **39** | - | - | **69** |

## 2. Formula Komputasi Skor Mentah & Normalisasi
- **FR-TPA-001**: Sistem harus menghitung skor mentah per subtes:
  $$\text{Poin Subtes}_i = (\text{Jumlah Benar}_i) \times (\text{Bobot}_i)$$
- **FR-TPA-002**: Sistem harus menghitung total skor mentah:
  $$\text{Total Poin Mentah} = \sum_{i=1}^{12} \text{Poin Subtes}_i \quad (0 \le \text{Total Poin Mentah} \le 69)$$
- **FR-TPA-003**: Sistem harus menormalisasi skor ke skala 100 secara langsung (*direct numeric score, non-percentage*):
  $$\text{Skor Akhir TPA} = \text{ROUND}\left(\frac{\text{Total Poin Mentah}}{69} \times 100, 1\right)$$

## 3. Penentuan Kategori Kualitatif TPA
- **FR-TPA-004**: Sistem secara otomatis menetapkan predikat kategori berdasarkan nilai bulat Skor Akhir TPA:
  - Nilai $0 \le \text{Skor} \le 20 \implies$ **Sangat Buruk**
  - Nilai $21 \le \text{Skor} \le 40 \implies$ **Buruk**
  - Nilai $41 \le \text{Skor} \le 60 \implies$ **Sedang**
  - Nilai $61 \le \text{Skor} \le 80 \implies$ **Baik**
  - Nilai $81 \le \text{Skor} \le 100 \implies$ **Sangat Baik**

