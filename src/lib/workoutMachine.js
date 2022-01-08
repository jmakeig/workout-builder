/* https://stately.ai/viz/7abfed3c-18e1-400f-a240-34a1247decd6 */

import { createMachine, assign } from "xstate";

const TRANSITION_DELAY = 1500;
const machineConfig = {
	id: "workout",

	context: {
		workout: null, // { circuits: [], exercises: {}}
		current: null,
		currentExercise: null,
		nextExercise: null,
		timer: {
			elapsed: 0, // milliseconds
			interval: 0.1 * 1000, // milliseconds
			warning: 5 * 1000 // milliseconds
		}
	},
	initial: "idle",
	states: {
		idle: {
			on: {
				initialize: {
					target: "initializing"
				}
			}
		},
		initializing: {
			invoke: {
				id: "workoutService",
				src: "workoutService",
				onDone: {
					target: "ready",
					actions: [assign({ workout: (context, event) => event.data })]
				},
				onError: {
					target: "error",
					actions: [assign({ error: (context, event) => event.data })]
				}
			}
		},
		error: {},
		ready: {
			on: {
				start: "transitioning"
			}
		},
		transitioning: {
			after: [
				{
					delay: TRANSITION_DELAY,
					target: "exercising",
					actions: [
						assign({
							current: (context, event) =>
								null === context.current ? 0 : context.current + 1
						})
					]
				}
			]
		},
		exercising: {
			id: "exercising",
			initial: "initializing",
			states: {
				initializing: {
					entry: [
						// reset timer
						assign((context) => {
							return {
								...context,
								timer: {
									...context.timer,
									elapsed: 0
								}
							};
						}),
						assign({
							currentExercise: (context, event) => ({
								info: context.workout.exercises[
									context.workout.circuits[context.current].exercise
								],
								instance: context.workout.circuits[context.current]
							})
						}),
						assign({
							nextExercise: (context, event) => {
								if (context.current < context.workout.circuits.length - 1)
									return {
										info: context.workout.exercises[
											context.workout.circuits[context.current + 1].exercise
										],
										instance: context.workout.circuits[context.current + 1]
									};
								return null;
							}
						})
					],
					always: "timing"
				},
				timing: {
					initial: "running",
					states: {
						running: {
							always: [
								{
									target: "warning",
									cond: (context) =>
										context.timer.elapsed >=
										context.workout.circuits[context.current].duration -
											context.timer.warning
								}
							]
						},
						warning: {}
					},
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
						/*
					pause: {
						target: "paused"
					},
					*/
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
				/*
			paused: {
				on: {
					resume: {
						target: "timing"
					}
				}
			},
			*/
				completed: {
					always: [
						{
							target: "#workout.transitioning",
							cond: (context) =>
								context.current < context.workout.circuits.length - 1
						},
						{
							target: "#workout.done",
							cond: (context) =>
								context.current >= context.workout.circuits.length - 1
						}
					]
				}
			}
		},
		done: {
			type: "final"
		}
	}
};

/**
 *
 * @param {function} fetchWorkout Implementation of (id) => Promise<Workout>
 * @returns {StateMachine}
 */
export function workoutMachine(fetchWorkout) {
	return createMachine(machineConfig, {
		services: { workoutService: (context, event) => fetchWorkout(event.id) }
	});
}

/**
 * Resolve a `Promise` only after a _minimum_ wait time.
 * The wait time floor is `atLeast`, in milliseconds,
 * and the ceiling is however long `promise` takes.
 *
 * @param {Promise} promise
 * @param {number} atLeast Milliseconds
 * @returns {Promise} A new `Promise`
 */
function wait(promise, atLeast = 0) {
	const timeout = new Promise((resolve) => setTimeout(resolve, atLeast));
	// `Promise.all` returns results in the same order they were passed
	return Promise.all([promise, timeout]).then((arr) => arr[0]);
}
