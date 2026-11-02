import { z } from 'zod';

/**
 * Utility untuk sanitasi teks bebas:
 * - Menghapus tag script & style beserta isinya
 * - Menghapus seluruh tag HTML lainnya
 * - Menghapus karakter kontrol berbahaya (kecuali newline dan tab)
 * - Menghilangkan spasi ekstra (trim)
 */
export function sanitizeText(input: unknown): string {
	if (typeof input !== 'string') return '';
	return input
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<[^>]*>?/gm, '')
		.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')
		.trim();
}

/**
 * Schema helper untuk string yang tersanitasi otomatis dengan limit karakter
 */
export const sanitizedString = (maxLength = 2000) =>
	z
		.string()
		.max(maxLength, { message: `Teks tidak boleh melebihi ${maxLength} karakter` })
		.transform((val) => sanitizeText(val));

// ==========================================
// 1. Skema Validasi Skor TPA
// ==========================================
const subtestScoreSchema = z
	.number({ message: 'Nilai subtes harus berupa angka' })
	.int({ message: 'Nilai subtes harus bilangan bulat' })
	.min(0, { message: 'Nilai minimal 0' })
	.max(3, { message: 'Nilai maksimal 3 untuk subtes ini' });

const characterScoreSchema = z
	.number({ message: 'Nilai karakter harus berupa angka' })
	.int({ message: 'Nilai karakter harus bilangan bulat' })
	.min(0, { message: 'Nilai minimal 0' })
	.max(6, { message: 'Nilai maksimal karakter adalah 6' });

export const tpaInputSchema = z.object({
	// Bahasa Indonesia (max 3 per subtes)
	eyd: subtestScoreSchema.default(0),
	kohesi: subtestScoreSchema.default(0),
	logika: subtestScoreSchema.default(0),
	analogi: subtestScoreSchema.default(0),
	wacana: subtestScoreSchema.default(0),

	// Matematika (max 3 per subtes)
	mtkHitung: subtestScoreSchema.default(0),
	mtkRuang: subtestScoreSchema.default(0),

	// Bahasa Asing (max 3 per subtes)
	bInggris: subtestScoreSchema.default(0),
	bArab: subtestScoreSchema.default(0),

	// Al-Qur'an (max 3 per subtes)
	tahfidz: subtestScoreSchema.default(0),
	tahsin: subtestScoreSchema.default(0),

	// Karakter (max 6)
	karakter: characterScoreSchema.default(0)
});

export const saveTpaRequestSchema = z.object({
	candidateId: z.string().uuid({ message: 'candidateId harus berupa UUID yang valid' }),
	input: tpaInputSchema,
	examinerName: z.string().max(255).optional().nullable(),
	isLock: z.boolean().default(false)
});

export type TpaInputSchemaType = z.infer<typeof tpaInputSchema>;
export type SaveTpaRequest = z.infer<typeof saveTpaRequestSchema>;

// ==========================================
// 2. Skema Validasi Rubrik Kepesantrenan
// ==========================================
const rubricScoreSchema = z
	.number({ message: 'Nilai kriteria harus berupa angka' })
	.int({ message: 'Nilai kriteria harus bilangan bulat' })
	.min(1, { message: 'Skala rubrik minimal 1' })
	.max(4, { message: 'Skala rubrik maksimal 4' });

export const pesantrenInputSchema = z.object({
	// 1. Tahsin & Tahfidz
	tahsinMakhraj: rubricScoreSchema,
	tahsinTajwid: rubricScoreSchema,
	tahsinKelancaran: rubricScoreSchema,
	tahsinAdab: rubricScoreSchema,
	hasMemorization: z.boolean().default(false),
	tahfidzKelancaran: rubricScoreSchema.optional().nullable(),
	tahfidzMurojaah: rubricScoreSchema.optional().nullable(),
	tahfidzTarget: rubricScoreSchema.optional().nullable(),
	tahfidzAdab: rubricScoreSchema.optional().nullable(),

	// 2. Kitab Kuning
	kitabBacaGundul: rubricScoreSchema,
	kitabNahwuShorof: rubricScoreSchema,
	kitabTerjemahPegon: rubricScoreSchema,
	kitabIsi: rubricScoreSchema,

	// 3. Bahasa Inggris
	bInggrisSpeaking: rubricScoreSchema,
	bInggrisPronunciation: rubricScoreSchema,
	bInggrisWriting: rubricScoreSchema,
	bInggrisVocab: rubricScoreSchema,

	// 4. Bahasa Arab
	bArabSpeaking: rubricScoreSchema,
	bArabPronunciation: rubricScoreSchema,
	bArabWriting: rubricScoreSchema,
	bArabVocab: rubricScoreSchema,

	// 5. Hadits
	haditsHafalan: rubricScoreSchema,
	haditsKelancaran: rubricScoreSchema,
	haditsMakna: rubricScoreSchema,
	haditsAdab: rubricScoreSchema,

	// 6. Adzan
	adzanKelancaran: rubricScoreSchema,
	adzanMakhraj: rubricScoreSchema,
	adzanSuara: rubricScoreSchema,

	// 7. Bacaan Sholat
	sholatKelancaran: rubricScoreSchema,
	sholatMakhraj: rubricScoreSchema,
	sholatAdab: rubricScoreSchema
});

export const savePesantrenRequestSchema = z.object({
	candidateId: z.string().uuid({ message: 'candidateId harus berupa UUID yang valid' }),
	input: pesantrenInputSchema,
	notes: sanitizedString(2000).optional().nullable(),
	examinerName: z.string().max(255).optional().nullable(),
	isLock: z.boolean().default(false)
});

export type PesantrenInputSchemaType = z.infer<typeof pesantrenInputSchema>;
export type SavePesantrenRequest = z.infer<typeof savePesantrenRequestSchema>;

// ==========================================
// 3. Skema Validasi Wawancara Kualitatif
// ==========================================
export const interviewSummariesSchema = z.object({
	studentGeneral: sanitizedString(5000).optional().nullable(),
	studentPesantren: sanitizedString(5000).optional().nullable(),
	parentCommitment: sanitizedString(5000).optional().nullable(),
	specialRecommendation: sanitizedString(5000).optional().nullable()
});

export const saveInterviewRequestSchema = z.object({
	candidateId: z.string().uuid({ message: 'candidateId harus berupa UUID yang valid' }),
	// formData berisi 26 butir jawaban form kualitatif (teks tersanitasi, boolean, number)
	formData: z.record(z.string(), z.unknown()).default({}),
	summaries: interviewSummariesSchema.optional(),
	studentGeneralSummary: sanitizedString(5000).optional().nullable(),
	studentPesantrenSummary: sanitizedString(5000).optional().nullable(),
	parentCommitmentSummary: sanitizedString(5000).optional().nullable(),
	specialRecommendation: sanitizedString(5000).optional().nullable(),
	interviewerName: z.string().max(255).optional().nullable(),
	isCompleted: z.boolean().default(false)
});

export type InterviewSummariesType = z.infer<typeof interviewSummariesSchema>;
export type SaveInterviewRequest = z.infer<typeof saveInterviewRequestSchema>;
