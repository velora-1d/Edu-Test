import { db } from '$lib/server/db';
import {
	waves,
	candidates,
	tpaScores,
	pesantrenScores,
	qualitativeInterviews,
	finalRankings,
	auditLogs,
	majors,
	examRooms
} from '$lib/server/db/schema';
import { calculateTpaScore, calculatePesantrenScore, type TpaInput, type PesantrenInput } from '$lib/server/scoring';
import { eq, desc, asc, and } from 'drizzle-orm';

/**
 * Mendapatkan gelombang seleksi yang sedang aktif
 */
export async function getActiveWave() {
	const activeWaves = await db
		.select()
		.from(waves)
		.where(eq(waves.status, 'ACTIVE'))
		.orderBy(desc(waves.testDate))
		.limit(1);

	return activeWaves.length > 0 ? activeWaves[0] : null;
}

/**
 * Mendapatkan seluruh kandidat beserta skor TPA, Rubrik Kepesantrenan,
 * Form Wawancara, dan Status Ranking untuk gelombang tertentu.
 */
export async function getCandidatesWithScores(waveId?: string) {
	let targetWaveId = waveId;
	if (!targetWaveId) {
		const active = await getActiveWave();
		if (!active) return [];
		targetWaveId = active.id;
	}

	return await db.query.candidates.findMany({
		where: eq(candidates.waveId, targetWaveId),
		with: {
			wave: true,
			tpaScore: true,
			pesantrenScore: true,
			interview: true,
			ranking: true
		},
		orderBy: [asc(candidates.testNumber)]
	});
}

/**
 * Menyimpan atau memperbarui skor Tes Potensi Akademik (TPA)
 * Melakukan kalkulasi otomatis (skor mentah, skor 100, kategori)
 */
export async function saveTpaScore(
	candidateId: string,
	input: TpaInput,
	examinerName?: string | null,
	isLock: boolean = false
) {
	const tpaRes = calculateTpaScore(input);
	const lockStatus = isLock ? 'LOCKED' : 'DRAFT';

	const [saved] = await db
		.insert(tpaScores)
		.values({
			candidateId,
			eydCorrect: input.eyd,
			kohesiCorrect: input.kohesi,
			logikaCorrect: input.logika,
			analogiCorrect: input.analogi,
			wacanaCorrect: input.wacana,
			mtkHitungCorrect: input.mtkHitung,
			mtkRuangCorrect: input.mtkRuang,
			bInggrisCorrect: input.bInggris,
			bArabCorrect: input.bArab,
			tahfidzCorrect: input.tahfidz,
			tahsinCorrect: input.tahsin,
			karakterCorrect: input.karakter,
			rawTotalScore: tpaRes.rawTotal,
			finalScore100: tpaRes.finalScore100.toString(),
			category: tpaRes.category,
			lockStatus,
			examinerName: examinerName || null,
			lockedAt: isLock ? new Date() : null,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: tpaScores.candidateId,
			set: {
				eydCorrect: input.eyd,
				kohesiCorrect: input.kohesi,
				logikaCorrect: input.logika,
				analogiCorrect: input.analogi,
				wacanaCorrect: input.wacana,
				mtkHitungCorrect: input.mtkHitung,
				mtkRuangCorrect: input.mtkRuang,
				bInggrisCorrect: input.bInggris,
				bArabCorrect: input.bArab,
				tahfidzCorrect: input.tahfidz,
				tahsinCorrect: input.tahsin,
				karakterCorrect: input.karakter,
				rawTotalScore: tpaRes.rawTotal,
				finalScore100: tpaRes.finalScore100.toString(),
				category: tpaRes.category,
				lockStatus,
				...(examinerName ? { examinerName } : {}),
				...(isLock ? { lockedAt: new Date() } : {}),
				updatedAt: new Date()
			}
		})
		.returning();

	// Transisi pipeline ke IN_TEST jika kandidat masih berstatus REGISTERED
	await db
		.update(candidates)
		.set({ statusPipeline: 'IN_TEST' })
		.where(and(eq(candidates.id, candidateId), eq(candidates.statusPipeline, 'REGISTERED')));

	// Catat audit log
	await db.insert(auditLogs).values({
		candidateId,
		userName: examinerName || 'Penguji TPA',
		actionType: isLock ? 'LOCK_TPA_SCORE' : 'AUTOSAVE_TPA_SCORE',
		details: `Skor TPA ${isLock ? 'dikunci' : 'disimpan draft'}: Mentah=${tpaRes.rawTotal}, Skor100=${tpaRes.finalScore100}, Kategori=${tpaRes.category}`
	});

	return {
		success: true,
		score: tpaRes,
		data: saved
	};
}

