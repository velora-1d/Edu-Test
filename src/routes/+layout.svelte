<script lang="ts">
	import "./layout.css";
	import type { LayoutProps } from "./$types";
	import { page } from "$app/state";
	import { cn } from "$lib/utils.js";
	import {
		Sidebar,
		SidebarProvider,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarFooter,
		SidebarRail,
		SidebarInset,
		SidebarTrigger,
	} from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import {
		LayoutDashboard,
		Users,
		ClipboardCheck,
		BookOpen,
		MessageSquareText,
		FileSpreadsheet,
		Award,
		GraduationCap,
		SlidersHorizontal,
		Database,
		ChevronRight,
	} from "lucide-svelte";

	let { children }: LayoutProps = $props();

	const navSections = [
		{
			title: "Admisi",
			items: [
				{ href: "/", label: "Dashboard Seleksi", icon: LayoutDashboard },
				{ href: "/peserta", label: "Data Calon Santri", icon: Users },
			],
		},
		{
			title: "Penilaian Seleksi",
			items: [
				{ href: "/tpa", label: "1. Tes TPA", icon: ClipboardCheck },
				{ href: "/rubrik", label: "2. Tes Kepesantrenan", icon: BookOpen },
				{ href: "/wawancara", label: "3. Tes Wawancara", icon: MessageSquareText },
			],
		},
		{
			title: "Hasil & Kelulusan",
			items: [
				{ href: "/ledger", label: "Rekap Nilai & Kuota", icon: FileSpreadsheet },
				{ href: "/pleno", label: "Sidang Yudisium Pleno", icon: Award },
			],
		},
		{
			title: "Master & Pengaturan",
			items: [
				{ href: "/peserta?manageMaster=true", label: "Kelola Jurusan & Ruang", icon: SlidersHorizontal },
			],
		},
	];

	const pageMeta: Record<string, { title: string; category: string; description: string }> = {
		"/": {
			title: "Dashboard Seleksi",
			category: "Admisi",
			description: "Ringkasan statistik calon santri, kuota jurusan & progres ujian",
		},
		"/peserta": {
			title: "Data Calon Santri",
			category: "Admisi",
			description: "Kelola pendaftaran peserta, alokasi ruang ujian & master jurusan",
		},
		"/tpa": {
			title: "1. Tes Potensi Akademik (TPA)",
			category: "Penilaian Seleksi",
			description: "Pemeriksaan skor TPA & passing grade akademik santri",
		},
		"/rubrik": {
			title: "2. Tes Kepesantrenan",
			category: "Penilaian Seleksi",
			description: "Penilaian terperinci 7 bidang kepesantrenan (Tahsin, Kitab, dll)",
		},
		"/wawancara": {
			title: "3. Tes Wawancara",
			category: "Penilaian Seleksi",
			description: "Eksplorasi kesiapan santri & wali, komitmen, serta catatan dossier",
		},
		"/ledger": {
			title: "Rekap Nilai & Simulasi Kuota",
			category: "Hasil & Kelulusan",
			description: "Peringkat gabungan 50% TPA + 50% Kepesantrenan & cut-off kuota",
		},
		"/pleno": {
			title: "Sidang Yudisium Pleno",
			category: "Hasil & Kelulusan",
			description: "Keputusan final kelulusan, override diskresi & berita acara",
		},
	};

	let currentRoute = $derived(
		page.url.pathname === "/peserta" && page.url.searchParams.get("manageMaster") === "true"
			? {
					title: "Kelola Master Jurusan & Ruang",
					category: "Master Data",
					description: "Pengaturan dinamis jurusan pilihan dan daftar alokasi ruang ujian",
			  }
			: pageMeta[page.url.pathname] || {
					title: "Edu-Test Seleksi PPDB",
					category: "PPDB Santri",
					description: "Sistem Seleksi Terpadu Calon Santri Baru",
			  }
	);

	function isRouteActive(href: string): boolean {
		const [targetPath, queryString] = href.split("?");
		if (targetPath === "/") {
			return page.url.pathname === "/";
		}

		if (queryString) {
			const targetParams = new URLSearchParams(queryString);
			const matchesPath =
				page.url.pathname === targetPath || page.url.pathname.startsWith(targetPath + "/");
			const matchesParams = Array.from(targetParams.entries()).every(
				([key, val]) => page.url.searchParams.get(key) === val
			);
			return matchesPath && matchesParams;
		}

		if (targetPath === "/peserta") {
			if (page.url.searchParams.get("manageMaster") === "true") {
				return false;
			}
			return page.url.pathname === "/peserta" || page.url.pathname.startsWith("/peserta/");
		}

		return page.url.pathname === targetPath || page.url.pathname.startsWith(targetPath + "/");
	}
</script>

<svelte:head>
	<title>{currentRoute.title} - Edu-Test Seleksi Santri</title>
</svelte:head>

