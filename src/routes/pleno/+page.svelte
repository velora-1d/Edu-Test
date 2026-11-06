<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import {
		Award,
		Sliders,
		Users,
		CheckCircle2,
		AlertCircle,
		ShieldCheck,
		FileSpreadsheet,
		Eye,
		X,
		BookOpen,
		ClipboardCheck,
		MessageSquareText,
		School,
		ChevronRight,
		Save,
		Edit3,
		Sparkles,
		ArrowLeft,
		ArrowRight
	} from 'lucide-svelte';

	let { data, form }: PageProps = $props();

	// Interactive Cut-Off Kuota
	let quotaInput = $state(15);
	let approvedByName = $state('Drs. H. M. Samsul, M.Pd. (Pimpinan Sidang Pleno)');
	let isSaving = $state(false);

	$effect(() => {
		if (data.quotaCapacity) {
			quotaInput = data.quotaCapacity;
		}
	});

	// Dossier Modal & Custom Modals
	let selectedDossierCandidate = $state<(typeof data.candidates)[0] | null>(null);
	let showRatifyModal = $state(false);
	let overrideCandidate = $state<(typeof data.candidates)[0] | null>(null);
	let targetOverrideStatus = $state<'LULUS' | 'WAITING_LIST'>('LULUS');
	let overrideReasonText = $state('');

	// Overrides map: { [candidateId]: { status: 'LULUS' | 'WAITING_LIST', reason: string } }
	let overrides = $state<Record<string, { status: string; reason: string }>>({});

	function openDossier(c: (typeof data.candidates)[0]) {
		selectedDossierCandidate = c;
	}

	function closeDossier() {
		selectedDossierCandidate = null;
	}

	function startOverride(c: (typeof data.candidates)[0], newStatus: 'LULUS' | 'WAITING_LIST') {
		overrideCandidate = c;
		targetOverrideStatus = newStatus;
		overrideReasonText =
			overrides[c.id]?.reason ||
			(newStatus === 'LULUS'
				? 'Prestasi tahfidz & rekomendasi khusus pengasuh pondok'
				: 'Pertimbangan kesiapan asrama & kapasitas kuota gelombang');
	}

	function confirmOverride() {
		if (!overrideCandidate) return;
		overrides[overrideCandidate.id] = {
			status: targetOverrideStatus,
			reason: overrideReasonText.trim() || 'Diskresi pimpinan sidang pleno'
		};
		overrideCandidate = null;
		overrideReasonText = '';
	}

	function removeOverride(candidateId: string) {
		const newOverrides = { ...overrides };
		delete newOverrides[candidateId];
		overrides = newOverrides;
	}

	// Computed Pleno State
	const plenoCandidates = $derived(
		data.candidates.map((c, index) => {
			const rank = c.ranking?.rankParallel || index + 1;
			const override = overrides[c.id];

			let status = rank <= quotaInput ? 'LULUS' : 'WAITING_LIST';
			let isOverridden = false;

			if (override) {
				status = override.status;
				isOverridden = true;
			}

			return {
				...c,
				rank,
				status,
				isOverridden,
				overrideReason: override?.reason || c.ranking?.overrideReason
			};
		})
	);

	// Pleno Metrics
	const metrics = $derived(() => {
		let lulusCount = 0;
		let waitingCount = 0;
		const deptAccepted: Record<string, number> = {
			'Rekayasa Perangkat Lunak': 0,
			'Desain Komunikasi Visual': 0,
			'Bisnis Digital': 0
		};

		let passingGrade = 0;

		plenoCandidates.forEach((c) => {
			if (c.status === 'LULUS') {
				lulusCount++;
				if (deptAccepted[c.majorChoice] !== undefined) {
					deptAccepted[c.majorChoice]++;
				}
				// The lowest score among lulus candidates is passing grade
				const score = parseFloat(c.ranking?.compositeScore || '0');
				if (passingGrade === 0 || score < passingGrade) {
					passingGrade = score;
				}
			} else {
				waitingCount++;
			}
		});

		return {
			lulusCount,
			waitingCount,
			passingGrade,
			deptAccepted
		};
	});
