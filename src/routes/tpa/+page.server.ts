import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { candidates, tpaScores } from '$lib/server/db/schema';
import { calculateTpaScore } from '$lib/server/scoring';
import { eq, asc } from 'drizzle-orm';
import { seedDatabase } from '$lib/server/seed';

export const load: PageServerLoad = async ({ url }) => {
	try {
		let allCandidates = await db.query.candidates.findMany({
			orderBy: [asc(candidates.testNumber)],
			with: {
				tpaScore: true
			}
		});

		// Auto seed if empty so examiner has test candidates immediately
		if (allCandidates.length === 0) {
			await seedDatabase();
			allCandidates = await db.query.candidates.findMany({
				orderBy: [asc(candidates.testNumber)],
				with: {
					tpaScore: true
				}
			});
		}

		const candidateIdParam = url.searchParams.get('candidateId');
		let selectedCandidate = null;

		if (candidateIdParam) {
			selectedCandidate = allCandidates.find((c) => c.id === candidateIdParam) || null;
		}

		if (!selectedCandidate && allCandidates.length > 0) {
			selectedCandidate = allCandidates[0];
		}

		return {
			candidates: allCandidates,
			selectedCandidate
		};
	} catch (e: any) {
		console.error('Failed to load TPA data:', e);
		return {
			candidates: [],
			selectedCandidate: null,
			error: e.message || 'Gagal memuat data'
		};
	}
};

