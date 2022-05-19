const baseURLs = {
	owm: "https://api.openweathermap.org/data/2.5/",
};

const keys = {
	owm: "0ab18107684f7284d695f3c4db4a2263",
};

async function getData_legacy(lat, lon) {
	let responseData = await fetch(baseURLs.owm + `onecall?lat=${lat}&lon=${lon}&appid=${keys.owm}&exclude=minutely,hourly,alerts&units=metric`);
	let data = await responseData.json();
	return data;
}

function convertTo24(time, modifier) {
	let hours = Number(time.split(":")[0]);
	if (hours === 12) hours = 0;
	if (modifier === "PM") {
		hours = parseInt(hours, 10) + 12;
	}
	return hours;
}

function weatherID(e) {
	let text = String(e).toLowerCase().replaceAll(" ", "");
	let map = {
		clear: "01",
		sunny: "01",

		mostlysunny: "02",
		partlysunny: "02",
		partlycloudy: "02",
		mostlysunny: "02",
		mostlycloudy: "02",
		isolatedclouds: "02",

		cloudy: "03",

		overcast: "04",

		rain: "09",
		chanceofrain: "09",

		showers: "10",
		scatteredshowers: "10",
		lightrain: "10",

		scatteredthunderstorms: "11",
		isolatedthunderstorms: "11",
		chanceofstorm: "11",
		storm: "11",
		chanceoftstorm: "11",

		fogormist: "50",
		mist: "50",
		dust: "50",
		fog: "50",
		smoke: "50",
		haze: "50",

		snow: "13",
		freezingdrizzle: "13",
		lightsnow: "13",
		blizzard: "13",
		rainandsnow: "13",
		sleet: "13",
		chanceofsnow: "13",
		sleet: "13",
		icy: "13",
		hail: "13",
		snowshowers: "13",
		flurries: "13",
	};
	return map[text] || map[Object.keys(map).find((a) => text.includes(a) || a.includes(text))];
}

function getLocaleWeekdays(locale = []) {
	let arr = [];
	for (let i = 0; i < 7; i++) {
		arr.push(new Date(1970, 0, 4 + i).toLocaleDateString(locale, { weekday: "long" }));
	}
	return arr;
}

function getWeekMap(en) {
	let obj = {};
	let locale = getLocaleWeekdays(en);
	getLocaleWeekdays("en-us").forEach((e, i) => {
		obj[e] = locale[i];
	});
	return obj;
}

function mapWeather(a) {
	if (!a) return a;
	let obj = {};
	if (a.dayhour) {
		let hour = convertTo24(...a.dayhour.split(" ").slice(1));
		obj.day = !!(hour > 5 && hour < 18);
	}
	["temp", "max_temp", "min_temp"].forEach((e) => {
		if (e in a) obj[e] = a[e].c;
	});
	if (a.day) obj.day = getWeekMap()[a.day] || a.day;
	if (a.comment) {
		obj.icon = weatherID(a.comment) || "01";
		obj.description = a.comment;
	}
	return obj;
}

async function getData() {
	let query = [...arguments].join(",");
	let responseData = await fetch("https://weatherdbi.herokuapp.com/data/weather/" + encodeURIComponent(query));
	let data = await responseData.json();
	if (data.status === "fail") {
		console.error(data);
		return null;
	}
	console.log(data, ...arguments);
	return {
		region: data.region,
		current: mapWeather(data.currentConditions) || {},
		daily: data.next_days?.map(mapWeather) || [],
	};
}

async function search(city) {
	let responseData = await fetch(`http://geodb-free-service.wirefreethought.com/v1/geo/cities?namePrefix=${encodeURIComponent(city)}&sort=-population`);
	let data = await responseData.json();
	return data.data || [];
}

async function getName(lat, lon) {
	let responseData = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
	let data = await responseData.json();
	return data.city;
}

function convert(celsius) {
	return (celsius * 9) / 5 + 32;
}

function geolocation() {
	let returned = false;
	return new Promise((res, err) => {
		if (navigator.geolocation) {
			function done() {
				if (returned) return;
				returned = true;
				res(...arguments);
			}
			function error() {
				if (returned) return;
				returned = true;
				err(...arguments);
			}

			setTimeout(() => {
				if (!returned) error();
			}, 5000);

			navigator.geolocation.getCurrentPosition(done, error, {
				timeout: 5000,
				maximumAge: Infinity,
			});
		} else err("not supported");
	});
}

async function getLocation() {
	try {
		let geo = await geolocation();
		let { latitude, longitude } = geo.coords;
		return { latitude, longitude };
	} catch (e) {
		let res = await fetch("https://ipapi.co/json/");
		let data = await res.json();
		let { latitude, longitude } = data;
		return { latitude, longitude };
	}
}

export { getData, search, convert, getLocation, getName };
