import { db } from '$lib/server/db';
import { candidates } from '$lib/server/db/schema';
import { getActiveWave, getCandidatesWithScores, calculateAndSaveParallelRankings } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Auto seed if empty
	const existing = await db.select().from(candidates);
	if (existing.length === 0) {
		await seedDatabase();
	}

	const activeWave = await getActiveWave();
	if (activeWave) {
		// Ensure rankings are calculated and saved
		const candidatesList = await getCandidatesWithScores(activeWave.id);
		const needsRanking = candidatesList.some((c) => !c.ranking);
		if (needsRanking && candidatesList.length > 0) {
			await calculateAndSaveParallelRankings(activeWave.id);
		}
	}

	const allWaves = await db.query.waves.findMany({
		orderBy: (w, { desc }) => [desc(w.testDate)]
	});

	const candidateList = await getCandidatesWithScores(activeWave?.id);

	return {
		activeWave,
		allWaves,
		candidates: candidateList
	};
};

export const actions: Actions = {
	recalculate: async ({ request }) => {
		const formData = await request.formData();
		const waveId = formData.get('waveId')?.toString();

		const activeWave = waveId ? null : await getActiveWave();
		const targetWaveId = waveId || activeWave?.id;

		if (!targetWaveId) {
			return { success: false, error: 'Gelombang seleksi tidak ditemukan' };
		}

		try {
			const result = await calculateAndSaveParallelRankings(targetWaveId);
			return { success: true, message: 'Pemeringkatan paralel berhasil dihitung ulang!', result };
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Gagal menghitung ulang ranking';
			return { success: false, error: errorMessage };
		}
	}
};
