export function coalesce(...args) {
	for (const arg of args) {
		if (null !== arg && undefined !== arg) return arg;
	}
	return undefined;
}
