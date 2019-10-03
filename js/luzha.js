/**********************************************************
 *
 * Luzha - simple testing environment for web applications
 *
 * https://github.com/alakim/luzha
 *
 **********************************************************/
const Luzha = (function($,$C){const $H=$C.simple;
	const testMode = typeof($Test)!='undefined' && $Test;
	const version = '1.3.0';
	const {px,pc} = $C.css.unit;
	const css = $C.css.keywords;
	const $T = $C.css.template;

	const maxWaitingTimeout = 8e3;
	const checkTimeout = 100;

	const Style = {
		color:{
			text:'#efe',
			back:'#021'
		},
		panel:{
			size:{h:30}
		}
	};

	const settings = {
		allowStartingAllTests:true,
		docRef: 'doc'
	};

	const doNothing = ()=>{};

	function confirmContinuation(msg){
		const pnlSel = '#pnlMain .pnlConfirmation';
		function clear(){
			$(pnlSel).html('');
		}
		return new Promise((resolve, reject)=>{
			const {markup,button,div} = $H;
			$(pnlSel)
				.html(div({'class':'frame'},
					(msg||'Test paused'),
					button({'class':'btContinue'}, 'Continue'),
					button({'class':'btBreak'}, 'Break Test')
				))
				.find('.btContinue').click(function(){
					clear();
					resolve();
				}).end()
				.find('.btBreak').click(function(){
					clear();
					console.warn('Test execution aborted');
					reject();
				}).end()
			;
		});
	}

	function extend(o, S){
		for(let k in S){
			const v = S[k];
			if(typeof(v)=='object')
				extend(o[k], v);
			else
				o[k] = v;
		}
		return o;
	}

	$C.css.writeStylesheet({
		'body':{
			margin:0,
			padding:px(2),
			fontFamily:'Verdana,Arial,Sans-Serif',
			fontSize:px(12),
			backgroundColor:Style.color.back,
			color:Style.color.text
		},
		'#pnlMain':{
			margin:0,
			padding:px(0, 5),
			height:px(Style.panel.size.h),
			display:css.flex,
			flexDirection:css.row,
			' .logo':{
				width:px(80),
				textAlign: css.center,
				' .title':{
					fontWeight:css.bold,
					fontSize:px(14),
					padding:px(0)
				},
				' .version':{
					fontWeight:css.normal,
					fontSize:px(8),
				}
			},
			' .controls':{
			},
			' .pnlConfirmation':{
				minWidth:px(50),
				' .frame':{
					backgroundColor:'#ff0',
					color:'#008',
					fontWeight:css.bold,
					padding:px(2),
					border:$T.border(1, '#cfc'),
					' button':{
						margin:px(0, 3)
					}
				}
			},
			' .testList':{
				padding:px(0, 15),
				' .btStartTest':{
					'.started':{backgroundColor:'#ff0'},
					'.success':{backgroundColor:'#0e0'},
					'.errors':{backgroundColor:'#f00'}
				}
			}
		},
		'#frmApp':{
			width:pc(100),
			height:`calc(100vh - ${Style.panel.size.h}px - 14px)`,
			border:$T.border(1, Style.color.text)
		}
	});

	let tests = [];
	let errorsOccured = false;
	let onPageLoad = doNothing;

	let stopCurrentTest = doNothing;


	function testStopper(testButton){
		return function(){
			testButton.removeClass('started');
			testButton.addClass(errorsOccured?'errors':'success');
		}
	}

	function init(){
		if(testMode) return;
		const {markup,apply,a,h1,div,span,button} = $H;

		function runTest(idx, continued){
			// console.log(idx, tests);
			if(idx>=tests.length) return;
			const testButton = $(`.btStartTest:eq(${idx})`);
			testButton.removeClass('success');
			testButton.removeClass('errors');
			testButton.addClass('started');
			errorsOccured = false;

			stopCurrentTest = testStopper(testButton);
			tests[idx].action($, Luzha, function(){
				stopCurrentTest();
				if(continued) runTest(idx+1, continued);
			});
		}

		$('body')
			.html(markup(
				div({id:'pnlMain'},
					div({'class':'logo'},
						div({'class':'title'}, '&lambda;uzha'),
						div({'class':'version'}, 'v.', version)
					),
					div({'class':'controls'},
						button({'class':'btDocs'}, 'Documentation'), ' ',
						settings.allowStartingAllTests?button({id:'btStart'}, 'Start all tests'):null,
						span({'class':'testList'},
							apply(tests, (t,idx)=>button({'class':'btStartTest', 'data-idx':idx},
								t.name
							))
						)
					),
					div({'class':'pnlConfirmation'})
				),
				$C.html.iframe({id:'frmApp'})
			))
			.find('.btDocs').click(function(){
				window.open(settings.docRef);
			}).end()
			.find('#btStart').click(function(){
				$('.btStartTest')
					.removeClass('started')
					.removeClass('success')
					.removeClass('errors');
				runTest(0, true);
			}).end()
			.find('.btStartTest').click(function(){
				runTest($(this).attr('data-idx'));
			}).end()
		;

		$('#frmApp').on('load', function(){
			onPageLoad();
		});
	}

	function selectAppItem(sel){
		return $(window.frames[0].document.body).find(sel);
	}

	function assert(cond){
		if(!cond) errorsOccured = true;
		//console.log('assertion arguments: %o', arguments);
		console.assert(...arguments);
		//console.trace();
	}

	$(init);
	const Luzha = {
		settings(v){
			if(!v) return settings;
			extend(settings, v);
		},
		Test:(name, action)=>{tests.push({
			name:name,
			action:action
		});},
		selectAppItem:selectAppItem,
		open:(url,timeout)=>new Promise((resolve, reject)=>{
			$('#frmApp')[0].src=url;
			setTimeout(resolve, timeout||1e3);
		}),
		waiting:timeout=>new Promise((resolve, reject)=>{
			setTimeout(()=>{resolve()},timeout||1e3);
		}),
		wait:timeout=>{return ()=>Luzha.waiting(timeout);},
		waitingLoading(){
			return new Promise(resolve=>{
				onPageLoad = function(){
					onPageLoad = doNothing;
					resolve();
				}
			});
		},
		waitLoading(){
			return ()=>Luzha.waitingLoading();
		},
		waitingFor(sel){
			return new Promise((resolve,reject)=>{
				function wait(t){
					setTimeout(function(){
						if(selectAppItem(sel).length){
							resolve();
							return;
						}
						if(t<maxWaitingTimeout) wait(t+checkTimeout);
						else{
							errorsOccured = true;
							console.error('Waiting timeout exceeded');
							stopCurrentTest();
						}
					}, checkTimeout);
				}
				wait(0);
			});
		},
		waitFor(sel){
			return ()=>Luzha.waitingFor(sel);
		},
		log(msg){
			return ()=>{
				console.log('%cλ%c %s', 'background-color:#0f0; color:#000;font-weight:bold;padding:5px', 'color:#fff', msg);
			};
		},
		pause(msg){
			return ()=>confirmContinuation(msg);
		},
		click:(sel)=>{
			const el = selectAppItem(sel);
			if(!el.length) console.error(`AppItem "${sel}" not found`);
			else{
				if(el.prop('tagName').toUpperCase()=='A')
					el[0].click()
				else
					el.click();
			}
		},
		setValue(sel, val){
			selectAppItem(sel).val(val);
		},
		checkHtml(sel, re, message){
			const content = selectAppItem(sel).html();
			const res = content.match(re)!=null;
			assert(res, message||'Wrong HTML data: ', {value:content, expected:re});
			return res;
		},
		checkText(sel, re, message){
			const content = selectAppItem(sel).text();
			const res = content.match(re)!=null;
			assert(res, message||'Wrong text data: ', {value:content, expected:re});
			return res;
		},
		checkValue(sel, expectation, message){
			const val = selectAppItem(sel).val();
			const res = JSON.stringify(val)==JSON.stringify(expectation);
			assert(res, message||'Wrong value: ', {value:val, expected:expectation});
			return res;
		},
		assert:assert,
		appWindow:function(){
			return window.frames[0];
		},
		setContinuation:function(name, continuation){
			const win = Luzha.appWindow();
			if(!win.Luzha) win.Luzha = {};
			const lzh = win.Luzha;
			lzh[name] = ()=>{
				delete lzh[name];
				continuation();
			};
		},
		version
	};

	if(testMode) Luzha._internals = {
		settings:settings
	};


	return Luzha;
})(jQuery, Clarino.version('1.1.0'));
