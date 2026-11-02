# 1. Project Overview / Product Vision

## 1.1 Nama Project
- **Nama Sistem**: Edu-Test (Sistem Ujian Seleksi & Penilaian Calon Santri Baru)
- **Institusi**: SMK Skill Village Islamic School
- **Tahun Ajaran Sasaran**: 2027/2028 (PSB / PPDB)

## 1.2 Deskripsi Produk
**Edu-Test** adalah platform digital komprehensif berbasis web yang dirancang khusus untuk memodernisasi dan mengotomasi seluruh rantai penilaian penerimaan santri/peserta didik baru (PSB). Sistem ini menggabungkan penilaian kuantitatif terstruktur (**Tes Potensi Akademik / TPA** dengan 12 subtes berbobot), penilaian kompetensi keagamaan & bahasa (**Rubrik Kepesantrenan** mencakup Tahsin, Tahfidz, Kitab Kuning, Bahasa Arab, Bahasa Inggris, Hadits, Adzan, dan Bacaan Sholat dengan skala 1–4 terkonversi), serta rekam jejak kualitatif non-skor (**Wawancara Santri & Orang Tua**).

Seluruh skor dihitung otomatis oleh server secara instan, menghasilkan pemeringkatan paralel tanpa perulangan manual (*auto-ranking engine*), serta memfasilitasi penetapan kelulusan berdasarkan kuota daya tampung dengan pendekatan non-diskriminatif (**LULUS** atau **WAITING LIST GELOMBANG BERIKUTNYA**).

## 1.3 Latar Belakang & Konteks
Sebelum adanya sistem Edu-Test:
1. **Inefisiensi Rekapitulasi Manual**: Panitia harus menyalin nilai dari kertas lembar ujian dan rubrik wawancara ke lembar kerja Excel manual, yang memakan waktu berhari-hari.
2. **Rawan Kesalahan Hitung (Human Error)**: Variasi bobot soal (bobot 1, 2, dan 3 pada subtes TPA serta pembobotan persentase rubrik kepesantrenan seperti 40-20-20-20 atau 50-30-20) sering kali memicu formula rusak atau salah input di Excel.
3. **Kompleksitas Perangkingan Paralel**: Penggabungan nilai TPA dan Kepesantrenan secara manual menimbulkan kelelahan panitia dalam mengurutkan puluhan hingga ratusan peserta secara adil.
4. **Kebutuhan Format Wawancara Deskriptif**: Panitia membutuhkan catatan mendalam mengenai kepribadian santri dan komitmen orang tua dalam bentuk teks paragraf tanpa perlu dipaksakan menjadi angka yang mereduksi konteks.

## 1.4 Target Pengguna Utama
1. **Panitia PPDB / Administrator**: Mengelola data calon santri, gelombang, sesi tes, dan monitoring progres penginputan nilai.
2. **Penguji TPA**: Menginput hasil tes kemampuan akademik dan karakter santri.
3. **Pewawancara / Penguji Kepesantrenan**: Menguji kemampuan baca Al-Qur'an, praktik ibadah, pemahaman kitab, dan percakapan bahasa asing.
4. **Pewawancara Kualitatif**: Menggali latar belakang psikologis, kemandirian anak, serta komitmen orang tua wali.
5. **Pimpinan / Kepala Sekolah**: Meninjau hasil sidang pleno, memantau *dashboard ledger*, dan mengesahkan keputusan kelulusan.
