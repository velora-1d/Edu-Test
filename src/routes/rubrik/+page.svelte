<script lang="ts">
	import type { PageData, ActionData } from "./$types";
	import { goto } from "$app/navigation";
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
		Sparkles
	} from "lucide-svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state("");
	let showLockModal = $state(false);
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
		goto(`/rubrik?candidateId=${id}`, { reset: false });
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
</script>

<div class="w-full space-y-6">
	<!-- Sequential Selection Workflow Banner -->
	<div class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
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
				href={currentCandidate ? `/tpa?candidateId=${currentCandidate.id}` : '/tpa'}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 font-semibold transition"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>1. Tes TPA</span>
			</a>
			<span class="text-slate-300">→</span>
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold shadow-2xs">
				<span>2. Tes Kepesantrenan (Aktif)</span>
			</span>
			<span class="text-slate-300">→</span>
			<a
				href={currentCandidate ? `/wawancara?candidateId=${currentCandidate.id}` : '/wawancara'}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 font-semibold transition"
			>
				<span>3. Wawancara</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<a
			href="/ledger"
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50 font-semibold transition ml-auto"
		>
			<span>Buka Rekap Nilai</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>
	<!-- Top Candidate Roster Bar (Horizontal Scroll) -->
	<div
		class="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200"
	>
		<div
			class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4"
		>
			<div>
				<h2
					class="text-xl font-extrabold text-blue-900 tracking-tight flex items-center gap-2"
				>
					<ScrollText class="w-6 h-6 text-blue-700" />
					Penilaian Tes Kepesantrenan
				</h2>
				<p class="text-xs md:text-sm text-slate-500">
					7 Bidang Uji Praktik • Skala Sentuh 1-4 • Standar Kelulusan
					Passing Grade
				</p>
			</div>

			<div class="relative w-full md:w-72">
				<Search
					class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari santri antrean..."
					class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
				/>
			</div>
		</div>

		<!-- Candidate Quick Selector Pills -->
		<div
			class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin"
		>
			{#each filteredCandidates as c}
				{@const active = currentCandidate?.id === c.id}
				{@const scoreLocked = c.pesantrenScore?.lockStatus === "LOCKED"}
				{@const scoreDraft = c.pesantrenScore?.lockStatus === "DRAFT"}
				<button
					type="button"
					onclick={() => selectCandidate(c.id)}
					class={`shrink-0 px-3.5 py-2.5 rounded-xl text-left border transition-all select-none min-h-[48px] flex items-center gap-3 ${
						active
							? "bg-blue-800 text-white border-blue-800 shadow-md ring-2 ring-blue-500/40"
							: "bg-white hover:bg-blue-50/50 border-slate-200 text-slate-700"
					}`}
				>
					<div
						class={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
							active
								? "bg-blue-700 text-white"
								: "bg-blue-100 text-blue-800"
						}`}
					>
						{c.testNumber.slice(-3)}
					</div>
					<div class="min-w-0 pr-1">
						<div
							class="font-bold text-xs md:text-sm truncate max-w-[130px] md:max-w-[160px]"
						>
							{c.fullName}
						</div>
						<div
							class={`text-[11px] truncate flex items-center gap-1 ${active ? "text-blue-200" : "text-slate-500"}`}
						>
							{#if scoreLocked}
								<span
									class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
								></span>
								<span
									>Terkunci ({c.pesantrenScore
										?.averageScore})</span
								>
							{:else if scoreDraft}
								<span
									class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"
								></span>
								<span
									>Draf ({c.pesantrenScore
										?.averageScore})</span
								>
							{:else}
								<span
									class="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"
								></span>
								<span>Antrean</span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
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
									<span>NILAI KEPESANTRENAN TERKUNCI</span>
								</div>
							{:else}
								<div
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold"
								>
									<Unlock
										class="w-3.5 h-3.5 text-amber-600"
									/>
									<span>DRAF PENILAIAN</span>
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

							<form method="POST" action="?/unlockScore">
								<input
									type="hidden"
									name="candidateId"
									value={currentCandidate.id}
								/>
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
</div>
