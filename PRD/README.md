# Product Requirements Document (PRD) - Edu-Test
### Sistem Seleksi Penerimaan Santri Baru (PSB) TA 2027/2028
**SMK Skill Village Islamic School**

---

## 📌 Indeks Modul PRD

Dokumen kebutuhan produk ini disusun dalam 15 modul standar terpisah dan saling terintegrasi:

| Modul | Nama Modul | Rincian Dokumen & Sub-Modul | Deskripsi Cakupan |
|---|---|---|---|
| **01** | **[Overview & Vision](./01-overview-vision/README.md)** | `README.md` | Latar belakang, profil institusi, dan visi digitalisasi seleksi |
| **02** | **[Problem & Goals](./02-problem-goals/README.md)** | `README.md` | Titik masalah rekap manual, tujuan operasional, dan KPI sukses |
| **03** | **[User Personas & Roles](./03-user-roles/README.md)** | `README.md` | Persona pengguna, matriks hak akses RBAC, dan pemisahan tugas |
| **04** | **[Scope & Deliverables](./04-scope-deliverables/README.md)** | `README.md` | Ruang lingkup in-scope, out-of-scope, dan serah terima akhir |
| **05** | **[Platform & Design](./05-platform-design/README.md)** | `README.md` | Tablet-first ergonomics, palet biru profesional, dan UI guidelines |
| **06** | **[Menu & Features](./06-menu-features/README.md)** | 7 Sub-Modul Menu:<br>• [01-dashboard-admisi](./06-menu-features/01-dashboard-admisi/01-deskripsi-menu.md)<br>• [02-manajemen-peserta](./06-menu-features/02-manajemen-peserta/01-deskripsi-menu.md)<br>• [03-tpa-scoring](./06-menu-features/03-tpa-scoring/01-deskripsi-menu.md)<br>• [04-rubrik-kepesantrenan](./06-menu-features/04-rubrik-kepesantrenan/01-deskripsi-menu.md)<br>• [05-wawancara-kualitatif](./06-menu-features/05-wawancara-kualitatif/01-deskripsi-menu.md)<br>• [06-ledger-dan-ranking](./06-menu-features/06-ledger-dan-ranking/01-deskripsi-menu.md)<br>• [07-pleno-dan-kelulusan](./06-menu-features/07-pleno-dan-kelulusan/01-deskripsi-menu.md) | Rincian lengkap antarmuka, fitur fungsional, dan filter per menu |
| **07** | **[User Flow & Workflows](./07-user-flow/README.md)** | 6 Alur Kerja:<br>• [01-import-dan-sesi](./07-user-flow/01-flow-import-dan-sesi-ujian.md)<br>• [02-skoring-tpa](./07-user-flow/02-flow-skoring-tpa.md)<br>• [03-rubrik-kepesantrenan](./07-user-flow/03-flow-rubrik-kepesantrenan.md)<br>• [04-wawancara-kualitatif](./07-user-flow/04-flow-wawancara-kualitatif.md)<br>• [05-auto-ranking](./07-user-flow/05-flow-auto-ranking-paralel.md)<br>• [06-sidang-pleno](./07-user-flow/06-flow-sidang-pleno-dan-hasil.md) | Diagram alir (Mermaid) dan sekuens proses per tahapan ujian |
| **08** | **[Functional Requirements](./08-functional-requirements/README.md)** | 6 Kebutuhan Spesifik:<br>• [01-auth-dan-rbac](./08-functional-requirements/01-fr-auth-dan-hak-akses.md)<br>• [02-tpa-formula](./08-functional-requirements/02-fr-tpa-scoring-engine.md)<br>• [03-rubrik-formula](./08-functional-requirements/03-fr-rubrik-kepesantrenan-engine.md)<br>• [04-dossier-wawancara](./08-functional-requirements/04-fr-dossier-wawancara.md)<br>• [05-ranking-tiebreaker](./08-functional-requirements/05-fr-ranking-dan-tie-breaker.md)<br>• [06-reporting-export](./08-functional-requirements/06-fr-reporting-dan-export.md) | Spesifikasi matematis, formula pembobotan, dan aturan komputasi |
| **09** | **[Business Process](./09-business-process/README.md)** | 4 SOP Bisnis:<br>• [01-gelombang-kuota](./09-business-process/01-bp-gelombang-pendaftaran.md)<br>• [02-lock-dan-unlock](./09-business-process/02-bp-approval-dan-lock-nilai.md)<br>• [03-waiting-list-policy](./09-business-process/03-bp-waiting-list-governance.md)<br>• [04-audit-trail](./09-business-process/04-bp-audit-trail-nilai.md) | Tata kelola seleksi, penguncian skor, dan kebijakan waiting list |
| **10** | **[Technical Stack](./10-technical-stack/README.md)** | `README.md` | Arsitektur web, database schema, server-side scoring engine |
| **11** | **[Security Requirements](./11-security-requirements/README.md)** | `README.md` | Integritas nilai (tamper-proof), enkripsi data, dan backup |
| **12** | **[Monetization / Cost](./12-monetization/README.md)** | `README.md` | Model pembiayaan internal institusi per periode PPDB |
| **13** | **[KPI & Metrics](./13-kpi-metrics/README.md)** | `README.md` | Metrik keberhasilan: rekap $\le 5$ menit, 0% salah hitung |
| **14** | **[Timeline & Roadmap](./14-timeline-roadmap/README.md)** | `README.md` | Jadwal sprint pengembangan 6 minggu menuju go-live |
| **15** | **[UAT & Maintenance](./15-uat-maintenance/README.md)** | `README.md` | 10 skenario pengujian penerimaan dan mitigasi darurat |

---

## 💡 Ringkasan Nilai Inti Sistem
1. **100% Akurat & Otomatis**: Menghapus risiko kesalahan hitung spreadsheet manual pada 12 subtes TPA dan 7 rubrik ibadah/bahasa.
2. **Auto-Ranking Paralel**: Menggabungkan nilai akademik dan kepesantrenan ke dalam peringkat umum secara instan tanpa sorting manual.
3. **Pemisahan Kuantitatif & Kualitatif**: Menjaga objektivitas angka sekaligus memperkaya sidang pleno dengan narasi esai wawancara santri & orang tua.
4. **Prinsip Seleksi Bermartabat**: Mengganti stigma penolakan "Tidak Lulus" menjadi **LULUS** atau **WAITING LIST GELOMBANG BERIKUTNYA**.
