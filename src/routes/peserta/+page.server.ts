import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { candidates } from '$lib/server/db/schema';
import {
	getActiveWave,
	createCandidate,
	updateCandidate,
	deleteCandidate,
	getMajors,
	getExamRooms,
	createMajor,
	updateMajor,
	deleteMajor,
	createExamRoom,
	updateExamRoom,
	deleteExamRoom,
	createWave,
	updateWave,
	activateWave,
	closeWave,
	deleteWave
} from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Concurrent fetch: waves, candidates, majors, exam rooms
	let [allWaves, candidateList, majorList, roomList] = await Promise.all([
		db.query.waves.findMany({
			with: {
				candidates: true
			},
			orderBy: (w, { desc }) => [desc(w.testDate)]
		}),
		db.query.candidates.findMany({
			with: {
				wave: true,
				tpaScore: true,
				pesantrenScore: true,
				interview: true,
				ranking: true
			},
			orderBy: [asc(candidates.testNumber)]
		}),
		getMajors(),
		getExamRooms()
	]);

	// Auto-seed only if candidates database is completely empty
	if (candidateList.length === 0) {
		await seedDatabase();
		[allWaves, candidateList, majorList, roomList] = await Promise.all([
			db.query.waves.findMany({
				with: {
					candidates: true
				},
				orderBy: (w, { desc }) => [desc(w.testDate)]
			}),
			db.query.candidates.findMany({
				with: {
					wave: true,
					tpaScore: true,
					pesantrenScore: true,
					interview: true,
					ranking: true
				},
				orderBy: [asc(candidates.testNumber)]
			}),
			getMajors(),
			getExamRooms()
		]);
	}

	const activeWave = allWaves.find((w) => w.status === 'ACTIVE') || null;

	return {
		activeWave,
		allWaves,
		candidates: candidateList,
		majors: majorList,
		examRooms: roomList
	};
};

