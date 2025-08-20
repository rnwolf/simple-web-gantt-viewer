<script>
	let { row } = $props();
	const url = $derived(row.url);
</script>

{#if url}
<a href={url}>URL</a>
{/if}