/**
 * Menyimpan atau memperbarui skor Rubrik Kepesantrenan (7 Bidang Uji)
 * Melakukan kalkulasi bobot otomatis per bidang dan rata-rata 100
 */
export async function savePesantrenScore(
	candidateId: string,
	input: PesantrenInput,
	examinerName?: string | null,
	isLock: boolean = false,
	notes?: string | null
) {
	const pesRes = calculatePesantrenScore(input);
	const lockStatus = isLock ? 'LOCKED' : 'DRAFT';

	const [saved] = await db
		.insert(pesantrenScores)
		.values({
			candidateId,
			tahsinScore: pesRes.tahsinScore.toString(),
			hasMemorization: input.hasMemorization,
			tahfidzScore: pesRes.tahfidzScore.toString(),
			combinedQuranScore: pesRes.combinedQuranScore.toString(),
			kitabKuningScore: pesRes.kitabKuningScore.toString(),
			bInggrisScore: pesRes.bInggrisScore.toString(),
			bArabScore: pesRes.bArabScore.toString(),
			haditsScore: pesRes.haditsScore.toString(),
			adzanScore: pesRes.adzanScore.toString(),
			sholatScore: pesRes.sholatScore.toString(),
			averageScore: pesRes.averageScore.toString(),
			notes: notes || null,
			lockStatus,
			examinerName: examinerName || null,
			lockedAt: isLock ? new Date() : null,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: pesantrenScores.candidateId,
			set: {
				tahsinScore: pesRes.tahsinScore.toString(),
				hasMemorization: input.hasMemorization,
				tahfidzScore: pesRes.tahfidzScore.toString(),
				combinedQuranScore: pesRes.combinedQuranScore.toString(),
				kitabKuningScore: pesRes.kitabKuningScore.toString(),
				bInggrisScore: pesRes.bInggrisScore.toString(),
				bArabScore: pesRes.bArabScore.toString(),
				haditsScore: pesRes.haditsScore.toString(),
				adzanScore: pesRes.adzanScore.toString(),
				sholatScore: pesRes.sholatScore.toString(),
				averageScore: pesRes.averageScore.toString(),
				...(notes !== undefined ? { notes: notes || null } : {}),
				lockStatus,
				...(examinerName ? { examinerName } : {}),
				...(isLock ? { lockedAt: new Date() } : {}),
				updatedAt: new Date()
			}
		})
		.returning();

	// Transisi pipeline ke IN_TEST jika kandidat masih berstatus REGISTERED
	await db
		.update(candidates)
		.set({ statusPipeline: 'IN_TEST' })
		.where(and(eq(candidates.id, candidateId), eq(candidates.statusPipeline, 'REGISTERED')));

	// Catat audit log
	await db.insert(auditLogs).values({
		candidateId,
		userName: examinerName || 'Penguji Kepesantrenan',
		actionType: isLock ? 'LOCK_PESANTREN_SCORE' : 'AUTOSAVE_PESANTREN_SCORE',
		details: `Skor Kepesantrenan ${isLock ? 'dikunci' : 'disimpan draft'}: Rata-rata=${pesRes.averageScore}`
	});

	return {
		success: true,
		score: pesRes,
		data: saved
	};
}

/**
 * Menyimpan data wawancara kualitatif (JSONB payload 26 butir, ringkasan naratif, & status)
 */
