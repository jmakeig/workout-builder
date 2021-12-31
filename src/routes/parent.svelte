<script>
	import { createMachine, interpret, assign, matchesState } from "xstate";
	const machine = createMachine({
		id: "parent",
		context: {
			current: null
		},
		initial: "idle",
		states: {
			idle: {
				on: {
					start: {
						target: "next"
					}
				}
			},
			next: {
				always: [
					{
						target: "exercising",
						actions: assign({
							current: (context, event) =>
								null === context.current ? 0 : context.current + 1
						}),
						cond: (context, event) => context.current < 5
					},
					{ target: "done" }
				]
			},
			exercising: {
				// do timer
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
			.onDone((state) => console.log("Parent done"))
			.start();
		return () => service.stop();
	});

	import { onMount } from "svelte";
	onMount(() => {
		service.send("start");
	});

	import Child from "./child.svelte";
</script>

<h1>Parent</h1>

{#if $status.matches("exercising")}
	<Child duration={5} elapsed={0} on:done={(evt) => console.log(evt)} />
{/if}
