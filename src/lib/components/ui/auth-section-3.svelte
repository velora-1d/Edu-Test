<script lang="ts">
	import { goto } from "$app/navigation";
	import {
		Eye,
		EyeOff,
		ShieldCheck,
		CheckCircle2,
		ArrowRight,
		Lock,
		Mail,
		KeyRound,
		UserCheck,
	} from "lucide-svelte";

	let email = $state("admin@edutest.sch.id");
	let password = $state("••••••••••••");
	let showPassword = $state(false);
	let rememberMe = $state(true);
	let isLoading = $state(false);
	let errorMessage = $state("");

	function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		errorMessage = "";

		setTimeout(() => {
			isLoading = false;
			goto("/");
		}, 600);
	}

	function setQuickAccount(accountEmail: string) {
		email = accountEmail;
		password = "password123";
	}
</script>

<section class="min-h-screen bg-slate-50 p-3 sm:p-4 text-slate-900 antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
	<div class="grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
		<!-- Left Side: Login Form (Google & Apple dihapus) -->
		<div class="flex min-h-[700px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-6 py-10 dark:border-white/5 dark:bg-[#0a0a0c] sm:px-10 lg:min-h-0 lg:px-14 lg:py-16 xl:px-20 shadow-xs">
			<div class="mx-auto w-full max-w-[440px]">
				<!-- Header Badge -->
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-4 shadow-2xs">
					<ShieldCheck class="w-3.5 h-3.5 text-blue-600" />
					<span>Portal Seleksi PPDB & Penguji</span>
				</div>

				<h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
					Masuk ke Edu-Test
				</h1>
				<p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
					Silakan masukkan akun Asatidz atau Panitia untuk mengakses lembar penilaian dan pleno santri baru.
				</p>

				{#if errorMessage}
					<div class="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
						{errorMessage}
					</div>
				{/if}

				<form onsubmit={handleLogin} class="mt-8 space-y-4">
					<!-- Email / Username Input -->
					<div class="space-y-1.5 text-left w-full">
						<label for="login-email" class="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Email / Username Asatidz
						</label>
						<div class="relative flex h-11 items-center rounded-xl border border-slate-300/80 bg-white px-3.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all dark:border-white/10 dark:bg-white/5 shadow-2xs">
							<Mail class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
							<input
								id="login-email"
								type="text"
								bind:value={email}
								placeholder="nama@pesantren.sch.id"
								required
								class="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
							/>
						</div>
					</div>

					<!-- Password Input -->
					<div class="space-y-1.5 text-left w-full">
						<label for="login-password" class="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Kata Sandi (Password)
						</label>
						<div class="relative flex h-11 items-center rounded-xl border border-slate-300/80 bg-white px-3.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all dark:border-white/10 dark:bg-white/5 shadow-2xs">
							<Lock class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
							<input
								id="login-password"
								type={showPassword ? "text" : "password"}
								bind:value={password}
								placeholder="Masukkan kata sandi"
								required
								class="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 pr-8"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white cursor-pointer"
								aria-label="Toggle password visibility"
							>
								{#if showPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Options: Remember Me & Forgot Password -->
					<div class="flex items-center justify-between pt-1">
						<label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
							<input
								type="checkbox"
								bind:checked={rememberMe}
								class="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
							/>
							<span>Ingat sesi di perangkat ini</span>
						</label>

						<a
							href="#bantuan"
							class="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
						>
							Bantuan login?
						</a>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={isLoading}
						class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer disabled:opacity-60"
					>
						{#if isLoading}
							<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
							<span>Memverifikasi akun...</span>
						{:else}
							<span>Masuk ke Dashboard Seleksi</span>
							<ArrowRight class="w-4 h-4" />
						{/if}
					</button>

					<!-- Quick Selector Demo Asatidz -->
					<div class="pt-5 mt-6 border-t border-slate-100 dark:border-white/10">
						<div class="flex items-center justify-between mb-2.5">
							<span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Akses Cepat Penguji (Demo)</span>
							<UserCheck class="w-3.5 h-3.5 text-slate-400" />
						</div>

						<div class="grid grid-cols-2 gap-2 text-xs">
							<button
								type="button"
								onclick={() => setQuickAccount("ust.malik@edutest.sch.id")}
								class="p-2.5 text-left rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 transition text-slate-700"
							>
								<div class="font-bold text-slate-800 text-[11px]">Penguji TPA</div>
								<div class="text-[10px] text-slate-500 truncate">Ust. Abdul Malik, S.Pd.</div>
							</button>

							<button
								type="button"
								onclick={() => setQuickAccount("ust.huda@edutest.sch.id")}
								class="p-2.5 text-left rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 transition text-slate-700"
							>
								<div class="font-bold text-slate-800 text-[11px]">Kepesantrenan</div>
								<div class="text-[10px] text-slate-500 truncate">Ust. Nurul Huda, Lc.</div>
							</button>

							<button
								type="button"
								onclick={() => setQuickAccount("dra.aminah@edutest.sch.id")}
								class="p-2.5 text-left rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 transition text-slate-700"
							>
								<div class="font-bold text-slate-800 text-[11px]">Pewawancara</div>
								<div class="text-[10px] text-slate-500 truncate">Dra. Hj. Siti Aminah</div>
							</button>

							<button
								type="button"
								onclick={() => setQuickAccount("admin@edutest.sch.id")}
								class="p-2.5 text-left rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 transition text-slate-700"
							>
								<div class="font-bold text-blue-700 text-[11px]">Super Admin</div>
								<div class="text-[10px] text-slate-500 truncate">Drs. H. M. Samsul</div>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>

		<!-- Right Side: Marketing Showcase & Mockup Preview -->
		<div class="relative flex min-h-[700px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 text-white sm:p-12 lg:min-h-0 lg:p-14 shadow-xl">
			<!-- Ambient Lights -->
			<div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
			<div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

			<!-- Main Top Showcase -->
			<div class="relative z-10 max-w-[480px]">
				<!-- Asatidz Identity -->
				<div class="flex items-center gap-3.5">
					<img
						src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
						alt="Koordinator Dewan Penguji"
						class="size-11 shrink-0 rounded-full border-2 border-blue-400/30 object-cover shadow-sm"
					/>
					<div>
						<div class="font-semibold text-white flex items-center gap-1.5 text-sm sm:text-base">
							Ust. H. Nurul Huda, Lc.
							<CheckCircle2 class="size-4 text-blue-400" />
						</div>
						<div class="text-xs text-blue-200/75">
							Koordinator Dewan Penguji PPDB 2027/2028
						</div>
					</div>
				</div>

				<blockquote class="mt-8 text-2xl sm:text-3xl font-light leading-snug tracking-tight text-slate-100">
					“Penilaian terstandarisasi, rekapitulasi real-time, dan keputusan sidang pleno santri baru kini 100% berbasis data empiris.”
				</blockquote>

				<!-- Metric Highlights -->
				<div class="mt-8 grid grid-cols-3 gap-3 border-y border-white/10 py-5 text-xs">
					<div>
						<div class="text-xl sm:text-2xl font-bold text-white tracking-tight">80 Kursi</div>
						<div class="text-[11px] text-slate-400 mt-0.5">Kapasitas Kuota</div>
					</div>
					<div class="border-l border-white/10 pl-3">
						<div class="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">100%</div>
						<div class="text-[11px] text-slate-400 mt-0.5">Tie-Breaker Otomatis</div>
					</div>
					<div class="border-l border-white/10 pl-3">
						<div class="text-xl sm:text-2xl font-bold text-blue-400 tracking-tight">PostgreSQL</div>
						<div class="text-[11px] text-slate-400 mt-0.5">Neon Singapore</div>
					</div>
				</div>
			</div>

			<!-- Mockup Preview Card -->
			<div class="relative z-10 mt-8 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-2.5 shadow-2xl backdrop-blur-xl">
				<div class="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 text-left">
					<div class="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-2.5 select-none">
						<div class="flex items-center gap-1.5">
							<div class="size-2.5 rounded-full bg-rose-500/80"></div>
							<div class="size-2.5 rounded-full bg-amber-500/80"></div>
							<div class="size-2.5 rounded-full bg-emerald-500/80"></div>
							<span class="ml-3 text-[10px] font-mono text-slate-400">
								edutest-iqy.pages.dev/dashboard
							</span>
						</div>
						<span class="text-[10px] text-blue-400 font-mono">Live Demo</span>
					</div>

					<div class="p-4 space-y-3">
						<div class="flex items-center justify-between text-xs">
							<div class="font-medium text-slate-200">Sidang Pleno Kelulusan</div>
							<span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
								Gelombang 1 Aktif
							</span>
						</div>

						<div class="grid grid-cols-3 gap-2 pt-1 text-left">
							<div class="rounded-lg bg-white/5 p-2.5 border border-white/5">
								<div class="text-[10px] text-slate-400">Pendaftar</div>
								<div class="text-sm font-bold text-white mt-1">2 Calon Santri</div>
							</div>
							<div class="rounded-lg bg-white/5 p-2.5 border border-white/5">
								<div class="text-[10px] text-slate-400">Nilai TPA</div>
								<div class="text-sm font-bold text-blue-300 mt-1">Terinput /69</div>
							</div>
							<div class="rounded-lg bg-white/5 p-2.5 border border-white/5">
								<div class="text-[10px] text-slate-400">STIFIn & Wawancara</div>
								<div class="text-sm font-bold text-emerald-300 mt-1">Lengkap</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
