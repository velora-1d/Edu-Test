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
		IdCard
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
					Langkah awal dari seluruh siklus ujian: daftarkan calon santri, pantau kehadiran di 3 meja seleksi asesor, dan kawal yudisium pleno.
				</p>
			</div>

			<div class="flex items-center gap-2.5 shrink-0">
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
					<span>Lihat Master Ledger</span>
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
				<h3 class="font-bold text-base text-white">Input & Kelola Master Santri</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Pendaftaran santri, penetapan No Tes, NISN, penjurusan (RPL/DKV/BD), serta alokasi sesi ruangan.
				</p>
				<div class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-200">
					<CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
					<span>Halaman ini (CRUD Aktif)</span>
				</div>
			</div>

			<!-- Step 2 (Meja Asesor) -->
			<div class="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition">
				<div class="flex items-center justify-between mb-2">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">Fase 2 • Meja Ujian</span>
					<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/80">Langkah 2</span>
				</div>
				<h3 class="font-bold text-base text-white">3 Meja Pengujian Asesor</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Pengisian nilai independen oleh majelis penguji di 3 ruang seleksi.
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
				<h3 class="font-bold text-base text-white">Master Ledger & Sidang Pleno</h3>
				<p class="text-xs text-blue-100/70 mt-1">
					Kalkulasi otomatis bobot 30-40-30, ranking paralel, kuota kelulusan, dan ketuk palu pimpinan.
				</p>
				<div class="mt-3 flex items-center gap-2 text-xs">
					<a href="/ledger" class="px-2.5 py-0.5 rounded bg-indigo-500/40 hover:bg-indigo-400/50 text-white font-medium border border-indigo-400/40">
						Master Ledger
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
				<span class="text-xs text-slate-500 font-medium">Selesai Semua Meja</span>
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
				<span class="text-[11px] text-sky-600 font-medium">Dalam Proses Asesor</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
				<Clock class="w-5 h-5" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Belum Diuji</span>
				<p class="text-2xl font-black text-amber-600 mt-0.5">{counts.registered}</p>
				<span class="text-[11px] text-amber-600 font-medium">Menunggu Antrian Meja</span>
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
					<option value="Rekayasa Perangkat Lunak">RPL (Rekayasa Perangkat Lunak)</option>
					<option value="Desain Komunikasi Visual">DKV (Desain Komunikasi Visual)</option>
					<option value="Bisnis Digital">BD (Bisnis Digital)</option>
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
						<th class="py-3.5 px-4">Sesi Ruang</th>
						<th class="py-3.5 px-4 text-center">Meja Ujian (Klik Uji)</th>
						<th class="py-3.5 px-4 text-center">Status Pipeline</th>
						<th class="py-3.5 px-4 text-center">Aksi Manajemen</th>
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
											title="Meja 1 TPA: {isTpaLocked ? 'Terkunci (Skor: ' + c.tpaScore?.finalScore100 + ')' : 'Draf/Belum Ujian'} - Klik untuk buka"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition shadow-2xs {isTpaLocked
												? 'bg-blue-700 text-white hover:bg-blue-800'
												: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}"
										>
											T
										</a>

										<!-- Pesantren Desk Link -->
										<a
											href="/rubrik?candidateId={c.id}"
											title="Meja 2 Kepesantrenan: {isPesantrenLocked ? 'Terkunci (Rata: ' + c.pesantrenScore?.averageScore + ')' : 'Draf/Belum Ujian'} - Klik untuk buka"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition shadow-2xs {isPesantrenLocked
												? 'bg-emerald-700 text-white hover:bg-emerald-800'
												: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}"
										>
											K
										</a>

										<!-- Wawancara Desk Link -->
										<a
											href="/wawancara?candidateId={c.id}"
											title="Meja 3 Wawancara: {isInterviewDone ? 'Selesai (26 Butir Lengkap)' : 'Draf/Belum Lengkap'} - Klik untuk buka"
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
											<Check class="w-3 h-3 stroke-[3]" /> Selesai
										</span>
									{:else if c.statusPipeline === 'IN_TEST'}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
											<Clock class="w-3 h-3 stroke-[3]" /> Sedang Ujian
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
											Terdaftar
										</span>
									{/if}
								</td>

								<!-- Action Buttons (Uji Nilai, Edit, Hapus) -->
								<td class="py-3.5 px-4 text-center whitespace-nowrap">
									<div class="inline-flex items-center gap-1">
										<!-- Direct Test Action -->
										<a
											href="/tpa?candidateId={c.id}"
											class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition"
											title="Buka Meja Penilaian Ujian"
										>
											<span>Uji</span>
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
					<span>= Meja 1 TPA</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="w-4 h-4 rounded bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center">K</span>
					<span>= Meja 2 Kepesantrenan</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="w-4 h-4 rounded bg-sky-700 text-white font-black text-[9px] flex items-center justify-center">W</span>
					<span>= Meja 3 Wawancara</span>
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
						<label for="create_majorChoice" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Jurusan Pilihan <span class="text-rose-500">*</span>
						</label>
						<select
							id="create_majorChoice"
							name="majorChoice"
							bind:value={createMajorChoice}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
							<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
							<option value="Bisnis Digital">Bisnis Digital (BD)</option>
						</select>
					</div>

					<!-- Sesi Ruangan -->
					<div>
						<label for="create_roomAssignment" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Alokasi Ruang Ujian
						</label>
						<select
							id="create_roomAssignment"
							name="roomAssignment"
							bind:value={createRoomAssignment}
							class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
						>
							<option value="Ruang 1 (Lab RPL)">Ruang 1 (Lab RPL)</option>
							<option value="Ruang 2 (Lab DKV)">Ruang 2 (Lab DKV)</option>
							<option value="Ruang 3 (Kelas A)">Ruang 3 (Kelas A)</option>
							<option value="Ruang 4 (Kelas B)">Ruang 4 (Kelas B)</option>
						</select>
					</div>
				</div>

				<!-- Helper Note -->
				<div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
					<Sparkles class="w-4 h-4 text-blue-700 shrink-0" />
					<span>Setelah santri ditambahkan, entri penilaian di Meja TPA, Kepesantrenan, dan Wawancara langsung otomatis disiapkan.</span>
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
							<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
							<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
							<option value="Bisnis Digital">Bisnis Digital (BD)</option>
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
							<option value="Ruang 1 (Lab RPL)">Ruang 1 (Lab RPL)</option>
							<option value="Ruang 2 (Lab DKV)">Ruang 2 (Lab DKV)</option>
							<option value="Ruang 3 (Kelas A)">Ruang 3 (Kelas A)</option>
							<option value="Ruang 4 (Kelas B)">Ruang 4 (Kelas B)</option>
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
						<option value="REGISTERED">REGISTERED (Terdaftar, Belum Mulai)</option>
						<option value="IN_TEST">IN_TEST (Sedang Ujian di Meja Seleksi)</option>
						<option value="COMPLETED">COMPLETED (Selesai Seluruh Meja & Siap Pleno)</option>
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
					Anda akan menghapus data calon santri berikut beserta seluruh riwayat skor ujiannya di Meja TPA, Kepesantrenan, dan Wawancara secara permanen:
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
