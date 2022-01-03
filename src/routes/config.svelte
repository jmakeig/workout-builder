<script>
	let duration = 30;
	let exercises = 12;
	let warmup = 2;
	let cooldown = 2;

	// https://stackoverflow.com/a/17599562
	function formatMinutes(minutes) {
		function pad(n) {
			if (n < 10) return "0" + String(n);
			return String(n);
		}
		const sign = minutes < 0 ? "-" : "";
		const min = Math.floor(Math.abs(minutes));
		const sec = Math.floor((Math.abs(minutes) * 60) % 60);
		return sign + pad(min) + ":" + pad(sec);
	}
</script>

<svelte:head>
	<title>Create a workout {new Date().getSeconds()}</title>
</svelte:head>
<h1>Create a workout</h1>
<form action="workout" method="post">
	<div>
		<label for="duration">Duration</label>
		<input
			type="number"
			id="duration"
			name="duration"
			bind:value={duration}
			min="0"
			max="120"
			step="5"
		/>
		> minutes
	</div>
	<div>
		<label for="exercises">Exercises</label>
		<input
			type="number"
			id="exercises"
			name="exercises"
			bind:value={exercises}
		/>
	</div>
	<div>
		<label for="warmup">Warm up</label><input
			type="number"
			id="warmup"
			name="warmup"
			bind:value={warmup}
			min="0"
			max={duration}
		/> minutes
	</div>
	<div>
		<label for="cooldown">Cool down</label><input
			type="number"
			id="cooldown"
			name="cooldown"
			bind:value={cooldown}
			min="0"
			max={duration}
		/> minutes
	</div>
	<div>
		{formatMinutes((duration - warmup - cooldown) / exercises)} minutes per exercise
	</div>
	<div>
		<button type="submit" formaction="build">Build…</button>
		<button type="submit">Start random</button>
	</div>
</form>
