# 11. Security & Data Integrity Requirements

## 11.1 Perlindungan Integritas Nilai (Tamper-Proof Scoring)
1. **Server-Side Validation**: Seluruh input jumlah benar TPA dan skala skor rubrik divalidasi ketat di backend (TPA: tidak boleh melebihi jumlah soal subtes; Rubrik: hanya menerima integer 1, 2, 3, atau 4).
2. **Score Immutability**: Nilai yang telah di-submit secara final terkunci (*immutable*) pada tingkat database, mencegah manipulasi payload via API inspector.

## 11.2 Perlindungan Privasi Santri & Keluarga
1. **Enkripsi Data Sensitif**: Seluruh transmisi data terlindungi enkripsi TLS 1.3 (HTTPS).
2. **Kerahasiaan Dossier Wawancara**: Catatan wawancara orang tua yang memuat informasi finansial atau kondisi pribadi keluarga hanya dapat dibaca oleh Pimpinan dan pewawancara terkait.

## 11.3 Cadangan Data & Pemulihan (Backup & Disaster Recovery)
1. **Snapshot Database Sesi Ujian**: Sistem melakukan snapshot otomatis setiap pergantian sesi uji atau minimal setiap 1 jam saat hari-H seleksi.
2. **Instant Recovery**: Apabila terjadi kegagalan hardware server lokal, database dapat direplikasi atau dipulihkan dalam waktu kurang dari 15 menit.
