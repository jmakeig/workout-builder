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

	import { num } from "$lib/util";
</script>

<svelte:head>
	<title>Workout</title>
</svelte:head>

<div class="wrapper">
	<header><h1>Workout</h1></header>
	<nav><pre>#nav</pre></nav>
	<section id="exercise">
		<!-- <pre>#exercise</pre> -->
		{#if $status.matches("idle")}
			<button on:click={(evt) => service.send("start")}>Start</button>
		{/if}

		{#if $status.matches("exercising") || $status.matches("transitioning")}
			<!-- <Print object={$currentExercise} /> -->
			<div style="display: flex; flex-flow: row no-wrap; border-bottom: solid 0.5px var(--slate);">
				<h2 style="flex: 1;">{$currentExercise.info.name}</h2>
				<div style="width: 4em; align: right; line-height: 1; background: yellow;">{num($currentExercise.is + 1)} of {num($currentExercise.of)}</div>
			</div>
		{/if}

		{#if $status.matches("transitioning")}
			Transition…
		{/if}
		{#if $status.matches("done")}
			Done!
		{/if}
	</section>
	<section id="timer">
		<!-- <pre>#timer</pre> -->
		{#if $status.matches("exercising") || $status.matches("transitioning")}
			<Timer
				duration={$currentExercise.instance.duration}
				elapsed={$timer.elapsed}
				interval={$timer.interval}
				state={$status.matches("exercising.timing") ||
				$status.matches("transitioning")
					? $status.toStrings().pop().split(".").pop()
					: undefined}
			/>
		{/if}
	</section>
	<footer>footer</footer>
</div>

<style>
	.wrapper {
		max-width: 1080px;
		margin: 0 auto;
		display: grid;
		grid-gap: 10px;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"exercise"
			"timer"
			"nav"
			"footer";
	}

	@media (min-width: 900px) {
		.wrapper {
			grid-template-columns: repeat(3, 1fr);
			grid-template-areas:
				"header  nav nav"
				"exercise exercise timer"
				"footer  footer  footer";
		}

		nav ul {
			display: flex;
			justify-content: space-between;
		}
	}
	header {
		grid-area: header;
	}
	nav {
		grid-area: nav;
	}
	footer {
		grid-area: footer;
	}

	section#exercise {
		grid-area: exercise;
	}
	section#timer {
		grid-area: timer;
	}
</style>
