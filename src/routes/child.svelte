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
				//type: "final"
				on: {
					reset: {
						target: "idle"
					}
				}
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
					console.log("child state changed", state.value);
					set(state);
					if (state.matches("done")) {
						console.log("firing done");
						fire("done");
					}
				}
			})
			.start();
		return () => service.stop();
	});

	import { beforeUpdate } from "svelte";
	beforeUpdate(() => {
		console.warn("updating child", config);
		service.send(["reset", "start"]);
	});
</script>

<div style="background: #eee; padding: 0.5em;">
	{$status.value}
	<pre>{JSON.stringify(config)}</pre>
</div>
