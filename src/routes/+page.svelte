<script lang="ts">
	import type { PageProps } from './$types';
	import {
		Users,
		ClipboardCheck,
		BookOpen,
		MessageSquareText,
		Award,
		FileSpreadsheet,
		ChevronRight,
		ArrowUpRight,
		TrendingUp,
		AlertCircle,
		CheckCircle2,
		Layers,
		BarChart3
	} from 'lucide-svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard Seleksi Admisi | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header (Clean, Zero Slop) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
		<div>
			<h1 class="text-xl font-bold text-slate-900 tracking-tight">Dashboard Seleksi Admisi</h1>
			<p class="text-xs text-slate-500 mt-1">
				{data.activeWave?.waveName || 'Gelombang 1 - TA 2027/2028'} &bull; Kuota Daya Tampung: <strong class="text-blue-700 tabular-nums">{data.quotaCapacity} Santri</strong>
			</p>
		</div>

		<div class="flex items-center gap-2 flex-wrap">
			<a
				href="/ledger"
				class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition shadow-xs shadow-blue-700/20"
			>
				<FileSpreadsheet class="w-3.5 h-3.5" />
				<span>Master Ledger</span>
			</a>
			<a
				href="/pleno"
				class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs"
			>
				<Award class="w-3.5 h-3.5 text-sky-400" />
				<span>Sidang Pleno</span>
			</a>
		</div>
	</div>

	<!-- 4 KPI Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
		<!-- Total Pendaftar -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-slate-500">Total Peserta</span>
				<div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
					<Users class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-1.5">
				<span class="text-2xl font-bold text-slate-900 tabular-nums">{data.totalCandidates}</span>
				<span class="text-xs text-slate-500">santri</span>
			</div>
			<div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
				<span>Status Admisi</span>
				<span class="font-semibold text-blue-700">100% Terdaftar</span>
			</div>
		</div>

		<!-- Lengkap Dinilai -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-slate-500">Selesai Dinilai</span>
				<div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-1.5">
				<span class="text-2xl font-bold text-emerald-700 tabular-nums">{data.fullCompletedCount}</span>
				<span class="text-xs text-slate-500">/ {data.totalCandidates} santri</span>
			</div>
			<div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
				<span>Kelengkapan Ujian</span>
				<span class="font-semibold text-emerald-700 tabular-nums">
					{data.totalCandidates > 0 ? Math.round((data.fullCompletedCount / data.totalCandidates) * 100) : 0}%
				</span>
			</div>
		</div>

		<!-- Pending Penilaian -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-slate-500">Belum Lengkap</span>
				<div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
					<AlertCircle class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-1.5">
				<span class="text-2xl font-bold text-amber-700 tabular-nums">{data.pendingCount}</span>
				<span class="text-xs text-slate-500">santri tersisa</span>
			</div>
			<div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
				<span>Dalam Antrean</span>
				<span class="font-semibold text-amber-700">
					{data.pendingCount === 0 ? 'Tuntas' : `${data.pendingCount} santri`}
				</span>
			</div>
		</div>

		<!-- Status Kelulusan -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-slate-500">Proyeksi Kelulusan</span>
				<div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
					<Award class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-1.5">
				<span class="text-2xl font-bold text-blue-900 tabular-nums">{data.lulusCount}</span>
				<span class="text-xs text-slate-500">Lulus / {data.waitingListCount} Cadangan</span>
			</div>
			<div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
				<span>Kapasitas Kuota</span>
				<span class="font-semibold text-blue-700 tabular-nums">{data.quotaCapacity} Kursi</span>
			</div>
		</div>
	</div>

	<!-- Progress Tracker Per Bidang Ujian -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
		<div class="flex items-center justify-between mb-3.5">
			<div>
				<h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
					<Layers class="w-4 h-4 text-blue-700" />
					Progres 3 Bidang Ujian Seleksi
				</h2>
			</div>
			<span class="text-[11px] text-slate-400 font-medium">Monitoring Real-time</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<!-- Tes TPA -->
			<a
				href="/tpa"
				class="group p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
							<ClipboardCheck class="w-3.5 h-3.5" />
						</div>
						<div>
							<h3 class="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition">
								1. Tes Potensi Akademik (TPA)
							</h3>
							<p class="text-[10px] text-slate-400">12 Subtes &bull; Maks 69 Poin</p>
						</div>
					</div>
					<span class="text-xs font-bold text-blue-700 tabular-nums">{data.testProgress.tpa.percentage}%</span>
				</div>
				<div class="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
					<div
						class="bg-blue-700 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.tpa.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-[11px] text-slate-500 flex items-center justify-between">
					<span class="text-blue-700 font-semibold group-hover:underline">Buka TPA &rarr;</span>
					<span class="tabular-nums">{data.testProgress.tpa.count} / {data.totalCandidates} dinilai</span>
				</div>
			</a>

			<!-- Tes Kepesantrenan -->
			<a
				href="/rubrik"
				class="group p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition">
							<BookOpen class="w-3.5 h-3.5" />
						</div>
						<div>
							<h3 class="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition">
								2. Tes Kepesantrenan
							</h3>
							<p class="text-[10px] text-slate-400">7 Bidang Praktik & Bahasa</p>
						</div>
					</div>
					<span class="text-xs font-bold text-emerald-700 tabular-nums">{data.testProgress.pesantren.percentage}%</span>
				</div>
				<div class="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
					<div
						class="bg-emerald-600 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.pesantren.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-[11px] text-slate-500 flex items-center justify-between">
					<span class="text-emerald-700 font-semibold group-hover:underline">Buka Kepesantrenan &rarr;</span>
					<span class="tabular-nums">{data.testProgress.pesantren.count} / {data.totalCandidates} dinilai</span>
				</div>
			</a>

			<!-- Wawancara Santri -->
			<a
				href="/wawancara"
				class="group p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
							<MessageSquareText class="w-3.5 h-3.5" />
						</div>
						<div>
							<h3 class="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition">
								3. Wawancara Santri & Ortu
							</h3>
							<p class="text-[10px] text-slate-400">26 Butir Profil & Komitmen</p>
						</div>
					</div>
					<span class="text-xs font-bold text-blue-700 tabular-nums">{data.testProgress.interview.percentage}%</span>
				</div>
				<div class="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
					<div
						class="bg-blue-700 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.interview.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-[11px] text-slate-500 flex items-center justify-between">
					<span class="text-blue-700 font-semibold group-hover:underline">Buka Wawancara &rarr;</span>
					<span class="tabular-nums">{data.testProgress.interview.count} / {data.totalCandidates} selesai</span>
				</div>
			</a>
		</div>
	</div>

	<!-- Analytics Grid: Sebaran Nilai TPA & 7 Bidang Kepesantrenan -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- Distribusi Kategori TPA -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-3">
					<h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
						<BarChart3 class="w-4 h-4 text-blue-700" />
						Distribusi Kategori Skor TPA
					</h2>
					<span class="text-[11px] text-slate-400">Skala 100</span>
				</div>

				<div class="space-y-3 mt-3">
					{#each Object.entries(data.tpaCategories) as [category, count]}
						{@const pct = data.totalCandidates > 0 ? Math.round((count / data.totalCandidates) * 100) : 0}
						<div>
							<div class="flex items-center justify-between text-xs mb-1">
								<span class="font-semibold text-slate-700">{category}</span>
								<span class="text-slate-500 tabular-nums">{count} santri ({pct}%)</span>
							</div>
							<div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full transition-all duration-500 {category === 'Sangat Baik'
										? 'bg-blue-700'
										: category === 'Baik'
											? 'bg-blue-500'
											: category === 'Sedang'
												? 'bg-amber-400'
												: 'bg-rose-400'}"
									style="width: {pct}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Hasil normalisasi skor mentah ke skala 100</span>
				<a href="/ledger" class="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center gap-1">
					Rincian Ledger <ArrowUpRight class="w-3 h-3" />
				</a>
			</div>
		</div>

		<!-- 7 Bidang Kepesantrenan (Compact Glanceable Bars) -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-3">
					<h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
						<TrendingUp class="w-4 h-4 text-emerald-700" />
						Rata-rata 7 Bidang Kepesantrenan
					</h2>
					<span class="text-[11px] text-slate-400">Skala 100</span>
				</div>

				<div class="grid grid-cols-2 gap-2.5 mt-3">
					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Tahsin</span>
							<strong class="font-bold text-emerald-800 tabular-nums">{data.pesantrenRadar.tahsin}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-emerald-600 h-full rounded-full" style="width: {data.pesantrenRadar.tahsin}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Tahfidz</span>
							<strong class="font-bold text-emerald-800 tabular-nums">{data.pesantrenRadar.tahfidz}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-emerald-600 h-full rounded-full" style="width: {data.pesantrenRadar.tahfidz}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Kitab Kuning</span>
							<strong class="font-bold text-blue-900 tabular-nums">{data.pesantrenRadar.kitabKuning}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-blue-700 h-full rounded-full" style="width: {data.pesantrenRadar.kitabKuning}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Bahasa Arab</span>
							<strong class="font-bold text-blue-900 tabular-nums">{data.pesantrenRadar.bArab}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-blue-700 h-full rounded-full" style="width: {data.pesantrenRadar.bArab}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Bahasa Inggris</span>
							<strong class="font-bold text-blue-900 tabular-nums">{data.pesantrenRadar.bInggris}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-blue-600 h-full rounded-full" style="width: {data.pesantrenRadar.bInggris}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Hadits & Doa</span>
							<strong class="font-bold text-blue-900 tabular-nums">{data.pesantrenRadar.hadits}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-blue-600 h-full rounded-full" style="width: {data.pesantrenRadar.hadits}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Praktik Adzan</span>
							<strong class="font-bold text-slate-800 tabular-nums">{data.pesantrenRadar.adzan}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-slate-700 h-full rounded-full" style="width: {data.pesantrenRadar.adzan}%"></div>
						</div>
					</div>

					<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-600 font-medium">Bacaan Sholat</span>
							<strong class="font-bold text-slate-800 tabular-nums">{data.pesantrenRadar.sholat}</strong>
						</div>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5">
							<div class="bg-slate-700 h-full rounded-full" style="width: {data.pesantrenRadar.sholat}%"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>Penguasaan ibadah & bahasa terstandarisasi</span>
				<span class="text-emerald-700 font-semibold">Tervalidasi</span>
			</div>
		</div>
	</div>

	<!-- Department Distribution & Top 5 Candidates Preview -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
		<!-- Sebaran Jurusan -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
			<h2 class="text-sm font-bold text-slate-900 mb-0.5">Statistik Jurusan Pilihan</h2>
			<p class="text-[11px] text-slate-500 mb-3">Distribusi peserta dan rata-rata skor komposit</p>

			<div class="space-y-2.5">
				{#each Object.entries(data.departmentStats) as [deptName, stat]}
					<div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold text-slate-800">{deptName}</span>
							<span class="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold tabular-nums">
								{stat.total} santri
							</span>
						</div>
						<div class="mt-1.5 flex items-baseline justify-between text-xs text-slate-500">
							<span>Rata-rata Skor:</span>
							<strong class="text-xs font-bold text-blue-800 tabular-nums">{stat.avgComposite}</strong>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Top 5 Ranking Sementara -->
		<div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-3">
					<div>
						<h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
							<Award class="w-4 h-4 text-blue-700" />
							Top 5 Peringkat Paralel Sementara
						</h2>
					</div>
					<a
						href="/ledger"
						class="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
					>
						Buka Semua <ChevronRight class="w-3 h-3" />
					</a>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
							<tr>
								<th class="py-2 px-2.5">Rank</th>
								<th class="py-2 px-2.5">No Tes</th>
								<th class="py-2 px-2.5">Nama Santri</th>
								<th class="py-2 px-2.5">Jurusan</th>
								<th class="py-2 px-2.5 text-right">TPA</th>
								<th class="py-2 px-2.5 text-right">Pesantren</th>
								<th class="py-2 px-2.5 text-right">Komposit</th>
								<th class="py-2 px-2.5 text-center">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.topCandidates as c}
								<tr class="hover:bg-slate-50 transition">
									<td class="py-2.5 px-2.5 font-bold text-slate-900">
										<span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-mono font-bold">
											#{c.ranking?.rankParallel}
										</span>
									</td>
									<td class="py-2.5 px-2.5 font-mono text-slate-600 text-[11px]">{c.testNumber}</td>
									<td class="py-2.5 px-2.5 font-semibold text-slate-800">{c.fullName}</td>
									<td class="py-2.5 px-2.5 text-slate-500 text-[11px]">{c.majorChoice}</td>
									<td class="py-2.5 px-2.5 text-right font-medium text-slate-700 tabular-nums">
										{#if c.tpaScore}
											<span class="font-bold text-slate-900">{c.tpaScore.finalScore100}</span>
										{:else}
											<span class="text-slate-400">-</span>
										{/if}
									</td>
									<td class="py-2.5 px-2.5 text-right font-medium text-slate-700 tabular-nums">
										{c.pesantrenScore?.averageScore || '-'}
									</td>
									<td class="py-2.5 px-2.5 text-right font-bold text-blue-800 tabular-nums">
										{c.ranking?.compositeScore || '-'}
									</td>
									<td class="py-2.5 px-2.5 text-center">
										{#if c.ranking?.admissionStatus === 'LULUS'}
											<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
												LULUS
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
												CADANGAN
											</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Perhitungan komposit: 50% TPA + 50% Kepesantrenan</span>
				<a href="/pleno" class="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center gap-1">
					Sidang Pleno <ChevronRight class="w-3 h-3" />
				</a>
			</div>
		</div>
	</div>
</div>
