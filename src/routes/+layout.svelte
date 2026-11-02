<script lang="ts">
	import "./layout.css";
	import type { LayoutProps } from "./$types";
	import { page } from "$app/state";
	import {
		LayoutDashboard,
		Users,
		FileSpreadsheet,
		Award,
		Sliders,
		GraduationCap,
		ClipboardCheck,
		BookOpen,
		MessageSquareText,
	} from "lucide-svelte";

	let { children }: LayoutProps = $props();

	const navSections = [
		{
			title: "Admisi",
			items: [
				{ href: "/", label: "Dashboard", icon: LayoutDashboard },
				{ href: "/peserta", label: "Data Santri", icon: Users }
			]
		},
		{
			title: "Penilaian Seleksi",
			items: [
				{ href: "/tpa", label: "1. Tes TPA", icon: ClipboardCheck },
				{ href: "/rubrik", label: "2. Kepesantrenan", icon: BookOpen },
				{ href: "/wawancara", label: "3. Wawancara", icon: MessageSquareText }
			]
		},
		{
			title: "Hasil & Kelulusan",
			items: [
				{ href: "/ledger", label: "Rekap Nilai", icon: FileSpreadsheet },
				{ href: "/pleno", label: "Sidang Pleno", icon: Award }
			]
		}
	];
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
	<!-- Top Bar -->
	<header class="bg-blue-700 text-white shadow-sm border-b border-blue-800">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand -->
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner"
					>
						<GraduationCap class="w-6 h-6 text-sky-200" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<span
								class="text-xl font-bold tracking-tight text-white"
								>Edu-Test</span
							>
							<span
								class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-800 text-sky-200 border border-blue-600"
							>
								v1.0
							</span>
						</div>
						<p class="text-xs text-sky-100 hidden sm:block">
							Sistem Seleksi Terpadu & Penilaian Paralel PPDB
						</p>
					</div>
				</div>

				<!-- Header Metadata & Profile -->
				<div class="flex items-center gap-3">
					<div
						class="hidden md:flex items-center gap-2 bg-blue-800/80 px-3 py-1.5 rounded-lg border border-blue-600/50 text-xs text-sky-100"
					>
						<span
							class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
						></span>
						<span>Gelombang 1 - TA 2027/2028 (Aktif)</span>
					</div>
					<div
						class="flex items-center gap-2 pl-2 border-l border-blue-600"
					>
						<div
							class="w-8 h-8 rounded-full bg-blue-900 border border-blue-500 flex items-center justify-center text-xs font-bold text-sky-200"
						>
							PA
						</div>
						<div class="hidden sm:block text-left text-xs">
							<p class="font-medium text-white leading-tight">
								Panitia PPDB
							</p>
							<p class="text-sky-200 text-[10px]">Super Admin</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Nav Items (Grouped by Selection Workflow) -->
		<nav
			class="bg-blue-800 border-t border-blue-700/60 overflow-x-auto scrollbar-none"
		>
			<div
				class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-1.5 text-xs font-medium gap-1 sm:gap-3"
			>
				{#each navSections as section, sIdx}
					<div class="flex items-center gap-1 sm:gap-1.5">
						<span
							class="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-sky-300/80 mr-1 px-1.5 py-0.5 rounded bg-blue-900/60"
						>
							{section.title}
						</span>
						{#each section.items as item}
							{@const isActive =
								item.href === "/"
									? page.url.pathname === "/"
									: page.url.pathname.startsWith(item.href)}
							<a
								href={item.href}
								class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all {isActive
									? 'bg-white text-blue-900 shadow-sm font-bold'
									: 'text-sky-100 hover:bg-blue-700/80 hover:text-white'}"
							>
								<item.icon
									class="w-3.5 h-3.5 {isActive
										? 'text-blue-700'
										: 'text-sky-200'}"
								/>
								<span>{item.label}</span>
							</a>
						{/each}
					</div>
					{#if sIdx < navSections.length - 1}
						<div class="h-4 w-[1px] bg-blue-700 mx-1 sm:mx-2 hidden sm:block"></div>
					{/if}
				{/each}
			</div>
		</nav>
	</header>

	<!-- Page Content -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer
		class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500"
	>
		<div class="max-w-7xl mx-auto px-4">
			Edu-Test &copy; 2026/2027. Sistem Seleksi Santri Baru & Admisi
			Terpadu. All rights reserved.
		</div>
	</footer>
</div>
