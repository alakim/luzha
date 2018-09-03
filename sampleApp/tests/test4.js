Luzha.Test('Test 4', function($, $L, onComplete){
	$L.open('sampleApp')
		.then(()=>{
			$L.click('#ref2');
		})
		.then($L.waitLoading(33))
		.then(()=>{
			$L.checkText('h1', /page\s2/i);
		})
		.then($L.waitFor('.response'))
		.then(()=>{
			$L.checkText('.response', /success/i);
		})
		.then(onComplete)
	;
});
