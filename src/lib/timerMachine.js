import { createMachine, assign } from "xstate";

export const timerMachine = createMachine({
	/*
	context: {
		timer: {
			elapsed: 0,          // milliseconds
			duration: 15 * 1000, // milliseconds
			interval: 0.1 * 1000 // milliseconds
		}
	},
	*/
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
					cond: (context) => {
						return context.timer.elapsed >= context.timer.duration;
					}
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
				}
			}
		},
		completed: {
			type: "final"
		}
	}
});
