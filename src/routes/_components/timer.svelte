<!-- Forked from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ -->

<script>
	import { useMachine } from "$lib/useMachine";
	import { timerMachine } from "$lib/timerMachine";

	export let duration = 30; // seconds

	const { status, timer, dispatch } = useMachine(timerMachine, {
		timer: {
			elapsed: 0, // milliseconds
			duration: duration * 1000, // milliseconds
			interval: 0.1 * 1000 // milliseconds
		}
	});
	$: console.log("$timer", $timer);

	function progress(d, e) {
		const f = (d - e) / d;
		return f;
		//return f - (1 / d) * (1 - f);
	}

	const circ = 2 * Math.PI * 45;
</script>

<div>
	Duration: {($timer.duration / 1000).toFixed(2)} Elapsed: {(
		$timer.elapsed / 1000
	).toFixed(2)}
</div>
{#if $status.matches("paused")}
	<button on:click={(event) => dispatch("resume")}>Play</button>
{:else if $status.matches("running")}
	<button on:click={(event) => dispatch("pause")}>Pause</button>
{:else}
	<button>done</button>
{/if}
<div class="status">{$status.toStrings().pop()}</div>
<div>
	{(progress($timer.duration, $timer.elapsed) * 283).toFixed(0)}
</div>

<div class="base-timer">
	<svg
		class="base-timer__svg"
		viewBox="0 0 100 100"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g class="base-timer__circle">
			<circle class="base-timer__path-elapsed" cx="50" cy="50" r="45" />
			<path
				id="base-timer-path-remaining"
				stroke-dasharray={(
					progress($timer.duration, $timer.elapsed) * circ
				).toFixed(0) +
					" " +
					circ.toFixed(0)}
				class="base-timer__path-remaining {'green'}"
				d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
			/>
		</g>
	</svg>
	<span id="base-timer-label" class="base-timer__label"
		>{(($timer.duration - $timer.elapsed) / 1000).toFixed(2)}</span
	>
</div>

<style>
	.base-timer {
		position: relative;
		width: 300px;
		height: 300px;
	}

	.base-timer__svg {
		transform: scaleX(-1);
	}

	.base-timer__circle {
		fill: none;
		stroke: none;
	}

	.base-timer__path-elapsed {
		stroke-width: 7px;
		stroke: grey;
	}

	.base-timer__path-remaining {
		stroke-width: 7px;
		stroke-linecap: round;
		transform: rotate(90deg);
		transform-origin: center;
		transition: 0.1s linear stroke-dasharray;
		fill-rule: nonzero;
		stroke: currentColor;
	}

	.base-timer__path-remaining.green {
		color: rgb(65, 184, 131);
	}

	.base-timer__path-remaining.orange {
		color: orange;
	}

	.base-timer__path-remaining.red {
		color: red;
	}

	.base-timer__label {
		position: absolute;
		width: 300px;
		height: 300px;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
	}
</style>
