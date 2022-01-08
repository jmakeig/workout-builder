import { interpret } from "xstate";
import { workoutMachine } from "./workoutMachine";
import { derived } from "svelte/store";

/**
 *
 * @param {function} fetchWorkoutImpl (id) => Promise<{circuits: [], exercises: {}}>
 * @returns {Object<{status: State, send: function}>}
 */
export function useWorkoutMachine(fetchWorkoutImpl = fetchWorkout) {
	let service = interpret(workoutMachine(fetchWorkoutImpl));
	/*
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
	*/

	// Are there too many derived stores wired up here? Do these
	// subscriptions simplify re-rending work or complicate it
	// with nested subscriptions?
	const status = service.start();
	return {
		workout: derived(status, ($status) => $status.context.workout),
		exercise: derived(status, ($status) => {
			return {
				current: $status.context.currentExercise,
				is: $status.context.current,
				of: $status.context.workout
					? $status.context.workout.circuits.length
					: undefined,
				next: $status.context.nextExercise
			};
		}),
		timer: derived(status, ($status) => {
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
						: $status.context.workout.circuits[$status.context.current]
								.duration,
				interval: $status.context.timer.interval,
				status: mapStatus($status)
			};
		}),
		send: service.send,
		// TODO: This is weird. Maybe expose state property that could 
		//       be called as $stat.matches(…)?
		matches: derived(status, ($status) => $status.matches)
	};
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