<SidebarProvider>
	<!-- Modern Professional Blue Sidebar (Width 280px, Sleek SaaS Layout, Clean Collapsed Mode) -->
	<Sidebar collapsible="icon" class="border-r border-slate-200/90 bg-white shadow-2xs">
		<!-- Sidebar Brand Header -->
		<SidebarHeader class="p-3 border-b border-slate-100 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
			<a href="/" class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50/80 transition-all group group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
				<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-600/30 ring-1 ring-blue-700/20 group-hover:scale-105 transition-transform">
					<GraduationCap class="w-5 h-5 text-white" />
				</div>
				<div class="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
					<div class="flex items-center gap-1.5">
						<span class="font-display font-black text-sm tracking-tight text-slate-900">Edu-Test</span>
						<span class="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">PPDB</span>
					</div>
					<span class="text-[11px] text-slate-400 font-medium truncate">Sistem Seleksi Santri</span>
				</div>
			</a>
		</SidebarHeader>

		<!-- Sidebar Navigation Items -->
		<SidebarContent class="px-2.5 py-3 space-y-4 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:space-y-2">
			{#each navSections as section}
				<SidebarGroup class="p-0">
					<SidebarGroupLabel class="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2.5 py-1 mb-0.5 group-data-[collapsible=icon]:hidden">
						{section.title}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu class="space-y-0.5 group-data-[collapsible=icon]:space-y-1">
							{#each section.items as item}
								{@const isActive = isRouteActive(item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton tooltipContent={item.label} {isActive} class="p-0 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
										{#snippet child({ props })}
											<a
												href={item.href}
												{...props}
												class={cn(
													"group flex items-center w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
													"group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto",
													isActive
														? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/25 hover:bg-blue-700 hover:text-white"
														: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70"
												)}
											>
												<item.icon
													class={cn(
														"w-4 h-4 shrink-0 transition-colors",
														"group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5",
														isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
													)}
												/>
												<span class="truncate ml-2.5 flex-1 group-data-[collapsible=icon]:hidden">{item.label}</span>
												{#if isActive}
													<span class="w-1.5 h-1.5 rounded-full bg-white/90 shrink-0 group-data-[collapsible=icon]:hidden"></span>
												{/if}
											</a>
										{/snippet}
									</SidebarMenuButton>
								</SidebarMenuItem>
							{/each}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			{/each}
		</SidebarContent>

		<!-- Unified Elegant Sidebar Footer -->
		<SidebarFooter class="p-3 border-t border-slate-100 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
			<!-- Expanded Consolidated Card: Wave Status & Profile Info -->
			<div class="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 space-y-2 group-data-[collapsible=icon]:hidden">
				<!-- Session Wave -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
						<div class="leading-tight">
							<span class="text-xs font-bold text-slate-800 block">Gelombang 1</span>
							<span class="text-[10px] text-slate-500 font-medium">TA 2027/2028</span>
						</div>
					</div>
					<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
						AKTIF
					</span>
				</div>

				<div class="h-px bg-slate-200/80"></div>

				<!-- Panitia & DB status -->
				<div class="flex items-center justify-between text-[11px]">
					<div class="flex items-center gap-1.5 min-w-0">
						<div class="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
							PA
						</div>
						<span class="font-medium text-slate-700 truncate">Panitia PPDB</span>
					</div>
					<span class="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
						<Database class="w-3 h-3 text-emerald-600" />
						<span>Postgres</span>
					</span>
				</div>
			</div>

			<!-- Collapsed Mini Footer Avatar -->
			<div class="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center" title="Panitia PPDB (Neon Postgres)">
				<div class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-blue-700 font-bold text-xs flex items-center justify-center transition shadow-2xs">
					PA
				</div>
			</div>
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>

	<!-- Main App Inset Canvas -->
	<SidebarInset class="flex flex-col min-h-screen bg-slate-50">
		<!-- Top App Bar with Sidebar Trigger & Route Meta -->
		<header class="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
			<div class="flex items-center gap-3 min-w-0">
				<!-- Sidebar Trigger Button -->
				<SidebarTrigger class="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition" />
				<Separator orientation="vertical" class="h-4 bg-slate-200" />

				<!-- Route Breadcrumb & Title -->
				<div class="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
					<span class="text-slate-400 font-medium hidden sm:inline">Edu-Test</span>
					<ChevronRight class="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
					<span class="text-slate-500 font-medium hidden md:inline">{currentRoute.category}</span>
					<ChevronRight class="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
					<span class="text-slate-900 font-bold tracking-tight truncate font-display">
						{currentRoute.title}
					</span>
				</div>
			</div>

			<!-- Right Header Actions -->
			<div class="flex items-center gap-2 shrink-0">
				<!-- Active Gelombang Pill -->
				<div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/60 text-xs text-blue-900 font-medium">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
					<span class="text-[11px] font-semibold">Gelombang 1</span>
				</div>

				<!-- Direct Quick Links -->
				<a
					href="/ledger"
					class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
				>
					<FileSpreadsheet class="w-3.5 h-3.5 text-blue-600" />
					<span>Rekap Nilai</span>
				</a>

				<a
					href="/peserta"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs shadow-blue-600/20"
				>
					<Users class="w-3.5 h-3.5" />
					<span class="hidden sm:inline">Data Santri</span>
				</a>
			</div>
		</header>

		<!-- Subheader description bar for context clarity -->
		<div class="bg-white/60 border-b border-slate-200/60 px-4 sm:px-6 py-2 hidden md:block">
			<p class="text-xs text-slate-500 flex items-center gap-2 font-medium">
				<span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
				<span>{currentRoute.description}</span>
			</p>
		</div>

		<!-- Page Content Inset -->
		<main class="flex-1 p-4 sm:p-6 lg:p-8 w-full">
			{@render children()}
		</main>

		<!-- Modern Minimal Footer -->
		<footer class="border-t border-slate-200/80 bg-white py-3.5 px-6 text-center text-xs text-slate-500">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
				<span>Edu-Test &copy; 2026/2027 • Sistem Seleksi Terpadu Calon Santri Baru</span>
				<div class="flex items-center gap-3 text-[11px] text-slate-400">
					<span>Neon PostgreSQL Singapore</span>
					<span>•</span>
					<span>shadcn-svelte</span>
				</div>
			</div>
		</footer>
	</SidebarInset>
</SidebarProvider>