</script>

<svelte:head>
	<title>Penetapan Hasil Kelulusan Santri | Edu-Test</title>
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
				href="/ledger"
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Rekap Nilai</span>
			</a>
			<span class="text-slate-300">&rarr;</span>
			<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold shadow-2xs">
				Penetapan Kelulusan
			</span>
		</div>

		<a
			href="/peserta"
			class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition ml-auto"
		>
			<span>Data Santri</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Penetapan Hasil Kelulusan Santri</h1>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
					Pimpinan Pondok
				</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				Penetapan batas kuota penerimaan, tinjauan catatan wawancara santri, dan pengesahan hasil seleksi santri baru.
			</p>
		</div>

		<div class="flex items-center gap-3 flex-wrap">
			<a
				href="/ledger"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-300 shadow-sm"
			>
				<FileSpreadsheet class="w-4 h-4" />
				<span>Buka Rekap Nilai Lengkap</span>
			</a>
		</div>
	</div>

	<!-- Alert banner for form response -->
	{#if form?.message}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-center justify-between shadow-sm">
			<div class="flex items-center gap-3">
				<ShieldCheck class="w-6 h-6 text-emerald-600" />
				<div>
					<p class="font-bold">Pengesahan Kelulusan Berhasil!</p>
					<p class="text-xs text-emerald-700">{form.message}</p>
				</div>
			</div>
		</div>
	{:else if form?.error}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm flex items-center justify-between shadow-sm">
			<div class="flex items-center gap-3">
				<AlertCircle class="w-6 h-6 text-rose-600" />
				<div>
					<p class="font-bold">Gagal Menyimpan Kelulusan</p>
					<p class="text-xs text-rose-700">{form.error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Interactive Cut-Off Simulator & Pleno Control Console -->
	<div class="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-blue-800">
		<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
			<!-- Slider & Input Kuota -->
			<div class="space-y-3 flex-1">
				<div class="flex items-center justify-between">
					<label for="quota-slider" class="text-sm font-bold text-sky-200 flex items-center gap-2">
						<Sliders class="w-4 h-4 text-sky-300" />
						Simulasi Batas Kuota Penerimaan:
					</label>
					<div class="flex items-center gap-2">
						<input
							type="number"
							id="quota-slider"
							min="1"
							max={data.candidates.length}
							bind:value={quotaInput}
							class="w-16 px-2.5 py-1 text-center font-extrabold text-blue-900 bg-white rounded-lg text-base border-none focus:ring-2 focus:ring-sky-400"
						/>
						<span class="text-xs text-sky-200">Santri</span>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<input
						type="range"
						min="1"
						max={data.candidates.length}
						bind:value={quotaInput}
						class="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
					/>
				</div>

				<div class="flex justify-between text-[11px] text-sky-300">
					<span>Min: 1</span>
					<span>Kapasitas Default: {data.quotaCapacity}</span>
					<span>Maks: {data.candidates.length} (Total Pendaftar)</span>
				</div>
			</div>

			<!-- Cut-Off Passing Grade & Acceptance Metric -->
			<div class="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-sm">
				<div class="text-center px-3 border-r border-white/20">
					<span class="text-[11px] text-sky-200 block uppercase font-medium">Diterima (Lulus)</span>
					<span class="text-2xl font-black text-emerald-300">{metrics().lulusCount}</span>
				</div>
				<div class="text-center px-3 border-r border-white/20">
					<span class="text-[11px] text-sky-200 block uppercase font-medium">Cadangan</span>
					<span class="text-2xl font-black text-amber-300">{metrics().waitingCount}</span>
				</div>
				<div class="text-center px-3">
					<span class="text-[11px] text-sky-200 block uppercase font-medium">Nilai Terendah Lolos</span>
					<span class="text-2xl font-black text-white">{metrics().passingGrade || '-'}</span>
				</div>
			</div>
		</div>

		<!-- Breakdown Acceptance per Jurusan & Form Pengesahan -->
		<div class="mt-6 pt-5 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex items-center gap-4 flex-wrap text-xs text-sky-200">
				<span>Sebaran Santri Diterima per Jurusan:</span>
				<span class="bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-600 text-white font-medium">
					RPL: {metrics().deptAccepted['Rekayasa Perangkat Lunak']} santri
				</span>
				<span class="bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-600 text-white font-medium">
					DKV: {metrics().deptAccepted['Desain Komunikasi Visual']} santri
				</span>
				<span class="bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-600 text-white font-medium">
					Bisnis Digital: {metrics().deptAccepted['Bisnis Digital']} santri
				</span>
			</div>

			<!-- Tombol Pengesahan Pleno (Custom Modal) -->
			<button
				type="button"
				disabled={isSaving}
				onclick={() => (showRatifyModal = true)}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-950/20 disabled:opacity-50 min-h-[44px]"
			>
				<ShieldCheck class="w-5 h-5 text-white" />
				<span>{isSaving ? 'Menyimpan Penetapan...' : 'Tetapkan & Sahkan Kelulusan'}</span>
			</button>
		</div>
	</div>

	<!-- Ranked Pleno Table with Visual Cut-Off Line -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
			<div>
				<h2 class="text-sm font-bold text-slate-800">Daftar Peringkat Nilai & Batas Kuota</h2>
				<p class="text-xs text-slate-500">
					Garis pembatas menandai batas kuota penerimaan ({quotaInput} santri teratas). Klik "Catatan" untuk melihat hasil wawancara santri & wali.
				</p>
			</div>
			<div class="text-xs text-slate-500 flex items-center gap-2">
				<span class="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
				<span>Diterima (Lulus)</span>
				<span class="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-300 ml-2"></span>
				<span>Cadangan</span>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
					<tr>
						<th class="py-3 px-3 text-center w-14">Peringkat</th>
						<th class="py-3 px-3">No. Tes</th>
						<th class="py-3 px-4">Nama Santri</th>
						<th class="py-3 px-3">Jurusan</th>
						<th class="py-3 px-3 text-right">Nilai TPA</th>
						<th class="py-3 px-3 text-right">Nilai Kepesantrenan</th>
						<th class="py-3 px-3 text-right font-bold text-slate-900">Nilai Akhir</th>
						<th class="py-3 px-3 text-center">Status Kelulusan</th>
						<th class="py-3 px-3 text-center">Pertimbangan Khusus</th>
						<th class="py-3 px-3 text-center w-24">Catatan</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100">
					{#each plenoCandidates as c, idx}
						{@const isLulus = c.status === 'LULUS'}
						{@const isAtCutOffBorder = c.rank === quotaInput}

						<tr class="hover:bg-slate-50/90 transition {isLulus ? 'bg-emerald-50/20' : 'bg-slate-50/30'}">
							<!-- Rank Badge -->
							<td class="py-3 px-3 text-center font-bold">
								<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs {isLulus
									? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
									: 'bg-slate-100 text-slate-600'}">
									#{c.rank}
								</span>
							</td>

							<!-- No Tes -->
							<td class="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
								{c.testNumber}
							</td>

							<!-- Nama & Sekolah -->
							<td class="py-3 px-4">
								<p class="font-semibold text-slate-900">{c.fullName}</p>
								<p class="text-[11px] text-slate-500">{c.schoolOrigin}</p>
							</td>

							<!-- Jurusan -->
							<td class="py-3 px-3 text-slate-700 whitespace-nowrap">
								{c.majorChoice}
							</td>

							<!-- TPA -->
							<td class="py-3 px-3 text-right">
								{#if c.tpaScore}
									<div class="font-bold text-slate-900">{c.tpaScore.finalScore100}</div>
									<div class="text-[10px] text-slate-400 font-mono">({c.tpaScore.rawTotalScore}/69 poin)</div>
								{:else}
									<span class="text-slate-400">-</span>
								{/if}
							</td>

							<!-- Pesantren -->
							<td class="py-3 px-3 text-right font-medium text-slate-700">
								{c.pesantrenScore?.averageScore || '-'}
							</td>

							<!-- Composite Score -->
							<td class="py-3 px-3 text-right font-extrabold text-blue-800 text-sm">
								{c.ranking?.compositeScore || '-'}
							</td>

							<!-- Admission Status Badge -->
							<td class="py-3 px-3 text-center whitespace-nowrap">
								{#if isLulus}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
										<CheckCircle2 class="w-3 h-3 text-emerald-600" />
										LULUS
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
										<AlertCircle class="w-3 h-3 text-amber-600" />
										CADANGAN
									</span>
								{/if}

								{#if c.isOverridden}
									<span class="block text-[9px] text-blue-700 font-semibold mt-0.5" title={c.overrideReason}>
										(Kebijakan Pimpinan)
									</span>
								{/if}
							</td>

							<!-- Override Action Control -->
							<td class="py-3 px-3 text-center whitespace-nowrap">
								{#if c.isOverridden}
									<button
										type="button"
										onclick={() => removeOverride(c.id)}
										class="px-2 py-0.5 text-[10px] rounded bg-rose-100 text-rose-700 hover:bg-rose-200 font-medium transition"
										title="Kembalikan status berdasarkan nilai murni sistem"
									>
										Kembalikan ke Nilai Murni
									</button>
								{:else if isLulus}
									<button
										type="button"
										onclick={() => startOverride(c, 'WAITING_LIST')}
										class="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800 font-medium transition"
										title="Ubah status menjadi Cadangan dengan catatan khusus"
									>
										&rarr; Jadikan Cadangan
									</button>
								{:else}
									<button
										type="button"
										onclick={() => startOverride(c, 'LULUS')}
										class="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 font-medium transition"
										title="Luluskan santri ini dengan pertimbangan khusus"
									>
										&rarr; Luluskan
									</button>
								{/if}
							</td>

							<!-- View Dossier Modal Button -->
							<td class="py-3 px-3 text-center">
								<button
									type="button"
									onclick={() => openDossier(c)}
									class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-semibold"
									title="Buka Catatan Lengkap Wawancara Santri & Orang Tua"
								>
									<Eye class="w-3.5 h-3.5" />
									<span>Catatan</span>
								</button>
							</td>
						</tr>

						<!-- Visual Cut-Off Divider Banner below the quota student -->
						{#if isAtCutOffBorder && idx < plenoCandidates.length - 1}
							<tr class="bg-amber-500 text-white font-bold text-center">
								<td colspan="10" class="py-2 px-4 shadow-inner">
									<div class="flex items-center justify-center gap-3 text-xs tracking-wider uppercase">
										<span>&darr; BATAS KUOTA PENERIMAAN ({quotaInput} SANTRI TERATAS) &darr;</span>
										<span class="text-[11px] font-normal normal-case opacity-90">
											Santri di bawah garis ini berstatus CADANGAN (menunggu kuota tambahan)
										</span>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Modal Catatan Profil & Wawancara Calon Santri -->
	{#if selectedDossierCandidate}
		{@const cand = selectedDossierCandidate}
		{@const formD = (cand.interview?.formData as Record<string, unknown>) || {}}

		<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
			<div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				<!-- Modal Header -->
				<div class="bg-blue-700 text-white p-5 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sky-200 text-lg">
							#{cand.ranking?.rankParallel || '-'}
						</div>
						<div>
							<h3 class="text-lg font-bold leading-tight">{cand.fullName}</h3>
							<p class="text-xs text-sky-100 font-mono">
								{cand.testNumber} &bull; {cand.schoolOrigin} &bull; {cand.majorChoice}
							</p>
						</div>
					</div>
					<button
						type="button"
						onclick={closeDossier}
						class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Modal Body (Scrollable) -->
				<div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
					<!-- Score Recap Cards -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div class="p-3 rounded-xl bg-blue-50 border border-blue-100">
							<span class="text-slate-500 block text-[11px]">Nilai TPA (Skala 100)</span>
							<p class="text-2xl font-black text-blue-700 mt-1">{cand.tpaScore?.finalScore100 || '-'}</p>
							<span class="text-[10px] text-blue-600 font-medium">
								{cand.tpaScore?.category || '-'} &bull; ({cand.tpaScore?.rawTotalScore || 0}/69 poin)
							</span>
						</div>

						<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
							<span class="text-slate-500 block text-[11px]">Nilai Kepesantrenan</span>
							<p class="text-2xl font-black text-emerald-700 mt-1">{cand.pesantrenScore?.averageScore || '-'}</p>
							<span class="text-[10px] text-emerald-600 font-medium">
								Tahsin {cand.pesantrenScore?.tahsinScore} &bull; Tahfidz {cand.pesantrenScore?.tahfidzScore}
							</span>
						</div>

						<div class="p-3 rounded-xl bg-slate-900 text-white">
							<span class="text-sky-200 block text-[11px]">Nilai Akhir Kelulusan</span>
							<p class="text-2xl font-black text-white mt-1">{cand.ranking?.compositeScore || '-'}</p>
							<span class="text-[10px] text-sky-200 font-medium">
								Peringkat #{cand.ranking?.rankParallel || '-'}
							</span>
						</div>
					</div>

					<!-- Section: Wawancara Deskriptif 26 Butir -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 border-b border-slate-200 pb-2">
							<MessageSquareText class="w-4 h-4 text-blue-600" />
							<h4 class="font-bold text-slate-900 text-sm">Catatan Hasil Wawancara & Asatidz</h4>
						</div>

						<!-- Grid Butir Pertanyaan Terpilih -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							{#if formD.stifin_category || formD.stifin_type}
								<div class="p-3 rounded-lg bg-blue-50/70 border border-blue-200 md:col-span-2 flex items-center justify-between">
									<div>
										<span class="font-bold text-blue-900 block text-xs">Hasil Tes STIFIn (Mesin Kecerdasan):</span>
										<p class="text-slate-800 text-xs mt-0.5">{formD.stifin_notes || 'Tidak ada catatan tambahan'}</p>
									</div>
									<span class="px-2.5 py-1 rounded-md bg-blue-700 text-white font-mono font-bold text-xs shrink-0">
										{formD.stifin_category || 'STIFIn'} {formD.stifin_type ? `(${formD.stifin_type})` : ''}
									</span>
								</div>
							{/if}

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Prestasi yang Pernah Diraih:</span>
								<p class="text-slate-900 mt-1">{formD.prestasi || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Inisiatif Mondok:</span>
								<p class="text-slate-900 mt-1">{formD.inisiatif_mondok || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Hafalan Juz Al-Qur'an:</span>
								<p class="text-slate-900 mt-1">{formD.hafalan_juz || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Kitab yang Pernah Dipelajari:</span>
								<p class="text-slate-900 mt-1">{formD.kitab_dipelajari || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Screening Perilaku (Pacaran / Merokok):</span>
								<p class="text-slate-900 mt-1">
									Pernah Pacaran: <strong class={formD.pernah_pacaran ? 'text-rose-600' : 'text-emerald-600'}>{formD.pernah_pacaran ? 'Ya' : 'Tidak'}</strong> &bull;
									Merokok: <strong class={formD.pernah_merokok ? 'text-rose-600' : 'text-emerald-600'}>{formD.pernah_merokok ? 'Ya' : 'Tidak'}</strong>
								</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
								<span class="font-semibold text-slate-700 block">Kecakapan Komputer & Editing:</span>
								<p class="text-slate-900 mt-1">
									Aplikasi: {formD.aplikasi_komputer || '-'}, Editing: {formD.aplikasi_editing || '-'}
								</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200 md:col-span-2">
								<span class="font-semibold text-slate-700 block">Respons terhadap Ejekan / Bullying:</span>
								<p class="text-slate-900 mt-1">{formD.respons_ejekan || '-'}</p>
							</div>

							{#if Array.isArray(formD.parent_qa) && formD.parent_qa.length > 0}
								<div class="p-3 rounded-lg bg-slate-50 border border-slate-200 md:col-span-2 space-y-2">
									<span class="font-bold text-slate-800 block text-xs">Butir Wawancara Orang Tua ({formD.parent_qa.length} Butir):</span>
									<div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
										{#each formD.parent_qa as qa, idx}
											<div class="p-2 bg-white rounded-lg border border-slate-200 text-xs">
												<div class="font-semibold text-slate-800">{idx + 1}. {qa.question}</div>
												<div class="text-slate-600 mt-0.5">{qa.answer || '-'}</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<!-- Ringkasan Naratif Pewawancara -->
						<div class="space-y-3 pt-2">
							<div class="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
								<span class="font-bold text-blue-900 block text-[11px]">Ringkasan Umum Calon Santri:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.studentGeneralSummary || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
								<span class="font-bold text-emerald-900 block text-[11px]">Kesiapan Berasrama & Komitmen Spiritual:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.studentPesantrenSummary || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
								<span class="font-bold text-amber-900 block text-[11px]">Komitmen Orang Tua / Wali:</span>
								<p class="text-slate-800 mt-1">{cand.interview?.parentCommitmentSummary || '-'}</p>
							</div>

							<div class="p-3 rounded-lg bg-slate-100 border border-slate-300">
								<span class="font-bold text-slate-900 block text-[11px]">Rekomendasi Khusus Pewawancara:</span>
								<p class="text-slate-800 mt-1 font-medium">{cand.interview?.specialRecommendation || '-'}</p>
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
						Status Saat Ini:
						<strong class={cand.ranking?.admissionStatus === 'LULUS' ? 'text-emerald-700' : 'text-amber-700'}>
							{cand.ranking?.admissionStatus || 'CADANGAN'}
						</strong>
					</div>
					<button
						type="button"
						onclick={closeDossier}
						class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition"
					>
						Tutup Catatan
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Custom Modal Pengesahan Hasil Seleksi (Bebas Dialog Browser Native) -->
	{#if showRatifyModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
		>
			<div
				class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
			>
				<!-- Modal Header -->
				<div class="flex items-start gap-4">
					<div
						class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs"
					>
						<ShieldCheck class="w-7 h-7 text-emerald-600" />
					</div>
					<div>
						<h3 class="text-lg font-bold text-slate-900">
							Sahkan Hasil Seleksi Santri Baru?
						</h3>
						<p class="text-xs text-slate-500 mt-1 leading-relaxed">
							Konfirmasi penetapan kuota kelulusan resmi santri baru. Hasil kelulusan akan disimpan secara resmi ke database seleksi.
						</p>
					</div>
				</div>

				<!-- Summary Card -->
				<div
					class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
				>
					<div
						class="flex justify-between items-center py-1.5 border-b border-slate-200/80"
					>
						<span class="text-slate-500 font-medium">Gelombang Seleksi:</span>
						<span class="font-bold text-slate-800"
							>{data.activeWave?.waveName || 'Gelombang 1'}</span
						>
					</div>
					<div
						class="flex justify-between items-center py-1.5 border-b border-slate-200/80"
					>
						<span class="text-slate-500 font-medium">Kapasitas Kuota Diterima:</span>
						<span class="font-black text-emerald-700 text-sm"
							>{quotaInput} Santri Lulus</span
						>
					</div>
					<div
						class="flex justify-between items-center py-1.5 border-b border-slate-200/80"
					>
						<span class="text-slate-500 font-medium">Total Santri Dinilai:</span>
						<span class="font-bold text-slate-800"
							>{plenoCandidates.length} Santri</span
						>
					</div>
					<div
						class="flex justify-between items-center py-1.5 border-b border-slate-200/80"
					>
						<span class="text-slate-500 font-medium">Jumlah Santri Cadangan:</span>
						<span class="font-bold text-amber-700"
							>{Math.max(0, plenoCandidates.length - quotaInput)} Santri</span
						>
					</div>
					<div
						class="flex justify-between items-center py-1.5"
					>
						<span class="text-slate-500 font-medium">Penanggung Jawab / Pimpinan:</span>
						<span class="font-semibold text-slate-800 text-right"
							>{approvedByName}</span
						>
					</div>
				</div>

				<!-- Notice Alert -->
				<div
					class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2.5"
				>
					<CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
					<span
						>Keputusan ini menetapkan daftar santri yang Diterima (Lulus) dan Cadangan untuk pengumuman resmi.</span
					>
				</div>

				<!-- Modal Actions -->
				<div class="flex items-center justify-end gap-3 pt-2">
					<button
						type="button"
						onclick={() => (showRatifyModal = false)}
						class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition min-h-[44px]"
					>
						Batal
					</button>

					<form
						method="POST"
						action="?/savePleno"
						use:enhance={() => {
							isSaving = true;
							showRatifyModal = false;
							return async ({ update }) => {
								isSaving = false;
								await update();
							};
						}}
					>
						<input
							type="hidden"
							name="waveId"
							value={data.activeWave?.id || ''}
						/>
						<input
							type="hidden"
							name="quotaCapacity"
							value={quotaInput}
						/>
						<input
							type="hidden"
							name="approvedBy"
							value={approvedByName}
						/>
						<input
							type="hidden"
							name="overrides"
							value={JSON.stringify(overrides)}
						/>

						<button
							type="submit"
							disabled={isSaving}
							class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-950/20 disabled:opacity-50 min-h-[44px]"
						>
							<ShieldCheck class="w-4 h-4 text-white" />
							<span>{isSaving ? 'Menyimpan...' : 'Ya, Tetapkan Kelulusan'}</span>
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Custom Modal Kebijakan Khusus Pimpinan -->
	{#if overrideCandidate}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
		>
			<div
				class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
			>
				<div class="flex items-start gap-3">
					<div
						class="w-10 h-10 rounded-xl {targetOverrideStatus === 'LULUS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center shrink-0 font-bold"
					>
						<Edit3 class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">
							Kebijakan Khusus Pimpinan
						</h3>
						<p class="text-xs text-slate-500 mt-0.5">
							Penyesuaian status kelulusan untuk <strong>{overrideCandidate.fullName}</strong> ({overrideCandidate.testNumber}).
						</p>
					</div>
				</div>

				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
					<div class="flex justify-between">
						<span class="text-slate-500">Peringkat & Nilai Akhir:</span>
						<span class="font-bold text-slate-900">#{overrideCandidate.ranking?.rankParallel || '-'} (Nilai: {overrideCandidate.ranking?.compositeScore || '-'})</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Status Baru:</span>
						<span class="font-bold {targetOverrideStatus === 'LULUS' ? 'text-emerald-700' : 'text-amber-700'}">
							{targetOverrideStatus === 'LULUS' ? 'LULUS (Diterima Kuota Khusus)' : 'CADANGAN (Penangguhan)'}
						</span>
					</div>
				</div>

				<div>
					<label for="override-reason" class="block text-xs font-semibold text-slate-700 mb-1.5">
						Alasan / Catatan Kebijakan Khusus:
					</label>
					<textarea
						id="override-reason"
						bind:value={overrideReasonText}
						rows="3"
						placeholder="Contoh: Prestasi hafalan Al-Qur'an mutqin, rekomendasi khusus pengasuh pondok..."
						class="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2.5 pt-1">
					<button
						type="button"
						onclick={() => (overrideCandidate = null)}
						class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition min-h-[38px]"
					>
						Batal
					</button>
					<button
						type="button"
						onclick={confirmOverride}
						class="px-4 py-2 rounded-xl {targetOverrideStatus === 'LULUS' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-950/20'} text-white font-bold text-xs transition shadow-md min-h-[38px]"
					>
						Terapkan Kebijakan
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
