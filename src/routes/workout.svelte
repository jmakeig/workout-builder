<script>
	import { useMachine } from "$lib/useMachine";
	import { timerMachine } from "$lib/timerMachine";

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
			elapsed: 0,
			duration: 15,
			interval: 0.1
		}
	});
	$: console.log("$timer", $timer);
</script>

<h1>Workout</h1>
<div>{$timer.elapsed}</div>
<button on:click={(event) => dispatch("resume")}>Play</button>
<div class="status">{$status.toStrings().pop()}</div>

