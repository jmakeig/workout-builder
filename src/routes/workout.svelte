<script>
	import { createMachine, assign, send, interpret } from "xstate";

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
						actions: assign((context) => {
							return {
								timer: {
									...context.timer,
									elapsed: +(context.timer.elapsed + context.timer.interval)
								}
							};
						})
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
	});

	const workoutMachine = createMachine({
		id: "workout",
		context: {
			workout: {
				circuits: [
					[
						{ exercise: "jog", duration: 2 },
						{ exercise: "march", duration: 2 },
						{ exercise: "cross-tap", duration: 2 },
						{ exercise: "cross-jack", duration: 2 },
						{ exercise: "skater", duration: 2 }
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
						target: "exercising"
					}
				}
			},
			exercising: {
				entry: [
					assign({
						current: (context, event) => increment(context.current)
					}),
					send({ type: "resume" }, { to: "timerService" })
				],
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
							context.workout.circuits[context.current].duration * 1000
						),
					onDone: [
						{
							target: "exercising",
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

	const service = interpret(workoutMachine);

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

	// const exercise = derived(
	// 	status,
	// 	($status) => $status.context.cicruits[$status.context.current]
	// );
</script>

<h1>Workout</h1>
<button on:click={(evt) => service.send("start")}>Start</button>
<pre>{JSON.stringify($status.context, null, 2)}</pre>
