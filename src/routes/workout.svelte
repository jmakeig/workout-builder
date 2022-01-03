<script>
	const exercises = {
		"cross-jack": {
			name: "Cross Jack",
			description:
				"Two full jumping jacks. Hands behind head. Touch elbow to opposite knee.",
			modifications: {
				easier: "",
				harder: ""
			}
		},
		"cross-tap": {
			name: "Cross Tap"
		},
		jog: {
			name: "Jog"
		},
		march: {
			name: "March"
		},
		skater: {
			name: "Skater"
		}
	};

	import { interpret, matchesState } from "xstate";
	import { workoutMachine } from "$lib/workoutMachine";

	const initialContext = {
		workout: {
			circuits: [
				[
					{ exercise: "jog", duration: 15 * 1000 },
					{ exercise: "march", duration: 15 * 1000 },
					{ exercise: "cross-tap", duration: 15 * 1000 },
					{ exercise: "cross-jack", duration: 15 * 1000 },
					{ exercise: "skater", duration: 15 * 1000 }
				]
			].flat() // NOTE!
		},
		current: null,
		timer: {
			elapsed: 0, // milliseconds
			interval: 0.1 * 1000, // milliseconds
			warning: 5 * 1000 // milliseconds
		}
	};
	const service = interpret(workoutMachine.withContext(initialContext));

	import { readable, derived } from "svelte/store";
	const status = readable(workoutMachine.initialState, (set) => {
		service
			.onTransition((state) => {
				if (false !== state.changed) {
					console.log("Transition", state.value);
					set(state);
				}
			})
			.onDone((state) => console.log("Workout machine done"))
			.start();
		return () => service.stop();
	});

	const currentExercise = derived(status, ($status) => {
		const instance =
			null === $status.context.current
				? null
				: $status.context.workout.circuits[$status.context.current];
		return {
			instance,
			//info: instance && instance.exercise ? exercises[instance.exercise] : null,
			info: instance ? exercises[instance.exercise] : null,
			is: $status.context.current,
			of: $status.context.workout.circuits.length
		};
	});

	const timer = derived(status, ($status) => ({
		elapsed: $status.context.timer.elapsed,
		duration:
			null === $status.context.current
				? null
				: $status.context.workout.circuits[$status.context.current].duration,
		interval: $status.context.timer.interval
	}));

	import Timer from "./_components/timer.svelte";

	import Print from "./_components/print.svelte";

	import {num} from "$lib/util";
</script>

<svelte:head>
	<title>Workout</title>
</svelte:head>

<h1>Workout</h1>
{#if $status.matches("idle")}
	<button on:click={(evt) => service.send("start")}>Start</button>
{/if}

{#if $status.matches("exercising") || $status.matches("transitioning")}
	<Print object={$currentExercise} />
	<h1>{$currentExercise.info.name}</h1>
	<div>{num($currentExercise.is + 1)} of {num($currentExercise.of)}</div>
	<Timer
		duration={$currentExercise.instance.duration}
		elapsed={$timer.elapsed}
		interval={$timer.interval}
		state={$status.matches("exercising.timing")
			? $status.toStrings().pop().split(".").pop()
			: undefined}
	/>
{/if}
{#if $status.matches("exercising.timing.warning")}
	<div style="color: red;">warning</div>
{/if}
{#if $status.matches("transitioning")}
	Transition…
{/if}
{#if $status.matches("done")}
	Done!
{/if}
