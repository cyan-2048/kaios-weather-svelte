<script>
	export let selected;
	export let data = {};
	export let fahrenheit;
	export let retry;
	import Forecast from "./Forecast.svelte";
	import { createEventDispatcher } from "svelte";
	const dispatcher = createEventDispatcher();

	import { getData, search, convert, getLocation, getName } from "./lib/weather.js";

	function dispatch(name, out) {
		data = out;
		return dispatcher(name, out);
	}

	let update = async () => {
		let { longitude, latitude, name, type, region } = data;

		async function locate() {
			let { longitude, latitude } = await getLocation();
			let wait = await getData(latitude, longitude);
			if (!wait) return;
			let name = await getName(latitude, longitude);
			console.log(wait);
			dispatch("update", { ...data, name, ...wait });
		}

		async function findName(e) {
			let find = await search(e || name || region);
			name = find[0].name;
			let wait = await getData(name || e || region);
			if (!wait) return;
			dispatch("update", { ...data, name, ...wait });
		}
		async function latlong() {
			let wait = await getData(latitude, longitude);
			let n = name && name !== "..." ? name : await getName(latitude, longitude);
			if (!wait) {
				findName(n);
			} else {
				console.log(wait);
				dispatch("update", { ...data, name: n, ...wait });
			}
		}

		if (type === "locate") locate();
		else if (longitude && latitude) latlong();
		else if (name) findName();
	};

	setTimeout(update, 100);

	$: retry === true && update(), dispatcher("retry");
	$: current = (data && data.current) || {};

	let getWeather = () => {
		let current = data.current?.weather[0];
		return current ? current : { day: true, temp: 31, icon: "02" };
	};

	let degrees = (e) => {
		if (!e) return "...";
		return (fahrenheit ? convert(e) : e).toFixed(0) + "°";
	};
</script>

<main class="{selected ? 'card_selected' : ''} {current.day ? '' : 'dark'}">
	<img src="/img/weather/{current.icon + (current.day ? 'd' : 'n')}.png" alt={current.description} />
	<div class="wrapper">
		<div class="top {current.day ? '' : 'dark'}">
			<div class="city">{data.name || data.region || "..."}</div>
			<div class="temperature">{degrees(current.temp)}</div>
		</div>
		<div class="container">
			{#each (data.daily || []).slice(1) as o}
				<Forecast dark={!current.day} min={o.min_temp || "??"} max={o.max_temp || "??"} icon={o.icon + "d"} day={o.day || "??"} {fahrenheit} />
			{/each}
		</div>
	</div>
	<slot />
</main>

<style>
	.top {
		display: flex;
		justify-content: space-between;
		background-image: url("/img/divider.png");
		background-attachment: local;
		background-size: 1px;
		background-position: bottom;
		background-repeat: repeat-x;
	}

	.top.dark {
		background-image: url("/img/divider_n.png");
	}

	.top .temperature {
		font-size: 28px;
		position: absolute;
		right: 4px;
		top: 3px;
		font-weight: 300;
	}

	.city {
		font-size: 15px;
		font-weight: 600;
		line-height: 2;
	}

	img {
		position: absolute;
		height: 70px;
		top: -2px;
		width: 240px;
		margin-left: -12px;
		object-fit: contain;
		text-align: center;
		line-height: 5.2;
	}

	div.wrapper {
		padding: 10px;
		position: relative;
		margin-top: 18px;
	}

	main {
		background-size: 100% 100%;
		background-color: black;
		width: 240px;
		height: 294px;
		background-image: url("/img/card_day.png");
		padding: 25px 12px;
		display: inline-block;
		color: white;
	}
	main.dark {
		background-image: url("/img/card_night.png");
	}
</style>
