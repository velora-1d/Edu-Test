# Flow 04: Wawancara Kualitatif (Santri & Orang Tua)

## 1. Diagram Alur
```mermaid
sequenceDiagram
    autonumber
    actor Pewawancara as Pewawancara / Guru BK
    participant Form as Form Esai Wawancara
    participant DB as Database

    Pewawancara->>Form: Buka Profil Santri / Orang Tua
    Form-->>Pewawancara: Tampilkan 3 Bagian Esai Bebas
    
    Pewawancara->>Form: Ketik Hasil Wawancara Umum Santri
    Note over Form: Autosave teks berjalan di background
    
    Pewawancara->>Form: Ketik Hasil Wawancara Kepesantrenan
    Pewawancara->>Form: Ketik Hasil Wawancara Orang Tua / Wali
    Pewawancara->>Form: Isi Rekomendasi Khusus & Catatan Pleno
    
    Pewawancara->>Form: Klik "Simpan Dossier Wawancara"
    Form->>DB: Simpan Teks Dossier Kualitatif
    Form-->>Pewawancara: Tampilkan Konfirmasi Tersimpan
```

## 2. Deskripsi Langkah
1. Pewawancara membuka lembar catatan wawancara.
2. Menggali aspek kualitatif tanpa memberi nilai angka:
   - Kesungguhan santri, minat kejuruan, dan kepribadian.
   - Kesiapan orang tua, dukungan finansial, dan komitmen terhadap aturan pondok.
3. Seluruh catatan tersimpan dalam satu dossier terpadu untuk ditinjau oleh pimpinan saat pleno.

