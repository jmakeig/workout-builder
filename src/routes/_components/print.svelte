<script>
	export let object;
	export let label = "Debug";

	function print(obj) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<div>
	<div style="font-family: var(--font-mono); font-weight: bold;">{label}</div>
	<pre>{print(object)}</pre>
</div>

<style>
	pre {
		width: 100%;
		max-width: 600px;
		height: 20em;
		overflow: auto;

		font-size: 0.75rem;
		border: solid 0.5px #ccc;
		padding: 0.5em;
	}
</style>
