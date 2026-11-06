import { pgTable, text, integer, decimal, boolean, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Gelombang Seleksi (Waves)
export const waves = pgTable('waves', {
	id: uuid('id').defaultRandom().primaryKey(),
	waveName: text('wave_name').notNull(),
	academicYear: text('academic_year').notNull().default('2027/2028'),
	testDate: timestamp('test_date').notNull(),
	quotaCapacity: integer('quota_capacity').notNull().default(20),
	status: text('status').notNull().default('ACTIVE') // DRAFT, ACTIVE, CLOSED
});

// 2. Data Calon Santri / Peserta Seleksi
export const candidates = pgTable('candidates', {
	id: uuid('id').defaultRandom().primaryKey(),
	waveId: uuid('wave_id').references(() => waves.id, { onDelete: 'cascade' }),
	testNumber: text('test_number').notNull().unique(),
	fullName: text('full_name').notNull(),
	nisn: text('nisn'),
	schoolOrigin: text('school_origin').notNull(),
	majorChoice: text('major_choice').notNull(),
	roomAssignment: text('room_assignment').default('Ruang 1'),
	statusPipeline: text('status_pipeline').notNull().default('REGISTERED'), // REGISTERED, IN_TEST, COMPLETED
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. Skor Tes Potensi Akademik (TPA) - 12 Subtes (Max Poin Mentah 69)
export const tpaScores = pgTable('tpa_scores', {
	id: uuid('id').defaultRandom().primaryKey(),
	candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull().unique(),
	
	// Bahasa Indonesia (EYD, Kohesi/Koherensi, Logika, Analogi, Pemahaman Wacana)
	eydCorrect: integer('eyd_correct').default(0).notNull(), // max 3, weight 1 -> max 3
	kohesiCorrect: integer('kohesi_correct').default(0).notNull(), // max 3, weight 1 -> max 3
	logikaCorrect: integer('logika_correct').default(0).notNull(), // max 3, weight 2 -> max 6
	analogiCorrect: integer('analogi_correct').default(0).notNull(), // max 3, weight 2 -> max 6
	wacanaCorrect: integer('wacana_correct').default(0).notNull(), // max 3, weight 2 -> max 6

	// Matematika (Operasi Perhitungan, Dasar Bangun Ruang)
	mtkHitungCorrect: integer('mtk_hitung_correct').default(0).notNull(), // max 3, weight 3 -> max 9
	mtkRuangCorrect: integer('mtk_ruang_correct').default(0).notNull(), // max 3, weight 3 -> max 9

	// Kemampuan Bahasa (Inggris, Arab)
	bInggrisCorrect: integer('b_inggris_correct').default(0).notNull(), // max 3, weight 2 -> max 6
	bArabCorrect: integer('b_arab_correct').default(0).notNull(), // max 3, weight 2 -> max 6

	// Kemampuan Al-Qur'an (Tahfidz, Tahsin)
	tahfidzCorrect: integer('tahfidz_correct').default(0).notNull(), // max 3, weight 2 -> max 6
	tahsinCorrect: integer('tahsin_correct').default(0).notNull(), // max 3, weight 1 -> max 3

	// Karakter
	karakterCorrect: integer('karakter_correct').default(0).notNull(), // max 6, weight 1 -> max 6

	// Komputasi Skor Mentah & Normalisasi
	rawTotalScore: integer('raw_total_score').default(0).notNull(), // 0 - 69
	finalScore100: decimal('final_score_100', { precision: 5, scale: 2 }).default('0').notNull(), // 0 - 100
	category: text('category').default('Sangat Buruk').notNull(), // Sangat Buruk, Buruk, Sedang, Baik, Sangat Baik

	// Metadata Pengunci
	lockStatus: text('lock_status').default('DRAFT').notNull(), // DRAFT, LOCKED
	examinerName: text('examiner_name'),
	lockedAt: timestamp('locked_at'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 4. Skor Rubrik Kepesantrenan (7 Bidang Uji, Skala 1-4 mapped to 100)
export const pesantrenScores = pgTable('pesantren_scores', {
	id: uuid('id').defaultRandom().primaryKey(),
	candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull().unique(),

	// 1. Tahsin & Tahfidz
	tahsinScore: decimal('tahsin_score', { precision: 5, scale: 2 }).default('0').notNull(),
	hasMemorization: boolean('has_memorization').default(false).notNull(),
	tahfidzScore: decimal('tahfidz_score', { precision: 5, scale: 2 }).default('0').notNull(),
	combinedQuranScore: decimal('combined_quran_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 2. Kitab Kuning
	kitabKuningScore: decimal('kitab_kuning_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 3. Bahasa Inggris
	bInggrisScore: decimal('b_inggris_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 4. Bahasa Arab
	bArabScore: decimal('b_arab_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 5. Hadits
	haditsScore: decimal('hadits_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 6. Adzan
	adzanScore: decimal('adzan_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// 7. Bacaan Sholat
	sholatScore: decimal('sholat_score', { precision: 5, scale: 2 }).default('0').notNull(),

	// Rata-rata Total 7 Bidang
	averageScore: decimal('average_score', { precision: 5, scale: 2 }).default('0').notNull(),
	notes: text('notes'),

	// Status Penguncian
	lockStatus: text('lock_status').default('DRAFT').notNull(),
	examinerName: text('examiner_name'),
	lockedAt: timestamp('locked_at'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 5. Wawancara Kualitatif (26 Butir Pertanyaan Dokumen TES WAWANCARA.docx)
export const qualitativeInterviews = pgTable('qualitative_interviews', {
	id: uuid('id').defaultRandom().primaryKey(),
	candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull().unique(),
	
	// Payload Lengkap JSONB (Menyimpan seluruh detail jawaban 26 butir form)
	formData: jsonb('form_data').notNull().default({}),
	
	// Ringkasan Teks
	studentGeneralSummary: text('student_general_summary'),
	studentPesantrenSummary: text('student_pesantren_summary'),
	parentCommitmentSummary: text('parent_commitment_summary'),
	specialRecommendation: text('special_recommendation'),

	interviewerName: text('interviewer_name'),
	completionStatus: text('completion_status').default('NOT_STARTED').notNull(), // NOT_STARTED, IN_PROGRESS, COMPLETED
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 6. Final Rankings & Keputusan Kelulusan Pleno
export const finalRankings = pgTable('final_rankings', {
	id: uuid('id').defaultRandom().primaryKey(),
	candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull().unique(),
	waveId: uuid('wave_id').references(() => waves.id, { onDelete: 'cascade' }).notNull(),

	compositeScore: decimal('composite_score', { precision: 5, scale: 2 }).default('0').notNull(),
	rankTpa: integer('rank_tpa').default(0).notNull(),
	rankPesantren: integer('rank_pesantren').default(0).notNull(),
	rankParallel: integer('rank_parallel').default(0).notNull(),

	admissionStatus: text('admission_status').default('WAITING_LIST').notNull(), // LULUS, WAITING_LIST
	overrideReason: text('override_reason'),
	approvedBy: text('approved_by'),
	decidedAt: timestamp('decided_at')
});

// 7. Audit Logs
export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'set null' }),
	userName: text('user_name').notNull(),
	actionType: text('action_type').notNull(),
	details: text('details'),
	ipAddress: text('ip_address'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 8. Master Data Jurusan Pilihan (Majors)
export const majors = pgTable('majors', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull().unique(), // e.g. Rekayasa Perangkat Lunak
	code: text('code').notNull().unique(), // e.g. RPL
	description: text('description'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 9. Master Data Alokasi Ruang Ujian (Exam Rooms)
export const examRooms = pgTable('exam_rooms', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull().unique(), // e.g. Ruang 1 (Lab RPL)
	capacity: integer('capacity').default(30).notNull(),
	location: text('location'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 10. Pengguna & Autentikasi Penguji / Admin (Users)
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role').notNull().default('SUPER_ADMIN'), // SUPER_ADMIN, EXAMINER_TPA, EXAMINER_PESANTREN, INTERVIEWER
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const wavesRelations = relations(waves, ({ many }) => ({
	candidates: many(candidates),
	finalRankings: many(finalRankings)
}));

export const candidatesRelations = relations(candidates, ({ one }) => ({
	wave: one(waves, { fields: [candidates.waveId], references: [waves.id] }),
	tpaScore: one(tpaScores, { fields: [candidates.id], references: [tpaScores.candidateId] }),
	pesantrenScore: one(pesantrenScores, { fields: [candidates.id], references: [pesantrenScores.candidateId] }),
	interview: one(qualitativeInterviews, { fields: [candidates.id], references: [qualitativeInterviews.candidateId] }),
	ranking: one(finalRankings, { fields: [candidates.id], references: [finalRankings.candidateId] })
}));
