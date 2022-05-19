<script>
	export let data = [];
	export let degrees;
	export let hidden;
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	$: hover = {
		add: false,
		done: false,
		degrees: false,
	};

	let longpress = false;
	let timeout;

	window.addEventListener("keydown", (e) => {
		if (hidden) return;
		timeout = setTimeout(() => (longpress = true), 400);
		let { key } = e;
		if (/SoftLeft|-/.test(key)) {
			hover.add = true;
		}
		if (/SoftRight|=|Backspace/.test(key)) {
			hover.done = true;
			e.preventDefault();
		}
		if ("Enter" === key) {
			hover.degrees = true;
		}
	});
	window.addEventListener("keyup", () => {
		if (hidden) return;
		clearTimeout(timeout);

		Object.keys(hover).forEach((e) => {
			if (hover[e] && !longpress) dispatch(e);
			hover[e] = false;
		});

		if (longpress) {
			longpress = false;
			console.log("long press!");
		}
	});

	function onclick() {
		dispatch(this.id);
	}
</script>

<main>
	<header>
		<button on:click={onclick} class={hover.add ? "hover" : ""} id="add" />
		Weather
		<button on:click={onclick} class={hover.done ? "hover" : ""} id="done">Done</button>
	</header>
	<div class="cities">
		{#each data.slice(1) as o, i}
			<div tabindex={i}>{o.name || "..."}</div>
		{/each}
		{#each [...Array(data.slice(1).length < 8 ? 8 - data.length : 0)] as e}
			<div class="filler" />
		{/each}
	</div>
	<div on:click={onclick} class={degrees ? "checked" : ""} id="degrees">
		<div />
	</div>
</main>

<style>
	header {
		background-image: url("/img/titlebar.png");
		background-size: contain;
		background-repeat: repeat;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: white;
	}

	header button {
		height: 25px;
		border: none;
		background-color: transparent;
		margin: 0 2px;
		background-size: contain;
		color: inherit;
	}

	button#add {
		background-image: url("/img/add.png");
		width: 34px;
	}

	button#add:active,
	button#add.hover {
		background-image: url("/img/add_hov.png");
	}

	button#done {
		width: 45px;
		font-size: 10px;
		background-image: url("/img/done.png");
	}
	button#done:active,
	button#done.hover {
		background-image: url("/img/done_hov.png");
	}

	.cities {
		margin: 10px;
		max-height: 196px;
		overflow: auto;
	}

	.cities > * {
		background-image: url("/img/_center.png");
		background-size: 100% 100%;
		height: 28px;
		padding-left: 25px;
		line-height: 1.75;
		font-weight: 500;
		position: relative;
	}

	.cities > *:not(.filler)::before,
	.cities > *:not(.filler)::after {
		content: "";
		position: absolute;
		height: 100%;
		background-position: center;
	}
	.cities > *:not(.filler)::before {
		background-image: url("/img/edit_indicator.png");
		width: 14px;
		left: 6px;
		background-size: 100%;
	}
	.cities > *:not(.filler)::after {
		background-image: url("/img/slide_icon.png");
		width: 26px;
		background-size: contain;
		right: 4px;
	}
	.cities > *:focus {
		filter: brightness(0.8);
	}

	.cities > *:first-child {
		background-image: url("/img/_top.png");
	}

	.cities > *:last-child {
		background-image: url("/img/_bottom.png");
	}

	main > div,
	main > #degrees {
		width: calc(240px - 20px);
		margin: 0;
		margin-left: 10px;
	}
	#degrees {
		position: relative;
		height: 29px;
	}
	#degrees > div {
		background-size: 100%;
	}
	#degrees > div {
		background-image: url("/img/degrees.png");
		appearance: none;
	}
	#degrees.checked > div {
		background-image: url("/img/degrees_checked.png");
	}
	#degrees > div {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
