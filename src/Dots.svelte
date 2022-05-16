<script>
	export let max;
	export let selected;
	export let hidden;
</script>

<main style="opacity: {hidden ? '0' : '1'};">
	{#each [...Array(max || 0).keys()] as o}
		<div class="mark {selected === o ? 'checked' : ''}" data-index={o}>
			<div />
		</div>
	{/each}
</main>

<style>
	main {
		width: 240px;
		height: 22px;
		position: absolute;
		bottom: 0;
		left: 0;
		justify-content: center;
		align-items: center;
		display: flex;
		transition: opacity ease 0.6s;
		transition-delay: 0.3s;
	}
	.mark {
		margin: 0 2px;
		width: 6px;
		height: 6px;
		opacity: 0.3;
		position: relative;
	}
	.mark.checked {
		opacity: 1;
	}
	.mark > div {
		position: absolute;
	}
	.mark:not([data-index="0"]) > div {
		background-color: white;
		width: 100%;
		height: 100%;
		border-radius: 100%;
	}
	.mark[data-index="0"] > div {
		background-image: url(/img/navigate.svg);
		width: 140%;
		height: 140%;
		top: -10%;
		left: -35%;
	}
</style>
