# 02 - List Fitur & Form UI: Wawancara Kualitatif

Spesifikasi antarmuka form wawancara mengadopsi instrumen baku dari [Bahan/TES WAWANCARA.docx](file:///home/pak-hakim/Pak-Hakim/Project/Edu-Test/Bahan/TES%20WAWANCARA.docx) yang dibagi menjadi dua bagian terintegrasi:

---

## 1. Bagian A: Wawancara Umum (Profil, Kebiasaan & Sikap Sosial)

Antarmuka dirancang dengan input responsif (pilihan toggle Ya/Tidak + textarea pendalaman):

### A.1 Identitas & Profil Keluarga
1. **Nama Lengkap & Asal Sekolah**: Pre-filled otomatis dari data peserta.
2. **Prestasi yang Pernah Diraih**: *Textarea* catatan prestasi akademik / non-akademik.
3. **Struktur Saudara**: Input terformat `Anak ke [ ... ] dari [ ... ] bersaudara`.

### A.2 Screening Perilaku & Keterampilan Digital
4. **Riwayat Pacaran / Kedekatan Lawan Jenis**:
   - Toggle: `Pernah / Tidak`
   - *Prompt Pewawancara*: Tanyakan apakah pernah dekat, saling chat, dan bagaimana sikapnya jika menyukai seseorang.
   - Kolom Catatan Pendalaman (*Textarea*).
5. **Riwayat Merokok / Vape**:
   - Toggle: `Pernah / Tidak`
   - *Prompt Pewawancara*: Tanyakan apakah pernah diajak teman atau ada niat mencoba.
   - Kolom Catatan Pendalaman (*Textarea*).
6. **Keterampilan Komputer**:
   - Toggle: `Bisa / Tidak`
   - Kolom isian aplikasi yang biasa digunakan (Word, Excel, Canva, Browsing, dll).
7. **Keterampilan Editing Video / Desain**:
   - Toggle: `Bisa / Tidak`
   - Kolom isian aplikasi editing dan portofolio/konten yang pernah dibuat (CapCut, Premiere, Photoshop, dll).
8. **Riwayat Penyakit Bawaan / Alergi**:
   - Kolom isian teks (*jika ada sebutkan, jika tidak kosongkan*).

### A.3 Sikap Sosial, Emosional & Anti-Bullying
9. **Respons terhadap Ejekan/Gangguan Teman**:
   - Pertanyaan: *"Apa yang akan kamu lakukan jika ada teman yang mengejek atau mengganggumu?"* (*Textarea*).
10. **Motivasi Mengatasi Kemalasan**:
    - Pertanyaan: *"Apa yang akan kamu lakukan jika merasa malas mengikuti kegiatan pesantren?"* (*Textarea*).
11. **Empati & Sikap Inklusif (Anti-Bullying & ABK)**:
    - Pertanyaan: *"Jika teman kamu ada yang culun, bibir sumbing, anak mami, ABK, bodoh, gagap, cadel, apa yang kamu katakan dan bagaimana sikap kamu terhadap dia?"* (*Textarea*).
12. **Pengalaman Pergaulan Sebelumnya**:
    - Pertanyaan: *"Bagaimana pengalaman kamu dalam bergaul dengan teman dan lingkungan sebelumnya? Apakah pernah mengalami kejadian yang kurang menyenangkan?"* (*Textarea*).
13. **Kebiasaan Berbicara & Interaksi**:
    - Pertanyaan: *"Bagaimana kebiasaan kamu dalam berbicara dan berinteraksi dengan orang lain? Apakah pernah terbiasa berkata kasar, kotor, atau melakukan tindakan yang dapat menyakiti orang lain?"* (*Textarea*).

### A.4 Kemandirian & Kesiapan Mental Mondok
14. **Inisiatif Keputusan Mondok**:
    - Pilihan: `Keinginan Sendiri` / `Keinginan Orang Tua` / `Keduanya`.
    - Catatan uraian alasan santri.
15. **Manajemen Waktu Pribadi**:
    - Pertanyaan: *"Bagaimana biasanya kamu mengatur waktu antara belajar, ibadah, istirahat, dan kegiatan lainnya?"* (*Textarea*).
16. **Tantangan Kemandirian Terbesar**:
    - Pertanyaan: *"Apa hal yang menurut kamu paling sulit ketika harus hidup mandiri di pesantren dan jauh dari orang tua?"* (*Textarea*).
17. **Refleksi Kebiasaan yang Ingin Diperbaiki**:
    - Pertanyaan: *"Apa kebiasaan atau sikap yang ingin kamu perbaiki setelah masuk pesantren?"* (*Textarea*).
18. **Kebersihan Kamar & Barang Pribadi**:
    - Pertanyaan: *"Bagaimana kebiasaan kamu dalam menjaga kebersihan kamar dan barang-barang pribadi?"* (*Textarea*).
19. **Intensitas Penggunaan Gadget / HP**:
    - Pertanyaan: *"Seberapa sering kamu menggunakan HP dalam sehari dan biasanya digunakan untuk apa?"* (Durasi jam + rincian penggunaan game/medsos).

---

## 2. Bagian B: Wawancara Kepesantrenan (Komitmen Spiritual & Kesiapan Santri)

### B.1 Ringkasan Portofolio Teknis (Direct Link ke Rubrik)
Menampilkan status ringkas uji teknis yang tersinkronisasi dengan Meja Kepesantrenan:
- **Bahasa Arab & Bahasa Inggris**: Status Teruji / Nilai
- **Hafalan Al-Qur'an**: Input jumlah capaian riil (`Sebutkan berapa juz`)
- **Bacaan Kitab**: Input judul kitab yang pernah dipelajari (`Sebutkan kitab apa saja`)
- **Praktik Ibadah**: Status uji Bacaan Sholat, Bacaan Al-Qur'an/Tahsin, Adzan, dan Hadits.

### B.2 Wawancara Komitmen Spiritual & Kedisiplinan
1. **Motivasi Utama**:
   - Pertanyaan: *"Alasan sebenarnya kamu ingin masuk pesantren?"* (*Textarea*).
2. **Konsistensi Salat 5 Waktu**:
   - Pertanyaan: *"Bagaimana kebiasaan kamu dalam menjalankan salat lima waktu?"* (*Textarea*).
3. **Kebiasaan Membaca Al-Qur'an**:
   - Pertanyaan: *"Bagaimana kebiasaan kamu dalam membaca Al-Qur’an? Seberapa sering biasanya membaca?"* (*Textarea*).
4. **Sikap Menerima Teguran/Nasihat**:
   - Pertanyaan: *"Bagaimana biasanya kamu merespons ketika mendapatkan teguran dari guru atau pembimbing?"* (*Textarea*).
5. **Penyelesaian Perbedaan Pendapat**:
   - Pertanyaan: *"Kalau kamu tidak setuju dengan pendapat teman, biasanya bagaimana cara kamu menyikapinya?"* (*Textarea*).
6. **Kesiapan Rutinitas Ibadah Malam & Halaqah**:
   - Pertanyaan: *"Bagaimana perasaan kamu jika harus mengikuti kegiatan rutin seperti tahajud, zikir, mengaji, dan kajian?"* (*Textarea*).
7. **Bukti Kesiapan Nyata (Pernyataan Komitmen)**:
   - Pertanyaan: *"Bukti konkret bahwa kamu siap menjadi santri, bukan hanya ingin diterima?"* (*Textarea*).

---

## 3. Fitur Pendukung Antarmuka (UI Controls)
- **Sticky Header**: Informasi Santri (Foto, No Tes, Nama, Asal Sekolah) tetap terlihat saat scrolling.
- **Autosave Real-Time**: Status indikator "Tersimpan otomatis pada 20:50 WIB".
- **Kategori Accordion / Tabs**: Memudahkan penguji berpindah antara Wawancara Umum dan Wawancara Kepesantrenan.
- **Tombol "Tandai Selesai & Simpan Dossier"**: Mengunci draf dan memberi status wawancara lengkap.
