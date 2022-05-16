<script>
	export let min;
	export let max;
	export let fahrenheit;
	export let day;
	export let icon;
	export let dark;

	import { convert } from "./lib/weather.js";

	let degrees = (e) => e.toFixed(0) + "°";
</script>

<main class={dark ? "dark" : ""}>
	<div class="day">{day}</div>
	<img src="/img/weather/{icon}.png" alt={icon} />
	<div class="temperature">
		{degrees(fahrenheit ? convert(min) : min)} <span>{degrees(fahrenheit ? convert(max) : max)}</span>
	</div>
</main>

<style>
	.temperature span {
		opacity: 0.4;
	}
	main {
		display: flex;
		font-size: 12px;
		justify-content: space-between;
		background-image: url("/img/divider.png");
		background-attachment: local;
		background-size: 1px;
		background-position: bottom;
		background-repeat: repeat-x;
		line-height: 1.9;
		font-weight: 600;
	}
	main.dark {
		background-image: url("/img/divider_n.png");
	}
	.day {
		width: 70px;
	}
	img {
		height: 20px;
	}
</style>
