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
		Layers,
		Check,
		X,
		Plus,
		Edit3,
		Trash2,
		ExternalLink,
		ChevronRight,
		BookOpen,
		Sparkles,
		MessageSquare,
		Award,
		AlertTriangle,
		ShieldAlert,
		IdCard,
		SlidersHorizontal,
		Building2,
		GraduationCap
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

	function resetCreateForm() {
		createFullName = '';
		createNisn = '';
		createSchoolOrigin = '';
		createMajorChoice = 'Rekayasa Perangkat Lunak';
		createRoomAssignment = 'Ruang 1 (Lab RPL)';
		showCreateModal = false;
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
	<!-- Top Notification Banner if Action Succeeded or Failed -->
	{#if form?.success}
		<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
					<Check class="w-4 h-4" />
				</div>
				<div>
					<p class="font-bold text-sm text-emerald-950">Aksi Berhasil</p>
					<p class="text-xs text-emerald-700">{form.message}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => { if (form) form.success = false; }}
				class="text-emerald-600 hover:text-emerald-900 text-sm font-semibold p-1"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{:else if form?.error}
		<div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-xs">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
					<AlertTriangle class="w-4 h-4" />
				</div>
				<div>
					<p class="font-bold text-sm text-rose-950">Gagal Memproses Data</p>
					<p class="text-xs text-rose-700">{form.error}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => { if (form) form.error = null; }}
				class="text-rose-600 hover:text-rose-900 text-sm font-semibold p-1"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/if}

	<!-- Visual Admission Pipeline Flow Stepper (Solves UI & Flow Confusion) -->
	<div class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-md border border-blue-700/50">
		<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider mb-2">
					<Sparkles class="w-3.5 h-3.5 text-blue-300" />
					Alur Sistem Seleksi Masuk Pesantren
				</div>
				<h1 class="text-2xl font-black tracking-tight text-white">Master Data & Admisi Calon Santri</h1>
				<p class="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl">
					Langkah awal siklus seleksi: daftarkan calon santri, pantau kelengkapan 3 bidang ujian, dan kawal rekapitulasi kelulusan.
				</p>
			</div>

			<div class="flex items-center gap-2.5 shrink-0 flex-wrap">
				<button
					type="button"
					onclick={() => (showMasterModal = true)}
					class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-800/80 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-blue-700 transition border border-white/20 active:scale-95"
				>
					<SlidersHorizontal class="w-4 h-4 text-sky-300" />
					<span>Kelola Jurusan & Ruang</span>
				</button>
				<button
					type="button"
					onclick={() => (showCreateModal = true)}
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-sm shadow-md hover:bg-blue-50 transition active:scale-95"
				>
					<Plus class="w-4 h-4 text-blue-700 stroke-[3]" />
					<span>+ Tambah Calon Santri</span>
				</button>
				<a
					href="/ledger"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700/60 hover:bg-blue-600/80 text-white font-semibold text-sm border border-white/20 transition"
				>
					<span>Lihat Rekap Nilai</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>

		<!-- Step Pipeline Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-5">
			<!-- Step 1 (Current Active) -->
			<div class="bg-white/15 backdrop-blur-md rounded-2xl p-4 border-2 border-white/30 relative">
				<div class="flex items-center justify-between mb-2">
					<span class="text-[11px] font-black uppercase tracking-wider text-blue-200">Fase 1 • Admisi (Aktif)</span>
					<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-400/30 text-white">Langkah 1</span>
				</div>
				<h3 class="font-bold text-base text-white">Pendaftaran & Data Santri</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Pendaftaran santri, penetapan No Tes, NISN, penjurusan (RPL/DKV/BD), serta alokasi ruangan.
				</p>
				<div class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-200">
					<CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
					<span>Halaman ini (Kelola Santri)</span>
				</div>
			</div>

			<!-- Step 2 (Ujian Seleksi) -->
			<div class="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition">
				<div class="flex items-center justify-between mb-2">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">Fase 2 • Penilaian Seleksi</span>
					<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/80">Langkah 2</span>
				</div>
				<h3 class="font-bold text-base text-white">3 Bidang Ujian Seleksi</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Penilaian terstandarisasi oleh majelis penguji di ruang tes.
				</p>
				<div class="mt-3 flex items-center gap-2 text-xs">
					<a href="/tpa" class="px-2 py-0.5 rounded bg-blue-500/40 hover:bg-blue-400/50 text-white font-medium border border-blue-400/40">
						1. TPA
					</a>
					<a href="/rubrik" class="px-2 py-0.5 rounded bg-emerald-500/40 hover:bg-emerald-400/50 text-white font-medium border border-emerald-400/40">
						2. Pesantren
					</a>
					<a href="/wawancara" class="px-2 py-0.5 rounded bg-sky-500/40 hover:bg-sky-400/50 text-white font-medium border border-sky-400/40">
						3. Wawancara
					</a>
				</div>
			</div>

			<!-- Step 3 (Yudisium & Pleno) -->
			<div class="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition">
				<div class="flex items-center justify-between mb-2">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">Fase 3 • Yudisium</span>
					<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/80">Langkah 3</span>
				</div>
				<h3 class="font-bold text-base text-white">Rekap Nilai & Sidang Pleno</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Nilai gabungan (50% TPA + 50% Pesantren), ranking otomatis, kuota, dan pengesahan hasil.
				</p>
				<div class="mt-3 flex items-center gap-2 text-xs">
					<a href="/ledger" class="px-2.5 py-0.5 rounded bg-indigo-500/40 hover:bg-indigo-400/50 text-white font-medium border border-indigo-400/40">
						Rekap Nilai
					</a>
					<a href="/pleno" class="px-2.5 py-0.5 rounded bg-blue-600/50 hover:bg-blue-500/60 text-white font-bold border border-blue-300/40">
						Sidang Pleno
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Summary Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Total Santri Terdaftar</span>
				<p class="text-2xl font-black text-slate-900 mt-0.5">{counts.total}</p>
				<span class="text-[11px] text-blue-600 font-medium">Gelombang {data.activeWave?.waveName || '1'}</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
				<Users class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Selesai Seluruh Ujian</span>
				<p class="text-2xl font-black text-emerald-600 mt-0.5">{counts.completed}</p>
				<span class="text-[11px] text-emerald-600 font-medium">Siap Sidang Pleno</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
				<CheckCircle2 class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Sedang Berjalan Ujian</span>
				<p class="text-2xl font-black text-sky-600 mt-0.5">{counts.inTest}</p>
				<span class="text-[11px] text-sky-600 font-medium">Dalam Proses Penguji</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
				<Clock class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Belum Diuji</span>
				<p class="text-2xl font-black text-amber-600 mt-0.5">{counts.registered}</p>
				<span class="text-[11px] text-amber-600 font-medium">Menunggu Giliran Ujian</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
				<AlertCircle class="w-5 h-5" />
			</div>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
		<!-- Search Input -->
		<div class="relative flex-1">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari Nama Santri, No Tes (G1-...), Asal Sekolah, atau NISN..."
				class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
			/>
		</div>

		<div class="flex flex-wrap items-center gap-2.5">
			<!-- Filter Jurusan -->
			<div class="flex items-center gap-1.5">
				<select
					bind:value={selectedMajor}
					class="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
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
			</div>

			<!-- Filter Status Pipeline -->
			<div>
				<select
					bind:value={selectedPipeline}
					class="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
				>
					<option value="ALL">Semua Status Pipeline</option>
					<option value="COMPLETED">Selesai (Completed)</option>
					<option value="IN_TEST">Sedang Ujian (In Test)</option>
					<option value="REGISTERED">Terdaftar (Registered)</option>
				</select>
			</div>

			<!-- Filter Gelombang -->
			<div>
				<select
					bind:value={selectedWave}
					class="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
				>
					<option value="ALL">Semua Gelombang</option>
					{#each data.allWaves as w}
						<option value={w.id}>{w.waveName}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Candidate Table Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
					<tr>
						<th class="py-3.5 px-4 w-12 text-center">No</th>
						<th class="py-3.5 px-4">No Tes & NISN</th>
						<th class="py-3.5 px-4">Nama Calon Santri</th>
						<th class="py-3.5 px-4">Asal Sekolah</th>
						<th class="py-3.5 px-4">Jurusan</th>
						<th class="py-3.5 px-4">Ruangan</th>
						<th class="py-3.5 px-4 text-center">Kelengkapan Tes (T • K • W)</th>
						<th class="py-3.5 px-4 text-center">Status</th>
						<th class="py-3.5 px-4 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredCandidates.length === 0}
						<tr>
							<td colspan="9" class="py-12 text-center text-slate-400">
								<Users class="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
								<p class="font-medium text-sm text-slate-600">Tidak ada calon santri yang cocok.</p>
								<p class="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
							</td>
						</tr>
					{:else}
						{#each filteredCandidates as c, i}
							{@const isTpaLocked = c.tpaScore?.lockStatus === 'LOCKED'}
							{@const isPesantrenLocked = c.pesantrenScore?.lockStatus === 'LOCKED'}
							{@const isInterviewDone = c.interview?.completionStatus === 'COMPLETED'}

							<tr class="hover:bg-blue-50/40 transition">
								<td class="py-3.5 px-4 text-center font-semibold text-slate-500">{i + 1}</td>
								
								<!-- No Tes & NISN -->
								<td class="py-3.5 px-4 whitespace-nowrap">
									<div class="font-mono font-black text-blue-800 text-[13px]">{c.testNumber}</div>
									<div class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
										<IdCard class="w-3 h-3 text-slate-400" />
										<span>{c.nisn ? `NISN: ${c.nisn}` : 'NISN: -'}</span>
									</div>
								</td>

								<!-- Nama Calon Santri -->
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-2.5">
										<div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs shrink-0 shadow-xs border border-blue-200">
											{c.fullName.substring(0, 2).toUpperCase()}
										</div>
										<div>
											<span class="font-bold text-slate-900 text-[13px]">{c.fullName}</span>
											<p class="text-[11px] text-slate-400">Calon Santri Baru</p>
										</div>
									</div>
								</td>

								<!-- Asal Sekolah -->
								<td class="py-3.5 px-4 text-slate-700">
									<div class="flex items-center gap-1.5 max-w-[180px] truncate" title={c.schoolOrigin}>
										<School class="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span class="truncate">{c.schoolOrigin}</span>
									</div>
								</td>

								<!-- Jurusan -->
								<td class="py-3.5 px-4">
									<span class="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold {c.majorChoice === 'Rekayasa Perangkat Lunak'
										? 'bg-blue-50 text-blue-700 border border-blue-200'
										: c.majorChoice === 'Desain Komunikasi Visual'
											? 'bg-amber-50 text-amber-700 border border-amber-200'
											: 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
										{c.majorChoice === 'Rekayasa Perangkat Lunak' ? 'RPL' : c.majorChoice === 'Desain Komunikasi Visual' ? 'DKV' : 'Bisnis Digital'}
									</span>
								</td>

								<!-- Ruang Sesi -->
								<td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
									{c.roomAssignment || 'Ruang 1 (Lab)'}
								</td>

								<!-- Direct Links to Test Desks (T, K, W) -->
								<td class="py-3.5 px-4 text-center">
									<div class="inline-flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
										<!-- TPA Desk Link -->
										<a
											href="/tpa?candidateId={c.id}"
											title="Tes TPA: {isTpaLocked ? 'Selesai (Skor: ' + c.tpaScore?.finalScore100 + ')' : 'Belum Diuji'} - Klik untuk buka"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition shadow-2xs {isTpaLocked
												? 'bg-blue-700 text-white hover:bg-blue-800'
												: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}"
										>
											T
										</a>

										<!-- Pesantren Desk Link -->
										<a
											href="/rubrik?candidateId={c.id}"
											title="Tes Kepesantrenan: {isPesantrenLocked ? 'Selesai (Rata: ' + c.pesantrenScore?.averageScore + ')' : 'Belum Diuji'} - Klik untuk buka"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition shadow-2xs {isPesantrenLocked
												? 'bg-emerald-700 text-white hover:bg-emerald-800'
												: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}"
										>
											K
										</a>

										<!-- Wawancara Desk Link -->
										<a
											href="/wawancara?candidateId={c.id}"
											title="Wawancara: {isInterviewDone ? 'Selesai (Lengkap)' : 'Belum Diisi'} - Klik untuk buka"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition shadow-2xs {isInterviewDone
												? 'bg-sky-700 text-white hover:bg-sky-800'
												: 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'}"
										>
											W
										</a>
									</div>
								</td>

								<!-- Pipeline Status -->
								<td class="py-3.5 px-4 text-center whitespace-nowrap">
									{#if c.statusPipeline === 'COMPLETED'}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
											<Check class="w-3 h-3 stroke-[3]" /> Lengkap
										</span>
									{:else if c.statusPipeline === 'IN_TEST'}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
											<Clock class="w-3 h-3 stroke-[3]" /> Sedang Ujian
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
											Belum Diuji
										</span>
									{/if}
								</td>

								<!-- Action Buttons (Uji Nilai, Edit, Hapus) -->
								<td class="py-3.5 px-4 text-center whitespace-nowrap">
									<div class="inline-flex items-center gap-1">
										<!-- Direct Test Action -->
										<a
											href="/tpa?candidateId={c.id}"
											class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition"
											title="Mulai Penilaian Ujian"
										>
											<span>Nilai</span>
											<ArrowRight class="w-3 h-3" />
										</a>

										<!-- Edit Candidate Action -->
										<button
											type="button"
											onclick={() => openEditModal(c)}
											class="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
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

		<div class="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
			<span>Menampilkan <strong>{filteredCandidates.length}</strong> dari total <strong>{data.candidates.length}</strong> calon santri.</span>
			<div class="flex items-center gap-4 text-slate-500 font-medium text-[11px]">
				<span class="flex items-center gap-1">
					<span class="w-4 h-4 rounded bg-blue-700 text-white font-black text-[9px] flex items-center justify-center">T</span>
					<span>= Tes Potensi Akademik (TPA)</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="w-4 h-4 rounded bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center">K</span>
					<span>= Tes Kepesantrenan (Ibadah)</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="w-4 h-4 rounded bg-sky-700 text-white font-black text-[9px] flex items-center justify-center">W</span>
					<span>= Wawancara Santri & Ortu</span>
				</span>
			</div>
		</div>
	</div>
</div>

<!-- ========================================================================= -->
<!-- CUSTOM AESTHETIC MODAL 1: TAMBAH CALON SANTRI BARU (Zero Native Dialogs) -->
<!-- ========================================================================= -->
{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-150"
		>
			<!-- Modal Header -->
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
						<Plus class="w-6 h-6 stroke-[3]" />
					</div>
					<div>
						<h2 class="text-xl font-bold text-slate-900">Pendaftaran Calon Santri</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							Nomor Tes terstandarisasi akan digenerate otomatis berdasarkan jurusan pilihan.
						</p>
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

			<!-- Form Submit to Action -->
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
					<label for="create_fullName" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
						Nama Lengkap Calon Santri <span class="text-rose-500">*</span>
					</label>
					<input
						id="create_fullName"
						type="text"
						name="fullName"
						bind:value={createFullName}
						required
						placeholder="Contoh: Muhammad Farhan Al-Fatih"
						class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- NISN -->
					<div>
						<label for="create_nisn" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							NISN (10 Digit)
						</label>
						<input
							id="create_nisn"
							type="text"
							name="nisn"
							bind:value={createNisn}
							placeholder="Contoh: 0081234567"
							class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>

					<!-- Asal Sekolah -->
					<div>
						<label for="create_schoolOrigin" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Asal Sekolah <span class="text-rose-500">*</span>
						</label>
						<input
							id="create_schoolOrigin"
							type="text"
							name="schoolOrigin"
							bind:value={createSchoolOrigin}
							required
							placeholder="Contoh: SMPIT Insan Mandiri"
							class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Pilihan Jurusan -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label for="create_majorChoice" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
								Jurusan Pilihan <span class="text-rose-500">*</span>
							</label>
							<button
								type="button"
								onclick={() => { showMasterModal = true; activeMasterTab = 'majors'; }}
								class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline transition"
							>
								+ Kelola Jurusan
							</button>
						</div>
						<select
							id="create_majorChoice"
							name="majorChoice"
							bind:value={createMajorChoice}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
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
						<div class="flex items-center justify-between mb-1.5">
							<label for="create_roomAssignment" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
								Alokasi Ruang Ujian
							</label>
							<button
								type="button"
								onclick={() => { showMasterModal = true; activeMasterTab = 'rooms'; }}
								class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline transition"
							>
								+ Kelola Ruang
							</button>
						</div>
						<select
							id="create_roomAssignment"
							name="roomAssignment"
							bind:value={createRoomAssignment}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
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

				<!-- Helper Note -->
				<div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
					<Sparkles class="w-4 h-4 text-blue-700 shrink-0" />
					<span>Setelah santri didaftarkan, lembar penilaian Tes TPA, Kepesantrenan, dan Wawancara langsung otomatis disiapkan.</span>
				</div>

				<!-- Modal Actions -->
				<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60"
					>
						{#if isSubmitting}
							<Clock class="w-4 h-4 animate-spin" />
							<span>Menyimpan...</span>
						{:else}
							<Check class="w-4 h-4 stroke-[3]" />
							<span>Simpan & Daftarkan</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ========================================================================= -->
<!-- CUSTOM AESTHETIC MODAL 2: EDIT CALON SANTRI (Zero Native Dialogs)        -->
<!-- ========================================================================= -->
{#if editingCandidate}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-150"
		>
			<!-- Modal Header -->
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
						<Edit3 class="w-6 h-6 stroke-[2.5]" />
					</div>
					<div>
						<h2 class="text-xl font-bold text-slate-900">Edit Data Santri</h2>
						<p class="text-xs text-slate-500 mt-0.5">
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

			<!-- Form Submit to Action -->
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
					<label for="edit_fullName" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
						Nama Lengkap Calon Santri <span class="text-rose-500">*</span>
					</label>
					<input
						id="edit_fullName"
						type="text"
						name="fullName"
						bind:value={editFullName}
						required
						class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- NISN -->
					<div>
						<label for="edit_nisn" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							NISN
						</label>
						<input
							id="edit_nisn"
							type="text"
							name="nisn"
							bind:value={editNisn}
							placeholder="10 digit nomor NISN"
							class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>

					<!-- Asal Sekolah -->
					<div>
						<label for="edit_schoolOrigin" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Asal Sekolah <span class="text-rose-500">*</span>
						</label>
						<input
							id="edit_schoolOrigin"
							type="text"
							name="schoolOrigin"
							bind:value={editSchoolOrigin}
							required
							class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Pilihan Jurusan -->
					<div>
						<label for="edit_majorChoice" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Jurusan Pilihan
						</label>
						<select
							id="edit_majorChoice"
							name="majorChoice"
							bind:value={editMajorChoice}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
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
						<label for="edit_roomAssignment" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Alokasi Ruang Ujian
						</label>
						<select
							id="edit_roomAssignment"
							name="roomAssignment"
							bind:value={editRoomAssignment}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
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
					<label for="edit_statusPipeline" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
						Status Pipeline Seleksi
					</label>
					<select
						id="edit_statusPipeline"
						name="statusPipeline"
						bind:value={editStatusPipeline}
						class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
					>
						<option value="REGISTERED">Belum Diuji (Santri Terdaftar)</option>
						<option value="IN_TEST">Sedang Ujian (Dalam Proses Penilaian)</option>
						<option value="COMPLETED">Sudah Lengkap (Siap Rekap & Pleno)</option>
					</select>
				</div>

				<!-- Modal Actions -->
				<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={closeEditModal}
						class="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60"
					>
						{#if isSubmitting}
							<Clock class="w-4 h-4 animate-spin" />
							<span>Menyimpan...</span>
						{:else}
							<Check class="w-4 h-4 stroke-[3]" />
							<span>Simpan Perubahan</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ========================================================================= -->
<!-- CUSTOM AESTHETIC MODAL 3: HAPUS CALON SANTRI (Zero Native Dialogs)       -->
<!-- ========================================================================= -->
{#if deletingCandidate}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-rose-100 space-y-6 relative animate-in zoom-in-95 duration-150"
		>
			<div class="text-center space-y-3">
				<div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
					<ShieldAlert class="w-8 h-8 stroke-[2.2]" />
				</div>
				<h2 class="text-xl font-black text-slate-900">Hapus Calon Santri?</h2>
				<p class="text-xs text-slate-500 leading-relaxed">
					Anda akan menghapus data calon santri berikut beserta seluruh riwayat skor ujiannya di Tes TPA, Kepesantrenan, dan Wawancara secara permanen:
				</p>
			</div>

			<!-- Candidate Details Card -->
			<div class="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-left space-y-1.5">
				<div class="flex items-center justify-between">
					<span class="text-xs text-slate-500 font-medium">No Tes</span>
					<span class="font-mono font-black text-blue-800 text-xs">{deletingCandidate.testNumber}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-xs text-slate-500 font-medium">Nama</span>
					<span class="font-bold text-slate-900 text-sm">{deletingCandidate.fullName}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-xs text-slate-500 font-medium">Jurusan</span>
					<span class="font-semibold text-slate-700 text-xs">{deletingCandidate.majorChoice}</span>
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
				class="flex items-center justify-end gap-3 pt-2"
			>
				<input type="hidden" name="candidateId" value={deletingCandidate.id} />
				<button
					type="button"
					onclick={closeDeleteModal}
					class="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60"
				>
					{#if isSubmitting}
						<Clock class="w-4 h-4 animate-spin" />
						<span>Menghapus...</span>
					{:else}
						<Trash2 class="w-4 h-4" />
						<span>Ya, Hapus Data</span>
					{/if}
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- ========================================================================= -->
<!-- CUSTOM AESTHETIC MODAL 4: KELOLA MASTER JURUSAN & RUANG UJIAN              -->
<!-- ========================================================================= -->
{#if showMasterModal}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
		>
			<!-- Modal Header -->
			<div class="flex items-start justify-between pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
						<SlidersHorizontal class="w-6 h-6 stroke-[2.2]" />
					</div>
					<div>
						<h2 class="text-xl font-black text-slate-900">Kelola Master Jurusan & Ruang Ujian</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							Pilihan jurusan dan ruang ujian tersinkronisasi otomatis ke formulir pendaftaran santri baru.
						</p>
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
			<div class="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
				<button
					type="button"
					onclick={() => { activeMasterTab = 'majors'; }}
					class="flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition {activeMasterTab === 'majors' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
				>
					<GraduationCap class="w-4 h-4 text-blue-600" />
					<span>Jurusan Pilihan ({data.majors?.length || 0})</span>
				</button>
				<button
					type="button"
					onclick={() => { activeMasterTab = 'rooms'; }}
					class="flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition {activeMasterTab === 'rooms' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
				>
					<Building2 class="w-4 h-4 text-emerald-600" />
					<span>Alokasi Ruang Ujian ({data.examRooms?.length || 0})</span>
				</button>
			</div>

			<!-- Modal Body (Scrollable) -->
			<div class="overflow-y-auto space-y-4 flex-1 pr-1">
				{#if activeMasterTab === 'majors'}
					<!-- TAB JURUSAN -->
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
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
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
									<h4 class="text-xs font-bold text-blue-900">Form Tambah Jurusan Baru</h4>
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
										<label for="new_major_code" class="block text-[11px] font-bold text-slate-700 mb-1">Kode (2-4 huruf) *</label>
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
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
											class="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-50"
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
													<span class="inline-block px-2 py-0.5 rounded-md font-mono font-black text-[11px] bg-blue-100 text-blue-800 border border-blue-200">
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
					<!-- TAB RUANG UJIAN -->
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
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-xs"
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
								class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3"
							>
								<div class="flex items-center justify-between pb-1 border-b border-emerald-200/60">
									<h4 class="text-xs font-bold text-emerald-900">Form Tambah Ruang Ujian Baru</h4>
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
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
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
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
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
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
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
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-50"
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
									<h4 class="text-xs font-bold text-amber-900">Edit Ruang Ujian: {editingRoom.name}</h4>
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
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
											class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
										class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600"
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
										class="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-50"
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
					Perubahan jurusan dan ruangan langsung berlaku di formulir pendaftaran santri baru.
				</span>
				<button
					type="button"
					onclick={() => {
						showMasterModal = false;
						editingMajor = null;
						editingRoom = null;
					}}
					class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-white hover:bg-slate-900 transition"
				>
					Selesai & Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL HAPUS JURUSAN -->
{#if deletingMajor}
	<div class="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
			<div class="text-center space-y-2">
				<div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
					<Trash2 class="w-6 h-6" />
				</div>
				<h3 class="font-black text-slate-900 text-base">Hapus Jurusan?</h3>
				<p class="text-xs text-slate-500">
					Hapus jurusan <strong class="text-slate-800">{deletingMajor.name}</strong> dari daftar pilihan PPDB?
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

<!-- MODAL HAPUS RUANGAN -->
{#if deletingRoom}
	<div class="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
			<div class="text-center space-y-2">
				<div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
					<Trash2 class="w-6 h-6" />
				</div>
				<h3 class="font-black text-slate-900 text-base">Hapus Ruang Ujian?</h3>
				<p class="text-xs text-slate-500">
					Hapus ruang ujian <strong class="text-slate-800">{deletingRoom.name}</strong> dari daftar ruangan PPDB?
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
