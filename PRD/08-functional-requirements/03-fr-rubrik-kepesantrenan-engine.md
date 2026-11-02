# FR-03: Mesin Rubrik Kepesantrenan & Praktik Ibadah

## 1. Spesifikasi Nilai Skala 1–4
- **FR-KPS-001**: Seluruh input instrumen penguji menggunakan skala integer 1 s/d 4:
  - `1`: Kurang
  - `2`: Cukup
  - `3`: Baik
  - `4`: Sangat Baik

## 2. Pemetaan Poin (Lookup Function) per Bidang

### A. Tahsin & Tahfidz (Alur Bertingkat)
- **Tahsin**: 4 indikator @ 25% (Makhraj, Tajwid, Kelancaran, Adab).
  $$\text{Mapping}: [1 \to 10,\; 2 \to 15,\; 3 \to 20,\; 4 \to 25] \implies \text{Total Max } 100$$
- **Tahfidz**: Cek `Punya Hafalan?` (`Ya` / `Tidak`).
  - Jika `Ya`: Dinilai 4 indikator @ 25% (Kelancaran, Muroja'ah, Target Hafalan, Adab).
  - Mapping: $[1 \to 10,\; 2 \to 15,\; 3 \to 20,\; 4 \to 25] \implies \text{Total Max } 100$.
- **FR-KPS-002**: Formula Nilai Akhir Tahsin & Tahfidz:
  $$\text{Nilai Gabungan} = \begin{cases} \text{ROUND}\left(\frac{\text{Tahsin} + \text{Tahfidz}}{2}, 0\right), & \text{jika Punya Hafalan = "Ya"} \\ \text{Tahsin}, & \text{jika Punya Hafalan = "Tidak"} \end{cases}$$
  *(Ambang batas lulus: $\ge 60$)*

### B. Kitab Kuning
- 4 indikator @ 25%: Baca teks gundul, Nahwu-shorof, Terjemah makna pegon/gandul, Pemahaman isi.
- Mapping: $[1 \to 10,\; 2 \to 15,\; 3 \to 20,\; 4 \to 25] \implies \text{Max } 100$.
- *(Ambang batas lulus: $\ge 60$)*

### C. Bahasa Inggris & Bahasa Arab
- 4 indikator:
  - Speaking (40%): $[1 \to 10,\; 2 \to 20,\; 3 \to 30,\; 4 \to 40]$
  - Pronunciation (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
  - Writing (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
  - Vocabulary (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
- *(Ambang batas lulus: $\ge 50$)*

### D. Hadits
- 4 indikator:
  - Hafalan Hadits (40%): $[1 \to 10,\; 2 \to 20,\; 3 \to 30,\; 4 \to 40]$
  - Kelancaran & Ketepatan (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
  - Pemahaman Makna (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
  - Adab (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
- *(Ambang batas lulus: $\ge 50$)*

### E. Adzan & F. Bacaan Sholat
- 3 indikator:
  - Kelancaran Lafazh (50%): $[1 \to 20,\; 2 \to 30,\; 3 \to 40,\; 4 \to 50]$
  - Ketepatan Makhraj & Tajwid (30%): $[1 \to 10,\; 2 \to 15,\; 3 \to 20,\; 4 \to 30]$
  - Suara (Adzan) / Adab (Sholat) (20%): $[1 \to 5,\; 2 \to 10,\; 3 \to 15,\; 4 \to 20]$
- *(Ambang batas lulus: $\ge 55$)*

## 3. Komputasi Rata-Rata Total Kepesantrenan
- **FR-KPS-003**: Sistem menghitung rata-rata dari ke-7 bidang kepesantrenan:
  $$\text{Rata-rata Total Kepesantrenan} = \text{ROUND}\left(\frac{\sum_{j=1}^{7} \text{Nilai Bidang}_j}{7}, 1\right)$$

