<script>
	import { createMachine, interpret, assign, matchesState } from "xstate";
	const machine = createMachine({
		id: "parent",
		context: {
			cicruits: [
				{
					duration: 5 * 1000
				},
				{
					duration: 4 * 1000
				},
				{
					duration: 3 * 1000
				},
				{
					duration: 2 * 1000
				},
				{
					duration: 10 * 1000
				}
			],
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
						cond: (context, event) =>
							context.current < context.cicruits.length - 1
					},
					{ target: "done" }
				]
			},
			exercising: {
				// do timer
				on: {
					next: {
						target: "next"
					}
				}
			},
			done: {
				type: "final"
			}
		}
	});

	const service = interpret(machine);

	import { readable, derived } from "svelte/store";
	const status = readable(machine.initialState, (set) => {
		service
			.onTransition((state) => {
				if (false !== state.changed) {
					console.log("parent state change", state.value);
					set(state);
				}
			})
			.onDone((state) => console.log("Parent done"))
			.start();
		return () => service.stop();
	});

	const exercise = derived(
		status,
		($status) => $status.context.cicruits[$status.context.current]
	);

	import { onMount } from "svelte";
	onMount(() => {
		service.send("start");
	});

	import Child from "./child.svelte";
</script>

<h1>Parent: {$status.value}</h1>
<!-- <pre>{JSON.stringify($exercise)}</pre> -->
<Child
	config={$exercise}
	on:done={(evt) => {
		console.log("recieved done");
		service.send("next");
	}}
/>
