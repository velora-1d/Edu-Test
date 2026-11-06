<script lang="ts">
	import type { PageData, ActionData } from "./$types";
	import { goto } from "$app/navigation";
	import ConfirmDialog from "$lib/components/ui/confirm-dialog.svelte";
	import {
		ScrollText,
		BookOpen,
		Languages,
		Volume2,
		HeartHandshake,
		CheckCircle2,
		AlertCircle,
		Search,
		User,
		School,
		Lock,
		Unlock,
		Save,
		Calculator,
		Check,
		Info,
		Layers,
		ArrowLeft,
		ArrowRight,
		Sparkles,
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		X,
		Users,
		Building2,
		GraduationCap
	} from "lucide-svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state("");
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
	let modalSearch = $state("");
	let modalFilterStatus = $state<"ALL" | "UNSCORED" | "DRAFT" | "LOCKED">("ALL");
	let modalFilterRoom = $state("ALL");
	let modalFilterMajor = $state("ALL");

	let activeTab = $state<
		"tahsin" | "kitab" | "inggris" | "arab" | "hadits" | "adzan" | "sholat"
	>("tahsin");

	let currentCandidate = $derived(data.selectedCandidate);
	let isLocked = $derived(
		currentCandidate?.pesantrenScore?.lockStatus === "LOCKED",
	);

	// Examiner Name & Notes
	let examinerName = $state("Ust. Nurul Huda, Lc.");
	let notes = $state("");

	// 1. Tahsin & Tahfidz
	let tahsinMakhraj = $state(3);
	let tahsinTajwid = $state(3);
	let tahsinKelancaran = $state(3);
	let tahsinAdab = $state(4);
	let hasMemorization = $state(false);
	let tahfidzKelancaran = $state(3);
	let tahfidzMurojaah = $state(3);
	let tahfidzTarget = $state(3);
	let tahfidzAdab = $state(4);

	// 2. Kitab Kuning
	let kitabBacaGundul = $state(3);
	let kitabNahwuShorof = $state(3);
	let kitabTerjemahPegon = $state(3);
	let kitabIsi = $state(3);

	// 3. Bahasa Inggris
	let bInggrisSpeaking = $state(3);
	let bInggrisPronunciation = $state(3);
	let bInggrisWriting = $state(3);
	let bInggrisVocab = $state(3);

	// 4. Bahasa Arab
	let bArabSpeaking = $state(3);
	let bArabPronunciation = $state(3);
	let bArabWriting = $state(3);
	let bArabVocab = $state(3);

	// 5. Hadits
	let haditsHafalan = $state(3);
	let haditsKelancaran = $state(3);
	let haditsMakna = $state(3);
	let haditsAdab = $state(4);

	// 6. Adzan
	let adzanKelancaran = $state(3);
	let adzanMakhraj = $state(3);
	let adzanSuara = $state(3);

	// 7. Bacaan Sholat
	let sholatKelancaran = $state(3);
	let sholatMakhraj = $state(3);
	let sholatAdab = $state(4);

	// Mapping functions
	const map25 = (val: number) => [0, 10, 15, 20, 25][val] || 0;
	const map40 = (val: number) => [0, 10, 20, 30, 40][val] || 0;
	const map20 = (val: number) => [0, 5, 10, 15, 20][val] || 0;
	const map50 = (val: number) => [0, 20, 30, 40, 50][val] || 0;
	const map30 = (val: number) => [0, 10, 15, 20, 30][val] || 0;

	// Live calculations
	let tahsinScore = $derived(
		map25(tahsinMakhraj) +
			map25(tahsinTajwid) +
			map25(tahsinKelancaran) +
			map25(tahsinAdab),
	);

	let tahfidzScore = $derived(
		hasMemorization
			? map25(tahfidzKelancaran) +
					map25(tahfidzMurojaah) +
					map25(tahfidzTarget) +
					map25(tahfidzAdab)
			: 0,
	);

	let combinedQuranScore = $derived(
		hasMemorization
			? Math.round((tahsinScore + tahfidzScore) / 2)
			: tahsinScore,
	);

	let kitabKuningScore = $derived(
		map25(kitabBacaGundul) +
			map25(kitabNahwuShorof) +
			map25(kitabTerjemahPegon) +
			map25(kitabIsi),
	);

	let bInggrisScore = $derived(
		map40(bInggrisSpeaking) +
			map20(bInggrisPronunciation) +
			map20(bInggrisWriting) +
			map20(bInggrisVocab),
	);

	let bArabScore = $derived(
		map40(bArabSpeaking) +
			map20(bArabPronunciation) +
			map20(bArabWriting) +
			map20(bArabVocab),
	);

	let haditsScore = $derived(
		map40(haditsHafalan) +
			map20(haditsKelancaran) +
			map20(haditsMakna) +
			map20(haditsAdab),
	);

	let adzanScore = $derived(
		map50(adzanKelancaran) + map30(adzanMakhraj) + map20(adzanSuara),
	);

	let sholatScore = $derived(
		map50(sholatKelancaran) + map30(sholatMakhraj) + map20(sholatAdab),
	);

	let averageScore = $derived(
		Math.round(
			((combinedQuranScore +
				kitabKuningScore +
				bInggrisScore +
				bArabScore +
				haditsScore +
				adzanScore +
				sholatScore) /
				7) *
				10,
		) / 10,
	);

	// Sync state when candidate changes
	$effect(() => {
		if (currentCandidate) {
			const s = currentCandidate.pesantrenScore;
			if (s) {
				hasMemorization = s.hasMemorization ?? false;
				notes = s.notes || "";
				if (s.examinerName) examinerName = s.examinerName;
			}
		}
	});

	// Filtered candidates for selector
	let filteredCandidates = $derived(
		data.candidates.filter(
			(c) =>
				c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.testNumber
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				c.schoolOrigin
					.toLowerCase()
					.includes(searchQuery.toLowerCase()),
		),
	);

	function selectCandidate(id: string) {
		showCandidateModal = false;
		goto(`/rubrik?candidateId=${id}`, { reset: false });
	}

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

			const lockStatus = c.pesantrenScore?.lockStatus;
			let matchStatus = true;
			if (modalFilterStatus === "LOCKED") matchStatus = lockStatus === "LOCKED";
			else if (modalFilterStatus === "DRAFT") matchStatus = lockStatus === "DRAFT";
			else if (modalFilterStatus === "UNSCORED") matchStatus = !lockStatus;

			const matchRoom = modalFilterRoom === "ALL" || c.roomAssignment === modalFilterRoom;
			const matchMajor = modalFilterMajor === "ALL" || c.majorChoice === modalFilterMajor;

			return matchSearch && matchStatus && matchRoom && matchMajor;
		})
	);

	function goToPrev() {
		if (prevCandidate) selectCandidate(prevCandidate.id);
	}

	function goToNext() {
		if (nextCandidate) selectCandidate(nextCandidate.id);
	}

	const tabs = [
		{
			id: "tahsin",
			label: "Tahsin & Tahfidz",
			icon: BookOpen,
			getScore: () => combinedQuranScore,
			pass: 60,
		},
		{
			id: "kitab",
			label: "Kitab Kuning",
			icon: ScrollText,
			getScore: () => kitabKuningScore,
			pass: 60,
		},
		{
			id: "inggris",
			label: "Bahasa Inggris",
			icon: Languages,
			getScore: () => bInggrisScore,
			pass: 50,
		},
		{
			id: "arab",
			label: "Bahasa Arab",
			icon: Languages,
			getScore: () => bArabScore,
			pass: 50,
		},
		{
			id: "hadits",
			label: "Hadits",
			icon: HeartHandshake,
			getScore: () => haditsScore,
			pass: 50,
		},
		{
			id: "adzan",
			label: "Adzan",
			icon: Volume2,
			getScore: () => adzanScore,
			pass: 55,
		},
		{
			id: "sholat",
			label: "Bacaan Sholat",
			icon: CheckCircle2,
			getScore: () => sholatScore,
			pass: 55,
		},
	] as const;

	function handleCandidateModalKeydown(event: KeyboardEvent) {
		if (!showCandidateModal) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			showCandidateModal = false;
		}
	}
