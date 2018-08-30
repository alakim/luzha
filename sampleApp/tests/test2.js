Luzha.Test('Test 2', function($, $L){
	console.log('starting Test 2 ...');
	$L.open('sampleApp')
		.then(()=>{
			$L.click('.btT1');
			console.log('waiting...');
		})
		.then($L.wait(2e3))
		.then(()=>{
			const c1 = $L.checkContent('#out', /test\s*1/i);
			console.log('c1: %o', c1);
			console.log('Test 2 finished!');
		})
	;
});
