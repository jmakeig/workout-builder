<script>
	export let object;

	function print(obj) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<pre>{print(object)}</pre>
