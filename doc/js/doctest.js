const DocTest = (function($, $C){const $H=$C.simple;

	const {px,pc} = $C.css.unit, css = $C.css.keywords, $T = $C.css.template;

	const styles = {
		color:{
			back:'#012',
			text:'#eef',
			border:'#88a',
			petty:'#88a',
			attention: '#f60',
			attention_light: '#daea9c',
			link:{lo:'#eec', hi:'ffa'},
			code:{bak:'#023', text:'#ccf'},
			error:{bak:'#ff0', text:'#f00'},
			success:{text:'#22ddaf'}
		},
		font:{
			basic: 'Verdana, Arial, Sans-Serif',
			monospace: 'Courier New, Monospace'
		}
	};


	$C.css.writeStylesheet({
		'body':{
			fontFamily: styles.font.basic, 
			padding:px(20, 15, 70, 15),
			backgroundColor:styles.color.back,
			color: styles.color.text,
			' a':{
				':link':{color:styles.color.link.lo},
				':visited':{color:styles.color.link.lo},
				':hover':{color:styles.color.link.hi}
			},
			' p':{
				margin:px(2)
			},
			' .icon':{
				margin:px(1, 15),
				cursor: css.default
			},
			' .typeName':{color: styles.color.petty},
			' .attention':{color: styles.color.attention},
			' .attention_light':{color: styles.color.attention_light},
			' .undefinedItem':{color: styles.color.attention},
			' .membersList':{
				padding:px(5),
				margin:px(5, 0)
			},
			' .code':{
				fontFamily: styles.font.monospace,
				whiteSpace: 'pre',
				backgroundColor: styles.color.code.bak,
				color: styles.color.code.text
			},
			' .testError':{
				padding:px(5),
				border:$T.border(1, styles.color.error.text),
				fontWeight: css.bold,
				backgroundColor: styles.color.error.bak,
				color: styles.color.error.text
			},
			' .file':{fontFamily: styles.font.monospace},
			' .error':{color:styles.color.error.text},
			' .success':{color:styles.color.success.text},
			' .moduleDoc':{
				' .membersTable':{
					borderCollapse:css.collapse,
					' td':{
						border:$T.border(1, styles.color.border),
						padding: px(3),
						textAlign: css.left,
						verticalAlign: 'top'
					}
				},
				' .argumentList':{
					' ol':{
						margin:px(0, 45), padding:0
					},
					' .argName':{
						fontWeight: css.bold
					}
				}
			}
		}
	});



	function itemDoc(itm, nm, def){
		const{markup,apply,div,span} = $H;
		return markup(
			apply(def, (el)=>markup(
				typeof(el)=='function'?el(itm, nm):el
			))
		);
	}

	const testResult = {
		errors:0, success:0,
		get total(){return this.errors+this.success;}
	};

	function argumentList(defs){
		return $H.div({'class':'argumentList'},
			$H.div('Аргументы:'),
			$H.ol(
				$H.apply(defs, (d, nm)=>$H.li(
					$H.span({'class':'argName'}, nm), ' - ', d
				))
			)
		);
	}

	function testedSample(val, expectation){
		function formatVal(val){
			return val==null?'null'
				:typeof(val)=='function'?val.toString()
				:JSON.stringify(val);
		}

		function formatValArray(arr){
			return arr.map(v=>formatVal(v)).join(', ');
		}

		if(!(val instanceof Array)) val = [val];

		return (itm, nm)=>{
			const src = formatValArray(val);
			const res = itm.apply(null, val);
			const equal = (expectation==null && res==null) || JSON.stringify(res)==JSON.stringify(expectation);
			return $H.div({'class':'code'},
				nm, '(', src, ') &rarr; ', formatVal(expectation),
				equal?(testResult.success++, checkedSign())
					:(testResult.errors++,$H.span({'class':'testError'}, 'Ошибка теста! Получено значение ', formatVal(res)))
			)
		}
	}

	function test(F){
		return function(m){
			return F(m);
		};
	}


	function Assertions(){
		const res = [];

		this.assertTrue = function(val, msg){
			if(!val) res.push('Assertion failed: '+(msg || 'not true'));
		};

		this.assertFalse = function(val, msg){
			if(val) res.push('Assertion failed: '+(msg || 'not false'));
		};

		this.assertEqual = function(val1, val2, msg){
			val1 = JSON.stringify(val1);
			val2 = JSON.stringify(val2);
			if(val1!=val2) res.push('Assertion failed: '+(msg || (val1+' &#x2260; '+val2)));
		};

		this.result = function(){
			if(res.length){
				testResult.errors++; 
				return res.map(x=>$H.div({'class':'testError'}, x)).join();
			}
			else{
				testResult.success++;
				return checkedSign();
			}
		};
	}

	function moduleDoc(moduleName, content){
		const module = eval(moduleName);
		return $H.div({'class':'moduleDoc'},
			$H.a({'class':'moduleRef', name:'module_'+moduleName},
				$H.h2('Модуль ', moduleName)
			),
			$H.apply(content, el=>{
				return typeof(el)=='function'?el(module):el;
			})
		);
	}

	function checkedSign(){
		return $H.span({'class':'icon success', title:'Протестировано'}, '&#9745;');
	}

	/**
	 * Выводит описание атрибутов и методов объекта
	 * Аргумент descriptions содержит словарь,
	 * ключи которого соответствуют именам атрибутов и методов,
	 * а в качестве значения может быть передана строка комментария, 
	 * массив строковых значений, либо объект, содержащий 
	 * обязательный атрибут "content" - содержит текстовое описание в виде строки или массива строк
	 */
	function memberDescriptions(descriptions, count2View=-1){
		return function(module){
			const {markup,apply,div,span,table,tr,th,td} = $H;
			const notImplemented = [];

			function dataType(obj){
				return obj instanceof Array? 'Array'
					:obj instanceof Promise? 'Promise'
					:typeof(obj);
			}

			for(let k in descriptions){
				if(!(k in module)) notImplemented.push(k);
			}

			let count = 0;
			return div({'class':'membersList'},
				div(module instanceof Array?'Элементы массива':'Атрибуты и методы:'),
				count2View>0?div({'class':'attention_light'}, 
					count2View==1?'Показан только первый элемент'
						:`Показаны первые ${count2View} элементов`
				):null,
				table({'class':'membersTable'}, apply(module, (itm, nm)=>{
					if(count2View>0&&count>=count2View) return;
					const def = descriptions[nm];
					count++;
					return tr(def?null:{'class':'undefinedItem'},
						td(span({'class':'typeName'}, dataType(module[nm])), ' ', nm),
						td(
							def?div(itemDoc(
									itm, nm, 
									typeof(def)=='object'&&!(def instanceof Array)?def.content
										:def
								))
								:div(' документация отсутствует ')
						)
					);
				})),
				notImplemented.length?(testResult.errors++,div({'class':'testError'}, 
					notImplemented.length==1?markup('Не реализован элемент ', notImplemented[0])
						:markup('Не реализованы следующие элементы: ', notImplemented.join(', '))
				)):(testResult.success++,null)
			);
		};
	}

	function file(str){return $H.span({'class':'file'}, str);}

	function displayValue(){
		return function(m){
			return $H.span(
				' Текущее значение: ',
				$H.span({'class':'code'}, JSON.stringify(m))
			);
		};
	}

	function buildToc(){
		const {markup,apply,div,span,a,ul,li} = $H;
		const refs = [];
		$('a.moduleRef').each((i,ref)=>{
			ref = $(ref);
			refs.push({nm:ref.text(), id:ref.attr('name')});
		});
		$('.toc').html(markup(
			a({name:'toc'}),
			ul(apply(refs, ref=>div(
				li(a({href:'#'+ref.id}, ref.nm))
			)))
		));
	}

	return {
		moduleDoc:moduleDoc,
		file: file,
		memberDescriptions: memberDescriptions,
		test: test,
		Assertions: Assertions,
		testedSample: testedSample,
		argumentList: argumentList,
		testResult: testResult,
		buildToc: buildToc,
		displayValue: displayValue
	};
})(jQuery, Clarino.version('1.1.0'));
