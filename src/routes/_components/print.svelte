<script>
	export let object;

	function print(obj) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<pre>{print(object)}</pre>

<style>
	pre {
		height: 8em;
		overflow: auto;

		font-size: 0.75rem;
		border: solid 0.5px #ccc;
		padding: 0.5em;
	}
</style>
