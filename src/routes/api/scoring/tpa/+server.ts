import { json } from '@sveltejs/kit';
import { saveTpaRequestSchema } from '$lib/server/validation';
import { saveTpaScore } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let rawBody: Record<string, unknown>;
	try {
		rawBody = await request.json();
	} catch {
		return json({ success: false, error: 'Format JSON request tidak valid' }, { status: 400 });
	}

	// Dukungan fleksibel untuk nested input ({ input: { eyd, ... } }) atau flat fields
	const inputData =
		rawBody.input && typeof rawBody.input === 'object'
			? rawBody.input
			: {
				eyd: rawBody.eyd,
				kohesi: rawBody.kohesi,
				logika: rawBody.logika,
				analogi: rawBody.analogi,
				wacana: rawBody.wacana,
				mtkHitung: rawBody.mtkHitung,
				mtkRuang: rawBody.mtkRuang,
				bInggris: rawBody.bInggris,
				bArab: rawBody.bArab,
				tahfidz: rawBody.tahfidz,
				tahsin: rawBody.tahsin,
				karakter: rawBody.karakter
			};

	const parseResult = saveTpaRequestSchema.safeParse({
		candidateId: rawBody.candidateId,
		input: inputData,
		examinerName: rawBody.examinerName,
		isLock: Boolean(rawBody.isLock)
	});

	if (!parseResult.success) {
		return json(
			{
				success: false,
				error: 'Validasi data TPA gagal',
				details: parseResult.error.format()
			},
			{ status: 400 }
		);
	}

	try {
		const { candidateId, input, examinerName, isLock } = parseResult.data;
		const result = await saveTpaScore(candidateId, input, examinerName, isLock);

		return json(result);
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan skor TPA';
		console.error('Error saat saveTpaScore:', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
