import { interpret } from "xstate";
import { readable, derived } from "svelte/store";

const defaultEventCreator = () => ({ type: "change" });

/**
 * Creates reactive stores for the state and a slice of context for an XState state machine.
 *
 * @param {key => Machine} machine - pass the key to use for the context slice and returns a `Machine` instance
 * @param {object} [initialContext = {}] -
 * @param {object} [additionalConfig = {}] - passed as-is to `machine.withConfig()`
 * @param {function} [eventCreator] - the event to send on change. Defaults to `{ type: 'change' }`
 */
export function useMachine(
	machine,
	initialContext = {},
	additionalConfig = {},
	eventCreator = defaultEventCreator
) {
	const keys = Object.keys(initialContext);
	if (1 !== keys.length) {
		console.warn("Expected 1 key in initialContext", keys);
	}
	const key = Object.keys(initialContext)[0] || "item";
	if (0 === keys.length) {
		console.warn(`Defaulting to ${key} for context key name`);
	}

	if ("function" === typeof machine) {
		machine = machine(key);
	}
	
	const service = interpret(
		machine
			.withConfig(additionalConfig)
			.withContext({ ...machine.context, ...initialContext })
	);

	const status = readable(machine.initialState, (set) => {
		service.onTransition((state) => {
			if (false !== state.changed) {
				set(state);
			}
		});
		service.start();
		return () => service.stop();
	});

	const context = derived(status, ($status) => $status.context[key]);

	return {
		dispatch: service.send,
		status,
		[key]: {
			subscribe: context.subscribe,
			set: (value) => service.send({ ...eventCreator(), [key]: value })
		}
	};
}
