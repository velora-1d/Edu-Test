import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/server/seed';
import { calculateAndSaveParallelRankings } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const result = await seedDatabase();
		if (result.waveId) {
			await calculateAndSaveParallelRankings(result.waveId);
		}
		return json({
			success: true,
			...result
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat inisialisasi seed database';
		console.error('Error saat seedDatabase (GET):', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};

export const POST: RequestHandler = async () => {
	try {
		const result = await seedDatabase();
		if (result.waveId) {
			await calculateAndSaveParallelRankings(result.waveId);
		}
		return json({
			success: true,
			...result
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat inisialisasi seed database';
		console.error('Error saat seedDatabase (POST):', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
