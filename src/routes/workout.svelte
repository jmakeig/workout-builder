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

	const currentExercise = derived(status, ($status) => {
		console.warn("Dummy implemenation of $currentExercise");
		return {
			instance: {
				exercise: "jog",
				duration: 10 * 1000
			},
			info: {
				name: "Jog",
				description: "Run in place, kicking your heels up behind you."
			},
			is: 1,
			of: 5,
			next: {
				instance: {
					exercise: "march",
					duration: 10 * 1000
				},
				info: {
					name: "March",
					description:
						"Alternate raising your knees above your waistline, pumping the opposite arm."
				}
			}
		};
		/*
		const instance =
			null === $status.context.current
				? null
				: $status.context.workout.circuits[$status.context.current];
		const nextIndex =
			null === $status.context.current
				? 0
				: $status.context.current ===
				  $status.context.workout.circuits.length - 1
				? null
				: $status.context.current + 1;
		return {
			instance,
			//info: instance && instance.exercise ? exercises[instance.exercise] : null,
			info: instance ? exercises[instance.exercise] : null,
			is: $status.context.current,
			of: $status.context.workout.circuits.length,
			next:
				null === nextIndex
					? null
					: {
							instance: $status.context.workout.circuits[nextIndex],
							info: exercises[
								$status.context.workout.circuits[nextIndex].exercise
							]
					  }
		};
	  */
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
	import { start } from "xstate/lib/actions";
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
			<button
				on:click={(evt) => service.send("start")}
				style="width: 8em; height: 8em; color: var(--green); background: none; border: solid 1px transparent; border-radius: 1em;"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="square"
						stroke-linejoin="square"
						stroke-width="0.5"
						fill="currentColor"
						d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Start</button
			>
		{/if}

		{#if $status.matches("exercising")}
			<div
				style="display: flex; flex-flow: row; align-items: baseline; border-bottom: solid 2px var(--slate);"
			>
				<h2 style="flex: 1;">{$currentExercise.info.name}</h2>
				<div style="width: 4em; text-align: right; font-weight: bold;">
					{num($currentExercise.is + 1)} of {num($currentExercise.of)}
				</div>
			</div>
			<div class="info">
				<p>{$currentExercise.info.description}</p>
			</div>
		{/if}

		{#if $status.matches("transitioning")}
			<div>
				Up next: {$currentExercise.next.info.name} ({millisToMinutes(
					$currentExercise.next.instance.duration
				)})
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
				duration={$currentExercise.instance.duration}
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
	<Print object={$status.value} />
	<Print object={$status.context} />
	<Print object={$currentExercise} />
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
		font-size: 0.8em;
	}

	section#exercise {
		grid-area: exercise;
	}
	section#timer {
		grid-area: timer;
	}
</style>
