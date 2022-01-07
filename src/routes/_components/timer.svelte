<!-- Forked from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ -->
<script>
	import { coalesce, millisToMinutes } from "$lib/util";

	export let duration;
	export let elapsed = 0;
	export let interval;
	export let state;

	let progress;
	$: progress = Math.min(1.0, -(elapsed + interval) / duration);

	const FUDGE = 0.2; // Make it so the animation isn’t janky
</script>

<!-- <div>{((elapsed + interval) / duration).toFixed(2)}</div> -->
<div
	class="timer {coalesce(state, '')}"
	style="--duration: {duration}; --interval: calc({interval / 1000 +
		FUDGE} * 1s); --progress: {progress.toFixed(2)}"
>
	<div class="countdown">
		{#if state === "transitioning"}
			--:--
		{:else}
			{millisToMinutes(duration - elapsed)}
		{/if}
	</div>

	<svg
		viewBox="0 0 100 100"
		width="100"
		height="100"
		fill="none"
		class="circles"
	>
		<circle class="guide" r="40" cx="50" cy="50" pathLength="1" />
		<circle
			class="progress"
			class:reset={0.0 === elapsed}
			r="40"
			cx="50"
			cy="50"
			pathLength="1"
		/>
	</svg>
</div>

<style>
	.timer {
		position: relative;
		width: 100%;
		max-width: 550px;
		min-width: 100px;
		aspect-ratio: 1/1;
		margin: 1em auto;
	}
	.countdown {
		position: absolute;
		top: 50%;
		left: 50%;
		margin-right: -50%;
		transform: translate(-50%, -50%);

		border: solid 0.25rem var(--slate);
		border-radius: 1rem;
		padding: 0.5rem;

		line-height: 1;
		font-size: 3em;
		font-family: var(--font-mono);
		font-feature-settings: "tnum";
		font-variant-numeric: tabular-nums;
	}
	.warning .countdown {
		animation: warn-color 4s linear forwards;
	}
	.transitioning .countdown {
		border-color: transparent;
		color: var(--slate);
		animation: blink 1s linear infinite;
	}
	.circles {
		transform: rotate(-0.25turn);
		height: 100%;
		width: 100%;
		pointer-events: none;
	}

	circle {
		stroke: var(--slate);
		stroke-linejoin: round;
		stroke-linecap: butt;
		stroke-width: 0.25em;
	}
	.progress {
		transition: stroke-dashoffset var(--interval) linear;
		stroke: inherit; /* So the .warning color doesn’t show while the final animation is catching up. */
		stroke-dashoffset: var(--progress, 0);
		stroke-dasharray: 1 1;
	}
	.running .progress {
		stroke: var(--green);
	}
	.warning .progress {
		stroke: var(--orange);
		animation: warn 4s linear forwards;
	}
	.warning .guide {
		animation: blink 1s linear infinite;
	}

	.progress.reset {
		transition: none;
		stroke-dashoffset: calc(var(--interval) / var(--duration));
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@keyframes warn {
		100% {
			stroke: var(--red);
		}
		0% {
			stroke: var(--yellow);
		}
		50% {
			stroke: var(--orange);
		}
	}

	@keyframes warn-color {
		100% {
			border-color: var(--red);
		}
		0% {
			border-color: var(--yellow);
		}
		50% {
			border-color: var(--orange);
		}
	}
</style>
