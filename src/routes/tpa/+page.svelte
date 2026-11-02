<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { goto } from '$app/navigation';
	import {
		BookOpen,
		Calculator,
		CheckCircle2,
		Lock,
		Unlock,
		Save,
		AlertCircle,
		Search,
		User,
		School,
		Sparkles,
		ChevronRight,
		Award,
		Info,
		ArrowLeft,
		ArrowRight
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state('');
	let showLockModal = $state(false);

	// Currently selected candidate
	let currentCandidate = $derived(data.selectedCandidate);
	let isLocked = $derived(currentCandidate?.tpaScore?.lockStatus === 'LOCKED');

	// Examiner Name
	let examinerName = $state('Ust. Abdul Malik, S.Pd.');

	// 12 Subtest scores
	let eyd = $state(0);
	let kohesi = $state(0);
	let logika = $state(0);
	let analogi = $state(0);
	let wacana = $state(0);
	let mtkHitung = $state(0);
	let mtkRuang = $state(0);
	let bInggris = $state(0);
	let bArab = $state(0);
	let tahfidz = $state(0);
	let tahsin = $state(0);
	let karakter = $state(0);

	// Sync state when candidate changes
	$effect(() => {
		if (currentCandidate) {
			eyd = currentCandidate.tpaScore?.eydCorrect ?? 0;
			kohesi = currentCandidate.tpaScore?.kohesiCorrect ?? 0;
			logika = currentCandidate.tpaScore?.logikaCorrect ?? 0;
			analogi = currentCandidate.tpaScore?.analogiCorrect ?? 0;
			wacana = currentCandidate.tpaScore?.wacanaCorrect ?? 0;
			mtkHitung = currentCandidate.tpaScore?.mtkHitungCorrect ?? 0;
			mtkRuang = currentCandidate.tpaScore?.mtkRuangCorrect ?? 0;
			bInggris = currentCandidate.tpaScore?.bInggrisCorrect ?? 0;
			bArab = currentCandidate.tpaScore?.bArabCorrect ?? 0;
			tahfidz = currentCandidate.tpaScore?.tahfidzCorrect ?? 0;
			tahsin = currentCandidate.tpaScore?.tahsinCorrect ?? 0;
			karakter = currentCandidate.tpaScore?.karakterCorrect ?? 0;
			if (currentCandidate.tpaScore?.examinerName) {
				examinerName = currentCandidate.tpaScore.examinerName;
			}
		}
	});

	// Domain subtotals
	let indoSubtotal = $derived(eyd * 1 + kohesi * 1 + logika * 2 + analogi * 2 + wacana * 2); // max 21
	let mtkSubtotal = $derived(mtkHitung * 3 + mtkRuang * 3); // max 18
	let bahasaSubtotal = $derived(bInggris * 2 + bArab * 2); // max 12
	let quranSubtotal = $derived(tahfidz * 2 + tahsin * 1); // max 9
	let karakterSubtotal = $derived(karakter * 1); // max 6

	// Instant Svelte 5 $derived calculations
	let rawTotal = $derived(
		indoSubtotal + mtkSubtotal + bahasaSubtotal + quranSubtotal + karakterSubtotal
	); // max 69

	let finalScore100 = $derived(
		rawTotal === 0 ? 0 : Math.round((rawTotal / 69) * 100 * 10) / 10
	);

	let category = $derived.by(() => {
		if (finalScore100 <= 20) return { label: 'Sangat Buruk', color: 'bg-slate-100 text-slate-700 border-slate-300' };
		if (finalScore100 <= 40) return { label: 'Buruk', color: 'bg-rose-100 text-rose-800 border-rose-300' };
		if (finalScore100 <= 60) return { label: 'Sedang', color: 'bg-amber-100 text-amber-800 border-amber-300' };
		if (finalScore100 <= 80) return { label: 'Baik', color: 'bg-blue-100 text-blue-800 border-blue-300' };
		return { label: 'Sangat Baik', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
	});

	// Filtered candidates for selector
	let filteredCandidates = $derived(
		data.candidates.filter(
			(c) =>
				c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function selectCandidate(id: string) {
		goto(`/tpa?candidateId=${id}`, { reset: false });
	}
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Sequential Selection Workflow Banner -->
	<div class="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
		<div class="flex items-center gap-2 flex-wrap">
			<a
				href="/peserta"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Data Calon Santri</span>
			</a>
			<span class="text-slate-300">/</span>
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold shadow-2xs">
				<span>Meja 1: TPA (Aktif)</span>
			</span>
			<span class="text-slate-300">→</span>
			<a
				href={currentCandidate ? `/rubrik?candidateId=${currentCandidate.id}` : '/rubrik'}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-semibold transition"
			>
				<span>Meja 2: Kepesantrenan</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
			<span class="text-slate-300">→</span>
			<a
				href={currentCandidate ? `/wawancara?candidateId=${currentCandidate.id}` : '/wawancara'}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 font-semibold transition"
			>
				<span>Meja 3: Wawancara</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<a
			href="/ledger"
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50 font-semibold transition ml-auto"
		>
			<span>Buka Master Ledger</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>
	<!-- Top Navigation / Candidate Roster Bar (Tablet-Friendly Horizontal Scroll) -->
	<div class="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
			<div>
				<h2 class="text-xl font-extrabold text-blue-900 tracking-tight flex items-center gap-2">
					<BookOpen class="w-6 h-6 text-blue-700" />
					Meja Uji Tes Potensi Akademik (TPA)
				</h2>
				<p class="text-xs md:text-sm text-slate-500">
					12 Subtes terstandarisasi • 69 Poin Mentah Maksimum • Konversi Skala 100
				</p>
			</div>

			<!-- Search filter for candidates -->
			<div class="relative w-full md:w-72">
				<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama / no tes..."
					class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
				/>
			</div>
		</div>

		<!-- Candidate Quick Selector Pills -->
		<div class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
			{#each filteredCandidates as c}
				{@const active = currentCandidate?.id === c.id}
				{@const scoreLocked = c.tpaScore?.lockStatus === 'LOCKED'}
				{@const scoreDraft = c.tpaScore?.lockStatus === 'DRAFT'}
				<button
					type="button"
					onclick={() => selectCandidate(c.id)}
					class={`shrink-0 px-3.5 py-2.5 rounded-xl text-left border transition-all select-none min-h-[48px] flex items-center gap-3 ${
						active
							? 'bg-blue-800 text-white border-blue-800 shadow-md ring-2 ring-blue-500/40'
							: 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-700'
					}`}
				>
					<div
						class={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
							active ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
						}`}
					>
						{c.testNumber.slice(-3)}
					</div>
					<div class="min-w-0 pr-1">
						<div class="font-bold text-xs md:text-sm truncate max-w-[130px] md:max-w-[160px]">{c.fullName}</div>
						<div class={`text-[11px] truncate flex items-center gap-1 ${active ? 'text-blue-200' : 'text-slate-500'}`}>
							{#if scoreLocked}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
								<span>Terkunci ({c.tpaScore?.finalScore100})</span>
							{:else if scoreDraft}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
								<span>Draf ({c.tpaScore?.finalScore100})</span>
							{:else}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
								<span>Belum Dinilai</span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Alert Feedback Notification -->
	{#if form?.success}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-medium shadow-xs">
			<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm font-medium shadow-xs">
			<AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}

	{#if currentCandidate}
		<!-- Main Form & Scoring Dashboard Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- Left / Main: 12 Subtest Assessment Panels (8 Cols on Tablet Landscape) -->
			<div class="lg:col-span-8 space-y-6">
				<!-- Selected Candidate Card with Lock Banner -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
						<div class="flex items-center gap-3.5">
							<div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
								<User class="w-6 h-6" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-extrabold text-base md:text-lg text-slate-900">{currentCandidate.fullName}</span>
									<span class="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold">
										{currentCandidate.testNumber}
									</span>
								</div>
								<div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
									<School class="w-3.5 h-3.5 text-slate-400" />
									<span>{currentCandidate.schoolOrigin}</span>
									<span>•</span>
									<span class="font-semibold text-blue-700">{currentCandidate.majorChoice}</span>
								</div>
							</div>
						</div>

						<!-- Status Badge -->
						<div>
							{#if isLocked}
								<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
									<Lock class="w-3.5 h-3.5 text-emerald-600" />
									<span>NILAI TERKUNCI</span>
								</div>
							{:else}
								<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
									<Unlock class="w-3.5 h-3.5 text-amber-600" />
									<span>MODE DRAF (BISA DIEDIT)</span>
								</div>
							{/if}
						</div>
					</div>

					{#if isLocked}
						<div class="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
							<div class="flex items-center gap-2 text-emerald-800">
								<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
								<span>
									Telah diverifikasi dan dikunci oleh <strong>{currentCandidate.tpaScore?.examinerName || 'Penguji'}</strong>
									{#if currentCandidate.tpaScore?.lockedAt}
										pada {new Date(currentCandidate.tpaScore.lockedAt).toLocaleString('id-ID')}
									{/if}
								</span>
							</div>

							<!-- Form Unlock -->
							<form method="POST" action="?/unlockScore">
								<input type="hidden" name="candidateId" value={currentCandidate.id} />
								<button
									type="submit"
									class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors shadow-2xs"
								>
									Buka Kunci Nilai
								</button>
							</form>
						</div>
					{/if}
				</div>

				<!-- Section 1: Bahasa Indonesia (5 Subtes, Bobot bervariasi) -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-md bg-blue-700"></span>
							<h3 class="font-bold text-base text-slate-800">1. Bahasa Indonesia</h3>
							<span class="text-xs text-slate-500 font-medium">(5 Subtes • Maks 21 Poin)</span>
						</div>
						<span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
							Subtotal: {indoSubtotal} / 21
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Subtes 1: EYD -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">1. EYD & Ejaan</span>
								<span class="text-[11px] font-semibold text-slate-500">Bobot x1 (Maks 3)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (eyd = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											eyd === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 2: Kohesi & Koherensi -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">2. Kohesi & Koherensi</span>
								<span class="text-[11px] font-semibold text-slate-500">Bobot x1 (Maks 3)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (kohesi = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											kohesi === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 3: Logika -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">3. Logika Penalaran</span>
								<span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (logika = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											logika === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 4: Analogi -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">4. Analogi Verbal</span>
								<span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (analogi = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											analogi === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 5: Pemahaman Wacana -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:col-span-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">5. Pemahaman Wacana</span>
								<span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (wacana = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											wacana === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Section 2: Matematika (2 Subtes, Bobot x3) -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-md bg-blue-600"></span>
							<h3 class="font-bold text-base text-slate-800">2. Matematika</h3>
							<span class="text-xs text-slate-500 font-medium">(2 Subtes • Bobot x3 • Maks 18 Poin)</span>
						</div>
						<span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
							Subtotal: {mtkSubtotal} / 18
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Subtes 6: Operasi Perhitungan -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">6. Operasi Perhitungan</span>
								<span class="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">Bobot x3 (Maks 9)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (mtkHitung = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											mtkHitung === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 7: Dasar Bangun Ruang -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">7. Dasar Bangun Ruang</span>
								<span class="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">Bobot x3 (Maks 9)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (mtkRuang = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											mtkRuang === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Section 3: Kemampuan Bahasa (2 Subtes, Bobot x2) -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-md bg-sky-600"></span>
							<h3 class="font-bold text-base text-slate-800">3. Kemampuan Bahasa</h3>
							<span class="text-xs text-slate-500 font-medium">(2 Subtes • Bobot x2 • Maks 12 Poin)</span>
						</div>
						<span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
							Subtotal: {bahasaSubtotal} / 12
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Subtes 8: Bahasa Inggris -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">8. Bahasa Inggris</span>
								<span class="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (bInggris = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											bInggris === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 9: Bahasa Arab -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">9. Bahasa Arab</span>
								<span class="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (bArab = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											bArab === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Section 4: Kemampuan Al-Qur'an (Tahfidz x2, Tahsin x1) -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-md bg-emerald-600"></span>
							<h3 class="font-bold text-base text-slate-800">4. Kemampuan Al-Qur'an (TPA)</h3>
							<span class="text-xs text-slate-500 font-medium">(2 Subtes • Maks 9 Poin)</span>
						</div>
						<span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
							Subtotal: {quranSubtotal} / 9
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Subtes 10: Tahfidz -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">10. Tahfidz Al-Qur'an</span>
								<span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Bobot x2 (Maks 6)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (tahfidz = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											tahfidz === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 11: Tahsin -->
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-slate-800">11. Tahsin Al-Qur'an</span>
								<span class="text-[11px] font-semibold text-slate-500">Bobot x1 (Maks 3)</span>
							</div>
							<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 3 soal):</p>
							<div class="grid grid-cols-4 gap-2">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (tahsin = val)}
										class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
											tahsin === val
												? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Section 5: Karakter (1 Subtes, 0 - 6 Soal, Bobot x1) -->
				<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-md bg-teal-600"></span>
							<h3 class="font-bold text-base text-slate-800">5. Karakter Santri</h3>
							<span class="text-xs text-slate-500 font-medium">(1 Subtes • 6 Soal • Bobot x1 • Maks 6 Poin)</span>
						</div>
						<span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
							Subtotal: {karakterSubtotal} / 6
						</span>
					</div>

					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-bold text-slate-800">12. Soal Karakter & Akhlaq</span>
							<span class="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Bobot x1 (Maks 6)</span>
						</div>
						<p class="text-xs text-slate-500">Jumlah jawaban benar (0 - 6 soal):</p>
						<div class="grid grid-cols-7 gap-2">
							{#each [0, 1, 2, 3, 4, 5, 6] as val}
								<button
									type="button"
									disabled={isLocked}
									onclick={() => (karakter = val)}
									class={`h-12 rounded-xl font-bold text-sm transition-all select-none flex items-center justify-center ${
										karakter === val
											? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40 font-extrabold'
											: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
									}`}
								>
									{val}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Tablet-Sticky Real-Time Calculation & Actions Card (4 Cols) -->
			<div class="lg:col-span-4 sticky top-20 space-y-4">
				<!-- Live Score Computation Card -->
				<div class="bg-white rounded-2xl p-5 shadow-md border border-slate-200 space-y-5">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<Calculator class="w-5 h-5 text-blue-800" />
							<h3 class="font-bold text-base text-slate-900">Kalkulasi Skor Instan</h3>
						</div>
						<span class="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
							Svelte 5 Runes
						</span>
					</div>

					<!-- Big Main Score Display -->
					<div class="text-center py-4 px-3 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100 space-y-2">
						<div class="text-xs uppercase font-extrabold tracking-wider text-blue-800">Nilai Skala 100</div>
						<div class="text-5xl font-black text-blue-900 tracking-tight font-mono">
							{finalScore100}
						</div>
						<div class="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
							<span>Poin Mentah:</span>
							<strong class="font-bold text-slate-900 text-sm font-mono">{rawTotal}</strong>
							<span class="text-slate-400">/ 69 Maks</span>
						</div>
					</div>

					<!-- Qualitative Category Badge -->
					<div class="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border {category.color}">
						<div class="text-[11px] uppercase tracking-wider font-bold">Kategori Kualitatif</div>
						<div class="text-lg font-black tracking-tight">{category.label}</div>
					</div>

					<!-- Subtotal Breakdown Progress List -->
					<div class="space-y-2.5 pt-2 text-xs">
						<div class="font-bold text-slate-700 text-xs">Rincian Per Bidang Uji:</div>
						
						<div class="flex items-center justify-between text-slate-600">
							<span>Bahasa Indonesia</span>
							<span class="font-mono font-bold text-slate-900">{indoSubtotal} / 21</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
							<div class="bg-blue-700 h-full rounded-full transition-all" style={`width: ${(indoSubtotal / 21) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Matematika (Hitung & Ruang)</span>
							<span class="font-mono font-bold text-slate-900">{mtkSubtotal} / 18</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
							<div class="bg-blue-600 h-full rounded-full transition-all" style={`width: ${(mtkSubtotal / 18) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Kemampuan Bahasa (Inggris & Arab)</span>
							<span class="font-mono font-bold text-slate-900">{bahasaSubtotal} / 12</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
							<div class="bg-sky-600 h-full rounded-full transition-all" style={`width: ${(bahasaSubtotal / 12) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Al-Qur'an (Tahfidz & Tahsin)</span>
							<span class="font-mono font-bold text-slate-900">{quranSubtotal} / 9</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
							<div class="bg-emerald-600 h-full rounded-full transition-all" style={`width: ${(quranSubtotal / 9) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Karakter Santri</span>
							<span class="font-mono font-bold text-slate-900">{karakterSubtotal} / 6</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
							<div class="bg-teal-600 h-full rounded-full transition-all" style={`width: ${(karakterSubtotal / 6) * 100}%`}></div>
						</div>
					</div>

					<!-- Examiner Name Input Field -->
					<div class="pt-3 border-t border-slate-100 space-y-1.5">
						<label for="examiner" class="block text-xs font-bold text-slate-700">Nama Asatidz Penguji:</label>
						<input
							id="examiner"
							type="text"
							disabled={isLocked}
							bind:value={examinerName}
							class="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
							placeholder="Masukkan nama penguji..."
						/>
					</div>

					<!-- Form Submission Actions -->
					{#if !isLocked}
						<div class="pt-2 space-y-2.5">
							<!-- Form Save Draft -->
							<form method="POST" action="?/saveDraft">
								<input type="hidden" name="candidateId" value={currentCandidate.id} />
								<input type="hidden" name="examinerName" value={examinerName} />
								<input type="hidden" name="eydCorrect" value={eyd} />
								<input type="hidden" name="kohesiCorrect" value={kohesi} />
								<input type="hidden" name="logikaCorrect" value={logika} />
								<input type="hidden" name="analogiCorrect" value={analogi} />
								<input type="hidden" name="wacanaCorrect" value={wacana} />
								<input type="hidden" name="mtkHitungCorrect" value={mtkHitung} />
								<input type="hidden" name="mtkRuangCorrect" value={mtkRuang} />
								<input type="hidden" name="bInggrisCorrect" value={bInggris} />
								<input type="hidden" name="bArabCorrect" value={bArab} />
								<input type="hidden" name="tahfidzCorrect" value={tahfidz} />
								<input type="hidden" name="tahsinCorrect" value={tahsin} />
								<input type="hidden" name="karakterCorrect" value={karakter} />

								<button
									type="submit"
									class="w-full py-3 px-4 rounded-xl border-2 border-blue-700 text-blue-800 hover:bg-blue-50 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
								>
									<Save class="w-4 h-4" />
									<span>Simpan Sebagai Draf</span>
								</button>
							</form>

							<!-- Trigger Lock Confirmation Modal -->
							<button
								type="button"
								onclick={() => (showLockModal = true)}
								class="w-full py-3 px-4 rounded-xl bg-blue-800 text-white hover:bg-blue-900 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-blue-950/20"
							>
								<Lock class="w-4 h-4" />
								<span>Kunci Nilai TPA (Final)</span>
							</button>
						</div>
					{:else}
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
							Nilai peserta ini sudah dikunci secara permanen. Buka kunci nilai di atas jika perlu merevisi.
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Modal Konfirmasi Kunci Nilai -->
		{#if showLockModal}
			<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
				<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
					<div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
						<Lock class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-lg font-bold text-slate-900">Kunci Nilai TPA Peserta?</h4>
						<p class="text-xs text-slate-500 mt-1">
							Anda akan mengunci nilai untuk <strong>{currentCandidate.fullName}</strong> dengan skor akhir <strong>{finalScore100}</strong> ({category.label}). Nilai yang dikunci akan langsung disinkronkan ke Master Ledger.
						</p>
					</div>

					<form method="POST" action="?/lockScore" class="space-y-4">
						<input type="hidden" name="candidateId" value={currentCandidate.id} />
						<input type="hidden" name="examinerName" value={examinerName} />
						<input type="hidden" name="eydCorrect" value={eyd} />
						<input type="hidden" name="kohesiCorrect" value={kohesi} />
						<input type="hidden" name="logikaCorrect" value={logika} />
						<input type="hidden" name="analogiCorrect" value={analogi} />
						<input type="hidden" name="wacanaCorrect" value={wacana} />
						<input type="hidden" name="mtkHitungCorrect" value={mtkHitung} />
						<input type="hidden" name="mtkRuangCorrect" value={mtkRuang} />
						<input type="hidden" name="bInggrisCorrect" value={bInggris} />
						<input type="hidden" name="bArabCorrect" value={bArab} />
						<input type="hidden" name="tahfidzCorrect" value={tahfidz} />
						<input type="hidden" name="tahsinCorrect" value={tahsin} />
						<input type="hidden" name="karakterCorrect" value={karakter} />

						<div class="flex items-center justify-end gap-3 pt-2">
							<button
								type="button"
								onclick={() => (showLockModal = false)}
								class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 min-h-[44px]"
							>
								Batal
							</button>
							<button
								type="submit"
								class="px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-sm hover:bg-blue-900 min-h-[44px] shadow-md shadow-blue-950/20"
							>
								Ya, Kunci Nilai
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	{:else}
		<div class="bg-white rounded-2xl p-12 text-center border border-slate-200">
			<AlertCircle class="w-12 h-12 text-slate-400 mx-auto mb-3" />
			<h3 class="font-bold text-slate-800 text-lg">Tidak Ada Data Peserta</h3>
			<p class="text-xs text-slate-500 mt-1">Belum ada peserta seleksi aktif yang terdaftar di sistem.</p>
		</div>
	{/if}
</div>