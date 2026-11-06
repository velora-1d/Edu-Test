<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
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
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		Filter,
		X,
		Building2,
		GraduationCap,
		ArrowLeft,
		ArrowRight,
		Users
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showLockModal = $state(false);
	let showCandidateModal = $state(false);
	let showUnlockModal = $state(false);
	let unlockCandidateId = $state<string | null>(null);
	let unlockSubmitting = $state(false);
	let unlockForm = $state<HTMLFormElement | null>(null);

	function confirmUnlock() {
		unlockSubmitting = true;
		unlockForm?.requestSubmit();
	}

	// Modal Filters
	let modalSearch = $state('');
	let modalFilterStatus = $state<'ALL' | 'UNSCORED' | 'DRAFT' | 'LOCKED'>('ALL');
	let modalFilterRoom = $state('ALL');
	let modalFilterMajor = $state('ALL');

	// Currently selected candidate (reactive client-state)
	let customSelectedId = $state<string | null>(null);
	let selectedCandidateId = $derived(
		customSelectedId ?? data.selectedCandidate?.id ?? data.candidates[0]?.id ?? ''
	);
	let currentCandidate = $derived(
		data.candidates.find((c) => c.id === selectedCandidateId) || data.selectedCandidate
	);
	let isLocked = $derived(currentCandidate?.tpaScore?.lockStatus === 'LOCKED');
	let isSubmitting = $state(false);

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
		if (finalScore100 <= 40) return { label: 'Buruk', color: 'bg-rose-50 text-rose-800 border-rose-200' };
		if (finalScore100 <= 60) return { label: 'Sedang', color: 'bg-amber-50 text-amber-800 border-amber-200' };
		if (finalScore100 <= 80) return { label: 'Baik', color: 'bg-blue-50 text-blue-800 border-blue-200' };
		return { label: 'Sangat Baik', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
	});

	// Ordered list & stepper logic
	let currentIndex = $derived(
		currentCandidate ? data.candidates.findIndex((c) => c.id === currentCandidate.id) : -1
	);
	let prevCandidate = $derived(
		currentIndex > 0 ? data.candidates[currentIndex - 1] : null
	);
	let nextCandidate = $derived(
		currentIndex >= 0 && currentIndex < data.candidates.length - 1
			? data.candidates[currentIndex + 1]
			: null
	);

	const availableRooms = $derived(
		Array.from(new Set(data.candidates.map((c) => c.roomAssignment).filter(Boolean))) as string[]
	);
	const availableMajors = $derived(
		Array.from(new Set(data.candidates.map((c) => c.majorChoice).filter(Boolean))) as string[]
	);

	const modalFilteredCandidates = $derived(
		data.candidates.filter((c) => {
			const query = modalSearch.toLowerCase().trim();
			const matchSearch =
				!query ||
				c.fullName.toLowerCase().includes(query) ||
				c.testNumber.toLowerCase().includes(query) ||
				c.schoolOrigin.toLowerCase().includes(query);

			const lockStatus = c.tpaScore?.lockStatus;
			let matchStatus = true;
			if (modalFilterStatus === 'LOCKED') matchStatus = lockStatus === 'LOCKED';
			else if (modalFilterStatus === 'DRAFT') matchStatus = lockStatus === 'DRAFT';
			else if (modalFilterStatus === 'UNSCORED') matchStatus = !lockStatus;

			const matchRoom = modalFilterRoom === 'ALL' || c.roomAssignment === modalFilterRoom;
			const matchMajor = modalFilterMajor === 'ALL' || c.majorChoice === modalFilterMajor;

			return matchSearch && matchStatus && matchRoom && matchMajor;
		})
	);

	function selectCandidate(id: string) {
		showCandidateModal = false;
		customSelectedId = id;
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('candidateId', id);
			window.history.replaceState({}, '', url.toString());
		}
	}

	function goToPrev() {
		if (prevCandidate) selectCandidate(prevCandidate.id);
	}

	function goToNext() {
		if (nextCandidate) selectCandidate(nextCandidate.id);
	}

	function handleCandidateModalKeydown(event: KeyboardEvent) {
		if (!showCandidateModal) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			showCandidateModal = false;
		}
	}
