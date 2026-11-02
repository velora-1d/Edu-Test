<script lang="ts">
	import type { PageProps } from './$types';
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
		X
	} from 'lucide-svelte';

	let { data }: PageProps = $props();

	let searchQuery = $state('');
	let selectedMajor = $state('ALL');
	let selectedPipeline = $state('ALL');
	let selectedWave = $state('ALL');

	const filteredCandidates = $derived(
		data.candidates.filter((c) => {
			const matchesSearch =
				searchQuery.trim() === '' ||
				c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase());

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
	<title>Daftar Peserta Seleksi | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Peserta Seleksi</h1>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
					{filteredCandidates.length} Terpilih
				</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				Manajemen master data calon santri, status kehadiran sesi ruangan, dan kelengkapan meja ujian
			</p>
		</div>

		<div class="flex items-center gap-3">
			<a
				href="/ledger"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
			>
				<span>Buka Master Ledger</span>
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>
	</div>

	<!-- Stats Pills -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Total Terdaftar</span>
				<p class="text-2xl font-extrabold text-slate-900">{counts.total}</p>
			</div>
			<div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
				<Users class="w-4 h-4" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Selesai Semua Meja</span>
				<p class="text-2xl font-extrabold text-emerald-600">{counts.completed}</p>
			</div>
			<div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
				<CheckCircle2 class="w-4 h-4" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Sedang Ujian</span>
				<p class="text-2xl font-extrabold text-sky-600">{counts.inTest}</p>
			</div>
			<div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
				<Clock class="w-4 h-4" />
			</div>
		</div>

		<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
			<div>
				<span class="text-xs text-slate-500 font-medium">Belum Mulai</span>
				<p class="text-2xl font-extrabold text-amber-600">{counts.registered}</p>
			</div>
			<div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
				<AlertCircle class="w-4 h-4" />
			</div>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
		<!-- Search Input -->
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
				<option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
				<option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
				<option value="Bisnis Digital">Bisnis Digital (BD)</option>
			</select>
		</div>

		<!-- Filter Status Pipeline -->
		<div>
			<select
				bind:value={selectedPipeline}
				class="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
				class="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
			>
				<option value="ALL">Semua Gelombang</option>
				{#each data.allWaves as w}
					<option value={w.id}>{w.waveName}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Candidate Table -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
					<tr>
						<th class="py-3 px-4 w-12 text-center">No</th>
						<th class="py-3 px-4">No Tes</th>
						<th class="py-3 px-4">Nama Calon Santri</th>
						<th class="py-3 px-4">Asal Sekolah</th>
						<th class="py-3 px-4">Jurusan Pilihan</th>
						<th class="py-3 px-4">Sesi Ruangan</th>
						<th class="py-3 px-4 text-center">Kelengkapan Meja</th>
						<th class="py-3 px-4 text-center">Status Pipeline</th>
						<th class="py-3 px-4 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredCandidates.length === 0}
						<tr>
							<td colspan="9" class="py-8 text-center text-slate-400">
								Tidak ada data santri yang cocok dengan kriteria pencarian / filter.
							</td>
						</tr>
					{:else}
						{#each filteredCandidates as c, i}
							{@const isTpaLocked = c.tpaScore?.lockStatus === 'LOCKED'}
							{@const isPesantrenLocked = c.pesantrenScore?.lockStatus === 'LOCKED'}
							{@const isInterviewDone = c.interview?.completionStatus === 'COMPLETED'}

							<tr class="hover:bg-slate-50/80 transition">
								<td class="py-3 px-4 text-center font-medium text-slate-500">{i + 1}</td>
								<td class="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
									{c.testNumber}
								</td>
								<td class="py-3 px-4">
									<div class="flex items-center gap-2">
										<div class="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
											{c.fullName.substring(0, 2).toUpperCase()}
										</div>
										<span class="font-medium text-slate-900">{c.fullName}</span>
									</div>
								</td>
								<td class="py-3 px-4 text-slate-600">
									<div class="flex items-center gap-1.5">
										<School class="w-3.5 h-3.5 text-slate-400" />
										<span>{c.schoolOrigin}</span>
									</div>
								</td>
								<td class="py-3 px-4">
									<span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium {c.majorChoice === 'Rekayasa Perangkat Lunak'
										? 'bg-blue-50 text-blue-700 border border-blue-200'
										: c.majorChoice === 'Desain Komunikasi Visual'
											? 'bg-amber-50 text-amber-700 border border-amber-200'
											: 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
										{c.majorChoice}
									</span>
								</td>
								<td class="py-3 px-4 text-slate-600 font-medium">
									{c.roomAssignment || 'Ruang 1'}
								</td>

								<!-- Kelengkapan Meja Icons -->
								<td class="py-3 px-4 text-center">
									<div class="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
										<!-- TPA -->
										<span
											title="Meja TPA: {isTpaLocked ? 'LOCKED (' + c.tpaScore?.finalScore100 + ')' : 'DRAFT/BELUM'}"
											class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold {isTpaLocked
												? 'bg-blue-600 text-white'
												: 'bg-slate-200 text-slate-500'}"
										>
											T
										</span>
										<!-- Pesantren -->
										<span
											title="Meja Kepesantrenan: {isPesantrenLocked ? 'LOCKED (' + c.pesantrenScore?.averageScore + ')' : 'DRAFT/BELUM'}"
											class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold {isPesantrenLocked
												? 'bg-emerald-600 text-white'
												: 'bg-slate-200 text-slate-500'}"
										>
											K
										</span>
										<!-- Wawancara -->
										<span
											title="Meja Wawancara: {isInterviewDone ? 'COMPLETED' : 'IN_PROGRESS/BELUM'}"
											class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold {isInterviewDone
												? 'bg-sky-600 text-white'
												: 'bg-slate-200 text-slate-500'}"
										>
											W
										</span>
									</div>
								</td>

								<!-- Pipeline Status -->
								<td class="py-3 px-4 text-center whitespace-nowrap">
									{#if c.statusPipeline === 'COMPLETED'}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
											<Check class="w-3 h-3" /> COMPLETED
										</span>
									{:else if c.statusPipeline === 'IN_TEST'}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800">
											<Clock class="w-3 h-3" /> IN_TEST
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
											REGISTERED
										</span>
									{/if}
								</td>

								<!-- Actions -->
								<td class="py-3 px-4 text-center">
									<a
										href="/pleno"
										class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium"
									>
										<span>Pleno</span>
										<ArrowRight class="w-3 h-3" />
									</a>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<div class="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
			<span>Menampilkan <strong>{filteredCandidates.length}</strong> dari total <strong>{data.candidates.length}</strong> peserta seleksi.</span>
			<div class="flex items-center gap-4 text-slate-400">
				<span><strong class="text-blue-700">T</strong> = TPA</span>
				<span><strong class="text-emerald-700">K</strong> = Kepesantrenan</span>
				<span><strong class="text-sky-700">W</strong> = Wawancara</span>
			</div>
		</div>
	</div>
</div>
