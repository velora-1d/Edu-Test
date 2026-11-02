import { json } from '@sveltejs/kit';
import { saveInterviewRequestSchema } from '$lib/server/validation';
import { saveInterview } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let rawBody: Record<string, unknown>;
	try {
		rawBody = await request.json();
	} catch {
		return json({ success: false, error: 'Format JSON request tidak valid' }, { status: 400 });
	}

	const parseResult = saveInterviewRequestSchema.safeParse(rawBody);

	if (!parseResult.success) {
		return json(
			{
				success: false,
				error: 'Validasi data wawancara kualitatif gagal',
				details: parseResult.error.format()
			},
			{ status: 400 }
		);
	}

	try {
		const {
			candidateId,
			formData,
			summaries,
			studentGeneralSummary,
			studentPesantrenSummary,
			parentCommitmentSummary,
			specialRecommendation,
			interviewerName,
			isCompleted
		} = parseResult.data;

		// Konsolidasi ringkasan naratif (mendukung summaries object atau top-level summaries)
		const finalSummaries = {
			studentGeneral: summaries?.studentGeneral ?? studentGeneralSummary ?? null,
			studentPesantren: summaries?.studentPesantren ?? studentPesantrenSummary ?? null,
			parentCommitment: summaries?.parentCommitment ?? parentCommitmentSummary ?? null,
			specialRecommendation: summaries?.specialRecommendation ?? specialRecommendation ?? null
		};

		const result = await saveInterview(
			candidateId,
			formData,
			finalSummaries,
			interviewerName,
			isCompleted
		);

		return json(result);
	} catch (err: unknown) {
		const errorMessage =
			err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan data wawancara kualitatif';
		console.error('Error saat saveInterview:', err);
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
