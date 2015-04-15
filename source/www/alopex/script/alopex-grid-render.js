/*! Alopex UI - v2.2.30 - 2014-10-27
* http://ui.alopex.io
* Copyright (c) 2014 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */
;(function($,window){
	/**
	 * columnMapping.render = function(value, data) {... return "읽기모드용 html string";}
	 * columnMapping.editable = function(value, data) {... return "편집모드용 html string";}
	 * 원하는 셀의 렌더링 형태를 코드로 파악하고, 필요에 따라 개별화 할 수 있도록
	 * 가이드하는 코드입니다.
	 *  
	 * 1. Data read용 renderer(render)
	 * 2. Data edit용 renderer(editable)
	 * 
	 * 기존 코드의 설정 옵션 형태
	 * {type:"select", styleclass:"추가할 클래스명", attr : {key:"value"},
	 *  rule : function(value, data){return [{text:"option태그텍스트",value:"option태그밸류"}]}}
	 * type href는 text와 같은 옵션도 가지고 있음. 이에 대한 일원화.
	 * 
	 */
	if(!window["AlopexGrid"]) {
		return;
	}
	var root = window["AlopexGrid"];
	function _evaluateRule(rule) {
		return $.isFunction(rule) ? rule() : rule;
	}
	function _valid(value) {
		return !(value === undefined || value === null);
	}
	/**
	 * 오브젝트로부터 tag attribute string을 생성한다.
	 * @param attrobject tag attr string을 생성하고자 하는 기본 오브젝트. attribute의 key value를 가지고 있음.
	 * @param ifnotexist attrobject에 없는 속성이 있을경우 사용하고자 하는 attribute 오브젝트.
	 * @returns tag attribute string
	 */
	function _attr(attrobject,ifnotexist) {
		if(!attrobject && !ifnotexist) {
			return "";
		}
		var str = [''];
		var classes = [];
		var attr = $.extend({}, ifnotexist, attrobject);
		if(attr.hasOwnProperty("class") && attr["class"]) classes.push(attr["class"]);
		if(attr["styleclass"]) classes.push(attr["styleclass"]);
		delete attr["class"];
		delete attr["styleclass"];
		str.push('class="' + classes.join(" ") + '"');
		for(var key in attr) {
			if(!attr.hasOwnProperty(key) || attr[key] === null || attr[key] === undefined) continue;
			str.push(key + '="' + attr[key] + '"');
		}
		str.push('');
		return str.join(' ');
	}
	function _list(rule, value, data) {
		var list = [];
		if(rule) {
			list = list.concat($.isFunction(rule) ? rule(value, data) : rule);
		}
		if(_valid(value)) {
			var exist = false;
			for(var i=0,l=list.length; i<l; i++) {
				if(list[i].value===value) exist = true;
			}
//			if(!exist) {
//				list.unshift({value:value, text:value});
//			}
		}
		return list;
	}
	/**
	 * colummMapping.editable : 
	 *  AlopexGrid.render({type:"select",rule:[{value:"",text:""}],attr:{styleclass:"aaa",target:"_blank"}})
	 * type "check"의 경우 rule은 {value:"",check:true/false} 로 정의됨.
	 */
	var renderFunction = function(option) {
		var type = option["type"];
		if(!render[type]) {
			return null;
		}
		var returnObject = (function(t, op){
			var o = $.extend(true, {attr:{}},op);
			if(op.styleclass) {
				o.attr.styleclass = o.attr.styleclass || "";
				o.attr.styleclass += op.styleclass;
			}
			return function(value, data, mapping) {
				return render[t](o, _valid(value) ? value : "", data, mapping || {});
			};
		})(type, option);
		returnObject["editedValue"] = render[type]["editedValue"] || null;
		return returnObject;
	};
	var _keygen = root.generateKey;
	
	
	/***********************************************************
	 * 렌더링 구현부
	 ***********************************************************/
	var render = {};
	
	/**
	 * <a href="...">text</a> 형태에 대한 렌더링
	 */
	render["href"] = function(render, value, data, mapping) {
		var rendered = "<a ";
		rendered += _attr(render.attr);//생성시 기입한 옵션에서 추출할 수 있는 tag attribute 문자열을 생성.
		rendered += ' href="' + (value || '#') + '">';
		rendered += (render.text || "") + '</a>';
		return rendered;
	};
	
	/*******
	 * 일반 string을 정해진 규칙에 따라 formatting할 수 있는 비편집용 렌더링.
	 * rendering option에서 rule값을 이용하여 formatter를 지정한다.
	 */
	render["string"] = function(render, value, data, mapping) {
		var rule = render ? render.rule : null;
		if(typeof rule === "string") {
			var rules = rule.split(' ');
			rule = {};
			for(var i=0,l=rules.length; i<l;i++) {
				var key = rules[i];
				rule[key] = true;
			}
		}
		if($.isPlainObject(rule)) {
			if(rule.comma) {
				//{type:"string", rule:{comma:true}}
				value = (value+"").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
			if(rule.date) {
				//{type:"string", rule:{date:true}}
				value = value.substr(0,4) + '-' + value.substr(4,2) + '-' + value.substr(6,2);
			}
		} else if($.isArray(rule)) {
			for(var i=0,l=rule.length;i<l;i++) {
				if(String(rule[i].value) === String(value)) {
					value = String(rule[i].text || value);
					break;
				}
			}
		}
		
		var result = "<div ";
		if(rule && rule.ellipsis) {
			//{type:"string", rule:{ellipsis:true}}
			result += 'style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"';
		}
		result += '>'+value+'</div>';
		return result;
	};
	
	/*******
	 * <input type="text"> 타입에 대한 렌더링
	 */
	render["text"] = function(render, value, data, mapping) {
		var result = '<input type="text" value="' + value + '"';
		//columnMapping.render.attr에 명시되지 않은 attribute는 두번째 파라메터에 넘겨서 처리합니다.
		result += _attr(render.attr, {"name":mapping.key || _keygen(),"style":"width:100%;"});
		result += (render.readonly ? ' disabled="disabled"' : '');
		result += "/>";
		return result;
	};
	// columnMapping.editable에 할당된 경우에만 editedValue가 사용된다.
	render["text"]["editedValue"] = function(cell) {
		return $(cell).find('input').val();
	};
	
	/*******
	 * <textarea> 타입에 대한 렌더링
	 */
	render["textarea"] = function(render, value, data, mapping) {
		var result = '<textarea ';
		result += _attr(render.attr, {"name":mapping.key || _keygen(),"style":"width:100%;max-width:100%;"});
		result += (render.readonly ? ' disabled="disabled"' : '');
		result += '>'+value+'</textarea>';
		return result;
	};
	render["textarea"]["editedValue"] = function(cell) {
		return $(cell).find('textarea').val();
	};
	
	/*******
	 * <select><option>... 형태에 대한 렌더링
	 */
	render["select"] = function(render, value, data, mapping) {
		var list = _list(render.rule, value, data);//여러개의 선택항이 주어지는경우 사용
		var result = '<select ';
		result += _attr(render.attr, {"name":mapping.key || _keygen(),"style":"width:100%;"});
		result += (render.readonly? ' disabled="disabled"' : '');
		result += '>';
		for(var i=0,l=list.length; i<l; i++) {
			result += '<option value="' + list[i].value + '"';
			result += (list[i].value == value) ? ' selected="selected"' : '';
			result += '>' + (list[i].text || list[i].value) + '</option>';
		}
		result += '</select>';
		return result;
	};
	render["select"]["editedValue"] = function(cell) {
		return $(cell).find('option').filter(':selected').val() || "";
	};
	
	/*******
	 * <input type="radio"... 형태에 대한 렌더링 
	 */
	render["radio"] = function(render, value, data, mapping) {
		var list = _list(render.rule, value, data);
		var result = '';
		var name = mapping.key || _keygen();
		for(var i=0,l=list.length;i<l;i++) {
			var item = list[i];
			result += '<label><input type="radio" name="' + name + '" value="' + item.value + '"';
			result += _attr(render.attr);
			result += (render.readonly ? ' disabled="disabled" ' : '');
			result += (item.value == value ? ' checked="checked"' : '');
			result += '/><span>' + (item.text || item.value) + '</span></label>';
		}
		return result;
	};
	render["radio"]["editedValue"] = function(cell) {
		return $(cell).find('input').filter(':checked').val();
	};
	
	/*******
	 * <input type="checkbox".... 형태에 대한 렌더링.
	 * check:true 또는 check:false여부에 따라 가른다.
	 */
	render["check"] = function(render, value, data, mapping) {
		var list = _list(render.rule, value, data);
		var result = '<input type="checkbox" ';
		result += _attr(render.attr, {"name":mapping.key || _keygen()});
		for(var i=0,l=list.length; i<l;i++) {
			if(list[i].value == value && list[i].check === true) {
				result += ' checked="checked"';
			}
			if(list[i].check === true) {
				result += ' data-checked-value="' + list[i].value +'"';
			}
			if(list[i].check === false) {
				result += ' data-unchecked-value="' + list[i].value +'"';
			}
		}
		result += render.readonly ? ' disabled="disabled"' : '';
		result += '/>';
		return result;
	};
	render["check"]["editedValue"] = function(cell) {
		var $input = $(cell).find('input');
		return $input.prop('checked') ? $input.attr('data-checked-value') : $input.attr('data-unchecked-value');
	};
	
	/*******
	 * <input data-type="dateinput"> 형태에 대한 렌더링
	 */
	render["date"] = function(render, value, data, mapping) {
		var datevalue = (_valid(value) && typeof value == "string" && value.length > 0) 
			? value.substr(0, 4) + '-' + value.substr(4, 2) + '-' + value.substr(6, 2)
			: '';
		var rendered = [ '<input type="text" data-type="dateinput" '];
		rendered.push(_attr(render.attr, {"name":_keygen(),"style":"width:100%;"}));
		rendered.push(' value="',datevalue,'" ');
		rendered.push('/>');
		return rendered.join('');
	};
	render["date"]["editedValue"] = function(cell) {
		return $(cell).find('input').val().replace(/\-/gi, '');
	};
	
	/*******
	 * 외부에서 사용하기 위한 이름 설정. 
	 * window["_r"] 형식으로 선언하게 되면 일반 코드에서는 _r({type:"text"}) 형태로 사용할 수 있게 된다.
	 */
	window["AlopexGrid"]["render"] = renderFunction;//export
	window["_r"] = renderFunction;
	
})(jQuery, window);