export async function saveInterview(
	candidateId: string,
	formData: Record<string, unknown>,
	summaries?: {
		studentGeneral?: string | null;
		studentPesantren?: string | null;
		parentCommitment?: string | null;
		specialRecommendation?: string | null;
	},
	interviewerName?: string | null,
	isCompleted: boolean = false
) {
	const completionStatus = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';

	const [saved] = await db
		.insert(qualitativeInterviews)
		.values({
			candidateId,
			formData,
			studentGeneralSummary: summaries?.studentGeneral || null,
			studentPesantrenSummary: summaries?.studentPesantren || null,
			parentCommitmentSummary: summaries?.parentCommitment || null,
			specialRecommendation: summaries?.specialRecommendation || null,
			interviewerName: interviewerName || null,
			completionStatus,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: qualitativeInterviews.candidateId,
			set: {
				formData,
				...(summaries?.studentGeneral !== undefined
					? { studentGeneralSummary: summaries.studentGeneral }
					: {}),
				...(summaries?.studentPesantren !== undefined
					? { studentPesantrenSummary: summaries.studentPesantren }
					: {}),
				...(summaries?.parentCommitment !== undefined
					? { parentCommitmentSummary: summaries.parentCommitment }
					: {}),
				...(summaries?.specialRecommendation !== undefined
					? { specialRecommendation: summaries.specialRecommendation }
					: {}),
				...(interviewerName !== undefined ? { interviewerName } : {}),
				completionStatus,
				updatedAt: new Date()
			}
		})
		.returning();

	// Transisi pipeline ke IN_TEST jika kandidat masih berstatus REGISTERED
	await db
		.update(candidates)
		.set({ statusPipeline: 'IN_TEST' })
		.where(and(eq(candidates.id, candidateId), eq(candidates.statusPipeline, 'REGISTERED')));

	// Catat audit log
	await db.insert(auditLogs).values({
		candidateId,
		userName: interviewerName || 'Pewawancara',
		actionType: isCompleted ? 'COMPLETE_INTERVIEW' : 'AUTOSAVE_INTERVIEW',
		details: `Form Wawancara ${isCompleted ? 'diselesaikan' : 'disimpan otomatis'}`
	});

	return {
		success: true,
		data: saved
	};
}

/**
 * Menghitung pemeringkatan paralel otomatis untuk seluruh santri pada satu gelombang
 * Mengimplementasikan Aturan Seri (Tie-Breaker Hierarchy) sesuai FR-RNK-003:
 * 1. Skor Komposit Akhir (ROUND((Skor TPA + Skor Kepesantrenan)/2, 2))
 * 2. Prioritas 1: Rata-rata Skor Kepesantrenan
 * 3. Prioritas 2: Nilai Gabungan Tahsin & Tahfidz
 * 4. Prioritas 3: Nilai Gabungan Subtes Logika + Karakter TPA
 * 5. Prioritas 4: Waktu Pendaftaran (created_at kandidat)
 *
 * Menentukan status kelulusan berdasarkan kuota gelombang (quotaCapacity):
 * - rankParallel <= quotaCapacity -> 'LULUS'
 * - rankParallel > quotaCapacity -> 'WAITING_LIST'
 * (Mempertahankan override manual jika ada intervensi sidang pleno)
 */
