<script>
	import { useMachine } from "$lib/useMachine";
	import { timerMachine } from "$lib/timerMachine";

	export let duration = 30; // seconds

	const { status, timer, dispatch } = useMachine(timerMachine, {
		timer: {
			elapsed: 0, // milliseconds
			duration: duration * 1000, // milliseconds
			interval: 0.1 * 1000 // milliseconds
		}
	});
	$: console.log("$timer", $timer);
</script>

<div>{($timer.elapsed / 1000).toFixed(2)}</div>
{#if $status.matches("paused")}
	<button on:click={(event) => dispatch("resume")}>Play</button>
{:else if $status.matches("running")}
	<button on:click={(event) => dispatch("pause")}>Pause</button>
{/if}
<div class="status">{$status.toStrings().pop()}</div>
