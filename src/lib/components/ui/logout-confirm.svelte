<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { LogOut, X } from 'lucide-svelte';

	let {
		open = false,
		loading = false,
		onconfirm,
		oncancel
	}: {
		open?: boolean;
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	} = $props();

	let cancelButton = $state<HTMLButtonElement | null>(null);

	function requestClose() {
		if (!loading) oncancel?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			requestClose();
		}
	}

	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const focusTimer = setTimeout(() => cancelButton?.focus(), 40);
		return () => {
			document.body.style.overflow = previousOverflow;
			clearTimeout(focusTimer);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
		transition:fade={{ duration: 150 }}
	>
		<!-- Backdrop -->
		<button
			type="button"
			tabindex="-1"
			aria-label="Tutup dialog konfirmasi"
			class="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-[6px]"
			onclick={requestClose}
		></button>

		<!-- Card -->
		<div
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="logout-confirm-title"
			aria-describedby="logout-confirm-desc"
			class="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
			transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
		>
			<!-- Soft ambient glow -->
			<div class="pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-rose-100/70 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-blue-100/60 blur-3xl"></div>

			<div class="relative">
				<div class="flex items-start justify-between gap-4">
					<div class="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 ring-1 ring-rose-200/70 shadow-xs">
						<LogOut class="h-6 w-6 text-rose-600" />
					</div>
					<button
						type="button"
						aria-label="Tutup dialog"
						disabled={loading}
						class="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-40"
						onclick={requestClose}
					>
						<X class="h-4 w-4" />
					</button>
				</div>

				<h2
					id="logout-confirm-title"
					class="mt-4 font-display text-lg font-bold tracking-tight text-slate-900"
				>
					Keluar dari sesi?
				</h2>
				<p id="logout-confirm-desc" class="mt-1.5 text-sm leading-relaxed text-slate-500">
					Sesi panitia PPDB akan diakhiri dan kamu perlu masuk kembali untuk melanjutkan penilaian.
					Pastikan seluruh input sudah tersimpan.
				</p>

				<div class="mt-6 grid grid-cols-2 gap-3">
					<button
						bind:this={cancelButton}
						type="button"
						disabled={loading}
						class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
						onclick={requestClose}
					>
						Tetap di sini
					</button>
					<button
						type="button"
						disabled={loading}
						class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-xs font-semibold text-white shadow-xs shadow-rose-600/25 transition hover:from-rose-600 hover:to-rose-700 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 disabled:opacity-70"
						onclick={() => onconfirm?.()}
					>
						{#if loading}
							<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							<span>Mengakhiri…</span>
						{:else}
							<LogOut class="h-3.5 w-3.5" />
							<span>Ya, keluar</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
