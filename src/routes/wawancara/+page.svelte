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
		Info,
		ArrowLeft,
		ArrowRight,
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		X,
		Users,
		Building2,
		GraduationCap,
		Plus,
		Trash2
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state('');
	let showCompleteModal = $state(false);
	let showCandidateModal = $state(false);

	// Modal Filters
	let modalSearch = $state('');
	let modalFilterStatus = $state<'ALL' | 'UNSCORED' | 'DRAFT' | 'LOCKED'>('ALL');
	let modalFilterRoom = $state('ALL');
	let modalFilterMajor = $state('ALL');

	let activeTab = $state<'santri' | 'ortu' | 'rekomendasi'>('santri');
	let autosaveStatus = $state<'saved' | 'saving' | 'idle'>('idle');
	let lastSavedTime = $state<string>('');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSavedSnapshot = $state('');

	let customSelectedId = $state<string | null>(null);
	let selectedCandidateId = $derived(
		customSelectedId ?? data.selectedCandidate?.id ?? data.candidates[0]?.id ?? ''
	);
	let currentCandidate = $derived(
		data.candidates.find((c) => c.id === selectedCandidateId) || data.selectedCandidate
	);
	let interviewData = $derived(currentCandidate?.interview);
	let isCompleted = $derived(interviewData?.completionStatus === 'COMPLETED');

	// Interviewer
	let interviewerName = $state('Dra. Hj. Siti Aminah');

	// Form Data Default Constant (Umum & Karakter, Kepesantrenan, dan Orang Tua)
	const DEFAULT_FORM_DATA = {
		// Data Dasar & Screening
		prestasi: '',
		anak_ke: 1,
		dari_bersaudara: 3,

		// STIFIn (Mesin Kecerdasan & Karakter)
		stifin_category: '',
		stifin_type: '',
		stifin_notes: '',

		// Screening Perilaku & Keterampilan
		pernah_pacaran: false,
		catatan_pacaran: '',
		pernah_merokok: false,
		catatan_merokok: '',
		bisa_komputer: true,
		aplikasi_komputer: 'Word, Browsing',
		bisa_editing: false,
		aplikasi_editing: '',
		penyakit_alergi: '',
		durasi_gadget: '2-3 Jam',
		rincian_gadget: '',

		// A. Poin Pertanyaan Wawancara Umum Santri (Dinamis)
		student_general_qa: [
			{ question: 'Inisiatif mondok & motivasi pribadi santri', answer: 'Keinginan Sendiri & Didukung Ortu' },
			{ question: 'Prestasi yang pernah diraih santri (akademik / non-akademik)', answer: '' },
			{ question: 'Kebiasaan berbicara, interaksi, dan pergaulan sehari-hari', answer: '' },
			{ question: 'Tantangan kemandirian, kedisiplinan, dan kebersihan diri', answer: '' },
			{ question: 'Sikap santri saat menghadapi rasa malas atau bosan', answer: '' },
			{ question: 'Respons santri terhadap ejekan atau perselisihan dengan teman', answer: '' }
		],

		// B. Poin Pertanyaan Wawancara Kepesantrenan (Dinamis)
		student_pesantren_qa: [
			{ question: 'Capaian hafalan Al-Qur\'an riil santri (juz/surat)', answer: '' },
			{ question: 'Judul kitab / materi dasar keislaman yang pernah dipelajari', answer: '' },
			{ question: 'Alasan dan motivasi utama memilih masuk pondok pesantren', answer: '' },
			{ question: 'Konsistensi salat fardu 5 waktu & kebiasaan tilawah Al-Qur\'an', answer: '' },
			{ question: 'Kesiapan mengikuti rutinitas ibadah malam (tahajud) & halaqah rutin', answer: '' },
			{ question: 'Sikap santri saat menerima teguran/nasihat dari ustadz dan musrif', answer: '' },
			{ question: 'Pernyataan komitmen & bukti kesiapan nyata siap beradaptasi di asrama', answer: '' }
		],

		// C. Poin Pertanyaan Wawancara Orang Tua / Wali (Dinamis)
		parent_qa: [
			{ question: 'Bagaimana komitmen pembiayaan pendidikan santri selama di pesantren?', answer: '' },
			{ question: 'Apakah ananda memiliki riwayat kesehatan khusus, alergi berat, atau kebutuhan pemantauan khusus?', answer: '' },
			{ question: 'Bagaimana kesiapan orang tua mendukung kemandirian ananda dan mentaati tata tertib kunjungan asrama?', answer: '' }
		]
	};

	let fd = $state<Record<string, any>>({ ...DEFAULT_FORM_DATA });

	// Summaries & Recommendation
	let studentGeneralSummary = $state('');
	let studentPesantrenSummary = $state('');
	let parentCommitmentSummary = $state('');
	let specialRecommendation = $state('Sangat direkomendasikan masuk kuota utama');

	function addStudentGeneralQuestion(defaultQuestion = '') {
		if (!fd.student_general_qa) fd.student_general_qa = [];
		fd.student_general_qa = [
			...fd.student_general_qa,
			{ question: defaultQuestion || '', answer: '' }
		];
		triggerAutosave();
	}

	function removeStudentGeneralQuestion(index: number) {
		if (!fd.student_general_qa) return;
		fd.student_general_qa = fd.student_general_qa.filter((_: any, i: number) => i !== index);
		triggerAutosave();
	}

	function addStudentPesantrenQuestion(defaultQuestion = '') {
		if (!fd.student_pesantren_qa) fd.student_pesantren_qa = [];
		fd.student_pesantren_qa = [
			...fd.student_pesantren_qa,
			{ question: defaultQuestion || '', answer: '' }
		];
		triggerAutosave();
	}

	function removeStudentPesantrenQuestion(index: number) {
		if (!fd.student_pesantren_qa) return;
		fd.student_pesantren_qa = fd.student_pesantren_qa.filter((_: any, i: number) => i !== index);
		triggerAutosave();
	}

	function addParentQuestion(defaultQuestion = '') {
		if (!fd.parent_qa) fd.parent_qa = [];
		fd.parent_qa = [
			...fd.parent_qa,
			{ question: defaultQuestion || '', answer: '' }
		];
		triggerAutosave();
	}

	function removeParentQuestion(index: number) {
		if (!fd.parent_qa) return;
		fd.parent_qa = fd.parent_qa.filter((_: any, i: number) => i !== index);
		triggerAutosave();
	}

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
						const raw = inv.formData as Record<string, any>;
						fd = {
							...DEFAULT_FORM_DATA,
							...raw,
							student_general_qa: Array.isArray(raw.student_general_qa) && raw.student_general_qa.length > 0
								? raw.student_general_qa
								: [
									{ question: 'Inisiatif mondok & motivasi pribadi santri', answer: raw.inisiatif_mondok || 'Keinginan Sendiri & Didukung Ortu' },
									{ question: 'Prestasi yang pernah diraih santri (akademik / non-akademik)', answer: raw.prestasi || '' },
									{ question: 'Kebiasaan berbicara, interaksi, dan pergaulan sehari-hari', answer: raw.kebiasaan_berbicara || '' },
									{ question: 'Tantangan kemandirian, kedisiplinan, dan kebersihan diri', answer: raw.tantangan_kemandirian || '' },
									{ question: 'Sikap santri saat menghadapi rasa malas atau bosan', answer: raw.sikap_malas || '' },
									{ question: 'Respons santri terhadap ejekan atau perselisihan dengan teman', answer: raw.respons_ejekan || '' }
								],
							student_pesantren_qa: Array.isArray(raw.student_pesantren_qa) && raw.student_pesantren_qa.length > 0
								? raw.student_pesantren_qa
								: [
									{ question: 'Capaian hafalan Al-Qur\'an riil santri (juz/surat)', answer: raw.hafalan_juz || '' },
									{ question: 'Judul kitab / materi dasar keislaman yang pernah dipelajari', answer: raw.kitab_dipelajari || '' },
									{ question: 'Alasan dan motivasi utama memilih masuk pondok pesantren', answer: raw.motivasi_masuk || '' },
									{ question: 'Konsistensi salat fardu 5 waktu & kebiasaan tilawah Al-Qur\'an', answer: raw.salat_lima_waktu || '' },
									{ question: 'Kesiapan mengikuti rutinitas ibadah malam (tahajud) & halaqah rutin', answer: raw.ibadah_malam || '' },
									{ question: 'Sikap santri saat menerima teguran/nasihat dari ustadz dan musrif', answer: raw.menerima_teguran || '' },
									{ question: 'Pernyataan komitmen & bukti kesiapan nyata siap beradaptasi di asrama', answer: raw.bukti_kesiapan || '' }
								],
							parent_qa: Array.isArray(raw.parent_qa) && raw.parent_qa.length > 0
								? raw.parent_qa
								: [...DEFAULT_FORM_DATA.parent_qa]
						};
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

				lastSavedSnapshot = JSON.stringify({
					candidateId: candidate.id,
					formData: fd,
					studentGeneralSummary,
					studentPesantrenSummary,
					parentCommitmentSummary,
					specialRecommendation,
					interviewerName,
					isCompleted: false
				});
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
		showCandidateModal = false;
		customSelectedId = id;
		goto(`/wawancara?candidateId=${id}`, { replace: true, reset: false });
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

			const status = c.interview?.completionStatus;
			let matchStatus = true;
			if (modalFilterStatus === 'LOCKED') matchStatus = status === 'COMPLETED';
			else if (modalFilterStatus === 'DRAFT') matchStatus = status === 'IN_PROGRESS';
			else if (modalFilterStatus === 'UNSCORED') matchStatus = !status;

			const matchRoom = modalFilterRoom === 'ALL' || c.roomAssignment === modalFilterRoom;
			const matchMajor = modalFilterMajor === 'ALL' || c.majorChoice === modalFilterMajor;

			return matchSearch && matchStatus && matchRoom && matchMajor;
		})
	);

	function goToPrev() {
		if (prevCandidate) selectCandidate(prevCandidate.id);
	}

	function goToNext() {
		if (nextCandidate) selectCandidate(nextCandidate.id);
	}

	// Trigger autosave on field change with dirty checking
	function triggerAutosave() {
		if (isCompleted || !currentCandidate) return;

		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(async () => {
			try {
				const payload = {
					candidateId: currentCandidate.id,
					formData: fd,
					studentGeneralSummary,
					studentPesantrenSummary,
					parentCommitmentSummary,
					specialRecommendation,
					interviewerName,
					isCompleted: false
				};
				const payloadStr = JSON.stringify(payload);

				// Dirty check: lewati request jika payload tidak berubah sama sekali
				if (payloadStr === lastSavedSnapshot) {
					autosaveStatus = 'saved';
					return;
				}

				autosaveStatus = 'saving';
				const res = await fetch('/api/wawancara', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: payloadStr
				});

				if (res.ok) {
					lastSavedSnapshot = payloadStr;
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
			<a
				href={currentCandidate ? `/rubrik?candidateId=${currentCandidate.id}` : '/rubrik'}
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium transition"
			>
				<span>2. Kepesantrenan &rarr;</span>
			</a>
			<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold shadow-2xs">
				3. Wawancara
			</span>
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
								{#if isCompleted}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
										<CheckCircle2 class="w-3 h-3 text-emerald-600" />
										<span>Selesai</span>
									</span>
								{:else if currentCandidate.interview?.completionStatus === 'IN_PROGRESS'}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold shrink-0">
										<Clock class="w-3 h-3 text-blue-600" />
										<span>Sedang Diisi</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold shrink-0">
										<span>Belum Dimulai</span>
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
					<!-- Action: Pilih Santri button -->
					<div class="flex items-center gap-2">
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
							<span>Selesai</span>
						</div>
					{:else}
						<div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
							<Unlock class="w-3.5 h-3.5 text-blue-600" />
							<span>Sesi Aktif</span>
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
			<div class="grid grid-cols-1 md:grid-cols-3 gap-2">
				<button
					type="button"
					onclick={() => (activeTab = 'santri')}
					class={`py-3 px-3 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'santri'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<User class="w-4 h-4" />
					<span>1. Wawancara Santri (Umum & Pesantren)</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'ortu')}
					class={`py-3 px-3 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'ortu'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<Users class="w-4 h-4" />
					<span>2. Wawancara Orang Tua</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'rekomendasi')}
					class={`py-3 px-3 rounded-xl font-bold text-xs md:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all select-none ${
						activeTab === 'rekomendasi'
							? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-500/40'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
					}`}
				>
					<FileText class="w-4 h-4" />
					<span>3. Ringkasan & Rekomendasi</span>
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

			<!-- TAB 1: WAWANCARA SANTRI (UMUM & KEPESANTRENAN) -->
			{#if activeTab === 'santri'}
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

					<!-- A.2 Hasil Tes STIFIn (Mesin Kecerdasan) -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
							<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
								<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
								A.2 Hasil Tes STIFIn (Mesin Kecerdasan)
							</h3>
							<span class="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
								Tipologi Karakter & Gaya Belajar Santri
							</span>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="stifin-category" class="block text-xs font-bold text-slate-700">
									Mesin Kecerdasan:
								</label>
								<select
									id="stifin-category"
									disabled={isCompleted}
									bind:value={fd.stifin_category}
									class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
								>
									<option value="">-- Pilih Mesin Kecerdasan --</option>
									<option value="Sensing">S - Sensing</option>
									<option value="Thinking">T - Thinking</option>
									<option value="Intuiting">I - Intuiting</option>
									<option value="Feeling">F - Feeling</option>
									<option value="Instinct">In - Instinct</option>
								</select>
							</div>

							<div class="space-y-1.5">
								<label for="stifin-type" class="block text-xs font-bold text-slate-700">
									Tipe Karakter / Personality:
								</label>
								<select
									id="stifin-type"
									disabled={isCompleted}
									bind:value={fd.stifin_type}
									class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
								>
									<option value="">-- Pilih Tipe Karakter --</option>
									<option value="Si">Si - Sensing Introvert</option>
									<option value="Se">Se - Sensing Extrovert</option>
									<option value="Ti">Ti - Thinking Introvert</option>
									<option value="Te">Te - Thinking Extrovert</option>
									<option value="Ii">Ii - Intuiting Introvert</option>
									<option value="Ie">Ie - Intuiting Extrovert</option>
									<option value="Fi">Fi - Feeling Introvert</option>
									<option value="Fe">Fe - Feeling Extrovert</option>
									<option value="In">In - Instinct</option>
									<option value="Belum Tes">Belum Tes - Belum Mengikuti Tes STIFIn</option>
								</select>
							</div>

							<div class="space-y-1.5 md:col-span-2">
								<label for="stifin-notes" class="block text-xs font-bold text-slate-700">
									Catatan Hasil Tes STIFIn / Gaya Belajar:
								</label>
								<input
									type="text"
									id="stifin-notes"
									disabled={isCompleted}
									bind:value={fd.stifin_notes}
									placeholder="Contoh: Belajar optimal dengan stimulus visual, butuh target terukur..."
									class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
								/>
							</div>
						</div>
					</div>

					<!-- A.3 Screening Perilaku & Keterampilan Digital -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
							A.3 Screening Perilaku & Keterampilan Digital
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

					<!-- A.4 Poin Pertanyaan Wawancara Umum & Karakter Santri (Dinamis) -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-5">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
							<div>
								<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
									<User class="w-5 h-5 text-blue-700" />
									A.4 Poin Pertanyaan Wawancara Umum & Karakter Santri
								</h3>
								<p class="text-xs text-slate-500 mt-0.5">
									Pertanyaan dan respons santri dapat diedit bebas atau ditambah butir baru oleh penguji.
								</p>
							</div>

							{#if !isCompleted}
								<button
									type="button"
									onclick={() => addStudentGeneralQuestion()}
									class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs shadow-blue-700/20 shrink-0 self-start sm:self-auto"
								>
									<Plus class="w-4 h-4" />
									<span>Tambah Pertanyaan</span>
								</button>
							{/if}
						</div>

						<!-- Quick Template Chips (Umum) -->
						{#if !isCompleted}
							<div class="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
								<span class="text-[11px] font-bold text-blue-900 block">Templat Pertanyaan Cepat (Klik untuk menambah):</span>
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Inisiatif mondok & motivasi pribadi santri')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Inisiatif Mondok
									</button>
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Bagaimana cara santri mengatasi rasa malas, bosan, atau jenuh saat belajar?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Mengatasi Kemalasan
									</button>
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Apa yang kamu lakukan jika ada teman yang mengejek, mengganggu, atau berbeda watak?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Respons Bullying & Konflik
									</button>
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Bagaimana sikap santri terhadap teman yang memiliki kekurangan fisik atau berkebutuhan khusus?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Empati & Anti-Bullying
									</button>
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Bagaimana kebiasaan berbicara santri (apakah pernah berkata kasar/kotor)?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Kebiasaan Berbicara
									</button>
									<button
										type="button"
										onclick={() => addStudentGeneralQuestion('Apa tantangan kemandirian terbesar santri ketika jauh dari orang tua (mandi, cuci, bangun pagi)?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Kemandirian Pribadi
									</button>
								</div>
							</div>
						{/if}

						<!-- Daftar Pertanyaan Dinamis Santri Umum -->
						<div class="space-y-4 pt-1">
							{#if !fd.student_general_qa || fd.student_general_qa.length === 0}
								<div class="py-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
									<User class="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
									<p class="text-xs font-semibold text-slate-600">Belum ada butir pertanyaan wawancara umum santri</p>
									<p class="text-[11px] text-slate-400 mt-1">Klik "+ Tambah Pertanyaan" atau pilih templat cepat di atas.</p>
								</div>
							{:else}
								{#each fd.student_general_qa as qa, idx}
									<div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
										<div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
											<div class="flex items-center gap-2">
												<span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
													{idx + 1}
												</span>
												<span class="text-xs font-bold text-slate-700">Pertanyaan Umum #{idx + 1}</span>
											</div>

											{#if !isCompleted}
												<button
													type="button"
													onclick={() => removeStudentGeneralQuestion(idx)}
													class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
													title="Hapus pertanyaan ini"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											{/if}
										</div>

										<div class="space-y-2.5">
											<div>
												<label for={`gen-q-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Teks Pertanyaan / Topik:
												</label>
												<input
													id={`gen-q-${idx}`}
													type="text"
													disabled={isCompleted}
													bind:value={qa.question}
													placeholder="Ketik topik pertanyaan umum santri..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
												/>
											</div>

											<div>
												<label for={`gen-a-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Jawaban / Respons Santri:
												</label>
												<textarea
													id={`gen-a-${idx}`}
													disabled={isCompleted}
													bind:value={qa.answer}
													rows="2"
													placeholder="Ketik catatan respons santri..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
												></textarea>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>

					<!-- PEMBATAS VISUAL KEPESANTRENAN -->
					<div class="relative py-6 my-2">
						<div class="absolute inset-0 flex items-center" aria-hidden="true">
							<div class="w-full border-t-2 border-emerald-300"></div>
						</div>
						<div class="relative flex justify-center">
							<span class="bg-emerald-50 text-emerald-900 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider border-2 border-emerald-300 flex items-center gap-2.5 shadow-sm">
								<BookOpen class="w-4 h-4 text-emerald-700" />
								<span>Bagian B: Kesiapan & Wawancara Kepesantrenan</span>
							</span>
						</div>
					</div>

					<!-- B.1 Capaian Riil Al-Qur'an & Kitab -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-4">
						<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-3">
							<span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
							B.1 Portofolio Riil Al-Qur'an & Kitab
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="hafalan-juz" class="block text-xs font-bold text-slate-800">
									Capaian Hafalan Al-Qur'an Riil:
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
									Judul Kitab yang Pernah Dipelajari:
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

					<!-- B.2 Poin Pertanyaan Wawancara Kepesantrenan (Dinamis) -->
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-5">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
							<div>
								<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
									<BookOpen class="w-5 h-5 text-emerald-700" />
									B.2 Poin Pertanyaan Wawancara Kepesantrenan
								</h3>
								<p class="text-xs text-slate-500 mt-0.5">
									Pertanyaan komitmen ibadah, adab, dan adaptasi kepesantrenan dapat diedit atau ditambah bebas.
								</p>
							</div>

							{#if !isCompleted}
								<button
									type="button"
									onclick={() => addStudentPesantrenQuestion()}
									class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs shadow-emerald-700/20 shrink-0 self-start sm:self-auto"
								>
									<Plus class="w-4 h-4" />
									<span>Tambah Pertanyaan</span>
								</button>
							{/if}
						</div>

						<!-- Quick Template Chips (Pesantren) -->
						{#if !isCompleted}
							<div class="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
								<span class="text-[11px] font-bold text-emerald-900 block">Templat Pertanyaan Cepat (Klik untuk menambah):</span>
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Alasan dan motivasi utama memilih masuk pondok pesantren')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Motivasi Masuk Pondok
									</button>
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Konsistensi salat fardu 5 waktu & kebiasaan tilawah Al-Qur\'an')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Konsistensi Salat & Tilawah
									</button>
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Kesiapan mengikuti rutinitas ibadah malam (tahajud) & halaqah rutin')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Ibadah Malam & Halaqah
									</button>
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Sikap santri saat menerima teguran atau nasihat dari ustadz dan musrif')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Sikap Menerima Nasihat
									</button>
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Cara menyelesaikan jika ada perbedaan pendapat dengan teman asrama')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Toleransi & Beda Pendapat
									</button>
									<button
										type="button"
										onclick={() => addStudentPesantrenQuestion('Pernyataan komitmen & bukti kesiapan nyata siap beradaptasi di asrama')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
									>
										+ Bukti Kesiapan Nyata
									</button>
								</div>
							</div>
						{/if}

						<!-- Daftar Pertanyaan Dinamis Pesantren -->
						<div class="space-y-4 pt-1">
							{#if !fd.student_pesantren_qa || fd.student_pesantren_qa.length === 0}
								<div class="py-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
									<BookOpen class="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
									<p class="text-xs font-semibold text-slate-600">Belum ada butir pertanyaan kepesantrenan</p>
									<p class="text-[11px] text-slate-400 mt-1">Klik "+ Tambah Pertanyaan" atau pilih templat cepat di atas.</p>
								</div>
							{:else}
								{#each fd.student_pesantren_qa as qa, idx}
									<div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
										<div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
											<div class="flex items-center gap-2">
												<span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
													{idx + 1}
												</span>
												<span class="text-xs font-bold text-slate-700">Pertanyaan Kepesantrenan #{idx + 1}</span>
											</div>

											{#if !isCompleted}
												<button
													type="button"
													onclick={() => removeStudentPesantrenQuestion(idx)}
													class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
													title="Hapus pertanyaan ini"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											{/if}
										</div>

										<div class="space-y-2.5">
											<div>
												<label for={`pes-q-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Teks Pertanyaan / Topik:
												</label>
												<input
													id={`pes-q-${idx}`}
													type="text"
													disabled={isCompleted}
													bind:value={qa.question}
													placeholder="Ketik topik pertanyaan kepesantrenan..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
												/>
											</div>

											<div>
												<label for={`pes-a-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Jawaban / Respons Santri:
												</label>
												<textarea
													id={`pes-a-${idx}`}
													disabled={isCompleted}
													bind:value={qa.answer}
													rows="2"
													placeholder="Ketik catatan respons santri..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
												></textarea>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>

					<!-- Navigasi Stepper Lanjut ke Wawancara Ortu -->
					<div class="pt-4 flex justify-end">
						<button
							type="button"
							onclick={() => { activeTab = 'ortu'; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
							class="px-5 py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-950/20 transition min-h-[44px]"
						>
							<span>Lanjut ke Wawancara Orang Tua</span>
							<ArrowRight class="w-4 h-4" />
						</button>
					</div>
				</div>
			{/if}

			<!-- TAB 2: WAWANCARA ORANG TUA -->
			{#if activeTab === 'ortu'}
				<div class="space-y-6">
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-5">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
							<div>
								<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
									<Users class="w-5 h-5 text-blue-700" />
									Wawancara Orang Tua / Wali
								</h3>
								<p class="text-xs text-slate-500 mt-0.5">
									Pertanyaan dan jawaban bebas diisi serta dapat ditambah atau diedit bebas oleh penguji/admin.
								</p>
							</div>

							{#if !isCompleted}
								<button
									type="button"
									onclick={() => addParentQuestion()}
									class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs shadow-blue-700/20 shrink-0 self-start sm:self-auto"
								>
									<Plus class="w-4 h-4" />
									<span>Tambah Pertanyaan</span>
								</button>
							{/if}
						</div>

						<!-- Quick Template Chips (untuk kemudahan admin) -->
						{#if !isCompleted}
							<div class="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
								<span class="text-[11px] font-bold text-blue-900 block">Templat Pertanyaan Cepat (Klik untuk menambah):</span>
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										onclick={() => addParentQuestion('Bagaimana komitmen pembiayaan SPP, uang pangkal, dan kebutuhan santri selama masa studi?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Komitmen Pembiayaan
									</button>
									<button
										type="button"
										onclick={() => addParentQuestion('Bagaimana kesiapan orang tua mendukung disiplin asrama dan mematuhi jadwal kunjungan (tidak sering menjenguk)?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Kepatuhan Disiplin & Kunjungan
									</button>
									<button
										type="button"
										onclick={() => addParentQuestion('Apakah ananda memiliki riwayat trauma psikologis, alergi khusus, atau penyakit kronis yang perlu pantauan khusus?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Riwayat Kesehatan & Alergi
									</button>
									<button
										type="button"
										onclick={() => addParentQuestion('Bagaimana pola asuh dan komunikasi antara orang tua dengan ananda selama di rumah?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Pola Asuh di Rumah
									</button>
									<button
										type="button"
										onclick={() => addParentQuestion('Apa harapan terbesar orang tua terhadap perkembangan akhlak dan akademik ananda setelah masuk pondok?')}
										class="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
									>
										+ Harapan untuk Santri
									</button>
								</div>
							</div>
						{/if}

						<!-- Daftar Pertanyaan & Jawaban Bebas -->
						<div class="space-y-4 pt-1">
							{#if !fd.parent_qa || fd.parent_qa.length === 0}
								<div class="py-10 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
									<Users class="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
									<p class="text-xs font-semibold text-slate-600">Belum ada butir pertanyaan wawancara orang tua</p>
									<p class="text-[11px] text-slate-400 mt-1">Klik tombol "+ Tambah Pertanyaan" atau pilih templat cepat di atas.</p>
								</div>
							{:else}
								{#each fd.parent_qa as qa, idx}
									<div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
										<div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
											<div class="flex items-center gap-2">
												<span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
													{idx + 1}
												</span>
												<span class="text-xs font-bold text-slate-700">Pertanyaan #{idx + 1}</span>
											</div>

											{#if !isCompleted}
												<button
													type="button"
													onclick={() => removeParentQuestion(idx)}
													class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
													title="Hapus pertanyaan ini"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											{/if}
										</div>

										<div class="space-y-2.5">
											<div>
												<label for={`qa-q-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Teks Pertanyaan:
												</label>
												<input
													id={`qa-q-${idx}`}
													type="text"
													disabled={isCompleted}
													bind:value={qa.question}
													placeholder="Ketik pertanyaan untuk orang tua/wali..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
												/>
											</div>

											<div>
												<label for={`qa-a-${idx}`} class="block text-[11px] font-semibold text-slate-600 mb-1">
													Jawaban / Catatan Respons Orang Tua:
												</label>
												<textarea
													id={`qa-a-${idx}`}
													disabled={isCompleted}
													bind:value={qa.answer}
													rows="3"
													placeholder="Ketik ringkasan jawaban orang tua/wali..."
													class="w-full p-2.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
												></textarea>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>

						<!-- Ringkasan Kesediaan & Komitmen Orang Tua -->
						<div class="pt-4 border-t border-slate-100 space-y-2">
							<label for="parent-commitment-summary" class="block text-xs font-bold text-slate-800">
								Kesimpulan Komitmen & Catatan Khusus Orang Tua:
							</label>
							<textarea
								id="parent-commitment-summary"
								disabled={isCompleted}
								bind:value={parentCommitmentSummary}
								rows="3"
								class="w-full p-3 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
								placeholder="Catatan ringkas pewawancara mengenai kesiapan wali santri (finansial, mental mendukung pesantren, dll)..."
							></textarea>
						</div>

						<!-- Navigasi Stepper Ortu -->
						<div class="pt-4 flex items-center justify-between border-t border-slate-100 flex-wrap gap-3">
							<button
								type="button"
								onclick={() => { activeTab = 'santri'; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
								class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs md:text-sm flex items-center gap-2 transition min-h-[44px]"
							>
								<ArrowLeft class="w-4 h-4" />
								<span>Kembali ke Wawancara Santri</span>
							</button>

							<button
								type="button"
								onclick={() => { activeTab = 'rekomendasi'; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
								class="px-5 py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-950/20 transition min-h-[44px]"
							>
								<span>Lanjut ke Ringkasan & Rekomendasi</span>
								<ArrowRight class="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 3: RINGKASAN & REKOMENDASI -->
			{#if activeTab === 'rekomendasi'}
				<div class="space-y-6">
					<div class="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 space-y-5">
						<div class="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<h3 class="font-extrabold text-base text-blue-900 flex items-center gap-2">
									<FileText class="w-5 h-5 text-blue-700" />
									Ringkasan Wawancara & Rekomendasi Kelulusan
								</h3>
								<p class="text-xs text-slate-500">
									Catatan penguji untuk pertimbangan pimpinan pada Sidang Kelulusan
								</p>
							</div>
						</div>

						<!-- Ringkasan Cepat Santri & Ortu -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
							<div class="space-y-1">
								<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hasil Tes STIFIn Santri</span>
								<div class="flex items-center gap-2">
									{#if fd.stifin_category || fd.stifin_type}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono">
											<span>{fd.stifin_category || 'STIFIn'}</span>
											{#if fd.stifin_type}
												<span class="px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 font-extrabold">{fd.stifin_type}</span>
											{/if}
										</span>
									{:else}
										<span class="text-xs text-slate-400 italic">Belum diisi di tab Wawancara Santri</span>
									{/if}
								</div>
								{#if fd.stifin_notes}
									<p class="text-[11px] text-slate-600 truncate">{fd.stifin_notes}</p>
								{/if}
							</div>

							<div class="space-y-1">
								<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status Wawancara Orang Tua</span>
								<div>
									{#if fd.parent_qa && fd.parent_qa.length > 0}
										<span class="text-xs font-semibold text-slate-700">
											{fd.parent_qa.filter((q: any) => q.answer && q.answer.trim()).length} dari {fd.parent_qa.length} butir pertanyaan terisi
										</span>
									{:else}
										<span class="text-xs text-slate-400 italic">Belum ada butir pertanyaan</span>
									{/if}
								</div>
								{#if parentCommitmentSummary}
									<p class="text-[11px] text-slate-600 truncate">{parentCommitmentSummary}</p>
								{/if}
							</div>
						</div>

						<div class="space-y-4">
							<div class="space-y-1.5">
								<label for="summary-umum" class="block text-xs font-bold text-slate-800">
									Catatan Profil & Karakter Santri:
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
									Catatan Kesiapan Asrama & Kepesantrenan:
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
									Catatan Komitmen Orang Tua / Wali:
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
									Rekomendasi Kelulusan untuk Sidang Kelulusan:
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

							<!-- Stepper Balik ke Ortu -->
							<div class="pt-4 flex justify-start border-t border-slate-100">
								<button
									type="button"
									onclick={() => { activeTab = 'ortu'; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
									class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs md:text-sm flex items-center gap-2 transition min-h-[44px]"
								>
									<ArrowLeft class="w-4 h-4" />
									<span>Kembali ke Wawancara Orang Tua</span>
								</button>
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
							type="button"
							onclick={() => (showCompleteModal = true)}
							class="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-800 text-white hover:bg-blue-900 font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-blue-950/20"
						>
							<Check class="w-4 h-4" />
							<span>Tandai Selesai & Simpan Wawancara</span>
						</button>
					</div>
				{:else}
					<div class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
						Hasil wawancara santri ini telah selesai & tersimpan resmi.
					</div>
				{/if}
			</div>

			<!-- Custom Modal Konfirmasi Selesai Wawancara -->
			{#if showCompleteModal}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
					<div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
						<div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
							<Lock class="w-6 h-6 text-blue-700" />
						</div>
						<div>
							<h3 class="text-lg font-bold text-slate-900">Selesaikan & Simpan Hasil Wawancara?</h3>
							<p class="text-xs text-slate-500 mt-1 leading-relaxed">
								Anda akan menandai sesi wawancara untuk <strong>{currentCandidate.fullName}</strong> ({currentCandidate.testNumber}) telah selesai. Catatan wawancara yang tersimpan akan menjadi rujukan resmi pimpinan pada Sidang Kelulusan.
							</p>
						</div>

						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
							<div class="flex justify-between">
								<span class="text-slate-500">Pewawancara:</span>
								<span class="font-bold text-slate-800">{interviewerName}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Rekomendasi Khusus:</span>
								<span class="font-semibold text-blue-700">{specialRecommendation}</span>
							</div>
						</div>

						<div class="flex items-center justify-end gap-3 pt-2">
							<button
								type="button"
								onclick={() => (showCompleteModal = false)}
								class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition min-h-[44px]"
							>
								Batal
							</button>
							<button
								type="submit"
								formaction="?/complete"
								onclick={() => (showCompleteModal = false)}
								class="px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-sm hover:bg-blue-900 transition shadow-md shadow-blue-950/20 min-h-[44px] flex items-center gap-2"
							>
								<Check class="w-4 h-4" />
								<span>Ya, Selesaikan Wawancara</span>
							</button>
						</div>
					</div>
				</div>
			{/if}
		</form>
	{:else}
		<div class="bg-white rounded-2xl p-12 text-center border border-slate-200">
			<AlertCircle class="w-12 h-12 text-slate-400 mx-auto mb-3" />
			<h3 class="font-bold text-slate-800 text-lg">Tidak Ada Data Peserta</h3>
			<p class="text-xs text-slate-500 mt-1">Belum ada peserta seleksi aktif yang terdaftar di sistem.</p>
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
								Pilih Santri Wawancara
							</h3>
							<p class="text-xs text-slate-500">Pilih santri untuk membuka lembar wawancara</p>
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
							<label for="modal-search-wawancara" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Pencarian</label>
							<div class="relative">
								<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									id="modal-search-wawancara"
									type="text"
									bind:value={modalSearch}
									placeholder="Cari nama santri, no tes, asal sekolah..."
									class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 md:text-sm"
								/>
							</div>
						</div>

						<!-- Filter Status -->
						<div>
							<label for="filter-status-wawancara" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Status Wawancara</label>
							<select
								id="filter-status-wawancara"
								bind:value={modalFilterStatus}
								class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs transition focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
							>
								<option value="ALL">Semua Status</option>
								<option value="UNSCORED">Belum Dimulai</option>
								<option value="DRAFT">Sedang Diisi</option>
								<option value="LOCKED">Selesai (Terkunci)</option>
							</select>
						</div>

						<!-- Filter Ruangan -->
						<div>
							<label for="filter-room-wawancara" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Ruang Ujian</label>
							<select
								id="filter-room-wawancara"
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
							<label for="filter-major-wawancara" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Jurusan</label>
							<select
								id="filter-major-wawancara"
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
								{@const status = c.interview?.completionStatus}

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
											<span class="rounded-md bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold text-white">Sedang Wawancara</span>
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
											<span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</span>
											{#if status === 'COMPLETED'}
												<span class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
													<CheckCircle2 class="h-2.5 w-2.5 text-emerald-600" />
													<span>Selesai</span>
												</span>
											{:else if status === 'IN_PROGRESS'}
												<span class="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
													Sedang Diisi
												</span>
											{:else}
												<span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
													Belum Dimulai
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
</div>