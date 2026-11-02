import { db } from '$lib/server/db';
import { candidates, waves } from '$lib/server/db/schema';
import { getActiveWave, getCandidatesWithScores, calculateAndSaveParallelRankings, getMajors } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { eq } from 'drizzle-orm';
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

	const [candidateList, majorList] = await Promise.all([
		getCandidatesWithScores(activeWave?.id),
		getMajors()
	]);

	return {
		activeWave,
		allWaves,
		candidates: candidateList,
		majors: majorList
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
	},

	updateQuota: async ({ request }) => {
		const formData = await request.formData();
		const waveId = formData.get('waveId')?.toString();
		const quota = parseInt(formData.get('quota')?.toString() || '20', 10);

		const activeWave = waveId ? null : await getActiveWave();
		const targetWaveId = waveId || activeWave?.id;

		if (!targetWaveId) {
			return { success: false, error: 'Gelombang seleksi tidak ditemukan' };
		}

		try {
			await db.update(waves).set({ quotaCapacity: quota }).where(eq(waves.id, targetWaveId));
			await calculateAndSaveParallelRankings(targetWaveId);
			return { success: true, message: `Kuota kelulusan berhasil diperbarui menjadi ${quota} santri!` };
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui kuota kelulusan';
			return { success: false, error: errorMessage };
		}
	}
};
