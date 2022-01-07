<script>
	import { interpret, matchesState } from "xstate";
	import { workoutMachine } from "$lib/workoutMachine";

	const service = interpret(workoutMachine);

	import { readable, derived } from "svelte/store";
	// const status = readable(workoutMachine.initialState, (set) => {
	// 	service
	// 		.onTransition((state) => {
	// 			if (false !== state.changed) {
	// 				console.log("Transition", state.value);
	// 				set(state);
	// 			}
	// 		})
	// 		.onDone((state) => console.log("Workout machine done"))
	// 		.start();
	// 	return () => service.stop();
	// });
	const status = service.start(); // Services are Stores!

	const exercise = derived(status, ($status) => {
		return {
			current: $status.context.currentExercise,
			is: $status.context.current,
			of: $status.context.workout
				? $status.context.workout.circuits.length
				: undefined,
			next: $status.context.nextExercise
		};
	});

	const timer = derived(status, ($status) => {
		function mapStatus(s) {
			switch (true) {
				case s.matches("transitioning"):
					return "transitioning";
				case s.matches("exercising.timing.running"):
					return "running";
				case s.matches("exercising.timing.warning"):
					return "warning";
				default:
					s.value;
			}
		}
		return {
			elapsed: $status.context.timer.elapsed,
			duration:
				null === $status.context.current
					? null
					: $status.context.workout.circuits[$status.context.current].duration,
			interval: $status.context.timer.interval,
			status: mapStatus($status)
		};
	});

	import Timer from "./_components/timer.svelte";

	import Print from "./_components/print.svelte";

	import { num, millisToMinutes } from "$lib/util";
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

		{#if $status.matches("exercising")}
			<div
				style="display: flex; flex-flow: row; align-items: baseline; border-bottom: solid 2px var(--slate);"
			>
				<h2 style="flex: 1;">{$exercise.current.info.name}</h2>
				<div style="width: 4em; text-align: right; font-weight: bold;">
					{num($exercise.is + 1)} of {num($exercise.of)}
				</div>
			</div>
			<div class="info">
				<p>{$exercise.current.info.description}</p>
			</div>
		{/if}

		{#if $status.matches("transitioning")}
			<div>
				{#if $exercise.next && $exercise.next.info}
					Up next: {$exercise.next.info.name} ({millisToMinutes(
						$exercise.next.instance.duration
					)})
				{:else}
					Get ready…
				{/if}
			</div>
		{/if}

		{#if $status.matches("done")}
			Done!
		{/if}
	</section>
	<section id="timer">
		<!-- <pre>#timer</pre> -->
		{#if $status.matches("exercising") || $status.matches("transitioning")}
			<Timer
				duration={$exercise.current && $exercise.current.instance
					? $exercise.current.instance.duration
					: 1}
				elapsed={$timer.elapsed}
				interval={$timer.interval}
				state={$timer.status}
			/>
		{/if}
	</section>
	<footer>
		<a href="https://github.com/jmakeig/workout-builder"
			>https://github.com/jmakeig/workout-builder</a
		>
	</footer>
</div>

<!-- 
<Print object={$status.value} label="$status.value" />
<Print object={$status.context} label="$status.context" />
<Print object={$exercise} label="$exercise" /> 
-->
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
		font-size: 0.8em;
	}

	section#exercise {
		grid-area: exercise;
	}
	section#timer {
		grid-area: timer;
	}
</style>
