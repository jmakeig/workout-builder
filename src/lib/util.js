export function coalesce(...args) {
	for (const arg of args) {
		if (null !== arg && undefined !== arg) return arg;
	}
	return undefined;
}

export function num(number) {
	return new Intl.NumberFormat().format(number);
}

export function millisToMinutes(duration) {
	const values = formatTime(duration).values;
	return [
		values[2].toFixed(0).padStart(2, "0"),
		values[3].toFixed(0).padStart(2, "0")
	].join(":");
}

export function formatTime(duration) {
	//return [(duration / 1000).toFixed(0), "fixmes"];
	const s = 1000;
	const m = s * 60;
	const h = m * 60;
	const d = h * 24;

	const labels = ["day", "hour", "minute", "second"];
	const plural = (w) => w + "s"; // Obviously this isn’t generalizable

	const dhms = [
		duration / d,
		(duration % d) / h,
		(duration % h) / m,
		(duration % m) / s
	].map(Math.trunc);
	return {
		values: dhms,
		toString() {
			return this.values.reduce((str, item, i) => {
				if (item > 1) return [str, item, plural(labels[i])].join(" ");
				if (item > 0) return [str, item, labels[i]].join(" ");
				return str;
			}, "");
		}
	};
}
