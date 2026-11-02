# 5. Platform Architecture & UI/UX Design

## 5.1 Platform Target
- **Arsitektur Aplikasi**: Web Application (Single-Page Application / Server-Driven UI responsif).
- **Kompatibilitas Layar Utama**:
  - **Tablet (iPad / Android Tablet 10–12 inch)**: Antarmuka utama penguji saat duduk berhadapan dengan calon santri. Dioptimalkan untuk orientasi *landscape* maupun *portrait*.
  - **Desktop / Laptop (13–15+ inch)**: Antarmuka administrator panitia dan pimpinan saat memantau dashboard, menyusun ranking, dan memimpin sidang pleno.
  - **Mobile Phone (Quick Check)**: Tampilan responsif untuk pengecekan cepat progres ujian oleh panitia lapangan.

---

## 5.2 Panduan Desain & Estetika Visual (UI/UX Guidelines)

### A. Palet Warna (Color Scheme)
*Sesuai panduan preferensi sistem, aplikasi secara ketat menghindari penggunaan warna ungu dan mengadopsi nuansa biru profesional bernuansa islami-edukatif:*
- **Primary Color**: `#1E40AF` (Deep Ocean Blue) / `#2563EB` (Royal Blue) — merepresentasikan keandalan, ketenangan, dan profesionalisme institusi pendidikan.
- **Secondary Accent**: `#0284C7` (Sky Blue) / `#0EA5E9` (Cyan Accent) — untuk state hover, badge aktif, dan highlight tombol sekunder.
- **Background**: `#F8FAFC` (Slate Ultra Light) untuk background utama yang nyaman di mata, dan `#FFFFFF` murni untuk card form penilaian.
- **Neutral / Text**: `#0F172A` (Slate 900) untuk teks tajam dengan kontras tinggi, `#475569` (Slate 600) untuk label sekunder.
- **Semantic Colors**:
  - Success: `#059669` (Emerald Green) untuk status "LULUS" dan tombol submit final.
  - Warning / Waiting List: `#D97706` (Amber Warm) untuk status "WAITING LIST".
  - Danger / Error: `#DC2626` (Crimson) untuk validasi error dan reset konfirmasi.

### B. Tipografi & Ergonomi Layar Sentuh Penguji
- **Font**: Inter / Plus Jakarta Sans — sans-serif modern dengan legibilitas tinggi pada angka dan teks arab transliterasi.
- **Touch Target Ergonomics**:
  - Tombol pilihan skala 1–4 pada rubrik kepesantrenan memiliki ukuran minimum **48x48 px** dengan *padding* empuk agar mudah ditekan jari tanpa salah pilih (*fat-finger proof*).
  - Indikator pilihan aktif memiliki visual highlight tebal (warna biru dengan *border ring* 2px).
  - Terdapat fitur **Auto-Save Draft** lokal setiap 5 detik agar nilai penguji tidak hilang saat jaringan wi-fi sekolah berfluktuasi.
