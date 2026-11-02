import { db } from '$lib/server/db';
import { candidates } from '$lib/server/db/schema';
import { getActiveWave } from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Auto seed if empty
	const existing = await db.select().from(candidates);
	if (existing.length === 0) {
		await seedDatabase();
	}

	const activeWave = await getActiveWave();
	const allWaves = await db.query.waves.findMany({
		orderBy: (w, { desc }) => [desc(w.testDate)]
	});

	const candidateList = await db.query.candidates.findMany({
		with: {
			wave: true,
			tpaScore: true,
			pesantrenScore: true,
			interview: true,
			ranking: true
		},
		orderBy: [asc(candidates.testNumber)]
	});

	return {
		activeWave,
		allWaves,
		candidates: candidateList
	};
};