</script>

<svelte:window
	onkeydown={handleCandidateModalKeydown}
	onpopstate={() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const cid = params.get('candidateId');
			if (cid && cid !== selectedCandidateId) {
				customSelectedId = cid;
			}
		}
	}}
/>

<div class="w-full space-y-5">
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
			<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold shadow-2xs">
				1. Tes TPA
			</span>
			<a
				href={currentCandidate ? `/rubrik?candidateId=${currentCandidate.id}` : '/rubrik'}
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium transition"
			>
				<span>2. Kepesantrenan &rarr;</span>
			</a>
			<a
				href={currentCandidate ? `/wawancara?candidateId=${currentCandidate.id}` : '/wawancara'}
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition"
			>
				<span>3. Wawancara &rarr;</span>
			</a>
		</div>

		<a
			href="/ledger"
			class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition ml-auto"
		>
			<span>Rekap Nilai</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- CANDIDATE NAVIGATOR (OPSI 1: Interactive Identity Card • Grouped Stepper • Progress Indicator) -->
	<div class="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200">
		<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
			{#if currentCandidate}
				<!-- Left: Interactive Candidate Identity (Click to open modal) -->
				<div class="flex items-center gap-3 min-w-0">
					<!-- Clickable Avatar + Details to Open Picker -->
					<button
						type="button"
						onclick={() => (showCandidateModal = true)}
						class="group flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition text-left min-w-0"
						title="Klik untuk memilih santri lain"
					>
						<div class="relative w-11 h-11 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
							{currentCandidate.fullName.substring(0, 2).toUpperCase()}
							<div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
								<Search class="w-2.5 h-2.5" />
							</div>
						</div>

						<div class="min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors truncate">
									{currentCandidate.fullName}
								</span>
								<ChevronDown class="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
								<span class="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 shrink-0">
									{currentCandidate.testNumber}
								</span>
								{#if isLocked}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
										<Lock class="w-3 h-3 text-emerald-600" />
										<span>Nilai Terkunci</span>
									</span>
								{:else if currentCandidate.tpaScore?.lockStatus === 'DRAFT'}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
										<Unlock class="w-3 h-3 text-amber-600" />
										<span>Mode Draf</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold shrink-0">
										<span>Belum Dinilai</span>
									</span>
								{/if}
							</div>

							<div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
								<span class="truncate max-w-[160px] sm:max-w-none">{currentCandidate.schoolOrigin}</span>
								<span>&bull;</span>
								<span class="font-medium text-slate-700">{currentCandidate.majorChoice}</span>
								<span>&bull;</span>
								<span class="text-blue-700 font-medium">{currentCandidate.roomAssignment || 'Ruang 1'}</span>
							</div>
						</div>
					</button>
				</div>

				<!-- Right: Quick Actions + Grouped Stepper Nav & Progress -->
				<div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0">
					<!-- Actions: Buka Kunci (if locked) & Pilih Santri button -->
					<div class="flex items-center gap-2">
						{#if isLocked}
							<button
								type="button"
								onclick={() => {
									unlockCandidateId = currentCandidate.id;
									unlockSubmitting = false;
									showUnlockModal = true;
								}}
								class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 text-xs font-semibold transition shadow-2xs cursor-pointer"
								title="Buka kunci nilai untuk mengedit kembali"
							>
								<Unlock class="w-3.5 h-3.5 text-amber-600" />
								<span>Buka Kunci</span>
							</button>
						{/if}

						<button
							type="button"
							onclick={() => (showCandidateModal = true)}
							class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition active:scale-95 shadow-2xs"
							title="Buka daftar lengkap calon santri"
						>
							<Search class="w-3.5 h-3.5" />
							<span>Daftar Santri</span>
						</button>
					</div>

					<div class="hidden sm:block h-6 w-px bg-slate-200"></div>

					<!-- Grouped Stepper (< Prev, Indicator, Next >) -->
					<div class="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
						<!-- Prev Button -->
						<button
							type="button"
							onclick={goToPrev}
							disabled={!prevCandidate}
							class="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
							title={prevCandidate ? `Santri sebelumnya: ${prevCandidate.fullName}` : 'Santri pertama'}
							aria-label="Santri sebelumnya"
						>
							<ChevronLeft class="w-4 h-4" />
						</button>

						<!-- Progress Count & Bar -->
						<div class="px-2.5 py-1 text-center min-w-[90px]">
							<div class="text-[11px] font-bold text-slate-800">
								{currentIndex + 1} <span class="text-slate-400 font-normal">/</span> {data.candidates.length}
								<span class="text-[10px] text-blue-600 font-medium ml-1">
									({Math.round(((currentIndex + 1) / Math.max(data.candidates.length, 1)) * 100)}%)
								</span>
							</div>
							<div class="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
								<div
									class="bg-blue-600 h-full rounded-full transition-all duration-300"
									style="width: {Math.round(((currentIndex + 1) / Math.max(data.candidates.length, 1)) * 100)}%"
								></div>
							</div>
						</div>

						<!-- Next Button -->
						<button
							type="button"
							onclick={goToNext}
							disabled={!nextCandidate}
							class="inline-flex items-center justify-center p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
							title={nextCandidate ? `Santri berikutnya: ${nextCandidate.fullName}` : 'Santri terakhir'}
							aria-label="Santri berikutnya"
						>
							<ChevronRight class="w-4 h-4" />
						</button>
					</div>
				</div>
			{:else}
				<div class="text-center py-2 text-xs text-slate-500 w-full">
					Belum ada santri dipilih.
					<button
						type="button"
						onclick={() => (showCandidateModal = true)}
						class="text-blue-700 font-bold underline ml-1"
					>
						Buka Daftar Santri
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Alert Feedback Notification -->
	{#if form?.success}
		<div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-medium shadow-2xs">
			<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-medium shadow-2xs">
			<AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}

	{#if currentCandidate}
		<!-- Main Form & Scoring Dashboard Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
			<!-- Left: 12 Subtest Assessment Panels -->
			<div class="lg:col-span-8 space-y-4">
				<!-- Section 1: Bahasa Indonesia (5 Subtes) -->
				<div class="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 space-y-3">
					<div class="flex items-center justify-between pb-2 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							<h3 class="font-bold text-sm text-slate-800">1. Bahasa Indonesia</h3>
							<span class="text-xs text-slate-400 font-medium">(5 Subtes &bull; Maks 21)</span>
						</div>
						<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 tabular-nums">
							{indoSubtotal} / 21
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<!-- Subtes 1: EYD -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">1. EYD & Ejaan</span>
								<span class="text-[10px] text-slate-400">Bobot x1</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (eyd = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											eyd === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 2: Kohesi & Koherensi -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">2. Kohesi & Koherensi</span>
								<span class="text-[10px] text-slate-400">Bobot x1</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (kohesi = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											kohesi === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 3: Logika -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">3. Logika Penalaran</span>
								<span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (logika = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											logika === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 4: Analogi -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">4. Analogi Verbal</span>
								<span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (analogi = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											analogi === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 5: Pemahaman Wacana -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 md:col-span-2">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">5. Pemahaman Wacana</span>
								<span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (wacana = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											wacana === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
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
				<div class="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 space-y-3">
					<div class="flex items-center justify-between pb-2 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
							<h3 class="font-bold text-sm text-slate-800">2. Matematika</h3>
							<span class="text-xs text-slate-400 font-medium">(2 Subtes &bull; Bobot x3 &bull; Maks 18)</span>
						</div>
						<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 tabular-nums">
							{mtkSubtotal} / 18
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<!-- Subtes 6: Operasi Perhitungan -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">6. Operasi Perhitungan</span>
								<span class="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">Bobot x3</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (mtkHitung = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											mtkHitung === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 7: Dasar Bangun Ruang -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">7. Dasar Bangun Ruang</span>
								<span class="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">Bobot x3</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (mtkRuang = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											mtkRuang === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
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
				<div class="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 space-y-3">
					<div class="flex items-center justify-between pb-2 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
							<h3 class="font-bold text-sm text-slate-800">3. Kemampuan Bahasa</h3>
							<span class="text-xs text-slate-400 font-medium">(2 Subtes &bull; Bobot x2 &bull; Maks 12)</span>
						</div>
						<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 tabular-nums">
							{bahasaSubtotal} / 12
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<!-- Subtes 8: Bahasa Inggris -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">8. Bahasa Inggris</span>
								<span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (bInggris = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											bInggris === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 9: Bahasa Arab -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">9. Bahasa Arab</span>
								<span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (bArab = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											bArab === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
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
				<div class="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 space-y-3">
					<div class="flex items-center justify-between pb-2 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
							<h3 class="font-bold text-sm text-slate-800">4. Al-Qur'an (TPA)</h3>
							<span class="text-xs text-slate-400 font-medium">(2 Subtes &bull; Maks 9)</span>
						</div>
						<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
							{quranSubtotal} / 9
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<!-- Subtes 10: Tahfidz -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">10. Tahfidz</span>
								<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Bobot x2</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (tahfidz = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											tahfidz === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
												: 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
										}`}
									>
										{val}
									</button>
								{/each}
							</div>
						</div>

						<!-- Subtes 11: Tahsin -->
						<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800">11. Tahsin</span>
								<span class="text-[10px] text-slate-400">Bobot x1</span>
							</div>
							<div class="grid grid-cols-4 gap-1.5">
								{#each [0, 1, 2, 3] as val}
									<button
										type="button"
										disabled={isLocked}
										onclick={() => (tahsin = val)}
										class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
											tahsin === val
												? 'bg-blue-700 text-white shadow-xs font-extrabold'
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

				<!-- Section 5: Karakter Santri (1 Subtes) -->
				<div class="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 space-y-3">
					<div class="flex items-center justify-between pb-2 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
							<h3 class="font-bold text-sm text-slate-800">5. Karakter Santri</h3>
							<span class="text-xs text-slate-400 font-medium">(6 Soal &bull; Bobot x1 &bull; Maks 6)</span>
						</div>
						<span class="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
							{karakterSubtotal} / 6
						</span>
					</div>

					<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
						<div class="flex items-center justify-between text-xs">
							<span class="font-bold text-slate-800">12. Skor Karakter & Akhlaq</span>
							<span class="text-[10px] text-slate-400">0 - 6 Jawaban Benar</span>
						</div>
						<div class="grid grid-cols-7 gap-1.5">
							{#each [0, 1, 2, 3, 4, 5, 6] as val}
								<button
									type="button"
									disabled={isLocked}
									onclick={() => (karakter = val)}
									class={`h-9 rounded-lg font-bold text-xs transition select-none flex items-center justify-center ${
										karakter === val
											? 'bg-blue-700 text-white shadow-xs font-extrabold'
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

			<!-- Right: Calculation & Form Actions -->
			<div class="lg:col-span-4 sticky top-20 space-y-4">
				<div class="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 space-y-4">
					<div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<Calculator class="w-4 h-4 text-blue-700" />
							<h3 class="font-bold text-sm text-slate-900">Kalkulasi Skor TPA</h3>
						</div>
						<span class="text-[10px] font-mono text-slate-400">Skala 100</span>
					</div>

					<!-- Big Main Score Display -->
					<div class="text-center py-3.5 px-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
						<div class="text-[11px] uppercase font-bold tracking-wider text-blue-800">Skor Akhir</div>
						<div class="text-4xl font-black text-blue-900 font-mono tracking-tight tabular-nums">
							{finalScore100}
						</div>
						<div class="text-xs text-slate-600 font-medium">
							Poin Mentah: <strong class="font-bold text-slate-900 font-mono">{rawTotal}</strong> / 69
						</div>
					</div>

					<!-- Qualitative Category Badge -->
					<div class="flex items-center justify-between p-2.5 rounded-xl border {category.color} text-xs">
						<span class="font-medium">Kategori Kualitatif:</span>
						<strong class="font-bold">{category.label}</strong>
					</div>

					<!-- Subtotal Breakdown List -->
					<div class="space-y-2 pt-1 text-xs">
						<div class="flex items-center justify-between text-slate-600">
							<span>Bahasa Indonesia</span>
							<strong class="font-mono text-slate-900 tabular-nums">{indoSubtotal} / 21</strong>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
							<div class="bg-blue-700 h-full rounded-full transition-all" style={`width: ${(indoSubtotal / 21) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Matematika</span>
							<strong class="font-mono text-slate-900 tabular-nums">{mtkSubtotal} / 18</strong>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
							<div class="bg-blue-600 h-full rounded-full transition-all" style={`width: ${(mtkSubtotal / 18) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Bahasa Inggris & Arab</span>
							<strong class="font-mono text-slate-900 tabular-nums">{bahasaSubtotal} / 12</strong>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
							<div class="bg-blue-500 h-full rounded-full transition-all" style={`width: ${(bahasaSubtotal / 12) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Al-Qur'an (Tahfidz & Tahsin)</span>
							<strong class="font-mono text-slate-900 tabular-nums">{quranSubtotal} / 9</strong>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
							<div class="bg-emerald-600 h-full rounded-full transition-all" style={`width: ${(quranSubtotal / 9) * 100}%`}></div>
						</div>

						<div class="flex items-center justify-between text-slate-600">
							<span>Karakter Santri</span>
							<strong class="font-mono text-slate-900 tabular-nums">{karakterSubtotal} / 6</strong>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
							<div class="bg-slate-700 h-full rounded-full transition-all" style={`width: ${(karakterSubtotal / 6) * 100}%`}></div>
						</div>
					</div>

					<!-- Examiner Name -->
					<div class="pt-2 border-t border-slate-100 space-y-1">
						<label for="examiner" class="block text-[11px] font-bold text-slate-700">Nama Asatidz Penguji:</label>
						<input
							id="examiner"
							type="text"
							disabled={isLocked}
							bind:value={examinerName}
							class="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
							placeholder="Nama penguji..."
						/>
					</div>

					<!-- Form Submission Actions -->
					{#if !isLocked}
						<div class="pt-1 space-y-2">
							<form
								method="POST"
								action="?/saveDraft"
								use:enhance={() => {
									isSubmitting = true;
									return async ({ update }) => {
										isSubmitting = false;
										await update();
									};
								}}
							>
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
									disabled={isSubmitting}
									class="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-2xs disabled:opacity-50"
								>
									<Save class="w-3.5 h-3.5" />
									<span>{isSubmitting ? 'Menyimpan...' : 'Simpan Draf'}</span>
								</button>
							</form>

							<button
								type="button"
								onclick={() => (showLockModal = true)}
								class="w-full py-2.5 px-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs shadow-blue-700/20"
							>
								<Lock class="w-3.5 h-3.5" />
								<span>Kunci Nilai TPA (Final)</span>
							</button>
						</div>
					{:else}
						<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
							Nilai peserta sudah dikunci secara final.
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Modal Konfirmasi Kunci Nilai -->
		{#if showLockModal}
			<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
				<div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
					<div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
						<Lock class="w-5 h-5" />
					</div>
					<div>
						<h4 class="text-base font-bold text-slate-900">Kunci Nilai TPA?</h4>
						<p class="text-xs text-slate-500 mt-1">
							Kunci nilai untuk <strong>{currentCandidate.fullName}</strong> dengan skor akhir <strong>{finalScore100}</strong> ({category.label}).
						</p>
					</div>

					<form
						method="POST"
						action="?/lockScore"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								isSubmitting = false;
								showLockModal = false;
								await update();
							};
						}}
						class="space-y-4"
					>
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

						<div class="flex items-center justify-end gap-2 pt-1">
							<button
								type="button"
								onclick={() => (showLockModal = false)}
								class="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								class="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 shadow-xs disabled:opacity-50"
							>
								{isSubmitting ? 'Mengunci...' : 'Ya, Kunci Nilai'}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	{:else}
		<div class="bg-white rounded-2xl p-10 text-center border border-slate-200">
			<AlertCircle class="w-10 h-10 text-slate-300 mx-auto mb-2" />
			<h3 class="font-bold text-slate-800 text-base">Tidak Ada Data Peserta</h3>
			<p class="text-xs text-slate-500 mt-0.5">Pilih santri dari daftar untuk memulai penilaian.</p>
		</div>
	{/if}

	<!-- MODAL POPUP PEMILIHAN SANTRI (GRID KARTU + FILTER STATUS, RUANGAN, JURUSAN) -->
	{#if showCandidateModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs sm:p-6"
			tabindex="-1"
			role="dialog"
			aria-modal="true"
			aria-labelledby="candidate-modal-title"
			onclick={(e) => {
				if (e.target === e.currentTarget) showCandidateModal = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') showCandidateModal = false;
			}}
		>
			<div class="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
				<!-- Header Modal -->
				<div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-7 md:py-5">
					<div class="flex min-w-0 items-center gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
							<Users class="h-5 w-5" />
						</div>
						<div class="min-w-0">
							<h3 id="candidate-modal-title" class="font-display text-base font-bold tracking-tight text-slate-900 md:text-lg">
								Pilih Santri Ujian TPA
							</h3>
							<p class="text-xs text-slate-500">Pilih santri untuk membuka lembar penilaian</p>
						</div>
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<span class="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600 sm:inline-flex">
							{modalFilteredCandidates.length} / {data.candidates.length}
						</span>
						<button
							type="button"
							aria-label="Tutup pemilih santri"
							onclick={() => (showCandidateModal = false)}
							class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
						>
							<X class="h-5 w-5" />
						</button>
					</div>
				</div>

				<!-- Toolbar: Pencarian & Filter -->
				<div class="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 md:px-7">
					<div class="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
						<!-- Pencarian -->
						<div class="sm:col-span-2 lg:col-span-1">
							<label for="modal-search" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Pencarian</label>
							<div class="relative">
								<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									id="modal-search"
									type="text"
									bind:value={modalSearch}
									placeholder="Cari nama santri, no tes, asal sekolah..."
									class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 md:text-sm"
								/>
							</div>
						</div>

						<!-- Filter Status -->
						<div>
							<label for="filter-status" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Status Nilai</label>
							<select
								id="filter-status"
								bind:value={modalFilterStatus}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
							>
								<option value="ALL">Semua Status</option>
								<option value="UNSCORED">Belum Dinilai</option>
								<option value="DRAFT">Mode Draf</option>
								<option value="LOCKED">Nilai Terkunci</option>
							</select>
						</div>

						<!-- Filter Ruangan -->
						<div>
							<label for="filter-room" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Ruang Ujian</label>
							<select
								id="filter-room"
								bind:value={modalFilterRoom}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
							>
								<option value="ALL">Semua Ruangan</option>
								{#each availableRooms as r}
									<option value={r}>{r}</option>
								{/each}
							</select>
						</div>

						<!-- Filter Jurusan -->
						<div>
							<label for="filter-major" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Jurusan</label>
							<select
								id="filter-major"
								bind:value={modalFilterMajor}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
							>
								<option value="ALL">Semua Jurusan</option>
								{#each availableMajors as m}
									<option value={m}>{m}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Grid Kartu Santri -->
				<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:px-7">
					{#if modalFilteredCandidates.length === 0}
						<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
							<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
								<Users class="h-6 w-6 text-slate-400" />
							</div>
							<p class="text-sm font-semibold text-slate-700">Tidak ada santri yang sesuai filter</p>
							<p class="mt-1 text-xs text-slate-500">Coba ubah kata kunci atau longgarkan filter di atas.</p>
							<button
								type="button"
								onclick={() => {
									modalSearch = '';
									modalFilterStatus = 'ALL';
									modalFilterRoom = 'ALL';
									modalFilterMajor = 'ALL';
								}}
								class="mt-4 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
							>
								Reset filter
							</button>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{#each modalFilteredCandidates as c}
								{@const isCurrent = currentCandidate?.id === c.id}
								{@const isLockedScore = c.tpaScore?.lockStatus === 'LOCKED'}
								{@const isDraftScore = c.tpaScore?.lockStatus === 'DRAFT'}

								<button
									type="button"
									onclick={() => selectCandidate(c.id)}
									aria-current={isCurrent ? 'true' : undefined}
									title={`${c.fullName} · ${c.schoolOrigin}`}
									class={`group relative flex h-full flex-col rounded-2xl border p-3.5 text-left transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 ${
										isCurrent
											? 'border-blue-400 bg-blue-50/70 shadow-sm'
											: 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'
									}`}
								>
									<div class="flex items-center gap-1.5">
										<span class="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-800">
											{c.testNumber.slice(-3)}
										</span>
										{#if isCurrent}
											<span class="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">Sedang Dinilai</span>
										{/if}
									</div>

									<h4 class="mt-2 truncate text-sm font-bold leading-tight text-slate-900">{c.fullName}</h4>

									<div class="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-slate-500">
										<p class="truncate" title={c.schoolOrigin}>{c.schoolOrigin}</p>
										<p class="truncate" title={c.majorChoice}>{c.majorChoice}</p>
										<p class="truncate font-medium text-slate-600">{c.roomAssignment || 'Ruang 1'}</p>
									</div>

									<div class="mt-auto pt-3">
										<div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
											<span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nilai</span>
											{#if isLockedScore}
												<span class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
													<Lock class="h-2.5 w-2.5" />
													<span>{c.tpaScore?.finalScore100}</span>
												</span>
											{:else if isDraftScore}
												<span class="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700">
													Draf ({c.tpaScore?.finalScore100})
												</span>
											{:else}
												<span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
													Belum Dinilai
												</span>
											{/if}
										</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Modal Footer -->
				<div class="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-7">
					<span>Ditemukan <strong class="font-mono text-slate-800">{modalFilteredCandidates.length}</strong> dari {data.candidates.length} santri</span>
					<div class="flex items-center gap-3">
						<span class="hidden text-[11px] text-slate-400 md:inline">
							Tekan <kbd class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-600">Esc</kbd> untuk menutup
						</span>
						<button
							type="button"
							onclick={() => (showCandidateModal = false)}
							class="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-200"
						>
							Tutup
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- KONFIRMASI BUKA KUNCI NILAI -->
	<form
		bind:this={unlockForm}
		method="POST"
		action="?/unlockScore"
		use:enhance={() => {
			unlockSubmitting = true;
			return async ({ update }) => {
				unlockSubmitting = false;
				showUnlockModal = false;
				await update();
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="candidateId" value={unlockCandidateId ?? ''} />
	</form>

	<ConfirmDialog
		open={showUnlockModal}
		tone="amber"
		title="Buka kunci nilai?"
		description={`Nilai TPA ${currentCandidate?.fullName ?? 'santri ini'} akan kembali ke mode draf dan bisa diedit ulang oleh penguji.`}
		confirmLabel="Ya, buka kunci"
		cancelLabel="Batal"
		loading={unlockSubmitting}
		onconfirm={confirmUnlock}
		oncancel={() => (showUnlockModal = false)}
	/>
</div>
