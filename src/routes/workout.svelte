<script>
	import { useWorkoutMachine } from "$lib/workoutStore";
	const { status, exercise, timer, send } = useWorkoutMachine();


	// import { onMount } from "svelte";
	// onMount(() => send("initialize"));
	send("initialize");

	import Timer from "./_components/timer.svelte";

	import Print from "./_components/print.svelte";

	import { num, millisToMinutes } from "$lib/util";
</script>

<svelte:head>
	<title>Workout</title>
</svelte:head>

<div
	class="wrapper"
	class:ready={$status.matches("ready")}
	class:exercising={$status.matches("exercising")}
	class:transitioning={$status.matches("transitioning")}
	class:done={$status.matches("done")}
>
	<header><h1>Workout</h1></header>
	<nav>
		<!-- <pre>#nav</pre> -->
		<a href="/config">Build</a>
	</nav>
	<section id="exercise">
		<!-- <pre>#exercise</pre> -->
		{#if $status.matches("ready")}
			<h2>
				{$status.context.workout.circuits.length} exercises over
				<span class="duration">
					{millisToMinutes(
						$status.context.workout.circuits.reduce(
							(total, exercise) => total + exercise.duration,
							0
						)
						// + 1500 * ($status.context.workout.circuits.length - 1)
					)}
				</span> minutes
			</h2>
			<button on:click={(evt) => send("start")}>Start</button>
			<table>
				<thead>
					<tr><th>Exercise</th><th style="width: 4em;">Duration</th></tr>
				</thead>
				<tbody>
					{#each $status.context.workout.circuits as { exercise, duration }, i}
						<tr>
							<td>{$status.context.workout.exercises[exercise].name}</td>
							<td class="duration">{millisToMinutes(duration)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if $status.matches("exercising")}
			<div
				style="display: flex; flex-flow: row; align-items: baseline; border-bottom: solid 2px var(--slate);"
			>
				<h2 style="flex: 1;">{$exercise.current.info.name}</h2>
				<div style="width: 4em; text-align: right; font-weight: bold;">
					{num($exercise.is + 1)} of {num($exercise.of)}
				</div>
			</div>
			<div class="info">
				<p>{$exercise.current.info.description}</p>
			</div>
		{/if}

		{#if $status.matches("transitioning")}
			<div>
				{#if $exercise.next && $exercise.next.info}
					Up next: {$exercise.next.info.name} ({millisToMinutes(
						$exercise.next.instance.duration
					)})
				{:else}
					Get ready…
				{/if}
			</div>
		{/if}

		{#if $status.matches("done")}
			Done!
		{/if}
	</section>
	<section id="timer">
		<!-- <pre>#timer</pre> -->
		{#if $status.matches("ready") || $status.matches("exercising") || $status.matches("transitioning")}
			<Timer
				duration={$exercise.current && $exercise.current.instance
					? $exercise.current.instance.duration
					: 1}
				elapsed={$timer.elapsed}
				interval={$timer.interval}
				state={$timer.status}
			/>
		{/if}
	</section>
	<footer>
		<a href="https://github.com/jmakeig/workout-builder"
			>https://github.com/jmakeig/workout-builder</a
		>
	</footer>
</div>

<!-- 
<Print object={$status.value} label="$status.value" />
<Print object={$status.context} label="$status.context" />
<Print object={$exercise} label="$exercise" /> 
-->
<style>
	.wrapper {
		max-width: 1080px;
		margin: 0 auto;
		display: grid;
		grid-gap: 10px;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"timer"
			"exercise"
			"nav"
			"footer";
	}

	@media (min-width: 900px) {
		.wrapper {
			grid-template-columns: repeat(3, 1fr);
			grid-template-areas:
				"header nav nav"
				"exercise exercise timer"
				"footer  footer  footer";
		}

		nav ul {
			display: flex;
			justify-content: space-between;
		}
	}
	header {
		grid-area: header;
	}
	nav {
		grid-area: nav;
	}
	footer {
		grid-area: footer;
		font-size: 0.8em;
	}

	section#exercise {
		grid-area: exercise;
	}
	.ready h2 {
		text-align: center;
	}

	section#timer {
		grid-area: timer;
	}

	table {
		margin: 1em 0;
		width: 100%;
		table-layout: fixed; /* Uses first row to size. This renders faster for regular tables. */
		border-spacing: 0;
		border-collapse: collapse; /* https://stackoverflow.com/a/53559396/563324 */
	}
	th,
	td {
		padding: 0.5em 0;
		text-align: left;
		font-weight: normal;
	}
	tbody tr {
		border-bottom: solid 1px var(--slate);
	}
	thead th {
	}
	thead {
	}
	.duration {
		font-family: var(--font-mono);
	}
	td.duration {
		text-align: right;
	}
</style>
