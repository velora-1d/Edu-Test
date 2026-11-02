import ExcelJS from 'exceljs';
import { db } from '$lib/server/db';
import { getActiveWave, getCandidatesWithScores } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const waveIdParam = url.searchParams.get('waveId');
		let waveId = waveIdParam;

		const activeWave = await getActiveWave();
		if (!waveId && activeWave) {
			waveId = activeWave.id;
		}

		const candidateList = await getCandidatesWithScores(waveId || undefined);

		// Urutkan berdasarkan rank parallel asc
		const sortedCandidates = [...candidateList].sort(
			(a, b) => (a.ranking?.rankParallel || 999) - (b.ranking?.rankParallel || 999)
		);

		const workbook = new ExcelJS.Workbook();
		workbook.creator = 'Edu-Test PPDB System';
		workbook.lastModifiedBy = 'Panitia PPDB';
		workbook.created = new Date();
		workbook.modified = new Date();

		const waveName = activeWave?.waveName || 'Gelombang 1 - TA 2027/2028';

		// ==========================================
		// SHEET 1: REKAP UTAMA
		// ==========================================
		const sheet1 = workbook.addWorksheet('Rekap Utama', {
			views: [{ showGridLines: true }]
		});

		// Title Block
		sheet1.mergeCells('A1:N1');
		const titleCell = sheet1.getCell('A1');
		titleCell.value = 'LEMBAR REKAPITULASI MASTER LEDGER & RANKING PARALEL';
		titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
		titleCell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF1E3A8A' } // Deep Blue
		};
		titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
		sheet1.getRow(1).height = 32;

		sheet1.mergeCells('A2:N2');
		const subCell = sheet1.getCell('A2');
		subCell.value = `Sistem Seleksi Edu-Test &bull; ${waveName} &bull; Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`;
		subCell.font = { italic: true, size: 10, color: { argb: 'FF334155' } };
		subCell.alignment = { horizontal: 'center', vertical: 'middle' };
		sheet1.getRow(2).height = 20;

		// Empty row 3
		sheet1.getRow(3).height = 10;

		// Header Columns Sheet 1
		const headers1 = [
			'Peringkat Paralel',
			'No Tes',
			'Nama Calon Santri',
			'Asal Sekolah',
			'Pilihan Jurusan',
			'Sesi Ruangan',
			'Skor TPA (100)',
			'Kategori TPA',
			'Rank TPA',
			'Skor Pesantren (100)',
			'Rank Pesantren',
			'Skor Komposit',
			'Status Kelulusan',
			'Catatan Pleno'
		];

		const headerRow1 = sheet1.addRow(headers1);
		headerRow1.height = 26;
		headerRow1.eachCell((cell) => {
			cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF2563EB' } // Royal Blue
			};
			cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
			cell.border = {
				top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
				right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
			};
		});

		// Data Rows Sheet 1
		sortedCandidates.forEach((c) => {
			const isLulus = c.ranking?.admissionStatus === 'LULUS';
			const row = sheet1.addRow([
				c.ranking?.rankParallel || '-',
				c.testNumber,
				c.fullName,
				c.schoolOrigin,
				c.majorChoice,
				c.roomAssignment || 'Ruang 1',
				c.tpaScore ? parseFloat(c.tpaScore.finalScore100) : 0,
				c.tpaScore?.category || '-',
				c.ranking?.rankTpa || '-',
				c.pesantrenScore ? parseFloat(c.pesantrenScore.averageScore) : 0,
				c.ranking?.rankPesantren || '-',
				c.ranking ? parseFloat(c.ranking.compositeScore) : 0,
				isLulus ? 'LULUS' : 'WAITING LIST',
				c.ranking?.overrideReason || '-'
			]);

			row.height = 20;
			row.eachCell((cell, colNumber) => {
				cell.font = { size: 9 };
				cell.border = {
					top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
				};

				// Alignments
				if (colNumber === 1 || colNumber === 2 || colNumber === 6 || colNumber === 9 || colNumber === 11 || colNumber === 13) {
					cell.alignment = { horizontal: 'center', vertical: 'middle' };
				} else if (colNumber === 7 || colNumber === 10 || colNumber === 12) {
					cell.alignment = { horizontal: 'right', vertical: 'middle' };
					cell.numFmt = '#,##0.00';
				} else {
					cell.alignment = { horizontal: 'left', vertical: 'middle' };
				}

				// Status styling
				if (colNumber === 13) {
					cell.font = { bold: true, size: 9, color: { argb: isLulus ? 'FF166534' : 'FF9A3412' } };
					cell.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: isLulus ? 'FFDCFCE7' : 'FFFEF3C7' }
					};
				}
			});
		});

		// Auto fit columns Sheet 1
		sheet1.columns = [
			{ width: 16 }, // Rank
			{ width: 16 }, // No Tes
			{ width: 28 }, // Nama
			{ width: 24 }, // Asal Sekolah
			{ width: 24 }, // Jurusan
			{ width: 16 }, // Sesi Ruangan
			{ width: 16 }, // Skor TPA
			{ width: 16 }, // Kategori
			{ width: 12 }, // Rank TPA
			{ width: 20 }, // Skor Pesantren
			{ width: 15 }, // Rank Pesantren
			{ width: 16 }, // Skor Komposit
			{ width: 18 }, // Status
			{ width: 30 }  // Catatan
		];

		// ==========================================
		// SHEET 2: RINCIAN TPA
		// ==========================================
		const sheet2 = workbook.addWorksheet('Rincian TPA', {
			views: [{ showGridLines: true }]
		});

		// Title Block Sheet 2
		sheet2.mergeCells('A1:S1');
		const titleCell2 = sheet2.getCell('A1');
		titleCell2.value = 'RINCIAN PEROLEHAN 12 SUBTES TES POTENSI AKADEMIK (TPA)';
		titleCell2.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
		titleCell2.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF1E3A8A' }
		};
		titleCell2.alignment = { horizontal: 'center', vertical: 'middle' };
		sheet2.getRow(1).height = 28;

		const headers2 = [
			'No',
			'No Tes',
			'Nama Santri',
			'Jurusan',
			'EYD (Max 3)',
			'Kohesi (Max 3)',
			'Logika (Max 6)',
			'Analogi (Max 6)',
			'Wacana (Max 6)',
			'MTK Hitung (Max 9)',
			'MTK Ruang (Max 9)',
			'B. Inggris (Max 6)',
			'B. Arab (Max 6)',
			'Tahfidz (Max 6)',
			'Tahsin (Max 3)',
			'Karakter (Max 6)',
			'Total Mentah (Max 69)',
			'Skor Skala 100',
			'Kategori'
		];

		const headerRow2 = sheet2.addRow(headers2);
		headerRow2.height = 26;
		headerRow2.eachCell((cell) => {
			cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF2563EB' }
			};
			cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
			cell.border = {
				top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
				right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
			};
		});

		sortedCandidates.forEach((c, i) => {
			const t = c.tpaScore;
			const row = sheet2.addRow([
				i + 1,
				c.testNumber,
				c.fullName,
				c.majorChoice,
				t ? t.eydCorrect * 1 : 0,
				t ? t.kohesiCorrect * 1 : 0,
				t ? t.logikaCorrect * 2 : 0,
				t ? t.analogiCorrect * 2 : 0,
				t ? t.wacanaCorrect * 2 : 0,
				t ? t.mtkHitungCorrect * 3 : 0,
				t ? t.mtkRuangCorrect * 3 : 0,
				t ? t.bInggrisCorrect * 2 : 0,
				t ? t.bArabCorrect * 2 : 0,
				t ? t.tahfidzCorrect * 2 : 0,
				t ? t.tahsinCorrect * 1 : 0,
				t ? t.karakterCorrect * 1 : 0,
				t ? t.rawTotalScore : 0,
				t ? parseFloat(t.finalScore100) : 0,
				t?.category || '-'
			]);

			row.height = 19;
			row.eachCell((cell, colNum) => {
				cell.font = { size: 9 };
				cell.border = {
					top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
				};

				if (colNum >= 5 && colNum <= 18) {
					cell.alignment = { horizontal: 'right', vertical: 'middle' };
					if (colNum === 18) cell.numFmt = '#,##0.00';
				} else if (colNum <= 2 || colNum === 19) {
					cell.alignment = { horizontal: 'center', vertical: 'middle' };
				} else {
					cell.alignment = { horizontal: 'left', vertical: 'middle' };
				}
			});
		});

		sheet2.columns = [
			{ width: 8 },  // No
			{ width: 16 }, // No Tes
			{ width: 28 }, // Nama
			{ width: 24 }, // Jurusan
			{ width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
			{ width: 14 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 },
			{ width: 12 }, { width: 12 },
			{ width: 16 }, // Total Mentah
			{ width: 15 }, // Skor 100
			{ width: 15 }  // Kategori
		];

		// ==========================================
		// SHEET 3: RINCIAN KEPESANTRENAN
		// ==========================================
		const sheet3 = workbook.addWorksheet('Rincian Kepesantrenan', {
			views: [{ showGridLines: true }]
		});

		sheet3.mergeCells('A1:O1');
		const titleCell3 = sheet3.getCell('A1');
		titleCell3.value = 'RINCIAN PENILAIAN RUBRIK KEPESANTRENAN (7 BIDANG UJI)';
		titleCell3.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
		titleCell3.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF1E3A8A' }
		};
		titleCell3.alignment = { horizontal: 'center', vertical: 'middle' };
		sheet3.getRow(1).height = 28;

		const headers3 = [
			'No',
			'No Tes',
			'Nama Santri',
			'Jurusan',
			'Tahsin (100)',
			'Ada Hafalan?',
			'Tahfidz (100)',
			'Gabungan Qur\'an (100)',
			'Kitab Kuning (100)',
			'B. Inggris (100)',
			'B. Arab (100)',
			'Hadits & Doa (100)',
			'Adzan (100)',
			'Sholat (100)',
			'Rata-rata 7 Bidang (100)'
		];

		const headerRow3 = sheet3.addRow(headers3);
		headerRow3.height = 26;
		headerRow3.eachCell((cell) => {
			cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF2563EB' }
			};
			cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
			cell.border = {
				top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
				bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
				right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
			};
		});

		sortedCandidates.forEach((c, i) => {
			const p = c.pesantrenScore;
			const row = sheet3.addRow([
				i + 1,
				c.testNumber,
				c.fullName,
				c.majorChoice,
				p ? parseFloat(p.tahsinScore) : 0,
				p?.hasMemorization ? 'Ya' : 'Tidak',
				p ? parseFloat(p.tahfidzScore) : 0,
				p ? parseFloat(p.combinedQuranScore) : 0,
				p ? parseFloat(p.kitabKuningScore) : 0,
				p ? parseFloat(p.bInggrisScore) : 0,
				p ? parseFloat(p.bArabScore) : 0,
				p ? parseFloat(p.haditsScore) : 0,
				p ? parseFloat(p.adzanScore) : 0,
				p ? parseFloat(p.sholatScore) : 0,
				p ? parseFloat(p.averageScore) : 0
			]);

			row.height = 19;
			row.eachCell((cell, colNum) => {
				cell.font = { size: 9 };
				cell.border = {
					top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
					right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
				};

				if (colNum >= 5 && colNum !== 6) {
					cell.alignment = { horizontal: 'right', vertical: 'middle' };
					cell.numFmt = '#,##0.00';
				} else if (colNum <= 2 || colNum === 6) {
					cell.alignment = { horizontal: 'center', vertical: 'middle' };
				} else {
					cell.alignment = { horizontal: 'left', vertical: 'middle' };
				}
			});
		});

		sheet3.columns = [
			{ width: 8 },  // No
			{ width: 16 }, // No Tes
			{ width: 28 }, // Nama
			{ width: 24 }, // Jurusan
			{ width: 14 }, // Tahsin
			{ width: 13 }, // Ada Hafalan
			{ width: 14 }, // Tahfidz
			{ width: 18 }, // Gab Qur'an
			{ width: 15 }, // Kitab
			{ width: 14 }, // Inggris
			{ width: 14 }, // Arab
			{ width: 15 }, // Hadits
			{ width: 13 }, // Adzan
			{ width: 13 }, // Sholat
			{ width: 18 }  // Rata-rata
		];

		// Generate Binary Buffer
		const buffer = await workbook.xlsx.writeBuffer();

		return new Response(buffer, {
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="Master-Ledger-EduTest-2027.xlsx"`
			}
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Gagal men-generate file export excel';
		console.error('Error saat export Excel:', err);
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
