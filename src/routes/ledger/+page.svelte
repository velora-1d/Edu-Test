<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import {
		FileSpreadsheet,
		Award,
		Download,
		RefreshCw,
		Search,
		Filter,
		ArrowUpDown,
		ArrowUp,
		ArrowDown,
		ChevronDown,
		ChevronUp,
		CheckCircle2,
		AlertCircle,
		BookOpen,
		ClipboardCheck,
		Sparkles,
		Layers,
		ArrowLeft,
		ArrowRight,
		Sliders,
		FileText,
		ShieldCheck,
		X
	} from 'lucide-svelte';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	let selectedMajor = $state('ALL');
	let selectedStatus = $state('ALL');
	let sortColumn = $state<'rankParallel' | 'compositeScore' | 'tpaScore' | 'pesantrenScore' | 'rankTpa' | 'rankPesantren' | 'testNumber' | 'fullName'>('rankParallel');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let expandedCandidateId = $state<string | null>(null);
	let isRecalculating = $state(false);

	// Quota Cut-off & Dossier Modal State
	let quotaInput = $state(20);
	$effect(() => {
		if (data.activeWave?.quotaCapacity) {
			quotaInput = data.activeWave.quotaCapacity;
		}
	});
	let isUpdatingQuota = $state(false);
	let selectedDossierCandidate = $state<(typeof data.candidates)[0] | null>(null);

	function openDossier(c: (typeof data.candidates)[0]) {
		selectedDossierCandidate = c;
	}

	function closeDossier() {
		selectedDossierCandidate = null;
	}

	function toggleSort(col: typeof sortColumn) {
		if (sortColumn === col) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = col;
			// Default descending for scores, ascending for ranks and names
			sortDirection = col === 'compositeScore' || col === 'tpaScore' || col === 'pesantrenScore' ? 'desc' : 'asc';
		}
	}

	function toggleExpand(id: string) {
		expandedCandidateId = expandedCandidateId === id ? null : id;
	}

	// Filter & Sort Pipeline
	const processedCandidates = $derived(
		data.candidates
			.filter((c) => {
				const matchesSearch =
					searchQuery.trim() === '' ||
					c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase());

				const matchesMajor = selectedMajor === 'ALL' || c.majorChoice === selectedMajor;
				const matchesStatus =
					selectedStatus === 'ALL' ||
					(c.ranking?.admissionStatus || 'WAITING_LIST') === selectedStatus;

				return matchesSearch && matchesMajor && matchesStatus;
			})
			.sort((a, b) => {
				let valA: number | string = 0;
				let valB: number | string = 0;

				switch (sortColumn) {
					case 'rankParallel':
						valA = a.ranking?.rankParallel ?? 999;
						valB = b.ranking?.rankParallel ?? 999;
						break;
					case 'compositeScore':
						valA = parseFloat(a.ranking?.compositeScore || '0');
						valB = parseFloat(b.ranking?.compositeScore || '0');
						break;
					case 'tpaScore':
						valA = parseFloat(a.tpaScore?.finalScore100 || '0');
						valB = parseFloat(b.tpaScore?.finalScore100 || '0');
						break;
					case 'pesantrenScore':
						valA = parseFloat(a.pesantrenScore?.averageScore || '0');
						valB = parseFloat(b.pesantrenScore?.averageScore || '0');
						break;
					case 'rankTpa':
						valA = a.ranking?.rankTpa ?? 999;
						valB = b.ranking?.rankTpa ?? 999;
						break;
					case 'rankPesantren':
						valA = a.ranking?.rankPesantren ?? 999;
						valB = b.ranking?.rankPesantren ?? 999;
						break;
					case 'testNumber':
						valA = a.testNumber;
						valB = b.testNumber;
						break;
					case 'fullName':
						valA = a.fullName.toLowerCase();
						valB = b.fullName.toLowerCase();
						break;
				}

				if (typeof valA === 'string' && typeof valB === 'string') {
					return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
				}

				return sortDirection === 'asc'
					? (valA as number) - (valB as number)
					: (valB as number) - (valA as number);
			})
	);

	// Quick Stats Derived
	const stats = $derived(() => {
		const total = data.candidates.length;
		if (total === 0) return { total: 0, highest: 0, lowest: 0, average: 0, lulus: 0, waiting: 0 };

		let sum = 0;
		let highest = 0;
		let lowest = 999;
		let lulus = 0;
		let waiting = 0;

		for (const c of data.candidates) {
			const comp = parseFloat(c.ranking?.compositeScore || '0');
			sum += comp;
			if (comp > highest) highest = comp;
			if (comp < lowest) lowest = comp;
			if (c.ranking?.admissionStatus === 'LULUS') lulus++;
			else waiting++;
		}

		return {
			total,
			highest,
			lowest: lowest === 999 ? 0 : lowest,
			average: Math.round((sum / total) * 10) / 10,
			lulus,
			waiting
		};
	});
