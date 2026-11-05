<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		Users,
		Search,
		Filter,
		CheckCircle2,
		Clock,
		AlertCircle,
		ArrowRight,
		School,
		Check,
		X,
		Plus,
		Edit3,
		Trash2,
		SlidersHorizontal,
		Building2,
		GraduationCap,
		IdCard,
		AlertTriangle,
		ShieldAlert
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	// Search & Filter State
	let searchQuery = $state('');
	let selectedMajor = $state('ALL');
	let selectedPipeline = $state('ALL');
	let selectedWave = $state('ALL');

	// Modal States
	let showCreateModal = $state(false);
	let editingCandidate = $state<any>(null);
	let deletingCandidate = $state<any>(null);
	let isSubmitting = $state(false);

	// Master Data CRUD States (Jurusan & Ruang)
	let showMasterModal = $state(false);
	let activeMasterTab = $state<'majors' | 'rooms'>('majors');
	let isSubmittingMaster = $state(false);

	// Major CRUD Form State
	let showAddMajorForm = $state(false);
	let newMajorName = $state('');
	let newMajorCode = $state('');
	let newMajorDesc = $state('');
	let editingMajor = $state<{ id: string; name: string; code: string; description: string | null } | null>(null);
	let deletingMajor = $state<{ id: string; name: string } | null>(null);

	// Room CRUD Form State
	let showAddRoomForm = $state(false);
	let newRoomName = $state('');
	let newRoomCapacity = $state(30);
	let newRoomLocation = $state('');
	let editingRoom = $state<{ id: string; name: string; capacity: number; location: string | null } | null>(null);
	let deletingRoom = $state<{ id: string; name: string } | null>(null);

	// Create Form State
	let createFullName = $state('');
	let createNisn = $state('');
	let createSchoolOrigin = $state('');
	let createMajorChoice = $state('Rekayasa Perangkat Lunak');
	let createRoomAssignment = $state('Ruang 1 (Lab RPL)');
	let createWaveId = $state('');

	$effect(() => {
		if (!createWaveId && data.activeWave?.id) {
			createWaveId = data.activeWave.id;
		}
		if (data.majors && data.majors.length > 0 && !createMajorChoice) {
			createMajorChoice = data.majors[0].name;
		}
		if (data.examRooms && data.examRooms.length > 0 && !createRoomAssignment) {
			createRoomAssignment = data.examRooms[0].name;
		}
	});

	// Edit Form State
	let editFullName = $state('');
	let editNisn = $state('');
	let editSchoolOrigin = $state('');
	let editMajorChoice = $state('Rekayasa Perangkat Lunak');
	let editRoomAssignment = $state('Ruang 1 (Lab RPL)');
	let editStatusPipeline = $state('REGISTERED');
	let editWaveId = $state('');

	function openEditModal(c: any) {
		editingCandidate = c;
		editFullName = c.fullName;
		editNisn = c.nisn || '';
		editSchoolOrigin = c.schoolOrigin;
		editMajorChoice = c.majorChoice;
		editRoomAssignment = c.roomAssignment || 'Ruang 1 (Lab RPL)';
		editStatusPipeline = c.statusPipeline;
		editWaveId = c.waveId;
	}

	function closeEditModal() {
		editingCandidate = null;
	}

	function openDeleteModal(c: any) {
		deletingCandidate = c;
	}

	function closeDeleteModal() {
		deletingCandidate = null;
	}

	const filteredCandidates = $derived(
		data.candidates.filter((c) => {
			const matchesSearch =
				searchQuery.trim() === '' ||
				c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(c.nisn && c.nisn.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesMajor = selectedMajor === 'ALL' || c.majorChoice === selectedMajor;
			const matchesPipeline = selectedPipeline === 'ALL' || c.statusPipeline === selectedPipeline;
			const matchesWave = selectedWave === 'ALL' || c.waveId === selectedWave;

			return matchesSearch && matchesMajor && matchesPipeline && matchesWave;
		})
	);

	const counts = $derived({
		total: data.candidates.length,
		completed: data.candidates.filter((c) => c.statusPipeline === 'COMPLETED').length,
		inTest: data.candidates.filter((c) => c.statusPipeline === 'IN_TEST').length,
		registered: data.candidates.filter((c) => c.statusPipeline === 'REGISTERED').length
	});
</script>

<svelte:head>
	<title>Data Calon Santri & Admisi | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Alert Feedback Notification -->
	{#if form?.success}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-2xs">
			<div class="flex items-center gap-3">
				<div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
					<Check class="w-4 h-4" />
				</div>
				<div>
					<p class="font-bold text-xs text-emerald-950">Aksi Berhasil</p>
					<p class="text-xs text-emerald-700">{form.message}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => { if (form) form.success = false; }}
				class="text-emerald-600 hover:text-emerald-900 p-1"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{:else if form?.error}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-2xs">
			<div class="flex items-center gap-3">
				<div class="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
					<AlertTriangle class="w-4 h-4" />
				</div>
				<div>
					<p class="font-bold text-xs text-rose-950">Gagal Memproses Data</p>
					<p class="text-xs text-rose-700">{form.error}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => { if (form) form.error = null; }}
				class="text-rose-600 hover:text-rose-900 p-1"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/if}

	<!-- Professional Header (Clean, High Density, Zero Slop) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-bold text-slate-900 tracking-tight">Data Calon Santri</h1>
				<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
					Gelombang {data.activeWave?.waveName || '1'}
				</span>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				Kelola registrasi peserta, jurusan pilihan, dan alokasi ruang ujian
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0 flex-wrap">
			<button
				type="button"
				onclick={() => (showMasterModal = true)}
				class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition shadow-2xs active:scale-95"
			>
				<SlidersHorizontal class="w-3.5 h-3.5 text-blue-700" />
				<span>Kelola Jurusan & Ruang</span>
			</button>
			<button
				type="button"
				onclick={() => (showCreateModal = true)}
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs shadow-blue-700/20 transition active:scale-95"
			>
				<Plus class="w-3.5 h-3.5 stroke-[3]" />
				<span>+ Tambah Santri</span>
			</button>
		</div>
	</div>

	<!-- Stats Summary Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Total Terdaftar</span>
				<p class="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{counts.total}</p>
				<span class="text-[11px] text-blue-600 font-medium">Gelombang {data.activeWave?.waveName || '1'}</span>
			</div>
			<div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
				<Users class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Selesai Dinilai</span>
				<p class="text-2xl font-bold text-emerald-700 mt-0.5 tabular-nums">{counts.completed}</p>
				<span class="text-[11px] text-emerald-600 font-medium">Siap Sidang Pleno</span>
			</div>
			<div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
				<CheckCircle2 class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Sedang Ujian</span>
				<p class="text-2xl font-bold text-blue-600 mt-0.5 tabular-nums">{counts.inTest}</p>
				<span class="text-[11px] text-blue-600 font-medium">Dalam Proses Penguji</span>
			</div>
			<div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
				<Clock class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Belum Diuji</span>
				<p class="text-2xl font-bold text-amber-700 mt-0.5 tabular-nums">{counts.registered}</p>
				<span class="text-[11px] text-amber-600 font-medium">Menunggu Giliran</span>
			</div>
			<div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
				<AlertCircle class="w-5 h-5" />
			</div>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
		<!-- Search Input -->
		<div class="relative flex-1">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama santri, no tes (G1-...), asal sekolah, atau NISN..."
				class="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
			/>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- Filter Jurusan -->
			<select
				bind:value={selectedMajor}
				class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
			>
				<option value="ALL">Semua Jurusan</option>
				{#if data.majors && data.majors.length > 0}
					{#each data.majors as m}
						<option value={m.name}>{m.name} ({m.code})</option>
					{/each}
				{:else}
					<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
					<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
					<option value="Bisnis Digital">Bisnis Digital (BD)</option>
				{/if}
			</select>

			<!-- Filter Status Pipeline -->
			<select
				bind:value={selectedPipeline}
				class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
			>
				<option value="ALL">Semua Status</option>
				<option value="COMPLETED">Selesai (Completed)</option>
				<option value="IN_TEST">Sedang Ujian (In Test)</option>
				<option value="REGISTERED">Belum Diuji (Registered)</option>
			</select>

			<!-- Filter Gelombang -->
			<select
				bind:value={selectedWave}
				class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
			>
				<option value="ALL">Semua Gelombang</option>
				{#each data.allWaves as w}
					<option value={w.id}>{w.waveName}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Candidate Table Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
					<tr>
						<th class="py-3 px-3.5 w-10 text-center">No</th>
						<th class="py-3 px-3.5">No Tes & NISN</th>
						<th class="py-3 px-3.5">Nama Calon Santri</th>
						<th class="py-3 px-3.5">Asal Sekolah</th>
						<th class="py-3 px-3.5">Jurusan</th>
						<th class="py-3 px-3.5">Ruangan</th>
						<th class="py-3 px-3.5 text-center">Progres Ujian</th>
						<th class="py-3 px-3.5 text-center">Status</th>
						<th class="py-3 px-3.5 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredCandidates.length === 0}
						<tr>
							<td colspan="9" class="py-12 text-center text-slate-400">
								<Users class="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
								<p class="font-medium text-sm text-slate-600">Tidak ada calon santri yang cocok.</p>
								<p class="text-xs text-slate-400 mt-0.5">Ubah kata kunci pencarian atau sesuaikan filter.</p>
							</td>
						</tr>
					{:else}
						{#each filteredCandidates as c, i}
							{@const isTpaLocked = c.tpaScore?.lockStatus === 'LOCKED'}
							{@const isPesantrenLocked = c.pesantrenScore?.lockStatus === 'LOCKED'}
							{@const isInterviewDone = c.interview?.completionStatus === 'COMPLETED'}
							{@const stifinType = (c.interview?.formData as Record<string, any>)?.stifin_type}

							<tr class="hover:bg-blue-50/30 transition">
								<td class="py-3 px-3.5 text-center font-semibold text-slate-400">{i + 1}</td>

								<!-- No Tes & NISN -->
								<td class="py-3 px-3.5 whitespace-nowrap">
									<div class="font-mono font-bold text-blue-900 text-xs">{c.testNumber}</div>
									<div class="text-[10px] text-slate-400 font-mono mt-0.5">
										{c.nisn ? `NISN: ${c.nisn}` : 'NISN: -'}
									</div>
								</td>

								<!-- Nama Calon Santri -->
								<td class="py-3 px-3.5">
									<div class="flex items-center gap-2">
										<div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] shrink-0">
											{c.fullName.substring(0, 2).toUpperCase()}
										</div>
										<div>
											<div class="flex items-center gap-1.5 flex-wrap">
												<span class="font-bold text-slate-900 text-xs">{c.fullName}</span>
												{#if stifinType && stifinType !== 'Belum Tes'}
													<span class="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Hasil STIFIn: {stifinType}">
														{stifinType}
													</span>
												{/if}
											</div>
										</div>
									</div>
								</td>

								<!-- Asal Sekolah -->
								<td class="py-3 px-3.5 text-slate-600">
									<div class="flex items-center gap-1.5 max-w-[170px] truncate" title={c.schoolOrigin}>
										<School class="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span class="truncate">{c.schoolOrigin}</span>
									</div>
								</td>

								<!-- Jurusan -->
								<td class="py-3 px-3.5 whitespace-nowrap">
									<span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold {c.majorChoice === 'Rekayasa Perangkat Lunak'
										? 'bg-blue-50 text-blue-700 border border-blue-200'
										: c.majorChoice === 'Desain Komunikasi Visual'
											? 'bg-amber-50 text-amber-700 border border-amber-200'
											: 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
										{c.majorChoice === 'Rekayasa Perangkat Lunak' ? 'RPL' : c.majorChoice === 'Desain Komunikasi Visual' ? 'DKV' : 'Bisnis Digital'}
									</span>
								</td>

								<!-- Ruang Sesi -->
								<td class="py-3 px-3.5 text-slate-600 font-medium whitespace-nowrap text-xs">
									{c.roomAssignment || 'Ruang 1'}
								</td>

								<!-- Direct Links to Test Desks (TPA, Santri, Wawancara) -->
								<td class="py-3 px-3.5 text-center">
									<div class="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
										<!-- TPA Desk Link -->
										<a
											href="/tpa?candidateId={c.id}"
											title="Tes TPA: {isTpaLocked ? 'Selesai (' + c.tpaScore?.finalScore100 + ' • ' + c.tpaScore?.rawTotalScore + '/69 poin)' : 'Belum Diuji'}"
											class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition shadow-2xs {isTpaLocked
												? 'bg-blue-700 text-white hover:bg-blue-800'
												: 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}"
										>
											TPA
										</a>

										<!-- Pesantren Desk Link -->
										<a
											href="/rubrik?candidateId={c.id}"
											title="Tes Kepesantrenan: {isPesantrenLocked ? 'Selesai (Rata: ' + c.pesantrenScore?.averageScore + ')' : 'Belum Diuji'}"
											class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition shadow-2xs {isPesantrenLocked
												? 'bg-emerald-700 text-white hover:bg-emerald-800'
												: 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'}"
										>
											Santri
										</a>

										<!-- Wawancara Desk Link -->
										<a
											href="/wawancara?candidateId={c.id}"
											title="Wawancara: {isInterviewDone ? 'Selesai' : 'Belum Diisi'}"
											class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition shadow-2xs {isInterviewDone
												? 'bg-blue-600 text-white hover:bg-blue-700'
												: 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}"
										>
											Wwcr
										</a>
									</div>
								</td>

								<!-- Pipeline Status -->
								<td class="py-3 px-3.5 text-center whitespace-nowrap">
									{#if c.statusPipeline === 'COMPLETED'}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
											<Check class="w-3 h-3 stroke-[3]" /> Lengkap
										</span>
									{:else if c.statusPipeline === 'IN_TEST'}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
											<Clock class="w-3 h-3" /> Sedang Uji
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
											Belum Diuji
										</span>
									{/if}
								</td>

								<!-- Action Buttons -->
								<td class="py-3 px-3.5 text-center whitespace-nowrap">
									<div class="inline-flex items-center gap-1">
										<!-- Direct Test Action -->
										<a
											href="/tpa?candidateId={c.id}"
											class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] shadow-2xs transition"
											title="Mulai Penilaian Ujian"
										>
											<span>Nilai</span>
											<ArrowRight class="w-3 h-3" />
										</a>

										<!-- Edit Candidate Action -->
										<button
											type="button"
											onclick={() => openEditModal(c)}
											class="p-1 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition"
											title="Edit Data Santri"
										>
											<Edit3 class="w-3.5 h-3.5" />
										</button>

										<!-- Delete Candidate Action -->
										<button
											type="button"
											onclick={() => openDeleteModal(c)}
											class="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
											title="Hapus Santri"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Clean Table Footer -->
		<div class="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
			<span>Menampilkan <strong class="text-slate-800 tabular-nums">{filteredCandidates.length}</strong> dari <strong class="text-slate-800 tabular-nums">{data.candidates.length}</strong> calon santri</span>
			<div class="flex items-center gap-3 text-slate-500 text-[11px]">
				<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-700"></span><span>TPA (Akademik)</span></span>
				<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-700"></span><span>Santri (Ibadah)</span></span>
				<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-600"></span><span>Wwcr (Wawancara)</span></span>
			</div>
		</div>
	</div>
</div>

<!-- Modal 1: Tambah Santri Baru -->
{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
			<!-- Modal Header -->
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
						<Plus class="w-5 h-5 stroke-[3]" />
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900">Pendaftaran Calon Santri</h2>
						<p class="text-xs text-slate-500">Nomor tes akan dibuat otomatis sesuai jurusan pilihan</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (showCreateModal = false)}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<form
				method="POST"
				action="?/createCandidate"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
						showCreateModal = false;
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="waveId" value={createWaveId} />

				<!-- Nama Lengkap -->
				<div>
					<label for="create_fullName" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
						Nama Lengkap <span class="text-rose-500">*</span>
					</label>
					<input
						id="create_fullName"
						type="text"
						name="fullName"
						bind:value={createFullName}
						required
						placeholder="Contoh: Muhammad Farhan Al-Fatih"
						class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- NISN -->
					<div>
						<label for="create_nisn" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							NISN (10 Digit)
						</label>
						<input
							id="create_nisn"
							type="text"
							name="nisn"
							bind:value={createNisn}
							placeholder="Contoh: 0081234567"
							class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>

					<!-- Asal Sekolah -->
					<div>
						<label for="create_schoolOrigin" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							Asal Sekolah <span class="text-rose-500">*</span>
						</label>
						<input
							id="create_schoolOrigin"
							type="text"
							name="schoolOrigin"
							bind:value={createSchoolOrigin}
							required
							placeholder="Contoh: SMPIT Insan Mandiri"
							class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Pilihan Jurusan -->
					<div>
						<div class="flex items-center justify-between mb-1">
							<label for="create_majorChoice" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
								Jurusan Pilihan <span class="text-rose-500">*</span>
							</label>
							<button
								type="button"
								onclick={() => { showMasterModal = true; activeMasterTab = 'majors'; }}
								class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
							>
								+ Kelola Jurusan
							</button>
						</div>
						<select
							id="create_majorChoice"
							name="majorChoice"
							bind:value={createMajorChoice}
							class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							{#if data.majors && data.majors.length > 0}
								{#each data.majors as m}
									<option value={m.name}>{m.name} ({m.code})</option>
								{/each}
							{:else}
								<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
								<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
								<option value="Bisnis Digital">Bisnis Digital (BD)</option>
							{/if}
						</select>
					</div>

					<!-- Sesi Ruangan -->
					<div>
						<div class="flex items-center justify-between mb-1">
							<label for="create_roomAssignment" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
								Ruang Ujian
							</label>
							<button
								type="button"
								onclick={() => { showMasterModal = true; activeMasterTab = 'rooms'; }}
								class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
							>
								+ Kelola Ruang
							</button>
						</div>
						<select
							id="create_roomAssignment"
							name="roomAssignment"
							bind:value={createRoomAssignment}
							class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							{#if data.examRooms && data.examRooms.length > 0}
								{#each data.examRooms as r}
									<option value={r.name}>{r.name}{r.location ? ` - ${r.location}` : ''}</option>
								{/each}
							{:else}
								<option value="Ruang 1 (Lab RPL)">Ruang 1 (Lab RPL)</option>
								<option value="Ruang 2 (Lab DKV)">Ruang 2 (Lab DKV)</option>
								<option value="Ruang 3 (Kelas A)">Ruang 3 (Kelas A)</option>
								<option value="Ruang 4 (Kelas B)">Ruang 4 (Kelas B)</option>
							{/if}
						</select>
					</div>
				</div>

				<!-- Modal Actions -->
				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
					>
						{#if isSubmitting}
							<Clock class="w-3.5 h-3.5 animate-spin" />
							<span>Menyimpan...</span>
						{:else}
							<Check class="w-3.5 h-3.5 stroke-[3]" />
							<span>Simpan & Daftarkan</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal 2: Edit Data Santri -->
{#if editingCandidate}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
			<!-- Modal Header -->
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
						<Edit3 class="w-5 h-5 stroke-[2.5]" />
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900">Edit Data Santri</h2>
						<p class="text-xs text-slate-500">
							No Tes: <strong class="text-blue-700 font-mono">{editingCandidate.testNumber}</strong>
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={closeEditModal}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<form
				method="POST"
				action="?/updateCandidate"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
						editingCandidate = null;
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="candidateId" value={editingCandidate.id} />
				<input type="hidden" name="waveId" value={editWaveId} />

				<!-- Nama Lengkap -->
				<div>
					<label for="edit_fullName" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
						Nama Lengkap <span class="text-rose-500">*</span>
					</label>
					<input
						id="edit_fullName"
						type="text"
						name="fullName"
						bind:value={editFullName}
						required
						class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- NISN -->
					<div>
						<label for="edit_nisn" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							NISN
						</label>
						<input
							id="edit_nisn"
							type="text"
							name="nisn"
							bind:value={editNisn}
							class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>

					<!-- Asal Sekolah -->
					<div>
						<label for="edit_schoolOrigin" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							Asal Sekolah <span class="text-rose-500">*</span>
						</label>
						<input
							id="edit_schoolOrigin"
							type="text"
							name="schoolOrigin"
							bind:value={editSchoolOrigin}
							required
							class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Pilihan Jurusan -->
					<div>
						<label for="edit_majorChoice" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							Jurusan Pilihan
						</label>
						<select
							id="edit_majorChoice"
							name="majorChoice"
							bind:value={editMajorChoice}
							class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							{#if data.majors && data.majors.length > 0}
								{#each data.majors as m}
									<option value={m.name}>{m.name} ({m.code})</option>
								{/each}
							{:else}
								<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
								<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
								<option value="Bisnis Digital">Bisnis Digital (BD)</option>
							{/if}
						</select>
					</div>

					<!-- Sesi Ruangan -->
					<div>
						<label for="edit_roomAssignment" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
							Ruang Ujian
						</label>
						<select
							id="edit_roomAssignment"
							name="roomAssignment"
							bind:value={editRoomAssignment}
							class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							{#if data.examRooms && data.examRooms.length > 0}
								{#each data.examRooms as r}
									<option value={r.name}>{r.name}{r.location ? ` - ${r.location}` : ''}</option>
								{/each}
							{:else}
								<option value="Ruang 1 (Lab RPL)">Ruang 1 (Lab RPL)</option>
								<option value="Ruang 2 (Lab DKV)">Ruang 2 (Lab DKV)</option>
								<option value="Ruang 3 (Kelas A)">Ruang 3 (Kelas A)</option>
								<option value="Ruang 4 (Kelas B)">Ruang 4 (Kelas B)</option>
							{/if}
						</select>
					</div>
				</div>

				<!-- Status Pipeline -->
				<div>
					<label for="edit_statusPipeline" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
						Status Pipeline
					</label>
					<select
						id="edit_statusPipeline"
						name="statusPipeline"
						bind:value={editStatusPipeline}
						class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
					>
						<option value="REGISTERED">Belum Diuji (Santri Terdaftar)</option>
						<option value="IN_TEST">Sedang Ujian (Dalam Proses Penilaian)</option>
						<option value="COMPLETED">Sudah Lengkap (Siap Rekap & Pleno)</option>
					</select>
				</div>

				<!-- Modal Actions -->
				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={closeEditModal}
						class="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
					>
						{#if isSubmitting}
							<Clock class="w-3.5 h-3.5 animate-spin" />
							<span>Menyimpan...</span>
						{:else}
							<Check class="w-3.5 h-3.5 stroke-[3]" />
							<span>Simpan Perubahan</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal 3: Konfirmasi Hapus Santri -->
{#if deletingCandidate}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 relative">
			<div class="text-center space-y-2">
				<div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
					<ShieldAlert class="w-6 h-6 stroke-[2.2]" />
				</div>
				<h2 class="text-lg font-bold text-slate-900">Hapus Calon Santri?</h2>
				<p class="text-xs text-slate-500 leading-relaxed">
					Data santri dan seluruh riwayat skor ujian TPA, Kepesantrenan, dan Wawancara akan dihapus secara permanen:
				</p>
			</div>

			<!-- Candidate Details Card -->
			<div class="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-left space-y-1 text-xs">
				<div class="flex items-center justify-between">
					<span class="text-slate-500">No Tes</span>
					<span class="font-mono font-bold text-blue-900">{deletingCandidate.testNumber}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Nama</span>
					<span class="font-bold text-slate-900">{deletingCandidate.fullName}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-slate-500">Jurusan</span>
					<span class="font-semibold text-slate-700">{deletingCandidate.majorChoice}</span>
				</div>
			</div>

			<form
				method="POST"
				action="?/deleteCandidate"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
						deletingCandidate = null;
					};
				}}
				class="flex items-center justify-end gap-2.5 pt-2"
			>
				<input type="hidden" name="candidateId" value={deletingCandidate.id} />
				<button
					type="button"
					onclick={closeDeleteModal}
					class="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
				>
					{#if isSubmitting}
						<Clock class="w-3.5 h-3.5 animate-spin" />
						<span>Menghapus...</span>
					{:else}
						<Trash2 class="w-3.5 h-3.5" />
						<span>Ya, Hapus Data</span>
					{/if}
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Modal 4: Kelola Master Jurusan & Ruang Ujian -->
{#if showMasterModal}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] flex flex-col">
			<!-- Modal Header -->
			<div class="flex items-start justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
						<SlidersHorizontal class="w-5 h-5" />
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900">Kelola Master Jurusan & Ruang</h2>
						<p class="text-xs text-slate-500">Pilihan tersinkronisasi otomatis ke formulir pendaftaran santri baru</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => {
						showMasterModal = false;
						editingMajor = null;
						editingRoom = null;
						showAddMajorForm = false;
						showAddRoomForm = false;
					}}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Tab Switcher -->
			<div class="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
				<button
					type="button"
					onclick={() => { activeMasterTab = 'majors'; }}
					class="flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition {activeMasterTab === 'majors' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
				>
					<GraduationCap class="w-4 h-4 text-blue-700" />
					<span>Jurusan Pilihan ({data.majors?.length || 0})</span>
				</button>
				<button
					type="button"
					onclick={() => { activeMasterTab = 'rooms'; }}
					class="flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition {activeMasterTab === 'rooms' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
				>
					<Building2 class="w-4 h-4 text-emerald-700" />
					<span>Alokasi Ruangan ({data.examRooms?.length || 0})</span>
				</button>
			</div>

			<!-- Modal Body (Scrollable) -->
			<div class="overflow-y-auto space-y-4 flex-1 pr-1">
				{#if activeMasterTab === 'majors'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Jurusan Aktif</span>
							{#if !showAddMajorForm && !editingMajor}
								<button
									type="button"
									onclick={() => {
										showAddMajorForm = true;
										newMajorName = '';
										newMajorCode = '';
										newMajorDesc = '';
									}}
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition shadow-2xs"
								>
									<Plus class="w-3.5 h-3.5 stroke-[3]" />
									<span>Tambah Jurusan</span>
								</button>
							{/if}
						</div>

						<!-- Form Tambah Jurusan Baru -->
						{#if showAddMajorForm}
							<form
								method="POST"
								action="?/createMajor"
								use:enhance={() => {
									isSubmittingMaster = true;
									return async ({ update }) => {
										isSubmittingMaster = false;
										await update();
										showAddMajorForm = false;
									};
								}}
								class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3"
							>
								<div class="flex items-center justify-between pb-1 border-b border-blue-200/60">
									<h4 class="text-xs font-bold text-blue-900">Tambah Jurusan Baru</h4>
									<button
										type="button"
										onclick={() => (showAddMajorForm = false)}
										class="text-xs font-semibold text-slate-500 hover:text-slate-800"
									>
										Tutup
									</button>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div class="sm:col-span-2">
										<label for="new_major_name" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Jurusan *</label>
										<input
											id="new_major_name"
											type="text"
											name="name"
											bind:value={newMajorName}
											required
											placeholder="Contoh: Rekayasa Perangkat Lunak"
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label for="new_major_code" class="block text-[11px] font-bold text-slate-700 mb-1">Kode *</label>
										<input
											id="new_major_code"
											type="text"
											name="code"
											bind:value={newMajorCode}
											required
											maxlength="5"
											placeholder="Contoh: RPL"
											class="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
								</div>
								<div>
									<label for="new_major_desc" class="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
									<input
										id="new_major_desc"
										type="text"
										name="description"
										bind:value={newMajorDesc}
										placeholder="Contoh: Konsentrasi Software & Web Development"
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
									/>
								</div>
								<div class="flex items-center justify-end gap-2 pt-1">
									<button
										type="button"
										onclick={() => (showAddMajorForm = false)}
										class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={isSubmittingMaster}
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-50"
									>
										{isSubmittingMaster ? 'Menyimpan...' : 'Simpan Jurusan'}
									</button>
								</div>
							</form>
						{/if}

						<!-- Form Edit Jurusan -->
						{#if editingMajor}
							<form
								method="POST"
								action="?/updateMajor"
								use:enhance={() => {
									isSubmittingMaster = true;
									return async ({ update }) => {
										isSubmittingMaster = false;
										await update();
										editingMajor = null;
									};
								}}
								class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3"
							>
								<input type="hidden" name="id" value={editingMajor.id} />
								<div class="flex items-center justify-between pb-1 border-b border-amber-200/60">
									<h4 class="text-xs font-bold text-amber-900">Edit Jurusan: {editingMajor.name}</h4>
									<button
										type="button"
										onclick={() => (editingMajor = null)}
										class="text-xs font-semibold text-slate-500 hover:text-slate-800"
									>
										Tutup
									</button>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div class="sm:col-span-2">
										<label for="edit_major_name" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Jurusan *</label>
										<input
											id="edit_major_name"
											type="text"
											name="name"
											bind:value={editingMajor.name}
											required
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label for="edit_major_code" class="block text-[11px] font-bold text-slate-700 mb-1">Kode *</label>
										<input
											id="edit_major_code"
											type="text"
											name="code"
											bind:value={editingMajor.code}
											required
											maxlength="5"
											class="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
								</div>
								<div>
									<label for="edit_major_desc" class="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi</label>
									<input
										id="edit_major_desc"
										type="text"
										name="description"
										value={editingMajor.description || ''}
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
									/>
								</div>
								<div class="flex items-center justify-end gap-2 pt-1">
									<button
										type="button"
										onclick={() => (editingMajor = null)}
										class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={isSubmittingMaster}
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-50"
									>
										{isSubmittingMaster ? 'Memperbarui...' : 'Simpan Perubahan'}
									</button>
								</div>
							</form>
						{/if}

						<!-- Tabel List Jurusan -->
						<div class="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
							<table class="w-full text-left text-xs">
								<thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
									<tr>
										<th class="py-2.5 px-3">Jurusan</th>
										<th class="py-2.5 px-3 w-20 text-center">Kode</th>
										<th class="py-2.5 px-3">Deskripsi</th>
										<th class="py-2.5 px-3 w-20 text-center">Aksi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#if !data.majors || data.majors.length === 0}
										<tr>
											<td colspan="4" class="py-6 text-center text-slate-400">Belum ada jurusan terdaftar.</td>
										</tr>
									{:else}
										{#each data.majors as m}
											<tr class="hover:bg-slate-50/80 transition">
												<td class="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
												<td class="py-2.5 px-3 text-center">
													<span class="inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-blue-100 text-blue-800 border border-blue-200">
														{m.code}
													</span>
												</td>
												<td class="py-2.5 px-3 text-slate-500 text-[11px]">{m.description || '-'}</td>
												<td class="py-2.5 px-3 text-center">
													<div class="inline-flex items-center gap-1">
														<button
															type="button"
															onclick={() => { editingMajor = { ...m }; showAddMajorForm = false; }}
															class="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
															title="Edit Jurusan"
														>
															<Edit3 class="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onclick={() => { deletingMajor = { id: m.id, name: m.name }; }}
															class="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition"
															title="Hapus Jurusan"
														>
															<Trash2 class="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>
					</div>

				{:else if activeMasterTab === 'rooms'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Ruang Ujian Aktif</span>
							{#if !showAddRoomForm && !editingRoom}
								<button
									type="button"
									onclick={() => {
										showAddRoomForm = true;
										newRoomName = '';
										newRoomCapacity = 30;
										newRoomLocation = '';
									}}
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition shadow-2xs"
								>
									<Plus class="w-3.5 h-3.5 stroke-[3]" />
									<span>Tambah Ruangan</span>
								</button>
							{/if}
						</div>

						<!-- Form Tambah Ruang Baru -->
						{#if showAddRoomForm}
							<form
								method="POST"
								action="?/createExamRoom"
								use:enhance={() => {
									isSubmittingMaster = true;
									return async ({ update }) => {
										isSubmittingMaster = false;
										await update();
										showAddRoomForm = false;
									};
								}}
								class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3"
							>
								<div class="flex items-center justify-between pb-1 border-b border-blue-200/60">
									<h4 class="text-xs font-bold text-blue-900">Tambah Ruang Ujian Baru</h4>
									<button
										type="button"
										onclick={() => (showAddRoomForm = false)}
										class="text-xs font-semibold text-slate-500 hover:text-slate-800"
									>
										Tutup
									</button>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div class="sm:col-span-2">
										<label for="new_room_name" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Ruangan *</label>
										<input
											id="new_room_name"
											type="text"
											name="name"
											bind:value={newRoomName}
											required
											placeholder="Contoh: Ruang 1 (Lab RPL)"
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label for="new_room_capacity" class="block text-[11px] font-bold text-slate-700 mb-1">Kapasitas (Kursi)</label>
										<input
											id="new_room_capacity"
											type="number"
											name="capacity"
											bind:value={newRoomCapacity}
											min="1"
											max="200"
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
								</div>
								<div>
									<label for="new_room_location" class="block text-[11px] font-bold text-slate-700 mb-1">Lokasi / Gedung</label>
									<input
										id="new_room_location"
										type="text"
										name="location"
										bind:value={newRoomLocation}
										placeholder="Contoh: Gedung A Lantai 1"
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
									/>
								</div>
								<div class="flex items-center justify-end gap-2 pt-1">
									<button
										type="button"
										onclick={() => (showAddRoomForm = false)}
										class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={isSubmittingMaster}
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-50"
									>
										{isSubmittingMaster ? 'Menyimpan...' : 'Simpan Ruang'}
									</button>
								</div>
							</form>
						{/if}

						<!-- Form Edit Ruang -->
						{#if editingRoom}
							<form
								method="POST"
								action="?/updateExamRoom"
								use:enhance={() => {
									isSubmittingMaster = true;
									return async ({ update }) => {
										isSubmittingMaster = false;
										await update();
										editingRoom = null;
									};
								}}
								class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3"
							>
								<input type="hidden" name="id" value={editingRoom.id} />
								<div class="flex items-center justify-between pb-1 border-b border-amber-200/60">
									<h4 class="text-xs font-bold text-amber-900">Edit Ruang: {editingRoom.name}</h4>
									<button
										type="button"
										onclick={() => (editingRoom = null)}
										class="text-xs font-semibold text-slate-500 hover:text-slate-800"
									>
										Tutup
									</button>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div class="sm:col-span-2">
										<label for="edit_room_name" class="block text-[11px] font-bold text-slate-700 mb-1">Nama Ruangan *</label>
										<input
											id="edit_room_name"
											type="text"
											name="name"
											bind:value={editingRoom.name}
											required
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
									<div>
										<label for="edit_room_capacity" class="block text-[11px] font-bold text-slate-700 mb-1">Kapasitas</label>
										<input
											id="edit_room_capacity"
											type="number"
											name="capacity"
											bind:value={editingRoom.capacity}
											min="1"
											max="200"
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
										/>
									</div>
								</div>
								<div>
									<label for="edit_room_location" class="block text-[11px] font-bold text-slate-700 mb-1">Lokasi</label>
									<input
										id="edit_room_location"
										type="text"
										name="location"
										value={editingRoom.location || ''}
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
									/>
								</div>
								<div class="flex items-center justify-end gap-2 pt-1">
									<button
										type="button"
										onclick={() => (editingRoom = null)}
										class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={isSubmittingMaster}
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-50"
									>
										{isSubmittingMaster ? 'Memperbarui...' : 'Simpan Perubahan'}
									</button>
								</div>
							</form>
						{/if}

						<!-- Tabel List Ruang -->
						<div class="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
							<table class="w-full text-left text-xs">
								<thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
									<tr>
										<th class="py-2.5 px-3">Nama Ruang</th>
										<th class="py-2.5 px-3 w-28 text-center">Kapasitas</th>
										<th class="py-2.5 px-3">Lokasi</th>
										<th class="py-2.5 px-3 w-20 text-center">Aksi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#if !data.examRooms || data.examRooms.length === 0}
										<tr>
											<td colspan="4" class="py-6 text-center text-slate-400">Belum ada ruang ujian terdaftar.</td>
										</tr>
									{:else}
										{#each data.examRooms as r}
											<tr class="hover:bg-slate-50/80 transition">
												<td class="py-2.5 px-3 font-bold text-slate-900">{r.name}</td>
												<td class="py-2.5 px-3 text-center">
													<span class="inline-block px-2 py-0.5 rounded-md font-mono text-[11px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
														{r.capacity} Kursi
													</span>
												</td>
												<td class="py-2.5 px-3 text-slate-500 text-[11px]">{r.location || '-'}</td>
												<td class="py-2.5 px-3 text-center">
													<div class="inline-flex items-center gap-1">
														<button
															type="button"
															onclick={() => { editingRoom = { ...r }; showAddRoomForm = false; }}
															class="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
															title="Edit Ruang"
														>
															<Edit3 class="w-3.5 h-3.5" />
														</button>
														<button
															type="button"
															onclick={() => { deletingRoom = { id: r.id, name: r.name }; }}
															class="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition"
															title="Hapus Ruang"
														>
															<Trash2 class="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="pt-3 border-t border-slate-100 flex items-center justify-between">
				<span class="text-xs text-slate-500">
					Perubahan langsung aktif di sistem pendaftaran
				</span>
				<button
					type="button"
					onclick={() => {
						showMasterModal = false;
						editingMajor = null;
						editingRoom = null;
					}}
					class="px-4 py-2 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Hapus Jurusan -->
{#if deletingMajor}
	<div class="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
			<div class="text-center space-y-2">
				<div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
					<Trash2 class="w-6 h-6" />
				</div>
				<h3 class="font-bold text-slate-900 text-base">Hapus Jurusan?</h3>
				<p class="text-xs text-slate-500">
					Hapus jurusan <strong class="text-slate-800">{deletingMajor.name}</strong> dari daftar pilihan?
				</p>
			</div>
			<form
				method="POST"
				action="?/deleteMajor"
				use:enhance={() => {
					isSubmittingMaster = true;
					return async ({ update }) => {
						isSubmittingMaster = false;
						await update();
						deletingMajor = null;
					};
				}}
				class="flex items-center justify-end gap-2 pt-2"
			>
				<input type="hidden" name="id" value={deletingMajor.id} />
				<button
					type="button"
					onclick={() => (deletingMajor = null)}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={isSubmittingMaster}
					class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
				>
					{isSubmittingMaster ? 'Menghapus...' : 'Ya, Hapus'}
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Hapus Ruangan -->
{#if deletingRoom}
	<div class="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
			<div class="text-center space-y-2">
				<div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
					<Trash2 class="w-6 h-6" />
				</div>
				<h3 class="font-bold text-slate-900 text-base">Hapus Ruang Ujian?</h3>
				<p class="text-xs text-slate-500">
					Hapus ruang ujian <strong class="text-slate-800">{deletingRoom.name}</strong> dari daftar ruangan?
				</p>
			</div>
			<form
				method="POST"
				action="?/deleteExamRoom"
				use:enhance={() => {
					isSubmittingMaster = true;
					return async ({ update }) => {
						isSubmittingMaster = false;
						await update();
						deletingRoom = null;
					};
				}}
				class="flex items-center justify-end gap-2 pt-2"
			>
				<input type="hidden" name="id" value={deletingRoom.id} />
				<button
					type="button"
					onclick={() => (deletingRoom = null)}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={isSubmittingMaster}
					class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
				>
					{isSubmittingMaster ? 'Menghapus...' : 'Ya, Hapus'}
				</button>
			</form>
		</div>
	</div>
{/if}
