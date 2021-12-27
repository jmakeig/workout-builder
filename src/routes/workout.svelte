<script>
	import { useMachine } from "$lib/useMachine";
	import { timerMachine } from "$lib/timerMachine";
	import { matchesState } from "xstate";

	let workout = {
		circuits: [
			[
				{
					type: "exercise",
					activity: "burpee",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				},
				{
					type: "exercise",
					activity: "jump-squat",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				},
				{
					type: "exercise",
					activity: "curtsy-lunge",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				}
			]
		]
	};

	const { status, timer, dispatch } = useMachine(timerMachine, {
		timer: {
			elapsed: 0, // milliseconds
			duration: 7 * 1000, // milliseconds
			interval: 0.1 * 1000 // milliseconds
		}
	});
	$: console.log("$timer", $timer);
</script>

<h1>Workout</h1>
<div>{($timer.elapsed / 1000).toFixed(2)}</div>
{#if $status.matches("paused")}
	<button on:click={(event) => dispatch("resume")}>Play</button>
{:else if $status.matches("running")}
	<button on:click={(event) => dispatch("pause")}>Pause</button>
{/if}
<div class="status">{$status.toStrings().pop()}</div>
