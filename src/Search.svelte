<script>
	export let hidden;
	import { search } from "./lib/weather";
	import { createEventDispatcher } from "svelte";
	import { centerScroll } from "./lib/helper.js";
	const dispatch = createEventDispatcher();
	let results = [];

	let timeout;

	let def = "Type the City, State or ZIP code:";
	let text = def;

	let find = async (e) => {
		if (!e) return;
		text = "Validating city...";
		let raw = await search(e);
		results = raw.map((a) => {
			let { Latitude: lat, Longitude: lon } = a.GeoPosition;
			return { name: a.EnglishName + ", " + a.Country.EnglishName, lat, lon };
		});
		text = def;
	};

	let selected;

	let hide = () => {
		document.activeElement.blur();
		results = [];
		selected = null;
	};

	$: hidden && hide();
	$: !hidden && setTimeout(() => document.getElementById("search_input").focus(), 400);

	window.addEventListener("keydown", (e) => {
		if (hidden) return;
		let { key, target } = e;

		if (key === "Enter") {
			if (target.id !== "search_input") {
				selected = Number(target.tabIndex);
				dispatch("add", { ...target.dataset });
			}
		}
		if (/SoftRight|=/.test(key)) {
			dispatch("hide");
		}
		if ("Backspace" == key) {
			if (target.id === "search_input" && target.value === "") {
				e.preventDefault();
				dispatch("hide");
			} else document.getElementById("search_input").focus();
		}
		if (/Arrow/.test(key) && /Up|Down/.test(key) && results.length > 0) {
			let index = Number(target.tabIndex);
			let nav = "ArrowUp" === key ? -1 : 1;
			if (target.id !== "search_input" && ((nav == -1 && index == 0) || (nav == 1 && index == results.length - 1))) {
				document.getElementById("search_input").focus();
			} else {
				if (target.id === "search_input") {
					if (nav == -1) index = results.length;
					else index = -1;
				}
				e.preventDefault();
				let el = document.querySelector(`#search_container > [tabindex="${index + nav}"]`);
				centerScroll(el);
				setTimeout(() => el.focus(), 50);
			}
		}
	});

	let oninput = (e) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => find(e.target.value), 1000);
	};
</script>

<main class={!hidden ? "open" : ""} id="search_main">
	<div class="bar">
		{text}
		<div class="bottom">
			<div class="input_wrapper">
				<input on:input={oninput} id="search_input" type="text" />
			</div>
			<button>Cancel</button>
		</div>
	</div>
	<div id="search_container" class="container">
		{#each results as result, i}
			<div class={selected === i ? "select" : ""} data-name={result.name.split(", ")[0]} data-lat={result.lat} data-lon={result.lon} tabindex={i}>{result.name}</div>
		{/each}
	</div>
</main>

<style>
	button {
		font-size: 10px;
		color: inherit;
		background-image: url(/img/cancel.png);
		background-color: transparent;
		height: 20px;
		border: none;
		margin: 0;
		background-size: 100% 100%;
		width: 50px;
	}

	main {
		position: absolute;
		left: 0;
		top: 0;
		width: 240px;
		height: 294px;
		visibility: hidden;
		transition: transform ease 0.3s, visibility ease 0.3s;
		transform: translateY(294px);
	}

	.bottom {
		margin-top: 3px;
		display: flex;
		justify-content: space-around;
	}

	main.open {
		visibility: visible;
		transform: none;
	}

	.container {
		height: 238px;
		background-color: white;
		overflow: auto;
	}

	.container > * {
		background-image: url(/img/city.png);
		height: 30px;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding: 5px 8px;
		background-size: 100% 100%;
		font-size: 15px;
		font-weight: 500;
		overflow: hidden;
	}

	.container > *.select {
		background-image: url(/img/city_sel.png);
		color: white;
	}

	.container > *:focus {
		filter: brightness(0.8);
	}

	.bar {
		background-image: url(/img/search_bg.png);
		background-size: contain;
		height: 56px;
		color: white;
		font-size: 12px;
		text-align: center;
		padding-top: 12px;
	}

	.input_wrapper {
		position: relative;
		background-size: 78% 100%;
		background-image: url(/img/input_2.png);
		background-position: center;
		width: 180px;
	}
	.input_wrapper::before,
	.input_wrapper::after {
		content: "";
		position: absolute;
		height: 100%;
		background-image: url(/img/input_1.png);
		background-size: cover;
	}

	.input_wrapper::before {
		left: 0;
		width: 30px;
		background-position-x: -5px;
	}

	.input_wrapper::after {
		right: 0;
		background-position: -28px 0px;
		width: 20px;
	}

	input {
		appearance: none;
		background-color: transparent;
		border: none;
		outline: none;
		z-index: 5;
		position: absolute;
		width: 100%;
		left: 0;
		padding-left: 25px;
		padding-right: 8px;
		line-height: 1.5;
	}
</style>
