Luzha.Test('Test 4', function($, $L, onComplete){
	$L.open('sampleApp')
		.then(()=>{
			$L.click('#ref2');
		})
		.then($L.waitLoading(33))
		.then(()=>{
			$L.checkText('h1', /page\s2/i);
		})
		.then($L.log('waiting for response'))
		.then($L.waitFor('.response'))
		.then($L.log('response received'))
		.then(()=>{
			$L.checkText('.response', /success/i);
		})
		.then($L.log('waiting for continuation...'))
		.then($L.pause('Continue?'))
		.then($L.log('continued!'))
		.then(onComplete)
	;
});