export const actions: Actions = {
	createCandidate: async ({ request }) => {
		const data = await request.formData();
		const fullName = ((data.get('fullName') as string) || '').trim();
		const schoolOrigin = ((data.get('schoolOrigin') as string) || '').trim();
		const majorChoice = (data.get('majorChoice') as string) || 'Rekayasa Perangkat Lunak';
		const roomAssignment = (data.get('roomAssignment') as string) || 'Ruang 1 (Lab RPL)';
		const nisn = ((data.get('nisn') as string) || '').trim() || null;
		let waveId = (data.get('waveId') as string) || '';

		if (!fullName) {
			return fail(400, { error: 'Nama lengkap calon santri wajib diisi' });
		}
		if (!schoolOrigin) {
			return fail(400, { error: 'Asal sekolah wajib diisi' });
		}

		if (!waveId) {
			const activeWave = await getActiveWave();
			if (!activeWave) {
				return fail(400, { error: 'Tidak ada gelombang pendaftaran yang aktif' });
			}
			waveId = activeWave.id;
		}

		try {
			const created = await createCandidate({
				waveId,
				fullName,
				schoolOrigin,
				majorChoice,
				roomAssignment,
				nisn
			});

			return {
				success: true,
				action: 'create',
				message: `Calon santri ${created.fullName} (${created.testNumber}) berhasil didaftarkan.`
			};
		} catch (e: any) {
			console.error('Error createCandidate:', e);
			return fail(500, { error: e.message || 'Gagal mendaftarkan calon santri baru' });
		}
	},

	updateCandidate: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const fullName = ((data.get('fullName') as string) || '').trim();
		const schoolOrigin = ((data.get('schoolOrigin') as string) || '').trim();
		const majorChoice = data.get('majorChoice') as string;
		const roomAssignment = data.get('roomAssignment') as string;
		const nisn = ((data.get('nisn') as string) || '').trim() || null;

		if (!id) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}
		if (!fullName) {
			return fail(400, { error: 'Nama lengkap wajib diisi' });
		}

		try {
			const updated = await updateCandidate(id, {
				fullName,
				schoolOrigin,
				majorChoice,
				roomAssignment,
				nisn
			});

			return {
				success: true,
				action: 'update',
				message: `Data santri ${updated.fullName} berhasil diperbarui.`
			};
		} catch (e: any) {
			console.error('Error updateCandidate:', e);
			return fail(500, { error: e.message || 'Gagal memperbarui data calon santri' });
		}
	},

	deleteCandidate: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Peserta tidak valid' });
		}

		try {
			const deleted = await deleteCandidate(id);
			return {
				success: true,
				action: 'delete',
				message: `Calon santri ${deleted?.fullName || ''} berhasil dihapus beserta seluruh relasi nilainya.`
			};
		} catch (e: any) {
			console.error('Error deleteCandidate:', e);
			return fail(500, { error: e.message || 'Gagal menghapus calon santri' });
		}
	},

	// =========================================================================
	// CRUD: MASTER JURUSAN PILIHAN
	// =========================================================================
	createMajor: async ({ request }) => {
		const data = await request.formData();
		const name = ((data.get('name') as string) || '').trim();
		const code = ((data.get('code') as string) || '').trim().toUpperCase();
		const description = ((data.get('description') as string) || '').trim();

		if (!name || !code) {
			return fail(400, { error: 'Nama dan kode jurusan wajib diisi' });
		}

		try {
			const created = await createMajor({ name, code, description });
			return {
				success: true,
				action: 'createMajor',
				message: `Jurusan ${created.name} (${created.code}) berhasil ditambahkan.`
			};
		} catch (e: any) {
			console.error('Error createMajor:', e);
			return fail(500, { error: e.message || 'Gagal menambahkan jurusan baru' });
		}
	},

	updateMajor: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = ((data.get('name') as string) || '').trim();
		const code = ((data.get('code') as string) || '').trim().toUpperCase();
		const description = ((data.get('description') as string) || '').trim();

		if (!id || !name || !code) {
			return fail(400, { error: 'ID, nama, dan kode jurusan wajib diisi' });
		}

		try {
			const updated = await updateMajor(id, { name, code, description });
			return {
				success: true,
				action: 'updateMajor',
				message: `Jurusan ${updated?.name} berhasil diperbarui.`
			};
		} catch (e: any) {
			console.error('Error updateMajor:', e);
			return fail(500, { error: e.message || 'Gagal memperbarui jurusan' });
		}
	},

	deleteMajor: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Jurusan tidak valid' });
		}

		try {
			const deleted = await deleteMajor(id);
			return {
				success: true,
				action: 'deleteMajor',
				message: `Jurusan ${deleted?.name} berhasil dihapus.`
			};
		} catch (e: any) {
			console.error('Error deleteMajor:', e);
			return fail(500, { error: e.message || 'Gagal menghapus jurusan' });
		}
	},

	// =========================================================================
	// CRUD: MASTER ALOKASI RUANG UJIAN
	// =========================================================================
	createExamRoom: async ({ request }) => {
		const data = await request.formData();
		const name = ((data.get('name') as string) || '').trim();
		const capacity = parseInt((data.get('capacity') as string) || '30', 10);
		const location = ((data.get('location') as string) || '').trim();

		if (!name) {
			return fail(400, { error: 'Nama ruang ujian wajib diisi' });
		}

		try {
			const created = await createExamRoom({ name, capacity, location });
			return {
				success: true,
				action: 'createExamRoom',
				message: `Ruang ujian ${created.name} berhasil ditambahkan.`
			};
		} catch (e: any) {
			console.error('Error createExamRoom:', e);
			return fail(500, { error: e.message || 'Gagal menambahkan ruang ujian baru' });
		}
	},

	updateExamRoom: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = ((data.get('name') as string) || '').trim();
		const capacity = parseInt((data.get('capacity') as string) || '30', 10);
		const location = ((data.get('location') as string) || '').trim();

		if (!id || !name) {
			return fail(400, { error: 'ID dan nama ruang ujian wajib diisi' });
		}

		try {
			const updated = await updateExamRoom(id, { name, capacity, location });
			return {
				success: true,
				action: 'updateExamRoom',
				message: `Ruang ujian ${updated?.name} berhasil diperbarui.`
			};
		} catch (e: any) {
			console.error('Error updateExamRoom:', e);
			return fail(500, { error: e.message || 'Gagal memperbarui ruang ujian' });
		}
	},

	deleteExamRoom: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Ruang ujian tidak valid' });
		}

		try {
			const deleted = await deleteExamRoom(id);
			return {
				success: true,
				action: 'deleteExamRoom',
				message: `Ruang ujian ${deleted?.name} berhasil dihapus.`
			};
		} catch (e: any) {
			console.error('Error deleteExamRoom:', e);
			return fail(500, { error: e.message || 'Gagal menghapus ruang ujian' });
		}
	},

	// =========================================================================
	// CRUD & SWITCH: MASTER GELOMBANG & TAHUN AJARAN
	// =========================================================================
	createWave: async ({ request }) => {
		const data = await request.formData();
		const waveName = ((data.get('waveName') as string) || '').trim();
		const academicYear = ((data.get('academicYear') as string) || '2027/2028').trim();
		const dateStr = (data.get('testDate') as string) || '';
		const quotaCapacity = parseInt((data.get('quotaCapacity') as string) || '20', 10);
		const status = ((data.get('status') as string) || 'DRAFT').toUpperCase();

		if (!waveName) {
			return fail(400, { error: 'Nama gelombang seleksi wajib diisi' });
		}
		if (!academicYear) {
			return fail(400, { error: 'Tahun ajaran wajib diisi (misal: 2027/2028)' });
		}

		const testDate = dateStr ? new Date(dateStr) : new Date();

		try {
			const created = await createWave({
				waveName,
				academicYear,
				testDate,
				quotaCapacity: isNaN(quotaCapacity) || quotaCapacity < 1 ? 20 : quotaCapacity,
				status
			});

			return {
				success: true,
				action: 'createWave',
				message: `Gelombang ${created.waveName} (${created.academicYear}) berhasil dibuat.`
			};
		} catch (e: any) {
			console.error('Error createWave:', e);
			return fail(500, { error: e.message || 'Gagal membuat gelombang baru' });
		}
	},

	updateWave: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const waveName = ((data.get('waveName') as string) || '').trim();
		const academicYear = ((data.get('academicYear') as string) || '').trim();
		const dateStr = (data.get('testDate') as string) || '';
		const quotaCapacity = parseInt((data.get('quotaCapacity') as string) || '20', 10);
		const status = ((data.get('status') as string) || '').toUpperCase();

		if (!id) {
			return fail(400, { error: 'ID Gelombang tidak valid' });
		}
		if (!waveName) {
			return fail(400, { error: 'Nama gelombang wajib diisi' });
		}

		try {
			const updatePayload: Record<string, any> = {
				waveName,
				quotaCapacity: isNaN(quotaCapacity) || quotaCapacity < 1 ? 20 : quotaCapacity
			};
			if (academicYear) updatePayload.academicYear = academicYear;
			if (dateStr) updatePayload.testDate = new Date(dateStr);
			if (status) updatePayload.status = status;

			const updated = await updateWave(id, updatePayload);

			return {
				success: true,
				action: 'updateWave',
				message: `Gelombang ${updated?.waveName} berhasil diperbarui.`
			};
		} catch (e: any) {
			console.error('Error updateWave:', e);
			return fail(500, { error: e.message || 'Gagal memperbarui gelombang' });
		}
	},

	activateWave: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Gelombang tidak valid' });
		}

		try {
			const activated = await activateWave(id);
			return {
				success: true,
				action: 'activateWave',
				message: `Gelombang ${activated?.waveName} (${activated?.academicYear}) kini telah diaktifkan.`
			};
		} catch (e: any) {
			console.error('Error activateWave:', e);
			return fail(500, { error: e.message || 'Gagal mengaktifkan gelombang' });
		}
	},

	closeWave: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Gelombang tidak valid' });
		}

		try {
			const closed = await closeWave(id);
			return {
				success: true,
				action: 'closeWave',
				message: `Gelombang ${closed?.waveName} telah ditutup.`
			};
		} catch (e: any) {
			console.error('Error closeWave:', e);
			return fail(500, { error: e.message || 'Gagal menutup gelombang' });
		}
	},

	deleteWave: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID Gelombang tidak valid' });
		}

		try {
			const deleted = await deleteWave(id);
			return {
				success: true,
				action: 'deleteWave',
				message: `Gelombang ${deleted?.waveName} berhasil dihapus.`
			};
		} catch (e: any) {
			console.error('Error deleteWave:', e);
			return fail(400, { error: e.message || 'Gagal menghapus gelombang' });
		}
	}
};
