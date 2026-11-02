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
	<title>Dashboard Admisi & Analisis Seleksi | Edu-Test</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Admisi & Analisis Seleksi</h1>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
					Live Monitor
				</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				{data.activeWave?.waveName || 'Gelombang 1 - TA 2027/2028'} &bull; Kuota Daya Tampung: <strong class="text-blue-700">{data.quotaCapacity} Santri</strong>
			</p>
		</div>

		<div class="flex items-center gap-2 flex-wrap">
			<a
				href="/ledger"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
			>
				<FileSpreadsheet class="w-4 h-4" />
				<span>Master Ledger</span>
			</a>
			<a
				href="/pleno"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
			>
				<Award class="w-4 h-4 text-sky-400" />
				<span>Sidang Pleno</span>
			</a>
		</div>
	</div>

	<!-- 4 KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Total Pendaftar -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</span>
				<div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
					<Users class="w-5 h-5" />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-extrabold text-slate-900">{data.totalCandidates}</span>
				<span class="text-xs text-slate-500">calon santri</span>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>Status Terdaftar</span>
				<span class="font-medium text-blue-600">100% Aktif</span>
			</div>
		</div>

		<!-- Lengkap Dinilai -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai Dinilai</span>
				<div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<CheckCircle2 class="w-5 h-5" />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-extrabold text-emerald-700">{data.fullCompletedCount}</span>
				<span class="text-xs text-slate-500">/ {data.totalCandidates} santri</span>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>TPA, Pesantren & Wawancara</span>
				<span class="font-medium text-emerald-600">
					{data.totalCandidates > 0 ? Math.round((data.fullCompletedCount / data.totalCandidates) * 100) : 0}%
				</span>
			</div>
		</div>

		<!-- Pending Penilaian -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Belum Lengkap</span>
				<div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
					<AlertCircle class="w-5 h-5" />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-extrabold text-amber-700">{data.pendingCount}</span>
				<span class="text-xs text-slate-500">santri belum selesai</span>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>Menunggu verifikasi nilai</span>
				<span class="font-medium text-amber-600">
					{data.pendingCount === 0 ? 'Semua Selesai' : `${data.pendingCount} santri`}
				</span>
			</div>
		</div>

		<!-- Status Kelulusan -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyeksi Pleno</span>
				<div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
					<Award class="w-5 h-5" />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="text-3xl font-extrabold text-blue-700">{data.lulusCount}</span>
				<span class="text-xs text-slate-500">Lulus / {data.waitingListCount} Waiting</span>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>Kapasitas Kuota</span>
				<span class="font-medium text-blue-700">{data.quotaCapacity} Kursi</span>
			</div>
		</div>
	</div>

	<!-- Progress Tracker Per Bidang Ujian -->
	<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
					<Layers class="w-4 h-4 text-blue-600" />
					Progres Penilaian Seleksi
				</h2>
				<p class="text-xs text-slate-500">Status kelengkapan formulir penilaian santri per materi tes</p>
			</div>
			<span class="text-xs text-slate-400">Total 3 Bidang Uji</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Tes TPA -->
			<a
				href="/tpa"
				class="group p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
							<ClipboardCheck class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-sm font-semibold text-slate-900 group-hover:text-blue-800 transition flex items-center gap-1">
								<span>Tes Potensi Akademik (TPA)</span>
								<ArrowUpRight class="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
							</h3>
							<p class="text-[11px] text-slate-500">12 Subtes (Max 69 Poin &bull; Skala 100)</p>
						</div>
					</div>
					<span class="text-sm font-bold text-blue-700">{data.testProgress.tpa.percentage}%</span>
				</div>
				<div class="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
					<div
						class="bg-blue-600 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.tpa.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-xs text-slate-500 flex items-center justify-between">
					<span class="text-blue-700 font-semibold group-hover:underline">Buka Lembar TPA &rarr;</span>
					<span>{data.testProgress.tpa.count} dari {data.totalCandidates} dinilai</span>
				</div>
			</a>

			<!-- Tes Kepesantrenan -->
			<a
				href="/rubrik"
				class="group p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
							<BookOpen class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition flex items-center gap-1">
								<span>Tes Kepesantrenan</span>
								<ArrowUpRight class="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
							</h3>
							<p class="text-[11px] text-slate-500">7 Bidang Praktik Ibadah & Bahasa</p>
						</div>
					</div>
					<span class="text-sm font-bold text-emerald-700">{data.testProgress.pesantren.percentage}%</span>
				</div>
				<div class="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
					<div
						class="bg-emerald-600 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.pesantren.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-xs text-slate-500 flex items-center justify-between">
					<span class="text-emerald-700 font-semibold group-hover:underline">Buka Lembar Kepesantrenan &rarr;</span>
					<span>{data.testProgress.pesantren.count} dari {data.totalCandidates} dinilai</span>
				</div>
			</a>

			<!-- Wawancara Santri -->
			<a
				href="/wawancara"
				class="group p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-300 transition block shadow-2xs"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition">
							<MessageSquareText class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-sm font-semibold text-slate-900 group-hover:text-sky-800 transition flex items-center gap-1">
								<span>Wawancara Santri & Ortu</span>
								<ArrowUpRight class="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition" />
							</h3>
							<p class="text-[11px] text-slate-500">26 Butir Catatan Profil & Kesiapan</p>
						</div>
					</div>
					<span class="text-sm font-bold text-sky-700">{data.testProgress.interview.percentage}%</span>
				</div>
				<div class="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
					<div
						class="bg-sky-600 h-full rounded-full transition-all duration-500"
						style="width: {data.testProgress.interview.percentage}%"
					></div>
				</div>
				<div class="mt-2 text-right text-xs text-slate-500 flex items-center justify-between">
					<span class="text-sky-700 font-semibold group-hover:underline">Buka Lembar Wawancara &rarr;</span>
					<span>{data.testProgress.interview.count} dari {data.totalCandidates} selesai</span>
				</div>
			</a>
		</div>
	</div>

	<!-- Analytics Grid: Sebaran Nilai TPA & Rata-rata 7 Bidang Kepesantrenan -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Distribusi Kategori TPA -->
		<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
							<BarChart3 class="w-4 h-4 text-blue-600" />
							Distribusi Kategori Skor TPA
						</h2>
						<p class="text-xs text-slate-500">Frekuensi perolehan kategori hasil normalisasi skala 100</p>
					</div>
				</div>

				<div class="space-y-3 mt-4">
					{#each Object.entries(data.tpaCategories) as [category, count]}
						{@const pct = data.totalCandidates > 0 ? Math.round((count / data.totalCandidates) * 100) : 0}
						<div>
							<div class="flex items-center justify-between text-xs mb-1">
								<span class="font-medium text-slate-700">{category}</span>
								<span class="text-slate-500">{count} santri ({pct}%)</span>
							</div>
							<div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full transition-all duration-500 {category === 'Sangat Baik'
										? 'bg-blue-600'
										: category === 'Baik'
											? 'bg-sky-500'
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

			<div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Standar TPA: EYD, MTK, Logika, Bahasa & Al-Qur'an</span>
				<a href="/ledger" class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
					Rincian Ledger <ArrowUpRight class="w-3 h-3" />
				</a>
			</div>
		</div>

		<!-- Radar 7 Bidang Kepesantrenan -->
		<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
							<TrendingUp class="w-4 h-4 text-emerald-600" />
							Rata-rata 7 Bidang Kepesantrenan
						</h2>
						<p class="text-xs text-slate-500">Penguasaan materi ibadah, bahasa, dan Al-Qur'an (Skala 100)</p>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3 mt-4">
					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Tahsin Al-Qur'an</span>
						<span class="text-xl font-bold text-emerald-700">{data.pesantrenRadar.tahsin}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-emerald-600 h-full rounded-full" style="width: {data.pesantrenRadar.tahsin}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Tahfidz (Hafalan)</span>
						<span class="text-xl font-bold text-emerald-700">{data.pesantrenRadar.tahfidz}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-emerald-600 h-full rounded-full" style="width: {data.pesantrenRadar.tahfidz}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Kitab Kuning</span>
						<span class="text-xl font-bold text-blue-700">{data.pesantrenRadar.kitabKuning}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-blue-600 h-full rounded-full" style="width: {data.pesantrenRadar.kitabKuning}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Bahasa Arab</span>
						<span class="text-xl font-bold text-blue-700">{data.pesantrenRadar.bArab}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-blue-600 h-full rounded-full" style="width: {data.pesantrenRadar.bArab}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Bahasa Inggris</span>
						<span class="text-xl font-bold text-sky-700">{data.pesantrenRadar.bInggris}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-sky-600 h-full rounded-full" style="width: {data.pesantrenRadar.bInggris}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Hadits & Doa</span>
						<span class="text-xl font-bold text-sky-700">{data.pesantrenRadar.hadits}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-sky-600 h-full rounded-full" style="width: {data.pesantrenRadar.hadits}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Praktik Adzan</span>
						<span class="text-xl font-bold text-slate-800">{data.pesantrenRadar.adzan}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-slate-700 h-full rounded-full" style="width: {data.pesantrenRadar.adzan}%"></div>
						</div>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
						<span class="text-[11px] text-slate-500 block">Bacaan Sholat</span>
						<span class="text-xl font-bold text-slate-800">{data.pesantrenRadar.sholat}</span>
						<div class="w-full bg-slate-200 h-1.5 rounded-full mt-2">
							<div class="bg-slate-700 h-full rounded-full" style="width: {data.pesantrenRadar.sholat}%"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
				<span>Bobot Penilaian: Skala 1–4 terkonversi bobot standar</span>
				<span class="text-emerald-600 font-semibold">Tervalidasi Penguji</span>
			</div>
		</div>
	</div>

	<!-- Department Distribution & Top 5 Candidates Preview -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Sebaran Jurusan -->
		<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
			<h2 class="text-base font-bold text-slate-900 mb-1">Statistik Jurusan Pilihan</h2>
			<p class="text-xs text-slate-500 mb-4">Rata-rata skor komposit berdasarkan minat keahlian</p>

			<div class="space-y-4">
				{#each Object.entries(data.departmentStats) as [deptName, stat]}
					<div class="p-3 rounded-xl border border-slate-100 bg-slate-50">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold text-slate-800">{deptName}</span>
							<span class="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-medium">
								{stat.total} santri
							</span>
						</div>
						<div class="mt-2 flex items-baseline justify-between text-xs text-slate-500">
							<span>Rata-rata Skor Komposit:</span>
							<span class="text-sm font-bold text-blue-700">{stat.avgComposite}</span>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
				💡 <strong>Info:</strong> Kuota kelulusan paralel didasarkan pada skor gabungan komposit 50% TPA + 50% Kepesantrenan.
			</div>
		</div>

		<!-- Top 5 Ranking Sementara -->
		<div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
							<Award class="w-4 h-4 text-amber-500" />
							Top 5 Peringkat Paralel Sementara
						</h2>
						<p class="text-xs text-slate-500">Kandidat dengan perolehan skor komposit tertinggi saat ini</p>
					</div>
					<a
						href="/ledger"
						class="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
					>
						Lihat Semua <ChevronRight class="w-3 h-3" />
					</a>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
							<tr>
								<th class="py-2.5 px-3">Peringkat</th>
								<th class="py-2.5 px-3">No Tes</th>
								<th class="py-2.5 px-3">Nama Santri</th>
								<th class="py-2.5 px-3">Jurusan</th>
								<th class="py-2.5 px-3 text-right">TPA</th>
								<th class="py-2.5 px-3 text-right">Pesantren</th>
								<th class="py-2.5 px-3 text-right">Komposit</th>
								<th class="py-2.5 px-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.topCandidates as c}
								<tr class="hover:bg-slate-50/80 transition">
									<td class="py-2.5 px-3 font-bold text-slate-900">
										<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs">
											#{c.ranking?.rankParallel}
										</span>
									</td>
									<td class="py-2.5 px-3 font-mono text-slate-600">{c.testNumber}</td>
									<td class="py-2.5 px-3 font-semibold text-slate-800">{c.fullName}</td>
									<td class="py-2.5 px-3 text-slate-500">{c.majorChoice}</td>
									<td class="py-2.5 px-3 text-right font-medium text-slate-700">
										{#if c.tpaScore}
											<div class="font-bold text-slate-900">{c.tpaScore.finalScore100}</div>
											<div class="text-[10px] text-slate-400 font-mono">({c.tpaScore.rawTotalScore}/69 poin)</div>
										{:else}
											<span class="text-slate-400">-</span>
										{/if}
									</td>
									<td class="py-2.5 px-3 text-right font-medium text-slate-700">
										{c.pesantrenScore?.averageScore || '-'}
									</td>
									<td class="py-2.5 px-3 text-right font-bold text-blue-700">
										{c.ranking?.compositeScore || '-'}
									</td>
									<td class="py-2.5 px-3 text-center">
										{#if c.ranking?.admissionStatus === 'LULUS'}
											<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
												LULUS
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
												WAITING LIST
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
				<span>Tie-breaker aktif: Kepesantrenan &rarr; Tahsin & Tahfidz &rarr; Subtes Logika</span>
				<a href="/pleno" class="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
					Buka Sidang Pleno Penetapan <ChevronRight class="w-3 h-3" />
				</a>
			</div>
		</div>
	</div>
</div>
