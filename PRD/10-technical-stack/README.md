# 10. Technical Stack & Architecture Specification (SvelteKit Fullstack + PostgreSQL)

## 10.1 Arsitektur Unified Fullstack: SvelteKit + PostgreSQL

Sistem **Edu-Test** dibangun dengan pendekatan arsitektur **Unified Fullstack** menggunakan **SvelteKit** dan basis data relasional **PostgreSQL**. Pilihan ini memberikan efisiensi tinggi, bundle size ultra-ringan pada tablet penguji, reaktivitas instan tanpa overhead virtual DOM, serta integritas data ACID yang kokoh untuk kalkulasi skor dan pemeringkatan paralel.

```mermaid
graph TD
    subgraph ClientLayer["Frontend: Svelte 5 Client (Tablet / Desktop)"]
        UI["Svelte 5 Reactive UI (Runes: $state, $derived)"]
        CacheState["LocalStorage / Service Worker (Offline Autosave Draft)"]
        UI <--> CacheState
    end

    subgraph AppLayer["Unified Backend: SvelteKit Application Server"]
        FormAction["SvelteKit Form Actions (+page.server.ts)"]
        APIEndpoints["Server Endpoints (+server.ts)"]
        ScoringCore["Server-Side Scoring & Ranking Engine"]
        ZodValidator["Zod Schema Validator (Tamper Proof)"]
        
        FormAction & APIEndpoints --> ZodValidator
        ZodValidator --> ScoringCore
    end

    subgraph DataLayer["Persistence Layer: PostgreSQL RDBMS"]
        ORM["Type-Safe ORM: Drizzle ORM / Prisma"]
        Pool["pg-pool (Connection Pooler)"]
        PG[("PostgreSQL Database (ACID, Triggers & Views)")]
        
        ScoringCore --> ORM
        ORM --> Pool
        Pool --> PG
    end

    subgraph WorkerLayer["Export & Document Engine"]
        ExcelWorker["ExcelJS (Multi-Sheet Ledger .xlsx)"]
        PDFWorker["Puppeteer / Typst PDF Generator (SK Kelulusan)"]
        ScoringCore --> ExcelWorker & PDFWorker
    end

    UI -->|Progressive Enhancement / Fetch| FormAction
    UI -->|Async Autosave REST| APIEndpoints
```

---

## 10.2 Rincian Komponen Teknologi

| Lapisan | Teknologi | Versi Target | Alasan Pemilihan & Peran |
|---|---|---|---|
| **Fullstack Framework** | **SvelteKit** | 2.x (Svelte 5) | Menyatukan frontend dan backend dalam 1 codebase TypeScript, native server actions, performa reaktivitas tinggi tanpa VDOM |
| **Reaktivitas UI** | **Svelte 5 Runes** | 5.x (`$state`, `$derived`, `$effect`) | Kalkulasi real-time saat penguji mengetuk tombol skala 1–4, debounce autosave efisien di tablet |
| **Database** | **PostgreSQL** | 16+ | Dukungan transaksi ACID, indexing multi-kolom untuk ranking paralel, integritas foreign keys, dan field JSONB audit |
| **ORM & Migrations** | **Drizzle ORM** *(atau Prisma)* | Latest | Type-safe query builder, migrasi skema otomatis, zero runtime overhead, dan integrasi native dengan driver `pg` |
| **Validasi Skema** | **Zod** | 3.x | Validasi input batas jumlah benar TPA dan skala 1-4 rubrik di server-side sebelum masuk database |
| **Styling & Theme** | **Tailwind CSS** | 3.4+ / 4.x | Utilitas styling responsif, ergonomi sentuh tablet, tema *Deep Ocean Blue* (menghindari ungu) |
| **Export Generator** | **ExcelJS & PDFKit/Puppeteer** | Latest | Ekspor master ledger multi-sheet dan pencetakan surat kelulusan resmi dengan kop sekolah |

---

## 10.3 Skema Basis Data PostgreSQL (DDL & Entity Relationships)

