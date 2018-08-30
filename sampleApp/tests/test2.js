Luzha.Test('Test 2', function($, $L, onComplete){
	console.log('starting Test 2 ...');
	$L.open('sampleApp')
		.then(()=>new Promise(resolve=>{
			$L.appWindow().continuation = ()=>{
				console.log('continued!');
				$L.appWindow().continuation = null;
				resolve();
			};
			$L.click('.btT2');
		}))
		.then(()=>{
			const c2 = $L.checkContent('#out', /\d+\s+items\s+received/i);
			console.log('c2: %o', c2);
			console.log('Test 2 finished!');
		})
		.then(onComplete)
	;
});
