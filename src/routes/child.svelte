<script>
	export let duration;
	export let elapsed;

	export function start(handler) {
		const interval = 0.1 * 1000;
		const timeout = setInterval(() => {
			if (elapsed <= duration * 1000) {
				elapsed += interval;
			} else {
				clearInterval(timeout);
				handler();
			}
		}, interval);
		return () => clearInterval(timeout);
	}
</script>

<div style="background: #eee; padding: 0.5em;">
	<button on:click={() => start(() => console.log("Completed timer"))}>
		Start timer
	</button>
	<ul>
		<li>Duration: {duration}</li>
		<li>Elpased: {elapsed}</li>
	</ul>
</div>
