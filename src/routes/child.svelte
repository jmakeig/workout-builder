<script>
	export let config;

	import { createMachine, interpret } from "xstate";
	const machine = createMachine({
		id: "child",
		initial: "idle",
		states: {
			idle: {
				on: {
					start: {
						target: "running"
					}
				}
			},
			running: {
				after: {
					2500: {
						target: "done"
					}
				}
			},
			done: {
				type: "final"
			}
		}
	});

	const service = interpret(
		machine
		//.withConfig(additionalConfig)
		//.withContext({ ...machine.context, ...initialContext })
	);

	import { createEventDispatcher } from "svelte";
	const fire = createEventDispatcher();

	import { readable } from "svelte/store";
	const status = readable(machine.initialState, (set) => {
		service
			.onTransition((state) => {
				if (false !== state.changed) {
					set(state);
				}
			})
			.onDone((state) => fire("done"))
			.start();
		return () => service.stop();
	});

	import { onMount, beforeUpdate } from "svelte";
	onMount(() => {
		//service.send("start");
	});
	beforeUpdate(() => {
		console.log("restarting service", config);
		service.start();
		service.send("start");
	});

	/*
	export function start(handler) {
		const interval = 0.1 * 1000;
		const timeout = setInterval(() => {
			if (elapsed <= duration * 1000) {
				elapsed += interval;
			} else {
				clearInterval(timeout);
				handler();
			}
		}, interval);
		return () => clearInterval(timeout);
	}
	*/
</script>

<div style="background: #eee; padding: 0.5em;">
	{$status.value}
	<pre>{JSON.stringify(config)}</pre>
</div>