export async function calculateAndSaveParallelRankings(waveId: string) {
	const [wave] = await db.select().from(waves).where(eq(waves.id, waveId));
	if (!wave) {
		throw new Error(`Gelombang seleksi dengan id ${waveId} tidak ditemukan`);
	}

	const waveCandidates = await db.query.candidates.findMany({
		where: eq(candidates.waveId, waveId),
		with: {
			tpaScore: true,
			pesantrenScore: true,
			ranking: true
		}
	});

	if (waveCandidates.length === 0) {
		return {
			success: true,
			waveId,
			quotaCapacity: wave.quotaCapacity,
			totalCandidates: 0,
			rankings: []
		};
	}

	interface CandidateMetrics {
		candidateId: string;
		tpaScore100: number;
		pesantrenAverage: number;
		compositeScore: number;
		combinedQuran: number;
		logikaPlusKarakter: number;
		createdAt: Date;
		existingAdmissionStatus?: string;
		existingOverrideReason?: string | null;
		existingApprovedBy?: string | null;
	}

	const metricsList: CandidateMetrics[] = waveCandidates.map((c) => {
		const tpaScore100 = c.tpaScore ? parseFloat(c.tpaScore.finalScore100) : 0;
		const pesantrenAverage = c.pesantrenScore ? parseFloat(c.pesantrenScore.averageScore) : 0;
		// Formula FR-RNK-002: Skor Komposit = ROUND((Skor TPA + Rata-rata Kepesantrenan) / 2, 2)
		const compositeScore = Math.round(((tpaScore100 + pesantrenAverage) / 2) * 100) / 100;
		const combinedQuran = c.pesantrenScore ? parseFloat(c.pesantrenScore.combinedQuranScore) : 0;
		const logikaPlusKarakter = c.tpaScore
			? c.tpaScore.logikaCorrect * 2 + c.tpaScore.karakterCorrect * 1
			: 0;

		return {
			candidateId: c.id,
			tpaScore100,
			pesantrenAverage,
			compositeScore,
			combinedQuran,
			logikaPlusKarakter,
			createdAt: c.createdAt,
			existingAdmissionStatus: c.ranking?.admissionStatus,
			existingOverrideReason: c.ranking?.overrideReason,
			existingApprovedBy: c.ranking?.approvedBy
		};
	});

	// 1. Peringkat TPA (Sort descending skor TPA)
	const tpaSorted = [...metricsList].sort((a, b) => b.tpaScore100 - a.tpaScore100);
	const tpaRankMap = new Map<string, number>();
	tpaSorted.forEach((item, index) => {
		tpaRankMap.set(item.candidateId, index + 1);
	});

	// 2. Peringkat Kepesantrenan (Sort descending rata-rata kepesantrenan)
	const pesantrenSorted = [...metricsList].sort((a, b) => b.pesantrenAverage - a.pesantrenAverage);
	const pesantrenRankMap = new Map<string, number>();
	pesantrenSorted.forEach((item, index) => {
		pesantrenRankMap.set(item.candidateId, index + 1);
	});

	// 3. Peringkat Paralel dengan Tie-Breaker Hierarki (FR-RNK-003)
	const parallelSorted = [...metricsList].sort((a, b) => {
		// Skor Komposit
		if (b.compositeScore !== a.compositeScore) {
			return b.compositeScore - a.compositeScore;
		}
		// Prioritas 1: Rata-rata Kepesantrenan
		if (b.pesantrenAverage !== a.pesantrenAverage) {
			return b.pesantrenAverage - a.pesantrenAverage;
		}
		// Prioritas 2: Nilai Gabungan Tahsin & Tahfidz
		if (b.combinedQuran !== a.combinedQuran) {
			return b.combinedQuran - a.combinedQuran;
		}
		// Prioritas 3: Nilai Gabungan Subtes Logika + Karakter TPA
		if (b.logikaPlusKarakter !== a.logikaPlusKarakter) {
			return b.logikaPlusKarakter - a.logikaPlusKarakter;
		}
		// Prioritas 4: Waktu Pendaftaran (paling awal = lebih atas)
		return a.createdAt.getTime() - b.createdAt.getTime();
	});

	// Simpan ke database
	const rankingResults = [];
	for (let i = 0; i < parallelSorted.length; i++) {
		const item = parallelSorted[i];
		const rankParallel = i + 1;
		const rankTpa = tpaRankMap.get(item.candidateId) || 1;
		const rankPesantren = pesantrenRankMap.get(item.candidateId) || 1;

		// Default kuota admission
		const defaultAdmission = rankParallel <= wave.quotaCapacity ? 'LULUS' : 'WAITING_LIST';
		// Pertahankan status jika telah dioverride manual dalam pleno
		const admissionStatus = item.existingOverrideReason
			? item.existingAdmissionStatus || defaultAdmission
			: defaultAdmission;

		const [savedRank] = await db
			.insert(finalRankings)
			.values({
				candidateId: item.candidateId,
				waveId,
				compositeScore: item.compositeScore.toString(),
				rankTpa,
				rankPesantren,
				rankParallel,
				admissionStatus,
				overrideReason: item.existingOverrideReason || null,
				approvedBy: item.existingApprovedBy || null,
				decidedAt: new Date()
			})
			.onConflictDoUpdate({
				target: finalRankings.candidateId,
				set: {
					compositeScore: item.compositeScore.toString(),
					rankTpa,
					rankPesantren,
					rankParallel,
					admissionStatus,
					decidedAt: new Date()
				}
			})
			.returning();

		rankingResults.push(savedRank);
	}

	// Perbarui status pipeline santri ke COMPLETED jika tes TPA & Pesantren keduanya sudah LOCKED
	for (const c of waveCandidates) {
		if (c.tpaScore?.lockStatus === 'LOCKED' && c.pesantrenScore?.lockStatus === 'LOCKED') {
			await db
				.update(candidates)
				.set({ statusPipeline: 'COMPLETED' })
				.where(eq(candidates.id, c.id));
		}
	}

	// Audit Log
	await db.insert(auditLogs).values({
		userName: 'System / Pleno Engine',
		actionType: 'CALCULATE_PARALLEL_RANKINGS',
		details: `Kalkulasi pemeringkatan paralel gelombang ${wave.waveName}: ${rankingResults.length} peserta diproses dengan kuota ${wave.quotaCapacity}.`
	});

	return {
		success: true,
		waveId,
		quotaCapacity: wave.quotaCapacity,
		totalCandidates: rankingResults.length,
		rankings: rankingResults
	};
}

