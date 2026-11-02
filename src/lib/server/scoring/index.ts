// Core Scoring Engine for Edu-Test

export interface TpaInput {
	eyd: number; // 0 - 3 (weight 1)
	kohesi: number; // 0 - 3 (weight 1)
	logika: number; // 0 - 3 (weight 2)
	analogi: number; // 0 - 3 (weight 2)
	wacana: number; // 0 - 3 (weight 2)
	mtkHitung: number; // 0 - 3 (weight 3)
	mtkRuang: number; // 0 - 3 (weight 3)
	bInggris: number; // 0 - 3 (weight 2)
	bArab: number; // 0 - 3 (weight 2)
	tahfidz: number; // 0 - 3 (weight 2)
	tahsin: number; // 0 - 3 (weight 1)
	karakter: number; // 0 - 6 (weight 1)
}

export interface TpaResult {
	rawTotal: number;
	finalScore100: number;
	category: 'Sangat Buruk' | 'Buruk' | 'Sedang' | 'Baik' | 'Sangat Baik';
}

export function calculateTpaScore(input: TpaInput): TpaResult {
	const rawTotal =
		input.eyd * 1 +
		input.kohesi * 1 +
		input.logika * 2 +
		input.analogi * 2 +
		input.wacana * 2 +
		input.mtkHitung * 3 +
		input.mtkRuang * 3 +
		input.bInggris * 2 +
		input.bArab * 2 +
		input.tahfidz * 2 +
		input.tahsin * 1 +
		input.karakter * 1;

	// Scale to 100 based on max 69 raw points
	const finalScore100 = Math.round((rawTotal / 69) * 100 * 10) / 10;

	let category: TpaResult['category'] = 'Sangat Buruk';
	if (finalScore100 <= 20) {
		category = 'Sangat Buruk';
	} else if (finalScore100 <= 40) {
		category = 'Buruk';
	} else if (finalScore100 <= 60) {
		category = 'Sedang';
	} else if (finalScore100 <= 80) {
		category = 'Baik';
	} else {
		category = 'Sangat Baik';
	}

	return { rawTotal, finalScore100, category };
}

// 7 Rubrik Kepesantrenan (Scale 1 - 4)
export interface PesantrenInput {
	// Tahsin & Tahfidz
	tahsinMakhraj: number; // 1-4 -> 10,15,20,25
	tahsinTajwid: number;
	tahsinKelancaran: number;
	tahsinAdab: number;
	hasMemorization: boolean;
	tahfidzKelancaran?: number | null;
	tahfidzMurojaah?: number | null;
	tahfidzTarget?: number | null;
	tahfidzAdab?: number | null;

	// Kitab Kuning
	kitabBacaGundul: number;
	kitabNahwuShorof: number;
	kitabTerjemahPegon: number;
	kitabIsi: number;

	// Bahasa Inggris
	bInggrisSpeaking: number; // 40% -> 10,20,30,40
	bInggrisPronunciation: number; // 20% -> 5,10,15,20
	bInggrisWriting: number; // 20% -> 5,10,15,20
	bInggrisVocab: number; // 20% -> 5,10,15,20

	// Bahasa Arab
	bArabSpeaking: number;
	bArabPronunciation: number;
	bArabWriting: number;
	bArabVocab: number;

	// Hadits
	haditsHafalan: number; // 40% -> 10,20,30,40
	haditsKelancaran: number; // 20% -> 5,10,15,20
	haditsMakna: number; // 20% -> 5,10,15,20
	haditsAdab: number; // 20% -> 5,10,15,20

	// Adzan
	adzanKelancaran: number; // 50% -> 20,30,40,50
	adzanMakhraj: number; // 30% -> 10,15,20,30
	adzanSuara: number; // 20% -> 5,10,15,20

	// Bacaan Sholat
	sholatKelancaran: number; // 50% -> 20,30,40,50
	sholatMakhraj: number; // 30% -> 10,15,20,30
	sholatAdab: number; // 20% -> 5,10,15,20
}

export interface PesantrenResult {
	tahsinScore: number;
	tahfidzScore: number;
	combinedQuranScore: number;
	kitabKuningScore: number;
	bInggrisScore: number;
	bArabScore: number;
	haditsScore: number;
	adzanScore: number;
	sholatScore: number;
	averageScore: number;
}

const map25 = (val: number) => [0, 10, 15, 20, 25][val] || 0;
const map40 = (val: number) => [0, 10, 20, 30, 40][val] || 0;
const map20 = (val: number) => [0, 5, 10, 15, 20][val] || 0;
const map50 = (val: number) => [0, 20, 30, 40, 50][val] || 0;
const map30 = (val: number) => [0, 10, 15, 20, 30][val] || 0;

export function calculatePesantrenScore(input: PesantrenInput): PesantrenResult {
	const tahsinScore =
		map25(input.tahsinMakhraj) +
		map25(input.tahsinTajwid) +
		map25(input.tahsinKelancaran) +
		map25(input.tahsinAdab);

	let tahfidzScore = 0;
	if (input.hasMemorization) {
		tahfidzScore =
			map25(input.tahfidzKelancaran || 1) +
			map25(input.tahfidzMurojaah || 1) +
			map25(input.tahfidzTarget || 1) +
			map25(input.tahfidzAdab || 1);
	}

	const combinedQuranScore = input.hasMemorization
		? Math.round((tahsinScore + tahfidzScore) / 2)
		: tahsinScore;

	const kitabKuningScore =
		map25(input.kitabBacaGundul) +
		map25(input.kitabNahwuShorof) +
		map25(input.kitabTerjemahPegon) +
		map25(input.kitabIsi);

	const bInggrisScore =
		map40(input.bInggrisSpeaking) +
		map20(input.bInggrisPronunciation) +
		map20(input.bInggrisWriting) +
		map20(input.bInggrisVocab);

	const bArabScore =
		map40(input.bArabSpeaking) +
		map20(input.bArabPronunciation) +
		map20(input.bArabWriting) +
		map20(input.bArabVocab);

	const haditsScore =
		map40(input.haditsHafalan) +
		map20(input.haditsKelancaran) +
		map20(input.haditsMakna) +
		map20(input.haditsAdab);

	const adzanScore =
		map50(input.adzanKelancaran) +
		map30(input.adzanMakhraj) +
		map20(input.adzanSuara);

	const sholatScore =
		map50(input.sholatKelancaran) +
		map30(input.sholatMakhraj) +
		map20(input.sholatAdab);

	const averageScore = Math.round(
		((combinedQuranScore + kitabKuningScore + bInggrisScore + bArabScore + haditsScore + adzanScore + sholatScore) / 7) * 10
	) / 10;

	return {
		tahsinScore,
		tahfidzScore,
		combinedQuranScore,
		kitabKuningScore,
		bInggrisScore,
		bArabScore,
		haditsScore,
		adzanScore,
		sholatScore,
		averageScore
	};
}
