function centerScroll(el, sync) {
	const rect = el.getBoundingClientRect();
	const elY = rect.top + rect.height / 2;
	el.parentNode.scrollBy({
		left: 0,
		top: elY - window.innerHeight / 2,
		behavior: sync ? "auto" : "smooth",
	});
}

export { centerScroll };
