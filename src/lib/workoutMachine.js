import { createMachine, assign, send } from "xstate";

export const workoutMachine = createMachine({
	id: "workout",
	/*
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
		current: null,
		timer: {
			elapsed: 0, // milliseconds
			interval: 0.1 * 1000 // milliseconds
		}
	},
	*/
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
					target: "exercising",
					cond: (context, event) =>
						context.current < context.workout.circuits.length - 1,
					actions: assign({
						current: (context, event) => increment(context.current)
					})
				},
				{
					target: "done",
					delay: 500,
					cond: (context, event) =>
						context.current >= context.workout.circuits.length - 1
				}
			]
		},
		exercising: {
			id: "exercising",
			initial: "initializing",
			states: {
				initializing: {
					entry: assign((context) => {
						return {
							...context,
							timer: {
								...context.timer,
								elapsed: 0
							}
						};
					}),
					always: "running"
				},
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
							cond: (context) => {
								return (
									context.timer.elapsed >=
									context.workout.circuits[context.current].duration
								);
							}
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
								})
							]
						}
					}
				},
				paused: {
					on: {
						resume: {
							target: "running"
						}
					}
				},
				completed: {
					always: [{ target: "#workout.transitioning" }]
				}
			}
			// on: {
			//   reset: ".initializing",
			// },
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