/**
 * Menambahkan data calon santri baru
 */
export async function createCandidate(data: {
	waveId: string;
	testNumber?: string;
	fullName: string;
	nisn?: string | null;
	schoolOrigin: string;
	majorChoice: string;
	roomAssignment?: string | null;
}) {
	let testNumber = data.testNumber;
	if (!testNumber) {
		const existing = await db
			.select()
			.from(candidates)
			.where(eq(candidates.waveId, data.waveId));
		const count = existing.length + 1;
		let deptCode = 'RPL';
		const matchedMajor = await db.query.majors.findFirst({
			where: eq(majors.name, data.majorChoice)
		});
		if (matchedMajor?.code) {
			deptCode = matchedMajor.code.toUpperCase();
		} else if (data.majorChoice.includes('Perangkat Lunak')) {
			deptCode = 'RPL';
		} else if (data.majorChoice.includes('Komunikasi Visual')) {
			deptCode = 'DKV';
		} else if (data.majorChoice.includes('Bisnis')) {
			deptCode = 'BD';
		} else {
			deptCode = data.majorChoice.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'UMM';
		}
		testNumber = `G1-${deptCode}-${String(count).padStart(3, '0')}`;
	}

	const [newCandidate] = await db
		.insert(candidates)
		.values({
			waveId: data.waveId,
			testNumber,
			fullName: data.fullName,
			nisn: data.nisn || null,
			schoolOrigin: data.schoolOrigin,
			majorChoice: data.majorChoice,
			roomAssignment: data.roomAssignment || 'Ruang 1',
			statusPipeline: 'REGISTERED'
		})
		.returning();

	// Inisialisasi record kosong untuk TPA, Pesantren, Wawancara agar konsisten
	await db.insert(tpaScores).values({
		candidateId: newCandidate.id,
		lockStatus: 'DRAFT'
	});

	await db.insert(pesantrenScores).values({
		candidateId: newCandidate.id,
		lockStatus: 'DRAFT'
	});

	await db.insert(qualitativeInterviews).values({
		candidateId: newCandidate.id,
		completionStatus: 'DRAFT'
	});

	// Audit Log
	await db.insert(auditLogs).values({
		userName: 'Panitia Admisi',
		actionType: 'CREATE_CANDIDATE',
		details: `Menambahkan calon santri baru: ${newCandidate.fullName} (${newCandidate.testNumber})`
	});

	return newCandidate;
}

/**
 * Memperbarui data calon santri
 */
export async function updateCandidate(
	id: string,
	data: {
		fullName?: string;
		nisn?: string | null;
		schoolOrigin?: string;
		majorChoice?: string;
		roomAssignment?: string | null;
	}
) {
	const [updated] = await db
		.update(candidates)
		.set(data)
		.where(eq(candidates.id, id))
		.returning();

	if (updated) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'UPDATE_CANDIDATE',
			details: `Memperbarui data calon santri: ${updated.fullName} (${updated.testNumber})`
		});
	}

	return updated;
}

/**
 * Menghapus calon santri beserta relasi nilainya (Cascade)
 */
export async function deleteCandidate(id: string) {
	const [deleted] = await db
		.delete(candidates)
		.where(eq(candidates.id, id))
		.returning();

	if (deleted) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'DELETE_CANDIDATE',
			details: `Menghapus calon santri: ${deleted.fullName} (${deleted.testNumber})`
		});
	}

	return deleted;
}

/**
 * Memastikan data awal Jurusan dan Ruang Ujian tersedia (Seed Default jika kosong)
 */
