# FR-05: Ranking Engine & Aturan Seri (Tie-Breaker)

## 1. Spesifikasi Pemeringkatan Otomatis
- **FR-RNK-001**: Sistem harus secara otomatis menghitung 3 jenis pemeringkatan:
  1. **Peringkat TPA**: Berdasarkan Skor Akhir TPA (skala 100).
  2. **Peringkat Kepesantrenan**: Berdasarkan Rata-rata Total Kepesantrenan (skala 100).
  3. **Peringkat Paralel (Umum)**: Berdasarkan Skor Komposit Akhir.

## 2. Formula Skor Komposit Paralel
- **FR-RNK-002**: Skor komposit paralel dihitung dari kombinasi nilai TPA dan Kepesantrenan:
  $$\text{Skor Komposit} = \text{ROUND}\left(\frac{\text{Skor TPA} + \text{Rata-rata Kepesantrenan}}{2}, 2\right)$$
  *(Bobot default 50% TPA : 50% Kepesantrenan, atau dapat dikonfigurasi melalui konfigurasi admin)*.

## 3. Aturan Seri (Tie-Breaker Logic)
- **FR-RNK-003**: Apabila dua atau lebih santri memperoleh Skor Komposit yang bernilai persis sama, penentuan urutan peringkat paralel diselesaikan secara otomatis dengan hierarki berikut:
  1. **Prioritas 1 (Kepesantrenan)**: Peserta dengan nilai Rata-rata Kepesantrenan lebih tinggi menempati peringkat lebih atas.
  2. **Prioritas 2 (Tahsin & Tahfidz)**: Jika masih sama, peserta dengan nilai Tahsin & Tahfidz lebih tinggi menempati peringkat lebih atas.
  3. **Prioritas 3 (Subtes Logika & Karakter TPA)**: Jika masih sama, peserta dengan nilai gabungan subtes Logika + Karakter TPA lebih tinggi menempati peringkat lebih atas.
  4. **Prioritas 4 (Waktu Pendaftaran)**: Jika masih sama, peserta yang mendaftar lebih awal (*created_at*) menempati peringkat lebih atas.

