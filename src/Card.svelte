<script>
	export let selected;
	export let data = [];
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
		try {
			let { longitude, latitude, name, type, data: info } = data;
			if (type === "locate") {
				let { longitude, latitude } = await getLocation();
				let wait = await getData(latitude, longitude);
				let name = await getName(latitude, longitude);
				console.log(wait);
				let { current, daily } = wait;
				dispatch("update", { ...data, name, latitude, longitude, current, daily, data: wait });
			} else if (longitude && latitude) {
				let wait = await getData(latitude, longitude);
				let n = name ? name : await getName(latitude, longitude);
				console.log(wait);
				let { current, daily } = wait;
				dispatch("update", { ...data, name: n, current, daily, data: wait });
			} else if (name) {
				let find = await search(name);
				let { Latitude: latitude, Longitude: longitude } = find[0].GeoPosition;
				let wait = await getData(latitude, longitude);
				let name = await getName(latitude, longitude);
				console.log(wait);
				let { current, daily } = wait;
				dispatch("update", { ...data, name, latitude, longitude, current, daily, data: wait });
			}
		} catch (e) {
			console.error(e);
		}
	};

	setTimeout(update, 100);

	$: retry === true && update(), dispatcher("retry");

	let getWeather = () => {
		let current = data.current?.weather[0];
		return current ? current : { id: 300, main: "Drizzle", description: "light intensity drizzle", icon: "09d" };
	};

	let degrees = (e) => {
		if (!e) return "...";
		return (fahrenheit ? convert(e) : e).toFixed(0) + "°";
	};
</script>

<main class="{selected ? 'card_selected' : ''} {getWeather().icon.endsWith('d') ? '' : 'dark'}">
	<img src="/img/weather/{getWeather().icon}.png" alt="{getWeather().description}}" />
	<div class="wrapper">
		<div class="top {getWeather().icon.endsWith('n') ? 'dark' : ''}">
			<div class="city">{data.name || "..."}</div>
			<div class="temperature">{degrees(data.current?.temp)}</div>
		</div>
		<div class="container">
			{#each (data?.daily || []).slice(1).map((a) => {
				let { min, max } = a.temp;
				let { icon } = a.weather[0];
				return { min, max, icon, day: new Date(a.dt * 1000).toLocaleDateString([], { weekday: "long" }) };
			}) as o}
				<Forecast dark={(getWeather().icon || "d").endsWith("n")} min={o.min || "??"} max={o.max || "??"} icon={o.icon} day={o.day || "??"} {fahrenheit} />
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
		width: 100%;
		margin-left: -12px;
		object-fit: contain;
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
