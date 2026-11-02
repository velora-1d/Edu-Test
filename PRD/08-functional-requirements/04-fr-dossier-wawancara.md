# FR-04: Functional Requirements - Dossier Wawancara Kualitatif

## 1. Landasan Prinsip Penilaian Kualitatif
- **FR-WCR-001**: Sistem wawancara kualitatif mengadopsi instrumen baku dari dokumen `TES WAWANCARA.docx`.
- **FR-WCR-002**: Modul ini tidak menghasilkan skor angka (poin), melainkan menghasilkan **Dossier Kualitatif** yang disajikan berdampingan dengan skor numerik pada sidang pleno kelulusan.

## 2. Struktur Entitas Data Wawancara (Data Contract)
Sistem menyimpan data wawancara terstruktur dalam format JSONB atau tabel kolom relasional pada entitas `qualitative_interviews`:

```json
{
  "wawancara_umum": {
    "prestasi": "string (opsional)",
    "anak_ke": "integer",
    "dari_bersaudara": "integer",
    "pernah_pacaran": "boolean",
    "catatan_pacaran": "string",
    "pernah_merokok": "boolean",
    "catatan_merokok": "string",
    "bisa_komputer": "boolean",
    "aplikasi_komputer": "string",
    "bisa_editing": "boolean",
    "aplikasi_editing": "string",
    "penyakit_alergi": "string",
    "respons_ejekan": "string",
    "sikap_malas": "string",
    "sikap_terhadap_teman_khusus": "string",
    "pengalaman_pergaulan": "string",
    "kebiasaan_berbicara": "string",
    "inisiatif_mondok": "string (SENDIRI | ORTU | KEDUANYA)",
    "manajemen_waktu": "string",
    "kesulitan_terbesar": "string",
    "sikap_ingin_diperbaiki": "string",
    "kebersihan_kamar": "string",
    "penggunaan_hp": "string"
  },
  "wawancara_kepesantrenan": {
    "hafalan_juz": "string",
    "kitab_dipelajari": "string",
    "alasan_masuk_pesantren": "string",
    "kebiasaan_salat_lima_waktu": "string",
    "kebiasaan_baca_quran": "string",
    "respons_teguran": "string",
    "sikap_beda_pendapat": "string",
    "perasaan_rutinitas_malam": "string",
    "bukti_kesiapan_santri": "string"
  },
  "wawancara_orang_tua": {
    "komitmen_pembiayaan": "string",
    "dukungan_tata_tertib": "string",
    "catatan_khusus_keluarga": "string"
  },
  "rekomendasi_pewawancara": "string"
}
```

## 3. Validasi & Keamanan Input
- **FR-WCR-003**: Field isian teks bebas mendukung input multibaris hingga 2.000 karakter per pertanyaan dengan sanitasi XSS (Cross-Site Scripting) di sisi server.
- **FR-WCR-004**: Sistem menjalankan mekanisme **Debounced Autosave** (interval jeda pengetikan 3 detik) yang mengirimkan payload parsial ke server via endpoint SvelteKit `+server.ts`.
- **FR-WCR-005**: Status pengerjaan form diklasifikasikan menjadi:
  - `NOT_STARTED`: Form belum pernah dibuka/diisi.
  - `IN_PROGRESS`: Sebagian butir pertanyaan telah diisi (tersimpan draft).
  - `COMPLETED`: Seluruh pertanyaan esensial telah diisi dan diverifikasi oleh pewawancara.
