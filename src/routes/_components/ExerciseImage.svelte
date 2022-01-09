<script>
	export let id;
	export let alt = "";
</script>

<!-- <img
				src="/exercises/{id}.svg"
				alt
				title={alt}
				style="color: orange; width: 300; display: block; margin: 1em auto;"
			/> -->
<img
	style="-webkit-mask: url(/exercises/{id}.svg) no-repeat center / contain; 
	mask: url(/exercises/{id}.svg) no-repeat center / contain"
	alt
	title={alt}
/>

<style>
	/* https://stackoverflow.com/a/43916743 */
	img {
		display: block;
		width: 320px;
		height: 320px;
		margin: 0.5em auto;
		background-color: var(--stone);
	}
</style>