export async function ensureMasterData() {
	const existingMajors = await db.select().from(majors);
	if (existingMajors.length === 0) {
		await db.insert(majors).values([
			{ name: 'Rekayasa Perangkat Lunak', code: 'RPL', description: 'Pengembangan Software, Web & Mobile' },
			{ name: 'Desain Komunikasi Visual', code: 'DKV', description: 'Desain Grafis, Animasi & Multimedia' },
			{ name: 'Bisnis Digital', code: 'BD', description: 'E-Commerce, Digital Marketing & Startup' }
		]);
	}

	const existingRooms = await db.select().from(examRooms);
	if (existingRooms.length === 0) {
		await db.insert(examRooms).values([
			{ name: 'Ruang 1 (Lab RPL)', capacity: 30, location: 'Gedung A Lantai 1' },
			{ name: 'Ruang 2 (Lab DKV)', capacity: 30, location: 'Gedung A Lantai 2' },
			{ name: 'Ruang 3 (Kelas A)', capacity: 30, location: 'Gedung B Lantai 1' },
			{ name: 'Ruang 4 (Kelas B)', capacity: 30, location: 'Gedung B Lantai 2' }
		]);
	}
}

/**
 * Mengambil seluruh data Jurusan Pilihan
 */
export async function getMajors() {
	await ensureMasterData();
	return await db.query.majors.findMany({
		orderBy: [asc(majors.name)]
	});
}

/**
 * Menambah Jurusan Pilihan baru
 */
export async function createMajor(data: { name: string; code: string; description?: string }) {
	const [newMajor] = await db
		.insert(majors)
		.values({
			name: data.name.trim(),
			code: data.code.trim().toUpperCase(),
			description: data.description?.trim() || null
		})
		.returning();

	await db.insert(auditLogs).values({
		userName: 'Panitia Admisi',
		actionType: 'CREATE_MAJOR',
		details: `Menambah jurusan baru: ${newMajor.name} (${newMajor.code})`
	});

	return newMajor;
}

/**
 * Memperbarui data Jurusan Pilihan
 */
export async function updateMajor(
	id: string,
	data: { name?: string; code?: string; description?: string; isActive?: boolean }
) {
	const [updated] = await db
		.update(majors)
		.set({
			name: data.name?.trim(),
			code: data.code?.trim().toUpperCase(),
			description: data.description?.trim(),
			isActive: data.isActive
		})
		.where(eq(majors.id, id))
		.returning();

	if (updated) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'UPDATE_MAJOR',
			details: `Memperbarui jurusan: ${updated.name} (${updated.code})`
		});
	}

	return updated;
}

/**
 * Menghapus data Jurusan Pilihan
 */
export async function deleteMajor(id: string) {
	const [deleted] = await db.delete(majors).where(eq(majors.id, id)).returning();

	if (deleted) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'DELETE_MAJOR',
			details: `Menghapus jurusan: ${deleted.name}`
		});
	}

	return deleted;
}

/**
 * Mengambil seluruh data Alokasi Ruang Ujian
 */
export async function getExamRooms() {
	await ensureMasterData();
	return await db.query.examRooms.findMany({
		orderBy: [asc(examRooms.name)]
	});
}

/**
 * Menambah Ruang Ujian baru
 */
export async function createExamRoom(data: { name: string; capacity?: number; location?: string }) {
	const [newRoom] = await db
		.insert(examRooms)
		.values({
			name: data.name.trim(),
			capacity: data.capacity || 30,
			location: data.location?.trim() || null
		})
		.returning();

	await db.insert(auditLogs).values({
		userName: 'Panitia Admisi',
		actionType: 'CREATE_ROOM',
		details: `Menambah ruang ujian baru: ${newRoom.name}`
	});

	return newRoom;
}

/**
 * Memperbarui data Ruang Ujian
 */
export async function updateExamRoom(
	id: string,
	data: { name?: string; capacity?: number; location?: string; isActive?: boolean }
) {
	const [updated] = await db
		.update(examRooms)
		.set({
			name: data.name?.trim(),
			capacity: data.capacity,
			location: data.location?.trim(),
			isActive: data.isActive
		})
		.where(eq(examRooms.id, id))
		.returning();

	if (updated) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'UPDATE_ROOM',
			details: `Memperbarui ruang ujian: ${updated.name}`
		});
	}

	return updated;
}

/**
 * Menghapus data Ruang Ujian
 */
export async function deleteExamRoom(id: string) {
	const [deleted] = await db.delete(examRooms).where(eq(examRooms.id, id)).returning();

	if (deleted) {
		await db.insert(auditLogs).values({
			userName: 'Panitia Admisi',
			actionType: 'DELETE_ROOM',
			details: `Menghapus ruang ujian: ${deleted.name}`
		});
	}

	return deleted;
}
