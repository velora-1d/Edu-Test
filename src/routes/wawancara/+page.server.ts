import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { qualitativeInterviews } from '$lib/server/db/schema';
import { getCandidatesWithScores, saveInterview } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { eq } from 'drizzle-orm';

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
		console.error('Failed to load Wawancara data:', e);
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
		const interviewerName = (data.get('interviewerName') as string) || 'Dra. Hj. Siti Aminah';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const rawFormDataStr = data.get('formDataJson') as string;
		let formData: Record<string, unknown> = {};
		if (rawFormDataStr) {
			try {
				formData = JSON.parse(rawFormDataStr);
			} catch {
				formData = {};
			}
		}

		const summaries = {
			studentGeneral: (data.get('studentGeneralSummary') as string) || null,
			studentPesantren: (data.get('studentPesantrenSummary') as string) || null,
			parentCommitment: (data.get('parentCommitmentSummary') as string) || null,
			specialRecommendation: (data.get('specialRecommendation') as string) || null
		};

		try {
			await saveInterview(candidateId, formData, summaries, interviewerName, false);
			return { success: true, message: 'Draf wawancara kualitatif berhasil disimpan' };
		} catch (e: any) {
			console.error('Error saving interview draft:', e);
			return fail(500, { error: e.message || 'Gagal menyimpan draf wawancara' });
		}
	},

	complete: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;
		const interviewerName = (data.get('interviewerName') as string) || 'Dra. Hj. Siti Aminah';

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		const rawFormDataStr = data.get('formDataJson') as string;
		let formData: Record<string, unknown> = {};
		if (rawFormDataStr) {
			try {
				formData = JSON.parse(rawFormDataStr);
			} catch {
				formData = {};
			}
		}

		const summaries = {
			studentGeneral: (data.get('studentGeneralSummary') as string) || null,
			studentPesantren: (data.get('studentPesantrenSummary') as string) || null,
			parentCommitment: (data.get('parentCommitmentSummary') as string) || null,
			specialRecommendation: (data.get('specialRecommendation') as string) || null
		};

		try {
			await saveInterview(candidateId, formData, summaries, interviewerName, true);
			return { success: true, message: 'Dossier wawancara kualitatif berhasil ditandai selesai!' };
		} catch (e: any) {
			console.error('Error completing interview:', e);
			return fail(500, { error: e.message || 'Gagal menandai wawancara selesai' });
		}
	},

	reopen: async ({ request }) => {
		const data = await request.formData();
		const candidateId = data.get('candidateId') as string;

		if (!candidateId) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		try {
			await db
				.update(qualitativeInterviews)
				.set({
					completionStatus: 'IN_PROGRESS',
					updatedAt: new Date()
				})
				.where(eq(qualitativeInterviews.candidateId, candidateId));

			return { success: true, message: 'Wawancara kembali dibuka untuk pengeditan' };
		} catch (e: any) {
			return fail(500, { error: e.message || 'Gagal membuka kembali wawancara' });
		}
	}
};

