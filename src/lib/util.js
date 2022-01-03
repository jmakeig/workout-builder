export function coalesce(...args) {
	for (const arg of args) {
		if (null !== arg && undefined !== arg) return arg;
	}
	return undefined;
}

export function num(number) {
	return new Intl.NumberFormat().format(number);
}

export function millisToMinutes(millis) {
	const s = millis / 1000;
	const minutes = Math.trunc(s / 60);
	const seconds = s % 60;
	const f = (n) => n.toFixed(0).padStart(2, "0");
	return [f(minutes), f(seconds)].join(":");
}
