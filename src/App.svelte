<script>
	import Card from "./Card.svelte";
	import Dots from "./Dots.svelte";
	import Flip from "./Flip.svelte";
	import Options from "./Options.svelte";
	import storage from "./lib/store.js";
	import Search from "./Search.svelte";

	let locate = {
		type: "locate",
	};
	let demo_cities = [{ name: "New York" }, { name: "Paris" }, { name: "Davao" }];
	let store = storage("store", {
		selected: 0,
		fahrenheit: false,
		array: [locate, ...demo_cities],
		lastUpdate: { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
	});

	let selected = $store.selected;
	let flip = "front";
	let array = $store.array;
	let fahrenheit = $store.fahrenheit;
	let lastUpdate = $store.lastUpdate;
	let search = false;

	let updateStore = () => store.set({ array, lastUpdate, fahrenheit, selected });
	$: array, lastUpdate, fahrenheit, selected, updateStore();

	let scroll = (sync) =>
		setTimeout(() => {
			let el = document.querySelector(".card_selected");
			if (el) el.scrollIntoView({ behavior: sync ? "auto" : "smooth" });
		}, 10);

	scroll(true);

	window.addEventListener("keydown", (e) => {
		if (flip == "back" || search) return;
		let { key } = e;
		if (key.includes("Arrow")) {
			if (/Left|Right/.test(key)) e.preventDefault();
			if (key.includes("Left")) {
				if (selected != 0) {
					selected = selected - 1;
					scroll();
				}
			} else {
				if (selected != array.length - 1) {
					selected = selected + 1;
					scroll();
				}
			}
		}
	});

	let retry = false;

	window.addEventListener("keyup", (e) => {
		if (flip == "back" || search) return;
		let { key } = e;
		if (/SoftRight|=/.test(key)) {
			flip = flip == "front" ? "back" : "front";
		}
		if (/SoftLeft|-/.test(key)) {
			if (!retry) retry = true;
		}
	});

	let eventHandler = (e) => {
		switch (e.type) {
			case "degrees":
				fahrenheit = !fahrenheit;
				break;
			case "done":
				flip = "front";
				break;
			case "add":
				search = true;
				break;
		}
	};

	let handleUpdate = (index, update) => {
		lastUpdate = { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() };
		console.log("handling updatee");
		array[index] = update.detail;
	};

	let hideSearch = () => {
		search = false;
	};
	let handleAdd = (e) => {
		let { name, lat: latitude, lon: longitude } = e.detail;
		array = [...array, { name, latitude, longitude }];
		hideSearch();
	};
</script>

<main>
	<Flip select={flip}>
		<div slot="back">
			<Options on:add={eventHandler} on:degrees={eventHandler} on:done={eventHandler} hidden={flip == "front" || search} degrees={fahrenheit} data={array} />
		</div>
		<div slot="front">
			{#each array as data, i}
				<Card on:retry={() => (retry = false)} {retry} {fahrenheit} on:update={(e) => handleUpdate(i, e)} {data} selected={selected === i}>
					<div class="card_bottom">
						<div class="retry" />
						<div class="card_center"><b>Updated</b> {$store.lastUpdate.date} <b>{$store.lastUpdate.time}</b></div>
						<div class="info" />
					</div>
				</Card>
			{/each}
		</div>
	</Flip>
	<Search on:add={handleAdd} on:hide={hideSearch} hidden={!search} />
	<Dots hidden={flip === "back" || search} max={array.length} {selected} />
</main>

<style>
	.info,
	.retry {
		width: 20px;
		height: 20px;
		background-size: 32px;
		background-position: center;
	}
	.info {
		background-image: url("/img/info.png");
	}
	.retry {
		background-image: url("/img/retry.png");
	}
	.card_bottom {
		position: absolute;
		width: 218px;
		margin-top: -8px;
		margin-left: -1px;
		height: 26px;
		font-size: 10px;
		display: flex;
		align-items: center;
		justify-content: space-around;
	}
	main {
		background-color: black;
		position: relative;
	}
	[slot="front"],
	[slot="back"] {
		width: 240px;
		height: 294px;
	}
	[slot="front"] {
		white-space: nowrap;
		overflow: hidden;
	}
	[slot="back"] {
		background-image: url("/img/options_bg.png");
	}

	[slot="front"],
	[slot="back"] {
		top: 0;
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
	}

	[slot="back"] {
		transform: rotateY(180deg);
	}
</style>
