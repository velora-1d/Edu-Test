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
		Database,
		ChevronRight,
		SlidersHorizontal,
	} from "lucide-svelte";

	let { children }: LayoutProps = $props();

	const navSections = [
		{
			title: "Admisi & Sekretariat",
			items: [
				{ href: "/", label: "Dashboard", icon: LayoutDashboard },
				{ href: "/peserta", label: "Data Calon Santri", icon: Users, badge: "Master" },
			],
		},
		{
			title: "Penilaian Seleksi (Paralel)",
			items: [
				{ href: "/tpa", label: "1. Tes TPA", icon: ClipboardCheck, badge: "Akademik" },
				{ href: "/rubrik", label: "2. Kepesantrenan", icon: BookOpen, badge: "7 Bidang" },
				{ href: "/wawancara", label: "3. Wawancara", icon: MessageSquareText, badge: "Dossier" },
			],
		},
		{
			title: "Hasil & Kelulusan",
			items: [
				{ href: "/ledger", label: "Rekap Nilai & Kuota", icon: FileSpreadsheet, badge: "Peringkat" },
				{ href: "/pleno", label: "Sidang Pleno", icon: Award, badge: "Yudisium" },
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
		pageMeta[page.url.pathname] || {
			title: "Edu-Test Seleksi PPDB",
			category: "PPDB Santri",
			description: "Sistem Seleksi Terpadu Calon Santri Baru",
		}
	);
</script>

<svelte:head>
	<title>{currentRoute.title} - Edu-Test Seleksi Santri</title>
</svelte:head>

<SidebarProvider>
	<!-- Modern Blue Collapsible Sidebar -->
	<Sidebar collapsible="icon" class="border-r border-slate-200 bg-white">
		<!-- Sidebar Brand Header -->
		<SidebarHeader class="border-b border-slate-100 p-3">
			<a href="/" class="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition group">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
					<GraduationCap class="w-5 h-5 text-sky-200" />
				</div>
				<div class="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
					<div class="flex items-center gap-1.5">
						<span class="font-display font-extrabold text-base tracking-tight text-slate-900">Edu-Test</span>
						<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">v1.0</span>
					</div>
					<span class="text-[11px] text-slate-500 truncate">Sistem Seleksi Santri</span>
				</div>
			</a>
		</SidebarHeader>

		<!-- Sidebar Navigation Links -->
		<SidebarContent class="px-2 py-3 space-y-4">
			{#each navSections as section}
				<SidebarGroup>
					<SidebarGroupLabel class="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3 py-1 group-data-[collapsible=icon]:hidden">
						{section.title}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu class="space-y-1">
							{#each section.items as item}
								{@const isActive =
									item.href === "/"
										? page.url.pathname === "/"
										: page.url.pathname.startsWith(item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton tooltipContent={item.label} {isActive}>
										{#snippet child({ props })}
											<a
												href={item.href}
												{...props}
												class={cn(
													props.class as string,
													"h-10 px-3 rounded-xl transition-all duration-150 flex items-center justify-between text-xs sm:text-sm font-medium",
													isActive
														? "bg-blue-700 text-white font-bold shadow-xs hover:bg-blue-800 hover:text-white"
														: "text-slate-700 hover:bg-blue-50 hover:text-blue-900"
												)}
											>
												<div class="flex items-center gap-2.5 truncate">
													<item.icon class="w-4 h-4 shrink-0 {isActive ? 'text-white' : 'text-slate-500'}" />
													<span class="truncate">{item.label}</span>
												</div>
												{#if item.badge}
													<span
														class={cn(
															"text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 group-data-[collapsible=icon]:hidden",
															isActive
																? "bg-blue-800/90 text-sky-100"
																: "bg-slate-100 text-slate-600 border border-slate-200/60"
														)}
													>
														{item.badge}
													</span>
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

			<!-- Quick Management Link -->
			<SidebarGroup class="pt-2">
				<SidebarGroupLabel class="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3 py-1 group-data-[collapsible=icon]:hidden">
					Pengaturan Master
				</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton tooltipContent="Master Jurusan & Ruang">
								{#snippet child({ props })}
									<a
										href="/peserta"
										{...props}
										class={cn(
											props.class as string,
											"h-10 px-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-900 text-xs font-medium transition flex items-center gap-2.5"
										)}
									>
										<SlidersHorizontal class="w-4 h-4 text-slate-500 shrink-0" />
										<span class="truncate group-data-[collapsible=icon]:hidden">Kelola Jurusan & Ruang</span>
									</a>
								{/snippet}
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>

		<!-- Sidebar Footer with Status and User Info -->
		<SidebarFooter class="border-t border-slate-100 p-3 space-y-2">
			<!-- Wave Session Badge -->
			<div class="px-2.5 py-2 rounded-xl bg-blue-50/80 border border-blue-200/70 text-blue-950 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
				<div class="truncate text-[11px] leading-tight">
					<span class="font-bold block text-blue-950">Gelombang 1</span>
					<span class="text-blue-700 text-[10px]">TA 2027/2028 (Aktif)</span>
				</div>
			</div>

			<!-- User Info -->
			<div class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
				<div class="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
					PA
				</div>
				<div class="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
					<span class="text-xs font-semibold text-slate-800 truncate">Panitia PPDB</span>
					<span class="text-[10px] text-slate-500 flex items-center gap-1">
						<Database class="w-2.5 h-2.5 text-emerald-600" />
						<span>Neon Postgres</span>
					</span>
				</div>
			</div>
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>

	<!-- Main App Inset Canvas -->
	<SidebarInset class="flex flex-col min-h-screen bg-slate-50">
		<!-- Top App Bar with Sidebar Trigger & Route Meta -->
		<header class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
			<div class="flex items-center gap-3 min-w-0">
				<!-- Sidebar Trigger Button -->
				<SidebarTrigger class="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-blue-700 transition" />
				<Separator orientation="vertical" class="h-5 bg-slate-200" />

				<!-- Route Breadcrumb & Title -->
				<div class="flex flex-col min-w-0">
					<div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
						<span class="text-slate-400">Edu-Test</span>
						<ChevronRight class="w-3 h-3 text-slate-400" />
						<span class="text-blue-700 font-semibold">{currentRoute.category}</span>
					</div>
					<h1 class="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight font-display">
						{currentRoute.title}
					</h1>
				</div>
			</div>

			<!-- Right Header Actions -->
			<div class="flex items-center gap-2.5 shrink-0">
				<!-- Active Gelombang Pill -->
				<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					<span>Gelombang 1 • TA 2027/2028</span>
				</div>

				<!-- Direct Quick Links -->
				<a
					href="/ledger"
					class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
				>
					<FileSpreadsheet class="w-3.5 h-3.5 text-blue-700" />
					<span>Rekap Nilai</span>
				</a>

				<a
					href="/peserta"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-2xs"
				>
					<Users class="w-3.5 h-3.5" />
					<span class="hidden sm:inline">Data Santri</span>
				</a>
			</div>
		</header>

		<!-- Subheader description bar for context clarity -->
		<div class="bg-white border-b border-slate-200/70 px-4 sm:px-6 py-2 hidden md:block">
			<p class="text-xs text-slate-500 flex items-center gap-2">
				<span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
				<span>{currentRoute.description}</span>
			</p>
		</div>

		<!-- Page Content Inset -->
		<main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
			{@render children()}
		</main>

		<!-- Modern Footer -->
		<footer class="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
				<span>Edu-Test &copy; 2026/2027. Sistem Seleksi Terpadu Calon Santri Baru.</span>
				<div class="flex items-center gap-3 text-[11px] text-slate-400">
					<span>PostgreSQL Neon Singapore</span>
					<span>•</span>
					<span>Shadcn Svelte & Tailwind v4</span>
				</div>
			</div>
		</footer>
	</SidebarInset>
</SidebarProvider>
