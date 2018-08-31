const Luzha = (function($,$C){const $H=$C.simple;
	const version = '1.1.0';
	const {px,pc} = $C.css.unit;
	const css = $C.css.keywords;
	const $T = $C.css.template;

	const Style = {
		color:{
			text:'#efe',
			back:'#021'
		},
		panel:{
			size:{h:30}
		}
	};

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

	function init(){
		const {markup,apply,h1,div,span,button} = $H;

		function runTest(idx, continued){
			console.log(idx, tests);
			if(idx>=tests.length) return;
			const testButton = $(`.btStartTest:eq(${idx})`);
			testButton.removeClass('success');
			testButton.removeClass('errors');
			testButton.addClass('started');
			errorsOccured = false;
			tests[idx].action($, Luzha, function(){
				testButton.removeClass('started');
				testButton.addClass(errorsOccured?'errors':'success');
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
						button({id:'btStart'}, 'Start all tests'),
						span({'class':'testList'},
							apply(tests, (t,idx)=>button({'class':'btStartTest', 'data-idx':idx},
								t.name
							))
						)
					)
				),
				$C.html.iframe({id:'frmApp'})
			))
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
		Test:(name, action)=>{tests.push({
			name:name,
			action:action
		});},
		selectAppItem:selectAppItem,
		open:(url,timeout)=>new Promise((resolve, reject)=>{
			$('#frmApp')[0].src=url;
			setTimeout(resolve, timeout||1e3);
		}),
		wait:timeout=>()=>new Promise((resolve, reject)=>{
			setTimeout(()=>{resolve()},timeout||1e3);
		}),
		click:(sel)=>{
			const el = selectAppItem(sel);
			if(el.length) el.click();
			else console.error(`AppItem "${sel}" not found`);
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
		}
	};

	return Luzha;
})(jQuery, Clarino.version('1.2.0'));
