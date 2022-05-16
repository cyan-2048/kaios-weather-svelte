const baseURLs = {
	owm: "https://api.openweathermap.org/data/2.5/",
	accu: "http://dataservice.accuweather.com/locations/v1/",
};

const keys = {
	owm: "0ab18107684f7284d695f3c4db4a2263",
	accu: "eayMDLJ0sNEFEla3YQwhAbkOuu1KkFau",
};

async function getData(lat, lon) {
	let responseData = await fetch(baseURLs.owm + `onecall?lat=${lat}&lon=${lon}&appid=${keys.owm}&exclude=minutely,hourly,alerts&units=metric`);
	let data = await responseData.json();
	return data;
}

async function search(city) {
	let responseData = await fetch(baseURLs.accu + `cities/search?apikey=${keys.accu}&q=` + encodeURIComponent(city));
	let data = await responseData.json();
	return data;
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
	return new Promise((res, err) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(res, err, {
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