```mermaid
erDiagram
    WAVES ||--o{ CANDIDATES : "memiliki"
    CANDIDATES ||--o| TPA_SCORES : "memiliki"
    CANDIDATES ||--o| PESANTREN_SCORES : "memiliki"
    CANDIDATES ||--o| QUALITATIVE_INTERVIEWS : "memiliki"
    CANDIDATES ||--o| FINAL_RANKINGS : "memiliki"
    CANDIDATES ||--o{ AUDIT_LOGS : "mencatat"

    WAVES {
        uuid id PK
        string wave_name
        date test_date
        integer quota_capacity
        string status
    }

    CANDIDATES {
        uuid id PK
        uuid wave_id FK
        string test_number UK
        string full_name
        string nisn
        string school_origin
        string major_choice
        string room_assignment
        string status_pipeline
        timestamp created_at
    }

    TPA_SCORES {
        uuid id PK
        uuid candidate_id FK
        integer eyd_score
        integer kohesi_score
        integer logika_score
        integer analogi_score
        integer wacana_score
        integer mtk_hitung_score
        integer mtk_ruang_score
        integer b_inggris_score
        integer b_arab_score
        integer tahfidz_score
        integer tahsin_score
        integer karakter_score
        integer raw_total_score
        decimal final_score_100
        string category
        string lock_status
        uuid examiner_id
        timestamp locked_at
    }

    PESANTREN_SCORES {
        uuid id PK
        uuid candidate_id FK
        decimal tahsin_score
        boolean has_memorization
        decimal tahfidz_score
        decimal combined_quran_score
        decimal kitab_kuning_score
        decimal b_inggris_score
        decimal b_arab_score
        decimal hadits_score
        decimal adzan_score
        decimal sholat_score
        decimal average_pesantren_score
        string lock_status
        uuid examiner_id
        timestamp locked_at
    }

    QUALITATIVE_INTERVIEWS {
        uuid id PK
        uuid candidate_id FK
        text student_general_notes
        text student_pesantren_notes
        text parent_commitment_notes
        text special_recommendation
        uuid interviewer_id
        timestamp updated_at
    }

    FINAL_RANKINGS {
        uuid id PK
        uuid candidate_id FK
        uuid wave_id FK
        decimal composite_score
        integer rank_tpa
        integer rank_pesantren
        integer rank_parallel
        string admission_status
        text override_reason
        uuid approved_by
        timestamp decided_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid candidate_id FK
        uuid user_id
        string action_type
        jsonb old_values
        jsonb new_values
        string ip_address
        timestamp created_at
    }
```

---

## 10.4 Pola Implementasi SvelteKit

### 1. Server Actions (`+page.server.ts`)
Setiap form submission (seperti penguncian nilai TPA, rubrik kepesantrenan, dan penetapan kuota pleno) diproses melalui **SvelteKit Form Actions**:
- **Progressive Enhancement**: Form tetap dapat bekerja dengan fallback standar browser dan di-enhance oleh `enhance` SvelteKit tanpa full page reload.
- **CSRF Protection**: Proteksi bawaan dari SvelteKit terhadap serangan *Cross-Site Request Forgery*.
- **Direct Database Transaction**: Eksekusi penyimpanan nilai dan kalkulasi skor dalam satu transaksi PostgreSQL `BEGIN ... COMMIT` untuk memastikan atomisitas.

### 2. Svelte 5 Runes untuk Ergonomi Tablet
- **`$state`**: Menyimpan nilai instrumen aktif dan status tombol pilihan skala 1–4.
- **`$derived`**: Menghitung pratinjau skor mentah dan konversi skala 100 secara instan di sisi klien sebelum penguji menekan submit final.
- **`$effect`**: Menjalankan mekanisme debounced *autosave* ke endpoint `+server.ts` setiap jeda 5 detik saat penguji mengetik teks narasi wawancara.

### 3. PostgreSQL Query Optimization untuk Ranking
Pemeringkatan paralel dihitung efisien menggunakan fitur *Window Functions* native PostgreSQL:
```sql
SELECT 
    c.id AS candidate_id,
    c.test_number,
    c.full_name,
    t.final_score_100 AS tpa_score,
    p.average_pesantren_score AS pesantren_score,
    ROUND((t.final_score_100 + p.average_pesantren_score) / 2.0, 2) AS composite_score,
    DENSE_RANK() OVER (ORDER BY t.final_score_100 DESC) AS rank_tpa,
    DENSE_RANK() OVER (ORDER BY p.average_pesantren_score DESC) AS rank_pesantren,
    DENSE_RANK() OVER (
        ORDER BY 
            ROUND((t.final_score_100 + p.average_pesantren_score) / 2.0, 2) DESC,
            p.average_pesantren_score DESC,
            t.final_score_100 DESC,
            c.created_at ASC
    ) AS rank_parallel
FROM candidates c
JOIN tpa_scores t ON t.candidate_id = c.id
JOIN pesantren_scores p ON p.candidate_id = c.id
WHERE c.wave_id = $1;
```
