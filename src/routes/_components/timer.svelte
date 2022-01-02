<!-- Forked from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ -->
<script>
	export let duration;
	export let elapsed = 0;
	export let interval;
	let progress;

	$: progress = Math.min(1.0, (elapsed + interval) / duration);
</script>

<div>{(elapsed / 1000).toFixed(2)}</div>
<div>{((elapsed + interval) / duration).toFixed(2)}</div>
<div
	class="timer"
	style="--interval: calc({interval /
		1000} * 1s); --progress: {progress.toFixed(2)}"
>
	<svg
		viewBox="0 0 100 100"
		width="100"
		height="100"
		fill="none"
		class="circles"
	>
		<circle r="40" cx="50" cy="50" pathLength="1" />
		<circle class="progress" r="40" cx="50" cy="50" pathLength="1" />
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
		stroke: green;
		stroke-dashoffset: var(--progress, 0);
		stroke-dasharray: 1 1;
		stroke-width: 1.1px;
	}
</style>
