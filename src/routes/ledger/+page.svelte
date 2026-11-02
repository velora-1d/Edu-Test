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
		ArrowRight
	} from 'lucide-svelte';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	let selectedMajor = $state('ALL');
	let selectedStatus = $state('ALL');
	let sortColumn = $state<'rankParallel' | 'compositeScore' | 'tpaScore' | 'pesantrenScore' | 'rankTpa' | 'rankPesantren' | 'testNumber' | 'fullName'>('rankParallel');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let expandedCandidateId = $state<string | null>(null);
	let isRecalculating = $state(false);

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
	<title>Master Ledger & Ranking Paralel | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Sequential Selection Workflow Banner -->
	<div class="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
		<div class="flex items-center gap-2 flex-wrap">
			<a
				href="/peserta"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Data Calon Santri</span>
			</a>
			<span class="text-slate-300">/</span>
			<a
				href="/tpa"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 font-semibold transition"
			>
				<span>1. TPA</span>
			</a>
			<span class="text-slate-300">/</span>
			<a
				href="/rubrik"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-semibold transition"
			>
				<span>2. Kepesantrenan</span>
			</a>
			<span class="text-slate-300">/</span>
			<a
				href="/wawancara"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 font-semibold transition"
			>
				<span>3. Wawancara</span>
			</a>
			<span class="text-slate-300">→</span>
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-700 text-white font-bold shadow-2xs">
				<span>Rekap Nilai (Aktif)</span>
			</span>
		</div>

		<a
			href="/pleno"
			class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition ml-auto shadow-xs"
		>
			<span>Sidang Pleno & Penetapan Kuota</span>
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
				Rekapitulasi nilai gabungan (50% TPA + 50% Kepesantrenan), peringkat otomatis paralel, dan berkas ekspor kelulusan
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
					<span>{isRecalculating ? 'Menghitung...' : 'Hitung Ulang Ranking'}</span>
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
				<span>Sidang Pleno</span>
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
			<span class="text-xs text-slate-500 font-medium">Total Kandidat</span>
			<p class="text-xl font-extrabold text-slate-900 mt-1">{stats().total}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Skor Tertinggi Komposit</span>
			<p class="text-xl font-extrabold text-emerald-600 mt-1">{stats().highest}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Rata-rata Komposit</span>
			<p class="text-xl font-extrabold text-blue-700 mt-1">{stats().average}</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Status LULUS</span>
			<p class="text-xl font-extrabold text-emerald-700 mt-1">{stats().lulus} santri</p>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Waiting List</span>
			<p class="text-xl font-extrabold text-amber-600 mt-1">{stats().waiting} santri</p>
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
				<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
				<option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
				<option value="Bisnis Digital">Bisnis Digital</option>
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
				<option value="WAITING_LIST">WAITING LIST</option>
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
								<span>Skor Komposit</span>
								{#if sortColumn === 'compositeScore'}
									{#if sortDirection === 'asc'}<ArrowUp class="w-3 h-3 text-sky-300" />{:else}<ArrowDown class="w-3 h-3 text-sky-300" />{/if}
								{:else}
									<ArrowUpDown class="w-3 h-3 text-blue-300 opacity-60" />
								{/if}
							</div>
						</th>

						<!-- Status Pleno -->
						<th class="py-3 px-3 text-center">Status Kelulusan</th>

						<!-- Expand Details Action -->
						<th class="py-3 px-3 text-center w-12">Rincian</th>
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
									<div class="font-bold text-slate-900">{c.tpaScore?.finalScore100 || '-'}</div>
									<div class="text-[10px] text-slate-500">
										Rank #{c.ranking?.rankTpa || '-'} &bull; {c.tpaScore?.category || '-'}
									</div>
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
											<AlertCircle class="w-3 h-3" /> WAITING LIST
										</span>
									{/if}
								</td>

								<!-- Toggle Detail Accordion Button -->
								<td class="py-3 px-3 text-center">
									<button
										type="button"
										onclick={() => toggleExpand(c.id)}
										class="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-200 transition"
										title="Lihat rincian 12 subtes TPA dan 7 bidang Kepesantrenan"
									>
										{#if isExpanded}
											<ChevronUp class="w-4 h-4 text-blue-700" />
										{:else}
											<ChevronDown class="w-4 h-4" />
										{/if}
									</button>
								</td>
							</tr>

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
				Aturan Seri (Tie-Breaker Hierarchy): <strong>Komposit &rarr; Rata-rata Kepesantrenan &rarr; Gabungan Tahsin/Tahfidz &rarr; Logika + Karakter TPA &rarr; Waktu Pendaftaran</strong>.
			</div>
			<div>
				Menampilkan <strong>{processedCandidates.length}</strong> santri
			</div>
		</div>
	</div>
</div>
