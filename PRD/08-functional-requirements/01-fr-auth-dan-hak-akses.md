# FR-01: Otentikasi & Hak Akses Pengguna

## 1. Spesifikasi Otentikasi
- **FR-AUTH-001**: Sistem harus menyediakan autentikasi pengguna berbasis email/username dan password yang aman dengan hashing minimal bcrypt / argon2.
- **FR-AUTH-002**: Sistem harus mendukung *Session Management* berbasis token (JWT / Secure Cookie Session) dengan masa berlaku sesi yang dapat dikonfigurasi.
- **FR-AUTH-003**: Sistem harus menyediakan proteksi *Rate Limiting* (maksimal 5 percobaan gagal per 5 menit) untuk mencegah serangan brute force pada akun penguji.

## 2. Spesifikasi Otorisasi & Role-Based Access Control (RBAC)
- **FR-AUTH-004**: Sistem wajib menerapkan isolasi menu ketat per peran:
  - Role `PENGUJI_TPA` hanya dapat mengakses menu input TPA pada peserta sesi terkait.
  - Role `PENGUJI_PESANTREN` hanya dapat mengakses menu rubrik kepesantrenan.
  - Role `PEWAWANCARA_ORTU` hanya dapat mengakses formulir esai wawancara.
  - Role `PIMPINAN` memiliki hak baca (*read-all*) ke seluruh ledger dan hak eksekusi penetapan kelulusan.
  - Role `SUPER_ADMIN` memiliki hak kontrol penuh termasuk konfigurasi sistem dan pembukaan kunci nilai (*unlock score*).
- **FR-AUTH-005**: Penguji tidak diizinkan mengubah nilai yang statusnya telah diubah menjadi `FINAL_SUBMITTED` tanpa persetujuan *unlock request* oleh Super Admin.