</script>

<svelte:window onkeydown={handleCandidateModalKeydown} />

<div class="w-full space-y-6">
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
				href={currentCandidate ? `/tpa?candidateId=${currentCandidate.id}` : '/tpa'}
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition"
			>
				<span>1. Tes TPA &rarr;</span>
			</a>
			<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold shadow-2xs">
				2. Kepesantrenan
			</span>
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
						<div class="relative w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
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
								{:else if currentCandidate.pesantrenScore?.lockStatus === 'DRAFT'}
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
		<div
			class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-medium shadow-xs"
		>
			<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div
			class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm font-medium shadow-xs"
		>
			<AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}

	{#if currentCandidate}
		<!-- Main Form Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- Left: Candidate Info & 7 Tabs (8 Cols) -->
			<div class="lg:col-span-8 space-y-5">
				<!-- Selected Candidate Card -->
				<div
					class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200"
				>
					<div
						class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100"
					>
						<div class="flex items-center gap-3.5">
							<div
								class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0"
							>
								<User class="w-6 h-6" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span
										class="font-extrabold text-base md:text-lg text-slate-900"
										>{currentCandidate.fullName}</span
									>
									<span
										class="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold"
									>
										{currentCandidate.testNumber}
									</span>
								</div>
								<div
									class="text-xs text-slate-500 flex items-center gap-2 mt-0.5"
								>
									<School
										class="w-3.5 h-3.5 text-slate-400"
									/>
									<span>{currentCandidate.schoolOrigin}</span>
									<span>•</span>
									<span class="font-semibold text-blue-700"
										>{currentCandidate.majorChoice}</span
									>
								</div>
							</div>
						</div>

						<div>
							{#if isLocked}
								<div
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
								>
									<Lock
										class="w-3.5 h-3.5 text-emerald-600"
									/>
									<span>Nilai Terkunci</span>
								</div>
							{:else}
								<div
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold"
								>
									<Unlock
										class="w-3.5 h-3.5 text-amber-600"
									/>
									<span>Mode Draf</span>
								</div>
							{/if}
						</div>
					</div>

					{#if isLocked}
						<div
							class="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
						>
							<div
								class="flex items-center gap-2 text-emerald-800"
							>
								<CheckCircle2
									class="w-4 h-4 text-emerald-600 shrink-0"
								/>
								<span>
									Telah dinilai & dikunci oleh <strong
										>{currentCandidate.pesantrenScore
											?.examinerName || "Penguji"}</strong
									>
									{#if currentCandidate.pesantrenScore?.lockedAt}
										pada {new Date(
											currentCandidate.pesantrenScore.lockedAt,
										).toLocaleString("id-ID")}
									{/if}
								</span>
							</div>

							<button
								type="button"
								onclick={() => {
									unlockCandidateId = currentCandidate.id;
									unlockSubmitting = false;
									showUnlockModal = true;
								}}
								class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
							>
								Buka Kunci Nilai
							</button>
						</div>
					{/if}
				</div>

				<!-- 7 Tabs Navigation Header (Grid 2 Baris: 4 Kolom x 2 Baris) -->
				<div
					class="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200"
				>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{#each tabs as t}
							{@const active = activeTab === t.id}
							{@const score = t.getScore()}
							{@const isPassed = score >= t.pass}
							{@const TabIcon = t.icon}
							<button
								type="button"
								onclick={() => (activeTab = t.id as any)}
								class={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[46px] flex items-center justify-between gap-2 transition-all select-none border ${
									active
										? "bg-blue-800 text-white border-blue-800 shadow-md ring-2 ring-blue-500/40"
										: "bg-slate-50/80 text-slate-700 hover:bg-blue-50/60 hover:text-blue-900 hover:border-blue-200 border-slate-200"
								}`}
							>
								<div class="flex items-center gap-2 truncate">
									<TabIcon class="w-4 h-4 shrink-0 {active ? 'text-white' : 'text-slate-500'}" />
									<span class="truncate">{t.label}</span>
								</div>
								<span
									class={`text-[11px] px-2 py-0.5 rounded-md font-mono font-extrabold shrink-0 ${
										active
											? "bg-blue-700 text-white"
											: isPassed
												? "bg-emerald-100 text-emerald-800"
												: "bg-rose-100 text-rose-800"
									}`}
								>
									{score}
								</span>
							</button>
						{/each}

						<!-- Slot ke-8: Rata-rata 7 Bidang Melengkapi Grid 2 Baris -->
						<div
							class="px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[46px] flex items-center justify-between gap-2 bg-blue-50/90 border border-blue-200 text-blue-900 select-none shadow-2xs"
						>
							<div class="flex items-center gap-2 truncate">
								<Sparkles class="w-4 h-4 text-blue-700 shrink-0" />
								<span class="truncate font-bold text-blue-950">Rata-rata Total</span>
							</div>
							<span
								class="text-[11px] px-2 py-0.5 rounded-md font-mono font-black bg-blue-700 text-white shrink-0 shadow-xs"
							>
								{averageScore}
							</span>
						</div>
					</div>
				</div>

				<!-- Tab Contents -->
				<div
					class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-6"
				>
					<!-- TAB 1: Tahsin & Tahfidz -->
					{#if activeTab === "tahsin"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 1: Tahsin & Tahfidz Al-Qur'an
									</h3>
									<p class="text-xs text-slate-500">
										Uji Bacaan Tajwid 5 Baris & Uji Hafalan
										Santri
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai Gabungan Qur'an:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{combinedQuranScore} / 100
									</div>
								</div>
							</div>

							<!-- Tahsin Section -->
							<div class="space-y-4">
								<h4
									class="font-bold text-sm text-slate-800 flex items-center gap-2"
								>
									<span
										class="w-2.5 h-2.5 rounded-full bg-blue-700"
									></span>
									A. Penilaian Tahsin (Baca 5 Baris Al-Qur'an)
								</h4>

								<div
									class="grid grid-cols-1 md:grid-cols-2 gap-4"
								>
									<!-- Makhraj -->
									<div
										class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
									>
										<div
											class="flex justify-between items-center text-xs"
										>
											<span
												class="font-bold text-slate-800"
												>Ketepatan Makharijul Huruf
												(25%)</span
											>
											<span
												class="text-blue-800 font-bold font-mono"
												>+{map25(tahsinMakhraj)} poin</span
											>
										</div>
										<div class="grid grid-cols-4 gap-2">
											{#each [1, 2, 3, 4] as val}
												<button
													type="button"
													disabled={isLocked}
													onclick={() =>
														(tahsinMakhraj = val)}
													class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
														tahsinMakhraj === val
															? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
															: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
													}`}
												>
													<span class="text-sm"
														>{val}</span
													>
													<span
														class="text-[9px] font-normal"
														>{[
															"Kurang",
															"Cukup",
															"Baik",
															"Sangat Baik",
														][val - 1]}</span
													>
												</button>
											{/each}
										</div>
									</div>

									<!-- Tajwid -->
									<div
										class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
									>
										<div
											class="flex justify-between items-center text-xs"
										>
											<span
												class="font-bold text-slate-800"
												>Penerapan Hukum Tajwid (25%)</span
											>
											<span
												class="text-blue-800 font-bold font-mono"
												>+{map25(tahsinTajwid)} poin</span
											>
										</div>
										<div class="grid grid-cols-4 gap-2">
											{#each [1, 2, 3, 4] as val}
												<button
													type="button"
													disabled={isLocked}
													onclick={() =>
														(tahsinTajwid = val)}
													class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
														tahsinTajwid === val
															? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
															: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
													}`}
												>
													<span class="text-sm"
														>{val}</span
													>
													<span
														class="text-[9px] font-normal"
														>{[
															"Kurang",
															"Cukup",
															"Baik",
															"Sangat Baik",
														][val - 1]}</span
													>
												</button>
											{/each}
										</div>
									</div>

									<!-- Kelancaran -->
									<div
										class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
									>
										<div
											class="flex justify-between items-center text-xs"
										>
											<span
												class="font-bold text-slate-800"
												>Kelancaran & Waqaf-Ibtida (25%)</span
											>
											<span
												class="text-blue-800 font-bold font-mono"
												>+{map25(tahsinKelancaran)} poin</span
											>
										</div>
										<div class="grid grid-cols-4 gap-2">
											{#each [1, 2, 3, 4] as val}
												<button
													type="button"
													disabled={isLocked}
													onclick={() =>
														(tahsinKelancaran =
															val)}
													class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
														tahsinKelancaran === val
															? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
															: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
													}`}
												>
													<span class="text-sm"
														>{val}</span
													>
													<span
														class="text-[9px] font-normal"
														>{[
															"Kurang",
															"Cukup",
															"Baik",
															"Sangat Baik",
														][val - 1]}</span
													>
												</button>
											{/each}
										</div>
									</div>

									<!-- Adab -->
									<div
										class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
									>
										<div
											class="flex justify-between items-center text-xs"
										>
											<span
												class="font-bold text-slate-800"
												>Adab & Sikap Duduk Membaca
												(25%)</span
											>
											<span
												class="text-blue-800 font-bold font-mono"
												>+{map25(tahsinAdab)} poin</span
											>
										</div>
										<div class="grid grid-cols-4 gap-2">
											{#each [1, 2, 3, 4] as val}
												<button
													type="button"
													disabled={isLocked}
													onclick={() =>
														(tahsinAdab = val)}
													class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
														tahsinAdab === val
															? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
															: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
													}`}
												>
													<span class="text-sm"
														>{val}</span
													>
													<span
														class="text-[9px] font-normal"
														>{[
															"Kurang",
															"Cukup",
															"Baik",
															"Sangat Baik",
														][val - 1]}</span
													>
												</button>
											{/each}
										</div>
									</div>
								</div>
							</div>

							<!-- Toggle Punya Hafalan? -->
							<div
								class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between"
							>
								<div>
									<div
										class="font-bold text-sm text-blue-900"
									>
										Santri Memiliki Hafalan Al-Qur'an?
									</div>
									<div class="text-xs text-blue-700">
										{#if hasMemorization}
											Ya, skor akhir Al-Qur'an dihitung
											dari rata-rata (Tahsin + Tahfidz) /
											2
										{:else}
											Tidak, skor akhir Al-Qur'an 100%
											menggunakan nilai Tahsin
										{/if}
									</div>
								</div>

								<button
									type="button"
									disabled={isLocked}
									onclick={() =>
										(hasMemorization = !hasMemorization)}
									class={`px-5 py-2.5 rounded-xl font-bold text-xs min-h-[44px] transition-all flex items-center gap-2 ${
										hasMemorization
											? "bg-blue-800 text-white shadow-md"
											: "bg-white border-2 border-slate-300 text-slate-700"
									}`}
								>
									{#if hasMemorization}
										<Check class="w-4 h-4" />
										<span>PUNYA HAFALAN (YA)</span>
									{:else}
										<span>TIDAK ADA HAFALAN</span>
									{/if}
								</button>
							</div>

							<!-- Tahfidz Section (Conditional) -->
							{#if hasMemorization}
								<div
									class="space-y-4 pt-2 border-t border-slate-100"
								>
									<h4
										class="font-bold text-sm text-slate-800 flex items-center gap-2"
									>
										<span
											class="w-2.5 h-2.5 rounded-full bg-emerald-600"
										></span>
										B. Penilaian Tahfidz (Uji Hafalan)
									</h4>

									<div
										class="grid grid-cols-1 md:grid-cols-2 gap-4"
									>
										<!-- Kelancaran -->
										<div
											class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
										>
											<div
												class="flex justify-between items-center text-xs"
											>
												<span
													class="font-bold text-slate-800"
													>Kelancaran Sambung Ayat
													(25%)</span
												>
												<span
													class="text-emerald-800 font-bold font-mono"
													>+{map25(tahfidzKelancaran)}
													poin</span
												>
											</div>
											<div class="grid grid-cols-4 gap-2">
												{#each [1, 2, 3, 4] as val}
													<button
														type="button"
														disabled={isLocked}
														onclick={() =>
															(tahfidzKelancaran =
																val)}
														class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
															tahfidzKelancaran ===
															val
																? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/40"
																: "bg-white border border-slate-200 text-slate-700 hover:border-emerald-400"
														}`}
													>
														<span class="text-sm"
															>{val}</span
														>
														<span
															class="text-[9px] font-normal"
															>{[
																"Kurang",
																"Cukup",
																"Baik",
																"Sangat Baik",
															][val - 1]}</span
														>
													</button>
												{/each}
											</div>
										</div>

										<!-- Muroja'ah -->
										<div
											class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
										>
											<div
												class="flex justify-between items-center text-xs"
											>
												<span
													class="font-bold text-slate-800"
													>Kualitas Muroja'ah (25%)</span
												>
												<span
													class="text-emerald-800 font-bold font-mono"
													>+{map25(tahfidzMurojaah)} poin</span
												>
											</div>
											<div class="grid grid-cols-4 gap-2">
												{#each [1, 2, 3, 4] as val}
													<button
														type="button"
														disabled={isLocked}
														onclick={() =>
															(tahfidzMurojaah =
																val)}
														class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
															tahfidzMurojaah ===
															val
																? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/40"
																: "bg-white border border-slate-200 text-slate-700 hover:border-emerald-400"
														}`}
													>
														<span class="text-sm"
															>{val}</span
														>
														<span
															class="text-[9px] font-normal"
															>{[
																"Kurang",
																"Cukup",
																"Baik",
																"Sangat Baik",
															][val - 1]}</span
														>
													</button>
												{/each}
											</div>
										</div>

										<!-- Target -->
										<div
											class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
										>
											<div
												class="flex justify-between items-center text-xs"
											>
												<span
													class="font-bold text-slate-800"
													>Ketepatan Target Hafalan
													(25%)</span
												>
												<span
													class="text-emerald-800 font-bold font-mono"
													>+{map25(tahfidzTarget)} poin</span
												>
											</div>
											<div class="grid grid-cols-4 gap-2">
												{#each [1, 2, 3, 4] as val}
													<button
														type="button"
														disabled={isLocked}
														onclick={() =>
															(tahfidzTarget =
																val)}
														class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
															tahfidzTarget ===
															val
																? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/40"
																: "bg-white border border-slate-200 text-slate-700 hover:border-emerald-400"
														}`}
													>
														<span class="text-sm"
															>{val}</span
														>
														<span
															class="text-[9px] font-normal"
															>{[
																"Kurang",
																"Cukup",
																"Baik",
																"Sangat Baik",
															][val - 1]}</span
														>
													</button>
												{/each}
											</div>
										</div>

										<!-- Adab -->
										<div
											class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
										>
											<div
												class="flex justify-between items-center text-xs"
											>
												<span
													class="font-bold text-slate-800"
													>Adab Menghafal Al-Qur'an
													(25%)</span
												>
												<span
													class="text-emerald-800 font-bold font-mono"
													>+{map25(tahfidzAdab)} poin</span
												>
											</div>
											<div class="grid grid-cols-4 gap-2">
												{#each [1, 2, 3, 4] as val}
													<button
														type="button"
														disabled={isLocked}
														onclick={() =>
															(tahfidzAdab = val)}
														class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
															tahfidzAdab === val
																? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/40"
																: "bg-white border border-slate-200 text-slate-700 hover:border-emerald-400"
														}`}
													>
														<span class="text-sm"
															>{val}</span
														>
														<span
															class="text-[9px] font-normal"
															>{[
																"Kurang",
																"Cukup",
																"Baik",
																"Sangat Baik",
															][val - 1]}</span
														>
													</button>
												{/each}
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- TAB 2: Kitab Kuning -->
					{#if activeTab === "kitab"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 2: Kitab Kuning
									</h3>
									<p class="text-xs text-slate-500">
										Baca Kitab Gundul, Kaidah Nahwu-Shorof,
										Makna Pegon & Pemahaman Isi
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai Kitab Kuning:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{kitabKuningScore} / 100
									</div>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Membaca Teks Arab Gundul (25%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map25(kitabBacaGundul)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(kitabBacaGundul = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													kitabBacaGundul === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Kaidah Nahwu & Shorof (25%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map25(kitabNahwuShorof)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(kitabNahwuShorof = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													kitabNahwuShorof === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Terjemah Makna Pegon (25%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map25(kitabTerjemahPegon)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(kitabTerjemahPegon = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													kitabTerjemahPegon === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>4. Pemahaman Isi Kandungan (25%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map25(kitabIsi)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() => (kitabIsi = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													kitabIsi === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB 3: Bahasa Inggris -->
					{#if activeTab === "inggris"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 3: Bahasa Inggris
									</h3>
									<p class="text-xs text-slate-500">
										Speaking (40%), Pronunciation (20%),
										Writing (20%), Vocab (20%)
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai B. Inggris:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{bInggrisScore} / 100
									</div>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Speaking Fluency (Bobot 40%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map40(bInggrisSpeaking)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bInggrisSpeaking = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bInggrisSpeaking === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Pronunciation & Accent (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(
												bInggrisPronunciation,
											)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bInggrisPronunciation =
														val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bInggrisPronunciation ===
													val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Writing & Grammar (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(bInggrisWriting)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bInggrisWriting = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bInggrisWriting === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>4. Vocabulary Mastery (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(bInggrisVocab)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bInggrisVocab = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bInggrisVocab === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB 4: Bahasa Arab -->
					{#if activeTab === "arab"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 4: Bahasa Arab (Muhadatsah)
									</h3>
									<p class="text-xs text-slate-500">
										Muhadatsah (40%), Mukhraj (20%), Kitabah
										(20%), Mufrodat (20%)
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai B. Arab:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{bArabScore} / 100
									</div>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Muhadatsah / Speaking (40%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map40(bArabSpeaking)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bArabSpeaking = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bArabSpeaking === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Lahjah & Pelafalan (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(bArabPronunciation)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bArabPronunciation = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bArabPronunciation === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Kitabah / Menulis Arab (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(bArabWriting)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bArabWriting = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bArabWriting === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>4. Mufrodat / Kosa Kata (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(bArabVocab)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(bArabVocab = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													bArabVocab === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB 5: Hadits -->
					{#if activeTab === "hadits"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 5: Hadits Nabi SAW
									</h3>
									<p class="text-xs text-slate-500">
										Hafalan Matan (40%), Kelancaran (20%),
										Pemahaman Makna (20%), Adab (20%)
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai Hadits:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{haditsScore} / 100
									</div>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Hafalan Matan Hadits (40%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map40(haditsHafalan)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(haditsHafalan = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													haditsHafalan === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Kelancaran & Ketepatan (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(haditsKelancaran)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(haditsKelancaran = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													haditsKelancaran === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Pemahaman Makna Hadits (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(haditsMakna)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(haditsMakna = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													haditsMakna === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>4. Adab Terhadap Hadits (20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(haditsAdab)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(haditsAdab = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													haditsAdab === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang",
														"Cukup",
														"Baik",
														"Sangat Baik",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB 6: Adzan -->
					{#if activeTab === "adzan"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 6: Adzan
									</h3>
									<p class="text-xs text-slate-500">
										Kelancaran (50%), Ketepatan Makhraj
										(30%), Kualitas Suara/Nada (20%)
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai Adzan:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{adzanScore} / 100
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Kelancaran Lafazh Adzan Tanpa
											Kesalahan (Bobot 50%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map50(adzanKelancaran)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(adzanKelancaran = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													adzanKelancaran === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (20)",
														"Cukup (30)",
														"Baik (40)",
														"Sempurna (50)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Ketepatan Makhraj & Hukum Tajwid
											(Bobot 30%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map30(adzanMakhraj)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(adzanMakhraj = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													adzanMakhraj === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (10)",
														"Cukup (15)",
														"Baik (20)",
														"Sempurna (30)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Kualitas Suara, Pernapasan &
											Irama (Bobot 20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(adzanSuara)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(adzanSuara = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													adzanSuara === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (5)",
														"Cukup (10)",
														"Baik (15)",
														"Sempurna (20)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB 7: Bacaan Sholat -->
					{#if activeTab === "sholat"}
						<div class="space-y-6">
							<div
								class="flex items-center justify-between pb-3 border-b border-slate-100"
							>
								<div>
									<h3
										class="text-base font-extrabold text-slate-900"
									>
										Bidang 7: Praktik Bacaan Sholat
									</h3>
									<p class="text-xs text-slate-500">
										Iftitah, Al-Fatihah, Tasyahhud & Doa
										Sholat Fardhu
									</p>
								</div>
								<div class="text-right">
									<div class="text-xs text-slate-500">
										Nilai Bacaan Sholat:
									</div>
									<div
										class="text-xl font-black text-blue-900 font-mono"
									>
										{sholatScore} / 100
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>1. Kelancaran Lafazh Bacaan Sholat
											Tanpa Kesalahan (Bobot 50%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map50(sholatKelancaran)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(sholatKelancaran = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													sholatKelancaran === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (20)",
														"Cukup (30)",
														"Baik (40)",
														"Sempurna (50)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>2. Ketepatan Makhraj & Tajwid dalam
											Sholat (Bobot 30%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map30(sholatMakhraj)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(sholatMakhraj = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													sholatMakhraj === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (10)",
														"Cukup (15)",
														"Baik (20)",
														"Sempurna (30)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>

								<div
									class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
								>
									<div
										class="flex justify-between items-center text-xs"
									>
										<span class="font-bold text-slate-800"
											>3. Adab & Tuma'ninah dalam Sholat
											(Bobot 20%)</span
										>
										<span
											class="text-blue-800 font-bold font-mono"
											>+{map20(sholatAdab)}</span
										>
									</div>
									<div class="grid grid-cols-4 gap-2">
										{#each [1, 2, 3, 4] as val}
											<button
												type="button"
												disabled={isLocked}
												onclick={() =>
													(sholatAdab = val)}
												class={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
													sholatAdab === val
														? "bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40"
														: "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
												}`}
											>
												<span class="text-sm"
													>{val}</span
												>
												<span
													class="text-[9px] font-normal"
													>{[
														"Kurang (5)",
														"Cukup (10)",
														"Baik (15)",
														"Sempurna (20)",
													][val - 1]}</span
												>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- Catatan Khusus Asatidz Penguji -->
					<div class="pt-4 border-t border-slate-100 space-y-2">
						<label
							for="rubrik-notes"
							class="block text-xs font-bold text-slate-700"
						>
							Catatan Pengamatan Asatidz untuk Santri:
						</label>
						<textarea
							id="rubrik-notes"
							disabled={isLocked}
							bind:value={notes}
							rows="3"
							class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
							placeholder="Tuliskan catatan khusus terkait kelancaran, bakat bahasa, atau catatan tajwid santri..."
						></textarea>
					</div>
				</div>
			</div>

			<!-- Right: Sticky Live 7-Field Summary & Lock Actions (4 Cols) -->
			<div class="lg:col-span-4 sticky top-20 space-y-4">
				<div
					class="bg-white rounded-2xl p-5 shadow-md border border-slate-200 space-y-5"
				>
					<div
						class="flex items-center justify-between pb-3 border-b border-slate-100"
					>
						<div class="flex items-center gap-2">
							<Calculator class="w-5 h-5 text-blue-800" />
							<h3 class="font-bold text-base text-slate-900">
								Rangkuman 7 Bidang
							</h3>
						</div>
						<span
							class="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold"
						>
							Live Skala 100
						</span>
					</div>

					<!-- Big Average Score -->
					<div
						class="text-center py-4 px-3 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100 space-y-2"
					>
						<div
							class="text-xs uppercase font-extrabold tracking-wider text-blue-800"
						>
							Rata-Rata Nilai Kepesantrenan
						</div>
						<div
							class="text-5xl font-black text-blue-900 tracking-tight font-mono"
						>
							{averageScore}
						</div>
						<div class="text-xs text-slate-500 font-medium">
							Standar Kelulusan Passing Grade Gabungan
						</div>
					</div>

					<!-- 7 Passing Grade Status Checklist -->
					<div class="space-y-2 pt-1 text-xs">
						<div
							class="font-bold text-slate-700 text-xs flex justify-between"
						>
							<span>Status Kelulusan Per Bidang:</span>
							<span class="text-slate-400 font-normal"
								>Min. Target</span
							>
						</div>

						{#each tabs as item}
							{@const s = item.getScore()}
							{@const passed = s >= item.pass}
							<div
								class="flex items-center justify-between p-2 rounded-lg {passed
									? 'bg-emerald-50/60'
									: 'bg-rose-50/60'} border {passed
									? 'border-emerald-200'
									: 'border-rose-200'}"
							>
								<div class="flex items-center gap-2">
									{#if passed}
										<CheckCircle2
											class="w-3.5 h-3.5 text-emerald-600 shrink-0"
										/>
									{:else}
										<AlertCircle
											class="w-3.5 h-3.5 text-rose-600 shrink-0"
										/>
									{/if}
									<span class="font-semibold text-slate-800"
										>{item.label}</span
									>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="font-mono font-bold {passed
											? 'text-emerald-800'
											: 'text-rose-800'}">{s}</span
									>
									<span class="text-[10px] text-slate-400"
										>(&ge;{item.pass})</span
									>
								</div>
							</div>
						{/each}
					</div>

					<!-- Examiner Input -->
					<div class="pt-3 border-t border-slate-100 space-y-1.5">
						<label
							for="examiner-rubrik"
							class="block text-xs font-bold text-slate-700"
							>Nama Asatidz Penguji:</label
						>
						<input
							id="examiner-rubrik"
							type="text"
							disabled={isLocked}
							bind:value={examinerName}
							class="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
							placeholder="Nama penguji kepesantrenan..."
						/>
					</div>

					<!-- Action Buttons -->
					{#if !isLocked}
						<div class="pt-2 space-y-2.5">
							<form method="POST" action="?/saveDraft">
								<input
									type="hidden"
									name="candidateId"
									value={currentCandidate.id}
								/>
								<input
									type="hidden"
									name="examinerName"
									value={examinerName}
								/>
								<input
									type="hidden"
									name="notes"
									value={notes}
								/>
								<input
									type="hidden"
									name="tahsinMakhraj"
									value={tahsinMakhraj}
								/>
								<input
									type="hidden"
									name="tahsinTajwid"
									value={tahsinTajwid}
								/>
								<input
									type="hidden"
									name="tahsinKelancaran"
									value={tahsinKelancaran}
								/>
								<input
									type="hidden"
									name="tahsinAdab"
									value={tahsinAdab}
								/>
								<input
									type="hidden"
									name="hasMemorization"
									value={hasMemorization ? "true" : "false"}
								/>
								<input
									type="hidden"
									name="tahfidzKelancaran"
									value={tahfidzKelancaran}
								/>
								<input
									type="hidden"
									name="tahfidzMurojaah"
									value={tahfidzMurojaah}
								/>
								<input
									type="hidden"
									name="tahfidzTarget"
									value={tahfidzTarget}
								/>
								<input
									type="hidden"
									name="tahfidzAdab"
									value={tahfidzAdab}
								/>
								<input
									type="hidden"
									name="kitabBacaGundul"
									value={kitabBacaGundul}
								/>
								<input
									type="hidden"
									name="kitabNahwuShorof"
									value={kitabNahwuShorof}
								/>
								<input
									type="hidden"
									name="kitabTerjemahPegon"
									value={kitabTerjemahPegon}
								/>
								<input
									type="hidden"
									name="kitabIsi"
									value={kitabIsi}
								/>
								<input
									type="hidden"
									name="bInggrisSpeaking"
									value={bInggrisSpeaking}
								/>
								<input
									type="hidden"
									name="bInggrisPronunciation"
									value={bInggrisPronunciation}
								/>
								<input
									type="hidden"
									name="bInggrisWriting"
									value={bInggrisWriting}
								/>
								<input
									type="hidden"
									name="bInggrisVocab"
									value={bInggrisVocab}
								/>
								<input
									type="hidden"
									name="bArabSpeaking"
									value={bArabSpeaking}
								/>
								<input
									type="hidden"
									name="bArabPronunciation"
									value={bArabPronunciation}
								/>
								<input
									type="hidden"
									name="bArabWriting"
									value={bArabWriting}
								/>
								<input
									type="hidden"
									name="bArabVocab"
									value={bArabVocab}
								/>
								<input
									type="hidden"
									name="haditsHafalan"
									value={haditsHafalan}
								/>
								<input
									type="hidden"
									name="haditsKelancaran"
									value={haditsKelancaran}
								/>
								<input
									type="hidden"
									name="haditsMakna"
									value={haditsMakna}
								/>
								<input
									type="hidden"
									name="haditsAdab"
									value={haditsAdab}
								/>
								<input
									type="hidden"
									name="adzanKelancaran"
									value={adzanKelancaran}
								/>
								<input
									type="hidden"
									name="adzanMakhraj"
									value={adzanMakhraj}
								/>
								<input
									type="hidden"
									name="adzanSuara"
									value={adzanSuara}
								/>
								<input
									type="hidden"
									name="sholatKelancaran"
									value={sholatKelancaran}
								/>
								<input
									type="hidden"
									name="sholatMakhraj"
									value={sholatMakhraj}
								/>
								<input
									type="hidden"
									name="sholatAdab"
									value={sholatAdab}
								/>

								<button
									type="submit"
									class="w-full py-3 px-4 rounded-xl border-2 border-blue-700 text-blue-800 hover:bg-blue-50 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
								>
									<Save class="w-4 h-4" />
									<span>Simpan Draf Kepesantrenan</span>
								</button>
							</form>

							<button
								type="button"
								onclick={() => (showLockModal = true)}
								class="w-full py-3 px-4 rounded-xl bg-blue-800 text-white hover:bg-blue-900 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-blue-950/20"
							>
								<Lock class="w-4 h-4" />
								<span>Kunci Nilai Kepesantrenan</span>
							</button>
						</div>
					{:else}
						<div
							class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500"
						>
							Nilai telah dikunci. Anda dapat membuka kunci
							kembali di panel atas jika ada revisi persetujuan
							pleno.
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Lock Confirmation Modal -->
		{#if showLockModal}
			<div
				class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
			>
				<div
					class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center"
					>
						<Lock class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-lg font-bold text-slate-900">
							Kunci Nilai Kepesantrenan?
						</h4>
						<p class="text-xs text-slate-500 mt-1">
							Anda akan mengunci nilai untuk <strong
								>{currentCandidate.fullName}</strong
							>
							dengan rata-rata 7 bidang
							<strong>{averageScore}</strong>. Nilai ini akan
							disinkronkan ke Master Ledger untuk penetapan
							peringkat.
						</p>
					</div>

					<form method="POST" action="?/lockScore" class="space-y-4">
						<input
							type="hidden"
							name="candidateId"
							value={currentCandidate.id}
						/>
						<input
							type="hidden"
							name="examinerName"
							value={examinerName}
						/>
						<input type="hidden" name="notes" value={notes} />
						<input
							type="hidden"
							name="tahsinMakhraj"
							value={tahsinMakhraj}
						/>
						<input
							type="hidden"
							name="tahsinTajwid"
							value={tahsinTajwid}
						/>
						<input
							type="hidden"
							name="tahsinKelancaran"
							value={tahsinKelancaran}
						/>
						<input
							type="hidden"
							name="tahsinAdab"
							value={tahsinAdab}
						/>
						<input
							type="hidden"
							name="hasMemorization"
							value={hasMemorization ? "true" : "false"}
						/>
						<input
							type="hidden"
							name="tahfidzKelancaran"
							value={tahfidzKelancaran}
						/>
						<input
							type="hidden"
							name="tahfidzMurojaah"
							value={tahfidzMurojaah}
						/>
						<input
							type="hidden"
							name="tahfidzTarget"
							value={tahfidzTarget}
						/>
						<input
							type="hidden"
							name="tahfidzAdab"
							value={tahfidzAdab}
						/>
						<input
							type="hidden"
							name="kitabBacaGundul"
							value={kitabBacaGundul}
						/>
						<input
							type="hidden"
							name="kitabNahwuShorof"
							value={kitabNahwuShorof}
						/>
						<input
							type="hidden"
							name="kitabTerjemahPegon"
							value={kitabTerjemahPegon}
						/>
						<input type="hidden" name="kitabIsi" value={kitabIsi} />
						<input
							type="hidden"
							name="bInggrisSpeaking"
							value={bInggrisSpeaking}
						/>
						<input
							type="hidden"
							name="bInggrisPronunciation"
							value={bInggrisPronunciation}
						/>
						<input
							type="hidden"
							name="bInggrisWriting"
							value={bInggrisWriting}
						/>
						<input
							type="hidden"
							name="bInggrisVocab"
							value={bInggrisVocab}
						/>
						<input
							type="hidden"
							name="bArabSpeaking"
							value={bArabSpeaking}
						/>
						<input
							type="hidden"
							name="bArabPronunciation"
							value={bArabPronunciation}
						/>
						<input
							type="hidden"
							name="bArabWriting"
							value={bArabWriting}
						/>
						<input
							type="hidden"
							name="bArabVocab"
							value={bArabVocab}
						/>
						<input
							type="hidden"
							name="haditsHafalan"
							value={haditsHafalan}
						/>
						<input
							type="hidden"
							name="haditsKelancaran"
							value={haditsKelancaran}
						/>
						<input
							type="hidden"
							name="haditsMakna"
							value={haditsMakna}
						/>
						<input
							type="hidden"
							name="haditsAdab"
							value={haditsAdab}
						/>
						<input
							type="hidden"
							name="adzanKelancaran"
							value={adzanKelancaran}
						/>
						<input
							type="hidden"
							name="adzanMakhraj"
							value={adzanMakhraj}
						/>
						<input
							type="hidden"
							name="adzanSuara"
							value={adzanSuara}
						/>
						<input
							type="hidden"
							name="sholatKelancaran"
							value={sholatKelancaran}
						/>
						<input
							type="hidden"
							name="sholatMakhraj"
							value={sholatMakhraj}
						/>
						<input
							type="hidden"
							name="sholatAdab"
							value={sholatAdab}
						/>

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
		<div
			class="bg-white rounded-2xl p-12 text-center border border-slate-200"
		>
			<AlertCircle class="w-12 h-12 text-slate-400 mx-auto mb-3" />
			<h3 class="font-bold text-slate-800 text-lg">
				Tidak Ada Data Peserta
			</h3>
			<p class="text-xs text-slate-500 mt-1">
				Belum ada antrean santri aktif yang terdaftar.
				</p>
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
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
							<Users class="h-5 w-5" />
						</div>
						<div class="min-w-0">
							<h3 id="candidate-modal-title" class="font-display text-base font-bold tracking-tight text-slate-900 md:text-lg">
								Pilih Santri Ujian Kepesantrenan
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
							<label for="modal-search-rubrik" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Pencarian</label>
							<div class="relative">
								<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									id="modal-search-rubrik"
									type="text"
									bind:value={modalSearch}
									placeholder="Cari nama santri, no tes, asal sekolah..."
									class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 shadow-2xs transition focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 md:text-sm"
								/>
							</div>
						</div>

						<!-- Filter Status -->
						<div>
							<label for="filter-status-rubrik" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Status Nilai</label>
							<select
								id="filter-status-rubrik"
								bind:value={modalFilterStatus}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
							>
								<option value="ALL">Semua Status</option>
								<option value="UNSCORED">Belum Dinilai</option>
								<option value="DRAFT">Mode Draf</option>
								<option value="LOCKED">Nilai Terkunci</option>
							</select>
						</div>

						<!-- Filter Ruangan -->
						<div>
							<label for="filter-room-rubrik" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Ruang Ujian</label>
							<select
								id="filter-room-rubrik"
								bind:value={modalFilterRoom}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
							>
								<option value="ALL">Semua Ruangan</option>
								{#each availableRooms as r}
									<option value={r}>{r}</option>
								{/each}
							</select>
						</div>

						<!-- Filter Jurusan -->
						<div>
							<label for="filter-major-rubrik" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Jurusan</label>
							<select
								id="filter-major-rubrik"
								bind:value={modalFilterMajor}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
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
								{@const isLockedScore = c.pesantrenScore?.lockStatus === 'LOCKED'}
								{@const isDraftScore = c.pesantrenScore?.lockStatus === 'DRAFT'}

								<button
									type="button"
									onclick={() => selectCandidate(c.id)}
									aria-current={isCurrent ? 'true' : undefined}
									title={`${c.fullName} · ${c.schoolOrigin}`}
									class={`group relative flex h-full flex-col rounded-2xl border p-3.5 text-left transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1 ${
										isCurrent
											? 'border-emerald-400 bg-emerald-50/70 shadow-sm'
											: 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md'
									}`}
								>
									<div class="flex items-center gap-1.5">
										<span class="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
											{c.testNumber.slice(-3)}
										</span>
										{#if isCurrent}
											<span class="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white">Sedang Dinilai</span>
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
											<span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rata-rata</span>
											{#if isLockedScore}
												<span class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
													<Lock class="h-2.5 w-2.5" />
													<span>{c.pesantrenScore?.averageScore}</span>
												</span>
											{:else if isDraftScore}
												<span class="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700">
													Draf ({c.pesantrenScore?.averageScore})
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
							class="rounded-lg bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-200" data-footer="true"
						>
							Tutup
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- KONFIRMASI BUKA KUNCI NILAI -->
	<form bind:this={unlockForm} method="POST" action="?/unlockScore" class="hidden">
		<input type="hidden" name="candidateId" value={unlockCandidateId ?? ''} />
	</form>

	<ConfirmDialog
		open={showUnlockModal}
		tone="amber"
		title="Buka kunci nilai?"
		description={`Nilai Kepesantrenan ${currentCandidate?.fullName ?? 'santri ini'} akan kembali ke mode draf dan bisa diedit ulang oleh penguji.`}
		confirmLabel="Ya, buka kunci"
		cancelLabel="Batal"
		loading={unlockSubmitting}
		onconfirm={confirmUnlock}
		oncancel={() => (showUnlockModal = false)}
	/>
</div>
