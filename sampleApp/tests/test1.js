Luzha.Test('Test 1', function($, $L, onComplete){
	console.log('starting Test 1 ...');
	$L.open('sampleApp')
		.then(()=>{
			$L.click('.btT1');
			console.log('waiting...');
		})
		.then($L.wait(2e3))
		.then(()=>{
			const c1 = $L.checkContent('#out', /test\s+button\s+1\s+clicked/i);
			console.log('c1: %o', c1);
			console.log('Test 1 finished!');
		})
		.then(onComplete)
	;
});
