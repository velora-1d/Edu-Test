<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import { goto } from '$app/navigation';
	import {
		MessageSquare,
		User,
		School,
		Save,
		CheckCircle2,
		AlertCircle,
		Search,
		Check,
		Lock,
		Unlock,
		Sparkles,
		Clock,
		HeartHandshake,
		BookOpen,
		FileText,
		ShieldAlert,
		Smartphone,
		Compass,
		Info
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state('');
	let activeTab = $state<'umum' | 'pesantren' | 'dossier'>('umum');
	let autosaveStatus = $state<'saved' | 'saving' | 'idle'>('idle');
	let lastSavedTime = $state<string>('');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	let currentCandidate = $derived(data.selectedCandidate);
	let interviewData = $derived(currentCandidate?.interview);
	let isCompleted = $derived(interviewData?.completionStatus === 'COMPLETED');

	// Interviewer
	let interviewerName = $state('Dra. Hj. Siti Aminah');

	// 26 Butir Form Data Default Constant
	const DEFAULT_FORM_DATA = {
		// A. Umum & Screening
		prestasi: '',
		anak_ke: 1,
		dari_bersaudara: 3,
		pernah_pacaran: false,
		catatan_pacaran: '',
		pernah_merokok: false,
		catatan_merokok: '',
		bisa_komputer: true,
		aplikasi_komputer: 'Word, Browsing',
		bisa_editing: false,
		aplikasi_editing: '',
		penyakit_alergi: '',
		respons_ejekan: '',
		sikap_malas: '',
		sikap_terhadap_teman_khusus: '',
		pengalaman_pergaulan: '',
		kebiasaan_berbicara: '',
		inisiatif_mondok: 'Keinginan Sendiri & Didukung Ortu',
		catatan_inisiatif: '',
		manajemen_waktu: '',
		tantangan_kemandirian: '',
		kebiasaan_diperbaiki: '',
		kebersihan_kamar: '',
		durasi_gadget: '2-3 Jam',
		rincian_gadget: '',

		// B. Kepesantrenan
		hafalan_juz: '',
		kitab_dipelajari: '',
		motivasi_masuk: '',
		salat_lima_waktu: '',
		membaca_quran: '',
		menerima_teguran: '',
		beda_pendapat: '',
		ibadah_malam: '',
		bukti_kesiapan: ''
	};

	let fd = $state<Record<string, any>>({ ...DEFAULT_FORM_DATA });

	// Summaries & Recommendation
	let studentGeneralSummary = $state('');
	let studentPesantrenSummary = $state('');
	let parentCommitmentSummary = $state('');
	let specialRecommendation = $state('Sangat direkomendasikan masuk kuota utama');

	// Sync state when candidate changes (using untrack to prevent infinite loop)
	$effect(() => {
		const candidate = currentCandidate;
		untrack(() => {
			if (candidate) {
				const inv = candidate.interview;
				if (inv) {
					interviewerName = inv.interviewerName || 'Dra. Hj. Siti Aminah';
					studentGeneralSummary = inv.studentGeneralSummary || '';
					studentPesantrenSummary = inv.studentPesantrenSummary || '';
					parentCommitmentSummary = inv.parentCommitmentSummary || '';
					specialRecommendation = inv.specialRecommendation || 'Sangat direkomendasikan masuk kuota utama';

					if (inv.formData && typeof inv.formData === 'object') {
						fd = { ...DEFAULT_FORM_DATA, ...(inv.formData as Record<string, any>) };
					} else {
						fd = { ...DEFAULT_FORM_DATA };
					}
				} else {
					// Reset defaults
					interviewerName = 'Dra. Hj. Siti Aminah';
					studentGeneralSummary = '';
					studentPesantrenSummary = '';
					parentCommitmentSummary = '';
					specialRecommendation = 'Sangat direkomendasikan masuk kuota utama';
					fd = { ...DEFAULT_FORM_DATA };
				}
			}
		});
	});

	// Filtered candidates
	let filteredCandidates = $derived(
		data.candidates.filter(
			(c) =>
				c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function selectCandidate(id: string) {
		goto(`/wawancara?candidateId=${id}`, { reset: false });
	}

	// Trigger autosave on field change
	function triggerAutosave() {
		if (isCompleted || !currentCandidate) return;

		autosaveStatus = 'saving';
		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(async () => {
			try {
				const res = await fetch('/api/wawancara', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						candidateId: currentCandidate.id,
						formData: fd,
						studentGeneralSummary,
						studentPesantrenSummary,
						parentCommitmentSummary,
						specialRecommendation,
						interviewerName,
						isCompleted: false
					})
				});

				if (res.ok) {
					autosaveStatus = 'saved';
					const now = new Date();
					lastSavedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
				} else {
					autosaveStatus = 'idle';
				}
			} catch (err) {
				console.error('Autosave error:', err);
				autosaveStatus = 'idle';
			}
		}, 2000);
	}
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Top Candidate Roster Bar (Horizontal Scroll) -->
	<div class="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
			<div>
				<h2 class="text-xl font-extrabold text-blue-900 tracking-tight flex items-center gap-2">
					<MessageSquare class="w-6 h-6 text-blue-700" />
					Meja Uji Wawancara Kualitatif & Dossier Santri
				</h2>
				<p class="text-xs md:text-sm text-slate-500">
					26 Butir Wawancara Mendalam • Screening Perilaku & Anti-Bullying • Rekomendasi Sidang Pleno
				</p>
			</div>

			<div class="relative w-full md:w-72">
				<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari santri..."
					class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
				/>
			</div>
		</div>

		<!-- Candidate Quick Selector Pills -->
		<div class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
			{#each filteredCandidates as c}
				{@const active = currentCandidate?.id === c.id}
				{@const status = c.interview?.completionStatus}
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
							{#if status === 'COMPLETED'}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
								<span>Selesai</span>
							{:else if status === 'IN_PROGRESS'}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
								<span>Sedang Diisi</span>
							{:else}
								<span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
								<span>Belum Dimulai</span>
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
		<!-- Sticky Candidate Info & Autosave Banner -->
		<div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 sticky top-16 z-20">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

				<div class="flex items-center gap-3">
					<!-- Autosave Status Badge -->
					{#if autosaveStatus === 'saving'}
						<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold animate-pulse">
							<Clock class="w-3.5 h-3.5 text-amber-600" />
							<span>Menyimpan draf...</span>
						</div>
					{:else if autosaveStatus === 'saved'}
						<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
							<span>Tersimpan ({lastSavedTime})</span>
						</div>
					{/if}

					<!-- Completion Status Badge -->
					{#if isCompleted}
						<div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
							<Lock class="w-3.5 h-3.5 text-emerald-600" />
							<span>DOSSIER SELESAI</span>
						</div>
					{:else}
						<div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
							<Unlock class="w-3.5 h-3.5 text-blue-600" />
							<span>SESI AKTIF</span>
						</div>
					{/if}
				</div>
			</div>

			{#if isCompleted}
				<div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800">
					<div class="flex items-center gap-2">
						<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						<span>Wawancara telah selesai dan terkunci oleh <strong>{interviewerName}</strong>.</span>
					</div>
					<form method="POST" action="?/reopen">
						<input type="hidden" name="candidateId" value={currentCandidate.id} />
						<button
							type="submit"
							class="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors shadow-2xs"
						>
							Buka Kembali
						</button>
					</form>
				</div>
			{/if}
		</div>

		<!-- Section Tabs (Tablet Touch Friendly - min 48px) -->
		<div class="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					onclick={() => (activeTab = 'umum')}
					class={`py-3 px-4 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'umum'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<User class="w-4 h-4" />
					<span>1. Wawancara Umum (18 Butir)</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'pesantren')}
					class={`py-3 px-4 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'pesantren'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<BookOpen class="w-4 h-4" />
					<span>2. Kepesantrenan (9 Butir)</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'dossier')}
					class={`py-3 px-4 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'dossier'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<FileText class="w-4 h-4" />
					<span>3. Dossier & Rekomendasi</span>
				</button>
			</div>
		</div>

		<!-- Form Body -->
		<form method="POST" action="?/saveDraft" oninput={triggerAutosave} class="space-y-6">
			<input type="hidden" name="candidateId" value={currentCandidate.id} />
			<input type="hidden" name="interviewerName" value={interviewerName} />
			<input type="hidden" name="formDataJson" value={JSON.stringify(fd)} />
			<input type="hidden" name="studentGeneralSummary" value={studentGeneralSummary} />
			<input type="hidden" name="studentPesantrenSummary" value={studentPesantrenSummary} />
			<input type="hidden" name="parentCommitmentSummary" value={parentCommitmentSummary} />
			<input type="hidden" name="specialRecommendation" value={specialRecommendation} />

			<!-- TAB 1: WAWANCARA UMUM -->
			{#if activeTab === 'umum'}
				<div class="space-y-6">
					<!-- A.1 Identitas & Profil -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							A.1 Profil & Struktur Keluarga
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="prestasi" class="block text-xs font-bold text-slate-700">1. Prestasi yang Pernah Diraih:</label>
								<textarea
									id="prestasi"
									disabled={isCompleted}
									bind:value={fd.prestasi}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Prestasi akademik / non-akademik / lomba yang pernah diikuti..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<span class="block text-xs font-bold text-slate-700">2. Struktur Saudara Kandung:</span>
								<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
									<span class="text-xs text-slate-600 font-medium">Anak ke-</span>
									<input
										type="number"
										min="1"
										max="20"
										disabled={isCompleted}
										bind:value={fd.anak_ke}
										class="w-16 px-2 py-1.5 text-center font-bold bg-white rounded-lg border border-slate-300 text-sm"
									/>
									<span class="text-xs text-slate-600 font-medium">dari</span>
									<input
										type="number"
										min="1"
										max="20"
										disabled={isCompleted}
										bind:value={fd.dari_bersaudara}
										class="w-16 px-2 py-1.5 text-center font-bold bg-white rounded-lg border border-slate-300 text-sm"
									/>
									<span class="text-xs text-slate-600 font-medium">bersaudara</span>
								</div>
							</div>
						</div>
					</div>

					<!-- A.2 Screening Perilaku & Keterampilan Digital -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							A.2 Screening Perilaku & Keterampilan Digital
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
							<!-- 3. Pacaran -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-slate-800">3. Riwayat Pacaran / Kedekatan Lawan Jenis:</span>
									<div class="flex gap-2">
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.pernah_pacaran = false; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												!fd.pernah_pacaran
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Tidak Pernah
										</button>
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.pernah_pacaran = true; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												fd.pernah_pacaran
													? 'bg-rose-700 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Pernah
										</button>
									</div>
								</div>
								<textarea
									disabled={isCompleted}
									bind:value={fd.catatan_pacaran}
									rows="2"
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Catatan pendalaman: pernah dekat, saling chat, atau sikap santri jika menyukai lawan jenis..."
								></textarea>
							</div>

							<!-- 4. Merokok / Vape -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-slate-800">4. Riwayat Merokok / Vape:</span>
									<div class="flex gap-2">
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.pernah_merokok = false; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												!fd.pernah_merokok
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Tidak Pernah
										</button>
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.pernah_merokok = true; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												fd.pernah_merokok
													? 'bg-rose-700 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Pernah
										</button>
									</div>
								</div>
								<textarea
									disabled={isCompleted}
									bind:value={fd.catatan_merokok}
									rows="2"
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Catatan pendalaman: apakah diajak teman, ada niat mencoba, atau lingkungan bergaul..."
								></textarea>
							</div>

							<!-- 5. Keterampilan Komputer -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-slate-800">5. Keterampilan Komputer:</span>
									<div class="flex gap-2">
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.bisa_komputer = true; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												fd.bisa_komputer
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Bisa
										</button>
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.bisa_komputer = false; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												!fd.bisa_komputer
													? 'bg-slate-700 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Belum Bisa
										</button>
									</div>
								</div>
								<input
									type="text"
									disabled={isCompleted}
									bind:value={fd.aplikasi_komputer}
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Aplikasi yang biasa digunakan (Word, Excel, Canva, Browsing, dll)..."
								/>
							</div>

							<!-- 6. Keterampilan Editing Desain -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold text-slate-800">6. Editing Video / Desain Grafis:</span>
									<div class="flex gap-2">
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.bisa_editing = true; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												fd.bisa_editing
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Bisa
										</button>
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.bisa_editing = false; triggerAutosave(); }}
											class={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] transition-all ${
												!fd.bisa_editing
													? 'bg-slate-700 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-600'
											}`}
										>
											Belum Bisa
										</button>
									</div>
								</div>
								<input
									type="text"
									disabled={isCompleted}
									bind:value={fd.aplikasi_editing}
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Aplikasi (CapCut, Photoshop, Premiere) & portofolio karya yang pernah dibuat..."
								/>
							</div>

							<!-- 7. Penyakit Alergi -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:col-span-2">
								<label for="penyakit-alergi" class="block text-xs font-bold text-slate-800">7. Riwayat Penyakit Bawaan / Alergi:</label>
								<input
									id="penyakit-alergi"
									type="text"
									disabled={isCompleted}
									bind:value={fd.penyakit_alergi}
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Sebutkan riwayat penyakit, asma, alergi makanan/obat (jika tidak ada kosongkan atau tulis 'Tidak Ada')..."
								/>
							</div>
						</div>
					</div>

					<!-- A.3 Sikap Sosial, Emosional & Anti-Bullying -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							A.3 Sikap Sosial, Emosional & Anti-Bullying
						</h3>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label for="respons-ejekan" class="block text-xs font-bold text-slate-800">
									8. Respons terhadap Ejekan/Gangguan Teman:
									<span class="font-normal text-slate-500 italic">("Apa yang akan kamu lakukan jika ada teman yang mengejek atau mengganggumu?")</span>
								</label>
								<textarea
									id="respons-ejekan"
									disabled={isCompleted}
									bind:value={fd.respons_ejekan}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Jawaban santri..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<label for="sikap-malas" class="block text-xs font-bold text-slate-800">
									9. Motivasi Mengatasi Kemalasan:
									<span class="font-normal text-slate-500 italic">("Apa yang akan kamu lakukan jika merasa malas mengikuti kegiatan pesantren?")</span>
								</label>
								<textarea
									id="sikap-malas"
									disabled={isCompleted}
									bind:value={fd.sikap_malas}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Jawaban santri..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<label for="sikap-teman-khusus" class="block text-xs font-bold text-slate-800">
									10. Empati & Sikap Inklusif (Anti-Bullying & ABK):
									<span class="font-normal text-slate-500 italic">("Jika teman kamu ada yang culun, bibir sumbing, anak mami, ABK, bodoh, gagap, cadel, apa yang kamu katakan dan bagaimana sikap kamu terhadap dia?")</span>
								</label>
								<textarea
									id="sikap-teman-khusus"
									disabled={isCompleted}
									bind:value={fd.sikap_terhadap_teman_khusus}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Jawaban santri..."
								></textarea>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<label for="pengalaman-pergaulan" class="block text-xs font-bold text-slate-800">
										11. Pengalaman Pergaulan Sebelumnya:
										<span class="font-normal text-slate-500 italic">("Pernah mengalami kejadian kurang menyenangkan?")</span>
									</label>
									<textarea
										id="pengalaman-pergaulan"
										disabled={isCompleted}
										bind:value={fd.pengalaman_pergaulan}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Jawaban santri..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="kebiasaan-berbicara" class="block text-xs font-bold text-slate-800">
										12. Kebiasaan Berbicara & Interaksi:
										<span class="font-normal text-slate-500 italic">("Apakah pernah berkata kasar/kotor atau menyakiti orang lain?")</span>
									</label>
									<textarea
										id="kebiasaan-berbicara"
										disabled={isCompleted}
										bind:value={fd.kebiasaan_berbicara}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Jawaban santri..."
									></textarea>
								</div>
							</div>
						</div>
					</div>

					<!-- A.4 Kemandirian & Kesiapan Mental Mondok -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							A.4 Kemandirian & Kesiapan Mental Mondok
						</h3>

						<div class="space-y-4">
							<!-- 13. Inisiatif Mondok -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<span class="block text-xs font-bold text-slate-800">13. Inisiatif Keputusan Masuk Pesantren:</span>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
									{#each ['Keinginan Sendiri', 'Keinginan Orang Tua', 'Keinginan Sendiri & Didukung Ortu'] as opt}
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.inisiatif_mondok = opt; triggerAutosave(); }}
											class={`p-3 rounded-xl font-bold text-xs min-h-[48px] transition-all text-center ${
												fd.inisiatif_mondok === opt
													? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
													: 'bg-white border border-slate-300 text-slate-700 hover:border-blue-400'
											}`}
										>
											{opt}
										</button>
									{/each}
								</div>
								<input
									type="text"
									disabled={isCompleted}
									bind:value={fd.catatan_inisiatif}
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Alasan santri ingin mondok / respon orang tua..."
								/>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<label for="manajemen-waktu" class="block text-xs font-bold text-slate-800">
										14. Manajemen Waktu Pribadi:
										<span class="font-normal text-slate-500 italic">("Cara mengatur belajar, ibadah, istirahat...")</span>
									</label>
									<textarea
										id="manajemen-waktu"
										disabled={isCompleted}
										bind:value={fd.manajemen_waktu}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Jawaban santri..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="tantangan-kemandirian" class="block text-xs font-bold text-slate-800">
										15. Tantangan Kemandirian Terbesar:
										<span class="font-normal text-slate-500 italic">("Hal paling sulit saat jauh dari orang tua?")</span>
									</label>
									<textarea
										id="tantangan-kemandirian"
										disabled={isCompleted}
										bind:value={fd.tantangan_kemandirian}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Jawaban santri..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="kebiasaan-diperbaiki" class="block text-xs font-bold text-slate-800">
										16. Refleksi Kebiasaan yang Ingin Diperbaiki:
									</label>
									<textarea
										id="kebiasaan-diperbaiki"
										disabled={isCompleted}
										bind:value={fd.kebiasaan_diperbaiki}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Sikap atau kebiasaan buruk yang ingin diubah setelah di pondok..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="kebersihan-kamar" class="block text-xs font-bold text-slate-800">
										17. Kebersihan Kamar & Barang Pribadi:
									</label>
									<textarea
										id="kebersihan-kamar"
										disabled={isCompleted}
										bind:value={fd.kebersihan_kamar}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Kebiasaan merapikan kasur, mencuci pakaian, menjaga kebersihan..."
									></textarea>
								</div>
							</div>

							<!-- 18. Penggunaan Gadget / HP -->
							<div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
								<span class="block text-xs font-bold text-slate-800">18. Intensitas Penggunaan Gadget / HP dalam Sehari:</span>
								<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
									{#each ['< 1 Jam', '1-2 Jam', '2-4 Jam', '> 5 Jam'] as dur}
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { fd.durasi_gadget = dur; triggerAutosave(); }}
											class={`p-2.5 rounded-xl font-bold text-xs min-h-[44px] transition-all text-center ${
												fd.durasi_gadget === dur
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-slate-300 text-slate-700'
											}`}
										>
											{dur}
										</button>
									{/each}
								</div>
								<input
									type="text"
									disabled={isCompleted}
									bind:value={fd.rincian_gadget}
									class="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Biasanya digunakan untuk apa saja (game apa, medsos apa, belajar apa)..."
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 2: WAWANCARA KEPESANTRENAN -->
			{#if activeTab === 'pesantren'}
				<div class="space-y-6">
					<!-- B.1 Capaian Riil -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
							B.1 Portofolio Riil Al-Qur'an & Kitab
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="hafalan-juz" class="block text-xs font-bold text-slate-800">
									19. Capaian Hafalan Al-Qur'an Riil:
								</label>
								<input
									id="hafalan-juz"
									type="text"
									disabled={isCompleted}
									bind:value={fd.hafalan_juz}
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Contoh: 3 Juz (Juz 30, Juz 29, Surat Al-Baqarah 1-50)..."
								/>
							</div>

							<div class="space-y-1.5">
								<label for="kitab-dipelajari" class="block text-xs font-bold text-slate-800">
									20. Judul Kitab yang Pernah Dipelajari:
								</label>
								<input
									id="kitab-dipelajari"
									type="text"
									disabled={isCompleted}
									bind:value={fd.kitab_dipelajari}
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Contoh: Safinatun Najah, Jurumiyah, Mabadi Fiqhiyah, Al-Ajrumiyah..."
								/>
							</div>
						</div>
					</div>

					<!-- B.2 Komitmen Spiritual & Kedisiplinan -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
							B.2 Wawancara Komitmen Spiritual & Kedisiplinan
						</h3>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label for="motivasi-masuk" class="block text-xs font-bold text-slate-800">
									21. Motivasi Utama:
									<span class="font-normal text-slate-500 italic">("Alasan sebenarnya kamu ingin masuk pesantren?")</span>
								</label>
								<textarea
									id="motivasi-masuk"
									disabled={isCompleted}
									bind:value={fd.motivasi_masuk}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Jawaban santri..."
								></textarea>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="space-y-1.5">
									<label for="salat-lima-waktu" class="block text-xs font-bold text-slate-800">
										22. Konsistensi Salat 5 Waktu:
									</label>
									<textarea
										id="salat-lima-waktu"
										disabled={isCompleted}
										bind:value={fd.salat_lima_waktu}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Apakah rutin berjamaah, bolong-bolong, atau harus diingatkan..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="membaca-quran" class="block text-xs font-bold text-slate-800">
										23. Kebiasaan Membaca Al-Qur'an:
									</label>
									<textarea
										id="membaca-quran"
										disabled={isCompleted}
										bind:value={fd.membaca_quran}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Seberapa sering membaca (harian, mingguan, ba'da maghrib)..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="menerima-teguran" class="block text-xs font-bold text-slate-800">
										24. Sikap Menerima Teguran/Nasihat:
									</label>
									<textarea
										id="menerima-teguran"
										disabled={isCompleted}
										bind:value={fd.menerima_teguran}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Respons ketika mendapatkan teguran dari guru atau ustadz..."
									></textarea>
								</div>

								<div class="space-y-1.5">
									<label for="beda-pendapat" class="block text-xs font-bold text-slate-800">
										25. Penyelesaian Perbedaan Pendapat:
									</label>
									<textarea
										id="beda-pendapat"
										disabled={isCompleted}
										bind:value={fd.beda_pendapat}
										rows="2"
										class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
										placeholder="Cara menyikapi jika tidak setuju dengan pendapat teman asrama..."
									></textarea>
								</div>
							</div>

							<div class="space-y-1.5">
								<label for="ibadah-malam" class="block text-xs font-bold text-slate-800">
									26. Kesiapan Rutinitas Ibadah Malam & Halaqah:
									<span class="font-normal text-slate-500 italic">("Bagaimana perasaan kamu jika harus mengikuti tahajud, zikir, kajian rutin?")</span>
								</label>
								<textarea
									id="ibadah-malam"
									disabled={isCompleted}
									bind:value={fd.ibadah_malam}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Kesiapan fisik dan mental bangun pagi dan disiplin halaqah..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<label for="bukti-kesiapan" class="block text-xs font-bold text-slate-800">
									27. Bukti Kesiapan Nyata Santri (Pernyataan Komitmen):
									<span class="font-normal text-slate-500 italic">("Bukti konkret bahwa kamu siap menjadi santri, bukan hanya ingin diterima?")</span>
								</label>
								<textarea
									id="bukti-kesiapan"
									disabled={isCompleted}
									bind:value={fd.bukti_kesiapan}
									rows="2"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Pernyataan komitmen santri..."
								></textarea>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 3: DOSSIER & REKOMENDASI -->
			{#if activeTab === 'dossier'}
				<div class="space-y-6">
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-5">
						<div class="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
									<FileText class="w-5 h-5 text-blue-700" />
									Dossier Wawancara & Rekomendasi Pleno
								</h3>
								<p class="text-xs text-slate-500">
									Catatan kualitatif penguji untuk pertimbangan Dewan Penguji pada Sidang Pleno Kelulusan
								</p>
							</div>
						</div>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label for="summary-umum" class="block text-xs font-bold text-slate-800">
									Catatan Profil Umum, Karakter & Kemandirian Santri:
								</label>
								<textarea
									id="summary-umum"
									disabled={isCompleted}
									bind:value={studentGeneralSummary}
									rows="3"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Ringkasan penguji terkait kepribadian, kestabilan emosi, dan kesiapan hidup mandiri..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<label for="summary-pesantren" class="block text-xs font-bold text-slate-800">
									Catatan Kesiapan Asrama & Komitmen Spiritual:
								</label>
								<textarea
									id="summary-pesantren"
									disabled={isCompleted}
									bind:value={studentPesantrenSummary}
									rows="3"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Ringkasan penguji terkait motivasi beribadah, adab, dan adaptasi berasrama..."
								></textarea>
							</div>

							<div class="space-y-1.5">
								<label for="summary-ortu" class="block text-xs font-bold text-slate-800">
									Catatan Komitmen & Kesediaan Orang Tua / Wali:
								</label>
								<textarea
									id="summary-ortu"
									disabled={isCompleted}
									bind:value={parentCommitmentSummary}
									rows="3"
									class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Ringkasan komitmen orang tua terhadap pembiayaan, aturan kunjungan, dan tata tertib..."
								></textarea>
							</div>

							<!-- Rekomendasi Khusus Penguji (Highlight) -->
							<div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
								<label for="rekomendasi-khusus" class="block text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
									<Sparkles class="w-4 h-4 text-blue-700" />
									Rekomendasi Khusus Penguji untuk Sidang Pleno:
								</label>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each [
										'Sangat direkomendasikan masuk kuota utama',
										'Direkomendasikan dengan pemantauan disiplin',
										'Direkomendasikan dengan bimbingan tahsin khusus',
										'Pertimbangkan masuk daftar antrean (waiting list)'
									] as preset}
										<button
											type="button"
											disabled={isCompleted}
											onclick={() => { specialRecommendation = preset; triggerAutosave(); }}
											class={`p-2.5 rounded-lg text-xs font-semibold text-left transition-all min-h-[40px] flex items-center gap-2 ${
												specialRecommendation === preset
													? 'bg-blue-800 text-white shadow-xs'
													: 'bg-white border border-blue-200 text-blue-950 hover:bg-blue-100/50'
											}`}
										>
											<span class="w-2 h-2 rounded-full {specialRecommendation === preset ? 'bg-white' : 'bg-blue-600'}"></span>
											<span>{preset}</span>
										</button>
									{/each}
								</div>

								<textarea
									id="rekomendasi-khusus"
									disabled={isCompleted}
									bind:value={specialRecommendation}
									rows="2"
									class="w-full p-3 text-sm bg-white rounded-xl border border-blue-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
									placeholder="Tuliskan rekomendasi atau catatan khusus penguji..."
								></textarea>
							</div>

							<!-- Pewawancara Field -->
							<div class="pt-2 space-y-1.5">
								<label for="pewawancara-name" class="block text-xs font-bold text-slate-700">Nama Pewawancara:</label>
								<input
									id="pewawancara-name"
									type="text"
									disabled={isCompleted}
									bind:value={interviewerName}
									class="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
									placeholder="Nama pewawancara..."
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Bottom Sticky Actions Bar (Tablet Touch Optimized - min 48px) -->
			<div class="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
				<div class="flex items-center gap-2 text-xs text-slate-600">
					<Info class="w-4 h-4 text-blue-700 shrink-0" />
					<span>Autosave aktif. Seluruh catatan tersimpan otomatis saat penguji mengetik.</span>
				</div>

				{#if !isCompleted}
					<div class="flex items-center gap-3 w-full sm:w-auto">
						<button
							type="submit"
							formaction="?/saveDraft"
							class="flex-1 sm:flex-initial px-5 py-3 rounded-xl border-2 border-blue-700 text-blue-800 hover:bg-blue-50 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
						>
							<Save class="w-4 h-4" />
							<span>Simpan Draf</span>
						</button>

						<button
							type="submit"
							formaction="?/complete"
							class="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-800 text-white hover:bg-blue-900 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-blue-950/20"
						>
							<Check class="w-4 h-4" />
							<span>Tandai Selesai & Kunci Dossier</span>
						</button>
					</div>
				{:else}
					<div class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
						Dossier wawancara peserta ini telah lengkap & terkunci.
					</div>
				{/if}
			</div>
		</form>
	{:else}
		<div class="bg-white rounded-2xl p-12 text-center border border-slate-200">
			<AlertCircle class="w-12 h-12 text-slate-400 mx-auto mb-3" />
			<h3 class="font-bold text-slate-800 text-lg">Tidak Ada Data Peserta</h3>
			<p class="text-xs text-slate-500 mt-1">Belum ada peserta seleksi aktif yang terdaftar di sistem.</p>
		</div>
	{/if}
</div>