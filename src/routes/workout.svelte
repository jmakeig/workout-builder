<script>
	let elapsed;

	import { createMachine, assign, send, interpret, matchesState } from "xstate";

	const timerMachine = createMachine({
		context: {
			timer: {
				elapsed: 0, // milliseconds
				duration: 5 * 1000, // milliseconds
				interval: 0.1 * 1000 // milliseconds
			}
		},
		id: "timer",
		initial: "paused",
		states: {
			running: {
				invoke: {
					src: (context) => (callback) => {
						const interval = setInterval(() => {
							callback("TICK");
						}, context.timer.interval);

						return () => {
							clearInterval(interval);
						};
					}
				},
				always: [
					{
						target: "completed",
						cond: (context) => context.timer.elapsed >= context.timer.duration
					}
				],
				on: {
					pause: {
						target: "paused"
					},
					TICK: {
						actions: [
							assign((context) => {
								return {
									timer: {
										...context.timer,
										elapsed: +(context.timer.elapsed + context.timer.interval)
									}
								};
							}),
							"updateElapsed"
						]
					}
				}
			},
			paused: {
				on: {
					resume: {
						target: "running",
						cond: (context) => context.timer.elapsed < context.timer.duration
					},
					reset: {
						target: "paused",
						cond: (context) => context.timer.elapsed > 0.0,
						actions: assign((context) => {
							return {
								timer: {
									...context.timer,
									elapsed: 0
								}
							};
						})
					}
				}
			},
			completed: {
				type: "final"
			}
		}
	}).withConfig({
		actions: {
			updateElapsed: (context, event) => (elapsed = context.timer.elapsed)
		}
	});

	const workoutMachine = createMachine({
		id: "workout",
		context: {
			workout: {
				circuits: [
					[
						{ exercise: "jog", duration: 2 * 1000 },
						{ exercise: "march", duration: 2 * 1000 },
						{ exercise: "cross-tap", duration: 2 * 1000 },
						{ exercise: "cross-jack", duration: 2 * 1000 },
						{ exercise: "skater", duration: 2 * 1000 }
					]
				].flat() // NOTE!
			},
			current: null
		},
		initial: "idle",
		states: {
			idle: {
				on: {
					start: {
						target: "exercising",
						actions: assign({
							current: (context, event) => increment(context.current)
						})
					}
				}
			},
			transitioning: {
				after: [
					{
						delay: 2000,
						target: "exercising"
					}
				],
				entry: assign({
					current: (context, event) => increment(context.current)
				})
			},
			exercising: {
				entry: send({ type: "resume" }, { to: "timerService" }),
				invoke: {
					src: timerMachine,
					id: "timerService",
					// https://github.com/statelyai/xstate/issues/327#issuecomment-475699760
					/*
				data: (context, event) => ({
					...timerMachine.context, // initial context
					timer: {
						...timerMachine.context.timer,
						duration: context.workout.circuits[context.current].duration * 1000
					}
				}),
				*/
					data: (context, event) =>
						initTimer(
							timerMachine.context,
							context.workout.circuits[context.current].duration
						),
					onDone: [
						{
							target: "transitioning",
							cond: (context, event) =>
								context.current < context.workout.circuits.length - 1
						},
						{
							target: "done"
						}
					]
				}
			},
			done: {
				type: "final"
			}
		}
	});

	function increment(current) {
		if (null === current) return 0;
		return current + 1;
	}
	/** Initialize timer context using its default context */
	function initTimer(defaultContext, duration) {
		return {
			...defaultContext,
			timer: {
				...defaultContext.timer,
				duration
			}
		};
	}

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
		"cross-tap": {},
		jog: {},
		march: {},
		skater: {}
	};

	const service = interpret(workoutMachine); //.withContext(workout));

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

	const currentExercise = derived(status, ($status) =>
		null === $status.context.current
			? null
			: $status.context.workout.circuits[$status.context.current]
	);

	import Timer from "./_components/timer.svelte";

	import Print from "./_components/print.svelte";
	$: console.log("current", $status.context.current);
	$: console.log("circuits", $status.context.workout.circuits);
	$: console.log(
		"exercise",
		null === $status.context.current
			? null
			: $status.context.workout.circuits[$status.context.current]
	);
</script>

<svelte:head>
	<title>Workout</title>
</svelte:head>

<h1>Workout</h1>
{#if $status.matches("idle")}
	<button on:click={(evt) => service.send("start")}>Start</button>
{/if}
<!-- <Print object={$status.context} /> -->

{#if $status.matches("exercising")}
	<Print object={$currentExercise} />

	<Timer duration={$currentExercise.duration} {elapsed} />
{/if}
{#if $status.matches("transitioning")}
	Transition…
{/if}
{#if $status.matches("done")}
	Done!
{/if}
