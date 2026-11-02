import { json } from '@sveltejs/kit';
import { calculateAndSaveParallelRankings, getActiveWave, getCandidatesWithScores } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const waveIdParam = url.searchParams.get('waveId');
		let waveId = waveIdParam;

		if (!waveId) {
			const activeWave = await getActiveWave();
			if (!activeWave) {
				return json({ success: false, error: 'Tidak ada gelombang seleksi aktif' }, { status: 404 });
			}
			waveId = activeWave.id;
		}

		const candidates = await getCandidatesWithScores(waveId);

		return json({
			success: true,
			waveId,
			total: candidates.length,
			data: candidates
		});
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengambil data ranking';
		console.error('Error saat GET ranking:', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		let waveId: string | undefined;

		try {
			const body = await request.json();
			waveId = body.waveId;
		} catch {
			// Body opsional jika ingin menggunakan active wave
		}

		if (!waveId) {
			const activeWave = await getActiveWave();
			if (!activeWave) {
				return json({ success: false, error: 'Tidak ada gelombang seleksi aktif' }, { status: 404 });
			}
			waveId = activeWave.id;
		}

		const result = await calculateAndSaveParallelRankings(waveId);

		return json(result);
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat kalkulasi ranking';
		console.error('Error saat POST ranking:', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
