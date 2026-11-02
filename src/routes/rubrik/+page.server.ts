import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { candidates, pesantrenScores } from '$lib/server/db/schema';
import { getCandidatesWithScores, savePesantrenScore } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { eq } from 'drizzle-orm';
import type { PesantrenInput } from '$lib/server/scoring';

export const load: PageServerLoad = async ({ url }) => {
	try {
		let allCandidates = await getCandidatesWithScores();

		if (allCandidates.length === 0) {
			await seedDatabase();
			allCandidates = await getCandidatesWithScores();
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
		console.error('Failed to load Rubrik data:', e);
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
		const examinerName = (data.get('examinerName') as string) || 'Ust. Nurul Huda, Lc.';
		const notes = (data.get('notes') as string) || '';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const hasMemorization = data.get('hasMemorization') === 'true';

		const input: PesantrenInput = {
			tahsinMakhraj: Number(data.get('tahsinMakhraj') || 1),
			tahsinTajwid: Number(data.get('tahsinTajwid') || 1),
			tahsinKelancaran: Number(data.get('tahsinKelancaran') || 1),
			tahsinAdab: Number(data.get('tahsinAdab') || 1),
			hasMemorization,
			tahfidzKelancaran: hasMemorization ? Number(data.get('tahfidzKelancaran') || 1) : undefined,
			tahfidzMurojaah: hasMemorization ? Number(data.get('tahfidzMurojaah') || 1) : undefined,
			tahfidzTarget: hasMemorization ? Number(data.get('tahfidzTarget') || 1) : undefined,
			tahfidzAdab: hasMemorization ? Number(data.get('tahfidzAdab') || 1) : undefined,

			kitabBacaGundul: Number(data.get('kitabBacaGundul') || 1),
			kitabNahwuShorof: Number(data.get('kitabNahwuShorof') || 1),
			kitabTerjemahPegon: Number(data.get('kitabTerjemahPegon') || 1),
			kitabIsi: Number(data.get('kitabIsi') || 1),

			bInggrisSpeaking: Number(data.get('bInggrisSpeaking') || 1),
			bInggrisPronunciation: Number(data.get('bInggrisPronunciation') || 1),
			bInggrisWriting: Number(data.get('bInggrisWriting') || 1),
			bInggrisVocab: Number(data.get('bInggrisVocab') || 1),

			bArabSpeaking: Number(data.get('bArabSpeaking') || 1),
			bArabPronunciation: Number(data.get('bArabPronunciation') || 1),
			bArabWriting: Number(data.get('bArabWriting') || 1),
			bArabVocab: Number(data.get('bArabVocab') || 1),

			haditsHafalan: Number(data.get('haditsHafalan') || 1),
			haditsKelancaran: Number(data.get('haditsKelancaran') || 1),
			haditsMakna: Number(data.get('haditsMakna') || 1),
			haditsAdab: Number(data.get('haditsAdab') || 1),

			adzanKelancaran: Number(data.get('adzanKelancaran') || 1),
			adzanMakhraj: Number(data.get('adzanMakhraj') || 1),
			adzanSuara: Number(data.get('adzanSuara') || 1),

			sholatKelancaran: Number(data.get('sholatKelancaran') || 1),
			sholatMakhraj: Number(data.get('sholatMakhraj') || 1),
			sholatAdab: Number(data.get('sholatAdab') || 1)
		};

		try {
			await savePesantrenScore(candidateId, input, examinerName, false, notes);
			return { success: true, message: 'Draf penilaian kepesantrenan berhasil disimpan' };
		} catch (e: any) {
			console.error('Error saving pesantren draft:', e);
			return fail(500, { error: e.message || 'Gagal menyimpan draf' });
		}
	},

	lockScore: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;
		const examinerName = (data.get('examinerName') as string) || 'Ust. Nurul Huda, Lc.';
		const notes = (data.get('notes') as string) || '';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const hasMemorization = data.get('hasMemorization') === 'true';

		const input: PesantrenInput = {
			tahsinMakhraj: Number(data.get('tahsinMakhraj') || 1),
			tahsinTajwid: Number(data.get('tahsinTajwid') || 1),
			tahsinKelancaran: Number(data.get('tahsinKelancaran') || 1),
			tahsinAdab: Number(data.get('tahsinAdab') || 1),
			hasMemorization,
			tahfidzKelancaran: hasMemorization ? Number(data.get('tahfidzKelancaran') || 1) : undefined,
			tahfidzMurojaah: hasMemorization ? Number(data.get('tahfidzMurojaah') || 1) : undefined,
			tahfidzTarget: hasMemorization ? Number(data.get('tahfidzTarget') || 1) : undefined,
			tahfidzAdab: hasMemorization ? Number(data.get('tahfidzAdab') || 1) : undefined,

			kitabBacaGundul: Number(data.get('kitabBacaGundul') || 1),
			kitabNahwuShorof: Number(data.get('kitabNahwuShorof') || 1),
			kitabTerjemahPegon: Number(data.get('kitabTerjemahPegon') || 1),
			kitabIsi: Number(data.get('kitabIsi') || 1),

			bInggrisSpeaking: Number(data.get('bInggrisSpeaking') || 1),
			bInggrisPronunciation: Number(data.get('bInggrisPronunciation') || 1),
			bInggrisWriting: Number(data.get('bInggrisWriting') || 1),
			bInggrisVocab: Number(data.get('bInggrisVocab') || 1),

			bArabSpeaking: Number(data.get('bArabSpeaking') || 1),
			bArabPronunciation: Number(data.get('bArabPronunciation') || 1),
			bArabWriting: Number(data.get('bArabWriting') || 1),
			bArabVocab: Number(data.get('bArabVocab') || 1),

			haditsHafalan: Number(data.get('haditsHafalan') || 1),
			haditsKelancaran: Number(data.get('haditsKelancaran') || 1),
			haditsMakna: Number(data.get('haditsMakna') || 1),
			haditsAdab: Number(data.get('haditsAdab') || 1),

			adzanKelancaran: Number(data.get('adzanKelancaran') || 1),
			adzanMakhraj: Number(data.get('adzanMakhraj') || 1),
			adzanSuara: Number(data.get('adzanSuara') || 1),

			sholatKelancaran: Number(data.get('sholatKelancaran') || 1),
			sholatMakhraj: Number(data.get('sholatMakhraj') || 1),
			sholatAdab: Number(data.get('sholatAdab') || 1)
		};

		try {
			await savePesantrenScore(candidateId, input, examinerName, true, notes);
			return { success: true, message: 'Nilai Rubrik Kepesantrenan berhasil dikunci!' };
		} catch (e: any) {
			console.error('Error locking pesantren score:', e);
			return fail(500, { error: e.message || 'Gagal mengunci nilai' });
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
				.update(pesantrenScores)
				.set({
					lockStatus: 'DRAFT',
					lockedAt: null,
					updatedAt: new Date()
				})
				.where(eq(pesantrenScores.candidateId, candidateId));

			return { success: true, message: 'Kunci nilai kepesantrenan telah dibuka' };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Gagal membuka kunci' });
		}
	}
};

