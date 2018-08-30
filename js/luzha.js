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
			' .title':{
				fontWeight:css.bold,
				fontSize:px(18),
				padding:px(5)
			},
			' .testList':{
				padding:px(0, 15),
				' .btStartTest':{
					'.started':{backgroundColor:'#ffa'},
					'.performed':{backgroundColor:'#0e0'}
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

	function init(){
		const {markup,apply,h1,div,span,button} = $H;

		function runTest(idx, continued){
			if(idx>=tests.length) return;
			const testButton = $(`.btStartTest:eq(${idx})`);
			testButton.removeClass('performed');
			testButton.addClass('started');
			tests[idx].action($, Luzha, ()=>{
				testButton.removeClass('started');
				testButton.addClass('performed');
				if(continued) runTest(idx+1);
			});
		}

		$('body')
			.html(markup(
				div({id:'pnlMain'},
					span({'class':'title'}, 'Luzha v.', version),
					button({id:'btStart'}, 'Start all tests'),
					span({'class':'testList'},
						apply(tests, (t,idx)=>button({'class':'btStartTest', 'data-idx':idx},
							t.name
						))
					)
				),
				$C.html.iframe({id:'frmApp'})
			))
			.find('#btStart').click(function(){
				$('.btStartTest')
					.removeClass('started')
					.removeClass('performed');
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
			selectAppItem(sel).click();
		},
		checkContent(sel, re){
			return selectAppItem(sel).html().match(re)!=null;
		},
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
