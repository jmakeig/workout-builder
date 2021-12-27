<script>
	import Timer from "./_components/timer.svelte";

	let workout = {
		circuits: [
			[
				{
					type: "exercise",
					activity: "burpee",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				},
				{
					type: "exercise",
					activity: "jump-squat",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				},
				{
					type: "exercise",
					activity: "curtsy-lunge",
					duration: 50 // seconds
				},
				{
					type: "rest",
					duration: 10
				}
			]
		]
	};
</script>

<h1>Workout</h1>
<Timer duration={5} />
