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
	deleteExamRoom
} from '$lib/server/db/queries';
import { seedDatabase } from '$lib/server/seed';
import { asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Auto seed if empty
	const existing = await db.select().from(candidates);
	if (existing.length === 0) {
		await seedDatabase();
	}

	const activeWave = await getActiveWave();
	const allWaves = await db.query.waves.findMany({
		orderBy: (w, { desc }) => [desc(w.testDate)]
	});

	const [candidateList, majorList, roomList] = await Promise.all([
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
	}
};
