import { json } from '@sveltejs/kit';
import { savePesantrenRequestSchema } from '$lib/server/validation';
import { savePesantrenScore } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let rawBody: Record<string, unknown>;
	try {
		rawBody = await request.json();
	} catch {
		return json({ success: false, error: 'Format JSON request tidak valid' }, { status: 400 });
	}

	// Dukungan fleksibel untuk nested input ({ input: { ... } }) atau flat fields
	const inputData =
		rawBody.input && typeof rawBody.input === 'object'
			? rawBody.input
			: {
				tahsinMakhraj: rawBody.tahsinMakhraj,
				tahsinTajwid: rawBody.tahsinTajwid,
				tahsinKelancaran: rawBody.tahsinKelancaran,
				tahsinAdab: rawBody.tahsinAdab,
				hasMemorization: Boolean(rawBody.hasMemorization),
				tahfidzKelancaran: rawBody.tahfidzKelancaran,
				tahfidzMurojaah: rawBody.tahfidzMurojaah,
				tahfidzTarget: rawBody.tahfidzTarget,
				tahfidzAdab: rawBody.tahfidzAdab,
				kitabBacaGundul: rawBody.kitabBacaGundul,
				kitabNahwuShorof: rawBody.kitabNahwuShorof,
				kitabTerjemahPegon: rawBody.kitabTerjemahPegon,
				kitabIsi: rawBody.kitabIsi,
				bInggrisSpeaking: rawBody.bInggrisSpeaking,
				bInggrisPronunciation: rawBody.bInggrisPronunciation,
				bInggrisWriting: rawBody.bInggrisWriting,
				bInggrisVocab: rawBody.bInggrisVocab,
				bArabSpeaking: rawBody.bArabSpeaking,
				bArabPronunciation: rawBody.bArabPronunciation,
				bArabWriting: rawBody.bArabWriting,
				bArabVocab: rawBody.bArabVocab,
				haditsHafalan: rawBody.haditsHafalan,
				haditsKelancaran: rawBody.haditsKelancaran,
				haditsMakna: rawBody.haditsMakna,
				haditsAdab: rawBody.haditsAdab,
				adzanKelancaran: rawBody.adzanKelancaran,
				adzanMakhraj: rawBody.adzanMakhraj,
				adzanSuara: rawBody.adzanSuara,
				sholatKelancaran: rawBody.sholatKelancaran,
				sholatMakhraj: rawBody.sholatMakhraj,
				sholatAdab: rawBody.sholatAdab
			};

	const parseResult = savePesantrenRequestSchema.safeParse({
		candidateId: rawBody.candidateId,
		input: inputData,
		notes: rawBody.notes,
		examinerName: rawBody.examinerName,
		isLock: Boolean(rawBody.isLock)
	});

	if (!parseResult.success) {
		return json(
			{
				success: false,
				error: 'Validasi data rubrik kepesantrenan gagal',
				details: parseResult.error.format()
			},
			{ status: 400 }
		);
	}

	try {
		const { candidateId, input, examinerName, isLock, notes } = parseResult.data;
		const result = await savePesantrenScore(
			candidateId,
			{
				...input,
				tahfidzKelancaran: input.tahfidzKelancaran ?? undefined,
				tahfidzMurojaah: input.tahfidzMurojaah ?? undefined,
				tahfidzTarget: input.tahfidzTarget ?? undefined,
				tahfidzAdab: input.tahfidzAdab ?? undefined
			},
			examinerName,
			isLock,
			notes
		);

		return json(result);
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan skor rubrik kepesantrenan';
		console.error('Error saat savePesantrenScore:', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
