Luzha.Test('Test Steps', function($, $L, onComplete){
	Promise.resolve()
		.then($L.log('starting'))
		.then($L.pause())
		.then($L.log('step 1'))
		.then($L.pause())
		.then($L.log('step 2'))
		.then($L.pause())
		.then($L.log('finished'))
		.then(onComplete)
	;
});
