Luzha.Test('Test 3', function($, $L, onComplete){
	console.log('starting Test 3 ...');
	$L.open('sampleApp')
		.then(()=>{
			$L.checkText('#out', /xxx/, 'Error 1.2');
		})
		.then(()=>{
			$L.setValue('.tb1', 22);
			$L.checkValue('.tb1', 33);
		})
		.then(onComplete)
	;
});
