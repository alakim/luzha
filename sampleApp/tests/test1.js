Luzha.Test(function($, $L){
	console.log('starting Test 1 ...');
	$L.open('sampleApp', function(){
		$L.click('.btT1');
		const c1 = $L.checkContent('#out', /test\s*1/i);
		console.log('c1: %o', c1);
		console.log('Test 1 finished!');
	});
});
