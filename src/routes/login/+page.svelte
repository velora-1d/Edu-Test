<script lang="ts">
	import AuthSectionThree from "$lib/components/ui/auth-section-3.svelte";
	import type { ActionData } from "./$types";

	let { form }: { form?: ActionData } = $props();
</script>

<svelte:head>
	<title>Masuk | Edu-Test PPDB</title>
</svelte:head>

<AuthSectionThree {form} />
