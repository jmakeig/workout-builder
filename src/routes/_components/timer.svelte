<!-- Forked from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ -->
<script>
	import { coalesce, millisToMinutes } from "$lib/util";

	export let duration;
	export let elapsed = 0;
	export let interval;
	export let state;

	let progress;
	$: progress = Math.min(1.0, (elapsed + interval) / duration);

	const FUDGE = 0.2; // Make it so the animation isn’t janky
</script>

<!-- <div>{((elapsed + interval) / duration).toFixed(2)}</div> -->
<div
	class="timer {coalesce(state, '')}"
	style="--duration: {duration}; --interval: calc({interval / 1000 +
		FUDGE} * 1s); --progress: {progress.toFixed(2)}"
>
	<div style="font-variant-numeric: tabular-nums;">
		{millisToMinutes(duration - elapsed)}
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
	.circles {
		transform: rotate(-0.25turn);
		height: 100%;
		width: 100%;
		pointer-events: none;
	}

	circle {
		stroke: #ccc;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 1px;
	}

	.timer {
		width: 500px;
		height: 500px;
	}

	.progress {
		transition: stroke-dashoffset var(--interval) linear;
		stroke: inherit; /* So the .warning color doesn’t show while the final animation is catching up. */
		stroke-dashoffset: var(--progress, 0);
		stroke-dasharray: 1 1;
		stroke-width: 1.1px;
	}
	.running .progress {
		stroke: green;
	}
	.warning .progress {
		stroke: orange;
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
			stroke: red;
		}
	}
</style>
