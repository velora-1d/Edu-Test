<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Unlock, X } from 'lucide-svelte';

	type Tone = 'amber' | 'blue' | 'rose' | 'emerald';

	const tones: Record<Tone, { badge: string; icon: string; confirm: string; focus: string }> = {
		amber: {
			badge: 'bg-gradient-to-br from-amber-50 to-amber-100 ring-amber-200/70',
			icon: 'text-amber-600',
			confirm:
				'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-600/25 hover:from-amber-600 hover:to-amber-700',
			focus: 'focus-visible:ring-amber-400/50'
		},
		blue: {
			badge: 'bg-gradient-to-br from-blue-50 to-blue-100 ring-blue-200/70',
			icon: 'text-blue-600',
			confirm:
				'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800',
			focus: 'focus-visible:ring-blue-400/50'
		},
		rose: {
			badge: 'bg-gradient-to-br from-rose-50 to-rose-100 ring-rose-200/70',
			icon: 'text-rose-600',
			confirm:
				'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-rose-600/25 hover:from-rose-600 hover:to-rose-700',
			focus: 'focus-visible:ring-rose-400/50'
		},
		emerald: {
			badge: 'bg-gradient-to-br from-emerald-50 to-emerald-100 ring-emerald-200/70',
			icon: 'text-emerald-600',
			confirm:
				'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800',
			focus: 'focus-visible:ring-emerald-400/50'
		}
	};

	let {
		open = false,
		title,
		description,
		confirmLabel = 'Ya, lanjutkan',
		cancelLabel = 'Batal',
		tone = 'amber',
		icon = Unlock,
		loading = false,
		onconfirm,
		oncancel
	}: {
		open?: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		tone?: Tone;
		icon?: any;
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	} = $props();

	const palette = $derived(tones[tone]);

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
	{@const Icon = icon}
	<div
		class="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="confirm-dialog-title"
		aria-describedby="confirm-dialog-desc"
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
			class="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
			transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
		>
			<div class="pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-amber-100/60 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-slate-100/70 blur-3xl"></div>

			<div class="relative">
				<div class="flex items-start justify-between gap-4">
					<div class={`flex h-13 w-13 items-center justify-center rounded-2xl ring-1 shadow-xs ${palette.badge}`}>
						<Icon class={`h-6 w-6 ${palette.icon}`} />
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

				<h2 id="confirm-dialog-title" class="mt-4 font-display text-lg font-bold tracking-tight text-slate-900">
					{title}
				</h2>
				<p id="confirm-dialog-desc" class="mt-1.5 text-sm leading-relaxed text-slate-500">
					{description}
				</p>

				<div class="mt-6 grid grid-cols-2 gap-3">
					<button
						bind:this={cancelButton}
						type="button"
						disabled={loading}
						class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
						onclick={requestClose}
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						disabled={loading}
						class={`inline-flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-semibold shadow-xs transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 disabled:opacity-70 ${palette.confirm} ${palette.focus}`}
						onclick={() => onconfirm?.()}
					>
						{#if loading}
							<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							<span>Memproses…</span>
						{:else}
							<Icon class="h-3.5 w-3.5" />
							<span>{confirmLabel}</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
