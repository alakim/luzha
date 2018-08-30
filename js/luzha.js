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
			size:{h:50}
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
			height:px(Style.panel.size.h)
		},
		'#frmApp':{
			width:pc(100),
			height:`calc(100vh - ${Style.panel.size.h}px - 14px)`,
			border:$T.border(1, Style.color.text)
		}
	});

	let tests = [];

	function init(){
		const {markup,h1,div,span,button} = $H;
		$('#pnlMain').html(markup(
			h1('Luzha v.', version)
		));

		for(t of tests) t($, Luzha);
	}

	function selectAppItem(sel){
		return $(window.frames[0].document.body).find(sel);
	}

	$(init);
	const Luzha = {
		Test:(f)=>{tests.push(f);},
		open:(url, F)=>{
			$('#frmApp')[0].src=url;
			setTimeout(F, 1e3);
		},
		click:(sel)=>{
			selectAppItem(sel).click();
		},
		checkContent(sel, re){
			const el = selectAppItem(sel);
			return el.html().match(re)!=null;
		}
	};

	return Luzha;
})(jQuery, Clarino.version('1.2.0'));
