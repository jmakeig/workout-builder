<script>
	import { createMachine } from "xstate";

	import Child from "./child.svelte"
	let child;
	let status = "uninitialized";

	const service = {
		send(message) {
			child.start(() => (status = "timer done"));
		}
	};
</script>

<h1>
	Parent: {status}
</h1>
<button on:click={(evt) => service.send("start")}> Send </button>
<Child duration={5} elapsed={0} bind:this={child} />
