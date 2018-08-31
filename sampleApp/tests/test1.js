Luzha.Test('Test 1', function($, $L, onComplete){
	console.log('starting Test 1 ...');
	$L.open('sampleApp')
		.then(()=>{
			$L.click('.btT1');
			console.log('waiting...');
		})
		.then($L.wait(1e3))
		.then(()=>{
			const c1 = $L.checkHtml('#out', /test\s+button\s+1\s+clicked/i);
			console.log('c1: %o', c1);
			$L.assert(c1, 'Error 1.1', {x:'sample additional data', y:22});
			console.log('Test 1 finished!');
		})
		.then(onComplete)
	;
});