export const actions: Actions = {
	saveDraft: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;
		const examinerName = (data.get('examinerName') as string) || 'Penguji TPA';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const eyd = Number(data.get('eydCorrect') || 0);
		const kohesi = Number(data.get('kohesiCorrect') || 0);
		const logika = Number(data.get('logikaCorrect') || 0);
		const analogi = Number(data.get('analogiCorrect') || 0);
		const wacana = Number(data.get('wacanaCorrect') || 0);
		const mtkHitung = Number(data.get('mtkHitungCorrect') || 0);
		const mtkRuang = Number(data.get('mtkRuangCorrect') || 0);
		const bInggris = Number(data.get('bInggrisCorrect') || 0);
		const bArab = Number(data.get('bArabCorrect') || 0);
		const tahfidz = Number(data.get('tahfidzCorrect') || 0);
		const tahsin = Number(data.get('tahsinCorrect') || 0);
		const karakter = Number(data.get('karakterCorrect') || 0);

		const result = calculateTpaScore({
			eyd,
			kohesi,
			logika,
			analogi,
			wacana,
			mtkHitung,
			mtkRuang,
			bInggris,
			bArab,
			tahfidz,
			tahsin,
			karakter
		});

		try {
			const existing = await db.query.tpaScores.findFirst({
				where: eq(tpaScores.candidateId, candidateId)
			});

			if (existing) {
				await db
					.update(tpaScores)
					.set({
						eydCorrect: eyd,
						kohesiCorrect: kohesi,
						logikaCorrect: logika,
						analogiCorrect: analogi,
						wacanaCorrect: wacana,
						mtkHitungCorrect: mtkHitung,
						mtkRuangCorrect: mtkRuang,
						bInggrisCorrect: bInggris,
						bArabCorrect: bArab,
						tahfidzCorrect: tahfidz,
						tahsinCorrect: tahsin,
						karakterCorrect: karakter,
						rawTotalScore: result.rawTotal,
						finalScore100: result.finalScore100.toString(),
						category: result.category,
						lockStatus: 'DRAFT',
						examinerName,
						updatedAt: new Date()
					})
					.where(eq(tpaScores.candidateId, candidateId));
			} else {
				await db.insert(tpaScores).values({
					candidateId,
					eydCorrect: eyd,
					kohesiCorrect: kohesi,
					logikaCorrect: logika,
					analogiCorrect: analogi,
					wacanaCorrect: wacana,
					mtkHitungCorrect: mtkHitung,
					mtkRuangCorrect: mtkRuang,
					bInggrisCorrect: bInggris,
					bArabCorrect: bArab,
					tahfidzCorrect: tahfidz,
					tahsinCorrect: tahsin,
					karakterCorrect: karakter,
					rawTotalScore: result.rawTotal,
					finalScore100: result.finalScore100.toString(),
					category: result.category,
					lockStatus: 'DRAFT',
					examinerName,
					updatedAt: new Date()
				});
			}

			return { success: true, message: 'Draf nilai TPA berhasil disimpan' };
		} catch (e: any) {
			console.error('Error saving TPA draft:', e);
			return fail(500, { error: e.message || 'Gagal menyimpan draf TPA' });
		}
	},

	lockScore: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;
		const examinerName = (data.get('examinerName') as string) || 'Penguji TPA';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const eyd = Number(data.get('eydCorrect') || 0);
		const kohesi = Number(data.get('kohesiCorrect') || 0);
		const logika = Number(data.get('logikaCorrect') || 0);
		const analogi = Number(data.get('analogiCorrect') || 0);
		const wacana = Number(data.get('wacanaCorrect') || 0);
		const mtkHitung = Number(data.get('mtkHitungCorrect') || 0);
		const mtkRuang = Number(data.get('mtkRuangCorrect') || 0);
		const bInggris = Number(data.get('bInggrisCorrect') || 0);
		const bArab = Number(data.get('bArabCorrect') || 0);
		const tahfidz = Number(data.get('tahfidzCorrect') || 0);
		const tahsin = Number(data.get('tahsinCorrect') || 0);
		const karakter = Number(data.get('karakterCorrect') || 0);

		const result = calculateTpaScore({
			eyd,
			kohesi,
			logika,
			analogi,
			wacana,
			mtkHitung,
			mtkRuang,
			bInggris,
			bArab,
			tahfidz,
			tahsin,
			karakter
		});

		try {
			const existing = await db.query.tpaScores.findFirst({
				where: eq(tpaScores.candidateId, candidateId)
			});

			if (existing) {
				await db
					.update(tpaScores)
					.set({
						eydCorrect: eyd,
						kohesiCorrect: kohesi,
						logikaCorrect: logika,
						analogiCorrect: analogi,
						wacanaCorrect: wacana,
						mtkHitungCorrect: mtkHitung,
						mtkRuangCorrect: mtkRuang,
						bInggrisCorrect: bInggris,
						bArabCorrect: bArab,
						tahfidzCorrect: tahfidz,
						tahsinCorrect: tahsin,
						karakterCorrect: karakter,
						rawTotalScore: result.rawTotal,
						finalScore100: result.finalScore100.toString(),
						category: result.category,
						lockStatus: 'LOCKED',
						examinerName,
						lockedAt: new Date(),
						updatedAt: new Date()
					})
					.where(eq(tpaScores.candidateId, candidateId));
			} else {
				await db.insert(tpaScores).values({
					candidateId,
					eydCorrect: eyd,
					kohesiCorrect: kohesi,
					logikaCorrect: logika,
					analogiCorrect: analogi,
					wacanaCorrect: wacana,
					mtkHitungCorrect: mtkHitung,
					mtkRuangCorrect: mtkRuang,
					bInggrisCorrect: bInggris,
					bArabCorrect: bArab,
					tahfidzCorrect: tahfidz,
					tahsinCorrect: tahsin,
					karakterCorrect: karakter,
					rawTotalScore: result.rawTotal,
					finalScore100: result.finalScore100.toString(),
					category: result.category,
					lockStatus: 'LOCKED',
					examinerName,
					lockedAt: new Date(),
					updatedAt: new Date()
				});
			}

			// Update candidate status to IN_TEST
			await db
				.update(candidates)
				.set({ statusPipeline: 'IN_TEST' })
				.where(eq(candidates.id, candidateId));

			return { success: true, message: 'Nilai TPA berhasil dikunci secara permanen!' };
		} catch (e: any) {
			console.error('Error locking TPA score:', e);
			return fail(500, { error: e.message || 'Gagal mengunci nilai TPA' });
		}
	},

	unlockScore: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		try {
			await db
				.update(tpaScores)
				.set({
					lockStatus: 'DRAFT',
					lockedAt: null,
					updatedAt: new Date()
				})
				.where(eq(tpaScores.candidateId, candidateId));

			return { success: true, message: 'Kunci nilai TPA telah dibuka ke mode draf' };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Gagal membuka kunci' });
		}
	}
};