</script>

<svelte:head>
	<title>Rekap Nilai & Peringkat Santri | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Top Navigation Workflow Bar (Clean & Compact) -->
	<div class="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs text-xs">
		<div class="flex items-center gap-1.5 flex-wrap">
			<a
				href="/peserta"
				class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Data Santri</span>
			</a>
			<span class="text-slate-300">/</span>
			<a
				href="/tpa"
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition"
			>
				<span>1. TPA &rarr;</span>
			</a>
			<a
				href="/rubrik"
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium transition"
			>
				<span>2. Kepesantrenan &rarr;</span>
			</a>
			<a
				href="/wawancara"
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition"
			>
				<span>3. Wawancara &rarr;</span>
			</a>
			<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold shadow-2xs">
				Rekap Nilai
			</span>
		</div>

		<a
			href="/pleno"
			class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold transition ml-auto shadow-xs shadow-blue-700/20"
		>
			<span>Penetapan Kelulusan</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Rekap Nilai & Peringkat Seleksi</h1>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
					{data.activeWave?.waveName || 'Gelombang 1'}
				</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				Rekapitulasi nilai gabungan (50% TPA + 50% Kepesantrenan), peringkat santri otomatis, dan unduh data kelulusan.
			</p>
		</div>

		<div class="flex items-center gap-3 flex-wrap">
			<!-- Recalculate Ranking Action Form -->
			<form
				method="POST"
				action="?/recalculate"
				use:enhance={() => {
					isRecalculating = true;
					return async ({ update }) => {
						isRecalculating = false;
						await update();
					};
				}}
			>
				<input type="hidden" name="waveId" value={data.activeWave?.id || ''} />
				<button
					type="submit"
					disabled={isRecalculating}
					class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-300 disabled:opacity-50 shadow-sm"
				>
					<RefreshCw class="w-4 h-4 {isRecalculating ? 'animate-spin text-blue-600' : 'text-slate-600'}" />
					<span>{isRecalculating ? 'Menghitung...' : 'Hitung Ulang Peringkat'}</span>
				</button>
			</form>

			<!-- Export Excel Button -->
			<a
				href="/api/export/ledger"
				download
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
			>
				<Download class="w-4 h-4" />
				<span>Export Excel (.xlsx)</span>
			</a>

			<!-- Go to Pleno -->
			<a
				href="/pleno"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
			>
				<Award class="w-4 h-4" />
				<span>Penetapan Kelulusan</span>
			</a>
		</div>
	</div>

	<!-- Alert message if form result exists -->
	{#if form?.message}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
			<div class="flex items-center gap-2">
				<CheckCircle2 class="w-5 h-5 text-emerald-600" />
				<span>{form.message}</span>
			</div>
		</div>
	{:else if form?.error}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
			<div class="flex items-center gap-2">
				<AlertCircle class="w-5 h-5 text-rose-600" />
				<span>{form.error}</span>
			</div>
		</div>
	{/if}

	<!-- Stats Summary Bar -->
	<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Total Calon Santri</span>
			<p class="text-xl font-extrabold text-slate-900 mt-1">{stats().total}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Skor Tertinggi Nilai Akhir</span>
			<p class="text-xl font-extrabold text-emerald-600 mt-1">{stats().highest}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Rata-rata Nilai Akhir</span>
			<p class="text-xl font-extrabold text-blue-700 mt-1">{stats().average}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Status LULUS</span>
			<p class="text-xl font-extrabold text-emerald-700 mt-1">{stats().lulus} santri</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Cadangan</span>
			<p class="text-xl font-extrabold text-amber-600 mt-1">{stats().waiting} santri</p>
		</div>
	</div>

	<!-- Quota Capacity Control & Cut-Off Simulator -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2">
					<Sliders class="w-5 h-5 text-blue-700" />
					<h3 class="font-bold text-slate-900 text-base">Simulasi & Penetapan Kuota Kelulusan</h3>
					<span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200">
						Daya Tampung: {quotaInput} Santri
					</span>
				</div>
				<p class="text-xs text-slate-500 mt-1">
					Geser kuota untuk melihat simulasi garis batas kelulusan. Santri peringkat 1 s/d {quotaInput} berstatus <strong>LULUS</strong>, peringkat seterusnya berstatus <strong>Cadangan / Waiting List</strong>.
				</p>
			</div>

			<form
				method="POST"
				action="?/updateQuota"
				use:enhance={() => {
					isUpdatingQuota = true;
					return async ({ update }) => {
						isUpdatingQuota = false;
						await update();
					};
				}}
				class="flex items-center gap-2 shrink-0"
			>
				<input type="hidden" name="waveId" value={data.activeWave?.id || ''} />
				<input type="hidden" name="quota" value={quotaInput} />
				<button
					type="submit"
					disabled={isUpdatingQuota}
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition shadow-sm disabled:opacity-50 min-h-[40px]"
				>
					<ShieldCheck class="w-4 h-4" />
					<span>{isUpdatingQuota ? 'Menerapkan Kuota...' : 'Simpan Kuota Resmi'}</span>
				</button>
			</form>
		</div>

		<!-- Interactive Range Slider -->
		<div class="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
			<span class="text-xs font-semibold text-slate-700 shrink-0">Batas Kuota:</span>
			<input
				type="range"
				min="1"
				max={Math.max(data.candidates.length, 30)}
				bind:value={quotaInput}
				class="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
			/>
			<div class="flex items-center gap-1.5 shrink-0">
				<input
					type="number"
					min="1"
					max={Math.max(data.candidates.length, 100)}
					bind:value={quotaInput}
					class="w-16 px-2.5 py-1 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<span class="text-xs text-slate-500">Santri</span>
			</div>
		</div>
	</div>

	<!-- Search & Filter Controls -->
	<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
		<!-- Search Query -->
		<div class="relative flex-1 min-w-[260px]">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari No Tes, Nama Santri, atau Asal Sekolah..."
				class="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
			/>
		</div>

		<!-- Filter Jurusan -->
		<div class="flex items-center gap-2">
			<Filter class="w-4 h-4 text-slate-400 hidden sm:block" />
			<select
				bind:value={selectedMajor}
				class="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
			>
				<option value="ALL">Semua Jurusan</option>
				{#if data.majors && data.majors.length > 0}
					{#each data.majors as m}
						<option value={m.name}>{m.name} ({m.code})</option>
					{/each}
				{:else}
					<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
					<option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
					<option value="Bisnis Digital">Bisnis Digital</option>
				{/if}
			</select>
		</div>

		<!-- Filter Kelulusan -->
		<div>
			<select
				bind:value={selectedStatus}
				class="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
			>
				<option value="ALL">Semua Status Kelulusan</option>
				<option value="LULUS">LULUS (Masuk Kuota)</option>
				<option value="WAITING_LIST">CADANGAN</option>
			</select>
		</div>
	</div>

	<!-- Master Ledger Table -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-blue-900 text-white font-semibold border-b border-blue-950">
					<tr>
						<!-- Rank Parallel (Sortable) -->
						<th class="py-3 px-3 w-16 text-center cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('rankParallel')}>
							<div class="inline-flex items-center gap-1">
								<span>Peringkat</span>
								{#if sortColumn === 'rankParallel'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- No Tes (Sortable) -->
						<th class="py-3 px-3 cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('testNumber')}>
							<div class="inline-flex items-center gap-1">
								<span>No Tes</span>
								{#if sortColumn === 'testNumber'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- Nama (Sortable) -->
						<th class="py-3 px-4 cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('fullName')}>
							<div class="inline-flex items-center gap-1">
								<span>Nama Santri</span>
								{#if sortColumn === 'fullName'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<th class="py-3 px-3">Jurusan</th>

						<!-- TPA Score & Rank (Sortable) -->
						<th class="py-3 px-3 text-right cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('tpaScore')}>
							<div class="inline-flex items-center justify-end gap-1 w-full">
								<span>Skor TPA</span>
								{#if sortColumn === 'tpaScore'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- Pesantren Score & Rank (Sortable) -->
						<th class="py-3 px-3 text-right cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('pesantrenScore')}>
							<div class="inline-flex items-center justify-end gap-1 w-full">
								<span>Skor Kepesantrenan</span>
								{#if sortColumn === 'pesantrenScore'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- Composite Score (Sortable) -->
						<th class="py-3 px-4 text-right cursor-pointer hover:bg-blue-800 transition" onclick={() => toggleSort('compositeScore')}>
							<div class="inline-flex items-center justify-end gap-1 w-full font-bold">
								<span>Nilai Akhir (50:50)</span>
								{#if sortColumn === 'compositeScore'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- Status Pleno -->
						<th class="py-3 px-3 text-center">Status Kelulusan</th>

						<!-- Action Buttons (Dossier & Rincian) -->
						<th class="py-3 px-3 text-center w-24">Aksi</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100">
					{#if processedCandidates.length === 0}
						<tr>
							<td colspan="9" class="py-8 text-center text-slate-400">
								Tidak ada data santri yang memenuhi kriteria filter.
							</td>
						</tr>
					{:else}
						{#each processedCandidates as c}
							{@const isExpanded = expandedCandidateId === c.id}
							{@const isLulus = c.ranking?.admissionStatus === 'LULUS'}

							<tr class="hover:bg-slate-50/80 transition {isExpanded ? 'bg-blue-50/40' : ''}">
								<!-- Rank Badge -->
								<td class="py-3 px-3 text-center">
									<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold {c.ranking?.rankParallel && c.ranking.rankParallel <= 3
										? 'bg-amber-100 text-amber-900 border border-amber-300'
										: isLulus
											? 'bg-blue-100 text-blue-800'
											: 'bg-slate-100 text-slate-600'}">
										#{c.ranking?.rankParallel || '-'}
									</span>
								</td>

								<!-- No Tes -->
								<td class="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
									{c.testNumber}
								</td>

								<!-- Nama -->
								<td class="py-3 px-4">
									<div>
										<p class="font-semibold text-slate-900">{c.fullName}</p>
										<p class="text-[11px] text-slate-500">{c.schoolOrigin}</p>
									</div>
								</td>

								<!-- Jurusan -->
								<td class="py-3 px-3 text-slate-700 whitespace-nowrap">
									<span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium {c.majorChoice === 'Rekayasa Perangkat Lunak'
										? 'bg-blue-50 text-blue-700'
										: c.majorChoice === 'Desain Komunikasi Visual'
											? 'bg-amber-50 text-amber-700'
											: 'bg-emerald-50 text-emerald-700'}">
										{c.majorChoice}
									</span>
								</td>

								<!-- TPA -->
								<td class="py-3 px-3 text-right">
									{#if c.tpaScore}
										<div class="font-bold text-slate-900">{c.tpaScore.finalScore100}</div>
										<div class="text-[10px] text-slate-500">
											Rank #{c.ranking?.rankTpa || '-'} &bull; ({c.tpaScore.rawTotalScore}/69 poin)
										</div>
									{:else}
										<div class="font-bold text-slate-400">-</div>
										<div class="text-[10px] text-slate-400">Belum dinilai</div>
									{/if}
								</td>

								<!-- Pesantren -->
								<td class="py-3 px-3 text-right">
									<div class="font-bold text-slate-900">{c.pesantrenScore?.averageScore || '-'}</div>
									<div class="text-[10px] text-slate-500">
										Rank #{c.ranking?.rankPesantren || '-'} &bull; 7 Bidang
									</div>
								</td>

								<!-- Composite -->
								<td class="py-3 px-4 text-right">
									<span class="text-sm font-extrabold text-blue-700">
										{c.ranking?.compositeScore || '-'}
									</span>
								</td>

								<!-- Admission Status -->
								<td class="py-3 px-3 text-center whitespace-nowrap">
									{#if isLulus}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
											<CheckCircle2 class="w-3 h-3" /> LULUS
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
											<AlertCircle class="w-3 h-3" /> CADANGAN
										</span>
									{/if}
								</td>

								<!-- Action Buttons (Dossier & Rincian) -->
								<td class="py-3 px-3 text-center whitespace-nowrap">
									<div class="inline-flex items-center gap-1">
										<button
											type="button"
											onclick={() => openDossier(c)}
											class="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
											title="Buka Catatan Kualitatif Wawancara Santri & Ortu"
										>
											<FileText class="w-3.5 h-3.5" />
										</button>
										<button
											type="button"
											onclick={() => toggleExpand(c.id)}
											class="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:text-blue-700 hover:bg-slate-200 border border-slate-200 transition"
											title="Lihat rincian 12 subtes TPA dan 7 bidang Kepesantrenan"
										>
											{#if isExpanded}
												<ChevronUp class="w-3.5 h-3.5 text-blue-700" />
											{:else}
												<ChevronDown class="w-3.5 h-3.5" />
											{/if}
										</button>
									</div>
								</td>
							</tr>

							<!-- Cut-off Line Indicator -->
							{#if sortColumn === 'rankParallel' && c.ranking?.rankParallel === quotaInput}
								<tr class="bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 border-y-2 border-dashed border-emerald-400">
									<td colspan="9" class="py-2.5 px-4 text-center">
										<div class="flex items-center justify-center gap-2 text-xs font-black text-slate-800">
											<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
											<span class="tracking-wide uppercase text-emerald-900">BATAS KUOTA PENERIMAAN: {quotaInput} SANTRI TERATAS DINYATAKAN LULUS</span>
											<span class="text-slate-300">|</span>
											<span class="text-amber-800 font-semibold text-[11px]">Peringkat #{quotaInput + 1} ke bawah berstatus CADANGAN</span>
											<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
										</div>
									</td>
								</tr>
							{/if}

							<!-- Expanded Accordion Row -->
							{#if isExpanded}
								<tr class="bg-blue-50/50">
									<td colspan="9" class="p-4 border-y border-blue-200">
										<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
											<!-- Rincian 12 Subtes TPA -->
											<div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
												<div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
													<div class="flex items-center gap-2">
														<ClipboardCheck class="w-4 h-4 text-blue-600" />
														<h4 class="font-bold text-slate-900 text-xs">Rincian 12 Subtes TPA</h4>
													</div>
													<span class="text-xs font-semibold text-blue-700">
														Skor Mentah: {c.tpaScore?.rawTotalScore || 0} / 69 poin
													</span>
												</div>

												{#if c.tpaScore}
													<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">EYD (Bobot 1)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.eydCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Kohesi (Bobot 1)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.kohesiCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Logika (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.logikaCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Analogi (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.analogiCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Wacana (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.wacanaCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">MTK Hitung (Bobot 3)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.mtkHitungCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">MTK Ruang (Bobot 3)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.mtkRuangCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">B. Inggris (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.bInggrisCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">B. Arab (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.bArabCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Tahfidz (Bobot 2)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.tahfidzCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Tahsin (Bobot 1)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.tahsinCorrect} / 3</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Karakter (Bobot 1)</span>
															<span class="font-bold text-slate-800">{c.tpaScore.karakterCorrect} / 6</span>
														</div>
													</div>
												{:else}
													<p class="text-xs text-slate-400 italic">Belum ada data nilai TPA tersimpan.</p>
												{/if}
											</div>

											<!-- Rincian 7 Bidang Kepesantrenan -->
											<div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
												<div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
													<div class="flex items-center gap-2">
														<BookOpen class="w-4 h-4 text-emerald-600" />
														<h4 class="font-bold text-slate-900 text-xs">Rincian 7 Bidang Kepesantrenan</h4>
													</div>
													<span class="text-xs font-semibold text-emerald-700">
														Rata-rata: {c.pesantrenScore?.averageScore || 0} / 100
													</span>
												</div>

												{#if c.pesantrenScore}
													<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Tahsin</span>
															<span class="font-bold text-emerald-700">{c.pesantrenScore.tahsinScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Tahfidz</span>
															<span class="font-bold text-emerald-700">{c.pesantrenScore.tahfidzScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Gab. Al-Qur'an</span>
															<span class="font-bold text-emerald-700">{c.pesantrenScore.combinedQuranScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Kitab Kuning</span>
															<span class="font-bold text-blue-700">{c.pesantrenScore.kitabKuningScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">B. Inggris</span>
															<span class="font-bold text-sky-700">{c.pesantrenScore.bInggrisScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">B. Arab</span>
															<span class="font-bold text-sky-700">{c.pesantrenScore.bArabScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Hadits & Doa</span>
															<span class="font-bold text-slate-800">{c.pesantrenScore.haditsScore}</span>
														</div>
														<div class="p-2 rounded bg-slate-50">
															<span class="text-slate-500 block">Adzan & Sholat</span>
															<span class="font-bold text-slate-800">{c.pesantrenScore.adzanScore} / {c.pesantrenScore.sholatScore}</span>
														</div>
													</div>
												{:else}
													<p class="text-xs text-slate-400 italic">Belum ada data nilai Kepesantrenan tersimpan.</p>
												{/if}
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Footer info -->
		<div class="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
			<div>
				Aturan Seri (Tie-Breaker Hierarchy): <strong>Nilai Akhir &rarr; Rata-rata Kepesantrenan &rarr; Gabungan Tahsin/Tahfidz &rarr; Logika + Karakter TPA &rarr; Waktu Pendaftaran</strong>.
			</div>
			<div>
				Menampilkan <strong>{processedCandidates.length}</strong> santri
			</div>
		</div>
	</div>

	<!-- ========================================================================= -->
	<!-- CUSTOM AESTHETIC MODAL: DOSSIER WAWANCARA SANTRI & ORANG TUA -->
	<!-- ========================================================================= -->
	{#if selectedDossierCandidate}
		{@const cand = selectedDossierCandidate}
		{@const formD = (cand.interview?.formData as Record<string, unknown>) || {}}

		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
			<div class="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				<!-- Modal Header -->
				<div class="bg-blue-700 text-white p-6 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-sky-200 text-lg border border-white/20">
							#{cand.ranking?.rankParallel || '-'}
						</div>
						<div>
							<h3 class="text-lg font-bold leading-tight">{cand.fullName}</h3>
							<p class="text-xs text-sky-100 font-mono mt-0.5">
								{cand.testNumber} &bull; {cand.schoolOrigin} &bull; {cand.majorChoice}
							</p>
						</div>
					</div>
					<button
						type="button"
						onclick={closeDossier}
						class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Modal Body (Scrollable) -->
				<div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
					<!-- Score Recap Cards -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
							<span class="text-slate-500 block text-[11px] font-medium">Skor TPA (Skala 100)</span>
							<p class="text-2xl font-black text-blue-700 mt-1">{cand.tpaScore?.finalScore100 || '-'}</p>
							<span class="text-[10px] text-blue-600 font-medium">
								{cand.tpaScore?.category || '-'} &bull; ({cand.tpaScore?.rawTotalScore || 0}/69 poin)
							</span>
						</div>

						<div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
							<span class="text-slate-500 block text-[11px] font-medium">Skor Kepesantrenan</span>
							<p class="text-2xl font-black text-emerald-700 mt-1">{cand.pesantrenScore?.averageScore || '-'}</p>
							<span class="text-[10px] text-emerald-600 font-medium">
								Rata-rata 7 Bidang Ibadah & Bahasa
							</span>
						</div>

						<div class="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
							<span class="text-slate-500 block text-[11px] font-medium">Nilai Akhir Gabungan</span>
							<p class="text-2xl font-black text-sky-800 mt-1">{cand.ranking?.compositeScore || '-'}</p>
							<span class="text-[10px] text-sky-600 font-medium">
								50% TPA + 50% Kepesantrenan
							</span>
						</div>
					</div>

					<!-- Rincian Catatan Kualitatif Wawancara (26 Butir / 4 Dimensi) -->
					<div class="space-y-4">
						<h4 class="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
							<FileText class="w-4 h-4 text-blue-600" />
							<span>Dossier Kualitatif Wawancara Santri & Orang Tua</span>
						</h4>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
								<span class="font-bold text-slate-700 block text-[11px]">Prestasi yang Pernah Diraih:</span>
								<p class="text-slate-900 mt-1">{formD.prestasi || '-'}</p>
							</div>

							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
								<span class="font-bold text-slate-700 block text-[11px]">Riwayat Perilaku (Pacaran & Merokok):</span>
								<p class="text-slate-900 mt-1">
									Pacaran: <strong>{formD.riwayat_pacaran || '-'}</strong> |
									Merokok: <strong>{formD.riwayat_merokok || '-'}</strong>
								</p>
							</div>

							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
								<span class="font-bold text-slate-700 block text-[11px]">Kecakapan Komputer & Editing:</span>
								<p class="text-slate-900 mt-1">
									Aplikasi: {formD.aplikasi_komputer || '-'}, Editing: {formD.aplikasi_editing || '-'}
								</p>
							</div>

							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
								<span class="font-bold text-slate-700 block text-[11px]">Respons terhadap Ejekan / Bullying:</span>
								<p class="text-slate-900 mt-1">{formD.respons_ejekan || '-'}</p>
							</div>
						</div>

						<!-- Ringkasan Naratif Pewawancara -->
						<div class="space-y-3 pt-2">
							<div class="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
								<span class="font-bold text-blue-900 block text-[11px]">Ringkasan Umum Calon Santri:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.studentGeneralSummary || '-'}</p>
							</div>

							<div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
								<span class="font-bold text-emerald-900 block text-[11px]">Kesiapan Berasrama & Komitmen Spiritual:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.studentPesantrenSummary || '-'}</p>
							</div>

							<div class="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
								<span class="font-bold text-amber-900 block text-[11px]">Komitmen Orang Tua / Wali:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.parentCommitmentSummary || '-'}</p>
							</div>

							<div class="p-3.5 rounded-xl bg-slate-100 border border-slate-300">
								<span class="font-bold text-slate-900 block text-[11px]">Rekomendasi Khusus Pewawancara:</span>
								<p class="text-slate-800 mt-1 font-semibold">{cand.interview?.specialRecommendation || '-'}</p>
								<div class="mt-2 text-[10px] text-slate-500 text-right">
									Pewawancara: <strong>{cand.interview?.interviewerName || 'Panitia Wawancara'}</strong>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Modal Footer -->
				<div class="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
					<div class="text-xs text-slate-600">
						Status Seleksi:
						<strong class={cand.ranking?.admissionStatus === 'LULUS' ? 'text-emerald-700' : 'text-amber-700'}>
							{cand.ranking?.admissionStatus || 'WAITING_LIST'}
						</strong>
					</div>
					<button
						type="button"
						onclick={closeDossier}
						class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition"
					>
						Tutup Catatan
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
