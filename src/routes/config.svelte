<h1>Create a workout</h1>
<form action="workout" method="post">
	<div>
		<label>Duration <input type="number" name="duration" value="30"/></label> minutes
	</div>
	<div>
		<label>Sets <input type="number" name="sets" value="12"/></label> 
	</div>
	<div>
		<label>Warm up <input type="number" name="warmup" value="2"/></label> minutes
	</div>
	<div>
		<label>Cool down <input type="number" name="cooldown" value="2"/></label> minutes
	</div>
	<div>
		<button type="submit" formaction="build">Build…</button>
		<button type="submit">Start random</button>
	</div>
</form>