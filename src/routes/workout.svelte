<script>
	import { useWorkoutMachine } from "$lib/workoutStore";
	const { workout, exercise, timer, matches, send } = useWorkoutMachine();

	send("initialize");

	import Timer from "./_components/timer.svelte";
	import ExerciseImage from "./_components/ExerciseImage.svelte";

	import { num, millisToMinutes } from "$lib/util";
</script>

<svelte:head>
	<title>Workout</title>
</svelte:head>

<div
	class="wrapper"
	class:ready={$matches("ready")}
	class:exercising={$matches("exercising")}
	class:transitioning={$matches("transitioning")}
	class:done={$matches("done")}
>
	<header><h1>Workout</h1></header>
	<nav>
		<!-- <pre>#nav</pre> -->
		<ol>
			<li><a href="/workout">Restart</a></li>
			<li><a href="/config">Build</a></li>
		</ol>
	</nav>
	<section id="title">
		{#if $matches("ready")}
			<h2 style="display: flex;">
				{$workout.circuits.length} exercises over

				{millisToMinutes(
					$workout.circuits.reduce(
						(total, exercise) => total + exercise.duration,
						0
					)
					// + 1500 * ($workout.circuits.length - 1)
				)}
				minutes
			</h2>
		{/if}
		{#if $matches("transitioning")}
			<h2>
				{#if $exercise.next && $exercise.next.info}
					Up next: {$exercise.next.info.name} ({millisToMinutes(
						$exercise.next.instance.duration
					)})
				{:else}
					Get ready…
				{/if}
			</h2>
		{/if}
		{#if $matches("exercising")}
			<div style="display: flex; flex-flow: row; align-items: baseline;">
				<h2 style="flex: 1;">{$exercise.current.info.name}</h2>
				<div style="width: 4em; text-align: right; font-weight: bold;">
					{num($exercise.is + 1)} of {num($exercise.of)}
				</div>
			</div>
		{/if}
	</section>
	<section id="exercise">
		<!-- <pre>#exercise</pre> -->
		{#if $matches("ready")}
			<button on:click={(evt) => send("start")}
				><svg
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 74.30041956980574 83.47996635773256"
					height="1em"
					style="display: inline-block; margin: 0 0.25em -0.15em 0; vertical-align: baseline;"
				>
					<g stroke-linecap="round"
						><g
							transform="translate(77.52319809290316 16.249737363104657) rotate(89.99999999999994 -40.37298830800023 25.490245815761625)"
							fill-rule="evenodd"
							><path
								d="M-41.46 3.64 L-11.07 51.74 L-69.02 46.57 L-41.69 1.96"
								stroke="none"
								stroke-width="0"
								fill="transparent"
								fill-rule="evenodd"
							/><path
								d="M-39.53 3.28 C-32.39 13.25, -20.69 26.33, -9.82 46.96 M-39.92 -1.66 C-30.25 15.8, -20.29 33.81, -12.84 51.99 M-8.63 50 C-26.31 51.2, -45.93 53.61, -68.54 48.4 M-11.74 51.55 C-31.5 50.86, -51.67 49.04, -69.32 48.49 M-72.11 52.64 C-63.39 42.7, -56.07 29.8, -36.96 2.41 M-68.52 49.79 C-60.08 33.65, -48.01 13.07, -41.98 1.58 M-40.15 0 C-40.15 0, -40.15 0, -40.15 0 M-40.15 0 C-40.15 0, -40.15 0, -40.15 0"
								stroke="currentColor"
								stroke-width="7.5"
								fill="none"
							/></g
						></g
					></svg
				>Start</button
			>
			<table>
				<thead>
					<tr><th>Exercise</th><th style="width: 4em;">Duration</th></tr>
				</thead>
				<tbody>
					{#each $workout.circuits as { exercise, duration }, i}
						<tr>
							<td>{$workout.exercises[exercise].name}</td>
							<td class="duration">{millisToMinutes(duration)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if $matches("exercising")}
			<div class="info">
				<p>{$exercise.current.info.description}</p>
			</div>
			<div class="illustration">
				<ExerciseImage
					id={$exercise.current.instance.exercise}
					alt={$exercise.current.info.name}
				/>
			</div>
		{/if}
		{#if $matches("done")}
			Done!
		{/if}
	</section>
	<section id="timer">
		<!-- <pre>#timer</pre> -->
		{#if $matches("ready") || $matches("exercising") || $matches("transitioning")}
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

<style>
	.wrapper {
		max-width: 1080px;
		margin: 0 auto;
		display: grid;
		grid-gap: 10px;
		grid-template-columns: 1fr;
		grid-template-rows: auto 2em auto auto auto auto;
		grid-template-areas:
			"header"
			"title"
			"timer"
			"exercise"
			"nav"
			"footer";
	}

	@media (min-width: 900px) {
		.wrapper {
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto 2em auto auto;
			grid-template-areas:
				"header nav nav"
				"title title timer"
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
	nav ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	nav ol li {
		display: inline-block;
		padding: 0;
		margin: 0 1em;
	}
	footer {
		grid-area: footer;
		font-size: 0.8em;
	}
	section#title {
		grid-area: title;
		border-bottom: solid 1px var(--slate);
	}
	section#exercise {
		grid-area: exercise;
	}

	section#timer {
		grid-area: timer;
	}
	button {
		display: block;
		margin: 1em auto;
		font-size: 2.25em;
		padding: 0.5em 1.25em;
		color: #bbf7d0;
		background: var(--green);
	}
	button:hover {
		background: #15803d;
		color: #f0fdf4;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
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
