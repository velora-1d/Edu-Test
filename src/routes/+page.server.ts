import { db } from '$lib/server/db';
import { candidates, waves, auditLogs } from '$lib/server/db/schema';
import { seedDatabase } from '$lib/server/seed';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Auto-seed if database is empty
	const existingCount = await db.select().from(candidates);
	if (existingCount.length === 0) {
		await seedDatabase();
	}

	// Fetch active wave
	const activeWaves = await db.query.waves.findMany({
		where: (waves, { eq }) => eq(waves.status, 'ACTIVE')
	});
	const activeWave = activeWaves[0] || null;

	// Fetch all candidates with relational data
	const candidateList = await db.query.candidates.findMany({
		with: {
			wave: true,
			tpaScore: true,
			pesantrenScore: true,
			interview: true,
			ranking: true
		},
		orderBy: [desc(candidates.createdAt)]
	});

	// Fetch recent audit logs
	const recentLogs = await db.query.auditLogs.findMany({
		orderBy: [desc(auditLogs.createdAt)],
		limit: 6
	});

	// Calculations
	const totalCandidates = candidateList.length;

	let tpaCompletedCount = 0;
	let pesantrenCompletedCount = 0;
	let interviewCompletedCount = 0;
	let fullCompletedCount = 0;
	let lulusCount = 0;
	let waitingListCount = 0;

	// TPA Category Distribution
	const tpaCategories: Record<string, number> = {
		'Sangat Baik': 0,
		'Baik': 0,
		'Sedang': 0,
		'Buruk': 0,
		'Sangat Buruk': 0
	};

	// Pesantren Sub-Averages
	const pesantrenAverages = {
		tahsin: 0,
		tahfidz: 0,
		kitabKuning: 0,
		bInggris: 0,
		bArab: 0,
		hadits: 0,
		adzan: 0,
		sholat: 0,
		totalCount: 0,
		tahfidzCount: 0
	};

	// Department statistics
	const departmentStats: Record<string, { total: number; totalComposite: number; avgComposite: number }> = {
		'Rekayasa Perangkat Lunak': { total: 0, totalComposite: 0, avgComposite: 0 },
		'Desain Komunikasi Visual': { total: 0, totalComposite: 0, avgComposite: 0 },
		'Bisnis Digital': { total: 0, totalComposite: 0, avgComposite: 0 }
	};

	for (const c of candidateList) {
		const isTpaLocked = c.tpaScore?.lockStatus === 'LOCKED';
		const isPesantrenLocked = c.pesantrenScore?.lockStatus === 'LOCKED';
		const isInterviewDone = c.interview?.completionStatus === 'COMPLETED';

		if (isTpaLocked) tpaCompletedCount++;
		if (isPesantrenLocked) pesantrenCompletedCount++;
		if (isInterviewDone) interviewCompletedCount++;

		if (isTpaLocked && isPesantrenLocked && isInterviewDone) {
			fullCompletedCount++;
		}

		if (c.ranking?.admissionStatus === 'LULUS') {
			lulusCount++;
		} else if (c.ranking?.admissionStatus === 'WAITING_LIST') {
			waitingListCount++;
		}

		// TPA category
		if (c.tpaScore) {
			const cat = c.tpaScore.category || 'Sedang';
			tpaCategories[cat] = (tpaCategories[cat] || 0) + 1;
		}

		// Pesantren averages
		if (c.pesantrenScore) {
			pesantrenAverages.totalCount++;
			pesantrenAverages.tahsin += Number(c.pesantrenScore.tahsinScore) || 0;
			if (c.pesantrenScore.hasMemorization) {
				pesantrenAverages.tahfidzCount++;
				pesantrenAverages.tahfidz += Number(c.pesantrenScore.tahfidzScore) || 0;
			}
			pesantrenAverages.kitabKuning += Number(c.pesantrenScore.kitabKuningScore) || 0;
			pesantrenAverages.bInggris += Number(c.pesantrenScore.bInggrisScore) || 0;
			pesantrenAverages.bArab += Number(c.pesantrenScore.bArabScore) || 0;
			pesantrenAverages.hadits += Number(c.pesantrenScore.haditsScore) || 0;
			pesantrenAverages.adzan += Number(c.pesantrenScore.adzanScore) || 0;
			pesantrenAverages.sholat += Number(c.pesantrenScore.sholatScore) || 0;
		}

		// Department
		const dept = c.majorChoice;
		if (departmentStats[dept]) {
			departmentStats[dept].total++;
			const comp = Number(c.ranking?.compositeScore) || 0;
			departmentStats[dept].totalComposite += comp;
		}
	}

	// Compute averages
	const pCount = pesantrenAverages.totalCount || 1;
	const tfCount = pesantrenAverages.tahfidzCount || 1;
	const pesantrenRadar = {
		tahsin: Math.round(pesantrenAverages.tahsin / pCount),
		tahfidz: Math.round(pesantrenAverages.tahfidz / tfCount),
		kitabKuning: Math.round(pesantrenAverages.kitabKuning / pCount),
		bInggris: Math.round(pesantrenAverages.bInggris / pCount),
		bArab: Math.round(pesantrenAverages.bArab / pCount),
		hadits: Math.round(pesantrenAverages.hadits / pCount),
		adzan: Math.round(pesantrenAverages.adzan / pCount),
		sholat: Math.round(pesantrenAverages.sholat / pCount)
	};

	for (const key of Object.keys(departmentStats)) {
		const stat = departmentStats[key];
		stat.avgComposite = stat.total > 0 ? Math.round((stat.totalComposite / stat.total) * 10) / 10 : 0;
	}

	// Top 5 Candidates by Parallel Ranking
	const topCandidates = [...candidateList]
		.filter((c) => c.ranking)
		.sort((a, b) => (a.ranking?.rankParallel || 999) - (b.ranking?.rankParallel || 999))
		.slice(0, 5);

	return {
		activeWave,
		totalCandidates,
		fullCompletedCount,
		pendingCount: totalCandidates - fullCompletedCount,
		quotaCapacity: activeWave?.quotaCapacity || 20,
		lulusCount,
		waitingListCount,
		testProgress: {
			tpa: {
				count: tpaCompletedCount,
				percentage: totalCandidates > 0 ? Math.round((tpaCompletedCount / totalCandidates) * 100) : 0
			},
			pesantren: {
				count: pesantrenCompletedCount,
				percentage: totalCandidates > 0 ? Math.round((pesantrenCompletedCount / totalCandidates) * 100) : 0
			},
			interview: {
				count: interviewCompletedCount,
				percentage: totalCandidates > 0 ? Math.round((interviewCompletedCount / totalCandidates) * 100) : 0
			}
		},
		tpaCategories,
		pesantrenRadar,
		departmentStats,
		topCandidates,
		recentLogs
	};
};
