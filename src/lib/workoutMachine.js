/* https://stately.ai/viz/7abfed3c-18e1-400f-a240-34a1247decd6 */

import { createMachine, assign } from "xstate";

const TRANSITION_DELAY = 1500;

export const workoutMachine = createMachine(
	{
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
								current: (context, event) => increment(context.current)
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
												elapsed: +(
													context.timer.elapsed + context.timer.interval
												)
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
	},
	{ services: { workoutService } }
);

function increment(current) {
	if (null === current) return 0;
	return current + 1;
}

function workoutService(context, event) {
	const id = event.id;
	return fetchWorkout(id);
}
function fetchWorkout(id) {
	return Promise.resolve({
		circuits: [
			[
				{ exercise: "jog", duration: 10 * 1000 },
				{ exercise: "march", duration: 10 * 1000 },
				{ exercise: "toe-tap", duration: 10 * 1000 },
				{ exercise: "cross-jack", duration: 10 * 1000 },
				{ exercise: "skater", duration: 10 * 1000 }
			]
		].flat(), // NOTE!
		exercises: {
			"cross-jack": {
				name: "Cross Jack",
				description:
					"Two full jumping jacks. Then with your hands behind head, touch each elbow to opposite knee.",
				modifications: {
					easier: "",
					harder: ""
				}
			},
			"toe-tap": {
				name: "Toe Tap",
				description:
					"With your feet slightly wider than shoulder width apart, alternate bending down and touching each foot with the opposite hand, jumping and fully extending your arms above your head as you come up."
			},
			jog: {
				name: "Jog",
				description: "Run in place, kicking your heels up behind you."
			},
			march: {
				name: "March",
				description:
					"Alternate raising your knees above your waistline, pumping the opposite arm."
			},
			skater: {
				name: "Skater",
				description:
					"Shift your weight from side to side, kicking the opposite foot behind you, reaching your arm across your body, like a speed skater."
			}
		}
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
