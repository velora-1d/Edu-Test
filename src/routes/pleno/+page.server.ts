import { db } from '$lib/server/db';
import { candidates, waves, finalRankings, auditLogs } from '$lib/server/db/schema';
import { getActiveWave, getCandidatesWithScores, calculateAndSaveParallelRankings } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Auto seed if empty
	const existing = await db.select().from(candidates);
	if (existing.length === 0) {
		await seedDatabase();
	}

	const activeWave = await getActiveWave();
	if (activeWave) {
		const candidateList = await getCandidatesWithScores(activeWave.id);
		const needsRanking = candidateList.some((c) => !c.ranking);
		if (needsRanking && candidateList.length > 0) {
			await calculateAndSaveParallelRankings(activeWave.id);
		}
	}

	const candidateList = await getCandidatesWithScores(activeWave?.id);

	// Sorted by parallel ranking
	const sortedByRank = [...candidateList].sort(
		(a, b) => (a.ranking?.rankParallel || 999) - (b.ranking?.rankParallel || 999)
	);

	return {
		activeWave,
		quotaCapacity: activeWave?.quotaCapacity || 15,
		candidates: sortedByRank
	};
};

export const actions: Actions = {
	savePleno: async ({ request }) => {
		const formData = await request.formData();
		const waveId = formData.get('waveId')?.toString();
		const quotaCapacityStr = formData.get('quotaCapacity')?.toString();
		const approvedBy = formData.get('approvedBy')?.toString() || 'Pimpinan Sidang Pleno PPDB';
		const overridesJson = formData.get('overrides')?.toString() || '{}';

		const activeWave = waveId ? null : await getActiveWave();
		const targetWaveId = waveId || activeWave?.id;

		if (!targetWaveId) {
			return { success: false, error: 'Gelombang aktif tidak ditemukan' };
		}

		const quotaCapacity = parseInt(quotaCapacityStr || '15', 10);

		try {
			let overrides: Record<string, { status: string; reason: string }> = {};
			try {
				overrides = JSON.parse(overridesJson);
			} catch {
				overrides = {};
			}

			// Update wave quota capacity if changed
			await db
				.update(waves)
				.set({ quotaCapacity })
				.where(eq(waves.id, targetWaveId));

			// Fetch candidates in target wave
			const candidateList = await getCandidatesWithScores(targetWaveId);
			const sortedByRank = [...candidateList].sort(
				(a, b) => (a.ranking?.rankParallel || 999) - (b.ranking?.rankParallel || 999)
			);

			let lulusTotal = 0;
			let waitingTotal = 0;

			for (let i = 0; i < sortedByRank.length; i++) {
				const c = sortedByRank[i];
				const rank = c.ranking?.rankParallel || i + 1;
				const override = overrides[c.id];

				let admissionStatus = rank <= quotaCapacity ? 'LULUS' : 'WAITING_LIST';
				let overrideReason: string | null = null;

				if (override && override.status) {
					admissionStatus = override.status;
					overrideReason = override.reason || 'Override keputusan pimpinan sidang pleno';
				}

				if (admissionStatus === 'LULUS') lulusTotal++;
				else waitingTotal++;

				if (c.ranking) {
					await db
						.update(finalRankings)
						.set({
							admissionStatus,
							overrideReason,
							approvedBy,
							decidedAt: new Date()
						})
						.where(eq(finalRankings.candidateId, c.id));
				}
			}

			// Audit Log
			await db.insert(auditLogs).values({
				userName: approvedBy,
				actionType: 'PLENO_DECISION_FINALIZED',
				details: `Sidang pleno menetapkan kuota ${quotaCapacity} siswa: ${lulusTotal} LULUS, ${waitingTotal} WAITING LIST. Disahkan oleh ${approvedBy}.`
			});

			return {
				success: true,
				message: `Keputusan Sidang Pleno BERHASIL DISAHKAN! ${lulusTotal} santri LULUS, ${waitingTotal} santri WAITING LIST.`
			};
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Gagal mengesahkan hasil sidang pleno';
			return { success: false, error: errorMessage };
		}
	}
};
