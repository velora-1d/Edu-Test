import { db } from '$lib/server/db';
import { waves, candidates, tpaScores, pesantrenScores, qualitativeInterviews, finalRankings } from '$lib/server/db/schema';
import { calculateTpaScore, calculatePesantrenScore } from '$lib/server/scoring';

export async function seedDatabase() {
	// Check if already seeded
	const existingWaves = await db.select().from(waves);
	if (existingWaves.length > 0) {
		return { message: 'Database already seeded', waveId: existingWaves[0].id };
	}

	// 1. Create Active Wave
	const [wave] = await db
		.insert(waves)
		.values({
			waveName: 'Gelombang 1 - TA 2027/2028',
			testDate: new Date('2026-11-15T08:00:00Z'),
			quotaCapacity: 20,
			status: 'ACTIVE'
		})
		.returning();

	const sampleCandidates = [
		{ name: 'Rifat Zaidan Ammarsyah', school: 'SMP Sekolah Impian', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Satria Haidarriby Syafii', school: 'MTs Negeri 1 Jakarta', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Ahmad Fauzan Kamil', school: 'SMPIT Al-Ihsan', major: 'Desain Komunikasi Visual' },
		{ name: 'Muhammad Rizky Ramadhan', school: 'SMP Islam Terpadu', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Fathir Ibrahim Al-Mubarok', school: 'MTs Darussalam', major: 'Bisnis Digital' },
		{ name: 'Zaidan Al-Farisi', school: 'SMP Negeri 4 Cibinong', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Rayhan Pratama Putra', school: 'SMPIT Bina Umat', major: 'Desain Komunikasi Visual' },
		{ name: 'Naufal Azhar Syahputra', school: 'MTs Al-Falah', major: 'Bisnis Digital' },
		{ name: 'Bilal Al-Ghifari', school: 'SMP Pesantren Modern', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Hamzah Asadullah', school: 'SMP Islam Nurul Fikri', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Salman Al-Farisi', school: 'MTs Husnul Khotimah', major: 'Desain Komunikasi Visual' },
		{ name: 'Usman Dwi Prasetyo', school: 'SMP Negeri 2 Bogor', major: 'Bisnis Digital' },
		{ name: 'Ali Imran Al-Habsyi', school: 'MTs Attaqwa', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Hasan Basri', school: 'SMPIT Ummul Quro', major: 'Desain Komunikasi Visual' },
		{ name: 'Husain Haikal', school: 'SMP Islam Al-Azhar', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Abdullah Azzam', school: 'MTs As-Sunnah', major: 'Bisnis Digital' },
		{ name: 'Thoriq Ziyad', school: 'SMP Pesantren Al-Kahfi', major: 'Rekayasa Perangkat Lunak' },
		{ name: 'Zubair Bin Awwam', school: 'SMP Negeri 1 Depok', major: 'Desain Komunikasi Visual' },
		{ name: 'Talhah Ubaidillah', school: 'MTs Al-Mukmin', major: 'Bisnis Digital' },
		{ name: 'Saad Bin Abi Waqqas', school: 'SMPIT Insantama', major: 'Rekayasa Perangkat Lunak' }
	];

	for (let i = 0; i < sampleCandidates.length; i++) {
		const s = sampleCandidates[i];
		const testNumber = `G1-${s.major === 'Rekayasa Perangkat Lunak' ? 'RPL' : s.major === 'Desain Komunikasi Visual' ? 'DKV' : 'BD'}-${String(i + 1).padStart(3, '0')}`;

		const [cand] = await db
			.insert(candidates)
			.values({
				waveId: wave.id,
				testNumber,
				fullName: s.name,
				schoolOrigin: s.school,
				majorChoice: s.major,
				roomAssignment: i < 10 ? 'Ruang 1 (Lab RPL)' : 'Ruang 2 (Lab Komputer)'
			})
			.returning();

		// Calculate realistic varied TPA
		const eyd = Math.min(3, 1 + (i % 3));
		const kohesi = Math.min(3, 1 + ((i + 1) % 3));
		const logika = Math.min(3, 2 + (i % 2));
		const analogi = Math.min(3, 1 + ((i + 2) % 3));
		const wacana = Math.min(3, 2 + (i % 2));
		const mtkHitung = Math.min(3, (i % 4) === 0 ? 3 : 2);
		const mtkRuang = Math.min(3, (i % 3) === 0 ? 3 : 2);
		const bInggris = Math.min(3, 1 + ((i + 1) % 3));
		const bArab = Math.min(3, 2 + (i % 2));
		const tahfidz = Math.min(3, 2 + (i % 2));
		const tahsin = Math.min(3, 1 + (i % 3));
		const karakter = Math.min(6, 4 + (i % 3));

		const tpaRes = calculateTpaScore({
			eyd, kohesi, logika, analogi, wacana,
			mtkHitung, mtkRuang, bInggris, bArab, tahfidz, tahsin, karakter
		});

		await db.insert(tpaScores).values({
			candidateId: cand.id,
			eydCorrect: eyd,
			kohesiCorrect: kohesi,
			logikaCorrect: logika,
			analogiCorrect: analogi,
			wacanaCorrect: wacana,
			mtkHitungCorrect: mtkHitung,
			mtkRuangCorrect: mtkRuang,
			bInggrisCorrect: bInggris,
			bArabCorrect: bArab,
			tahfidzCorrect: tahfidz,
			tahsinCorrect: tahsin,
			karakterCorrect: karakter,
			rawTotalScore: tpaRes.rawTotal,
			finalScore100: tpaRes.finalScore100.toString(),
			category: tpaRes.category,
			lockStatus: 'LOCKED',
			examinerName: 'Ust. Abdul Malik, S.Pd.'
		});

		// Calculate Pesantren Score
		const pesRes = calculatePesantrenScore({
			tahsinMakhraj: Math.min(4, 2 + (i % 3)),
			tahsinTajwid: Math.min(4, 2 + ((i + 1) % 3)),
			tahsinKelancaran: Math.min(4, 3 + (i % 2)),
			tahsinAdab: 4,
			hasMemorization: i % 3 !== 0,
			tahfidzKelancaran: Math.min(4, 2 + (i % 3)),
			tahfidzMurojaah: Math.min(4, 2 + ((i + 1) % 3)),
			tahfidzTarget: Math.min(4, 3 + (i % 2)),
			tahfidzAdab: 4,
			kitabBacaGundul: Math.min(4, 2 + (i % 3)),
			kitabNahwuShorof: Math.min(4, 2 + ((i + 2) % 3)),
			kitabTerjemahPegon: Math.min(4, 2 + (i % 3)),
			kitabIsi: Math.min(4, 3 + (i % 2)),
			bInggrisSpeaking: Math.min(4, 2 + (i % 3)),
			bInggrisPronunciation: Math.min(4, 2 + ((i + 1) % 3)),
			bInggrisWriting: Math.min(4, 3 + (i % 2)),
			bInggrisVocab: Math.min(4, 2 + (i % 3)),
			bArabSpeaking: Math.min(4, 2 + ((i + 1) % 3)),
			bArabPronunciation: Math.min(4, 3 + (i % 2)),
			bArabWriting: Math.min(4, 2 + (i % 3)),
			bArabVocab: Math.min(4, 3 + (i % 2)),
			haditsHafalan: Math.min(4, 2 + (i % 3)),
			haditsKelancaran: Math.min(4, 3 + (i % 2)),
			haditsMakna: Math.min(4, 2 + ((i + 1) % 3)),
			haditsAdab: 4,
			adzanKelancaran: Math.min(4, 3 + (i % 2)),
			adzanMakhraj: Math.min(4, 3 + ((i + 1) % 2)),
			adzanSuara: Math.min(4, 2 + (i % 3)),
			sholatKelancaran: Math.min(4, 3 + (i % 2)),
			sholatMakhraj: Math.min(4, 3 + ((i + 1) % 2)),
			sholatAdab: 4
		});

		await db.insert(pesantrenScores).values({
			candidateId: cand.id,
			tahsinScore: pesRes.tahsinScore.toString(),
			hasMemorization: i % 3 !== 0,
			tahfidzScore: pesRes.tahfidzScore.toString(),
			combinedQuranScore: pesRes.combinedQuranScore.toString(),
			kitabKuningScore: pesRes.kitabKuningScore.toString(),
			bInggrisScore: pesRes.bInggrisScore.toString(),
			bArabScore: pesRes.bArabScore.toString(),
			haditsScore: pesRes.haditsScore.toString(),
			adzanScore: pesRes.adzanScore.toString(),
			sholatScore: pesRes.sholatScore.toString(),
			averageScore: pesRes.averageScore.toString(),
			lockStatus: 'LOCKED',
			examinerName: 'Ust. Nurul Huda, Lc.'
		});

		// Qualitative Interview Form Data
		await db.insert(qualitativeInterviews).values({
			candidateId: cand.id,
			formData: {
				prestasi: i % 2 === 0 ? 'Juara 1 MTQ Tingkat Kecamatan' : 'Pernah Lomba Futsal',
				anak_ke: (i % 4) + 1,
				dari_bersaudara: 3,
				pernah_pacaran: false,
				catatan_pacaran: 'Fokus belajar',
				pernah_merokok: false,
				catatan_merokok: 'Tidak pernah mencoba',
				bisa_komputer: true,
				aplikasi_komputer: 'Word, Canva, Scratch',
				bisa_editing: true,
				aplikasi_editing: 'CapCut',
				penyakit_alergi: 'Tidak ada',
				respons_ejekan: 'Mendoakan yang terbaik dan menjauh jika keterlaluan',
				sikap_malas: 'Wudhu dan istighfar',
				sikap_terhadap_teman_khusus: 'Merangkul dan membantu semampunya',
				inisiatif_mondok: 'Keinginan Sendiri & Didukung Ortu',
				hafalan_juz: `${(i % 5) + 1} Juz`,
				kitab_dipelajari: 'Safinatun Najah, Jurumiyah'
			},
			studentGeneralSummary: 'Santri memiliki kemandirian yang matang dan motivasi belajar vokasi yang tinggi.',
			studentPesantrenSummary: 'Kesiapan hidup berasrama sangat baik, komitmen ibadah tinggi.',
			parentCommitmentSummary: 'Orang tua berkomitmen penuh mendukung pembiayaan dan tata tertib pondok.',
			specialRecommendation: 'Sangat direkomendasikan masuk kuota utama.',
			interviewerName: 'Dra. Hj. Siti Aminah',
			completionStatus: 'COMPLETED'
		});

		// Final Ranking Composite Score
		const composite = Math.round(((tpaRes.finalScore100 + pesRes.averageScore) / 2) * 10) / 10;
		await db.insert(finalRankings).values({
			candidateId: cand.id,
			waveId: wave.id,
			compositeScore: composite.toString(),
			rankTpa: i + 1,
			rankPesantren: i + 1,
			rankParallel: i + 1,
			admissionStatus: i < 15 ? 'LULUS' : 'WAITING_LIST',
			approvedBy: 'Drs. H. M. Samsul, M.Pd.'
		});
	}

	return { message: 'Database successfully seeded with 20 candidates', waveId: wave.id };
}
