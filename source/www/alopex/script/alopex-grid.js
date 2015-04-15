/*! Alopex UI - v2.2.30 - 2014-10-27
* http://ui.alopex.io
* Copyright (c) 2014 alopex.ui; Licensed Copyright. SK C&C. All rights reserved. */
/*!
 * Copyright (c) 2013 SK C&C Co., Ltd. All rights reserved.
 *
 * This software is the confidential and proprietary information of SK C&C.
 * You shall not disclose such confidential information and shall use it
 * only in accordance with the terms of the license agreement you entered into
 * with SK C&C.
 *
 * Alopex UI Table Grid Component Version 1
 * 
 * Hard Dependency : jQuery
 * Soft Dependency : Alopex UI, Alopex UI Validator
 *
 */
+(function($) {
	if (!window.console) {
		window.console = {
			history: [],
			historyLimit: 200,
			log: function() {
				this.history.push(Array.prototype.join.call(arguments, ' '));
				while (this.history.length > this.historyLimit) {
					this.history.shift();
				}
			}
		};
	}
	var $window = $(window);
	var $windowtop = $(window.top);

	function getParamNames(fn) {
		var funStr = fn.toString();
		return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
	}
	function voidFunction(){}
	var isMobile = ("ontouchstart" in document.documentElement || 'ontouchstart' in window);
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
	var isIE = (function() {
		//get document mode
		for (var v = 3, el = document.createElement('b'), all = el.all || [];
			 el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
		return v > 4 ? v : document.documentMode;
	}());
	var ieVER = (function(){
		//get browser mode
		var e, obj = document.createElement("div"), x,
			verIEtrue = null,  // True IE version [string/null]
			CLASSID = [
				"{45EA75A0-A269-11D1-B5BF-0000F8051515}", // Internet Explorer Help
				"{3AF36230-A269-11D1-B5BF-0000F8051515}", // Offline Browsing Pack 
				"{89820200-ECBD-11CF-8B85-00AA005B4383}"];
		try{obj.style.behavior = "url(#default#clientcaps)"}
		catch(e){ };
		for (x=0;x<CLASSID.length;x++)
		{
			try{verIEtrue = obj.getComponentVersion(CLASSID[x], "componentid").replace(/,/g,".")}
			catch(e){ };
			if (verIEtrue) break;
		};
		return typeof verIEtrue ==="string" ? Number(verIEtrue.split(".")[0]) : null;
	})();
	var isAlopexEvent = $.fn.hasOwnProperty('tap') || $.fn.hasOwnProperty('singletap');
	var isAlopexMobile = isMobile && isAlopexEvent;

	function _noapi(){
		setTimeout(function(){
			console.error('[DO NOT USE]');
			throw new Error('[AlopexGrid] unsupported API');
		},0);
	}

	var _idbase = Number(Math.random().toString().split(".").pop().slice(-3));
	var _idprefix = "alopexgrid";
	var hasAlopexValidate = false;
	$(function(){
		hasAlopexValidate = window["Validator"] && $.isFunction($.fn.validator) && $.isFunction($.fn.getErrorMessage);
	});
	function hasAlopexValidator() {
		return hasAlopexValidate;
	}
	function _convertAlopex (str){
		if(this.option && this.option.disableAlopexConvert) {
			return str;
		}
		if($ && $.alopex && $.isFunction($.fn.convert)) {
			var containDataType = true;
			if(typeof str === "string" && str.indexOf('data-type') === -1) {
				containDataType = false;
			}
			if(containDataType){
				return $(str).convert();
			}
		}
		return str;
	}

	function processMappingValidate(mapping) {
		return $.isPlainObject(mapping.validate) && hasAlopexValidator();
	}
	var _tooltipTimer = null;
	function processValidateChange(mapping, valid, errorMessage, cell, value) {
		var self = this;
		if(_tooltipTimer) {
			clearTimeout(_tooltipTimer);
			_tooltipTimer = null;
		}
		_tooltipTimer = setTimeout(function(){
			if ($.isFunction(mapping.validate.onchange) || $.isFunction(self.option.on.validate)) {
				//사용자 지정 callback이 있는 경우
				mapping.validate.onchange ? mapping.validate.onchange(valid, errorMessage, cell, value) : "";
				self.option.on.validate ? self.option.on.validate(valid, errorMessage, cell, value) : "";
			}
			var usetooltip = ($.type(self.option.useValidateTooltip) === "boolean") ? self.option.useValidateTooltip : true;
			if(mapping.validate.onchange || self.option.on.validate) {
				if(mapping.validate.enableTooltip === true) {
					usetooltip = true;
				} else if(self.option.useValidateTooltip !== true) {
					usetooltip = false;
				}
			} else {
				if(mapping.validate.enableTooltip === false) {
					usetooltip = false;
				}else if(mapping.validate.enableTooltip === true) {
					usetooltip = true;
				}
			}

			if (usetooltip) {
				//사용자 지정 callback이 없는 경우 default 처리
				var $cell = cell.jquery ? cell : $(cell);
				$cell[valid ? "removeClass" : "addClass"]("invalid");
				$cell[!valid ? "removeClass" : "addClass"]("valid");
				var id = _generateUniqueId();
				$cell.prop('id', id);

				self._showTooltip($cell[0], errorMessage.join('<br>'), null);
			}
			_tooltipTimer = null;
		},200);
	}
	function getValidatoredInput(cell, mapping) {
		var self = this;
		var $input = (self.option.directEdit && mapping.editable===true) ?
			$('<input type="text" value="'+$(cell).text()+'">')
			: $(cell).find('input,select,textarea');
		if ($input && $input.length) {
			//validator option이 없는 경우 해당 항목을 추출하여 validator를 $(cell)에 호출시킨다.
			if (!$input.attr("data-validate-rule") && !$input.attr('data-validation-rule')) {
				$input.validator({
					option: {
						onkeyup: false,
						onchange: false,
						onblur: false
					},
					rule: $.extend({}, mapping.validate.rule),
					message : $.extend({}, mapping.validate.message)
				});
				if($.isPlainObject(mapping.validate.attr)) {
					var attr = $.extend({}, mapping.validate.attr);
					if(attr["styleclass"]) {
						attr["class"] = [(attr["class"]||""),attr["styleclass"]].join(' ');
						delete attr["styleclass"];
					}
					$input.attr(attr);
				}
			}
		}
		return $input.length ? $input : null;
	}

	var __tagsToReplace = {
		'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#039;',' ':'&nbsp;'
	};
	function __replaceTag(tag) {
		return __tagsToReplace[tag] || tag;
	}
	function _escapeHTML(str) {
		return String(str).replace(/[&<>"'\s\u00A0]/g, __replaceTag);
	}

	function _generateUniqueId() {
		return _idprefix + (_idbase++);
	}
	function _generateUniqueNumber() {
		return _idbase++;
	}

	function _scrollHack($elem, ns){
		if(isMobile) { $elem.on('touchstart'+(ns||''), voidFunction); }
	}
	function clearSelection() {
		if (window.getSelection) {
			if (window.getSelection().empty) {
				try {
					window.getSelection().empty();
				} catch (error) {
				}
			} else {
				if (window.getSelection().removeAllRanges) {
					try {
						window.getSelection().removeAllRanges();
					} catch (error) {
					}
				}
			}
		} else {
			if (document.selection && document.selection.empty) {
				try {
					document.selection.empty();
				} catch (error) {
				}
			}
		}

		/*if (window.getSelection) { // all browsers, except IE before version 9
		 var myRange = window.getSelection();
		 myRange.removeAllRanges();
		 } else {
		 var e;
		 try {
		 document.selection.empty();
		 } catch (e) {

		 }
		 }*/
	}
	function _valid(value) {
		return !(value === null || value === undefined);
	}
	function _min(a, b) {
		return a < b ? a : b;
	}
	function _max(a, b) {
		return a > b ? a : b;
	}
	function _generateHTML(data, $root) {
		var html = [];
		if($.isArray(data)) {
			data = {child:data};
		}
		if (!$root && ((data === undefined || data === null) || (!data.tag && (data.child === undefined || data.child === null)))) {
			return (data === undefined || data === null) ? "" : data;
		}
		if ($root && !$root.jquery) {
			$root = $($root);
		}

		if (data !== undefined && data !== null) {
			if (data.tag && !$root) {
				html.push('<', data.tag);
				if (data.attr) {
					for ( var key in data.attr) {
						var name = key;
						if (key == "styleclass") {
							name = "class";
						}
						html.push(' ', name, '="', data.attr[key], '"');
					}
				}
				html.push('>');
			}
			if ($root && data.attr) {
				for ( var key in data.attr) {
					if (key === "styleclass") {
						$root.addClass(data.attr[key]);
					} else {
						$root.attr(key, data.attr[key]);
					}
				}
			}

			if (data.hasOwnProperty('child') && data.child !== null && data.child !== undefined) {
				if ($.isArray(data.child)) {
					for ( var i in data.child) {
						html.push(_generateHTML(data.child[i]));
					}
				} else {
					html.push(_generateHTML(data.child));
				}
			}

			if (data.tag && !$root) {
				html.push('</', data.tag, '>');
			}
		}
		if ($root) {
			$root.html(html.join(''));
		} else {
			return html.join('');
		}
	}
	function _addClassAttribute(elem, className) {
		if(!elem.attr.styleclass || $.inArray(className,elem.attr.styleclass.split(' ')) < 0) {
			elem.attr.styleclass = (elem.attr.styleclass || '') + ' ' + className;
		}
	}
	function _addEventAttribute(elem, type, handler, useAttr) {
		if (!elem || typeof elem !== "object" || !elem.hasOwnProperty('tag') || typeof type !== "string") {
			return;
		}
		var name = type;
		elem.attr = elem.attr || {};
		elem.attr[name] = elem.attr[name] || "";
		elem.attr[name] += handler;
	}

	function _isColumnValid(mapping, cell, value, data) {
		var self = this;
		if ($.isArray(mapping.valid)) {
			for ( var i in mapping.valid) {
				if (mapping.valid[i] === value) {
					return true;
				}
			}
			return false;
		} else if (typeof mapping.valid == "function") {
			return mapping.valid(cell, value, data);
		} else if ($.isArray(mapping.rule)) {
			for ( var i in mapping.rule) {
				if (_ruleValue(mapping.rule[i],"value") === value) {
					return true;
				}
			}
			return false;
		}
		return true;
	}
	//mapping.render.rule object parser/reader
	function _parseRule(render, value, data, mapping) {
		if(!render.rule) return null;
		var rules = render.rule || null;
		if($.isFunction(render.rule)) {
			rules = render.rule(value, data, mapping) || null;
		}
		if($.isArray(render.rule)) {
			rules = render.rule;
		}
		return rules;
	}
	function _ruleValue(ruleobj, key) {
		if(ruleobj.hasOwnProperty(key)) return ruleobj[key];
		if(ruleobj.hasOwnProperty(key.toUpperCase())) return ruleobj[key.toUpperCase()];
		if(ruleobj.hasOwnProperty(key.toLowerCase())) return ruleobj[key.toLowerCase()];
		return undefined;
	}
	//셀 내부의 데이터로부터 현재 선택된 값을 추출..?
	function _extractValue(mapping, cell, data) {
		//render.type="text" : 셀 내부의 input의 value를 data로 추출한다
		//render.type="select" : 셀 내부의 select의 selected option의 value를 추출
		//render.type="radio" : 셀 내부의 radio input중 checked input의 value를 추출
		//render.type="check" : 셀 내부의 check input의 check여부에 따라 boolean값 추출
		//그 외에 처리되지 않는 내용은 endEdit함수에 의해 처리된다.
		var self = this;
		var $cell = cell.jquery ? cell : $(cell);
		if (mapping.editable === true) {
			if(self.option.directEdit) {
				return $cell.text();
			}
			return $cell.find('input').eq(0).val();
		}
		var editable = mapping.editable;

		if(editable.type && (self.option.renderMapping[editable.type] || self.option.renderMapping["*"])) {
			var mappedRender = self.option.renderMapping[editable.type] || self.option.renderMapping["*"];
			if($.isFunction(mappedRender)) {
				editable = mappedRender(editable, mapping);
			} else if($.isPlainObject(mappedRender)) {
				editable = $.extend({}, editable, mappedRender);
			}
		}

		if(editable.type) {
			if (editable.type == "text") {
				var val = $cell.find('input').val();
				if (editable.rule) {
					if (editable.rule === "comma") {
						val = val.replace(/,/g, '');
					} else if (editable.rule === "date" || editable.rule === "month") {
						val = val.replace(/-/g, '');
					}
				}
				return val;
			}
			if (editable.type == "select") {
				return $cell.find('select option').filter(":selected").val();
			}
			if (editable.type == "radio") {
				return $cell.find('input').filter(":checked").val();
			}
			if (editable.type == "textarea") {
				return $.cell.find('textarea').val();
			}
			if (editable.type == "check") {
				var rule = editable.rule;
				var checked = $cell.find('input').eq(0).is(":checked");
				//true/false만 리턴하거나, 또는 render.rule이 지정하는 바가 있을 경우 찾아서 value를 생성한다.
				if ($.isArray(rule)) {
					$.each(rule, function(idx, r) {
						if (_ruleValue(r,"check") === checked) {
							checked = _ruleValue(r,"value");
							return false;
						}
					});
				}
				return checked;
			}
			if (editable.type == "date") {
				return $cell.find('input').val().replace(/\-/gi, '');
			}
		} else {
			var worker = null;
			if ($.isFunction(mapping.editedValue) || $.isFunction(editable.editedValue)) {
				worker = (mapping.editedValue || editable.editedValue);
			}
			if($.isFunction(worker)) {
				return worker(cell, $.extend({}, data), mapping);
			}
		}
	}
	function _renderValue(render, value, data, mapping) {
		//render : {type:"select",rule:[{value:"A",text:"A"},{value:"B",text:"B"},{value:"B",text:"B"}]}
		//render : {rule : [{value:"A",text:'<span class="a">aa</span>'},{value:"B",text:'<span class="b">bb</span>'},{value:"C",text:'<span class="c">cc</span>'}]}
		var self = this;
		var rendered = "";
		if (value === undefined) {
			value = "";
		}
		var copied = $.extend({}, data);
		var type = render.type || null;
		var orgtype = type;
		if(type && (self.option.renderMapping[type] || self.option.renderMapping["*"])) {
			var mappedRender = self.option.renderMapping[type] || self.option.renderMapping["*"];
			if($.isFunction(mappedRender)) {
				render = mappedRender(render, mapping);
			} else if($.isPlainObject(mappedRender)) {
				render = $.extend({}, render, mappedRender);
			}
			type = render.type || null;
		}
		if(!(type || render)) {
			throw new Error('[AlopexGrid] Unable to render cell with a renderer of type "'+orgtype+'"');
		}
		rendered += _renderValue.plugin[type || "general"].call(self, render, value, copied, mapping);
		return rendered;
	}

	_renderValue.plugin = {};
	_renderValue.plugin["general"] = function(render, value, data, mapping) {
		var rendered = "";
		if (typeof render == "string") {
			rendered += render;
		} else if ($.isFunction(render)) {
			rendered += render.call(this, value, data, mapping, render);
		} else if ($.isPlainObject(render)) {
			if(render.rule) {
				var rules = $.isFunction(render.rule) ? render.rule(value, data, mapping, render) : render.rule;
				for ( var idx in rules) {
					if (_ruleValue(rules[idx],"value") == value) {
						rendered += _ruleValue(rules[idx],"text");
					}
				}
			}
		}
		return rendered;
	};
	//TODO 메타기반으로 자동 생성 가능토록
	_renderValue.plugin["href"] = function(render, value, data, mapping) {
		var rendered = [];
		rendered.push('<a href="', value || '#', '" class="');
		if (render.styleclass) {
			rendered.push(render.styleclass);
		}
		rendered.push('" ');
		if (typeof render.attr == "object") {
			for ( var prop in render.attr) {
				rendered.push(prop + '="' + render.attr[prop] + '" ');
			}
		}
		rendered.push('>');
		if (render.text) {
			rendered.push(render.text);
		}
		rendered.push('</a>');
		return rendered.join('');
	};
	//일반 텍스트 렌더링 모듈. 천단위 콤마와 같은 특수 포매팅도 담당한다. 
	_renderValue.plugin["string"] = function(render, value, data, mapping) {
		value = _escapeHTML(value);
		var tag = {
			tag: "div",
			attr: {},
			child: value
		};
		tag.attr = $.extend(tag.attr, $.isPlainObject(render.attr) ? render.attr : null);
		if (typeof render.styleclass === "string") {
			tag.attr.styleclass = render.styleclass;
		}
		var renderrule = _parseRule(render, value, data, mapping);
		if (typeof renderrule === "string") {
			var rules = renderrule.split(' ');
			var result = value;
			$.each(rules, function(idx, rule) {
				if (rule === "comma") {
					result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} else if (rule === "ellipsis") {
					tag.attr.style = tag.attr.style || "";
					tag.attr.style += "text-overflow: ellipsis; white-space: nowrap; overflow: hidden;";
				}
			});
			tag.child = result;
		} else if($.isArray(render.rule) || $.isFunction(render.rule)) {
			var result = value;
			var rules = $.isFunction(render.rule) ? render.rule(value, data, mapping) : render.rule;
			for(var i=0,l=rules.length; i<l; i++) {
				var rule = rules[i];
				if(_ruleValue(rule, "value") === undefined) continue;
				if(String(_ruleValue(rule, "value")) === String(value) && _ruleValue(rule, "text") !== undefined) {
					result = _ruleValue(rule, "text");
				}
			}
			tag.child = result;
		}
//		tag.child = _escapeHTML(tag.child);
		return _generateHTML(tag);
	};
	//textarea 생성 
	_renderValue.plugin["textarea"] = function(render, value, data, mapping) {
		//{ type : "textarea" , attr : {row : 6, col : 30}, styleclass : "newtextarea"
		var tag = {
			tag: "textarea",
			attr: {
				name: (this.option.editableNameWithKey ? mapping.key : null) || _generateUniqueId()
			},
			child: value
		};
		tag.attr = $.extend(tag.attr, $.isPlainObject(render.attr) ? render.attr : null);
		if (typeof render.styleclass === "string") {
			tag.attr.styleclass = render.styleclass;
		}
		if (!tag.attr.style || tag.attr.style.indexOf('width') === -1) {
			tag.attr.style = (tag.attr.style || "") + "width:100%;max-width:100%;";
		}
		return _generateHTML(tag);
	};
	//input tag 생성,  type="text"
	_renderValue.plugin["text"] = function(render, value, data, mapping) {
		var rendered = ['<input type="text" value="'];
		rendered.push((value === undefined ? "" : value) + '" ');
		rendered.push('name="' + ((this.option.editableNameWithKey ? mapping.key : null) || _generateUniqueId()) + '" ');
		if (render.styleclass) {
			rendered.push('class="', render.styleclass, '" ');
		}
		if (typeof render.attr == "object") {
			for ( var prop in render.attr) {
				if (prop == "style") {
					rendered.push(prop, '="');
					if (render.attr[prop].toLowerCase().indexOf('width') < 0) {
						rendered.push('width:100%;');
					}
					rendered.push(render.attr[prop], '" ');
				} else {
					rendered.push(prop, '="', render.attr[prop], '" ');
				}
			}
		} else {
			rendered.push('style="width:100%;"');
		}
		var irule = null;
		if (typeof render.rule === "string") {
			irule = render.rule.split(' ');
		} else if ($.isArray(render.rule)) {
			irule = render.rule;
		} else if ($.isFunction(render.rule)) {
			irule = render.rule(value, data, mapping);
		}
		if ($.isArray(irule)) {
			$.each(irule, function(idx, rule) {
				if (rule === "number") {//숫자만 입력 가능한 input
					rendered.push(' onkeypress="AlopexGrid._renderNumberOnlyHandler(event);"');
				} else if (rule === "comma" || rule === "date" || rule === "month") {
					//comma : 3자리마다 쉼표를 넣기. number로 제한. extractor도 구현해야 함.
					//date : 2014-01-01. number로 제한
					//month : 2014-01. number로 제한. 
					rendered.push(' onkeypress="if(AlopexGrid._renderNumberOnlyHandler(event)===false){return false;};return AlopexGrid._renderReplaceHandler(this,event,\'' + rule + '\');"');
				}
			});
		}
		rendered.push('/>');
		return rendered.join('');
	};
	_renderValue.plugin["select"] = function(render, value, data, mapping) {
		var rendered = ['<select name="'];
		var rules = render.rule;
		if (typeof rules == "function") {
			rules = rules(value, data, mapping);
		}
		rendered.push((this.option.editableNameWithKey ? mapping.key : null) || _generateUniqueId(), '" ');

		if (render.styleclass) {
			rendered.push('class="', render.styleclass, '" ');
		}
		if (typeof render.attr == "object") {
			for ( var prop in render.attr) {
				if (prop == "style") {
					rendered.push(prop, '="');
					if (render.attr[prop].toLowerCase().indexOf('width') < 0) {
						rendered.push('width:100%;');
					}
					rendered.push(render.attr[prop], '" ');
				} else {
					rendered.push(prop, '="', render.attr[prop], '" ');
				}
			}
		} else {
			rendered.push('style="width:100%;"');
		}

		if (render.readonly) {
			rendered.push(' disabled="disabled"');
		}
		rendered.push('>');
		for ( var idx in rules) {
			var rule = rules[idx];
			rendered.push('<option value="', _ruleValue(rule, "value"), '"');
			if (_ruleValue(rule, "value") == value) {
				rendered.push(' selected="selected"');
			}
			rendered.push('>', (_ruleValue(rule, "text") || _ruleValue(rule, "value")), '</option>');
		}

		return rendered.join('');
	};
	_renderValue.plugin["radio"] = function(render, value, data, mapping) {
		var rendered = [];
		var name = (this.option.editableNameWithKey ? mapping.key : null) || _generateUniqueId();
		var rules = render.rule;
		if (typeof rules == "function") {
			rules = rules(value, data, mapping);
		}
		for ( var idx in rules) {
			var rule = rules[idx];
			rendered.push('<label ');
			if (typeof render.attr == "object") {
				for ( var prop in render.attr) {
					rendered.push(prop, '="', render.attr[prop], '" ');
				}
			}
			rendered.push('><input type="radio" name="', name, '" value="', _ruleValue(rule, "value"), '"');
			if (render.readonly) {
				rendered.push(' disabled="disabled" ');
			}
			if (render.styleclass) {
				rendered.push(' class="', render.styleclass, '" ');
			}
			if (_ruleValue(rule, "value") == value) {
				rendered.push(' checked="checked"');
			}
			rendered.push('/>', '<span>', (_ruleValue(rule, "text") || _ruleValue(rule, "value")), '</span>');
			rendered.push('</label>');
		}
		return rendered.join('');
	};
	_renderValue.plugin["check"] = function(render, value, data, mapping) {
		var rendered = [];
		var name = (this.option.editableNameWithKey ? mapping.key : null) || _generateUniqueId();
		var rules = render.rule;
		if (typeof rules == "function") {
			rules = rules(value, data, mapping);
		}
		rendered.push('<input type="checkbox" name="', name, '"');
		if (render.styleclass) {
			rendered.push(' class="', render.styleclass, '" ');
		}
		if (typeof render.attr == "object") {
			for ( var prop in render.attr) {
				rendered.push(prop, '="', render.attr[prop], '" ');
			}
		}
		if (value == true || value == "true") {
			rendered.push(' checked="checked"');
		}
		if ($.isArray(rules)) {
			for ( var idx in rules) {
				var rule = rules[idx];
				if (_ruleValue(rule, "value") == value && _ruleValue(rule, "check")) {
					rendered.push(' checked="checked"');
					break;
				}
			}
		}
		if (render.readonly) {
			rendered.push(' disabled="disabled"');
		}
		rendered.push('/>');
		return rendered.join('');
	};
	_renderValue.plugin["date"] = function(render, value, data, mapping) {
		var rendered = [ '<input type="text" data-type="dateinput" ' ];
		if (typeof render.attr == "object") {
			for ( var prop in render.attr) {
				if (prop == "style") {
					rendered.push(prop, '="');
					if (render.attr[prop].toLowerCase().indexOf('width') < 0) {
						rendered.push('width:100%;');
					}
					rendered.push(render.attr[prop], '" ');
				} else {
					rendered.push(prop, '="', render.attr[prop], '" ');
				}
			}
		}
		var datestr = value.substr(0, 4) + '-' + value.substr(4, 2) + '-'
			+ value.substr(6, 2);
		rendered.push(' value="' + ((value.length != 0) ? datestr : '') + '" ');
		rendered.push('/>');
		var str = rendered.join('');
		return str;
	};

	//MergeSort - stable
	function _merge_sort(array, comparison, begin, end) {
		begin = begin || 0;
		end = end || array.length;
		var size = end - begin;
		if (size < 2)
			return array;
		var middle = begin + Math.floor(size / 2);
		var merged = _merge(_merge_sort(array.slice(begin, middle), comparison), _merge_sort(array.slice(middle, end), comparison), comparison);
		merged.unshift(begin, merged.length);
		Array.prototype.splice.apply(array, merged);
		//array.splice(begin, merged.length, )
		return array;
	}
	function _merge(left, right, comparison) {
		var result = [];
		while ((left.length > 0) && (right.length > 0)) {
			if (comparison(left[0], right[0]) <= 0)
				result.push(left.shift());
			else
				result.push(right.shift());
		}
		while (left.length > 0)
			result.push(left.shift());
		while (right.length > 0)
			result.push(right.shift());
		return result;
	}
	//Sort General
	function _sort(list, comparison, begin, end) {
		if (!list || !list.length) {
			return list;
		}
		if (list.length < 2) {
			return list;
		}

		begin = begin || 0;
		end = end || (list.length);
		if(end-begin > 120000 && begin == 0 && end == list.length && !isChrome) {
			list.sort(comparison);//12만건 이상의 자체함수 이용 정렬은 크롬에서도 스택초과로 불과. 또한 정렬결과가 stable하지 않음.
		} else {
			_merge_sort(list, comparison, begin, end);
		}
		return list;
	}
	//정렬되어 있지 않은 list에 대해서, rowspan:"always"가 있는 경우 해당 컬럼 기준으로 
	//흩어진 데이터들을 맨 앞의 최초 출현 시점으로 모으도록 한다.
	//drag and drop등으로 데이터 순서가 변경되어 정렬이 해제된 경우 사용.
	function _rowspanPack(datalist, mapping) {//console.log('pack')
		if (!mapping || !mapping.key || mapping.rowspan !== "always") {
			return datalist;
		}
		var key = mapping.key;
		var begin = 0;
		var end = datalist.length;
		while (begin < end) {
			var beginval = datalist[begin][key];//비교대상 시작 값.
			var pos = begin + 1;//다음 출현값을 넣을 위치. 출현값 넣고난 후 1 증가시킨다.
			var cursor = begin + 1;//읽기 시작할 값의 위치. 읽고나서 1증가시킨다.
			while (cursor < end) {
				if (datalist[cursor][key] === beginval) {
					if (pos !== cursor) {//같은위치에서는 옮길 필요 없음.
						var removed = datalist.splice(cursor, 1);
						datalist.splice(pos, 0, removed[0]);
					}
					pos++;
				}
				cursor++;
			}
			begin = pos;
		}
		return datalist;
	}
	//숫자 - rowspan=""에 쓰일 값, true - span되었으니 렌더링 하지 마세요.
	//호출 로직은 state.rowspanindex[]에서 컬럼인덱스에 의해 rowspanindex값을 얻어온 뒤,
	//이 함수를 호출하고. 결과에 따라 자신의 업무를 처리한다.
	function _rowspanned(rowspanindex, myindex, getindex) {
		var result = false;
		var summary = rowspanindex[rowspanindex.length - 1];
		if (!summary) {
			return;
		}
		var index = summary[myindex];
		var from = Number(index.from);
		var to = Number(index.to);
		var my = Number(myindex);
		if (from === my) {
			return getindex ? index : (to - from);
		}
		if (from < my && my < to) {
			return getindex ? index : true;
		}
		return false;

		//    $.each(rowspanindex, function(i,index) {
		//      var from = Number(index.from);
		//      var to = Number(index.to);
		//      var my = Number(myindex);
		//      if(from === my) {
		//        result = getindex ? index : (to - from);
		//        return false;
		//      }
		//      if(from < my && my < to) {
		//        result = getindex ? index : true;
		//        return false;
		//      }
		//    });
		//    return result;
	}
	//자신이 속한 row가 rowspanindex에 따를 때 어떤 row에 의해 span되었는가?
	function _rowspannedFrom(rowspanindex, myindex) {//console.log('from')
		var result = false;
		$.each(rowspanindex, function(i, index) {
			var from = Number(index.from);
			var to = Number(index.to);
			var my = Number(myindex);
			if (from <= my && my <= to) {
				result = from;
				return false;
			}
		});
		return result;
	}
	function _rowspanWidestIndex(rowspanindex, dataIndex) {
		var result = null;
		if (!rowspanindex || !rowspanindex.length) {
			return result;
		}
		$.each(rowspanindex, function(idx,rindex) {
			if(!rindex) {
				return;
			}
			if(!result) {
				result = _rowspanned(rindex, Number(dataIndex), true);
			} else {
				var comp = _rowspanned(rindex, Number(dataIndex), true);
				if(Math.abs(comp.to - comp.from) > Math.abs(result.to - result.from)) {
					result = comp;
				}
			}
		});
		return result;
	}

	var AlopexGrid = function(elem, option) {
		var self = this == window ? {} : this;
		var globalAlopexGrid = window["AlopexGrid"];
		var preloaded = $(elem).data(globalAlopexGrid.KEY_NAME);
		if (preloaded) {
			self.updateOption(option);
			return self;
		}

		var key = _generateUniqueId();
		self.key = key;
		self.serial = _generateUniqueNumber();
		self.state = {
			progressStack: 0,
			data: [],
			deletedData: [],
			rendered:[],
			_paddingDataLength:0
		};
		//option extend
		self.option = $.extend(true, {}, globalAlopexGrid.defaultOption, globalAlopexGrid.commonOption);
		self.root = elem;
		self.$root = $(elem);

		//IE8에서 window.resize 무한루프 버그
		self.lastWindowHeight = $(window).height();
		self.lastWindowWidth = $(window).width();

		//마크업 생성
		self.viewInit();
		self.$title = this.$root.find('>.title');
		self.$pager = this.$root.find('>.pager');
		self.$pagerleft = self.$pager.find('.pagerleft');
		self.$pagerright = self.$pager.find('.pagerright');
		self.$table = this.$root.find('.table').not('.cloned');
		self.$tablebody = self.$table.find('.table-body');
		self.$tableheader = self.$table.find('.table-header');
		self.$wrapper = self.$root.find('.wrapper');
		self.$footer = self.$root.find('>.footer');
		self.$scroller = self.$wrapper.find('.scroller');
		self.$scrollpanel = self.$scroller.find('.scrollpanel');
		self.$colgroup = self.$table.find('colgroup');
		self.$tablespacertop = self.$root.find('.ie-spacer-top');
		self.$tablespacerbottom = self.$root.find('.ie-spacer-bottom');
		//옵션적용(updateOption)
		self.updateOption(option);
		if (self.option.pager && $.isPlainObject(self.option.paging) && $.isFunction(self.option.paging.pageSet)) {
			setTimeout(function() {
				self.pageSet(1);
			}, 0);
		}
		self._initTooltip();
		//jQuery에서 선택 가능하도록 data 생성.
		$(elem).data(globalAlopexGrid.KEY_NAME, self).attr("data-alopexgrid", key);
		self.state.loaded = true;
		globalAlopexGrid.instances[key] = self;
		setTimeout(function(){dataChangeCallback(self, "changed", ["init"]);},0);
		return self;
	};
	$.extend(AlopexGrid, {
		KEY_NAME: _generateUniqueId(),
		//KEY_ROOT : ".positioner",
		instances: {},
		markup: {
			tag: "div",
			attr: {
				styleclass: "alopexgrid positioner"
			},
			child: [{
				tag: "div",
				attr: {
					styleclass: "title"
				},
				child: [{
					tag: "div",
					attr: {
						styleclass: "title-label"
					},
					child: null
				}, {
					tag: "div",
					attr: {
						styleclass: "table-toggle"
					},
					child: null
				}]
			}, {
				tag: "div",
				attr: {
					styleclass: "wrapper",
					style: "width:100%;"
				},
				child: [{
					tag: "div",
					attr: {
						styleclass: "scroller",
						style:"min-height:0%;position:relative;"//IE9 hover-addclass add height bug...
					},
					child: [{
						tag: "div",
						attr: {
							styleclass: "scrollpanel",
							style: "height:auto;min-height:0%;position:relative;"
						},
						child: [
							{ tag: "div", attr: { "data-type": "tooltip","data-position": "","data-tooltip-trigger":"alopexgrid-nontrigger"}
							},
							{ tag: "div", attr: { "styleclass" : "ie-spacer-top"}},
							{
								tag: "table",
								attr: {
									styleclass: "table"
								},
								child: [{
									tag: "colgroup"
								}, {
									tag: "thead",
									attr: {
										styleclass: "table-header"
									}
								}, {
									tag: "tbody",
									attr: {
										styleclass: "table-body"
									}
								}]
							},
							{ tag: "div", attr: { "styleclass" : "ie-spacer-bottom"}}
						]
					}]
				},{
					tag: "div",
					attr: {
						styleclass: "fixed-items",
						style:""
					}
				}]
			},
				{
					tag: "div",
					attr: {
						styleclass: "footer",
						style: "position:relative;"
					},
					child: []
				},
				{
					tag: "div",
					attr: {
						styleclass: "pager",
						style: "position:relative;"
					},
					child: [{
						tag: "div",
						attr: {
							styleclass: "pagerleft",
							style: ""
						},
						child: ""
					}, {
						tag: "div",
						attr: {
							styleclass: "pagercenter"
						},
						child: [{
							tag: "div",
							attr: {
								styleclass: "pagination first-page"
							}
						}, {
							tag: "div",
							attr: {
								styleclass: "pagination prev-page"
							}
						}, {
							tag: "ul",
							attr: {
								styleclass: "pagination page-list"
							}
						}, {
							tag: "div",
							attr: {
								styleclass: "pagination next-page"
							}
						}, {
							tag: "div",
							attr: {
								styleclass: "pagination last-page"
							}
						}]
					}, {
						tag: "div",
						attr: {
							styleclass: "pagerright",
							style: ""
						},
						child: ""
					}]
				}]
		},
		markupTemplate: {
			colgroup: {
				tag: "colgroup"
			},
			col: {
				tag: "col"
			},
			row: {
				tag: "tr",
				attr: {
					styleclass: "row"
				}
			},
			cell: {
				tag: "td",
				attr: {
					styleclass: "cell"
				}
			},
			headerRow: {
				tag: "tr",
				attr: {
					styleclass: "row header"
				}
			},
			headerCell: {
				tag: "td",
				attr: {
					styleclass: "cell header"
				}
			}
		},
		defaultOption: {
			width: null,//600,
			height: null,
			header:true, //show header by default
			scroll: true, //우선은 scroll은 default로 header fix 를 내포하는것으로 코딩. TODO header fix와 scroll 분리
			title: false,
			pager: false,
			data: [], //array
			dataLengthLimit : null,
			paging: {
				left: false,
				right: false
			}, //object
			columnMapping: [], //array
			rowOption : {}, //object
			footer : {
				position : null,
				footerMapping : []
			},
			on: {
				cell : {},
				row : {},
				headercell : {},
				headerrow : {},
				invalidEdit : null,
				scrollBottom : null,
				sortToggle : null,
				sortClear : null,
				pageSet : null,
				perPageChange : null,
				data:{
					"add"      : null,
					"set"      : null,
					"edit"     : null,
					"empty"    : null,
					"delete"   : null,
					"undelete" : null,
					"select"   : null,
					"selected" : null,
					"changed"  : null
				}
			},
			autoResize: true,
			minColumnWidth: 10,
			floatingHeader:true,
			message: {
				"nodata" : null,
				"dataLengthLimit" : null,
				"valueFilter" : null,
				"pagerTotal" : null
			},
			rowClickSelect: false,
			rowSingleSelect: false,
			rowInlineEdit : false,
			rowspanGroupSelect: true,
			rowspanGroupEdit: true,
			useClassHovering: true,
			progressDelay: null,
			scrollBottomDelay: 50,
			virtualScroll: false,
			virtualScrollPadding:20,
			defaultState:{
				dataAdd:{},
				dataSet:{}
			}
			,eventMapping : {}
			,renderMapping : {}
			,rowHeightCompensate:0
			,valueFilter:null//filter value of grid data on endEdit
			,endInlineEditByOuterClick:false//end rowInlineEdit by clicking outside the grid.
			,hideSortingHandle : false//hide header sorting arrow
			,useValidateTooltip : null//force to show/hide mapping.validateTooltip when boolean value is assigned
			,getEditingDataOnEvent : true//get intermediate data if data._state.editing is true.
			,enableTabFocus : false//enable keyboard focus functionality(show bright border by browser when clicked or tab key pressed)
			,allowTabToCellMove:false//enable tab key to move between cell when enableTabFocus option is set.
			,enableKeyboardEdit : false//enable focused cells to react enterkey/copy/paste action.
			,fitTableWidth : true//fit table width upto grid width
			,directEdit : false //edit cell with contenteditable, without <input> tag.
			,ellipsisText : false//show ... on overflowed text
			,autoSortingType : false//auto-detect sorting type when columnMapping.sorting:true
			,highlightLastAction : false//add class to last clicked row and cell.
			,lastActionRowClass : 'row-last-action'
			,lastActionCellClass : 'cell-last-action'
			,clientSortingOnDynamicDataSet : false//sort data even when dynamic binding is uses
			,disableFocusedState:false//disable data._state.focus state
			,useTabindexOnEditable : false//use tabindex on input/select/textarea tags when data is in editing state.
			,editableNameWithKey : false//use mapping.key value as <input name=""> name attribute
			,parseNullValueCell : false//extract cell value on data init if value is null and it is editable. 
										//using default value for column is encouraged.
			,limitSelectorColumnClickArea : false //set true to allow row select iff checkbox in selector column has clicked.
			
			//backward compatibility options
			,wrapCellOnAlign : true//create div.cell-wrapper only when mapping.align is specified
			,disableAlopexConvert:false
			,allowSelectorColumnTitle:true//older versions didnt use mapping.title of selectorColumn
			,extendStateOnSet : true//allow user data._state to be merged into grid data
			,extendStateOnAdd : true
			,fillUndefinedKey : ""//if columnMapping has keys but data doesn't, fill the empty value with this value. false to disable.
			,forceEditedOnEdit : false//force edited state on dataEdit. false to only when there is any differences.
			,trimUnmappedKey : false//remove key from data if key is not mapped to column.
			,readonlyRender : true//default renderer in columnMapping.render will be default to readonly. set false to keep backward compatibility.
			,disableCellTitle : false //do not add [title] attribute to td.cell.
			,showVerticalScrollBar : true //always show scroller vertical scrollbar if height value is specified
			,headerGroupWiderFirst : false // always show widest headerGroup at topmose
			,disableValueEscape : false//disable value string escaping when no mapping.render option is specified
			,defaultSortingOnDataSet : true//older versions uses defaultSorting property only at init time. set false to work as older way.
			,currentPageInCenter : false//older versions shows current page number at the center of pager. set true to work as older way.
		},
		getter: {},
		trimData: function(data) {
			if($.isArray(data)) {
				var trimmedlist = [];
				for(var i=0,l=data.length;i<l;i++) {
					if($.isPlainObject(data[i])) {
						trimmedlist.push(AlopexGrid.trimData(data[i]));
					}
				}
				return trimmedlist;
			}
			var trimmed = $.extend(true, {}, data);
			delete trimmed._state;
			delete trimmed._index;
			delete trimmed._edited;
			delete trimmed._invalid;
			delete trimmed._key;
			delete trimmed._original;
			return trimmed;
		},
		escapeHTML : function(str) {
			return _escapeHTML(str);
		},
		_renderNumberOnlyHandler: function(evt) {
			var e = evt || window.event;
			var key = e.keyCode || e.which;
			key = String.fromCharCode(key);
			var regex = /[0-9]|\./;
			if (!regex.test(key)) {
				e.returnValue = false;
				if (e.preventDefault)
					e.preventDefault();
				return false;
			}
		},
		_renderReplaceHandler: function(context, evt, formatter) {
			var self = context;
			var val = self.value;
			evt = evt || window.event;
			// Ensure we only handle printable keys, excluding enter and space
			var charCode = typeof evt.which == "number" ? evt.which : evt.keyCode;
			if (charCode && charCode > 32) {
				var keyChar = String.fromCharCode(charCode);

				var start, end;
				if (typeof self.selectionStart == "number" && typeof self.selectionEnd == "number") {
					// Non-IE browsers and IE 9
					start = self.selectionStart;
					end = self.selectionEnd;
					val = val.slice(0, start) + keyChar + val.slice(end);
					self.value = AlopexGrid["_" + formatter + "Formatter"](val);

					// Move the caret
					self.selectionStart = self.selectionEnd = start + 1 + (val.length !== self.value.length ? (self.value.length - val.length) : 0);
				} else if (document.selection && document.selection.createRange) {
					// For IE up to version 8
					var selectionRange = document.selection.createRange();
					var textInputRange = self.createTextRange();
					var precedingRange = self.createTextRange();
					var bookmark = selectionRange.getBookmark();
					textInputRange.moveToBookmark(bookmark);
					precedingRange.setEndPoint("EndToStart", textInputRange);
					start = precedingRange.text.length;
					end = start + selectionRange.text.length;

					val = val.slice(0, start) + keyChar + val.slice(end);
					self.value = AlopexGrid["_" + formatter + "Formatter"](val);
					start++;
					start += (val.length !== self.value.length ? (self.value.length - val.length) : 0);

					// Move the caret
					textInputRange = self.createTextRange();
					textInputRange.collapse(true);
					textInputRange.move("character", start - (self.value.slice(0, start).split("\r\n").length - 1));
					textInputRange.select();
				}

				return false;
			}
		},
		"_commaFormatter": function(str) {
			str = str.replace(/,/g, '');
			while (/(\d+)(\d{3})/.test(str.toString())) {
				str = str.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
			}
			return str;
		},
		"_dateFormatter": function(str) {
			return str;
		},
		"_monthFormatter": function(str) {
			return str;
		},
		dragObject: null,
		clipboard : {},
		generateKey: _generateUniqueId
	});
	window["AlopexGrid"] = AlopexGrid;

	// AlopexGrid.run("alopexgrid28175988", "dataAdd", {});
	AlopexGrid.run = function(id, api) {
		var instance = AlopexGrid.instances[id];
		if (!instance) {
			return;
		}
		var args = Array.prototype.slice.call(arguments, 2);
		return instance[api].apply(instance, args);
	};
	AlopexGrid.prototype._simpleRedraw = function(datadraw, viewupdate) {
		this.pageInfo();
		this._dataDraw(datadraw);
		this.viewUpdate(viewupdate);
	};
	AlopexGrid.prototype.readOption = function(){
		return $.extend(true, {}, this.option);
	};
	var _dataEventList = ["add","edit","set","delete","undelete","select"];
	function _getMergedDataEvent(orgoption,option) {
		//original event의 orgoption.on.data["add","edit"... 등에 새로운 옵션의 녀석들을 순차적으로 merge하고 리턴.
		if(!option) {
			return orgoption && orgoption.on && $.isPlainObject(orgoption.on.data) ?
				$.extend(true, {}, orgoption.on.data) : {};
		}
		var eobj = {};
		for(var prop in _dataEventList) {

		}
		return eobj;
	}
	AlopexGrid.prototype.updateOption = function(data) {
		var self = this;
		//var mergedDataEvent = _getMergedDataEvent(self.option, data);
		var option = self.option = $.extend(true, {}, self.option, data ? data : {});
		var $wrapper = self.$wrapper;
		var $pager = self.$pager;
		var $title = self.$title;
		var $r = self.$root;
		//option.on.data = mergedDataEvent;
		if(_valid(option.height)) {
			//if option value is set by common settings but not pixel
//			if(!isNaN(Number(option.height)) && $.isNumeric(option.height)) {
//				option.height = Number(option.height);
//				delete self.state.userHeight;
//				delete self.state.userHeightRowCount;
//			}
			if(typeof option.height === "string" && option.height.indexOf('px') >= 0
				&& $.isNumeric(option.height.split('px')[0])) {
				option.height = Number(option.height.split('px')[0])
			}
			if(typeof option.height === "string" && option.height.toLowerCase().indexOf('row') >= 0) {
				self.state.userHeight = option.height;
				delete self.state.userHeightRowCount;
			}
		}
		if(!option.header) {
			delete self.state.scrollerScrollHeight;
			delete self.state.scrollerClientHeight;
			delete self.state.wrapperInnerHeight;
			delete self.state.tableheaderHeight;
			delete self.state.scrollerTopMargin;
			delete self.state.scrollerCss;
		}
		if($.isPlainObject(data) && data.hasOwnProperty("height")){
			delete self.state.scrollerScrollHeight;
			delete self.state.scrollerClientHeight;
			delete self.state.wrapperInnerHeight;
			delete self.state.tableheaderHeight;
			delete self.state.scrollerTopMargin;
			//delete self.state.scrollerMarginTop;
			delete self.state.scrollerCss;
			if(!$.isNumeric(data.height)) {
				self.state.userHeight = data.height;
			} else {
				option.height = Number(data.height);
				delete self.state.userHeight;
			}
			if(typeof data.height === "string") {
				if(data.height.indexOf('px') >= 0) {
					option.height = Number(data.height.split('px')[0]);
				} else if(!isNaN(Number(data.height))) {
					option.height = Number(data.height);
				} else if(data.height.toLowerCase().indexOf('row') >= 0) {
					delete self.state.userHeightRowCount;
				}
			} else {
				delete self.state.userHeightRowCount;
			}
		}
		if($.isPlainObject(data) && (data.rowPadding || data.rowpadding)){
			self.option.rowPadding = data.rowPadding || data.rowpadding;
		}

		var headerProps = ['columnMapping', 'headerGroup'];//merge가 아닌, overwrite해야 하는 대상.
		$.each(headerProps, function(idx, prop) {
			if (data && data.hasOwnProperty(prop)) {
				option[prop] = $.extend(true, [], data[prop]);
				delete self.state.tableheaderHeight;//헤더속성을 건드린 후에는 높이를 저장하는 cache성 값들을 제거한다.
				delete self.state.scrollerTopMargin;
				delete self.state.scrollerClientHeight;
			}
		});
		if(data && data.hasOwnProperty('footer')) {
			option.footer = $.extend({}, option.footer, data.footer);
		}
		if (self.option.columnMapping) {
			self.state.mappedKey = [];
			$.each(self.option.columnMapping, function(idx, mapping) {
				if(mapping.hasOwnProperty('key')) { self.state.mappedKey.push(mapping.key); }
			});

			self.option.columnMapping.sort(function(former, latter) {
				var fi = _valid(former.columnIndex) ? Number(former.columnIndex) : Infinity;
				var li = _valid(latter.columnIndex) ? Number(latter.columnIndex) : Infinity;
				if (fi > li)
					return 1;
				if (fi < li)
					return -1;
				return 0;
			});

			var fixupto = -1;
			$.each(self.option.columnMapping, function(idx, mapping) {
				if (mapping.columnIndex === null || mapping.columnIndex === undefined || mapping.hidden === true) {
					return;
				}
				if (mapping.fixed) {
					fixupto = mapping.columnIndex;
				} else {
					return false;
				}
			});
			self.state.fixupto = fixupto;

			var maxColumnIndex = -1;
			self.state.hasNumberingColumn = false;
			self.state.hasSelectorColumn = false;
			self.state.hasAllowEdit = false;
			self.state.dataCompositorMap = [];
			self.state.dataKeyList = [];
			$.each(self.option.columnMapping, function(idx, mapping) {
				if (mapping.hasOwnProperty('columnIndex')) {
					var i = Number(mapping.columnIndex);//no original column index for this value;
					if (i > maxColumnIndex) {
						maxColumnIndex = i;
					}
				}
				if(mapping.hasOwnProperty('key')) {
					self.state.dataKeyList.push(mapping.key);
					if(mapping.hasOwnProperty('value') && _valid(mapping.key) && _valid(mapping.value)) {
						self.state.dataCompositorMap.push(mapping);
					}
				}
				
				if (mapping.numberingColumn) {
					self.state.hasNumberingColumn = true;
				}
				if (mapping.selectorColumn) {
					self.state.hasSelectorColumn = true;
				}
				if (mapping.allowEdit) {
					self.state.hasAllowEdit = true;
				}
				if($.isPlainObject(self.option.defaultColumnMapping)) {
					$.each(self.option.defaultColumnMapping, function(k,v){
						if(!mapping.hasOwnProperty(k)) {
							mapping[k] = v;
						}
					});
				}
			});
			self.state.emptyData = {
				"_index" : {}, "_state" : {}
			};
			for(var j in self.state.dataKeyList) {
				var k = self.state.dataKeyList[j];
				self.state.emptyData[k] = "&nbsp;";
			}
			self.state.dataCompositor = function(data){
				for(var j in self.state.dataCompositorMap) {
					var mapping = self.state.dataCompositorMap[j];
					data[mapping.key] = $.isFunction(mapping.value) ? mapping.value(data[mapping.key], data, mapping) : mapping.value;
					if(data._state && data._state.editing && data._state.recent && data._state.recent.hasOwnProperty(mapping.key)) {
						data._state.recent[mapping.key] = data[mapping.key];
					}
				}
				return data;
			};
			self.state.dataFilltrimmer = function(data) {
				for(var j in self.option.columnMapping) {
					var mapping = self.option.columnMapping[j];
					if(_valid(mapping.key) && !data.hasOwnProperty(mapping.key) &&
						(self.option.fillUndefinedKey !== false || mapping.defaultValue !== undefined)) {
						data[mapping.key] =
							($.isFunction(mapping.defaultValue) ? mapping.defaultValue(data) : mapping.defaultValue)
							|| (self.option.fillUndefinedKey === true ? "" : self.option.fillUndefinedKey);
					}
				}
				if(self.option.trimUnmappedKey) {
					//self.state.mappedKey = [columnmapping에 처리된 key들의 목록]
					for(var prop in data) {
						if(!data.hasOwnProperty(prop) || prop == "_state" || prop == "_index"
							|| prop == "_key" || prop == "_edited") continue;
						if($.inArray(prop, self.state.mappedKey) < 0) {
							delete data[prop];
						}
					}
				}
			};
			self.state.maxColumnIndex = maxColumnIndex;
		}

//		if (data && this.state) {
//			var del = []
//			for ( var name in this.state) {
//				var prop = this.state[name];
//				if (data.height && name.toUpperCase().indexOf('HEIGHT') >= 0) {
//					del.push(name);
//				}
//			}
//			for ( var i in del) {
//				this.state[del[i]] = undefined;
//			}
//		}

		if ($.isArray(this.option.data)) {
			this.dataSet(this.option.data, true);
			this.option.data = null;
		}

		var scrolloffset = self._scrollOffset();
		self.pageInfo();
		self._dataDraw();
		self.viewUpdate(scrolloffset);
		self.$scroller.trigger('scroll');
		self.viewEventUpdate();

		self.state.tableheaderHeight = (self.$fixedheader || self.$tableheader).height();
	};
	//columnIndex may be real index or column key
	AlopexGrid.prototype.updateColumnMapping = function(columnIK, userMapping){
		if(!_valid(columnIK) || !_valid(userMapping)) return;
		if(!$.isPlainObject(userMapping) || $.isEmptyObject(userMapping)) return;
		var self = this;
		var option = self.option;
		var columnMapping = option.columnMapping;
		$.each(columnMapping, function(idx, mapping) {
			if(Number(mapping.columnIndex)===Number(columnIK)
				|| (typeof mapping.key === "string" && mapping.key === columnIK) ) {
				$.each(userMapping, function(key, value) {
					if(value === null) {
						delete mapping[key];
					} else {
						mapping[key] = value;
					}
				});
			}
		});
		self.updateOption();
	};

	function _readMappingProp(mapping, prop) {
		return $.isFunction(mapping[prop]) ? mapping[prop](mapping) : mapping[prop];
	}

	AlopexGrid.prototype._processDefaultSorting = function() {
		var self = this;
		for ( var i in self.option.columnMapping) {
			var mapping = self.option.columnMapping[i];
			var sorting = mapping.sorting;
			//if (mapping.sorting) {
			if(sorting) {
				//if (!self.state.loaded && (sorting == "desc" || sorting == "asc")) {
				if (sorting == "desc" || sorting == "asc") {
					self.state.sortingColumn = self.columnIndex;
					self.state.sortingDirection = sorting;
					//} else if (!self.state.loaded && self.option.defaultSorting) {
				} else if (self.option.defaultSorting) {
					var ci = Number(_valid(self.option.defaultSorting.columnIndex) ? self.option.defaultSorting.columnIndex
							: self.option.defaultSorting.sortingColumn);
					if (Number(mapping.columnIndex) === ci) {
						self.state.sortingColumn = mapping.columnIndex;
						self.state.sortingDirection = self.option.defaultSorting.sorting 
							|| self.option.defaultSorting.sortingDirection;
					}
				}
			}
		}
	};
	AlopexGrid.prototype.viewInit = function(data) {
		var self = this;
		if(!self.option.defaultSortingOnDataSet) {
			self._processDefaultSorting();
		}
		_generateHTML(AlopexGrid.markup, self.root);
	};

	AlopexGrid.prototype.viewUpdate = function(viewoption) {
		var self = this;
		self.state.viewUpdating = true;
		var $r = self.$root;
		var option = self.option;
		var $title = self.$title;
		var $pager = self.$pager;
		var $wrapper = self.$wrapper;
		var $scroller = self.$scroller;
		var $table = self.$table;//$wrapper.find('.table');
		var $fixedheader = self.$fixedheader;
		var $scrollpanel = self.$scrollpanel;//$wrapper.find('.scrollpanel');
		//var tableheaderHeight = self.state.tableheaderHeight || $tableheader.height();
		var tableheaderHeight = 0;

		self.$wrapper.find('.cloned').remove();

		if (viewoption && viewoption.updateColgroup) {
			this._updateColgroup();
		}

		if(option.floatingHeader) {
			var fht = $('<table class="table cloned">');//$table.clone();
			fht.attr('style', $table.attr('style'));
			fht.css({"margin-top":"","margin-bottom":""});//vscroll
			fht.append($table.find('colgroup').clone());

			fht.append('<thead class="table-header">' + this._headerRender() + '</thead>');
			fht.children('.table-header').css({
				"display": ""
			}).removeClass("fixed");
			var fhtcss = {
				"position": "absolute",
				"top": (isChrome && option.compensate1px) ? "-1px" : "0px",
				"left": (viewoption && viewoption.scrollLeft ? (-viewoption.scrollLeft) :
					(self.state.hasHorizontalScrollBar ? -$scroller.prop('scrollLeft') : 0) ) + "px"
			};
			fht.css(fhtcss);
			fht.show().children('.table-header').show();
			self.$fixedheader = fht;
			self.$wrapper.find('.fixed-items').append(self.$fixedheader);

			$fixedheader = self.$fixedheader;

			self.state.tableheaderHeight = tableheaderHeight = $fixedheader.height();
			var $cells = $fixedheader.find('.cell');
			var _h = $cells.outerHeight() || undefined;
			if(_h) {
				self.state.footerHeight = Math.round(_h / Number($cells.attr("rowspan") || 1));
			}
		} else {
			self.$fixedheader = null;
			$fixedheader = null;
			tableheaderHeight = self.state.tableheaderHeight
				= self.state.tableheaderHeight ? self.state.tableheaderHeight : self.$tableheader.height();
		}

		self.state.hasHorizontalScrollBar = false;
		self.state.hasVerticalScrollBar = false;

		if(option.floatingHeader===false && isIE/* && ieVER<10*/) {
			tableheaderHeight -= 1;
		}

		if(_valid(option.height) && typeof option.height === "string" && option.height.indexOf('row') >= 0)
			self.state.userHeight = option.height;
		///=======================================================
		if(String(self.state.userHeight).toLowerCase().indexOf('row')>=0) {
			var rowcount = null;
			var heightValue = self.state.userHeight;
			if(heightValue.toLowerCase() === "rowpadding") {
				//option.rowpadding = true : follow paging.perPage
				//option.rowpadding 10 : rowcount is 10 
				if(option.rowPadding === true) {
					rowcount = option.paging.perPage;
				} else if(typeof option.rowPadding === "number") {
					rowcount = option.rowPadding;
				}
			} else if(!isNaN(Number(heightValue.split("row")[0]))) {
				rowcount = Number(heightValue.split("row")[0]);
			}
			if(rowcount && tableheaderHeight > 0 && self.$root.is(':visible')) {
				self.state.userHeightRowCount = rowcount;
				self._calcRowHeight();
				var hmap = [];
				hmap.push(self.option.title?self.$title.outerHeight():0);
				hmap.push(tableheaderHeight);
				hmap.push(self.$root.outerHeight()-self.$root.height());
				hmap.push(self.$wrapper.outerHeight()-self.$wrapper.height());
				hmap.push((self.state.rowHeight)*rowcount);
				hmap.push(self.state.rowHeightBorderWidth || 1);
				hmap.push(self.$scroller.height()-self.$scroller.prop('clientHeight'));
				hmap.push(self._hasFooter()?self.$footer.outerHeight():0);
				hmap.push(option.pager?self.$pager.outerHeight():0);
				//hmap.push(1);
				var prev = option.height;
				option.height = 0;
				for(var hm=0;hm<hmap.length;hm++) {
					if(isNaN(Number(hmap[hm]))) {
						option.height = prev;
						break;
					}
					option.height += hmap[hm];
				}
			}
		}

		$.each(["width", "height", "min-height", "max-height"], function(idx, elem) {
			if (option && typeof option[elem] === "number") {
				self.$root.css(elem, option[elem]+"px");
			}
			if(!_valid(self.option[elem])) {
				self.$root.css(elem, "");
				if(elem === "height") {
					self.$scroller.css("height","");
				}
			}
		});

		$title[option.title ? "show" : "hide"]();
		if($.isPlainObject(option) && option.hasOwnProperty('title')) {
			//현재 옵션에 따라 사이즈/스크롤 옵션 등을 조절한다.
			$title.find('.title-label').text(typeof option.title === "string" ? option.title : "");
			$title.data('alopex-grid-visible', option.title ? true : false);
			$title.find('.table-toggle').off(".alopexgridtitletoggle").on("click.alopexgridtitletoggle", function(e) {
				if ($r.hasClass("fold")) {
					$r.removeClass("fold");
					$r.animate({
						"height": (option.height ? option.height : $title.height() + $wrapper.height() + $pager.outerHeight()) + "px"
					}, function() {
						if (!option.height) {
							$(this).css({
								"height": ""
							});
						}
						self.viewUpdate();
					});
				} else {
					self._autoResizeSet(false);
					$r.addClass("fold");
					$r.animate({
						"height": $title.height() + "px"
					});
				}
			});
		}
		$pager[option.pager ? "show" : "hide"]();
		if($.isPlainObject(option) && option.hasOwnProperty('pager')) {
			//view의 pager 보임 설정
			$pager.data('alopex-grid-visible', option.pager ? true : false);
		}

		//grid root element의 사이즈 조정
		self._wrapperHeightRefresh();

		if(!self.option.virtualScroll) {
			self._tableSpacing(0,0);
		}

		if ($wrapper[0].style.height && !option.height) {
			var tableHeight = (option.height || option["max-height"] ? $r.innerHeight() : 0) - ($title.data('alopex-grid-visible') ? $title.height() : 0) -
				($pager.data('alopex-grid-visible') ? $pager.outerHeight() : 0);
			$wrapper.css('height', "");
			delete this.state.wrapperInnerHeight;
		} else if (option.height && $wrapper[0].style.height !== (tableHeight + "px")) {
			this._wrapperHeightRefresh();
		}


		////=======================================================

		var hasFooter = self._hasFooter("bottom");
		if(self.state.footerHeight === undefined) {
			var $cells = self.$wrapper.find('.cell');
			self.state.footerHeight = $cells.outerHeight() / Number($cells.attr("rowspan") || 1);
		}
		var footerHeight = hasFooter ? self.state.footerHeight:0;
		var scrollerTopMargin = (option.scroll ? (tableheaderHeight || self.state.scrollerTopMargin) : 0)||0;//option.scroll?tableheaderHeight:0;//(this.state.scrollerTopMargin || tableheaderHeight):0;//$tableheader.height():0;
		this.state.scrollerTopMargin = scrollerTopMargin;
		var scrollercss = {
			"overflow": "auto",
			"overflow-y" : (self.option.showVerticalScrollBar && option.height) ? "scroll" : "",
			//"-webkit-overflow-scrolling" : "touch",
			"width": "100%"
		};
		if (option.height) {
			var wih = $wrapper.innerHeight();
			scrollercss["height"] = (wih - (self.option.floatingHeader===false?0:scrollerTopMargin)) + "px";
		}
		if(option["max-height"]) {
			scrollercss["max-height"] = ( Number(option["max-height"]) - self.$title.outerHeight()
				- self.$pager.outerHeight() - (self.option.floatingHeader===false?0:scrollerTopMargin) ) + "px";
		}
		if (option.floatingHeader !== false
			&& $scroller.css("margin-top") !== (scrollerTopMargin + "px")) {
			this.state.scrollerMarginTop = scrollerTopMargin || 0;
			//20131223 Hynix Issue - (-1)을 적용..? 다시 빼봄.
			scrollercss["margin-top"] = (this.state.scrollerMarginTop) + "px";
		}
		if (this.state.scrollerCss) {
			var same = true;
			for ( var prop in scrollercss) {
				if (this.state.scrollerCss[prop] !== scrollercss[prop]) {
					same = false;
				}
			}
			if (!same) {
				$scroller.css(scrollercss);
			}
		} else {
			$scroller.css(scrollercss);
		}
		this.state.scrollerCss = scrollercss;
		var scrollerClientHeight = this.state.scrollerClientHeight = $scroller.prop('clientHeight');
		var scrollerScrollHeight = this.state.scrollerScrollHeight = $scroller.prop('scrollHeight');
		if (scrollerClientHeight < scrollerScrollHeight) {
			self.state.hasVerticalScrollBar = true;
		}
		//스크롤 활성화를 위한 내부 영역 크기 조정
		var tableWidth = self.state.tableWidth;
		var clientWidth = self.state.scrollerClientWidth = $scroller.prop('clientWidth');
		//var scrollWidth = self.state.scrollerScrollWidth = $scroller.prop('scrollWidth');

		if (tableWidth > clientWidth) {
			self.state.hasHorizontalScrollBar = true;
			$table.css('width', tableWidth + 'px');
			$scrollpanel.css({
				width: tableWidth + 'px',
				overflow: 'visible'
			});
			$scroller.css('overflow-x','scroll');
		} else {
			self.state.hasHorizontalScrollBar = false;
			var targetWidth = clientWidth;
			if(!self.option.fitTableWidth) {
				targetWidth = tableWidth;
			}
			if(targetWidth > 0) {
				$table.css('width', targetWidth + 'px');
				$scrollpanel.css({
					width: targetWidth + 'px',
					overflow: ''
				});
			}
			$scroller.css('overflow-x','hidden');
		}
		if(document['documentMode']) {
			//margin-bottom등이 스크롤 높이에 반영되지 않고 스크롤바가 생기다 마는 증상.
			//$scrollpanel.css({"overflow-y":"auto","overflow-x":"hidden"});
		}
		//기본 크기 잡은 후 table-layout속성 토글해줘야 헤더가 사라지지않고 보임.(웹킷?). 가로 너비 자동 조정과도 연계됨.?
		//if(isChrome || isSafari) {
		$table.css({
			"table-layout": "auto"
		}).css({
			"table-layout": "fixed"
		});
		//}
		//width가 없는 경우 그리드는 최초에 생성된 너비/높이로 고정이 되어버려서, 윈도우 사이즈 변경에 따른 refresh가 필요하다.
		self._autoResizeSet(!!option.autoResize);

		if(option.floatingHeader) {
			self.$fixedheader.css('width',$table.css('width'));
			self.$tableheader.removeClass("fixed").hide();
			self.$tableheader.empty();
		} else {
			self.$fixedheader = null;
		}

		if(self._hasFooter("bottom")) {
			var markup = '<tbody class="table-header">'+_generateHTML(self._footerRowRender())+'</tbody>';
			var colgroup = self.$colgroup.clone();
			var footer = (self.$fixedheader || self.$tableheader).clone().html(markup).prepend(colgroup).css("top","");
			self.$footer.html(footer).css('height', footerHeight+"px").show();
			if(self.state.hasFixColumn) {
				var colgrouphtml = '<colgroup>';
				var stopit = false;
				var twidth = 0;
				$.each(option.columnMapping, function(idx, mapping) {
					if (mapping.columnIndex === null || mapping.columnIndex === undefined) {
						return;
					}
					if(mapping.columnIndex > self.state.fixupto) {
						return;
					}
					if (mapping.fixed) {
						if (!mapping.hasOwnProperty('width')) {
							stopit = true;
							return false;
						}
						twidth += Number(mapping.width.split("px")[0]);
					}
					colgrouphtml += '<col style="width:' + (mapping.width) + ';">';
				});
				colgrouphtml += '</colgroup>';

				if(!stopit) {
					var fixedMarkup = '<tbody class="table-header fixeddd">'
						+_generateHTML(self._footerRowRender(self.state.fixupto))
						+'</tbody>';
//					var fixedColgroup = self.$colgroup.clone();
//					fixedColgroup.children('col').map(function(idx,elem){if(idx>self.state.fixupto) return elem;}).remove();
					var fixedColgroup = colgrouphtml;
					var fixedFooter = fht.clone().html(fixedMarkup).prepend(fixedColgroup)
						.css({"top":"","width":twidth+"px","left":"0px"});
					self.$footer.append(fixedFooter);
				}
			}
			var footerleft = -9999;
			self.$scroller.off('.footerscroll');
			_scrollHack(self.$scroller, '.footerscroll');
			self.$scroller.on('scroll.footerscroll', function(){
				var thisleft = this.scrollLeft;
				if(thisleft !== footerleft) {
					footer.css("left", (-thisleft)+"px");
					footerleft = thisleft;
				}
			});
		} else {
			self.$footer.empty().hide();
			self.$scroller.off('.footerscroll');
		}

		//고정헤더의 가로 스크롤연동
		$scroller.off('.alopexgridview');
		if (self.state.hasHorizontalScrollBar && self.option.floatingHeader !== false) {
			var lastleft = -1;
			_scrollHack($scroller, '.alopexgridview');
			$scroller.on('touchend.alopexgridview', function(e){
				$scroller.trigger('scroll');
			});
			$scroller.on('scroll.alopexgridview', function(e) {
				var left = Number(this.scrollLeft);
				if (left !== lastleft) {
					//$tableheader.css('left', (-left)+'px');
					//$scroller.find('.table.cloned').not('.fixed-column').css({'left': (-left)+'px'});
					self.state.lastScrollLeft = left;
					fht.css({
						'left': (-left) + 'px'
					});
				}
				lastleft = left;
			});
		}
		if (self.state.hasVerticalScrollBar && self.option.on && self.option.on.scrollBottom) {
			var timer = null;
			_scrollHack($scroller, '.alopexgridview');
			$scroller.on('scroll.alopexgridview', function(e, param1) {
				var top = this.scrollTop;
				var height = this.clientHeight;
				var scrollHeight = this.scrollHeight;
				if (self.state.scrollBottomPrevTop === top) {
					return;
				}
				self.state.scrollBottomPrevTop = top;
				if (timer !== null) {
					clearTimeout(timer);
				}
				if (height < scrollHeight && top + height >= scrollHeight) {
					if (self.option.on && self.option.on.scrollBottom) {
						timer = setTimeout(function() {
							var handlers = self.option.on.scrollBottom;
							if (!$.isArray(handlers)) {
								handlers = [handlers];
							}
							$.each(handlers, function(idx, handler) {
								if (typeof handler == "function") {
									handler.call(self);
								}
							});
							timer = null;
						}, self.option.scrollBottomDelay);
					}
				}
			});
		}
		$scroller.on('scroll.alopexgridview', function(e){
			if($(this).is(':hidden')) return; // hidden상태에서는 scrollTop, scrollLeft 0 return;
			self.state.lastScrollTop = this.scrollTop;
			self.state.lastScrollLeft = this.scrollLeft;
		});
		self._fixColumnLoad(viewoption);
		self.viewEventUpdate();
		//내용물을 모두 띄운 후, 필요에 따라 강제업데이트가 이루어진 경우 scroller의  scroll위치를 복원한다.
		if(viewoption && viewoption.restoreScrollOffset) {
			viewoption.scrollLeft = self.state.lastScrollLeft;
			self.state.lastScrollLeft = -1;
			viewoption.scrollTop = self.state.lastScrollTop;
			self.state.lastScrollTop = -1;
		}
		if (option.scroll) {
			var changed = false;
			if (viewoption && viewoption.hasOwnProperty('scrollLeft')) {
				if (viewoption.scrollLeft !== self.state.lastScrollLeft && self.state.hasHorizontalScrollBar) {
					$scroller.scrollLeft(viewoption.scrollLeft);
					changed = true;
				}
				self.state.lastScrollLeft = viewoption.scrollLeft;
			}
			if (viewoption && viewoption.hasOwnProperty('scrollTop')) {
				if (viewoption.scrollTop !== self.state.lastScrollTop && self.state.hasVerticalScrollBar) {
					$scroller.scrollTop(viewoption.scrollTop);
					changed = true;
				}
				self.state.lastScrollTop = viewoption.scrollTop;
			}
			if(self._vscrollInfo()) {
				changed = true;
			}
			if(changed) {
				$scroller.trigger("scroll");
			}
		}
		self.state.viewUpdating = false;
	};
	AlopexGrid.prototype._wrapperHeightRefresh = function() {
		var self = this;
		var option = self.option;
		var $r = self.$root;
		var $title = self.$title;
		var $pager = self.$pager;
		var $wrapper = self.$wrapper;
		if(option.height) {
			$r.css('height', option.height+"px");
		}

		var tableHeight = "";
		if(typeof self.state.userHeight === "string" && self.state.userHeight.indexOf('row')>=0) {
			tableHeight = self.state.tableheaderHeight
				+ self.$wrapper.outerHeight() - self.$wrapper.height()
				+ self.state.rowHeight*self.state.userHeightRowCount
				+ self.$scroller.height()-self.$scroller.prop('clientHeight')
				+ (self.state.rowHeightBorderWidth||1);
		} else {
			tableHeight = (option.height || option["max-height"] || $r.height() || 0) - ($title.data('alopex-grid-visible') ? $title.height() : 0) -
				($pager.data('alopex-grid-visible') ? $pager.outerHeight() : 0);
			//jQuery on IE10 returns null at $wrapper.css('borderTopWidth').
			var minus1 = Number(($wrapper.css('borderTopWidth')||"").split('px')[0]);
			var minus2 = Number(($wrapper.css('borderBottomWidth')||"").split('px')[0]);
			tableHeight = tableHeight - (isNaN(minus1) ? 0 : minus1) - (isNaN(minus2) ? 0 : minus2);
			if ($wrapper.css('box-sizing') === 'border-box') { //box-sizing : border-box 적용시 border가 높이 계산시 먹힘.
				var rht = Number(($r.css('borderTopWidth')||"").split('px')[0]);
				var rhb = Number(($r.css('borderBottomWidth')||"").split('px')[0]);
				tableHeight -= isNaN(rht) ? 0 : rht / 2;
				tableHeight -= isNaN(rhb) ? 0 : rhb;
			}
			tableHeight = tableHeight - (this._hasFooter("bottom") ? this.state.footerHeight : 0);
		}
		$wrapper.css('height', Math.ceil(tableHeight) + "px");
		delete self.state.wrapperInnerHeight;
	};
	//이벤트 핸들러 기능을 하므로 일반 호출 불가.
	AlopexGrid.prototype._columnResizeStart = function(e, column) {
		if (!e || !e.type) {
			return;
		}
		var self = this;
		if (self.state.columnResizing) {
			return;
		}
		e = $.event.fix(e);
		if (e.which !== 1) {
			return;
		}
		var $wrapper = self.$wrapper;
		var $scroller = self.$scroller;
		var $target = $(e.target);
		var $table = $target.parentsUntil($scroller, '.table').eq(0);
		var $headercell = $target.parentsUntil($scroller, '.cell').eq(0);
		var columnIndex = column !== undefined ? column : $headercell.attr('data-alopexgrid-columnindex');
		if (isNaN(Number(columnIndex))) {
			return;
		}
		var mapping = $(self.option.columnMapping).filter(function(idx, cm) {
			if (Number(cm.columnIndex) === Number(columnIndex)) {
				return true;
			}
			return false;
		})[0];
		var nextmapping = $(self.option.columnMapping).filter(function(idx, cm) {
			if (Number(cm.columnIndex) === (Number(columnIndex) + 1)) {
				return true;
			}
			return false;
		})[0];
		//columnMapping에서 해당 cell의 width를 읽고, 향후 변경된 width값 입력 후 viewUpdate를 떄린다.

		var ratio = self._colRatio(true);
		var scrollLeft = self.option.scroll ? Number($scroller[0].scrollLeft) : 0;
		var scrollTop = self.option.scroll ? Number($scroller[0].scrollTop) : 0;
		if (self.state.$resizeBar) {
			self.state.$resizeBar.remove();
			delete self.state.$resizeBar;
		}
		var bar = $('<div class="resize-align">');
		//bar의 시작 위치
		//var ol = e.target.offsetLeft;
		var baseOffset = 0;
		$.each(self.option.columnMapping, function(idx, cm) {
			if (cm.columnIndex === undefined || cm.columnIndex === null) {
				return;
			}
			if (Number(cm.columnIndex) <= Number(columnIndex)) {
//				if (cm.width) {
				if (cm.width && !cm.hidden) { // hidden column인 경우, 더하지 않기.
					baseOffset += Number(cm.width.split('px')[0]);
				} else {
					baseOffset = null;
					return false;
				}
			}
		});
		if (!baseOffset) {
			var ol = (mapping.width && mapping.width.indexOf('px') >= 0)
				? ((Number(mapping.width.split('px')[0]) * ratio) | 0) - 1
				: e.target.parentNode.clientWidth;
			//var cl = mapping.width ? -1 : e.target.clientLeft;
			var pol = e.target.parentNode.offsetLeft;
			baseOffset = ol + pol;
		} else {
			baseOffset = (baseOffset * ratio) | 0;
		}
		var barx = Number(baseOffset - ($table.hasClass('fixed-column') ? 0 : scrollLeft));
		//마우스의 시작 위치. 마우스 이벤트의 clientX를 통해서 변위를 얻어내고 bar의 위치를 변경한다.
		var from = e.clientX;//console.log('from',e.clientX, e.offsetX, $scroller[0].scrollLeft)
		var barheight = self.option.height ? self.option.height : 2500;//$wrapper.height();임의로 높이를 정해도 이것을 넘어가는 화면이 현재는 없다.
		bar.css({
			"position": "absolute",
			"top": "0px",
			"left": (barx) + "px",
			"border": "1px dotted black",
			"height": barheight + "px"
		});
		bar.appendTo($wrapper);
		self.state.$resizeBar = bar;

		var dataobj = {
			mode: _readMappingProp(mapping,'resizing'),//resize모드 - 우측 컬럼에 영향을 주는가 자신만 변경되는가.
			barx: barx,//바의 시작 위치 
			from: from,//마우스의 시작위치 
			//target : targetCell, //수정대상 셀
			ratio: ratio,//col 크기 변경에 대한 비율
			mapping: mapping, //변위값을 적용할 매핑
			nextmapping: nextmapping,//변위값을 적용할 컬럼의 옆 컬럼 매핑
			bar: bar,
			scrollLeft: scrollLeft,
			scrollTop: scrollTop,
			//orgWidth : e.target.parentNode.clientWidth
			orgWidth : $headercell.width(),
			$headercell :$headercell
		};
		$(document).off('.alopexgridresizeevent' + self.key).on('mousemove.alopexgridresizeevent' + self.key, dataobj, resizeMoveHandler).on('mouseup.alopexgridresizeevent' + self.key, dataobj,
			resizeUpHandler);
		e.preventDefault();
		self.state.columnResizing = true;
		self.state.disableSort = true;
		var lastx = -100;
		function resizeMoveHandler(e) {
			var curr = e.clientX;//console.log('curr',curr)
			if (curr !== lastx) { //IE에서는 포인터가 같은 위치에 있어도 mousemove이벤트가 계속 발생한다.
				e.data.bar.css("left", (e.data.barx + (curr - e.data.from)) + "px");
				lastx = curr;
				e.preventDefault();
				if (document.selection && document.selection.empty) {
					//드래그시 선택을 방지 
					clearSelection();
				}
			}
		}
		function resizeUpHandler(e) {
			var curr = e.clientX;
			var diff = Number(curr - e.data.from) / e.data.ratio;
			if(e.data.mapping.width && String(e.data.mapping.width).indexOf('%')>=0) {
				var m1width = Number(e.data.mapping.width.split('%')[0]) || null;
				var m2width = e.data.nextmapping && e.data.nextmapping.width ?
					Number(e.data.nextmapping.width.split('%')[0]) : null;
				var incr = 0;
				if(m1width) {
					var newwidth = ((m1width * (e.data.orgWidth + diff) / e.data.orgWidth)*10)|0;
					newwidth /= 10;
					incr = _max(newwidth,1) - m1width;
					if(m2width && (m2width - incr) <1 ) {
						incr = m2width - 1;
						newwidth = incr + m1width;
					}
					e.data.mapping.width = _max(newwidth, 1) + '%';
				}
				if(m2width && e.data.mode !== "self") {
					e.data.nextmapping.width = _max(Math.floor((m2width-incr)*10)/10,1) + '%';
				}
			} else {
				var m1width = e.data.mapping.width ? Number(e.data.mapping.width.split("px")[0]) : (e.data.orgWidth || null);
				var m2width = e.data.nextmapping && e.data.nextmapping.width ? Number(e.data.nextmapping.width.split("px")[0]) : e.data.$headercell.next().width();
				if (m2width === 0)
					m2width = null;
				if (m1width === null) {
//					m1width = e.data.target.width(); // target 넘기는 부분 주석처리해서 에러발생. 
					m1width = parseInt($(e.data.bar).css('left')); // edited by SM 20140917
				}
				var minwidth = self.option.minColumnWidth || 1;
				if (m1width !== null) {
					if (m2width !== null && (m2width - diff <= minwidth) && e.data.mode !== "self") {
						diff = m2width - minwidth;
					}
				}
				if (m2width !== null) {
					if (m1width !== null && (diff + m1width <= minwidth) && e.data.mode !== "self") {
						diff = (-m1width) + minwidth;
					}
				}
				diff = diff | 0;
				e.data.mapping.width = _max(((m1width + diff) | 0), minwidth) + "px";
				if (m2width !== null && e.data.mode != "self") {
					e.data.nextmapping.width = _max(((m2width - diff) | 0), minwidth) + "px";
				}
			}
			//var bar = e.data.bar;
			self.state.$resizeBar.remove();
			delete self.state.$resizeBar;
			$(document).off('.alopexgridresizeevent' + self.key);
			var param = {
				scrollLeft: e.data.scrollLeft,
				scrollTop: e.data.scrollTop,
				updateColgroup: true
			};
			//$r.off('.alopexgridresizeevent');
			self._showProgress(function() {
				var hs = self.state.hasHorizontalScrollBar;
				self.viewUpdate(param);
				//self._simpleRedraw(null, param);
				var ahs = self.state.hasHorizontalScrollBar;
				if (self.option.scroll) {
					if (hs !== ahs) { //없다 있으니까, 또는 있다 없으니까 깨진 상태로 렌더링됨. 다시 한번 리프레시.
						self.viewUpdate();
						self._simpleRedraw();
					}
					if (ahs) {//가로스크롤이 다시 그려지면서 맞춰지지 않는 문제.
						self.$scroller.trigger('scroll');
					}
					//self.$scroller.prop({'scrollLeft':e.data.scrollLeft,'scrollTop':e.data.scrollTop});
				}
				clearSelection();
				self.state.columnResizing = false;
				self.state.disableSort = false;
			});
		}
	};
	/**
	 * $(grid).alopexGrid('sortToggle', columnIndex or key, direction)
	 * 정렬을 column index 또는 key 기준으로 수행. 현재 렌더링된 데이터에 대해서 정렬 가능.
	 */
	AlopexGrid.prototype.sortToggle = function(column, dir) {
		if(typeof column === "string") { //key값 명시를 시도한 경우.
			for(var i=0,l=this.option.columnMapping.length;i<l;i++) {
				var m = this.option.columnMapping[i];
				if(m && m.columnIndex !== undefined && m.columnIndex !== null
					&& (typeof m.key === "string") && m.key === column) {
					column = Number(m.columnIndex);
					break;
				}
			}
		}
		return this._sortToggle(column, dir, false);
	};
	AlopexGrid.prototype._sortToggle = function(column, dir, e) {
		var self = this;
		var columnIndex = column;
		if (self.state.disableSort) {
			return;
		}
		if (e) {
			e = $.event.fix(e);
			var $target = $(e.target);
			//resize에 의해 sort cell에 click이벤트가 발생하는 경우가 있다. 이를 방지.
			if ($(e.target).hasClass("resizing-handle")) {
				return;
			}
			if (columnIndex === undefined || columnIndex === null) {
				var $cell = e.currentTarget ? $(e.currentTarget) : $target.parentsUntil(self.$scroller, '.cell').eq(0);
				columnIndex = $cell.attr('data-alopexgrid-columnindex');
			}
		}

		if (columnIndex === undefined || columnIndex === null) {
			return;
		}

		function valueCorrector() {
			columnIndex = Number(columnIndex);
			if (self.state.hasOwnProperty('sortingColumn') && self.state.sortingColumn !== undefined && self.state.sortingColumn !== null && Number(self.state.sortingColumn) !== Number(columnIndex)) {
				delete self.state.sortingDirection;
			}
			if (dir === "desc" || (!dir && self.state.sortingDirection === "asc")) {
				self.state.sortingDirection = 'desc';
			} else if (dir === "asc" || (!dir && self.state.sortingDirection === "desc")) {
				self.state.sortingDirection = 'asc';
			} else {
				self.state.sortingDirection = 'asc';
			}
			self.state.sortingColumn = Number(columnIndex);
		}

		valueCorrector();
		self._showProgress(function(done) {
			var tret = null;
			var params = null;
			if(self.option.on && $.isFunction(self.option.on.sortToggle)) {
				params = getParamNames(self.option.on.sortToggle);
				var sortingKey = "";
				for(var i=0,l=self.option.columnMapping.length;i<l;i++) {
					var ci = self.option.columnMapping[i].columnIndex;
					if(ci !== undefined && ci !== null && Number(ci)===Number(self.state.sortingColumn)) {
						sortingKey = self.option.columnMapping[i].key || "";
						break;
					}
				}
				tret = self.option.on.sortToggle.call(self,
					self.option.pager ? $.extend({},self.option.paging) : null,
					{"key":sortingKey,
						"column":self.state.sortingColumn,
						"direction":self.state.sortingDirection},
					done);
			}
			if(tret === false) {
				if(!params || (params && params.length<3)){
					$.isFunction(done) ? done() : "";
				}
				return;
			}
			var scrolloffset = self._scrollOffset();
			self._dataDraw();
			self.viewUpdate(scrolloffset);
			if(!params || (params && params.length < 3)) {
				$.isFunction(done) ? done() : "";
			}
		}, 0,(e===false)?false:true);

	};
	var lasthoverenterY = -100;
	var lasthoverleaveY = -100;
	AlopexGrid.prototype._hoverEnter = function(row, e) {
		var self = this;
		if (AlopexGrid.dragObject) {
			return;
		}
		var y = e.clientY;
		if (lasthoverenterY === y) {
			return;
		}
		lasthoverenterY = y;
		var $this = $(row);
		var dataIndex = Number($this.attr('data-alopexgrid-dataindex'));
		if (self.state.hovered) {
			$.each(self.state.hovered, function(idx, elem) {
				//mouseleaveHandler.call(elem[0], {});
				self._hoverLeave(elem[0], {});
			});
			delete self.state.hovered;
		}
		self.state.hovered = [];
		var rowspanindex = self.state.rowspanned ? _rowspanWidestIndex(self.state.rowspanindex, dataIndex) : null;
		if (self.state.rowspanned && rowspanindex) {
			var rowspanfrom = null
			var rowspanto = null;
			rowspanfrom = rowspanindex.from;
			rowspanto = rowspanindex.to;

			self.$tablebody.children('.row').each(function(idx, row) {
				var sdataIndex = row.getAttribute('data-alopexgrid-dataindex');
				if (sdataIndex === undefined || sdataIndex === null || sdataIndex === "") {
					return;
				}
				if (rowspanfrom <= Number(sdataIndex) && Number(sdataIndex) < rowspanto) {
					var $row = $(row);
					$row.addClass("hovering");
					self.state.data[sdataIndex]._state.hovering = true;
					if (self.state.hasFixColumn) {
						self._findClonePair($row).addClass("hovering");
					}
					self.state.hovered.push($row);
					if (Number(sdataIndex) === (Number(rowspanto) - 1)) {
						return false;
					}
				}
			});
		} else {
			$this.addClass("hovering");
			self.state.hovered.push($this);
			if (!isNaN(dataIndex)) {
				self.state.data[dataIndex]._state.hovering = true;
			}
			if (self.state.hasFixColumn) {
				self._findClonePair($this).addClass("hovering");
			}
		}
		//$this.one('mouseleave.alopexgridevent', mouseleaveHandler);

	};
	AlopexGrid.prototype._hoverLeave = function(row, e) {
		var self = this;
		if (AlopexGrid.dragObject) {
			return;
		}
		var y = e.clientY;
		if (lasthoverleaveY === y) {
			return;
		}
		lasthoverleaveY = y;
		var $this = $(row);
		if (!$this.hasClass('hovering')) {
			return;
		}
		var dataIndex = Number($this.attr('data-alopexgrid-dataindex'));
		var rowspanindex = null;
		rowspanindex = _rowspanWidestIndex(self.state.rowspanindex, dataIndex);
		if (self.state.rowspanned && rowspanindex) {
			var rowspanfrom = null;
			var rowspanto = null;
			rowspanfrom = rowspanindex.from;
			rowspanto = rowspanindex.to;

			self.$tablebody.children('.row').each(function(idx, row) {
				var sdataIndex = Number(row.getAttribute('data-alopexgrid-dataindex'));
				if (rowspanfrom <= sdataIndex && sdataIndex < rowspanto) {
					var $row = $(row);
					$row.removeClass("hovering");
					self.state.data[sdataIndex]._state.hovering = false;
					if (self.state.hasFixColumn && self.state.fixupto >= 0) {
						self._findClonePair($row).removeClass("hovering");
					}
					if (Number(sdataIndex) === (Number(rowspanto) - 1)) {
						return false;
					}
				}
			});
		} else {
			$this.removeClass("hovering");
			if (!isNaN(dataIndex)) {
				self.state.data[dataIndex]._state.hovering = false;
			}
			if (self.state.hasFixColumn && self.state.fixupto >= 0) {
				self._findClonePair($this).removeClass("hovering");
			}
		}

	};
	AlopexGrid.prototype.rowElementGet = function(query) {
		return this._elementGet(query);
	};
	AlopexGrid.prototype.cellElementGet = function(query, columnIK) {
		return _valid(query) && _valid(columnIK) ? this._elementGet(query, columnIK) : $();
	};
	AlopexGrid.prototype._elementGet = function(query, columnIK) {
		var self = this;
		var $empty = $();
		if(!_isEmptyQuery(query) && !_valid(columnIK)) {
			return self.refreshRow(query, true) || $empty;
		} else if(!_isEmptyQuery(query) && _valid(columnIK)) {
			return self.refreshCell(query, columnIK, true) || $empty;
		}
		return $empty;
	};
	AlopexGrid.prototype.refreshRow = function(query, elementget) {
		if(!query) return null;
		var self = this;
		var $rows = null;
		var $empty = $();
		if(query.jquery) {
			$rows = query;
		} else if(query.nodeType) {
			$rows = $(query);
		} else if(query._index) {
			var data = self.dataGetByIndex(query._index);
			var dataIndex = null;
			if(data && data._index) {
				dataIndex = data._index.data;
			}
			if(dataIndex !== null) {
				$rows = self.$tablebody.children('.bodyrow').filter('[data-alopexgrid-dataindex="'+dataIndex+'"]');
			}
		}
		if($rows === null || !$rows.length || !_valid($rows.attr('data-alopexgrid-dataindex'))) {
			return $empty;
		}
		if(elementget === true) {
			return $rows.add(self.state.hasFixColumn ? self._findClonePair($rows) : $empty);
		}
		//var $newrows = $();
		$rows.each(function(idx,row) {
			var $row = $(row);
			self._redrawRow($row);
		});
	};
	AlopexGrid.prototype.refreshCell = function(query, columnIndexKey, elementget) {
		var self = this;
		var $cell = null;
		var $empty = $();
		var dataIndex = null;
		var columnIndex = null;
		if(query.jquery || query.nodeType) {
			$cell = query.jquery ? query : $(query);
			columnIndex = Number($cell.attr('data-alopexgrid-columnindex'));
			dataIndex = Number($cell.parent().attr('data-alopexgrid-dataindex'));
		} else if(query._index) {
			var data = self.dataGetByIndex(query._index);
			if(!data) return $empty;
			dataIndex = Number(data._index.data);
			columnIndex = typeof columnIndexKey === "number" ? columnIndexKey :
				getColumnIndexByKey(self.option.columnMapping, columnIndexKey);
			var $rows = null;
			if(self.state.hasFixColumn && columnIndex <= self.state.fixupto && self.state.$fixcolbody) {
				$rows = self.state.$fixcolbody.children('.bodyrow');
			} else {
				$rows = self.$tablebody.children('.bodyrow');
			}
			if($rows !== null) {
				var rowfrom = Number($rows.eq(0).attr('data-alopexgrid-dataindex'));
				var rowto = Number($rows.eq(-1).attr('data-alopexgrid-dataindex'));
				if(dataIndex < rowfrom || dataIndex > rowto) {
					return $empty;
				}
				$cell = $rows.eq(dataIndex-rowfrom)
					.children('[data-alopexgrid-columnindex="'+columnIndex+'"]');
			}
		}
		if($cell === null || !$cell.length || !_valid($cell.attr('data-alopexgrid-columnindex'))) {
			return $empty;
		}
		var mapping = _getMappingFromColumnIndex(self.option.columnMapping, columnIndex);
		self.state.dataCompositor(self.state.data[dataIndex]);
		if(elementget === true) {
			return $cell;
		}
		var $renderedcell = $(_convertAlopex.call(
				self,
				self._cellRender(_getCurrentData(self.state.data[dataIndex]), mapping))
		);
		if($renderedcell.length && $cell.length) {
			$cell.replaceWith($renderedcell);
		}
		return $renderedcell;
	};
	function _getMappingByQuery(columnMapping, query, self, data) {
		for(var ci in columnMapping) {
			var mapping = columnMapping[ci];
			for(var prop in query) {
				if(mapping.hasOwnProperty(prop)) {
					if(typeof mapping[prop] === "string" && String(query[prop]) === mapping[prop]) return mapping;
					else if(typeof mapping[prop] === "number" && Number(query[prop]) === mapping[prop]) return mapping;
					else if(mapping[prop] === query[prop]) return mapping;
				}
			}
			var multiTemp = null;
			if(($.isFunction(mapping.multi) && $.isArray(multiTemp=mapping.multi.call(self, data[mapping.key], data, mapping)))
					|| $.isArray(mapping.multi)) {
				var r = _getMappingByQuery(multiTemp || mapping.multi, query, self, data);
				if(r) return r;
			}
		}
		return false;
	}
	AlopexGrid.prototype._cellCopy = function(cell) {
		var self = this;
		var $cell = cell.jquery ? cell : $(cell);
		var $row = $cell.parent('.row').eq(0);
		var key = $cell.attr('data-alopexgrid-key');
		var dataid = $row.attr('data-alopexgrid-dataid');
		if(dataid && key) {
			var data = self.dataGetByIndex({id:dataid});
			var value = data[key];
			AlopexGrid.clipboard["text"] = value;
			if(AlopexGrid.clipboard["elements"] && AlopexGrid.clipboard["elements"].length) {
				AlopexGrid.clipboard["elements"].removeClass('copied');
				AlopexGrid.clipboard["elements"] = $();
			}
			$cell.addClass('copied');
			AlopexGrid.clipboard["elements"] = AlopexGrid.clipboard["elements"] || $();
			AlopexGrid.clipboard["elements"] = AlopexGrid.clipboard["elements"].add($cell);

		}
	};
	AlopexGrid.prototype._focusInfo = function($cell,$row){
		var self = this;
		if(!$cell) {
			$cell = $(document.activeElement);
			if(!$cell.hasClass('bodycell')) return;
		}
		$row = $row || $cell.parent('.row').eq(0);
		var cellidx = $cell.index();
		var rowidx = $row.index();
		var copiedidx = $row.children('.copied').index();
		return {
			"column" : cellidx,
			"row":rowidx,
			"copied":copiedidx,
			"fixcol":(self.state.hasFixColumn && self.state.fixupto >= 0 && $cell.hasClass('cell-fixcol'))
		};
	};
	AlopexGrid.prototype._focusRestore = function(focusinfo) {
		var self = this;
		if(!focusinfo) return;
		var $tablebody = focusinfo["fixcol"] ? self.state.$fixcolbody : self.$tablebody;
		var $newcells = $tablebody.children().eq(focusinfo.row).children();
		var $targetcell = $newcells.eq(focusinfo.column);
		$targetcell.focus();
		if(focusinfo.copied >= 0) {
			AlopexGrid.clipboard["elements"] = AlopexGrid.clipboard["elements"]
				.add($newcells.eq(focusinfo.copied).addClass('copied'));
		}
		return $targetcell;
	};
	AlopexGrid.prototype._cellPaste = function(cell) {
		var self = this;
		var $cell = cell.jquery ? cell : $(cell);
		var $row = $cell.parent('.row').eq(0);
		var key = $cell.attr('data-alopexgrid-key');
		var dataid = $row.attr('data-alopexgrid-dataid');
		if(dataid && key && AlopexGrid.clipboard["text"]) {
			var fi = self._focusInfo($cell,$row);
			var obj = {};
			obj[key] = AlopexGrid.clipboard["text"];
			self.dataEdit(obj, {_index:{id:dataid}},true);
			//focus restore
			self._focusRestore(fi);
		}
		if(!AlopexGrid.clipboard["text"] && AlopexGrid.clipboard["elements"]
			&& AlopexGrid.clipboard["elements"].length) {
			AlopexGrid.clipboard["elements"].removeClass('copied');
			AlopexGrid.clipboard["elements"] = $();
		}
	};

	function _getSelectionTextInfo(el) {
		var atStart = false, atEnd = false;
		var selRange, testRange;
		if (window.getSelection) {
			var sel = window.getSelection();
			if (sel.rangeCount) {
				selRange = sel.getRangeAt(0);
				testRange = selRange.cloneRange();

				testRange.selectNodeContents(el);
				testRange.setEnd(selRange.startContainer, selRange.startOffset);
				atStart = (testRange.toString() == "");

				testRange.selectNodeContents(el);
				testRange.setStart(selRange.endContainer, selRange.endOffset);
				atEnd = (testRange.toString() == "");
			}
		} else if (document.selection && document.selection.type != "Control") {
			selRange = document.selection.createRange();
			testRange = selRange.duplicate();

			testRange.moveToElementText(el);
			testRange.setEndPoint("EndToStart", selRange);
			atStart = (testRange.text == "");

			testRange.moveToElementText(el);
			testRange.setEndPoint("StartToEnd", selRange);
			atEnd = (testRange.text == "");
		}

		return { atStart: atStart, atEnd: atEnd };
	}
	function _placeCaretAtEnd(el) {
		if (typeof window.getSelection != "undefined"
			&& typeof document.createRange != "undefined") {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange != "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		}
	}
	function _moveCaret(charCount) {
		var sel, range;
		win = window;
		if (win.getSelection) {
			sel = win.getSelection();
			if (sel.rangeCount > 0) {
				var textNode = sel.focusNode;
				var newOffset = sel.focusOffset + charCount;
				sel.collapse(textNode, Math.min(textNode.length, newOffset));
			}
		} else if ( (sel = win.document.selection) ) {
			if (sel.type != "Control") {
				range = sel.createRange();
				range.move("character", charCount);
				range.select();
			}
		}
	}
	AlopexGrid.prototype._cellFocusMove = function(cell, e, direction, dataid) {
		var self = this;
		e = $.event.fix(e);
		//PgUp(33), PgDn(34), End(35), Home(36), Left(37), Up(38), Right(39), Down(40)
		var arrows = [33,34,35,36,37,38,39,40,9];
		var arrowmap = {33:"pgup",34:"pgdn",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",9:"tab"};
		var direction = arrowmap[e.which];
		if(direction === "tab" && self.option.allowTabToCellMove) {
			direction = e.shiftKey ? "left" : "right";
		}
		var tag = e.target.tagName.toUpperCase();
		if(tag==='INPUT' || tag==="SELECT" || tag==="TEXTAREA") return;

		if($.inArray(e.which, arrows)>=0) {
			var $cell = $(cell);
			var contenteditable = $cell.attr('contentEditable');
			if(contenteditable && (direction=="right"||direction=="left") && arrowmap[e.which] !== "tab") {
				//_moveCaret(direction=="right"?1:-1);
				//e.preventDefault();
				return;
			}
			var selection = contenteditable ? _getSelectionTextInfo($cell[0]) : {atStart:true,atEnd:true};
			var $focustarget = null;
			var rowchange = false;
			//if(direction === "right" && selection.atEnd === true) {
			if(direction === "right") {
				var $next = $cell.next();
				if(self.state.hasFixColumn && !$next.length && $cell.hasClass('cell-fixcol')) {
					var $row = $cell.parent('.row').eq(0);
					$next = self.$tablebody.children().eq($row.index()).children().eq($cell.index()+1);
				}else if($cell.hasClass('lastcell')) {
					var $row = $cell.parent();
					if(self.state.hasFixColumn) {
						$row = self.state.$fixcolbody.children().eq($row.index()+1);
					} else {
						$row = $row.next();
					}
					if($row.length) {rowchange = true;}
					$next = $row.children().eq(0);
				}
				$focustarget = $next;
				//} else if(direction === "left" && selection.atStart === true) {
			} else if(direction === "left") {
				var $prev = $cell.prev();
				if(self.state.hasFixColumn &&!$cell.hasClass('cell-fixcol') && $prev.hasClass('cell-fixcol')) {
					var $row = $cell.parent('.row').eq(0);
					$prev = self.state.$fixcolbody.children().eq($row.index()).children().eq($cell.index()-1);
					self.$scroller.scrollLeft(0);
				} else if($cell.index() === 0) {
					var $row = $cell.parent();
					if(self.state.hasFixColumn) {
						var eq = $row.index()-1;
						if(eq >= 0) {
							$row = self.$tablebody.children().eq(eq);
						} else {
							$row = $();
						}
					} else {
						$row = $row.prev();
					}
					if($row.length) {rowchange = true;}
					$prev = $row.children().eq(-1);
				}
				$focustarget = $prev;
			} else if(direction === "up") {
				var eq = $cell.index();
				$focustarget = $cell.parent().prev().children().eq(eq);
				if(self.state.hasFixColumn && $cell.hasClass('cell-fixcol')) {

				}
				if($focustarget.length) {rowchange = true;}
			} else if(direction === "down") {
				var eq = $cell.index();
				$focustarget = $cell.parent().next().children().eq(eq);
				if(self.state.hasFixColumn && $cell.hasClass('cell-fixcol')) {

				}
				if($focustarget.length) {rowchange = true;}
			}
			if($focustarget) {
				var proceed = true;
				if(rowchange && self.option.rowInlineEdit) {
					var ended = self.endEdit({_index:{id:dataid}});
					if(ended === false) {
						proceed = false;
					}
				}
				if(proceed) {
					$focustarget.focus();
					if($focustarget.attr('contentEditable')) {
						_placeCaretAtEnd($focustarget[0]);
					}
					e.preventDefault();
				}
			}
		}
	};
	AlopexGrid.prototype._cellEditUpdate = function(cell, dataid, key, e) {
		var self = this;
		var mapping = null;
		var data = null;
		var dataIndex = null;
		if($.isPlainObject(dataid) && dataid._index.id) {
			data = dataid;
			dataid = data._index.id;
			dataIndex = data._index.data;
		}
		while (!cell.attributes["data-alopexgrid-columnindex"]) {
			cell = cell.parentNode;
			if (!cell) {
				return;
			}
		}
		if(!_valid(dataid) && cell) {
			var row = cell.parentNode;
			dataid = row.attributes['data-alopexgrid-dataid'].value;
		}

		if(!_valid(dataid)) return;

		if(!data) {
			$.each(self.state.data, function (idx, dat) {
				if (dat._index.id === dataid) {
					data = dat;
					dataIndex = data._index.data;
					return false;
				}
			});
		}

		if (!data) {
			return;
		}
		if (key === undefined || key === null || typeof key === "number") {
			var columnIndex = typeof key === "number" ? key : cell.attributes['data-alopexgrid-columnindex'].value;
			if (columnIndex === undefined || columnIndex === null) {
				return;
			}
			columnIndex = Number(columnIndex);
			mapping = _getMappingByQuery(self.option.columMapping, {columnIndex:columnIndex}, self, data);
		} else if (typeof key === "object" && key.hasOwnProperty('columnIndex')) {
			mapping = key;
		} else if (typeof key === "string") {
			mapping = _getMappingByQuery(self.option.columnMapping, {key:key}, self, data);
		}
		if (mapping && mapping.editable) {
			if($.isFunction(mapping.allowEdit)) {
				var result = mapping.allowEdit(data[mapping.key], data, mapping);
				if(result === false) return;
			}
			if (processMappingValidate(mapping)) {
				//TODO validate()와 getErrorMessage()를 사용하여 메세지 처리 및 핸들러 호출
				var $input = getValidatoredInput.call(self, cell, mapping);
				if ($input) {
					//validate()를 $(cell)에 대해 수행하고 에러 여부를 검출한 뒤 핸들러를 호출한다.
					var errorMessage = $input.getErrorMessage() || [];
					var valid = !($.isArray(errorMessage) && errorMessage.length);
					processValidateChange.call(self, mapping, valid, errorMessage, cell, $input.val());
				}
			}

			data._state.recent = data._state.recent || {};
			var prevValue = data._state.recent.hasOwnProperty(mapping.key) ?
				data._state.recent[mapping.key] : data[mapping.key];
			var prevData = $.extend(true, {}, data, AlopexGrid.trimData(data._state.recent));
			var value = data._state.recent[mapping.key] = _extractValue.call(self, mapping, $(cell), data);
			var newData = $.extend(true, {}, data, AlopexGrid.trimData(data._state.recent));
			var refreshed = [];
			if(prevValue !== value) {
				//refresh other columns which are depend on this column
				for(var j=0;j<self.option.columnMapping.length; j++) {
					var targetmapping = self.option.columnMapping[j];
					if(!_valid(targetmapping.columnIndex) || !$.isPlainObject(targetmapping)) continue;
					if(Number(targetmapping.columnIndex) === Number(mapping.columnIndex)) continue;
					if(targetmapping.hasOwnProperty('refreshBy')) {
						var doit = false;
						var cond = targetmapping.refreshBy;
						if(cond === true) {
							doit = true;
						}
						else if(typeof cond === "string" && cond === mapping.key) {
							doit = true;
						}
						else if($.isArray(cond)
							&& ($.inArray(mapping.key, cond)>=0
								|| $.inArray(Number(mapping.columnIndex), cond)>=0)
							) {
							doit = true;
						}
						else if($.isFunction(cond)) {
							var op = {};
							op["prevData"] = prevData;
							op["newData"] = newData;
							op["_key"] = targetmapping.key;
							op["_column"] = targetmapping.columnIndex;
							op["_index"] = $.extend({}, data._index);
							op["mapping"] = targetmapping;
							op["done"] = function() {
								var $cell = self.refreshCell({_index:{data:this._index.data}}, this._column);
								$.isFunction(this["_done"]) ? this["_done"]() : null;
								$cell ? $cell.find('input,select,textarea').trigger('change') : null;
								this.complete = true;
							};

							var res = cond.call(op, prevData, newData, targetmapping,
								(function(worker){
									return function(){worker.done();};
								})(op));
							if(res === true) {
								doit = true;
							} else if(res === "async") {
								(function(worker){
									if(!worker.complete) {
										self._showProgress(function(done){
											worker["_done"] = done;
										},0,true);
									}
								})(op);
							}
						}
						if(doit) {
							var $cell = self.refreshCell({_index:{data:dataIndex}}, targetmapping.columnIndex);
							refreshed.push(targetmapping.columnIndex);
							$cell ? $cell.find('input,select,textarea').trigger('change') : null;
						}
					}
				}
				//refresh pinned cell or row
				if(self._hasPinnedData(data._index.id)) {
					if(String(cell.className).indexOf('pinnedcell') >= 0) {
						self.refreshCell({_index:{id:data._index.id}},mapping.columnIndex);
					} else {
						self._pinnedRefresh(data._index.id);
					}
				}
			}
			if (self.state.rowspanned && self.option.rowspanGroupEdit && self.state.rowspanindex[Number(mapping.columnIndex)]) {
				//span된 값을 동일 범위 key에 배포한다.
				var rindex = _rowspanned(self.state.rowspanindex[Number(mapping.columnIndex)], dataIndex, true);
				if (rindex) {
					for (var i = rindex.from; i < rindex.to; i++) {
						if(!self.state.data[i]._state.editing) continue;
						self.state.data[i]._state.recent = self.state.data[i]._state.recent || {};
						self.state.data[i]._state.recent[mapping.key] = value;

						if(mapping.rowspan && refreshed.length && i !== dataIndex && $.inArray(i, refreshed)>=0) {
							//만일 수정된 컬럼이 span되있다면 연결될 수 있는 다른 row를 리프레시한다.
							self.refreshRow({_index:{data:i}});
						}
					}
				}
			}
		}
	};
	AlopexGrid.prototype._allowEditProcess = function(row, dataidindex) {
		var self = this;
		//var $cell = $(e.target);
		if (!self.state.hasAllowEdit) {
			return;
		}
		var $row = row.jquery ? row : $(row);
		var $cells = $row.children();
		var dataIndex = Number($row.attr('data-alopexgrid-dataindex'));
		self._refreshEditableCell(dataIndex, $row);
		var data = self._getRecentData(dataIndex);
		for ( var i in self.option.columnMapping) {
			var mapping = self.option.columnMapping[i];
			if (!mapping.allowEdit) {
				continue;
			}
			var key = mapping.key;
			var value = data[key];
			//var $cell = $cells.eq(mapping.columnIndex);
			var $cell = $cells.filter('[data-alopexgrid-columnindex="' + mapping.columnIndex + '"]');
			if(!$cell.length) continue;
			var rendered = null;
			if (typeof mapping.allowEdit == "function") {
				var result = mapping.allowEdit(value, data, mapping);
				if (!result && $cell.hasClass('allow-valid')) {
					//invalid로 격하 - render를 적용
					rendered = self._cellRender(data, $.extend(true, {}, mapping, {
						editable: false
					}), {
						styleclass: "allow-invalid"
					});
				} else if (result && $cell.hasClass('allow-invalid')) {
					//valid로 격상 - editable을 적용
					rendered = self._cellRender(data, mapping, {
						styleclass: "allow-valid"
					});
				}
			}
			if (rendered) {
				$cell.replaceWith(_convertAlopex.call(self, rendered));
			}
		}
	};
//	AlopexGrid.prototype._delegateEvent = function(target, name, event, dataIndex, rowIndex, columnIndex) {
//		//event target - cell/row
//		//event name - name
//		if (this._noData()) {
//			return;
//		}
//		var self = this;
//		var data = $.extend({}, self.state.data[dataIndex]);
//		if (data._state.editing) {
//			var $row = self.$tablebody.children('.bodyrow').eq(rowIndex);
//			var editing = self._getRecentData(Number(dataIndex));
//			data = $.extend({}, data, editing);
//		}
//		if (rowIndex !== undefined) {
//			data._index.row = Number(rowIndex);
//		}
//		if (columnIndex !== undefined) {
//			data._index.column = Number(columnIndex);
//		}
//		if (self.option.on && self.option.on[target] && self.option.on[target][name]) {
//			var handler = self.option.on[target][name];
//			handler = typeof handler == "function" ? [handler] : handler;
//			handler.call(this, data, null, event);
//		}
//	};
	AlopexGrid.prototype.viewEventUpdate = function(data) {
		var self = this;
		var $r = self.$root;
		var $table = self.$table;
		var $wrapper = self.$wrapper;
		var $scroller = self.$scroller;
		var $scrollpanel = self.$scrollpanel;
		var option = self.option;
		var $document = $(document).off('.alopexgridevent');
		$r.off('.alopexgridevent');
		self.$title.off('.alopexgridevent');
		self.$pager.off('.alopexgridevent');
		$wrapper.off('.alopexgridevent');
		$scroller.off('.alopexgridevent');
		$scrollpanel.off('.alopexgridevent');
		//사용자 지정 Row, Column 대상 이벤트 제어
		//option.on.row["tap"] = [function(data, dataChangeCallback, eventObject){/*user callback*/},...];

		var delegate = [{
			target: "cell",
			delegate: ".bodycell"
		}, {
			target: "row",
			delegate: ".bodyrow"
		}, {
			target : "headercell",
			delegate : ".headercell"
		},{
			target : "headerrow",
			delegate : ".headerrow"
		}];
		$.each(delegate, function(idx, elem) {
			if (option.on && option.on[elem.target]) { //on.cell
				$.each(option.on[elem.target], function(type, handle) { //on.cell.click
					$wrapper.on((self.option.eventMapping[type] || type) + '.alopexgridevent', elem.delegate, function(e, e2) {
						var handler = typeof handle == "function" ? [handle] : handle;
						var data = null;
						var $row = e.target.tagName === 'TR' ? $(this) : $(e.target).parentsUntil($wrapper, '.row').eq(0);
						if ($row.hasClass("emptyrow")) {
							return;
						}
						//TODO _index.row 가 virtual scrolling이 적용되었을 땐 어떻게 취급되어야 하는가?
						var dataIndex = $row.attr('data-alopexgrid-dataindex');
						if(dataIndex === undefined || dataIndex === null) {
							data = {};
							var columnIndex = this.getAttribute('data-alopexgrid-columnindex');
							if(columnIndex !== undefined && columnIndex !== null) {

								data["_index"] = {"column":columnIndex};
								var k = this.getAttribute('data-alopexgrid-key');
								if(k) {
									data["_key"] = k;
								} else {
									$.each(self.option.columnMapping, function(idx, elem) {
										if (elem.hasOwnProperty('columnIndex') && Number(elem.columnIndex) === Number(columnIndex)) {
											data["_key"] = elem.key;
											return false;
										}
									});
								}
							}
						} else {
							dataIndex = Number(dataIndex);
							//var rowIndex = $rows.index($row);
							var columnIndex = this.getAttribute('data-alopexgrid-columnindex');
							if ((self.state.data[dataIndex]._state.editing || $row.hasClass("editing")) && self.option.getEditingDataOnEvent ) {
								self._refreshEditableCell(dataIndex, $row);
								data = self._getRecentData(dataIndex);
								//data = $.extend({},self.dataGetByIndex({"element":this}), data);
								data = $.extend(true, {}, self.state.data[dataIndex], data);
							} else {
								//data = self.dataGetByIndex({"element" : this});
								data = $.extend(true, {}, self.state.data[dataIndex]);
								if (!data || !(data._index.data >= 0)) {
									data = self.dataGetByIndex({
										"element": self._findClonePair(this)
									});
								}
							}
							var rowIndex = $.inArray(dataIndex, self.state.rendered);
							if (rowIndex >= 0) {
								data._index.row = rowIndex;
							}
							if (columnIndex !== null && columnIndex !== undefined) {
								data._index.column = Number(columnIndex);
								var k = this.getAttribute('data-alopexgrid-key');
								if(k) {
									data._key = k;
								} else {
									$.each(self.option.columnMapping, function(idx, elem) {
										if (elem.hasOwnProperty('columnIndex') && Number(elem.columnIndex) === Number(columnIndex)) {
											data._key = elem.key;
											return false;
										}
									});
								}
							}
						}

						//var $cell = $(e.target).hasClass(".cell") ? $(e.target) : $(e.target).parents(".cell").eq(0);
						for ( var j in handler) {
							var h = handler[j];
							//TODO editing기능. handler의 리턴값을 인식하거나, 또는 두번째 파라메터에 data만 받는 편집함수를 넣어서
							//자동으로 state.data에 반영되도록 한다(index는 내부에서 알아서 핸들)
							h.call(this, data, e, e, e2);
						}
					});
				});
			}
		});

		if(self.option.highlightLastAction) {
			var end = isMobile ? 'touchend' : 'click';
			var lastActionRowClass = self.option.lastActionRowClass;
			var lastActionCellClass = self.option.lastActionCellClass;
			self.$root
				.on(end+'.alopexgridevent','.bodycell', function(e){
					var $cell = $(this);
					if(_valid(self.state.lastActionRowId) && _valid(self.state.lastActionColumnIndex)) {
						var $body = self.$tablebody;
						if(self.state.hasFixColumn) {
							$body = $body.add(self.state.$fixcolbody);
						}
						$body
							.children('[data-alopexgrid-dataid="'+self.state.lastActionRowId+'"]')
							.removeClass(lastActionRowClass)
							.children('[data-alopexgrid-columnindex="'+self.state.lastActionColumnIndex+'"]')
							.removeClass(lastActionCellClass);
					}
					$cell.addClass(lastActionCellClass);
					var ci = $cell.attr('data-alopexgrid-columnindex');
					if(_valid(ci)) {
						self.state.lastActionColumnIndex = Number(ci);
					} else {
						delete self.state.lastActionColumnIndex;
					}

					var $row = $cell.parent();
					$row.addClass(lastActionRowClass);
					if(self.state.hasFixColumn) {
						var $cloned = self._findClonePair($row);
						if($cloned && $cloned.length) {
							$cloned.addClass(lastActionRowClass);
						}
					}
					var rid = $row.attr('data-alopexgrid-dataid');
					if(_valid(rid)) {
						self.state.lastActionRowId = rid;
					} else {
						delete self.state.lastActionRowId;
					}
				});
		}

		if(isAlopexMobile) {
			//TODO Event Module Refinement
			var start = isMobile ? 'touchstart' : 'mousedown';
			var move = isMobile ? 'touchmove' : 'mousemove';
			var end = isMobile ? 'touchend' : 'mouseup';
			var cancel = isMobile ? 'touchcancel' : 'mouseup';
			var ns = '.gridtapworkaround';
			function getx(e) {
				return isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
			}
			function gety(e) {
				return isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
			}
			function dist(x1,y1,x2,y2) {
				return ((x1-x2)*(x1-x2)) + ((y1-y2)*(y1-y2));
			}
			function distTap(o) {
				return dist(o.x,o.y,o.x2,o.y2);
			}
			$r.off(ns).on(start+ns,function(e) {
				self.state._tap = {
					target:e.target,
					x:getx(e),
					y:gety(e),
					x2:getx(e),
					y2:gety(e),
					timestamp:new Date().getTime()
				};

				$(window).off(ns)
					.on(move+ns,function(e) {
						if(!self.state._tap) return;
						self.state._tap.x2 = getx(e);
						self.state._tap.y2 = gety(e);
					})
					.on(end+ns,function(e) {
						if(self.state._tap && self.state._tap.target === e.target) {
							if(distTap(self.state._tap) < 25 && new Date().getTime()-self.state._tap.timestamp < 750) {
								$(e.target).parents().add(e.target).filter('[data-gridtap]').each(function(){
									var attrhandler = $(this).attr('data-gridtap');
									if(attrhandler) {
										var func = new Function('event',attrhandler);
										func.call(this,e);
									}
								});
							}
						}
						self.state._tap = null;
						$(window).off(ns);
					})
					.on(cancel+ns, function(e) {
						self.state._tap = null;
						$(window).off(ns);
					});
			});
		}
		if(self.option.enableKeyboardEdit) {
			var preventStartTimer = null;
			function preventStart (duration){
				if(preventStartTimer) {
					clearTimeout(preventStartTimer);
				}
				preventStartTimer = setTimeout(function(){
					preventStartTimer = null;
				},duration);
			}
			function allowed(){
				return preventStartTimer === null;
			}
			$document.off('.alopexgrideventcopypaste'+self.key);
			$document.on('copy.alopexgrideventcopypaste'+self.key,function(e) {
				var $cell = $(document.activeElement);
				var $grid = $cell.parents('.alopexgrid').eq(0);
				if($grid.attr('data-alopexgrid') === self.key && $cell.length && $cell.attr('data-alopexgrid-columnindex')) {
					self._cellCopy($cell);
				}
			});
			$document.on('paste.alopexgrideventcopypaste'+self.key,function(e) {
				var $cell = $(document.activeElement);
				var $grid = $cell.parents('.alopexgrid').eq(0);
				if($grid.attr('data-alopexgrid') === self.key && $cell.length && $cell.attr('data-alopexgrid-columnindex')) {
					self._cellPaste($cell);
				}
			});
			$document.on('keyup.alopexgrideventcopypaste'+self.key, function(e) {
				if(e.which === 27) {//esc
					if(AlopexGrid.clipboard["elements"] && AlopexGrid.clipboard["elements"].length) {
						AlopexGrid.clipboard["elements"].removeClass('copied');
						AlopexGrid.clipboard["elements"] = $();
					}
					AlopexGrid.clipboard["text"] = null;

					var $act = $(document.activeElement);
					var $cell = $act.attr('data-alopexgrid-columnindex') ? $act : $act.parents('.cell').eq(0);
					if($cell.length && $cell.attr('data-alopexgrid-columnindex')) {
						var $row = $cell.parent();
						var $grid = $cell.parents('.alopexgrid').eq(0);
						if($grid.attr('data-alopexgrid') !== self.key) return;
						var dataid = $row.attr('data-alopexgrid-dataid');
						var _inst = _instance($grid);
						var fi = _inst._focusInfo($cell, $row);
						if($row.hasClass('editing')) {
							_inst.endEdit({_index:{id:dataid}});
						}
						_inst._focusRestore(fi);
					}
				} else if (e.which === 13) {//enter
					var $act = $(document.activeElement);
					var $cell = $act.attr('data-alopexgrid-columnindex') ? $act : $act.parents('.cell').eq(0);
					if($cell.length && $cell.attr('data-alopexgrid-columnindex')) {
						var $row = $cell.parent();
						var $grid = $cell.parents('.alopexgrid').eq(0);
						if($grid.attr('data-alopexgrid') !== self.key) return;
						var dataid = $row.attr('data-alopexgrid-dataid');
						var _inst = _instance($grid);
						var fi = _inst._focusInfo($cell, $row);
						if($row.hasClass('editing')) {
							$act.trigger('change').blur();
							_inst.endEdit({_index:{id:dataid}});
							preventStart(150);
						} else if(allowed()) {
							var go = true;
							if(_inst.option.rowInlineEdit) {
								$act.trigger('change').blur();
								go = _inst.endEdit();
							}
							if(go !== false) {
								_inst.startEdit({_index:{id:dataid}});
							}
						}
						var $focused = _inst._focusRestore(fi);
						if($focused.attr('contentEditable')) {
							_placeCaretAtEnd($focused[0]);
						}
					}
				}
			});
			$document.on('keypress.alopexgrideventcopypaste'+self.key,'.bodycell', function(e){
				if(this !== document.activeElement || e.which === 13) {
					if(e.which === 13) return false;
					return;
				}
				var $inputs = $(this).find('input');
				if($inputs.length) {
					$inputs.focus();
				}
			});
		}

		if (option.rowInlineEdit) {
			//TODO 속도저하 가능.
			//CLICK으로도 사용 가능하도록...?
			var ev = 'dblclick';
			if(isAlopexMobile) ev = 'doubletap';
			$wrapper.on(ev + '.alopexgridevent', '.bodyrow', function(e) {
				var data = self.dataGetByIndex({
					"element": this
				});
				var $row = $(e.target).parentsUntil($r).filter(".row");
				var incell = !!$row.length;
				if (e.target.tagName == "INPUT") {
					return;
				}
				if ($row.hasClass("emptyrow")) {
					return;
				}
				if (incell && data._state && data._state.editing) {
					self.endEdit();
					clearSelection();
					return;
				}
				if (!self.state.data || !self.state.data.length) {
					return;
				}
				self.endEdit();
				if (data && (!data._state || !data._state.editing)) {
					self.startEdit(data);
				}
				clearSelection();
			});
			//$r.on('click.alopexgridevent', '.fixed-items .table-header', function(e) {
//			$wrapper.on('click.alopexgridevent', 'div.fixed-items', function(e) {
//				if (!self.state.data || !self.state.data.length) {
//					return;
//				}
//				self.endEdit();
//			});
			$wrapper.on('click.alopexgridevent', '.row', function(e, click) {
				if (self._noData()) {
					return;
				}
				if (!e.target || !e.target.parentNode) {
					return;
				}
				var $row = $(this);
				if ($row.hasClass("editing")) {
					return;
				}
				$.each(self.state.data, function(idx, data) {
					if (data._state.editing) {
						self.endEdit();
						return false;
					}
				});
			});
			$wrapper.on('click.alopexgridevent', function(e) {
				if(e.target === e.currentTarget) {
					//빈공간이 클릭되었을 때
					$.each(self.state.data, function(idx, data) {
						if (data._state.editing) {
							self.endEdit();
							return false;
						}
					});
				}
			});
			$(document).off('.alopexgrideventinineedit'+self.key);
			if(option.endInlineEditByOuterClick) {
				$(document).on('click.alopexgrideventinineedit'+self.key,function(e){
					var $target = $(e.target);
					var $chain = $target.add($target.parents());
					if($chain.filter('.alopexgrid')[0] === self.$root[0]) {
						return;
					}//check only if area outside the grid is clicked
					if($chain.filter('input,select,button,textarea,a').length) {
						return;
					}//clicking on control elements should not end editing mode.
					$.each(self.state.data, function(idx, data) {
						if (data._state.editing) {
							self.endEdit();
							return false;
						}
					});
				});
			}
			self.$title.on('click.alopexgridevent', function(e) {
				if (self._noData()) {
					return;
				}
				$.each(self.state.data, function(idx, data) {
					if (data._state.editing) {
						self.endEdit();
						return false;
					}
				});
			});
			self.$pager.on('click.alopexgridevent', function(e) {
				if (self._noData()) {
					return;
				}
				$.each(self.state.data, function(idx, data) {
					if (data._state.editing) {
						self.endEdit();
						return false;
					}
				});
			});
		}

		$r.off('.alopexgriddragevent');
		$(document).off('.alopexgriddragevent' + self.key);

		if (self.option.useDragDrop) {
			//$r.on('mousedown.alopexgriddragevent', '.table .table-body .row', dragStartHandler);
			$r.on('mousedown.alopexgriddragevent', '.bodyrow', dragStartHandler);

			$(document).on('mousemove.alopexgriddragevent' + self.key, dragProxyMoveHandler);
			$r.on('mousemove.alopexgriddragevent', dragMoveHandler);
			$r.on('mouseup.alopexgriddragevent', dragEndHandler);
			$(document).on('mouseup.alopexgriddragevent' + self.key, dragCancelHandler);

			$r.on('selectstart.alopexgriddragevent', function(e) {
				if (e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") {
					return;
				}
				e.preventDefault();
			});
		}

		function dragStartHandler(e) {
			if (AlopexGrid.dragObject || !self.option.useDragDrop || e.which !== 1) {
				return;
			}
			if (e.target.tagName == "INPUT" || e.target.tagName == "SELECT" || e.target.tagName == "TEXTAREA") {
				return;
			}
			var $row = e.target.tagName == "TR" ? $(e.target) : $(e.target).parents('.row').eq(0);
			if ($row && $row.length) {
				if ($row.hasClass('emptyrow')) {
					return;
				}
				var dataIndex = Number($row.attr('data-alopexgrid-dataindex'));
				var data = self.dataGetByIndex({
					data: dataIndex
				});
				//$(document.body).append($proxy);
				AlopexGrid.dragObject = {
					enabled: false,
					$row: $row,
					key: self.key,
					data: data,
					$proxy: null,
					$indicator: null,
					startX: e.pageX,
					startY: e.pageY,
					startInstance: self
				};
			}
			//e.preventDefault();
		}
		//프록시만 이동시킨다.
		function dragProxyMoveHandler(e) {
			if (!AlopexGrid.dragObject) {
				return;
			}
			if (AlopexGrid.dragObject.$proxy) {
				AlopexGrid.dragObject.$proxy.css({
					"left": (e.pageX + 5) + "px",
					"top": (e.pageY + 5) + "px"
				});
			}
			if (!AlopexGrid.dragObject.enabled && AlopexGrid.dragObject.key === self.key) {
				if (Math.abs(e.pageY - AlopexGrid.dragObject.startY) > 25) {
					AlopexGrid.dragObject.enabled = true;
					var $proxy = $('<div class="alopexgrid-proxy">');
					$proxy.css({
						"position": "absolute",
						//            "width":"20px",
						//            "height":"20px",
						//            "background-color":"red",
						"left": (e.pageX + 5) + "px",
						"top": (e.pageY + 5) + "px",
						"z-index": "99999"
					});
					var clonetable = [];
					clonetable.push('<table class="table table-proxy" style="table-layout:fixed;width:',self.$table.width(),'px;">');
					clonetable.push('<colgroup>',self.$colgroup.html(),'</colgroup>');
					clonetable.push('<tbody class="table-body">');
					self.state.data[AlopexGrid.dragObject.data._index.data]._state.hovering = false;
					clonetable.push(self._rowRender(AlopexGrid.dragObject.data, AlopexGrid.dragObject.data._index.data, null, {
						disableRowspan: true
					}));
					clonetable.push('</tbody></table>');
					$proxy.html(clonetable.join(''));
					$proxy.find('.table').css({
						"border": "1px solid grey",
						"background-color": "white",
						"opacity": "0.9"
					});
					//$proxy.find('.table-body').css();
					$proxy.find('.cell').css({
						"border": "1px solid grey",
						"padding-left": "5px",
						"padding-right": "5px"
					});
					AlopexGrid.dragObject.$proxy = $proxy;
					$(document.body).append(AlopexGrid.dragObject.$proxy);
					$(document).on('selectstart.alopexgriddragevent_t' + self.key, function(e2) {
						if (e2.target.tagName == "INPUT" || e2.target.tagName == "TEXTAREA") {
							return;
						}
						e2.preventDefault();
					});
					self.$scroller.find('.row.hovering').removeClass('hovering');
					dragMoveHandler(e);
				} else {
					return;
				}
			}
			//e.preventDefault();
		}
		//실제 그리드 위에서 움직일 때의 indicator 조작. 
		function dragMoveHandler(e) {
			if (!AlopexGrid.dragObject || !AlopexGrid.dragObject.enabled) {
				return;
			}
			if ($(e.target).hasClass("alopexgrid-indicator")) {
				return;
			}
			var $row = e.target.tagName == "TR" ? $(e.target) : $(e.target).parents('.bodyrow').eq(0);
			var $nextrow = $row.next();
			var isbody = !!$(e.target).parentsUntil($r, '.table-body').length;
			var offset = $row.length && isbody ? $row.offset() : self.$tablebody.offset();
			var nextoffset = $nextrow.offset();
			var top = offset.top;
			var left = offset.left;
			var bottom = nextoffset ? nextoffset.top : (top + $row.height());
			var indicatorY = bottom;
			if ((top + bottom) / 2 > e.pageY) {
				indicatorY = top;
				AlopexGrid.dragObject.insertAfter = false;
			} else {
				AlopexGrid.dragObject.insertAfter = true;
			}
			if (!$row.length || !isbody) {
				AlopexGrid.dragObject.insertAfter = false;
			}
			AlopexGrid.dragObject.toindex = Number($row.attr('data-alopexgrid-dataindex')) || 0;
			if ($row.hasClass('emptyrow')) {
				AlopexGrid.dragObject.insertAfter = true;
				AlopexGrid.dragObject.toindex = -1;
			}
			if (!isbody) {
				AlopexGrid.dragObject.toindex = 0;
				if (e.pageY > (self.$root.offset().top + self.$root.height() / 2)) {
					//bottom side of table
					AlopexGrid.dragObject.toindex = -1;
					indicatorY = self.$tablebody.offset().top + self.$tablebody.height();
				}
			}
			if (!AlopexGrid.dragObject.$indicator) {
				var $indicator = $('<div class="alopexgrid-indicator">');
				$indicator.css({
					"position": "absolute",
					"left": "-10000px",
					"height": "0px",
					"z-index": "99998"
				});
				AlopexGrid.dragObject.$indicator = $indicator;
			}
			AlopexGrid.dragObject.$indicator.css({
				"top": (indicatorY - 1) + "px",
				"left": left + "px",
				"width": self.$scroller.innerWidth() + "px"
			}).appendTo(document.body);
			AlopexGrid.dragObject.lastY = indicatorY;
			AlopexGrid.dragObject.lastSelf = self;
		}
		function dragEndHandler(e, onlast) {
			var wself = self;
			if (!AlopexGrid.dragObject || !AlopexGrid.dragObject.enabled) {
				dragCancelHandler(e);
				return;
			}
			if (onlast) {
				wself = AlopexGrid.dragObject.lastSelf;
			}
			//indicator위에 있을 경우 엄한 그리드에 데이터를 넣는 경우가 발생.
			if (AlopexGrid.dragObject.enabled && (onlast || AlopexGrid.dragObject.lastSelf.key === wself.key)) {
				var fromindex = Number(AlopexGrid.dragObject.$row.attr('data-alopexgrid-dataindex'));
				var toindex = AlopexGrid.dragObject.toindex;
				if (toindex < 0) {
					toindex = Number(wself.$tablebody.children('.row').not('.emptyrow').eq(-1).attr('data-alopexgrid-dataindex')) + 1;
				} else if (AlopexGrid.dragObject.insertAfter) {
					toindex++;
				}
				//Case1. 최초 시작한 그리드로 떨어진 경우 state에서의 위치만 변경한다(splice후 dataDraw 또는 단순 element 위치 변경)
				if (wself.key === AlopexGrid.dragObject.key || (onlast && wself.key === AlopexGrid.dragObject.startInstance.key)) {
					wself.sortClear();
					wself._dataMoveByDataindex(fromindex, toindex);
					$.each(wself.state.data, function(idx, item) {
						if (item && item._state) {
							item._state.hovering = false;
						}
					});
					wself._dataDraw({
						tableheader: {
							display: 'none'
						}
					});
					if (wself.state.hasFixColumn) {
						//this.viewUpdate();
						var viewoption = {};
						if (wself.state.lastScrollLeft !== 0) {
							viewoption.scrollLeft = 0;
						}
						wself.viewUpdate(viewoption);
					}
					wself._needEditedRefresh();
				}
				//Case2. 다른 그리드로 옮긴 경우 자신에게서는 delete, 받은 그리드는 add를 한다.
				else {
					wself.sortClear();
					delete AlopexGrid.dragObject.data._state;
					delete AlopexGrid.dragObject.data._index;
					wself.dataAdd(AlopexGrid.dragObject.data, {
						_index: {
							data: toindex
						}
					});
					AlopexGrid.dragObject.startInstance.dataDelete({
						_index: {
							data: fromindex
						}
					});
					wself._dataDraw({
						tableheader: {
							display: 'none'
						}
					});
					if (wself.state.hasFixColumn) {
						//this.viewUpdate();
						var viewoption = {};
						if (wself.state.lastScrollLeft !== 0) {
							viewoption.scrollLeft = 0;
						}
						wself.viewUpdate(viewoption);
					}
					AlopexGrid.dragObject.startInstance._dataDraw({
						tableheader: {
							display: 'none'
						}
					});
					AlopexGrid.dragObject.startInstance._needEditedRefresh();
				}
			}
			if (AlopexGrid.dragObject.$proxy) {
				AlopexGrid.dragObject.$proxy.remove();
			}
			if (AlopexGrid.dragObject.$indicator) {
				AlopexGrid.dragObject.$indicator.remove();
			}
			$(document.body).find('.alopexgrid-indicator').remove();
			delete AlopexGrid.dragObject;
			AlopexGrid.dragObject = null;
			$(document).off('.alopexgriddragevent_t' + self.key);
		}
		function dragCancelHandler(e) {
			if (!AlopexGrid.dragObject) {
				return;
			}
			var $target = $(e.target);
			if ($target.hasClass('alopexgrid-indicator') || $target.hasClass('alopexgrid-proxy')) {
				//indicator에서 이벤트가 종료된 경우, 가장 마지막에 사용된 엘리먼트에 data를 drop한다.
				dragEndHandler(e, true);
				return;
			}
			if (AlopexGrid.dragObject.$proxy) {
				AlopexGrid.dragObject.$proxy.remove();
			}
			if (AlopexGrid.dragObject.$indicator) {
				AlopexGrid.dragObject.$indicator.remove();
			}
			$(document.body).find('.alopexgrid-indicator').remove();
			delete AlopexGrid.dragObject;
			AlopexGrid.dragObject = null;
			$(document).off('.alopexgriddragevent_t' + self.key);
		}

		//*
		self.$scroller.off('.alopexgridvscroll'+self.key);
		$window.off('.alopexgridvscroll'+self.key);
		if(option.virtualScroll) {
			var $target = option.height ? self.$scroller : $window;
			_scrollHack($target,'.alopexgridvscroll'+self.key);
			$target.on('scroll.alopexgridvscroll'+self.key, function(e) {
				if(self.state._vspTimer) {
					clearTimeout(self.state._vspTimer);
					self.state._vspTimer = null;
				}
				self.state._vspTimer = setTimeout(function(){
					var scrollPos = option.height ? self.$scroller.prop('scrollTop') : $window.scrollTop();
					if(self.state._vspLastTop === scrollPos) return;
					self.state._vspLastTop = scrollPos;
					if(self._noData()) {
						return;
					}
					var vscroll = self._vscrollInfo();
					var rowPaddingVal = $.isNumeric(self.option.rowPadding) ? self.option.rowPadding : self.option.paging.perPage;
					if(vscroll && !(self.option.rowPadding && self.state.data.length < rowPaddingVal)) {
						var $c = self.$tablebody.children('[data-alopexgrid-dataid]');

						var from = [Number($c.eq(0).attr('data-alopexgrid-dataindex'))
							,Number($c.eq(-1).attr('data-alopexgrid-dataindex'))+1];
						var to = [vscroll["startDataIndex"], vscroll['endDataIndex']+1];

						if(false && (from[1] < to[0] || to[1] <= from[0])) { //그려지는 범위에서 완전히 벗어남
							self._dataDraw();
							self.viewUpdate();
						} else {
							refreshVscrollBody(self.$tablebody, $c, null, self, vscroll, from, to, null);//to get full rowheight, render full row cells.
							self._tableSpacing(vscroll["paddingTopHeight"], vscroll["paddingBottomHeight"]);
							if(self.state.hasFixColumn) {
								var newtop = self.option.height ? (-vscroll["scrollTop"]+vscroll["paddingTopHeight"])
									: vscroll["paddingTopHeight"];
								if(option.floatingHeader===false) newtop += self.state.scrollerTopMargin;
								var $fbody = self.state.$fixcoltable.children('tbody');
								var $fc = $fbody.children('[data-alopexgrid-dataid]');
								refreshVscrollBody($fbody, $fc, self.$tablebody, self, vscroll, from, to,
									{"styleclass":"cloned-row","columnLimit":self.state.fixupto});
								self.state.$fixcoltable ? self.state.$fixcoltable.attr('data-vscroll-top', vscroll["paddingTopHeight"]) : "";
								self.state.$fixcoltable ? self.state.$fixcoltable.css('top', newtop+"px") : "";
								self.state.$fixednobody ? self.state.$fixednobody.css('top', newtop+"px") : "";
								self.$tablebody.children().each(setRowDataHeight);
								self.$tablebody.find('.cell-fixcol').html('&nbsp;');
								setTimeout(function(){
									if(self.state.$fixcolwrap) {
										self.state.$fixcolwrap.css('height', self.$scroller.prop('clientHeight')+"px");
									}
								},0);
							}
						}
						//TODO 가상스크롤 시점 지원
//						var $body = self.state.$fixcoltable.children('tbody');
//						console.log('to',to);
//						console.log('actual to',$body.children().eq(0).attr('data-alopexgrid-dataindex'),
//								$body.children().eq(-1).attr('data-alopexgrid-dataindex'),'(to-1)')
					}
					self.state._vspTimer = null;
				},50);
			});
		}
		//*/
	};

	function setRowDataHeight(idx,row) {
		var $r = $(row);
		if($r.data('dataHeight')){
			$r.css('height',$r.data('dataHeight'));
			$r.removeData('dataHeight');
		}
	}
	function getRowHeight(self, $row) {
		var rowspanned = !!self.state.rowspanned;
		var before = $row.css('height');
		$row.css('height','');
		var height = $row.outerHeight();//(rowspanned && !isIE) ? $child.filter(function(){return Number(this.rowSpan||1)<2;}).outerHeight() :$row.height();
		if(isIE<10 && ieVER<10 && rowspanned) {
			var $child = $row.children();
			var rchild = $child.map(function(idx,el){
				return el.rowSpan > 1 ? el.rowSpan : null;
			});
			height = Math.round(height / Number(rchild[0] || 1));
		}
		$row.css('height', before);
		return height+(self.option.rowHeightCompensate||0);
	}
	/**
	 * 가상스크롤을 적용하는 table body에 대한 refresh를 수행한다.
	 */
	function refreshVscrollBody($body, $children, $orgbody, self, vscroll, from, to, op) {
		//to[0]~min(from[0],to[1]) prepend
		//max(from[1],to[0])~to[1] append
		//from[0]~to[0] delete
		//to[1]~from[1] delete
		var $deleteme = $();
		if(to[0] > from[0]) { //앞부분 삭제 대상 존재
			var deleteto = to[0] - from[0];
			$deleteme = $deleteme.add($children.slice(0,deleteto));
		}
		if(from[1] > to[1]) { //뒷부분 삭제 대상 존재
			var deletefrom = to[1] - from[0];
			$deleteme = $deleteme.add($children.slice(deletefrom<0?0:deletefrom));
		}
		if($deleteme.length) {
			$deleteme.remove();
		}
		var $orgchildren = null;
		if($orgbody) {
			$orgchildren = $orgbody.children('[data-alopexgrid-dataid]');
		}
		var rowop = $.extend({},{"css":{}},op);
		var prepends = [];
		for(var i=to[0],l=_min(from[0],to[1]);i<l;i++) {
			if($orgbody) {
				var $orow = $orgchildren.eq(i-to[0]);
				var h = getRowHeight(self, $orow)+"px";
				rowop["css"]["height"] = h;
				$orow.data("dataHeight",h);
			}
			prepends.push(self._rowRender(self.state.data[i],
				i,//self.state.data[i]._index.data,
				i,//self.state.data[i]._index.data,
				rowop
			));
		}
		if(prepends.length) {
			$body.prepend(_convertAlopex.call(self, prepends.join('')));
		}
		var appends = [];
		for(var i=_max(from[1],to[0]),l=to[1];i<l;i++) {
			if($orgbody) {
				var $orow = $orgchildren.eq(i-to[0]);
				var h = getRowHeight(self, $orow)+"px";
				rowop["css"]["height"] = h;
				$orow.data("dataHeight",h);
			}
			appends.push(self._rowRender(self.state.data[i],
				i,//self.state.data[i]._index.data,
				i,//self.state.data[i]._index.data,
				rowop
			));
		}
		if(appends.length) {
			$body.append(_convertAlopex.call(self, appends.join('')));
		}
	}

	/** Virtual Scroll
	 * 가상스크롤이 정상 동작하도록 관련 로직을 등록하고, 이벤트 발생에 따라 row의 추가, 전체높이제어가
	 * 가능하도록 처리한다. dataDraw, dataAdd와 연동하여 동작하도록...?
	 * vsp가 별도로 처리해야 할 업무는? dataDraw, dataAdd등에 연동해야 하는 부분은?
	 * updateOption쪽이 처리할 수 있는 부분은?
	 * dataDraw쪽이 가지는 로직, dataAdd가 가지는 로직, 중복구현되는 부분/재활용 가능한 부분?
	 * state.rendered 어레이에 대한 의존도, 무결성문제.
	 */
	AlopexGrid.prototype._calcRowHeight = function() {
		var self = this;
		self.state.rowHeight = (self.state.data.length && (self.state.rowHeight === undefined || !self.state.rowHeight))
			//? self.$tablebody.children().height() : self.state.rowHeight;
			? getRowHeight(self,self.$tablebody.children().eq(0)) : self.state.rowHeight;
		if(!self.state.rowHeight) {
			var rowstring = self._rowRender(self.state.emptyData, null, null,{"styleclass":"temprow1","disableRowspan":true,"catchError":true});
			self.$tablebody.append(rowstring+rowstring);
			var $trow = self.$tablebody.find('.temprow1');
			var $tcell = $trow.children();
			self.state.rowHeight = getRowHeight(self, $trow.eq(0));
			self.state.rowHeightBorderWidth = _max(
				_max(parseInt($trow.css('borderTopWidth')),parseInt($trow.css('borderBottomWidth'))),
				_max(parseInt($tcell.css('borderTopWidth')),parseInt($tcell.css('borderBottomWidth')))
			);
			$trow.remove();
		}
		return self.state.rowHeight;
	};
	AlopexGrid.prototype._tableSpacing = function(top, bottom) {
		var self = this;
		var spacing = 500 * 1000;//IE는 1,342,177px이상의 값을 스타일로 쓸 수 없다.
		if(top === 0) {
			self.$tablespacertop.empty();
		} else {
			self.$tablespacertop.children().each(function(idx) {
				if(top >= 0) {
					this.style.height = (top-spacing>=0?spacing:top)+"px";
					top -= spacing;
				} else {
					//$(this).remove();
					self.$tablespacertop[0].removeChild(this);
				}
			});
			while(top >= 0) {
				$('<div>').css("height",(top-spacing >= 0 ? spacing : top)+"px").appendTo(self.$tablespacertop);
				top -= spacing;
			}
		}
		if(bottom === 0) {
			self.$tablespacerbottom.empty();
		} else {
			self.$tablespacerbottom.children().each(function(idx) {
				if(bottom >= 0) {
					this.style.height = (bottom-spacing>=0?spacing:bottom)+"px";
					bottom -= spacing;
				} else {
					//$(this).remove();
					self.$tablespacerbottom[0].removeChild(this);
				}
			});
			while(bottom >= 0) {
				$('<div>').css("height",(bottom-spacing>=0?spacing:bottom)+"px").appendTo(self.$tablespacerbottom);
				bottom -= spacing;
			}
		}
	};
	AlopexGrid.prototype._vscrollInfo = function(){
		var self = this;
		var option = self.option;
		if(!option.virtualScroll) {
			return false;
		}
		self._calcRowHeight();
		if(!self.state.rowHeight) {
			return false;
		}

		var info = {};
		var buflen = self.option.virtualScrollPadding;
		var rendered = $.isArray(self.state.rendered);

		var startIndex = 0;
		var endIndex = self.state.rendered.length-1;
		
		info["totalLength"] = rendered ? self.state.rendered.length : 0;
		info["rowHeight"] = self.state.rowHeight;
		info["scrollerClientHeight"] = self.$scroller.prop('clientHeight');
		info["totalHeight"] = info["totalLength"] * info["rowHeight"] + 1;
		
		if(!option.height) {
			buflen += 5;
			var wheight = $window.height();
			var wscrolltop = $window.scrollTop();
			var rofftop = self.$root.offset().top;
			
			info["scrollTop"] = wscrolltop > rofftop ? _min(wscrolltop - rofftop, info["totalHeight"]) : 0;
			if(wscrolltop <= rofftop && rofftop <= wscrolltop+wheight) { //윈도우 안에 걸쳐있음
				info["visibleHeight"] = _min(wheight - (rofftop - wscrolltop),info["totalHeight"]);
			} else if(rofftop < wscrolltop && wscrolltop < rofftop+info["totalHeight"]) { //윈도우 위로 걸쳐있음.
				info["visibleHeight"] = _min(info["totalHeight"] - (wscrolltop - rofftop),wheight);
			} else {
				info["visibleHeight"] = 0;
			}
		} else {
			info["scrollTop"] = self.$scroller.prop('scrollTop');
			info["visibleHeight"] = info["scrollerClientHeight"];
		}

		startIndex = Math.floor(info["scrollTop"] / info["rowHeight"]);
		if(startIndex < 0) startIndex = 0;
		endIndex = Math.floor(startIndex + info["visibleHeight"]/info["rowHeight"]);
		startIndex -= buflen;
		endIndex += buflen;
		
		if(startIndex < 0) startIndex = 0;
		if(endIndex >= info["totalLength"]) endIndex = info["totalLength"]-1;
		if(endIndex < startIndex) endIndex = startIndex;
		
		if(self.state.rowspanned) {
			for(var i=0,l=self.state.rowspanindex.length;i<l;i++) {
				if(self.state.rowspanindex[i]) {
					var mapping = _getMappingFromColumnIndex(self.option.columnMapping, i);
					if(!mapping || $.isPlainObject(mapping.rowspan)) continue;
					var key = mapping.key;
					//rowspan된만큼 범위를 상하로 확장.
					while(startIndex > 0 && self.state.data[startIndex][key] === self.state.data[startIndex-1][key]) {
						startIndex--;
					}
					while(endIndex < info["totalLength"]-1 && self.state.data[endIndex][key] === self.state.data[endIndex+1][key]) {
						endIndex++;
					}
					break;
				}
			}
		}

		info["startIndex"] = startIndex;
		info["endIndex"] = endIndex;
		info["startDataIndex"] = rendered ? self.state.rendered[startIndex] : null;
		info["endDataIndex"] = rendered ? self.state.rendered[endIndex] : null;
		info["renderLength"] = endIndex - startIndex + 1;

		info["paddingTopLength"] = startIndex;
		info["paddingBottomLength"] = (info["totalLength"]-1)-endIndex;
		info["paddingTopHeight"] = startIndex * info["rowHeight"];
		info["paddingBottomHeight"] = info["paddingBottomLength"] * info["rowHeight"];

		if((!info["paddingTopLength"] && !info["paddingBottomLength"]) || info["totalLength"] < 50){
			info["need"] = false;
		}

		return info;
	};

	//현재 그려진 col width는 실제 col width값의 몇배인가를 확인.
	AlopexGrid.prototype._colRatio = function(force) {
		var $table = this.$table;
		var colsum = 0;
		var tablewidth = force ? $table.width() : Number(this.state.tableWidth);//$table.width();
		$(this.option.columnMapping).each(function(idx, mapping) {
			var width = null;
			if (mapping.columnIndex === null || mapping.columnIndex === undefined || mapping.hidden === true)
				return;
			if (typeof mapping.width == "string") {
				width = Number(mapping.width.split("px")[0]);
			} else if (typeof mapping.width == "number") {
				width = mapping.width;
			}
			if (width !== null) {
				colsum += width;
			} else {
				colsum = null;
				return false;
			}
		});
		var ratio = 1;
		if (!colsum) {
			ratio = 1;
		} else if (colsum < tablewidth) {
			ratio = tablewidth / colsum;
		}
		return ratio;
	};

	AlopexGrid.prototype.scrollOffset = function(){
		return this._scrollOffset();
	};
	AlopexGrid.prototype._scrollOffset = function(merge) {
		var self = this;
		var offset = merge ? merge : {};
		offset["scrollTop"] = this.option.scroll ? self.state.lastScrollTop : 0;//this.$scroller[0].scrollTop : 0;
		offset["scrollLeft"] = this.option.scroll ? self.state.lastScrollLeft : 0;//this.$scroller[0].scrollLeft : 0;
		return offset;
	};

	AlopexGrid.prototype._autoResizeSet = function(set) {
		var self = this;
		var $window = $(window);
		if (self.state.resizeTimeout !== null && self.state.resizeTimeout !== undefined) {
			clearTimeout(self.state.resizeTimeout);
			self.state.resizeTimeout = null;
		}
		$window.off(".alopexgridresize" + self.key);
		if (set === false || (self.option.width && self.option.height)) {//높이, 너비가 지정되어 있는 경우 필요 없다.
			return;
		}
		var resizeHandler = function() {
			if (self.state.resizeTimeout !== null && self.state.resizeTimeout !== undefined) {
				clearTimeout(self.state.resizeTimeout);
				self.state.resizeTimeout = null;
			}
			//IE에서 resize즉시 업데이트를 수행할 경우, 실제 크기와 맞지 않게 처리가 되는 케이스가 발생함.
			self.state.resizeTimeout = setTimeout(function() {
				if ($window.height() != self.lastWindowHeight || $window.width() != self.lastWindowWidth) {
					//IE8의 window resize 무한루프 버그
					//http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
					self.lastWindowHeight = $window.height();
					self.lastWindowWidth = $window.width();
					//self._dataDraw()
					self._showProgress(function() {
						var soffset = self._scrollOffset();
						self.viewUpdate(soffset);
					});
				}
			}, 200);
		};
		$window.on("resize.alopexgridresize" + self.key, resizeHandler);
	};
	AlopexGrid.prototype._updateColgroup = function() {
		var option = this.option;
		var $colgroup = this.$colgroup;
		var $colchild = $colgroup.children('col');
		var expectedWidth = 0;
		for ( var i in option.columnMapping) {
			var mapping = option.columnMapping[i];
			if (mapping.columnIndex === null || mapping.columnIndex === undefined || mapping.hidden===true)
				continue;
			if (mapping.width) {
				$colchild.filter('[data-alopexgrid-columnIndex="'+mapping.columnIndex+'"]').css('width', mapping.width);
				expectedWidth += Number(mapping.width.split('px')[0]);
			}
		}
		if (expectedWidth) {
			this.state.tableWidth = expectedWidth;
		}
	};

	AlopexGrid.prototype._cellRender = function(data, mapping, option) {
		var self = this;
		var dataIndex = option && option.dataIndex !== undefined ? option.dataIndex : (data && data._index ? data._index.data : 0);
		var rowspanned = false;
		var rowspan = '';
		if (mapping.rowspan && this.state.rowspanned && !(option && option.disableRowspan)) {
			var rindex = this.state.rowspanindex[Number(mapping.columnIndex)] || this.state.rowspanindex[Number(mapping.rowspan.by)];
			//data._index.data 위치의 데이터가 가 포함이 되는지를 비교.
			if (rindex) {
				//포함이 되는지를 검사한다.
				var result = _rowspanned(rindex, data._index.data);
				if (typeof result == "number") {//자기자신부터 일 경우 값을 직접 작성.
					var index = _rowspanned(rindex, data._index.data, true);
					if (Number(index.to) > Number(this.state.rendered[this.state.rendered.length - 1])) {
						//span이 그려진 rows밖으로 삐져나갈 경우 rowpadding에 의해 망가질 수 있음. 정확히 맞도록 제어.
						result = Number(this.state.rendered[this.state.rendered.length - 1]) - Number(index.from) + 1;
					}
					//rowspan = ' rowspan="'+result+'"';
					rowspan = result;
				} else if (result) {//앞 데이터가 렌더링 대상인가/중간부터 렌더링 되었는가/중간부터 렌더링 해야 하는가.
					var index = _rowspanned(rindex, data._index.data, true);
					var from = index.from;
					var to = index.to;
					//from이 this.state.rendered[]에 포함되어 있을경우 rowspanned = true
					//from이 없을 경우 from~to-1사이에 최초로 등장하는 셀인경우 rowspan값을 짧게 해서 생성
					//from이 없을 경우 최초 등장셀이 아닐 시 rowspanned = true
					for ( var i in this.state.rendered) {
						if (Number(this.state.rendered[i]) === Number(from)) {
							rowspanned = true;
							break;
						}
					}
					if (!rowspanned) {
						//from10 to 16(10에서 15)인데 rendered는 12부터 시작하는 경우, 12부터 16까지 해당하는 rowspan이 일어나야 한다.
						//16-10에서, 16-12로 rowspan size가 변경됨. 
						if (Number(this.state.rendered[0]) === Number(data._index.data)) {
							//rowspan = ' rowspan="' + (to - Number(data._index.data)) + '"';
							rowspan = (to - Number(data._index.data));
						} else {
							rowspanned = true;
						}
					}
				}
			}
		}
		if (rowspanned) {
			return '';
		}

		var cell = {
			tag: "td",
			attr: {
				styleclass: "cell bodycell"
			}
		};
		if (option && option.styleclass) {
			cell.attr.styleclass += (" " + option.styleclass);
		}
		if(mapping.columnIndex === self.state.maxColumnIndex) {
			cell.attr.styleclass += " lastcell lastcolumn";
		}
		if(option && option.pinned) {
			cell.attr.styleclass += " pinnedcell";
		}
		if(self.option.highlightLastAction && data._index.id === self.state.lastActionRowId && mapping.columnIndex === self.state.lastActionColumnIndex) {
			cell.attr.styleclass += ' '+self.option.lastActionCellClass;
		}
		if (mapping.scope) {
			cell.attr.scope = 'row';
		}
		if (mapping.styleclass) {
			var cl = mapping.styleclass;
			if($.isFunction(cl)) {
				cl = cl(data[mapping.key], data, mapping) || "";
			}
			if(cl) {
				cell.attr.styleclass += (" " + cl);
			}
		}
		if (mapping.selectorColumn) {
			cell.attr.styleclass += " selector-column";
		}
		if (this.state.fixupto >= 0 && Number(mapping.columnIndex) <= this.state.fixupto) {
			cell.attr.styleclass += (' cell-fixcol');
		}
		if (mapping.align) {
			cell.attr.styleclass += (' align-' + mapping.align);
		}
		if (mapping.columnIndex !== undefined) {
			cell.attr.styleclass += (' ' + (Number(mapping.columnIndex) % 2 ? 'cell-odd' : 'cell-even'));
		}
		if (mapping.highlight !== undefined) {
			var customclass = false;
			if ((typeof mapping.highlight == "function" && !!(customclass = mapping.highlight(data[mapping.key], data, mapping))) || mapping.highlight === true) {
				cell.attr.styleclass += (' cell-highlight');
			}
			if (typeof customclass == "string") {
				cell.attr.styleclass += (' ' + customclass);
			}
			if(typeof mapping.highlight === "string") {
				cell.attr.styleclass += (' ' + mapping.highlight);
			}
		}
		if(mapping.key && data._original && data._original[mapping.key] !== data[mapping.key]) {
			cell.attr.styleclass += ' cell-edited';
		}
		if ($.isPlainObject(mapping.attr)) {
			for ( var prop in mapping.attr) {
				cell.attr[prop] = (cell.attr[prop] ? (cell.attr["prop"] + ' ') : "") + mapping.attr[prop];
			}
		}
		if (option && typeof option.attr == "object") {
			for ( var prop in option.attr) {
				cell.attr[prop] = option.attr[prop];
			}
		}
		if(self.option.enableTabFocus) {
			cell.attr["tabindex"] = "0";
			_addEventAttribute(cell, 'onkeydown', "AlopexGrid.run('" + self.key + "','_cellFocusMove',this,event,null,'"+data._index.id+"');");
		}
		if (rowspan) {
			if (rowspan > this.state.rendered.length) {
				rowspan = this.state.rendered.length;
			}
			if (rowspan > 0) {
				cell.attr.styleclass += " cell-rowspan-column";
				if (mapping.scope) {
					cell.attr.scope = 'rowgroup';
				}
			}
			if(rowspan > 1) {
				cell.attr["rowspan"] = rowspan;
				cell.attr.styleclass += " cell-rowspan";
			}
		}
		cell.attr["data-alopexgrid-columnindex"] = mapping.columnIndex;//mapping.columnIndex;
		if(mapping.key) {
			cell.attr["data-alopexgrid-key"] = mapping.key;
		}

		var content = null;
		var multiTemp = null;
		if (mapping.numberingColumn) {
			var number = (Number(dataIndex) + 1);
			if (this.state.rowspanned && mapping.rowspan) {
				var rowspanindex = this.state.rowspanindex[mapping.columnIndex] || this.state.rowspanindex[mapping.rowspan.by];
				if (mapping.rowspan && this.state.rowspanned && this.state.rowspanindex.length && rowspanindex) {
					var rindex = _rowspanned(rowspanindex, dataIndex, true);
					number = rindex.index;
				}
			}
			if(cell.attr["styleclass"].indexOf('align-') < 0) {
				cell.attr["styleclass"] += " align-center";
			}
			content = {
				tag: "div",
				attr: {
					styleclass: "numbering-column-wrapper",
					style: "text-align:center;"
				},
				child: number
			};
		} else if (mapping.selectorColumn) {
			if(cell.attr["styleclass"].indexOf('align-') < 0) {
				cell.attr["styleclass"] += " align-center";
			}
			content = {
				tag: "div",
				attr: {
					styleclass: "selector-column-wrapper",
					style: "text-align:center;"
				},
				child: {
					tag: "input",
					attr: {
						type: "checkbox",
						styleclass: "selector-checkbox",
						name: _generateUniqueId()
					}
				}
			};
			if (data._state && data._state.selected) {
				content.child.attr.checked = "checked";
			}
			if(self.option.useTabindexOnEditable) {
				var tabindex = data._index.data * self.option.columnMapping.length + mapping.columnIndex;
				content.child.attr.tabindex = tabindex;
			}
			if(dataChangeCallback(self, "select", [data, data._state.selected]) === false || (option && option.disableSelect)) {
				content.child.attr.disabled = "disabled";
				delete content.child.attr.checked;
			}
		} else if (data._state && data._state.editing && mapping.editable
			&& !(typeof mapping.allowEdit == "function" && !mapping.allowEdit(data[mapping.key], data, mapping))) {
			var renderer = mapping.editable === true ? {
				type: "text"
			} : mapping.editable;
			cell.attr.styleclass += " editingcell";
			if(self.option.directEdit && mapping.editable === true) {
				content = _escapeHTML(data[mapping.key]);
				cell.attr["contentEditable"] = "true";
			} else {
				content = _renderValue.call(self, renderer, data[mapping.key], data, mapping);
			}
		} else if (($.isFunction(mapping.multi) && $.isArray(multiTemp=mapping.multi.call(self, value, data, mapping))) 
				|| $.isArray(mapping.multi)) {
			var newtable = {tag:"table",attr:{styleclass:"table inside"},child:{tag:"tbody",attr:{styleclass:"table-body"},child:[]}};
			var newbody = newtable.child.child;
			var multiList = multiTemp || mapping.multi;
			for(var mi in multiList) {
				newbody.push('<tr class="row bodyrow" data-alopexgrid-dataid="',data._index.id,'" data-alopexgrid-dataindex="',data._index.data,'">');
				newbody.push(self._cellRender(data, $.extend({},multiList[mi],{columnIndex:mapping.columnIndex}), option));
				newbody.push('</tr>');
			}
			cell.attr.styleclass += ' multi';
			content = newtable;
		} else {
			var renderer = mapping.render;
			if(self.option.readonlyRender && $.isPlainObject(renderer)) {
				renderer.readonly = true;
			}
			var result = "&nbsp;";
			var val = data[mapping.key];
			result = mapping.render ? _renderValue.call(self, renderer, val, data, mapping) :
				((data.hasOwnProperty(mapping.key) && val !== undefined) ? (self.option.disableValueEscape ? val : _escapeHTML(val)) : '&nbsp;');
			//in normal rendering mode without mapping.render option, escape value string.
			content = result;
		}

		if (data._state.editing && mapping.editable && !data._state.deleted) {
			//TODO input/select등에서 직접 수정되는것도 반영할 수 있도록 해야 한다.
			//"string".replace(/(<input |<select |<textarea )/g, '$1onclick="alert();" ')
			var event = "AlopexGrid.run('" + this.key + "','_cellEditUpdate',this,'" + data._index.id + "','" + (mapping.key) + "',event);";
			if(self.option.directEdit && mapping.editable === true) {
				cell.attr["onkeyup"] = event;
			} else {
				var total = "$1";
				$.each([' onkeyup', ' onclick', ' onchange'], function(i, evt) {
					total += (evt + '="' + event + '"');
				});
				if (typeof content === "string") {
					content = content.replace(/(<input|<select|<textarea)/g, total);
				}
			}
			
			if(self.option.useTabindexOnEditable) {
				var tabindex = data._index.data * self.option.columnMapping.length + mapping.columnIndex;
				var tabindexattr = '$1 tabindex="'+tabindex+'"';
				if(typeof content === "string") {
					content = content.replace(/(<input|<select|<textarea)/g, tabindexattr);
				}
			}
		}

		if(typeof content !== "number" && !content) {
			content = '&nbsp;';
		}
		var doellipsis = self.option.ellipsisText && !cell.attr["contentEditable"] ? "text-overflow:ellipsis;":"";
		if (mapping.align && self.option.wrapCellOnAlign) {
			//항상 cell data를 cell-wrapper로 감싸도록 한다.
			//<div class="cell-wrapper">
			cell.child = {
				tag: "div",
				attr: {
					"styleclass": "cell-wrapper",
					"style" : doellipsis
				},
				child: content
			};
		} else {
			cell.child = content;
			cell.attr.style = (cell.attr.style || "") + doellipsis;
		}

		if(!self.option.disableCellTitle && mapping && mapping.key && data && mapping.tooltip !== false) {
			//td.cell[title] functionality
			var value = data[mapping.key];
			var title = value;
			if($.isFunction(mapping.tooltip)) {
				title = mapping.tooltip(value, data, mapping) || "";
			} else if(typeof mapping.tooltip === "string") {
				title = mapping.tooltip;
			} else if($.isPlainObject(mapping.tooltip)) {
			}
			cell.attr["title"] = AlopexGrid.escapeHTML(title || "");
		}

		if(mapping && mapping.colspan) {
			var colspanval = Number($.isNumeric(mapping.colspan) ? mapping.colspan :
				($.isFunction(mapping.colspan) ? mapping.colspan(data[mapping.key], data, mapping) : null));
			if(colspanval > 1) {
				cell.attr["colspan"] = String(colspanval);
			}
		}
		return _generateHTML(cell);
	};
	function _getCurrentData(data) {
		if (data._state && data._state.recent) {
			var recent = data._state.recent;
			data = $.extend({}, data, recent);
		}
		return data;
	}
	AlopexGrid.prototype._rowRender = function(data, dataIndex, rowIndex, option) {
		var self = this;
		if (!data) {
			return;
		}
		data = _getCurrentData(data);
		if ((dataIndex === undefined || dataIndex === null) && data._index && data._index.data !== undefined) {
			dataIndex = Number(data._index.data);
		}
		if ((rowIndex === undefined || rowIndex === null) && (rowIndex = $.inArray(data._index.data, self.state.rendered))>=0) {
			//rowIndex = Number(data._index.row);
		}
		var columnLimit = (option && option.columnLimit !== undefined) ? option.columnLimit : null;
		var row = {
			tag: "tr",
			attr: {
				"styleclass": "row bodyrow",
				"data-alopexgrid-dataindex": dataIndex,
				"data-alopexgrid-dataid": data._index.id
			},
			child: []
		};
		$.each(["selected", "editing", "edited","deleted","added","focused"], function(idx, st) {
			if (data._state && data._state[st]) {
				row.attr.styleclass += (' ' + st);
			}
		});
		if(!$.isEmptyObject(self.option.rowOption)) {
			var rop = self.option.rowOption;
			if(rop.highlight) {
				var customclass = false;
				if ((typeof rop.highlight == "function" && !!(customclass = rop.highlight(data, rop))) || rop.highlight === true) {
					row.attr.styleclass += (' row-highlight');
				}
				if (typeof customclass == "string") {
					row.attr.styleclass += (' ' + customclass);
				}
				if(typeof rop.highlight === "string") {
					cell.attr.styleclass += (' ' + rop.highlight);
				}
			}
			if (rop.styleclass) {
				var cl = rop.styleclass;
				if($.isFunction(cl)) {
					cl = cl(data, rop) || "";
				}
				if(cl) {
					row.attr.styleclass += (" " + cl);
				}
			}
		}
		if (typeof dataIndex == "number") {
			if(!(option && option.disableOddEven)) {
				var odd = dataIndex % 2;
				if (this.state.rowspanned) {
					var rindex = _rowspanWidestIndex(this.state.rowspanindex, dataIndex);
					if (!rindex) {//XXX
						rindex = {
							index: 0
						};
					}
					odd = (rindex.index + 1) % 2;
				}
				row.attr.styleclass += odd ? ' row-odd' : ' row-even';
			}
		}
		if (option && option.styleclass) {
			var cs = [];
			if (typeof option.styleclass == "string") {
				cs.push(option.styleclass);
			} else if($.isArray(option.styleclass)) {
				cs = cs.concat(option.styleclass)
			}
			row.attr.styleclass += (' ' + cs.join(' '));
		}
		if(self.option.highlightLastAction && data._index.id === self.state.lastActionRowId) {
			row.attr.styleclass += ' ' + self.option.lastActionRowClass;
		}
		if(option && option.pinned) {
			row.attr.styleclass += " pinnedrow";
		}
		if (option && typeof option.css == "object") {
			row.attr.style = "";
			for ( var prop in option.css) {
				row.attr.style += (prop + ':' + option.css[prop] + ';');
			}
		}
		if (self.option && self.option.useClassHovering && !(option && option.pinned)) {
			_addEventAttribute(row, 'onmouseleave', "AlopexGrid.run('" + self.key + "','_hoverLeave',this,event);");
			_addEventAttribute(row, 'onmouseenter', "AlopexGrid.run('" + self.key + "','_hoverEnter',this,event);");
		}
		if (!(option && option.disableSelect) && (self.option.rowClickSelect || self.state.hasSelectorColumn)) {
			if(isAlopexMobile) {
				_addEventAttribute(row, 'data-gridtap', "AlopexGrid.run('" + self.key + "','rowSelect',this,'toggle',event);");
			} else {
				_addEventAttribute(row, 'onclick', "AlopexGrid.run('" + self.key + "','rowSelect',this,'toggle',event);");
			}
		}
		if (self.state.hasAllowEdit && data._state.editing) {
			var evt = "AlopexGrid.run('" + self.key + "','_allowEditProcess',this);";
			_addEventAttribute(row, 'onclick', evt);
			_addEventAttribute(row, 'onchange', evt);
			_addEventAttribute(row, 'onkeyup', evt);
		}
		if(!self.option.disableFocusedState) {
			_addEventAttribute(row, 'onclick', "AlopexGrid.run('" + self.key + "','_rowFocus',this);");
		}

		var lastcolumn = -1;
		for ( var idx in this.option.columnMapping) {
			//var mapping = $.extend(true, {}, this.option.columnMapping[idx]);
			var mapping = this.option.columnMapping[idx];
			if (!mapping.hasOwnProperty('columnIndex')) {
				continue;
			}
			var columnIndex = mapping.columnIndex;
			if (mapping.columnIndex === null || mapping.columnIndex === undefined  || mapping.hidden === true) {
				continue;
			}
			columnIndex = Number(columnIndex);
			if(isNaN(columnIndex)) {
				continue;
			}
			if (typeof columnLimit == "number" && columnIndex > columnLimit) {
				//고정컬럼과 같은 렌더링 상황에서 최대 렌더링되는 컬럼을 제한.
				continue;
			}
			if(option && typeof option.emptyTo == "number" && columnIndex <= option.emptyTo) {
				//특정 컬럼을 비우고서 렌더링 할 때.
				var lastcell = "";
				if(columnIndex === self.state.maxColumnIndex) {
					lastcell = " lastcell";
				}
				row.child.push('<td class="cell bodycell'+lastcell+
					//' cell-fixcol emptied" data-alopexgrid-columnindex="'+columnIndex+'">&nbsp;</td>');
					' cell-fixcol emptied" data-alopexgrid-columnindex="'+mapping.columnIndex+'">&nbsp;</td>');
				continue;
			}
			/*
			 if (columnIndex - lastcolumn > 1) {
			 for (var i = 0; i < (columnIndex - lastcolumn - 1); i++) {
			 //columnIndex가 비어있을 경우 빈 셀로 채운다.
			 //rendered.push('<td class="cell bodycell">&nbsp;</td>');
			 row.child.push('<td class="cell bodycell">&nbsp;</td>');
			 }
			 }
			 //*/
			var allowed = "";
			if (typeof mapping.allowEdit == "function") {
				allowed = !!mapping.allowEdit(data[mapping.key], data, mapping) ? "allow-valid" : "allow-invalid";
			} else {
				allowed = "";
			}
			var celloption = $.extend({},option);
			celloption.dataIndex = dataIndex;
			celloption.styleclass = allowed;
			var cellrender = "";
			if(option && option["catchError"] === true) {
				var e;
				try {
					cellrender = this._cellRender(data, mapping, celloption);
				} catch(e) {

				}
			} else {
				cellrender = this._cellRender(data, mapping, celloption);
			}
			row.child.push(cellrender);
//			lastcolumn = columnIndex;
		}

		var removalCount = 0;
		for(var i=0;i<row.child.length;i++) {
			//mapping.colspan
			var cell = row.child[i];
			if(removalCount > 0) {
				row.child[i] = "";
				removalCount--;
			} else if(cell && cell.indexOf('colspan') >= 0) {
				removalCount = Number($(cell).attr('colspan'))-1;
			}
		}
		if(option && option.returnRaw) {
			return row;
		}
		return _generateHTML(row);
	};
	AlopexGrid.prototype._redrawRow = function($row, data) {
		var self = this;
		//$row.hasClass('cloned-row')
		var dataIndex = null;
		if(!data) {
			dataIndex = $row.attr('data-alopexgrid-dataindex');
			if(!_valid(dataIndex)) {
				return;
			}
			dataIndex = Number(dataIndex);
			if(isNaN(dataIndex)) {
				return;
			}
			data = self.state.data[dataIndex];
		} else {
			dataIndex = Number(data._index.data);
		}
		var $fixcolrow = null;
		if(self.state.hasFixColumn) {
			if($row.hasClass('cloned-row')) {
				$fixcolrow = $row;
				$row = self.$tablebody.children('[data-alopexgrid-dataindex="'+dataIndex+'"]');
			} else {
				$fixcolrow = self.state.$fixcolbody.children('[data-alopexgrid-dataindex="'+dataIndex+'"]');
			}
		}
		var rowIndex = typeof data._index.row === "number" ? data._index.row :
			$.inArray(dataIndex, self.state.rendered);
		var $newrow = $(_convertAlopex.call(self, self._rowRender(data, dataIndex, rowIndex, {})));
		var fi = self._focusInfo();
		$row.replaceWith($newrow);
		self._focusRestore(fi);
		var height = getRowHeight(self, $newrow) + "px";
		if($fixcolrow) {
			$fixcolrow.replaceWith(
				_convertAlopex.call(self,
					self._rowRender(data, dataIndex, rowIndex,
						{columnLimit:self.state.fixupto,"css":{"height":height},
							"styleclass" : "cloned-row"})
				)
			);
			$newrow.children('.cell-fixcol').html('&nbsp;');
		}
		$newrow.css("height",height);
		if(data._state.editing && !data._state._editableStarted) {
			self._refreshEditableCell(dataIndex, $newrow);
		}
	};
	function _getMappingFromColumnIndex(columnMapping, columnIndex) {
		var rmap = null;
		$.each(columnMapping, function(i,mapping) {
			if(mapping.columnIndex === null || mapping.columnIndex === undefined) return;
			if(Number(columnIndex) === Number(mapping.columnIndex)) {
				rmap = mapping;
				return false;
			}
		});
		return rmap;
	}
	function _getColumnKeyFromColumnIndex(columnMapping, columnIndex) {
		var key = null;
		$.each(columnMapping, function(i,mapping) {
			if(mapping.columnIndex === null || mapping.columnIndex === undefined) return;
			if(Number(columnIndex) === Number(mapping.columnIndex)) {
				key = mapping.key || null;
			}
		});
		return key;
	}
	AlopexGrid.prototype._headerRender = function(viewoption) {
		var self = this;
		var option = self.option;
		var headerMap = {child:[]};
		if(option.header) {

			var headerStacks = [];
			$.each(option.columnMapping, function(idx, mapping) {
				if(!_valid(mapping.columnIndex) || mapping.hidden===true) return;
				headerStacks[mapping.columnIndex] = [{colspan:1,rowspan:null,mapping:mapping}];
			});

			var headerGroup = null;
			if($.isArray(option.headerGroup)) {
				headerGroup = [];
				//컬럼이 감춰진경우 인덱스값을 보정
				$.each(option.headerGroup, function(idx, hg) {
					var g = $.extend({}, hg);
					var valid = false;
					//isColumnHidden(columnMapping, columnIndex)
					if (g.hasOwnProperty('fromIndex') && g.hasOwnProperty('toIndex')) {
						valid = true;
					} else if (g.hasOwnProperty('hideSubTitle')) {
						valid = true;
					}
					if (valid) {
						g._id = _generateUniqueId();
						headerGroup.push(g);
					}
				});

				function groupLength(mapping) {
					return mapping.toIndex - mapping.fromIndex +1;
				}
				if(self.option.headerGroupWiderFirst) {
					headerGroup.sort(function(f,l) {//put short ones in front.
						if(groupLength(f) > groupLength(l)) return 1;
						if(groupLength(f) < groupLength(l)) return -1;
						return 0;
					});
				} else {
					headerGroup.reverse();//stack headergroups in order.
				}
				var globalHideSubTitle = false;
				$.each(headerGroup, function(idx,group){
					if($.isPlainObject(group) && group.hideSubTitle === true
						&& !group.hasOwnProperty('fromIndex') && !group.hasOwnProperty('toIndex') ){
						//if headerGroup object was provided with only hideSubTitle property, all headerGroups
						//are affected as hideSubTitle:true
						globalHideSubTitle = true;
					}
				});
				$.each(headerGroup, function(idx,group){
					if(!$.isPlainObject(group)
						|| !group.hasOwnProperty('fromIndex')
						|| !group.hasOwnProperty('toIndex')) return;
					var hideSubTitle = globalHideSubTitle || group.hideSubTitle;
					var colspan = groupLength(group);
					if(colspan > 0) {
						if(!hideSubTitle) { //reserve for new row space
							for(var ci = group.fromIndex;ci<=group.toIndex;ci++) {
								if(!headerStacks[ci]) continue;
								headerStacks[ci].unshift(null);
							}
						} else {
							//clear cells under this group
							for(var ci = group.fromIndex;ci<=group.toIndex;ci++) {
								if(!headerStacks[ci]) continue;
								headerStacks[ci] = [];
							}
						}
						var actualColspan = 0;
						for(var ci=group.toIndex;ci>=group.fromIndex;ci--) {
							if(!headerStacks[ci]) continue;
							actualColspan++;
							if(ci === group.fromIndex) {
								headerStacks[ci][0] = {colspan:actualColspan,rowspan:null,mapping:group};
								fst = false;
							} else {
								headerStacks[ci][0] = null;
							}
						}
					}
				});
			}

			var rowcount = 0;
			for(var i=0;i<headerStacks.length;i++){
				if(!headerStacks[i]) continue;
				rowcount = _max(rowcount, headerStacks[i].length);
			}
			//ci = columnIndex, ri = row depth
			for(var ci=0;ci<headerStacks.length;ci++) {
				var headerStack = headerStacks[ci];
				if(!headerStack) continue;
				for(var ri=0;ri<headerStack.length;ri++) {
					var item = headerStack[ri];
					if(item && item.mapping && headerStack[ri+1] === undefined) {
						item.rowspan = rowcount - ri;
					}
				}
			}

			for(var i=0;i<rowcount;i++) {
				headerMap.child.push({tag:"tr",attr:{styleclass:"row header headerrow"},child:[]});
			}
			
			//Cell Creating Routine
			//ci - columnIndex, ri - row depth(row index)
			for(var ci=0;ci<headerStacks.length;ci++){
				var headerStack = headerStacks[ci];
				if(!headerStack) continue;
				for(var ri=0;ri<headerStack.length;ri++) {
					var item = headerStack[ri];
					if(!item || !item.mapping) continue;
					var mapping = item.mapping;
					var isGroup = (mapping.hasOwnProperty('hideSubTitle') || mapping.hasOwnProperty('fromIndex'));
					var columnIndex = mapping.columnIndex;
					var cell = {
						tag : "th", attr:($.extend({}, mapping.titleattr)),child:[]
					};
					cell.attr["styleclass"] = (cell.attr["styleclass"] || "") + " cell header headercell";
					if(mapping["styleclass"]) {
						cell.attr["styleclass"] += (" " + mapping["styleclass"]);
					}
					if(item.colspan > 1) {
						cell.attr["colspan"] = item.colspan;
					}
					if(item.rowspan > 1) {
						cell.attr["rowspan"] = item.rowspan;
					}
					if(_valid(mapping.columnIndex)) {
						cell.attr["data-alopexgrid-columnindex"] = mapping.columnIndex;//mapping.columnIndex;
					}
					if(((mapping.columnIndex || mapping.fromIndex) + item.colspan) > self.state.maxColumnIndex) {
						cell.attr["styleclass"] += " lastcolumn lastcell";
					}
					if(mapping.selectorColumn && !(typeof mapping.title === "string" && self.option.allowSelectorColumnTitle)) {
						var input = {tag:"input",attr:{type:"checkbox",name:_generateUniqueId()}};
						if (option.rowClickSelect === "only" || option.rowSingleSelect) {
							input.attr["disabled"] = "disabled";
						} else {
							_addEventAttribute(cell, 'onclick', "AlopexGrid.run('" + self.key + "','_rowSelectAll',event,this);");
						}
						if (self.state.selectAll) {
							input.attr["checked"] = "checked";
						}
						cell.child = input;
						_addClassAttribute(cell, 'selector-column');
					} else {
						cell.child.push(mapping.title || '&nbsp;');
					}
					if(isGroup) { 
						_addClassAttribute(cell, 'header-group');
					}
					if($.isArray(headerGroup)) {
						for ( var hi in headerGroup) {
							var hg = headerGroup[hi];
							var groupfidx = Number(hg.fromIndex);
							var grouptidx = Number(hg.toIndex);
							var mappingfidx = Number(mapping.columnIndex);
							var mappingtidx = Number(mapping.columnIndex);
							if(isGroup && hg._id !== mapping._id) {
								mappingfidx = Number(mapping.fromIndex);
								mappingtidx = Number(mapping.toIndex);
							}
							if (groupfidx <= mappingfidx && mappingtidx <= grouptidx) {
								_addClassAttribute(cell, 'header-group-sub');
								if(groupfidx === mappingfidx) {
									_addClassAttribute(cell, 'header-group-sub-first');
								}
								if(grouptidx === mappingtidx) {
									_addClassAttribute(cell, 'header-group-sub-last');
								}
							}
							if(mappingtidx === (groupfidx-1)) {
								_addClassAttribute(cell, 'header-before-group');
							}
						}
					}
					if(item.rowspan > 1) {
						_addClassAttribute(cell, 'header-group-rowspan');
						if(item.rowspan === rowcount) {
							_addClassAttribute(cell, 'header-group-rowspan-all');
						}
					}
					if (mapping.rowspan) {
						_addClassAttribute(cell, 'header-rowspan');
						if (mapping.rowspan == "always") {
							_addClassAttribute(cell, 'header-rowspan-always');
						}
						if (mapping.rowspan.by !== undefined) {
							_addClassAttribute(cell, 'header-rowspan-by');
						}
					}
					var sorting = mapping.sorting;
					var resizing = _readMappingProp(mapping, 'resizing');
					if(sorting || resizing) {
						var wrap = {
							tag: "div",
							attr: {
								styleclass: "relative-wrap"
							},
							child: [cell.child]
						};
						if (sorting && mapping.key) {
							_addClassAttribute(cell, 'sorting');
							if(option.hideSortingHandle!==true) {
								wrap.child.push({
									tag: "div",
									attr: {
										styleclass: "sorting-handle"
									}
								});
							}
							if (self.state && self.state.sortingColumn !== undefined) {
								if (Number(mapping.columnIndex) === Number(self.state.sortingColumn)) {
									var dir = self.state.sortingDirection || "asc";
									_addClassAttribute(cell, dir);
								}
							}
							_addEventAttribute(cell, 'onclick', "AlopexGrid.run('" + self.key + "','_sortToggle'," + columnIndex + ",null,event);");
						}
						if (resizing) {
							var handle = {
								tag: "div",
								attr: {
									styleclass: "resizing-handle"
								}
							};
							//AlopexGrid.run(self.key, "_columnResizeStart", event)
							_addEventAttribute(handle, 'onmousedown', "AlopexGrid.run('" + self.key + "','_columnResizeStart',event," + columnIndex + ");");
							_addClassAttribute(cell, 'resizing');
							wrap.child.push(handle);
						}
						cell.child = wrap;
					}
					headerMap.child[ri].child[ci] = cell;
				}
			}
		}
		if(self._hasFooter("top")) {
			headerMap.child.push(self._footerRowRender());
		}
		if(self._hasPinnedData()) {
			headerMap.child = headerMap.child.concat(self._pinnedRender());
		}
		var lastrow = headerMap.child[headerMap.child.length-1];
		if($.isPlainObject(lastrow)) {
			lastrow.attr = lastrow.attr || {};
			lastrow.attr.styleclass += " lastrow";
		}
		return _generateHTML(headerMap);
	};

	AlopexGrid.prototype._needEditedRefresh = function(){
		var self = this;
		self._footerRefresh();
		self._pinnedRefresh();
	};

	AlopexGrid.prototype._hasFooter = function(position) {
		var self = this;
		var option = self.option;
		if($.isPlainObject(option.footer) && $.isArray(option.footer.footerMapping)
				&& option.footer.footerMapping.length) {
			if(position && option.footer.position && option.footer.position !== position) {
				return false;
			}
			return true;
		}
		return false;
	};

	AlopexGrid.prototype._footerRowRender = function(columnLimit){
		var self = this;
		var option = self.option;
		if(self._hasFooter()) {
			option.footer.data = {};
			var footerRow = { tag: "tr", attr: { styleclass: "row footerrow" }, child : [] };
			for (var i = 0; i <= self.state.maxColumnIndex; i++) {
				if(!isMappingVisible(self.option.columnMapping[i])) continue;
				footerRow.child[i] = { tag : "td", child : "&nbsp;"
					, attr : {styleclass:"cell footercell"+(i===self.state.maxColumnIndex?" lastcell":"")}};
			}
			for(var i=0,l=option.footer.footerMapping.length; i<l; i++) {
				var mapping = option.footer.footerMapping[i];
				var value = self._footerValueByMapping(mapping);
				if(mapping.columnIndex === null || mapping.columnIndex === undefined) {
					continue;
				}
				if(self.isColumnHidden(mapping.columnIndex)) continue;
				var bodymapping = _getMappingFromColumnIndex(self.option.columnMapping, mapping.columnIndex);
				var footerCell = footerRow.child[bodymapping.columnIndex];
				footerCell.attr["data-alopexgrid-columnindex"] = mapping.columnIndex;//mapping.columnIndex;
				footerCell.attr["styleclass"] += (" alopex-columnindex-"+mapping.columnIndex);
				if(mapping.align) {
					footerCell.attr.styleclass += " align-"+mapping.align;
				}
				if(mapping.styleclass) {
					var classString = mapping.styleclass;
					if($.isFunction(classString)) {
						classString = classString(value, self.footerData(), mapping);
					}
					if(classString) {
						footerCell.attr["styleclass"] += ' ' + classString;
					}
				}
				footerCell.child = value;
			}
			return footerRow;
		}
		return null;
	};

	AlopexGrid.prototype._footerRefresh = function(){
		var self = this;
		var option = self.option;
		if(self._hasFooter()) {
			var $footerrows = self.$root.find('.footerrow');
			for(var i=0,l=option.footer.footerMapping.length; i<l;i++) {
				var footerMap = option.footer.footerMapping[i];
				var columnIndex = footerMap.columnIndex;
				var value = self._footerValueByMapping(footerMap);
				if(columnIndex === null || columnIndex === undefined) continue;
				$footerrows.find('.alopex-columnindex-'+columnIndex)
					.html(value);
			}
		}
	};
	function _addCommas(x) {
		var parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	}
	var _footerRenderer = {
		"sum" : function(param){
			var self = this;
			var key = _footerParamToKey(self, param);
			var sum = 0;
			var precision = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var value = self.state.data[i][key];
				if(!isNaN(Number(value))) {
					sum += Number(value);
					precision = _max(precision, (String(value).split(".")[1]||"").length);
				}
			}
			var m = Math.pow(10,precision);
			var result = _addCommas(Math.floor(sum));
			var uc = "";
			if(precision > 0) {
				uc = "." + String(Math.round(sum*m)).slice(-precision);
			}
			return result + uc;
		},
		"average" : function(param){
			var self = this;
			var key = _footerParamToKey(self, param);
			var sum = 0;
			var count = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var value = self.state.data[i][key];
				if(!isNaN(Number(value))) {
					sum += Number(value);
					count++;
				}
			}
			return _addCommas(!count ? 0 : Math.round(sum/count*10)/10);
		},
		"stdev" : function(param) {
			var self = this;
			var key = _footerParamToKey(self, param);
			var integral = 0;
			var sum = 0;
			var count = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var value = self.state.data[i][key];
				if(!isNaN(Number(value))) {
					sum += Number(value);
					integral += (Number(value)*Number(value));
					count++;
				}
			}
			return _addCommas(!count ? 0 : Math.round(Math.sqrt( (integral/count) - (sum/count)*(sum/count) )*10)/10);
		},
		"count" : function(param){
			var self = this;
			var key = _footerParamToKey(self, param);
			var count = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var value = self.state.data[i][key];
				if(_valid(value) && value) count++;
			}
			return _addCommas(count);
		},
		"countif" : function(param,value){
			var self = this;
			var key = _footerParamToKey(self, param);
			var count = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var datavalue = self.state.data[i][key];
				if(datavalue !== undefined && datavalue !== null && datavalue === value) count++;
			}
			return _addCommas(count);
		},
		"min" : function(param) {
			var self = this;
			var key = _footerParamToKey(self, param);
			var min = undefined;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var datavalue = self.state.data[i][key];
				if(min === undefined || Number(datavalue) < Number(min)) {
					min = Number(datavalue);
				}
			}
			return _addCommas(min);
		},
		"max" : function(param) {
			var self = this;
			var key = _footerParamToKey(self, param);
			var max = 0;
			for(var i=0,l=self.state.data.length;i<l;i++) {
				var datavalue = self.state.data[i][key];
				if(Number(datavalue) > Number(max)) {
					max = Number(datavalue);
				}
			}
			return _addCommas(max);
		},
		"key" : function(key) {
			var self = this;
			self.state.footerData = self.state.footerData || {};
			var value = self.state.footerData[key];
			return _valid(value) ? value : "";
		}
	};
	function _footerParamToColumnIndex(cstr) {
		return Number(cstr.split("c").pop());
	}
	function _footerParamToKey(self,cstr) {
		var key = null;
		var ci = Number(cstr);
		if(isNaN(ci)) {
			if(cstr.charAt(0) == "c") {
				ci = Number(cstr.split("c").pop());
				key = _getColumnKeyFromColumnIndex(self.option.columnMapping, ci);
			}
			if(key === null) {
				key = cstr;
			}
		} else {
			key = _getColumnKeyFromColumnIndex(self.option.columnMapping, ci);
		}
		return key;
	}

	AlopexGrid.prototype._footerValueByMapping = function(footerMap) {
		//columnIndex:footer가 표시될컬럼위치, render : 계산할내용, title : 이게 우선. value는 무조건 title
		if(typeof footerMap.title === "string") {
			//무조건 타이틀이 우선
			return footerMap.title;
		}
		var self = this;
		var result = [];

		if(footerMap.render) {
			var render = footerMap.render;
			if(typeof render === "string") render = [render];
			for(var i=0,l=render.length;i<l;i++) {
				var func = render[i];
				var method = (func.match(/((^\w+)[(].+[)])/i) || [null]).pop();
				var param = (func.match(/[^(]*\(([^)]*)\)/) || ['',null])[1];
				var params = param ? param.split(/\W+/) : null;

				if(!method) {
					result.push(func);
				} else if($.isFunction(_footerRenderer[method])) {
					result.push(_footerRenderer[method].apply(self, params));
				}
			}
		}
		var value = result.join('');
		if(footerMap.key) {
			self.state.footerData[footerMap.key] = value;
		}
		return (!value || !value.length) ? "&nbsp;" : value;
	};
	AlopexGrid.prototype._footerData = function(key, value) {
		this.state.footerData = this.state.footerData  || {};
		if(value === null || value === undefined) {
			delete this.state.footerData[key];
		} else {
			this.state.footerData[key] = value;
		}
	};
	AlopexGrid.prototype.footerData = function() {
		var self = this;
		var args = $.makeArray(arguments);
		self.state.footerData = self.state.footerData || {};
		var dataChanged = false;
		if($.isPlainObject(args[0])) {
			for(var prop in args[0]) {
				if(args[0].hasOwnProperty(prop)) {
					self._footerData(prop, args[0][prop]);
					dataChanged = true;
				}
			}
		} else if(typeof args[0] === "string") {
			var key = args[0];
			var value = args[1];
			if(args.length < 2) {
				value = self.state.footerData[key];
				return _valid(value) ? value : null;
			} else {
				self._footerData(key, value);
				dataChanged = true;
			}
		}
		if(dataChanged) {
			self._needEditedRefresh();
		}
		if(!args.length) {
			return $.extend({},self.state.footerData);
		}
	};

	AlopexGrid.prototype.sortClear = function() {
		var self = this;
		self.$wrapper.find('.headercell.sorting').removeClass("asc desc");
		self.state.sortingColumn = undefined;
		self.state.sortingDirection = undefined;

		self._showProgress(function(done){
			var tret = null;
			var params = null;
			if(self.option.on && $.isFunction(self.option.on.sortClear)) {
				params = getParamNames(self.option.on.sortClear);
				tret = self.option.on.sortClear.call(
					self,
					self.option.pager ? $.extend({},self.option.paging) : null,
					done);
			}
			if(tret === false) {
				if(!params || (params && params.length<2)) {
					done();
				}
				return;
			}
			if (self.state.rowspanned) {
				for ( var i in self.option.columnMapping) {
					var mapping = self.option.columnMapping[i];
					if (mapping.rowspan === "asc" || mapping.rowspan === "desc") {
						self._dataDraw({
							tableheader: {
								display: 'none'
							}
						});
						break;
					}
				}
			}
			if(!params || (params && params.length<2)) {
				done();
			}
		}, 0, true);
	};

	function _isEmptyQuery(query) {
		return (!query || $.isEmptyObject(query));
	}

	AlopexGrid.prototype._noData = function() {
		if (!this.state.data || !this.state.data.length) {
			return true;
		}
		return false;
	};

	AlopexGrid.prototype._generateDataIndex = function(datalist) {
		var self = this;
		var dlist = datalist || self.state.data;
		self.state.dataIdMap = self.state.dataIdMap || {};
		$.each(dlist, function(dataIndex, data){
			data._index.data = dataIndex;
			self.state.dataIdMap[data._index.id] = dataIndex;
		});
	};

	//support both self.state.data sort and custom list sort...?
	AlopexGrid.prototype._dataSort2 = function(targetList, columnIndexKey, direction, filterMethod){
		var self = this;
		self.state.data = self.state.data || [];
		var isCustomList = !!targetList;
		var sortingColumnIndex = -1;
		var sortingKey = null;//TODO self.state.sortingColumn 속성 처리에 대한 문제. key값 기준으로 정렬할 때에는?
		var sortingDirection = (isCustomList ? direction : self.state.sortingDirection);
		var sortingType = "string";
		var targetMapping = null;

		var hasRowspan = false; //self.state.rowspanned
		var rowspanAlways = false;
		var rowspanAlwaysMapping = null;

		targetList = targetList || self.state.data;

		$.each(self.option.columnMapping, function(idx, mapping) {
			//if(isMappingVisible(mapping) && mapping.rowspan)
			if(mapping.rowspan) {
				hasRowspan = true;
				//Doesn't perform rowspan Always packing when custom list is provided.
				rowspanAlways = !isCustomList && (mapping.rowspan === "always");
				if(rowspanAlways) {
					rowspanAlwaysMapping = mapping;
				}
			}
		});

		//determine sortingKey and sortingType for sure.
		if(isCustomList || _valid(self.state.sortingColumn)) {
			var mapping = self.columnInfo(isCustomList ? columnIndexKey : self.state.sortingColumn);
			if (mapping) {
				sortingColumnIndex = Number(mapping.columnIndex);
				sortingKey = mapping.key;
				if(mapping.sorting === "number") {
					sortingType = "number";
				}
				targetMapping = mapping;
			}
		}

		if(self.option.autoSortingType && targetMapping.sorting === true) {
			var allNumber = true;
			$.each(targetList, function(idx, data){
				if(data[sortingKey] !== undefined && !$.isNumeric(data[sortingKey])) {
					allNumber = false;
					return false;
				}
			});
			if(allNumber) {
				sortingType = "number";
			}
		}

		var sortingTypeFilter = (sortingType === "number") ? Number : String;

		if(sortingKey) {
			//XXX rowspan:"always", string/number sorting
			var order = sortingDirection === "desc"? -1 : 1;
			var formerAndLatter = -1 * order;
			var latterAndFormer = 1 * order;
			if(rowspanAlways) {
				_rowspanPack(targetList, rowspanAlwaysMapping);
				_generateDataIndex(targetList);
				targetList.sort(function(former, latter){
					//always컬럼 값이 같을때엔 실제 sortingKey 기준으로 정렬을.
					//rowspanAlways컬럼의 값이 다를때엔 순서 보장으로..
					var fval = sortingTypeFilter(former[sortingKey]);
					var lval = sortingTypeFilter(latter[sortingKey]);
					var rfval = former[rowspanAlwaysMapping.key];
					var rlval = latter[rowspanAlwaysMapping.key];
					if(rfval === rlval) {
						if(fval < lval) {
							return formerAndLatter;
						} else if(fval > lval) {
							return latterAndFormer;
						} else {
							return former._index.data - latter._index.data;
						}
					} else {
						return former._index.data - latter._index.data;
					}
				});
			} else {
				targetList.sort(function(former, latter){
					//-1 : former , latter
					//1 : latter, former
					var fval = sortingTypeFilter(former[sortingKey]);
					var lval = sortingTypeFilter(latter[sortingKey]);
					if(fval < lval) {
						return formerAndLatter;
					} else if(fval > lval){
						return latterAndFormer;
					} else {
						//sort stability
						return former._index.data - latter._index.data;
					}
				});
			}
		}

		if(hasRowspan) {
			//TODO generate rowspan index...
		}

		if(!isCustomList) {
			self._generateDataIndex(targetList);
			self.state.rowspanned = hasRowspan;
		}
		return targetList;
	};
	AlopexGrid.prototype._dataSort = function(_list, _col, _dir, _filter) {
		var self = this;
		var option = this.option;
		this.state.data = this.state.data || [];
		var vdata = ($.isArray(_list)) ? $.extend(true, [], _list) : this.state.data;
		var sortingColumn = (_col !== undefined) ? _col : Number(this.state.sortingColumn);
		var sortingMapping = null;
		var dir = _dir ? _dir : this.state.sortingDirection;
		var sorted = false;
		var hasRowspan = false;
		var rowspanAlwaysColumn = null;
		var rowspanAlways = false;
		var rowspanMapping = [];
		var collen = 0;//for rowspanindex.
		for ( var i in option.columnMapping) {
			var mapping = option.columnMapping[i];
			if (!isNaN(Number(mapping.columnIndex)) && mapping.key) {
				collen++;
			}
			if (sortingColumn === Number(mapping.columnIndex)) {
				sortingMapping = mapping;
			}
			if (mapping.rowspan === "always") {
				rowspanAlways = mapping;
				rowspanAlwaysColumn = Number(mapping.columnIndex);
			}
			if (mapping.rowspan) {
				hasRowspan = true;
			}
			if (mapping.rowspan === true || mapping.rowspan === "always") {
				rowspanMapping.push(mapping);
			}
		}
		//rowspanalways가 없으면 일반 정렬수행
		function sortfunc(array, key, filt, dir, begin, end) {
			var order = dir === "asc" ? 1 : (dir === "desc" ? -1 : 0);
			if (order === 0) { //sort() is not stable over browsers
				return false;
			}
			begin = begin || 0;
			end = end || array.length;
			var workingfilter = filt || "string";
			if(filt === true) workingfilter = "string";
			var detected = false;
			//vdata.sort(function(former,latter) {//오름차순정렬은 order=1
			_sort(array, function(former, latter) {
				var fv = former[key];
				var lv = latter[key];
				if($.isFunction(workingfilter)) {
					var ret = workingfilter(fv, lv) || 0;
					return ret * order;
				}
				if(self.option.autoSortingType && !detected) {
					var fvnum = $.isNumeric(fv);
					var lvnum = $.isNumeric(lv);
					if(fvnum && lvnum) {
						workingfilter = "number";
						detected = true;
					} else if(fvnum && !lv) {
						workingfilter = "number";
						detected = true;
					} else if(!fv && lvnum) {
						workingfilter = "number";
						detected = true;
					} else if(fv && lv && !fvnum && !lvnum){
						workingfilter = "string";
						detected = true;
					}
				}
				var filter = workingfilter == "number" ? Number : String;

				if (fv === undefined || fv === null) {
					fv = workingfilter === "number" ? Number.NEGATIVE_INFINITY : "";
				}
				if (lv === undefined || lv === null) {
					lv = workingfilter === "number" ? Number.NEGATIVE_INFINITY : "";
				}
				if(typeof workingfilter === "string") {
					fv = filter(fv);
					lv = filter(lv);
				}
				//if (workingfilter !== "number") {
//                if(typeof fv === "string") {
//					fv = fv.toLowerCase();
//                }
//                if(typeof lv === "string") {
//					lv = lv.toLowerCase();
//				}
				var ret = 0;
				if (fv < lv)
					ret = -1 * order;
				if (fv > lv)
					ret = 1 * order;
				return ret;
			}, begin, end);
			return true;
		}
		//동적바인딩 적용시 정렬을 하지 않는다.
		if (!rowspanAlways && dir && sortingColumn !== undefined &&
				(!this.state.dynamicBinding || self.option.clientSortingOnDynamicDataSet)
			) {
			for ( var i in option.columnMapping) {
				var mapping = option.columnMapping[i];
				var sorting = mapping.sorting;
				if ((sorting || _list) && Number(mapping.columnIndex) === sortingColumn) {
					sortfunc(vdata, mapping.key, _filter || sorting, dir);
					sorted = true;
				}
			}
		}
		//rowspan을 반드시 실시하는 컬럼이 있을 경우 이에 따라 묶음수행. _rowspanPack은 필요에 따라 호출한다.
		//_rowspanPack(vdata, mapping)
		if (rowspanAlways && sortingColumn !== undefined) {
			//always가 정렬로 선택된 컬럼이거나. 또는 by가 지정하는 컬럼이 정렬로 선택되었는데
			//by가 지정하는 컬럼이 always인 경우는 always항목에 준하여 sorting을 수행해야 한다.
			if (rowspanAlwaysColumn === sortingColumn
			//|| rowspanAlwaysColumn === (sortingMapping.rowspan ? sortingMapping.rowspan.by : false)
				) {
				//이때엔 세부정렬 기준이 있을시 이에 의거한 정렬을 우선 수행 후.
				//rowspan always의 정렬을 수행한다.
				var submap = false;
				for ( var i in option.columnMapping) {
					var mapping = option.columnMapping[i];
					if (mapping.key && (mapping.rowspan == "asc" || mapping.rowspan == "desc")) {
						submap = mapping;
						break;
					}
				}
				if (submap) {
					//세부기준에 의거한 sorting을 수행한다.
					sortfunc(vdata, submap.key, null, submap.rowspan);
				}
				//always항목에 의거한 sorting을 수행한다.
				sortfunc(vdata, rowspanAlways.key, null, dir);
				if (rowspanAlwaysColumn === (sortingMapping.rowspan ? sortingMapping.rowspan.by : false)) {
					//TODO always에 의거하여 packing을 실시한 뒤, by를 가지는 sortingColumn의 값들을 기준으로
					//pack된 값들을 정렬해야 한다.
					sortfunc(vdata, sortingMapping.key, null, dir);
					_rowspanPack(vdata, rowspanAlways);
				}
			} else {
				//이때는 rowspanalways항은 있는대로 놔두긴 하지만
				//대신 _rowspanPack을 수행하여 묶어내고.
				//이들에 대해 묶이는 아이템들에 대해 일일이 부분정렬을 sortingColumn에 의하여 정렬한다.
				//_sort(vdata, comparision, begin, end)
				_rowspanPack(vdata, rowspanAlways);

				//rowspan=asc|desc처리. 이 처리는 사용자 지정된 sortingColumn보다 먼저 일어나야 한다.
				for ( var i in option.columnMapping) {
					var mapping = option.columnMapping[i];
					if (mapping.rowspan === "asc" || mapping.rowspan === "desc") {
						var begin = 0;
						var end = vdata.length;
						var sortingkey = mapping.key;
						while (begin < end) {
							var from = begin;
							var to = begin + 1;
							//rowspanAlways에 해당하는 컬럼의 값이 어디까지 동일한지 추출.
							while (to < end && vdata[from][rowspanAlways.key] === vdata[to][rowspanAlways.key]) {
								to++;
							}
							sortfunc(vdata, sortingkey, null, mapping.rowspan, from, to);
							begin = to;
						}
					}
				}

				var begin = 0;
				var end = vdata.length;
				var sortingkey = null;
				for ( var i in option.columnMapping) {
					if (Number(option.columnMapping[i].columnIndex) === Number(sortingColumn)) {
						sortingkey = option.columnMapping[i].key;
					}
				}
				while (begin < end) {
					var from = begin;
					var to = begin + 1;
					//rowspanAlways에 해당하는 컬럼의 값이 어디까지 동일한지 추출.
					while (to < end && vdata[from][rowspanAlways.key] === vdata[to][rowspanAlways.key]) {
						to++;
					}
					sortfunc(vdata, sortingkey, null, dir, from, to);
					begin = to;
				}
			}
		} else if (rowspanAlways && (sortingColumn === undefined || sortingColumn === null)) {
			_rowspanPack(vdata, rowspanAlways);
		}

		for (var i = vdata.length; i >= 0; i--) {
			if (!vdata[i]) {
				vdata.splice(i, 1);
			}
		}

		//state.rowspanindex를 작성하고 state.rowspanned를 true로 설정한다.
		if (hasRowspan && _list === undefined) {
			var ri = [];
			for (var i = 0; i < collen; i++) {
				ri.push(undefined);
			}
			var index = 1;
			$.each(rowspanMapping, function(idx, mapping) {
				var begin = 0;
				var end = vdata.length;
				ri[Number(mapping.columnIndex)] = [];
				var ritem = ri[Number(mapping.columnIndex)];
				var summary = [];
				while (begin < end) {
					var from = begin;
					var to = begin + 1;
					//rowspanAlways에 해당하는 컬럼의 값이 어디까지 동일한지 추출.
					while (to < end && vdata[from][mapping.key] === vdata[to][mapping.key]) {
						to++;
					}
					var item = {
						from: from,
						to: to,
						index: index++
					};
					for (var i = from; i < to; i++) {
						summary[i] = item;
					}
					ritem.push(item);
					begin = to;
				}
				ritem.push(summary);//console.log(summary)
			});
			for ( var i in option.columnMapping) {
				var mapping = option.columnMapping[i];
				if (mapping.rowspan && typeof mapping.rowspan.by == "number") {
					if (mapping.rowspan.under) {
						//under : true
						var by = ri[mapping.rowspan.by];
						by = by[by.length - 1];
						var begin = 0;
						var end = vdata.length;
						ri[Number(mapping.columnIndex)] = [];
						var ritem = ri[Number(mapping.columnIndex)];
						var summary = [];
						while (begin < end) {
							var from = begin;
							var to = begin + 1;
							//rowspanAlways에 해당하는 컬럼의 값이 어디까지 동일한지 추출.
							while (to < end && vdata[from][mapping.key] === vdata[to][mapping.key]) {
								//console.log(' loop', from, to, by[from])
								if (to + 1 > by[from].to) {
									break;
								}
								to++;
							}
							//console.log('merge', from, to)
							var item = {
								from: from,
								to: to,
								index: index++
							};
							for (var i = from; i < to; i++) {
								summary[i] = item;
							}
							ritem.push(item);
							begin = to;
						}
						ritem.push(summary);//console.log(summary)

					} else {
						ri[mapping.columnIndex] = ri[mapping.rowspan.by];
					}
				}
			}
			delete this.state.rowspanindex;
			var valid = false;
			for ( var i in ri) {
				if (ri[i]) {
					valid = true;
				}
			}
			if (valid) {
				this.state.rowspanindex = ri;
				this.state.rowspanned = true;
			} else {
				this.state.rowspanindex = undefined;
				this.state.rowspanned = false;
			}
		} else {
			this.state.rowspanindex = undefined;
			this.state.rowspanned = false;
		}

		if (_list !== undefined) {
			return vdata;
		}
//		$.each(vdata, function(idx, item) {
//			item._index = $.extend({}, item._index);
//			item._index.data = idx;
//		});
		self._generateDataIndex(vdata);
		return sorted;
	};
	AlopexGrid.prototype._dataMoveByDataindex = function(old_dataindex, new_dataindex) {
		if (!this.state.data || !this.state.data.length) {
			return;
		}
		var list = this.state.data;
		list.splice(new_dataindex + (new_dataindex > old_dataindex ? -1 : 0), 0, list.splice(old_dataindex, 1)[0]);
	};
	function _dataSlice(self, list, remove) {
		if(!list) return null;
		var sliced = [];
		if(!$.isArray(list)) list = [list];
		var idlist = $.map(list, function(data) {
			if(!data || !data._index) return;
			return data._index.id
		});
		$.each(self.state.data, function(idx,data){
			if($.inArray(data._index.id, idlist)>=0) {
				sliced.push(data);
			}
		});
		if(remove) {
			var i = self.state.data.length;
			while(i--){
				var data = self.state.data[i];
				if($.inArray(data._index.id, idlist)>=0) {
					self.state.data.splice(i,1);
				}
			}
		}
		return sliced;
	}
	AlopexGrid.prototype.dataMove = function(fromquery, toquery, after) {
		var self = this;
		if(self._noData()) return;
		if(_isEmptyQuery(fromquery)) return;
		if(_isEmptyQuery(toquery)) return;
		var fromlist = self.dataGet(fromquery);
		var tolist = self.dataGet(toquery);
		if(!fromlist || !tolist || !fromlist.length || !tolist.length) return;
		if(!tolist[0] || !tolist[0]._index) return;
		var toindex = tolist[0]._index.data;
		if(!_valid(toindex)) return;
		//do actual modification
		var fromdatalist = _dataSlice(self, fromlist, true);
		$.each(self.state.data, function(idx, data){
			if(data && data._index && toindex <= data._index.data) {
				var comp = 0;
				//inc only if data exists
				if(after === true && toindex === data._index.data) comp++;
				toindex = idx + comp;
				return false;
			}
		});
		if(toindex >= 0) {
			self.state.data.splice.apply(self.state.data, [toindex, 0].concat(fromdatalist) );
		} else {
			//problem
		}
		self.sortClear();
		self._simpleRedraw(null, null);
	};
	function _positionToPercentage(position) {
		var map = {"top":0,"middle":50,"bottom":100};
		var percentage = null;
		if(map.hasOwnProperty(position)) {
			percentage = map[position];
		} else if(typeof position == "string" && position.indexOf('%') >= 0) {
			percentage = Number(position.split('%')[0]);
		} else if(!isNaN(Number(position))) {
			percentage = Number(position);
		}
		return percentage;
	}
	AlopexGrid.prototype.dataScroll = function(query, position, callback, norecursive) {
		var self = this;
		if($.isFunction(position)) {
			callback = position;
			position = null;
		}
		var vscroll = self._vscrollInfo(); 
		var vscrollDelay = vscroll ? 100 : 0;
		if(typeof query === "string" || $.isNumeric(query)) {
			var toppos = 0;
			var wheight = 0;
			var $scrolltarget = self.$scroller;
			var percentage = _positionToPercentage(query);
			var targetheight = self.$scroller.prop('scrollHeight') - self.$scroller.prop('clientHeight');
			if(!self.option.height) {
				$scrolltarget = $window;
				targetheight = self.$scroller.height();
				wheight = -$window.height();
				toppos = self.$scroller.offset().top;
			}
			if($.isFunction(callback)) {
				$scrolltarget.one('__dataScroll.alopexgridDataScroll', function(){
					!vscrollDelay ? (callback(null)) : 
						setTimeout((function(c){return function(){c(null);};})(callback), vscrollDelay);
				});
			}
			$scrolltarget.scrollTop(Math.floor(toppos + wheight*(percentage/100) + targetheight*(percentage/100))).trigger('__dataScroll');
			return;
		}
		if(self._noData()) return;
		if(_isEmptyQuery(query)) return;
		var data = self.dataGet(query);
		if(!data || !data.length) return;
		data = data[0];
		if(!data || !data._index) return;
		position = ($.isPlainObject(position) ? position["position"] : position) || "top";
		
		var renderedAt = $.inArray(data._index.data, self.state.rendered);
		if(renderedAt>=0) {
			var $rows = self.$tablebody.children();
			var needDelay = vscroll && vscrollDelay &&
				(data._index.data < $rows.eq(0).attr('data-alopexgrid-dataindex') || $rows.eq(-1).attr('data-alopexgrid-dataindex') < data._index.data);
			var toppos = null;
			var $scrolltarget = self.$scroller;
			self._calcRowHeight();
			if(vscroll) {
				toppos = self.state.rowHeight * renderedAt;
			} else {
				var $children = self.$tablebody.children();
				toppos = $children.eq(renderedAt).offset().top - $children.eq(0).offset().top;
			}
			if(!self.option.height) {
				toppos += self.$scroller.offset().top;
				$scrolltarget = $window;
			}
			if(position !== "top") {
				var percentage = _positionToPercentage(position);
				var comp = 0;
				percentage = percentage / 100;
				comp = Math.floor((self.$scroller.prop('clientHeight') - self.state.rowHeight) * percentage);
				toppos -= comp;
			}
			if($.isFunction(callback)) {
				$scrolltarget.one('__dataScroll.alopexgridDataScroll', function(){
					!needDelay ? (callback(data)) :
						setTimeout((function(c,d){return function(){c(d);};})(callback,data), vscrollDelay);
				});
			}
			$scrolltarget.scrollTop(toppos).trigger('__dataScroll');
		} else if(norecursive !== true && self.option.pager) {
			//set to appropriate page and do it again
			self.pageSet(_inPage(self, data), true);
			self.dataScroll(data, position, callback, true);
		} else {
			//problem
		}
	};
	AlopexGrid.prototype._dataSetState = function(query, state, norender) {
		var self = this;
		var data = self.dataGetByIndex(query._index);
		if (!data) {
			return;
		}
		var rec = null;
		if(state.deleted === true || data._state.deleted) {
			state.editing = false;
//			state.selected = false;
		}
		if (!data._state.editing && state.editing) {
			rec = AlopexGrid.trimData(data);
		}
		data = $.extend(true, data, {
			_state: state || {}
		});
		if (!self.state.data[data._index.data]) {
			return;
		}

		if (rec) {
			self.state.data[data._index.data]._state.recent = rec;
			data._state.recent = rec;
		}

		this.state.data[data._index.data]._state = data._state;
		if (!data._state.editing) {
			_deleteRecent(this.state.data[data._index.data]);
		}
		if (data._state && data._state.recent) {
			data = $.extend(true, {}, data, data._state.recent);
		}
		//this.dataEdit(data, query, true);
		//selected같은 속성이 설정된 후에는, class설정과 같은 동작이 새로 이루어져야 하므로, data를 다시 그려야 한다. 
		//this._dataDraw();
		//this._rowDraw(this.$root.find('.table .table-body .row').filter(function(idx,row){

		//this._rowDraw($row,data);
		if(norender !== true) {
			this.refreshRow({_index:{data:data._index.data}});
//			var $rows = this.$tablebody.children('.row');
//			var $row = $rows.filter(function(idx, row) {
//				if (Number($(row).attr('data-alopexgrid-dataindex')) === data._index.data) {
//					return true;
//				}
//				return false;
//			});
//			var op = {styleclass: $row.hasClass('hovering') ? 'hovering' : ''};
//			if(this.state.hasFixColumn) {
//				op["emptyTo"] = this.state.fixupto;
//			}
//			var newrow = this._rowRender(data, data._index.data, data._index.data, op);
//			$row.replaceWith(_convertAlopex.call(self, newrow));
		}
	};
	AlopexGrid.prototype._dataDraw = function(viewoption) {
		var self = this;
		if (!this.state.data) {
			this.state.data = [];
		}
		//scrollpanel의 innerhtml로 테이블을 생성, IE에서의 속도향상을 꾀함.
		var option = self.option;
		var $table = self.$table;
		var $scrollpanel = self.$scrollpanel;
		var expectedWidth = 0;
		self._closeTooltip();
		var table = ['<table class="table"'];
		table.push(' style="width:100%;table-layout:fixed;');
		table.push('"');
		if ($.isPlainObject(option.attr)) {
			$.each(option.attr, function(key, value) {
				table.push(' ', key, '="', value, '"');
			});
		}
		table.push('>');
		if (option.caption) {
			table.push('<caption style="position:absolute;display:none;">', option.caption, '</caption>');
		}
		table.push('<colgroup>');
		for ( var i in option.columnMapping) {
			var mapping = option.columnMapping[i];
			if (mapping.columnIndex !== undefined && mapping.columnIndex !== null && mapping.hidden !== true) {
				table.push('<col data-alopexgrid-columnindex="',mapping.columnIndex,'"');
				if (mapping.width) {
					table.push(' style="width:', mapping.width, ';"');
					if (expectedWidth >= 0) {
						expectedWidth += Number(String(mapping.width).split('px')[0]);
					}
				} else {
					expectedWidth = -1;
				}
				table.push('>');
			}
		}
		table.push('</colgroup>');
		self.state.tableWidth = expectedWidth;

		table.push('<thead class="table-header"');
		if (viewoption && viewoption.tableheader && viewoption.tableheader.display) {
			table.push(' style="display:', viewoption.tableheader.display, ';"');
		}
		table.push('>', self._headerRender(viewoption ? viewoption.tableheader : null), '</thead>');

		//============================
		table.push('<tbody class="table-body">');
		var sorted = self._dataSort();
		var vdata = self.state.data && self.state.data.length ? self.state.data : [];
		this.state.sorted = sorted;
		var drawnIndex = self._pageDrawnIndex();
		var startIndex = drawnIndex.start;
		var endIndex = drawnIndex.end;

		var drawn = 0;
		var collen = 0;
		for ( var j in self.option.columnMapping) {
			var mapping = self.option.columnMapping[j];
			var ci = mapping.columnIndex;
			if (ci !== undefined && ci !== null && mapping.hidden !== true) {
				collen++;
			}
		}
		if (endIndex < 0 || !vdata || !vdata.length) {
			if (self.option.message && self.option.message.nodata) {
				table.push('<tr class="row emptyrow"><td class="cell cell-nodata" colspan="', collen, '">','<div class="cell-wrapper">');
				table.push(self.option.message.nodata);
				table.push('</div></td></tr>');
				drawn++;
			} else if (!self.option.rowPadding) {
				table.push('<tr class="emptyrow">');
				for (var i = 0; i < collen; i++) {
					table.push('<td></td>');
				}
				table.push('</tr>');
			}
			self._tableSpacing(0,0);
		} else {
			this.state.prevRenderedLength = self.state.rendered && self.state.rendered.length ? self.state.rendered : 0;
			delete self.state.rendered;
			this.state.rendered = [];
			for (var i = startIndex; i < endIndex; i++) {
				self.state.rendered.push(Number(i));
			}
			var vscroll = self._vscrollInfo();
			if(vscroll) {
				self._tableSpacing(vscroll["paddingTopHeight"], vscroll["paddingBottomHeight"]);
				startIndex = self.state.rendered[vscroll["startIndex"]];
				endIndex = self.state.rendered[vscroll["endIndex"]]+1;
				//self.$scrollpanel.css('height', vscroll["totalHeight"]+"px");
			} else {
				self._tableSpacing(0,0);
			}
			for (var i = startIndex; i < endIndex; i++) {
				var data = vdata[i];
				if (data._state && data._state.recent) {
					var recent = data._state.recent;
					data = $.extend({}, data, recent);
					//data._index = $.extend({},recent._index);
					//data._state = $.extend({},recent._state);
				}
				if (this.state.rowspanned) {
					var from = _rowspanWidestIndex(self.state.rowspanindex, i);
					if (from && Number(from.from) !== Number(i) && vdata[from.from]._state.selected) {
						//spanrow가 선택된 상태에서 데이터가 추가되었을 경우 동일하게 선택 상태로 만든다.
						data._state.selected = true;
					}
				}
				var rendered = self._rowRender(data, i, drawn, /*self.state.hasFixColumn ? {emptyTo:self.state.fixupto} : */null);
				table.push(rendered);
				drawn++;
			}
		}
		if (self.option.rowPadding) {
			var till = 0;
			if (typeof self.option.rowPadding == "number") {
				till = Number(self.option.rowPadding);
			} else {
				till = Number(drawnIndex.perPage);
			}
			if (till > 0) {
				self._calcRowHeight();
				for (var i = drawn; i < till; i++) {
					table.push('<tr class="row emptyrow" style="height:'+self.state.rowHeight+'px">');
					for (var j = 0; j < collen; j++) {
						table.push('<td class="cell"><div class="cell-wrapper">&nbsp;</div></td>')
					}
					table.push('</tr>');
				}
			}
		}
		table.push('</tbody>');

		//=====================-=-=-=-=-==-

		table.push('</table>');
		var joined = table.join('');
		//$scrollpanel.html(joined);
		self.$table.replaceWith(_convertAlopex.call(self, joined));
		//    $scrollpanel[0].innerHTML = '';
		//    $scrollpanel[0].innerHTML = joined;
		self.$table = $scrollpanel.children('table');
		self.$tableheader = self.$table.children('thead');
		self.$tablebody = self.$table.children('tbody');
		self.$colgroup = self.$table.children('colgroup');

		clearSelection();
		//self._needEditedRefresh();
	};

	function isMappingVisible(mapping) {
		return _valid(mapping.columnIndex) && mapping.hidden !== true;
	}
	function isColumnHidden(columnMapping, columnIndexKey) {
		for (var i = 0, l = columnMapping.length; i < l; i++) {
			var mapping = columnMapping[i];
			if(Number(mapping.columnIndex) === Number(columnIndexKey)
				|| (typeof mapping.key === "string" && mapping.key === columnIndexKey)) {
				return !!mapping.hidden;
			}
		}
		return false;
	}
	function getColumnIndexByKey(columnMapping, key) {
		for(var i=0,l=columnMapping.length;i<l;i++) {
			var mapping = columnMapping[i];
			var ci = mapping.columnIndex;
			if(_valid(ci) && mapping.key === key) {
				return ci;
			}
		}
		return null;
	}
	AlopexGrid.prototype.columnInfo = function(columnIK) {
		var self = this;
		var option = self.option;
		var columnMapping = option.columnMapping;
		var columnIndex = columnIK;
		var columnKey = columnIK;
		var info = null;
		$.each(columnMapping, function(idx,mapping) {
			var ci = Number(columnIndex);
			if(ci === Number(mapping.columnIndex)
				|| (typeof mapping.key === "string" && mapping.key === columnKey)
				|| columnIK === mapping) {
				info = $.extend(true, {}, mapping);
				return false;
			}
		});
		return info;
	};
	AlopexGrid.prototype.columnGet = function() {
		var self = this;
		var columnMapping = self.option.columnMapping;
		var cqueries = $.makeArray(arguments);
		var ret = [];
		$.each(columnMapping, function(idx, mapping) {
			var oci = Number(mapping.columnIndex);
			var passed = true;
			$.each(cqueries, function(jdx,cquery) {
				if(!$.isPlainObject(cquery)) return;
				for(var prop in cquery) {
					if(prop === "columnIndex") {
						if(oci !== cquery[prop]) {
							passed = false;
						}
					} else if(prop === "hidden") {
						if(isColumnHidden(columnMapping, oci) !== cquery[prop]) {
							passed = false;
						}
					} else if(cquery[prop] !== mapping[prop]) {
						passed = false;
					}
				}
			});
			if(passed) {
				var cinfo = self.columnInfo(mapping);
				ret.push(cinfo);
			}
		});
		return ret;
	};
	AlopexGrid.prototype.isColumnHidden = function(columnIK) {
		var self = this;
		var option = self.option;
		var columnMapping = option.columnMapping;
		return isColumnHidden(columnMapping, columnIK);
	};
	AlopexGrid.prototype.hideCol = function(ci, noupdate) {
		//columnIndex는 original columnIndex기준으로 입력이 됨을 가정.
		var self = this;
		return self.showCol(ci, noupdate, true);
	};
	AlopexGrid.prototype.showCol = function(ci, noupdate, hidden) {
		var self = this;
		var option = self.option;
		var columnMapping = option.columnMapping;
		var allshow = true;
		if(ci === true) {
			$.each(columnMapping, function(idx,mapping) {
				hidden ? self.hideCol(mapping.key, true) : self.showCol(mapping.key, true);
			});
			self.updateOption();
			return;
		}
		if(typeof ci === "string") {
			ci = ci.split(',');
		} else if (!$.isArray(ci)) {
			ci = [ci];
		}
		$.each(self.option.columnMapping, function(idx,mapping){
			if(_valid(mapping.columnIndex) &&
				($.inArray(mapping.columnIndex, ci) >= 0
					|| $.inArray(mapping.key, ci) >= 0
					)
				){
				mapping.hidden = hidden || false;
			}
		});
		if (noupdate !== true) {
			self.updateOption();
		}
		return;
	};

	function dataChangeCallback(self, type, args) {
		if(self.option.on && self.option.on.data && self.option.on.data[type]) {
			var cb = $.isFunction(self.option.on.data[type]) ? [self.option.on.data[type]] : self.option.on.data[type];
			//var _args = [self.$root].concat(args);
			for(var i in cb) {
				if($.isFunction(cb[i]) && cb[i].apply(self.$root, args) === false) {
					return false;
				}
			}
		}
	}
	function viewUpdateForRowBasedHeight(self,before) {
		if(typeof self.state.userHeight === "string" && self.state.userHeight.toLowerCase().indexOf("row")>=0
			&& self.state.userHeightRowCount) {
			if((before > self.state.userHeightRowCount) !== (self.state.data.length > self.state.userHeightRowCount)) {
				self.viewUpdate();
			}
		}
	}

	AlopexGrid.prototype.dataAdd = function(data, query) {
		var self = this;
		if(dataChangeCallback(self, "add", [data, query]) === false) {
			return false;
		}
		if (!data) {
			return;
		}
		if (!self.state.data) {
			self.state.data = [];
		}
		var items = $.isArray(data) ? data : [data];
		if (!items.length) {
			return;
		}
		if(self.option.dataLengthLimit && (self.state.data.length + items.length) > self.option.dataLengthLimit) {
			var msg = self.option.message.dataLengthLimit || "Exceed Limit.";
			if($.isFunction(msg)) {
				msg = msg(self.state.data.length + items.length);
			}
			alert(msg);
			return;
		}
		if (query && query._index && query._index.row !== undefined) {
			//TODO 보이는 기준으로 삽입. state.rendered의 array index를 기준으로 위치를 계산한다.
		}
		var beforeDataLength = self.state.data.length;
		for(var i=0,l=items.length;i<l;i++) {
			var item = items[i];
			item._state = $.extend({
				edited: false,
				editing: false,
				selected: false,
				added: true,
				deleted : false
			}, self.option.defaultState.dataAdd, self.option.extendStateOnAdd ? item._state : null);
			item._index = item._index || {};
			item._index.id = _generateUniqueId();
			self.state.dataFilltrimmer(item);
			self.state.dataCompositor(item);
			item._original = AlopexGrid.trimData(item);
			if (query && query._index && query._index.data !== undefined) {
				self.state.data.splice(Number(query._index.data)+i, 0, item);
			} else if (query && query._index && query._index.row !== undefined) {
				var nidx = self.state.rendered[query._index.row];
				self.state.data.splice(Number(nidx)+i, 0, item);
			} else {
				self.state.data.push(item);
			}
		}
		//데이터 삽입 후 데이터 리스트 정리. _state, _index.data 등이 생성되며, 
		//items 변수를 통해서 삽입된 데이터들의 _index.data를 읽을 수 있다.
		//어떤 길이를 가지던 items[0]._index.data 의 인덱스 부터 items.length개 만큼 렌더링이 될 수 있으며(안해도 될 수도 있다)
		//dataAdd이전에 생성된 state.rendered array와 option.paging의 내용을 토대로.
		//add된 데이터는 무조건 그려야 된다는 가정 하에, 필요 data를 table-body에 append/replace하고. 
		//현재의 페이징 정보에 따라 table-body의 초과 row들을 제거한다. 
		self.state.dynamicBinding ? "" : self.sortClear();
		self._dataSort();
		self.pageInfo();
		var drawnIndex = self._pageDrawnIndex();
		var addedFrom = Number(items[0]._index.data);

		//변경된 items들의 index를 확인한다. _index.data에 명시되어 있음. 
		//이것을, state.rendered array의 내용과 비교해야 함.
		//items와는 별개로, 계산된 결과물은 dataIndex를 기반으로 렌더링 할 수 있도록 해야 함. 
		//이전페이지 위치로 dataAdd한 결과로 밀려나온 items외의 데이터들을 렌더링할 근거가 됨.
		//rowspan이 있는 경우, items가 묶여버린 상황에서는 span된 row들 전체가 고정컬럼/일반바디에서
		//redraw가 되어야 한다.

		//붙여지기 시작한 위치가 페이지 앞일 경우 늘어난 만큼 state.data로부터 append후 넘치는것 삭제
		//붙여지기 시작한 위치가 현제 페이지일 경우, items로부터 해당 위치에 append후 넘치는 것 삭제
		//붙여지기 시작한 위치가 뒤 페이지인 경우, pageInfo만 새로 돌림. 
		//append위치에 이미 row가 있을경우 그대로 append()
		//.row.emptyrow인 경우 replaceWith()
		//rowpadding 안짝이면 지우지 않음
		//현재 페이징 정보를 초과한 row는 삭제

		if (self.state.rowspanned && self.state.rowspanindex && self.state.rowspanindex.length) {
			//rowspan되어 있는 경우..?
			var lteCurrent = false;
			$.each(items, function(idx, item) {
				//하나라도 현재 페이지의 앞에 추가된 데이터가 존재한다면 데이터를 다시 그리도록 한다.
				if (Number(item._index.data) < Number(drawnIndex.end)) {
					lteCurrent = true;
					return false;
				}
			});
			if (lteCurrent) {
				self._simpleRedraw(null,null);
			}
			return;
		}

		var updateBody = false;
		if (addedFrom < drawnIndex.start) {
			//console.log('before the page');
			//현재 페이지에서 밀어내기를 시전한다.
			addedFrom = self.state.rendered && self.state.rendered.length ? self.state.rendered[0] : 0;
			updateBody = true;
			//pageInfo() 정보에 따라 state.rendered를 업데이트 한다
		} else if (drawnIndex.start <= addedFrom && addedFrom < drawnIndex.end) {
			//console.log('in the page')

			//현재 페이지에서 들어가야 할 위치를 찾아서 밀어내기를 시전한다.
			//.emptyrow는 밀어내기를 하지 않고 replaceWith를 한다.
			updateBody = true;
		} else {
			//console.log('after the page')
			//pageInfo()했으니 그냥 끝. 
		}
		delete self.state.rendered;
		self.state.rendered = [];
		for (var i = drawnIndex.start; i < drawnIndex.end; i++) {
			self.state.rendered.push(Number(i));
		}
		var vscroll = self._vscrollInfo();
		//if(updateBody && (items.length > 100 || items.length > self.state.rendered.length/2)) {
		if (updateBody && (items.length > 100 || (self.state.rendered && self.state.rendered.length < 0) || beforeDataLength < 1)) {
			//단순히 너무 많은 경우, 또는 현재 화면에 그려진 데이터의 절반을 넘는 경우, 또는 그냥 데이터가 몇개 없는 경우는 다시 그리도록 한다.
			//20140304 데이터가 몇개 없더라도 렌더링 과정에서 통신이 개입하게 되면 부하로 작용할 수 있으므로 기존에 <20으로 되어있던것을 <0으로 바꿔서 무효화 시킨다.
			self._simpleRedraw(null, {scrollLeft:0});
			self.$scroller.trigger('scroll');
			//var left = self.$scroller.prop('scrollLeft');
		} else if(updateBody && vscroll) {
			self._simpleRedraw(null, {scrollLeft:0});
			self.$scroller.trigger('scroll');
		} else if (updateBody) {
			//console.log('require update body from dataindex ',addedFrom);
			if (self.state.data && self.state.data.length) {
				$.each(self.state.data, function(idx, data) {
					if (data && data._state) {
						data._state.hovering = false;
					}
				});
			}
			var deleteAfter = _max(self.option.rowPadding, self.state.rendered.length);
			//console.log('new rendered',self.state.rendered,'delete after',deleteAfter)
			var addEnd = false;
			var processed = 0;
			var rows = [];
			//console.log('rendered start', self.state.rendered[0], 'addedFrom',addedFrom)
			var over = self.state.rendered && self.state.rendered.length ? self.state.rendered[self.state.rendered.length - 1] : -1;
			var addLength = 0;
			for (var i = addedFrom, len = addedFrom + items.length; i < len; i++) {
				if (over >= 0 && i > over) {
					continue;
				}
				//console.log('render ',i)
				rows.push(self._rowRender(self.state.data[i], i, i - self.state.rendered[0]));
				addLength++;
			}
			//console.log('new addLength',addLength,'over was ',over)
			rows = _convertAlopex.call(self, rows.join(''));
			var removed = 0;
			var updateEvenOdd = items.length % 2 ? true : false;
			function rowAdder(idx, row) {
				var dataIndex = row.getAttribute('data-alopexgrid-dataindex');
				if (!addEnd) {
					//items.length만큼 add가 끝나지 않은 상태라면 자기 위치를 계속 찾아야 한다.
					if (dataIndex !== null && dataIndex !== undefined && Number(dataIndex) === (addedFrom - 1)) {
						//console.log('insert after here!!',dataIndex);
						$(row).after(rows);
						processed += addLength;
						addEnd = true;
					} else if (dataIndex !== null && dataIndex !== undefined && Number(dataIndex) === addedFrom) {
						//console.log('insert before here!!',dataIndex)
						//앞에 넣는경우 홀짝과 data attribute처리가 순서 맞지 않음. 뒤에서 한 작업을 여기서 반복해야 하는 문제. 
						var $row = $(row);
						$row.before(rows);
						processed += addLength;
						var newIndex = Number(dataIndex) + addLength;
						if (newIndex < drawnIndex.end) {
							if (updateEvenOdd && addLength % 2) {
								$row[processed % 2 ? 'addClass' : 'removeClass']('row-odd');
								$row[processed % 2 ? 'removeClass' : 'addClass']('row-even');
							}
							row.setAttribute('data-alopexgrid-dataindex', newIndex);
						} else {
							$row.remove();
						}
						addEnd = true;
					} else {
						//그 어디에도 해당하지 않음. 맞는 위치를 찾을때까지 계속 전진.
						processed++;
					}
				} else {
					//이미 추가가 끝난 상태라면 row들의 dataIndex를 업데이트 해야 한다. items.length만큼 증가시킨다.
					//또는 rendered범위를 넘어간 경우 삭제한다.
					if (deleteAfter - addLength <= idx) {
						//console.log('remove this row',idx);
						$(row).remove();
						removed++;
					} else if (dataIndex !== null && dataIndex !== undefined) {
						var newIndex = Number(dataIndex) + addLength;
						if (newIndex < drawnIndex.end) {
							//console.log('update dataindex this row',idx);
							row.setAttribute('data-alopexgrid-dataindex', newIndex);
							processed++;
						} else {
							//console.log('remove this, not update',idx)
							deleteAfter++;//삭제해야 할 row가 하나 더 생겼으므로 원래 삭제하려고 했던 시점을 연기시킨다.
							$(row).remove();
						}
					} else {
						//console.log('nothing with this row',idx)
						processed++;
					}
					if (updateEvenOdd && dataIndex !== null && dataIndex !== undefined) {
						if (processed % 2) {
							$(row).removeClass('row-even').addClass('row-odd');
						} else {
							$(row).addClass('row-even').removeClass('row-odd');
						}
					}
				}
			}
			;

			self.$tablebody.children('.row').each(rowAdder);
			//      if(self.state.hasFixColumn) {
			//        self.state.$fixcoltable.children('.table-body').children('.row').each(rowAdder);
			//      }

			if (!addEnd) {
				//loop를 돌고도 end가 나지 않았다면 row가 없는케이스. 이때는 생으로 만들어서 붙여야 한다.
				//console.log('no rows! append to begining')
				if (addLength) {
					self.$tablebody.children('.row').each(function(idx, row) {
						if (idx < addLength) {
							$(row).remove();
						}
					});
				}
				self.$tablebody.prepend(rows);
			}
			if (self.state.hasFixColumn) {
				//고정컬럼도 같은 메커니즘을 적용할 수 있는가? 
				//self.viewUpdate();
				var compensated = false;
				var fixcol = false;
				if (!self.option.height) {
					fixcol = true;
					self._fixColumnLoad();
				} else {
					if (!self.state.hasVerticalScrollBar) {//없다가 있을 수가 있으므로.
						compensated = true;
						fixcol = true;
						self.viewUpdate({
							scrollLeft: 0
						});
					}
				}
				if (!fixcol) {
					self._fixColumnLoad();
				}
				if (!compensated) {
					if (self.state.lastScrollLeft !== 0) {
						self.$scroller.prop('scrollLeft', 0);
					}
				}
			}
		}
		self._refreshEditableCellAll();
		self._needEditedRefresh();
		clearSelection();
		viewUpdateForRowBasedHeight(self,beforeDataLength);
		setTimeout(function(){dataChangeCallback(self, "changed",["add"]);},0);
		return;
	};

	AlopexGrid.prototype._scrollerReset = function() {
		var self = this;
		//데이터 초기화시에 문제발생소지.
		delete self.state.lastScrollTop;
		delete self.state.lastScrollLeft;
		delete self.state.scrollerScrollHeight;
		self.$scroller.prop("scrollTop", 0).prop("scrollLeft", 0);
	};
	AlopexGrid.prototype.dataSet = function(dataList, _dataonly) {
		var self = this;
		if(dataChangeCallback(self, "set", [dataList]) === false) {
			return false;
		}
		self.state.data = [];
		self.state.deletedData = [];
		if (!dataList) {
			self.dataEmpty();
			return;
		}
		if (!$.isArray(dataList)) {
			if (typeof dataList == "object") {
				dataList = [dataList];
			} else {
				self.dataEmpty();
				return;
			}
		}
		if(self.option.dataLengthLimit && (self.state.data.length + items.length) > self.option.dataLengthLimit) {
			var msg = self.option.message.dataLengthLimit || "Exceed Limit.";
			if($.isFunction(msg)) {
				msg = msg(self.state.data.length + items.length);
			}
			alert(msg);
			return;
		}
		if(self.option.defaultSortingOnDataSet) {
			//viewInit routine -> moved here.
			self._processDefaultSorting();
		}
		for (var i = 0; i < dataList.length; i++) {
			var item = dataList[i];
			item._state = $.extend({
				edited: false,
				editing: false,
				selected: false,
				added:false,
				deleted : false
			}, self.option.defaultState.dataSet, self.option.extendStateOnSet ? item._state : null);
			item._index = item._index || {};
			item._index.id = _generateUniqueId();
			self.state.dataFilltrimmer(item);
			self.state.dataCompositor(item);
			item._original = AlopexGrid.trimData(item);
			self.state.data.push(item);
		}

		if ($.isPlainObject(_dataonly)) {
			//동적 데이터 처리 로직
			var dynamicOption = $.extend({},_dataonly);
			if(_valid(dynamicOption["dataLength"]) && _valid(dynamicOption['current'])) {
				var pobj = {};
				pobj["current"] = Number(dynamicOption["current"]);
				pobj["dataLength"] = Number(dynamicOption["dataLength"]);
				pobj["perPage"] = Number(dynamicOption["perPage"] || self.state.data.length);
				pobj["total"] = Number(dynamicOption["total"] || (((pobj["dataLength"]/pobj["perPage"])|0) + (pobj["dataLength"]%pobj["perPage"]?1:0)));
				self.state._paddingDataLength = self.option.pager ? (pobj.perPage * (pobj.current - 1) || 0) : 0;
				self.option.paging.customPaging = pobj;
			}
			if(_valid(dynamicOption["sortingColumn"]) || _valid(dynamicOption["sortingKey"])) {
				self.state.sortingColumn = Number(dynamicOption["sortingColumn"]);
				if(!_valid(dynamicOption["sortingColumn"])) {
					for(var i=0,l=self.option.columnMapping.length;i<l;i++) {
						var m = self.option.columnMapping[i];
						var ci = m.columnIndex;
						if(ci !== undefined && ci !== null && m.key === dynamicOption["sortingKey"]) {
							self.state.sortingColumn = Number(ci);
							break;
						}
					}
				}
				self.state.sortingDirection = dynamicOption["sortingDirection"] || "asc";
			}
			self.state.dynamicBinding = true;
		} else {
			if (self.option.paging && self.option.paging.customPaging) {
				delete self.option.paging.customPaging;
			}
			if(!self.option.defaultSortingOnDataSet) {
				delete self.state.sortingColumn;
				delete self.state.sortingDirection;
			}
			self.state.dynamicBinding = false;
			self.state._paddingDataLength = 0;
		}

		self._scrollerReset();
		if (_dataonly !== true) {
			self.$tablebody.empty();
			self.$scroller.prop('scrollLeft',0).prop('scrollTop',0);
			self._simpleRedraw(null,{scrollLeft:0,scrollTop:0});
		}
		self._refreshEditableCellAll();
		setTimeout(function(){dataChangeCallback(self, "changed",["set"]);},0);
		//this.updateOption();
	};
	AlopexGrid.prototype.clear = function(flushCallback) {
		this.dataFlush(flushCallback);
		this.dataEmpty();
	};
	AlopexGrid.prototype.dataEmpty = function(data) {
		if(dataChangeCallback(this, "empty", [])===false) {
			return false;
		}
		this.state.data = [];
		this.state.deletedData = [];
		this.state.rendered = [];
		var self = this;
		self._scrollerReset();
		self._simpleRedraw(null,{scrollLeft:0,scrollTop:0});
		setTimeout(function(){dataChangeCallback(self, "changed",["empty"]);},0);
		//this.updateOption();
	};
	AlopexGrid.prototype._getActualDataByIndex = function(_index) {
		var self = this;
		if(_index.data) {
			return self.state.data[_index.data];
		}
		if(_index.row) {
			return self.state.data[self.state.rendered[_index.row]];
		}
		if(_index.id) {
			return self.state.data[self.state.dataIdMap[_index.id]];
		}
		return null;
	};
	AlopexGrid.prototype.dataGetByIndex = function(index, getrecent) {
		//index.row : 현재 페이지에서의 row index
		//index.data : state.data에서의 index
		//index.element : 데이터를 가져오고자 하는 row 또는 row를 구성하는 element
		if (this._noData() || !index) {
			return null;
		}
		var self = this;
		if(index && typeof index._index === "object") {
			index = index._index;
		}
		if (index.id) {
			var data = null;
			$.each(this.state.data, function(idx, d) {
				if (_isUserReadableData(d) && d._index && d._index.id === index.id) {
					self.state.dataCompositor(d);
					data = $.extend(true, {}, d, getrecent===true?AlopexGrid.trimData(d._state.recent):null);
					return false;
				}
			});
			return data;
		}
//		if(index.hasOwnProperty('row')) {
//			var dataIndex = self.state.rendered[index.row];
//			var d = $.extend(true, {_index:{row:index.row,data:dataIndex}}, self.state.data[dataIndex])
//			if(dataIndex !== undefined && self.state.data[dataIndex]) {
//				return d;
//			}
//			return null;
//		}
		var dataIndex = typeof index.data == "number" || !isNaN(Number(index.data)) ? Number(index.data) : null;
		if(dataIndex === null && index.hasOwnProperty('row')) {
			dataIndex = self.state.rendered[index.row];
			dataIndex = _valid(dataIndex) ? Number(dataIndex) : null;
		}
		if(dataIndex === null && index.element) {
			var $row = $(index.element).eq(0);
			if(!$row.hasClass('bodyrow')) {
				$row = $row.parentsUntil(self.$scroller, '.bodyrow').eq(0);
			}
			var di = $row.attr('data-alopexgrid-dataindex');
			if(_valid(di)) {
				dataIndex = Number(di);
			}
		}
		if(dataIndex === null) {
			return null;
		}
		if(!_isUserReadableData(self.state.data[dataIndex])) return null;
		self.state.dataCompositor(self.state.data[dataIndex]);
		var data = $.extend(true,{_index:{},_state:{}}, this.state.data[dataIndex],
				getrecent===true?AlopexGrid.trimData(this.state.data[dataIndex]._state.recent):null);
		var rowIndex = $.inArray(dataIndex, self.state.rendered);
		if(rowIndex >= 0) {
			data._index["row"] = Number(rowIndex);
		}
		data._index["data"] = Number(dataIndex);
		//if(index.element !== undefined || index.row !== undefined) {
		if (index.element !== undefined) {
			var colidx = index.element.getAttribute('data-alopexgrid-columnindex');
			if (colidx === undefined || colidx === null) {
				var $indexelem = $(index.element);
				colidx = $indexelem.parentsUntil(self.$scroller, '.cell').eq(0).attr('data-alopexgrid-columnindex');
			}
			$.each(self.option.columnMapping, function(idx, mapping) {
				if (Number(mapping.columnIndex) === Number(colidx)) {
					data._index["column"] = Number(mapping.columnIndex);
					data._key = mapping.key;
					return false;
				}
			});
		}
		return data;
	};

	var _KeyUnreadable = "__unreadable__";
	function _isUserReadableData(data) {
		if(!data || (data && data[_KeyUnreadable]) || (data && !data._state)) return false;
		return true;
	}
	function _setDataUnreadable(data,unset) {
		if(!data) return;
		data[_KeyUnreadable] = (unset===false)?false:true;
	}
	function _dataMeetsQuery(self, datalist, dataIndex, query) {
		query = query || {};
		//query의 조건이 하나라도 맞지 않으면 false처리한다.
		var data = datalist[dataIndex];
		if(!_isUserReadableData(data)) {
			return false;
		}
		if(query._index) {
			if(query._index.hasOwnProperty('id')){
				if(query._index.id === data._index.id) return true;
				return false;
			}
			if(query._index.hasOwnProperty('data')){
				if(query._index.data === dataIndex) return true;
				return false;
			}
			if(query._index.hasOwnProperty('row')){
				if(self.state.rendered[query._index.row] === data._index.data) return true;
				return false;
			}
		}
		if(query.nodeType || query.jquery) {
			var $row = query.jquery ? query : $(query);
			if(!$row.hasClass('bodyrow')) {
				$row = $row.parentsUntil(self.$scroller, '.bodyrow').eq(0);
			}
			var di = $row.attr('data-alopexgrid-dataindex');
			if(!_valid(di) || Number(dataIndex) !== Number(di)) {
				return false;
			}
		}
		if($.isPlainObject(query._state)) {
			for(var prop in query._state) {
				if(query._state[prop] !== data._state[prop]) {
					return false;
				}
			}
		}
		var trimmedquery = AlopexGrid.trimData(query);
		if(!$.isEmptyObject(trimmedquery)) {
			var failed = false;
			$.each(trimmedquery, function(key, val){
				if(data[key] !== val) {
					failed = true;
					return false;
				}
			});
			if(failed) return false;
		}
		return true;
	}
	AlopexGrid.prototype.dataGet = function(query) {
		//query._state.added/selected/deleted
		var self = this;
		var ret = [];
		var queries = $.makeArray($.isArray(query) ? query : arguments);
		if($.isArray(query) && arguments[1]===true) {
			queries.push(true);
		}
		var getrecent = arguments[arguments.length-1] === true;
		if(getrecent) {
			while ($.inArray(true, queries) > -1) {
				queries.splice( $.inArray(true, queries), 1 );
			}
		}
		if(!self.option.leaveDeleted && queries.length) {
			//self.state.deletedData에 삭제데이터가 관리되는 경우
			var qcopied = [];
			for(var i=0,l=queries.length;i<l;i++) {
				if(queries[i] && queries[i]._state && queries[i]._state.deleted) {
					qcopied.push(queries[i]);
				}
			}
			if(qcopied.length) {
				var deleted = self.state.deletedData || [];
				for(var i=0,l=deleted.length;i<l;i++) {
					var d = deleted[i];
					var meets = false;
					for(var j=0,k=qcopied.length;j<k;j++) {
						if(_dataMeetsQuery(self, deleted, i, qcopied[j])) {
							//하나라도 해당될경우(or조건)
							meets = true;
						}
					}
					if(meets) {
						ret.push(d);
					}
				}
			}
		}
		if(!queries.length) {
			queries.push({});
		}
		for(var i=0,l=self.state.data.length; i<l;i++) {
			var meets = false;
			for(var j=0,k=queries.length;j<k;j++) {
				if(self.state.data[i]._state.meta) continue;
				if(_dataMeetsQuery(self,self.state.data, i, queries[j])) {
					meets = true;
					break;
				}
				if(queries[j]._index && queries[j]._index.hasOwnProperty('row')) {
					if(self.state.rendered[queries[j]._index.row] == i) {
						meets = true;
						break;
					}
				}
			}
			if(meets) {
				var d = self.dataGetByIndex({
					data: i
				},getrecent);
				ret.push(d);
			}
		}
		if (queries.length === 1 && query &&
			query.sorting && typeof query.sorting === "object" && query.sorting.hasOwnProperty('columnIndex')) {
			var cindex = Number(query.sorting.columnIndex);
			var dir = query.sorting.order || 'asc';
			var filt = query.sorting.type;
			ret = self._dataSort(ret, cindex, dir, filt);
		}
		return ret;
	};
	AlopexGrid.prototype.dataEdit = function(data, queries, op) {
		var self = this;
		data = data || {};
		if(dataChangeCallback(self, "edit", [data, queries]) === false) {
			return false;
		}
		if (this._noData()) {
			return;
		}
		if (!$.isArray(queries)) {
			queries = [queries];
		}
		var trimmedData = AlopexGrid.trimData(data);
		//* TODO dataEdit 로직 최적화 재구현
		var editedIndex = [];
		$.each(queries, function(idx,query) {
			var datalist = self.dataGet(query);
			if(!$.isArray(datalist) || !datalist.length) {
				return;
			}
			$.each(datalist, function(didx,targetdata){
				var dataIndex = targetdata._index.data;
				var prevData = targetdata;
				var trimmedPrev = AlopexGrid.trimData(prevData);
				var newData = $.extend(true,
					{ _index:{},_state:{} },
					{ _index : prevData._index, _state : prevData._state },
					{ _index : data._index || {},
						_state : data._state || {},
						_original : targetdata._original},
					//prevData, data
					trimmedPrev,trimmedData
				);
				if (prevData._state.editing && $.isPlainObject(prevData._state.recent)) {
					newData._state.recent = $.extend({},
						//prevData, 
						trimmedPrev,
						AlopexGrid.trimData(prevData._state.recent),
						//data
						trimmedData
					);
				}
				var trimmedNew = AlopexGrid.trimData(newData);
				if($.isFunction(self.option.valueFilter)) {
					for(var prop in trimmedNew) {
						var filtered = self.option.valueFilter(trimmedNew[prop],newData);
						if(filtered === false) {
							//forbid invalid value
							return ($.isFunction(self.option.message.valueFilter)
								? self.option.message.valueFilter(trimmedNew[prop],newData) : self.option.message.valueFilter)
								|| false;
						} else if(typeof filtered == "string" || typeof filtered == "number") {
							newData[prop] = String(filtered);
						}
					}
				}
				var diffkey = [];
				for(var prop in trimmedPrev) {
					if(trimmedPrev[prop] !== trimmedNew[prop]) {
						diffkey.push(prop);
					}
				}
				for(var prop in trimmedNew) {
					if(trimmedNew[prop] !== trimmedPrev[prop] && $.inArray(prop, diffkey) < 0) {
						diffkey.push(prop);
					}
				}
				var diffmap = $.map(diffkey, function(key, idx) {
					var mapped = {"key":key};
					var ci = getColumnIndexByKey(self.option.columnMapping, key);
					if(_valid(ci)) {
						mapped["column"] = ci;
					}
					return mapped;
				});
				newData["_prev"] = prevData;
				newData["_edited"] = diffmap;
				if(diffkey.length || self.option.forceEditedOnEdit) {//set edited state only if there is change
					newData._state.edited = true;
				}
				self.state.dataCompositor(newData);
				self.state.data[dataIndex] = newData;
				editedIndex.push(Number(dataIndex));

				if (self.option && self.option.on && self.option.on["edit"]) {
					var cb = self.option.on["edit"];
					if ($.isFunction(cb)) {
						cb = [cb];
					}
					$.each(cb, function(idx, callback) {
						callback.call(self, newData);
					});
				}

				delete newData["_prev"];
				//delete newData["_edited"];
			});
		});

		if (self.option.flushOnEdit) {
			self.dataFlush();
		}
		if(editedIndex.length) {
			setTimeout(function(){dataChangeCallback(self, "changed",["edit"]);},0);
		}
		if(op && op.norender===true) return;
		if (editedIndex.length>30) {
			self._dataDraw({
				tableheader: {
					display: 'none'
				}
			});
			if (self.state.hasFixColumn) {
				self._fixColumnLoad();
				self.$scroller.trigger('scroll');
			}
		} else {
			var hasrow = false;
			for(var i=0;i<editedIndex.length;i++) {
				var dataIndex = editedIndex[i];
				if($.inArray(dataIndex, self.state.rendered) >= 0) {
					hasrow = true;
					break;
				}
			}
			if(hasrow) {
				var $rows = self.$tablebody.children();
				$rows.each(function(idx, row) {
					var dataIndex = row.getAttribute('data-alopexgrid-dataindex');
					if(_valid(dataIndex) && $.inArray(Number(dataIndex),editedIndex) >= 0) {
						self._redrawRow($(row), self.state.data[dataIndex]);
					}
				});
			}
		}

		if(editedIndex.length) {
			self._needEditedRefresh();
		}
		return;

	};
	//TODO nocommit대신 flush option으로 처리 
	AlopexGrid.prototype.dataFlush = function(callback, fop) {
		var self = this;
		var option = this.option;
		if (typeof callback == "object") {
			fop = callback;
		}
		fop = fop || {};
		if (typeof option.flushCallback == "function" || typeof callback == "function") {
			var dirties = this.dataGet({ _state: { edited: true } }, { _state: { added:true } });
			var deleted = this.dataGet({ _state: { deleted: true } });
			if (typeof option.flushCallback == "function")
				option.flushCallback.call(this, dirties, deleted);
			if (typeof callback == "function")
				callback.call(this, dirties, deleted);
		}
		if (fop.noCommit === true) {
			return;
		}
		$.each(this.state.data, function(idx, data) {
			var changed = false;
			if (data._state && (data._state.edited || data._state.added) && !fop.leaveEdited) {
				data._state.added = false;
				data._state.edited = false;
				changed = true;
			}
			if(changed) {
				self.state.dataCompositor(data);
				data._original = AlopexGrid.trimData(data);
			}
		});
		if (!fop.leaveDeleted) {
			if(self.option.leaveDeleted) {
				self.dataDelete({_state:{deleted:true}},null,true);
			}
			this.state.deletedData = [];
		}
		if ((!fop.leaveEdited) && (!fop.noredraw)) {
			self._simpleRedraw();
		}
	};
	function _deleteRecent(data) {
		delete data._state.recent;
		delete data._state._editableStarted;
	}
	AlopexGrid.prototype.dataRestore = function(query) {
		var self = this;
		var datalist = self.dataGet(query);
		if(!datalist || !datalist.length) return;
		var refreshall = _isEmptyQuery(query);
		var count = 0;
		$.each(datalist, function(idx, targetdata){
			var data = self.state.data[targetdata._index.data];
			$.extend(data, data._original);
			if(data._state.edited) count++;
			if(data._state.editing) {
				_deleteRecent(data);
			}
			data._state.edited = false;
			if(!refreshall) {
				self.refreshRow(targetdata);
			}
		});
		if(refreshall && count) {
			self._simpleRedraw();
		}
	};
	/**
	 * undelete : option.leaveDeleted=true일 때, 삭제처리된 데이터를 복원시킬떄 사용
	 * deletefromdata : state.deletedData로 삭제 데이터를 이동시킴. dataFlush에서 사용.
	 */
	AlopexGrid.prototype.dataDelete = function(query, undelete, deletefromdata) {
		var self = this;
		if(dataChangeCallback(self, undelete===true?"undelete":"delete", [query]) === false) {
			return false;
		}
		if (self._noData()) {
			return;
		}
		var datalist = self.dataGet(query);
		var indexes = [];
		$.each(datalist, function(idx, data) {
			indexes.push(data._index.data);
		});
		var dellist = [];
		//IE8 sort 이슈 http://www.zachleat.com/web/array-sort/
		indexes.sort(function(m1, p1) {
			var m = Number('' + m1), p = Number('' + p1);
			if (m < p)
				return 1;
			if (m > p)
				return -1;
			return 0;
		});
		if(self.option.leaveDeleted && deletefromdata !== true) {
			//비삭제모드
			$.each(indexes, function(idx, index) {
				//undelete 기능. deleteit이 false인경우 삭제를 복원한다.
//				self.state.data[index]._state.deleted = (deleteit===false)? false : true;
//				self.state.data[index]._state.selected = false;
//				self.state.data[index]._state.editing = false;
				if(self.state.data[index] && self.state.data[index]._state &&
					!self.state.data[index]._state.added) {
					self._dataSetState({_index:{data:index}}, {deleted:(undelete===true)? false : true}, true);
					self.state.dataCompositor(self.state.data[index]);
					dellist.push(self.state.data[index]);
				} else {
					//added후 삭제되는 데이터는 관리하지 않는다.
					delete self.state.dataIdMap[self.state.data[index]._index.id];
					self.state.data.splice(index,1);
				}
			});
		} else {
			$.each(indexes, function(idx, index) {
				delete self.state.dataIdMap[self.state.data[index]._index.id];
				var deleted = self.state.data.splice(index, 1)[0];
				deleted._state.deleted = true;
				self.state.deletedData = self.state.deletedData || [];
				if(deleted && deleted._state && !deleted._state.added) {
					//added후 삭제되는 데이터는 관리할 필요가 없음
					self.state.dataCompositor(deleted);
					self.state.deletedData.push(deleted);
					dellist.push(deleted);
				}
			});
		}
		if (self.option.on && this.option.on.del && undelete !== true) {
			self.option.on.del(dellist);
		}
		if (self.option.flushOnEdit) {
			self.dataFlush({
				noredraw: true
			});
		}
		self._closeTooltip();
		self.pageInfo();
		self._dataDraw();
		self.viewUpdate();
		if(self.state.hasVerticalScrollBar && self.$scroller.prop('scrollHeight') <= self.$scroller.prop('clientHeight')) {
			//if hor/ver scrollbar meets the situation where both should be disappeared, 
			//horizontal scrollbar prohibits verticalScrollbar area from disappearing.
			//in that case, view Update one more time.
			self.viewUpdate();
		}
		self._needEditedRefresh();
		setTimeout(function(){dataChangeCallback(self, "changed",[undelete===true?"undelete":"delete"]);},0);
	};
	AlopexGrid.prototype.dataUndelete = function(query) {
		return this.dataDelete(query, true);
	};



	function _queryMapper(d){ if($.isPlainObject(d) || $.isArray(d)) { return d; } }
	function _editingMapper(d){ if($.type(d)==="boolean" || d===null) return d; }
	function _appendMapper(d){ if($.type(d)==="string") return d; }
	function _unpinFromStateByIdx(self, idxlist) {
		for(var i = self.state.pinnedData.length-1; i>=0; i--) {
			if($.inArray(i, idxlist) >= 0) {
				var id = self.state.pinnedData[i];
				delete self.state.pinnedDataState[id];
				self.state.pinnedData.splice(i, 1);
			}
		}
	}

	AlopexGrid.prototype._pinnedRender = function(){
		var self = this;
		var rows = [];
		if(self._hasPinnedData()) {
			var removeme = [];
			$.each(self.state.pinnedData, function(idx, dataid){
				var rendered = self._pinnedRowRender({_index:{id:dataid}});
				if(rendered) {
					rows.push( rendered );
				} else {
					removeme.push(idx);
				}
			});
			_unpinFromStateByIdx(self, removeme);
		}
		return rows;
	};
	AlopexGrid.prototype._pinnedRowRender = function(query){
		var self = this;
		var data = self.dataGetByIndex(query._index);
		if(!data) {
			return null;
		}
		$.extend(data._state, self.state.pinnedDataState[data._index.id], {selected:false});
		var row = self._rowRender(data, data._index.data, 0,
			{"disableOddEven":true, "disableSelect":true, "pinned":true,"returnRaw":true});
		return row;
	};
	AlopexGrid.prototype._pinnedRefresh = function(id){
		var self = this;
		if(!self._hasPinnedData()) return;
		var $rows = self.$root.find('.pinnedrow');
		if(!$rows.length) return;
		$rows.each(function(){
			var $row = $(this);
			var dataid = $row.attr('data-alopexgrid-dataid');
			if(dataid && !(id && id !== dataid))
				$row.replaceWith(_generateHTML(self._pinnedRowRender({_index:{id:dataid}})));
		});
	};
	AlopexGrid.prototype._hasPinnedData = function(dataid){
		var self = this;
		if($.type(dataid) === "string") {
			return $.inArray(dataid, self.state.pinnedData) >= 0;
		}
		return $.isArray(self.state.pinnedData) && self.state.pinnedData.length;
	};

	AlopexGrid.prototype.addPin = function(query, editing, append) {
		var self = this;
		var args = $.makeArray(arguments);
		query = $.map(args, _queryMapper)[0];
		editing = $.map(args, _editingMapper)[0];
		append = "add";
		return self.dataPin.call(self, query, editing, append);
	};
	AlopexGrid.prototype.dataPin = function(query, editing, append) {
		var self = this;
		var args = $.makeArray(arguments);
		query = $.map(args, _queryMapper)[0];
		editing = $.map(args, _editingMapper)[0];
		append = $.map(args, _appendMapper)[0];
		if($.type(editing) !== "boolean" && editing !== null) {
			//editing = false;//default is non-editing data.
		}
		if($.isArray(query) || ($.isPlainObject(query) && !$.isEmptyObject(query))) {
			var pinlist = self.dataGet(query);
			if(!pinlist || !pinlist.length) {
				return;
			}
			pinlist = $.map(pinlist, function(pd){return pd._index.id});
			self.state.pinnedData = (append === "add") ? (self.state.pinnedData || []) : [];
			var added = [];
			$.each(pinlist, function(idx,pid) {
				if($.inArray(pid, self.state.pinnedData)<0) {
					added.push(pid);
					var stateobj = {};
					if($.type(editing)==="boolean") {
						stateobj[pid] = {editing:editing};
					} else {
						delete stateobj[pid];
					}
					self.state.pinnedDataState = $.extend({}, self.state.pinnedDataState, stateobj);
				}
			});
			if(!added.length) {
				return;
			}
			self.state.pinnedData = self.state.pinnedData.concat(added);
			delete self.state.scrollerScrollHeight;
			delete self.state.scrollerClientHeight;
			delete self.state.tableheaderHeight;
			delete self.state.scrollerTopMargin;
			delete self.state.scrollerCss;
			//self._simpleRedraw(null, null);
			self.updateOption();
		}
	};
	AlopexGrid.prototype.dataUnpin = function(query) {
		var self = this;
		if(!self._hasPinnedData()) return;
		if($.isPlainObject(query) && !$.isEmptyObject(query)) {
			var unpinlist = self.dataGet(query);
			if(!unpinlist || !unpinlist.length) {
				return;
			}
			unpinlist = $.map(unpinlist, function(upd){return upd._index.id});
			var unpinned = [];
			$.each(unpinlist, function(idx, upid){
				var aidx = $.inArray(upid, self.state.pinnedData);
				if(aidx >= 0) {
					unpinned.push(aidx);
				}
			});
			if(!unpinned.length) {
				return;
			}
			_unpinFromStateByIdx(self, unpinned);
		} else {
			self.state.pinnedData = false;
		}
		delete self.state.scrollerScrollHeight;
		delete self.state.scrollerClientHeight;
		delete self.state.tableheaderHeight;
		delete self.state.scrollerTopMargin;
		delete self.state.scrollerCss;
		//self._simpleRedraw(null, null);
		self.updateOption();
	};

	AlopexGrid.prototype._findClonePair = function(elem) {
		var self = this;
		if(!self.state.hasFixColumn) {
			return elem;
		}
		var $elem = $(elem);
		var $target = $();
		var $row = $elem.attr('data-alopexgrid-dataid') ? $elem : $elem.parents('.row').eq(0);
		var $cell = $elem.attr('data-alopexgrid-columnindex') ? $elem : $elem.parents('.cell').eq(0);
		var wasOnFixcol = $row.hasClass('cloned-row');
		var rowidx = $row.index();
		if(rowidx < 0) {
			return $target;
		}
		var colidx = $cell.index();
		var $body = wasOnFixcol ? self.$tablebody : self.state.$fixcolbody;//to opposite
		if(rowidx >= 0) {
			$target = $body.children().eq(rowidx);
		}
		if(colidx >= 0) {
			$target = $target.children().eq(colidx);
		}
		return $target;
	};
	AlopexGrid.prototype._fixColumnLoad = function(viewoption) {
		var self = this;
		var option = this.option;

		var $scroller = this.$scroller;

		if (!self.state.viewUpdating) {
			if (!option.height) {
				delete self.state.scrollerClientHeight;
			}
		}

		//var scrollerTopMargin = option.scroll?(tableheaderHeight):0;
		//var scrollerTopMargin = option.scroll?($scroller.css('margin-top').split('px')[0]):0;
		//TODO 고정용 컬럼이 있는경우 - scroller와 연동(left제어), 고정컬럼용 테이블의 너비 조정
		//컬럼고정용 고정헤더와, 고정바디를 생성. columnIndex 0부터 고정될 수 있으며, 0부터 연속된 컬럼에 대해 고정할 수 있다.
		//불연속 컬럼에 고정요청을 할 경우 수행되지 않는다. 헤더그룹이 지정된 경우 전체 그룹의 컬럼이 고정되지 않으면
		//해당 그룹은 고정되지 않는다.
		var fixupto = self.state.fixupto;
		var _count = -1;
		var twidth = 0;
		//    option.columnMapping.sort(function(f,l) {
		//      if(f.columnIndex > l.columnIndex) return 1;
		//      if(f.columnIndex < l.columnIndex) return -1;
		//      return 0;
		//    });
		var colgrouphtml = '<colgroup>';
		var stopit = false;
		$.each(option.columnMapping, function(idx, mapping) {
			if (!isMappingVisible(mapping)) {
				return;
			}
			if (mapping.fixed) {
				if (!mapping.hasOwnProperty('width')) {
					stopit = true;
					return false;
				}
				twidth += Number(mapping.width.split("px")[0]);
				_count++;
				colgrouphtml += '<col data-alopexgrid-columnindex="'+mapping.columnIndex+'" style="width:' + (mapping.width) + ';">';
			}
		});
		colgrouphtml += '</colgroup>';
		if (stopit) {
			return;
		}
		if (fixupto >= 0 && self.state.hasHorizontalScrollBar) {
			var $table = this.$table;
			var $tableheader = this.$tableheader;
			var tableheaderHeight = Number(this.state.tableheaderHeight || $tableheader.height());//$tableheader.height();
			var ratio = this._colRatio();
			var drawnIndex = this._pageDrawnIndex();
			var startIndex = drawnIndex.start;
			var endIndex = drawnIndex.end;
			var drawn = 0;
			var collen = 0;
			var nowrapdiv = false;
			var width = (twidth * ratio + (ratio > 1.01 ? 2 : 0)) | 0;
			for ( var j in this.option.columnMapping) {
				var mapping = self.option.columnMapping[j];
				if (isMappingVisible(mapping)) {
					collen++;
				}
			}
			//헤더복제. 복제된 테이블은 .cloned.fixed-column을 가진다.
			var $h = null;
			//$h = $table.clone().addClass("cloned fixed-column fixed-header");
			//$h.children('.table-body').remove();
			//$h.children('.table-header').show();
			$h = $('<table class="table cloned fixed-column fixed-header fixcol" style="' + $table.attr('style') + ';position:absolute;top:0px;left:0px;">');
			if (isChrome && option.compensate1px) {
				$h.css("top", "-1px");
			}
			$h.css({"margin-top":"","margin-bottom":""});//vscroll
			//var colgrouphtml = '<colgroup>'+this.$colgroup.html()+'</colgroup>';
			//$h.append(colgrouphtml);
			$h.append(self.$colgroup.clone());
			$h.append('<thead class="table-header">' + this._headerRender() + '</thead>');

			//$h.css({"position":"absolute", "top":"0px","left":"0px"});
			//      var $colgroup = $h.find('colgroup');
			//$colgroup.children('col').filter(function(idx){if(idx>fixupto) return true;}).remove();
			//      $h.children('.table-header').children('.row').each(function(idx1,row) {
			//        //$(row).children('.cell').filter(function(idx2){if(idx2>fixupto) return true;}).remove();
			//        $(row).children('.cell').each(function(idx2,el) {
			//          if(!$(el).html()) {
			//            $(el).html("&nbsp;");
			//          }
			//        });
			//      });
			var finalheight = tableheaderHeight;//($tableheader.is(':visible') ? tableheaderHeight : $scroller.find('.fixed-items .table.cloned').height())-1;
			$h.css({
				//"height": (finalheight)+"px",
				"width": width + "px"
			});
			var $wrapheader = $('<div class="fixed-header-div fixcol">').append($h);
			var wrapperHeight = tableheaderHeight;
			//      wrapperHeight += Number($tableheader.css('border-top-width').split('px')[0])
			//      wrapperHeight += Number($tableheader.css('border-bottom-width').split('px')[0])
			wrapperHeight += 2;
			$wrapheader.css({
				"position": "absolute",
				"top": "0px",
				"left": "0px",
				"overflow": "hidden",
				//"width":($h.outerWidth()+2)+'px',"height":($h.outerHeight()+2)+'px'});
				"width": (width + 2) + 'px',
				"height": wrapperHeight + 'px'
			});
			var $rows = this.$tablebody.children('.bodyrow');
			//      var colgrouphtml = $colgroup.html();
			var bodytopComp = 0;//헤더높이가 정확히 맞지 않는 경우 compensate TODO 고정헤더 등 전체 영역에 적용 가능?
			//var scrollerClientHeight = this.state.scrollerClientHeight = this.state.scrollerClientHeight || $scroller.prop('clientHeight');
			var vscroll = self._vscrollInfo();
			var scrollerClientHeight = $scroller.prop('clientHeight');
			var wrapdiv = ['<div class="fixed-body-div fixcol" '];
			//wrapdiv.push('style="height:',$scroller.prop("clientHeight"),"px;","overflow:hidden;position:absolute;");
			wrapdiv.push('style="height:', scrollerClientHeight - bodytopComp - (option.floatingHeader?0:0), "px;", "overflow:hidden;position:absolute;");
			//wrapdiv.push('top:',($scroller.css('margin-top')),';left:0px;width:',(twidth*ratio+2)|0,'px;"></div>');
			//wrapdiv.push('top:', this.state.scrollerMarginTop + bodytopComp, 'px;left:0px;width:', ((twidth * ratio) | 0) + 1, 'px;"></div>');
			wrapdiv.push('top:', (option.floatingHeader?this.state.scrollerTopMargin:0) + bodytopComp, 'px;left:0px;width:', ((twidth * ratio) | 0) + 1, 'px;"></div>');
			var body = [];
			body.push('<table class="table cloned fixed-column fixed-body"');
			//body.push(' style="width:',(twidth*ratio+(ratio>1?2:0))|0,'px;height:',$table.height(),'px;');
			//body.push(' style="width:',(twidth*ratio+(ratio>1.01?2:1)),'px;height:',this.state.scrollerScrollHeight,'px;');
			body.push(' style="width:', (twidth * ratio + (ratio > 1.01 ? 2 : 1)), 'px;');
			//body.push('height:',this.state.scrollerScrollHeight,'px;') //고정컬럼body table의 높이 지정은 우선 하지 않는다.
			body.push('background-color:white;');
			var toppx = -(viewoption && viewoption.scrollTop ? viewoption.scrollTop : 0) - bodytopComp;
			if(self.option.floatingHeader===false) {
				toppx += self.state.scrollerTopMargin;
			}
			//body.push(-(viewoption && viewoption.scrollTop ? viewoption.scrollTop : $scroller[0].scrollTop),'px;');
			if(vscroll) {
				//body.push('margin-top:',vscroll["paddingTopHeight"],'px;');
				//body.push('margin-bottom:',vscroll["paddingBottomHeight"],'px;');
				toppx += vscroll["paddingTopHeight"];
				startIndex = self.state.rendered[vscroll["startIndex"]];
				endIndex = self.state.rendered[vscroll["endIndex"]]+1;
			}
			body.push('top:',toppx, 'px;');
			body.push('table-layout:fixed;position:absolute;" ');
			if(vscroll) {
				body.push('data-vscroll-top="',vscroll["paddingTopHeight"],'"');
			}
			body.push('>');
			//      body.push('<colgroup>');
			body.push(colgrouphtml);
			//      body.push('</colgroup><tbody class="table-body">');
			body.push('<tbody class="table-body">');
			var nodata = false;
			if (endIndex < 0 || !this.state.data || !this.state.data.length) {
				//nowrapdiv = true;
				if (!this.option.rowPadding) {
					body.push('<tr class="emptyrow">');
					for (var j = 0; j < collen; j++) {
						body.push('<td></td>');
					}
					body.push('</tr>');
				}
				nodata = true;
				//        if(this.option.message && this.option.message.nodata) {
				//          body.push('<tr class="row emptyrow"><td class="cell" colspan="',(fixupto+1),'">',this.option.message.nodata);
				//          body.push('</td></tr>');
				//          drawn++;
				//        }
			} else {
				var pheight = 1000;
				for (var i = startIndex; i < endIndex; i++) {
					var data = this.state.data[i];
					var renderop = {
						columnLimit: fixupto
					};
					//TODO 높이 연동은 속도저하가 있을 수 있음.
					//var height = $row.height();
					renderop.css = {};
					if (!this.state.rowspanned) {
						//renderop.css["height"] = height+"px";
					}

					//if(isChrome || this.option.fixColumnForceRowHeight){
					var $row = $rows.eq(drawn);
					var h = getRowHeight(self, $row) || (vscroll ? vscroll["rowHeight"] : null);
					//height = height < pheight ? height : pheight;
					renderop.css["height"] = h + "px";
					$row.data('dataHeight', h+'px');
					//pheight = height;
					//}

					//renderop.styleclass= $row.hasClass("hovering") ? "hovering":"";
					renderop.styleclass = data._state.hovering ? "hovering" : "";
					renderop.styleclass += ' cloned-row';
					var rendered = this._rowRender(data, i, drawn, renderop);
					body.push(rendered);
					//          $row.children('.cell').each(function(idx,cell) {
					//            if(idx <= fixupto && idx === Number(cell.getAttribute('data-alopexgrid-columnindex'))) {
					//              $(cell).empty();//.addClass('cloned-empty');
					//            }
					//          });
					drawn++;
				}
				$rows.each(setRowDataHeight);
				this.$tablebody.find('.cell-fixcol').html('&nbsp;');
			}
			if (this.option.rowPadding) {
				var till = 0;
				if (typeof this.option.rowPadding == "number") {
					till = this.option.rowPadding;
				} else {
					till = Number(drawnIndex.perPage);
				}
				if (till > 0) {
					self._calcRowHeight();
					for (var i = drawn; i < till; i++) {
						body.push('<tr class="row emptyrow" style="height:'+self.state.rowHeight+'px">');
						for (var j = 0; j <= collen; j++) {
							body.push('<td class="cell">&nbsp;</td>');
						}
						body.push('</tr>');
					}
				}
			}
			body.push('</tbody></table>');
			self.$wrapper.find('.cloned.fixed-column').remove();
			self.$wrapper.find('.fixed-body-div,.fixed-header-div').remove();

			var $wrapdiv = null;
			var $b = null;
			if (!nowrapdiv) {
				$wrapdiv = $(wrapdiv.join(''));
				self.$wrapper.append($wrapdiv);
				$wrapdiv.html(_convertAlopex.call(self, body.join('')));
				$b = $wrapdiv.children('.table');
			}
			if ($h && $h.length) {
				self.$wrapper.append($wrapheader);
			}

			$n = null;
			if (nodata) {
				if (this.option.message && this.option.message.nodata) {
					self._calcRowHeight();
					var height = self.state.rowHeight || getRowHeight(self, $rows.eq(0));
					var width = $scroller.prop('clientWidth');
					var nobody = ['<div class="fixed-body-div" '];
					nobody.push('style="overflow:visible;position:absolute;');
					//nobody.push('top:', ($scroller.css('margin-top')), ';left:0px;');
					nobody.push('top:', (self.state.scrollerTopMargin), 'px;left:0px;');
					nobody.push('width:', width, 'px;');
					if(height) nobody.push('height:', height, 'px;');
					nobody.push('"><table class="table cloned fixed-column fixed-body table-nodata"');
					//nobody.push(' style="width:',$table.width(),'px;height:',height,'px;');
					nobody.push(' style="width:', width + 1, 'px;');
					if(height) nobody.push('height:', height, 'px;');
					nobody.push('top:0px;left:0px;');
					nobody.push('table-layout:fixed;position:absolute;">');
					nobody.push('<tbody class="table-body"><tr class="row emptyrow"><td class="cell">');
					nobody.push(this.option.message.nodata);
					nobody.push('</td></tr></tbody></table></div>');
					self.$wrapper.append(nobody.join(''));
					this.$tablebody.children('.row.emptyrow').children('.cell.cell-nodata').html('&nbsp;');
					$n = self.$wrapper.children('.fixed-body-div').children('.table-nodata');
				}
			}

			$scroller.off('.alopexgridfixcolumn'+self.key);
			$wrapdiv.off('.alopexgridfixcolumn'+self.key);
			$window.off('.alopexgridfixcolumn'+self.key);
			if (self.state.hasHorizontalScrollBar || self.state.hasVerticalScrollBar || (vscroll && !self.option.height)) {
				var lastleft = -1;
				var lasttop = -1;
				_scrollHack($scroller, '.alopexgridfixcolumn'+self.key);
				$scroller.on('scroll.alopexgridfixcolumn'+self.key, function(e) {
					if (self.state.hasHorizontalScrollBar && $h && $h.length) {
						var left = 0;
						if (lastleft !== left) {
							$h.css({
								"left": "0px"
							});
							lastleft = 0;
						}
					}
					//$b - wrapdiv내의 .table
					if (self.state.hasVerticalScrollBar && $b && $b.length) {
						var scrollTop = this.scrollTop;
						var top = ((-scrollTop) - bodytopComp);// + "px";
						var datamt = $b.attr('data-vscroll-top');//vscroll
						top += datamt ? Number(datamt) : 0;
						$n ? $n.css("top", top+"px") : "";
						if(option.floatingHeader===false) top += self.state.scrollerTopMargin;
						$b.css("top", top+"px");
						if(option.floatingHeader === false) {
							$wrapheader.css("top",(-scrollTop)+"px");
						}
						//IE - scrollTop을 다시 써주지 않으면 실제 scrollTop위치와 맞지 않는 위치에 content를 렌더링하는 문제.
						$scroller.prop('scrollTop', scrollTop);
					}
				});//.trigger('scroll');
				//        $wrapdiv.on('scroll.alopexgridfixcolumn', function(e) {
				//          console.log('wrapdiv scrolltop',this.scrollTop,'table top',$b.css('top'))
				//          //$scroller.prop('scrollTop', this.scrollTop);
				//          //$b.css('top',(-this.scrollTop)+"px");
				//          $scroller.prop('scrollTop',this.scrollTop);
				//          this.scrollTop = 0;
				//          //this.scrollTop = 0;
				//        });
			}
			if (option.scroll) {
				//스크롤 위치를 복원한다. TODO 속도문제.
				//setTimeout(function(){
				//var top = ((-$scroller[0].scrollTop)-bodytopComp)+"px";
				var top = ((-self.state.lastScrollTop || 0) - bodytopComp);
				var datamt = $b.attr('data-vscroll-top');//vscroll
				top += datamt ? Number(datamt) : 0;
				$n ? $n.css("top", top+"px") : "";
				if(option.floatingHeader===false) top += self.state.scrollerTopMargin;
				$b.css("top", top+"px");
				//},50);
			}
			$.extend(this.state, {
				hasFixColumn: true,
				$fixheaderwrap : $wrapheader,
				$fixcolwrap : $wrapdiv,
				$fixcoltable: $b,
				$fixcolbody : $b.children('.table-body'),
				$fixednobody : $n
			});
		} else {
			if (this.state.hasFixColumn) {
				//고정컬럼이 있다가 없애는 상황에서만 데이터를 새로 그리도록 한다.
				this.state.hasFixColumn = false;
				this._dataDraw({
					tableheader: {
						display: "none"
					}
				});
			}
			//      $scroller.find('.cloned.fixed-column').remove();
			//      $scroller.find('.fixed-body-div,.fixed-header-div').remove();
			$scroller.children('.fixcol').remove();
			self.state.$fixheaderwrap ? self.state.$fixheaderwrap.remove() : null;
			self.state.$fixcolwrap ? self.state.$fixcolwrap.remove() : null;
			$.extend(this.state, {
				hasFixColumn: false,
				$fixheaderwrap : null,
				$fixcolwrap : null,
				$fixcoltable: null,
				$fixcolbody : null
			});
		}
	};

	AlopexGrid.prototype._rowFocus = function(query) {
		var self = this;
		self.state.focusedDataId = self.state.focusedDataId || [];
		var data = null;
		if(query && query.nodeType && query.tagName == 'TR') {
			data = self._getActualDataByIndex({id:query.getAttribute('data-alopexgrid-dataid')});
		} else if(query && query.index) {
			data = self._getActualDataByIndex(query.index);
		}
		if(data && !data._state.focused) {
			$.each(self.state.focusedDataId, function(i,dataid){
				var pdata = self._getActualDataByIndex({id:dataid});
				if(pdata) {
					pdata._state.focused = false;
					self.rowElementGet({_index:{id:dataid}}).removeClass('focused');
				}
			});
			data._state.focused = true;
			self.state.focusedDataId.push(data._index.id);
			self.rowElementGet({_index:data._index}).addClass('focused');
		}
	};
	AlopexGrid.prototype._rowSelectAll = function(e, cell) {
		var self = this;
		if (!self.state.data || !self.state.data.length || !self.state.rendered || !self.state.rendered.length) {
			return;
		}
		if(self.option.rowSingleSelect || self.option.rowClickSelect === "only") {
			return;
		}
		var invertLater = false;
		if(e) {
			e = $.event.fix(e);
			if (!$(cell || e.currentTarget).hasClass('selector-column')) {
				return;
			}
			if(e.target.tagName !== 'INPUT') {
				invertLater = true;
			}
		}
		var $target = $(cell || e.target);
		//IE8 cannot reproduce e.currentTarget using event object.
		var $cell = (cell || e.currentTarget) ? $(cell || e.currentTarget) : $target.parentsUntil(self.$scroller, '.cell').eq(0);
		var $input = $cell.find('input');
		var selected = $input.prop('checked');
		if(invertLater) selected = !selected;
		for ( var idx in self.state.rendered) {
			var dataIndex = Number(self.state.rendered[idx]);
			var data = self.state.data[dataIndex];
			if(dataChangeCallback(self, "select", [data, selected]) === false) {
				data._state.selected = false;
			} else {
				data._state.selected = selected;
			}
//			if(data._state.deleted) {
//				data._state.selected = false;
//			}
		}
		self.state.selectAll = selected;
		self._dataDraw();
		self.viewUpdate();
		delete self.state.selectAll;
		if(self.option.on && self.option.on.data && self.option.on.data.selected) {
			dataChangeCallback(self, "selected", [$.map(self.state.rendered, function(di){return $.extend(true,{},self.state.data[di]);}), selected]);
		}
	};
	AlopexGrid.prototype._rowSelect = function($row, selected) {
		var self = this;
		$row[selected ? "addClass" : "removeClass"]("selected");
		$row.find('.selector-column input').prop("checked", selected);
		if (self.state.hasFixColumn && self.state.fixupto >= 0) {
			var $clone = this._findClonePair($row);
			$clone.find('.selector-column input').prop("checked", selected);
			$clone[selected ? "addClass" : "removeClass"]("selected");
			$clone[$row.hasClass("hovering") ? "addClass" : "removeClass"]("hovering");
		}
	};
	AlopexGrid.prototype.rowSelect = function(query, selected, e) {
		var self = this;
		var option = self.option;
		if (self._noData()) {
			return;
		}
		if (e) {
			e = $.event.fix(e);
		}
		if (e) {
			var $target = $(e.target);
			if(option.rowClickSelect) {
				if (e.target.tagName === "INPUT" && !$target.hasClass("selector-checkbox")) {
					return;
				}
				if(e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
					return;
				}
			} else {
				if(self.option.limitSelectorColumnClickArea) {
					if(!$target.hasClass('selector-checkbox')) {
						return false;
					}
				} else {
					if(!($target.hasClass('selector-checkbox')
						|| $target.hasClass('selector-column')
						|| $target.hasClass('selector-column-wrapper')
						)) {
						return;
					}
				}
			}
			if($target.hasClass("selector-checkbox") && isAlopexMobile) {
				$target.one('click', function(ee){ee.preventDefault();});
			}
		}
		var datalist = (query.nodeType && query.tagName === 'TR') ?
			[self.state.data[query.getAttribute('data-alopexgrid-dataindex')]]
			: self.dataGet(query);
		var $rows = self.$tablebody.children();
		var changedlist = [];
		var processed = [];
		for(var i=0,l=datalist.length;i<l;i++) {
			var dataIndex = datalist[i]._index.data;
			var actualdata = self.state.data[dataIndex];
			if(!_isUserReadableData(actualdata)) {
				continue;
			}
			dataIndex = Number(dataIndex);
			var prev = !!actualdata._state.selected;
			var chosen = (selected == "toggle") ? !actualdata._state.selected : !!selected;

			if(prev !== chosen) {
				changedlist.push(dataIndex);
			}
			if(dataChangeCallback(self, "select", [actualdata, chosen]) === false) {
				chosen = false;
			}
			if(self.state.rowspanned && self.option.rowspanGroupSelect) {
				var rowspanindex = _rowspanWidestIndex(self.state.rowspanindex, dataIndex);
				var rfrom = rowspanindex.from;
				var rto = rowspanindex.to;
				for(var j=rfrom;j<rto;j++) {
					self.state.data[j]._state.selected = chosen;
					processed.push(j);
				}
			} else {
				actualdata._state.selected = chosen;
				processed.push(dataIndex);
			}
		}
		if (option.rowClickSelect === "only" || option.rowSingleSelect) {
			$.each(self.state.data, function(i,d) {
				if(!!d._state.selected !== false && $.inArray(i,processed)<0) {
					changedlist.push(Number(i));
					d._state.selected = false;
				}
			});
		}

		if(changedlist.length > 50) {
			self._simpleRedraw(null, {});
		} else {
			for(var i=0,l=changedlist.length;i<l;i++) {
				var dataIndex = changedlist[i];
				var cdata = self.state.data[dataIndex];
				var sel = cdata._state.selected;
				if(self.state.rowspanned && self.option.rowspanGroupSelect) {
					var rowspanindex = _rowspanWidestIndex(self.state.rowspanindex, dataIndex);
					var rfrom = rowspanindex.from;
					var rto = rowspanindex.to;
					for(var j=rfrom;j<rto;j++) {
						self._rowSelect($rows.filter('[data-alopexgrid-dataindex="'+j+'"]'),sel);
					}
				} else {
					self._rowSelect($rows.filter('[data-alopexgrid-dataindex="'+dataIndex+'"]'),sel);
				}
			}
		}
		if(self.option.on && self.option.on.data && self.option.on.data.selected) {
			dataChangeCallback(self, "selected", [$.map(changedlist, function(di){return $.extend(true,{},self.state.data[di]);}), selected]);
		}
	};
	function isCellEmptied(cell) {
		cell = cell.jquery ? cell[0] : cell;
		return String(cell.className).indexOf("emptied") >= 0;
	}
	//조건과 상관없이 현재 화면에 그려진/수정된 데이터를 가져온다.(편집용)
	//빈값이 들어온 컬럼에 대해 값을 추출하는 용도로 사용한다. 초기 편집시 발동을 의도.
	//.children사용시 .row 또는 .cell을 사용했다가 지워버림.
	AlopexGrid.prototype._refreshEditableCellAll = function(){
		var self = this;
		if(self.option.parseNullValueCell) {
			$.each(self.state.data, function(idx,d) {
				if(d._state.editing && !d._state._editableStarted) {
					self._refreshEditableCell(d._index.data, null, true);
				}
			});
		}
	};
	AlopexGrid.prototype._refreshEditableCell = function(dataIdIndex,$row,generateRow){
		if(!this.option.parseNullValueCell) {
			return;
		}
		var self = this;
		var data = null;
		if(typeof dataIdIndex === "string") {
			for(var i in self.state.data) {
				if(self.state.data[i]._index && self.state.data[i]._index.id === dataIdIndex) {
					data = self.state.data[i];
					break;
				}
			}
		} else if(typeof dataIdIndex === "number") {
			data = self.state.data[dataIdIndex];
		}
		if(!data || data._state._editableStarted || !data._state.editing) return null;
		var $clonerow = null;
		var $cells = $();
		var rendered = false;
		if(!$row) {
			if(self.state.rendered[0] <= data._index.data 
				&& data._index.data <= self.state.rendered[self.state.rendered.length-1]) {
				$row = self.$tablebody.children('[data-alopexgrid-dataid="'+data._index.id+'"]');
				rendered = true;
			}
			if(generateRow && (!$row || !$row.length)) {
				$row = $(self._rowRender(data, null, null, {}));
			}
		} else {
			rendered = true;
		}
		if(!$row) return null;
		$cells = $cells.add($row.children());
		if(rendered && self.state.hasFixColumn) {
			$clonerow = self.state.$fixcolbody.children('[data-alopexgrid-dataid="'+data._index.id+'"]');
			$cells = $cells.not('.cell-fixcol').add($clonerow.children());
		}
		if(!$cells.length) {
			return null;
		} else {
			$cells.each(function(idx,cell){
				var key = cell.getAttribute('data-alopexgrid-key');
				if(key) {
					var mapping = _getMappingByQuery(self.option.columnMapping, {key:key}, self, data);
					if(mapping) {
						self._cellEditUpdate(cell, data._index.id, mapping);
					}
				}
			});
		}
		data._state._editableStarted = true;
	};
	AlopexGrid.prototype._getRecentData = function(dataIdIndex) {
		var self = this;
		var data = null;
		if(typeof dataIdIndex === "string") {
			for(var i in self.state.data) {
				if(self.state.data[i]._index && self.state.data[i]._index.id === dataIdIndex) {
					data = self.state.data[i];
					break;
				}
			}
		} else if(typeof dataIdIndex === "number") {
			data = self.state.data[dataIdIndex];
		}
		if(!data) return null;
		var recentdata = $.extend(true, {_index:data._index,_state:data._state},
			AlopexGrid.trimData(data), AlopexGrid.trimData(data._state.recent));
		return recentdata;
	};

	//row에 대한 편집모드 시작 및 종료. query는 이 API를 호출하는 이벤트 핸들러 등에서 조합하여 넘긴다.
	//편집기능의 범위는 현재 페이지다.
	AlopexGrid.prototype.startEdit = function(query, cancel, cancelKeepEditing) {
		var self = this;
		if (this._noData()) {
			return;
		}
		//* 재구현코드
		var datalist = self.dataGet(query);
		if(!datalist || !datalist.length) {
			return;
		}
		var startedIndex = [];
		for(var i=0,l=datalist.length;i<l;i++) {
			var data = datalist[i];
			if(!data) continue;
			if(data._state.deleted) continue;
			if((data._state.editing && cancel!==true) || (!data._state.editing && cancel === true)) continue;
			var dataIndex = data._index.data;
			var toeditIndex = [];
			if(self.state.rowspanned && self.option.rowspanGroupEdit) {
				var rowspanindex = _rowspanWidestIndex(self.state.rowspanindex, dataIndex);
				if(!rowspanindex) {
					toeditIndex.push(Number(dataIndex));
				} else {
					var from = rowspanindex.from;
					var to = rowspanindex.to;
					for(var j=from;j<to;j++) {
						toeditIndex.push(Number(j));
					}
				}
			} else {
				toeditIndex.push(Number(dataIndex));
			}
			for(var j=0,k=toeditIndex.length;j<k;j++) {
				startedIndex.push(Number(toeditIndex[j]));
				if(cancel===true) {
					_deleteRecent(self.state.data[dataIndex]);
				}
				self._dataSetState({_index:{data:toeditIndex[j]}}, {editing:cancelKeepEditing===true?true:(cancel===true?false:true)}, true);
			}
		}
		var rowrendered = 0;
		for(var i=0,l=startedIndex.length;i<l;i++) {
			if($.inArray(startedIndex[i], self.state.rendered) >= 0) {
				rowrendered++;
			}
		}
		if(rowrendered) {
			if(rowrendered > 30) {
				self._simpleRedraw(null, null);
			} else {
				self.$tablebody.children().each(function(idx,row) {
					var dataIndex = row.getAttribute('data-alopexgrid-dataindex');
					if(_valid(dataIndex) && $.inArray(Number(dataIndex),startedIndex) >= 0) {
						self._redrawRow($(row), self.state.data[dataIndex]);
					}
				});
			}
		}
		if(startedIndex.length){
			self._refreshEditableCellAll();
		}
		self._needEditedRefresh();
		return;
	};
	//short hand for dataInvalid and dataScroll
	AlopexGrid.prototype.dataInvalidFocus = function(query) {
		var self = this;
		var inval = self.dataInvalid();
		if(!inval) return null;
		var column = inval._invalid && inval._invalid[0] ? inval._invalid[0].column : null;
		self.dataScroll(inval, function(){
			var $cell = self._elementGet(inval, column);
			var $inputs = $cell.find('input,select,textarea');
			$inputs.trigger('change');
			$inputs.add($cell).eq(0).focus();
		});
		return inval;
	}
	AlopexGrid.prototype.dataInvalid = function(query) {
		var self = this;
		return self.endEdit(query, undefined, true);
	};
	AlopexGrid.prototype.endEdit = function(query, keepEditing, validateonly) {
		var self = this;
		if(self.$tablebody.is(':hidden')) {
			return;
		}
		if (self._noData()) {
			return;
		}
		if(query === true) {
			query = undefined;
			keepEditing = true;
		}
		if($.isArray(query) && !query.length) {
			return;
		}
		var endedIndex = [];
		//* endEdit 로직 최적화 및 $rows 사용 최소화
		var datalist = self.dataGet(query, true);//getrecent:true
		if(datalist.length) {
			var invalidMessages = [];
			var invalidInfo = [];
			var doValidCheck = false;
			for(var i=0,l=self.option.columnMapping.length;i<l;i++) {
				if(self.option.columnMapping[i].valid || self.option.columnMapping[i].validate) {
					doValidCheck = true;
					break;
				}
			}
			var toendIndex = [];
			for(var i=0,l=datalist.length;i<l;i++) {
				var data = datalist[i];
				if(!data) continue;
				if(data._state.deleted) continue;
				if(!data._state.editing) continue;
				var dataIndex = data._index.data;
				if(self.state.rowspanned && self.option.rowspanGroupEdit) {
					var rowspanindex = _rowspanWidestIndex(self.state.rowspanindex, dataIndex);
					if(!rowspanindex) {
						toendIndex.push(Number(dataIndex));
					} else {
						var from = rowspanindex.from;
						var to = rowspanindex.to;
						for(var j=from;j<to;j++) {
							toendIndex.push(Number(j));
						}
					}
				} else {
					toendIndex.push(Number(dataIndex));
				}
			}
			var $rows = self.$tablebody.children('.bodyrow');
			var $clonedrows = self.state.hasFixColumn ? self.state.$fixcolbody.children('.bodyrow') : $();
			var rowfrom = Number($rows.eq(0).attr('data-alopexgrid-dataindex'));
			var rowto = Number($rows.eq(-1).attr('data-alopexgrid-dataindex'));
			for(var i=0,l=toendIndex.length;i<l;i++) {
				var dataIndex = toendIndex[i];
				var data = self.state.data[dataIndex];
				if(!data || !data._state.editing) {
					continue;
				}
				var $row = dataIndex>=rowfrom && dataIndex<=rowto ? $rows.eq(dataIndex-rowfrom) : $();
				var $clonedrow = dataIndex>=rowfrom && dataIndex<=rowto ? $clonedrows.eq(dataIndex-rowfrom) : $();
				if(doValidCheck) {
					var invalid = false;
					var $cells = $row.children();
					var $clonedcells = $clonedrow.children();
					for(var j in self.option.columnMapping) {
						var cellInvalid = false;
						var mapping = self.option.columnMapping[j];
						if(!_valid(mapping.columnIndex)) {
							continue;
						}
						if(!mapping.editable) {
							continue;
						}
						var $cell = $cells.filter('[data-alopexgrid-columnindex="'+mapping.columnIndex+'"]');
						if($cell.hasClass('cell-fixcol')) {
							$cell = $clonedcells.filter('[data-alopexgrid-columnindex="'+mapping.columnIndex+'"]');
							//$cell = self._findClonePair($cell);
						}
						var errMessage = [];
						var value = (data._state.recent?data._state.recent[mapping.key]:null)
							||data[mapping.key];
						if (mapping && !_isColumnValid.call(self, mapping, $cell, value, data)) {
							//valid:['allowed','value','array']
							//valid:function(cell,value,data){return (boolean)valid; }
							invalid = true;
							cellInvalid = true;
							if (typeof mapping.invalid == "function") {
								errMesage.push(mapping.invalid($cell, value, data));
							} else if (typeof mapping.invalid === "string") {
								errMessage.push(mapping.invalid);
							} else {
								errMessage.push(null);
							}
						}
						if($.isFunction(self.option.valueFilter)) {
							var filtered = self.option.valueFilter(value, data);
							if(filtered === false) {
								invalid = true;
								cellInvalid = true;
								errMessage.push( ($.isFunction(self.option.message.valueFilter)
									? self.option.message.valueFilter(value, data) : self.option.message.valueFilter
									) || null);
							} else if(typeof filtered == "string" || typeof filtered == "number") {
								if(data._state.recent && data._state.recent.hasOwnProperty(mapping.key)) {
									data._state.recent[mapping.key] = filtered;
								}
							}
						}
						if(mapping.validate && processMappingValidate(mapping)
							&& (mapping.validate.allowInvalid !== true)) {
							var $vcell = $cell;
							if(!$vcell || !$vcell.length) {
								//generate unrendered cell
								$vcell = $(self._cellRender(_getCurrentData(data), mapping));
							}
							var $input = getValidatoredInput.call(self, $vcell, mapping);
							if ($input) {
								var errorMessage = $input.getErrorMessage() || [];
								var valid = !($.isArray(errorMessage) && errorMessage.length);
								if (!valid) {
									invalid = true;
									cellInvalid = true;
									errMessage = errMessage.concat(errorMessage);
									processValidateChange.call(self, mapping, valid, errorMessage, $vcell, $input.val());
								}
							}
						}
						$cell[cellInvalid ? "addClass" : "removeClass"]("invalid");
						if(cellInvalid) {
							invalidMessages = invalidMessages.concat(errMessage);
							invalidInfo.push({
								"column":mapping.columnIndex,
								"mapping":mapping,
								"errorMessage":errMessage
							});
						}
					}
					if(invalid && validateonly === true) {
						var returnData = $.extend(true,{},data, (data._state.editing && self.option.getEditingDataOnEvent) ? data._state.recent : null);
						returnData["_invalid"] = invalidInfo;
						return returnData;
					}
					if(invalidMessages.length) {
						if (self.option.on && self.option.on.invalidEdit) {
							var cb = self.option.on.invalidEdit;
							if ($.isFunction(cb)) {
								cb = [cb];
							}
							$.each(cb, function(idx, callback) {
								callback(data, $row, invalidMessages);
							});
						}
						return false;
					}
				}
				if(validateonly === true) {
					//validate only -> no process on editing=false
					continue;
				}
				var editingState = (keepEditing === true) ? true : false;
				data._state.editing = editingState;
				self.dataEdit(data._state.recent, {_index:{data:dataIndex}},{norender:true});
				_deleteRecent(data);
				self._dataSetState(data, {editing:editingState},true);
				endedIndex.push(dataIndex);
				if (self.option.on && self.option.on.endEdit) {
					var cb = self.option.on.endEdit;
					if ($.isFunction(cb)) {
						cb = [cb];
					}
					$.each(cb, function(idx, callback) {
						var cdata = callback(data, $row);
						if (typeof cdata == "object") {
							$.extend(data, cdata);
						}
					});
				}
			}
			if(self.state.rowspanned || self.state.sorted) {
				//end result may cause rows order to be shuffled.
				self._simpleRedraw(null, null);
			} else if(endedIndex.length){
				if(!query && endedIndex.length > self.state.rendered.length/2) {
					self._simpleRedraw(null,null);
				} else {
					$.each(endedIndex, function(idx,dataIndex){
						if(dataIndex>=rowfrom && dataIndex<=rowto) {
							self._redrawRow($rows.eq(dataIndex-rowfrom), self.state.data[dataIndex]);
						}
					});
				}
			}
		}
		if(validateonly === true) return null;
		self._closeTooltip();
		self._needEditedRefresh();
		return;
	};
	AlopexGrid.prototype.cancelEdit = function(query, keepEditing) {
		//수정된 데이터를 state.data에 반영하지 않고 종료.
		var self = this;
		if (self._noData()) {
			return;
		}
		if(query === true) {
			query = undefined;
			keepEditing = true;
		}
		self.startEdit(query, true, keepEditing);
		self._closeTooltip();
		return ;
	};
	AlopexGrid.prototype._initTooltip = function(){
		var self = this;
		self.$tooltip = self.$root.find('[data-type="tooltip"]');
		//if(self.option.outerValidateTooltip) {
		//}
		self.$scroller.off('.alopexgridvalidatetooltip').on('scroll.alopexgridvalidatetooltip click.alopexgridvalidatetooltip', function(){
			self._closeTooltip(true);
		});
	};
	AlopexGrid.prototype._showTooltip = function(elem, message, position){
		var self = this;
		var dataPosition = "auto";
		var $elem = $(elem);
		var elemPosition = $elem.position();
		if(elemPosition.top + self.state.rowHeight*3 > self.$scroller.prop('clientHeight')+self.$scroller.prop('scrollTop')) {
			dataPosition = "top";
		}
		self.$tooltip.attr("data-base", "#" + elem.id)
			.attr("data-position", dataPosition)
			.html(message);
		if(!message.length || String(message).trim() === "") {
			self._closeTooltip();
			return;
		}
		self.$tooltip.open();
		self.$tooltip.show();
	};
	AlopexGrid.prototype._closeTooltip = function(closeonly) {
		var self = this;
		if(!self.$tooltip) return;
		$.isFunction(self.$tooltip.close) ? self.$tooltip.close().hide() : "";
		if(closeonly !== true) {
			clearTimeout(_tooltipTimer);
			_tooltipTimer = null;
		}
	};
	AlopexGrid.prototype._pageDrawnIndex = function() {
		var option = this.option;
		var data = this.state.data;
		var startIndex = 0;
		var endIndex = data && data.length ? data.length : -1;
		var result = {};
		if (option.pager && option.paging && option.paging.perPage) {
			//아래 3개의 변수는 page 관련 API에 의해 자동으로 정리되서 dataDraw로 넘겨짐.
			var total = option.paging.total;//1base
			var current = option.paging.current;//1base. default 1. user setting value(API)
			var perPage = Number(option.paging.perPage);//user setting value
			startIndex = perPage * (current - 1);
			endIndex = endIndex < 0 || total <= 0 ? -1 : startIndex + perPage;
			if (data && endIndex > data.length+this.state._paddingDataLength) {
				endIndex = data.length+this.state._paddingDataLength;
			}
			result.total = total;
			result.current = current;
			result.perPage = perPage;
		}
		result.start = startIndex;
		result.end = endIndex;
		result.rowPadding = 0;
		if (this.option.rowPadding) {
			var till = 0;
			if (typeof this.option.rowPadding == "number") {
				till = Number(this.option.rowPadding);
			} else {
				till = Number(result.perPage);
			}
			if (till > 0) {
				result.rowPadding = till - (endIndex - startIndex);
			}
			if (result.rowPadding < 0) {
				result.rowPadding = 0;
			}
		}
		if(this.state._paddingDataLength) {
			var m = this.state._paddingDataLength;
			result.start -= m;
			result.end -= m;
		}
		return result;
	};
	AlopexGrid.prototype.sortingInfo = function() {
		var self = this;
		var info = {"sortingKey":null};
		info["sortingColumn"] = _valid(self.state.sortingColumn) ? Number(self.state.sortingColumn) : null;
		for(var i=0,l=self.option.columnMapping.length;i<l;i++) {
			var mapping = self.option.columnMapping[i];
			if(_valid(mapping.columnIndex) && Number(mapping.columnIndex) === Number(self.state.sortingColumn)) {
				info["sortingKey"] = mapping.key;
				break;
			}
		}
		info["sortingDirection"] = self.state.sortingDirection || null;
		info["sorted"] = _valid(self.state.sortingColumn);
		return info;
	};
	AlopexGrid.prototype.pageInfo = function() {
		var self = this;
		var option = self.option;
		var paging = option.paging = option.paging || {};
		var data = self.state.data;

		//가상페이징 - 현재 페이지 값은 서버통신하는 콜백에 넘겨져서 필요한 서버요청을 할 수 있도록 지원해야 한다.
		if (paging.customPaging) {
			$.extend(paging, paging.customPaging);
		}

		//pager의 left/right 영역 설정. 필요시 perPage값 임의 설정.
		if (option.pager && option.paging) {
			var $p = self.$pager;
			//var $left = self.$pagerleft;
			var $right = self.$pagerright;

			var righthtml = [];
			if ($.isFunction(paging.pagerSelect)) {
				righthtml.push(paging.pagerSelect(paging));
			} else if (typeof paging.pagerSelect === "string") {
				righthtml.push(paging.pagerSelect);
			} else if (paging.pagerSelect) {
				var perPageList = [];
				if ($.isArray(paging.pagerSelect)) {
					perPageList = perPageList.concat(paging.pagerSelect);
				} else {
					perPageList.push(10, 20, 30, 50, 100);
				}
				if (self.state.userSetPerPage) {
					perPageList = perPageList.concat(self.state.userSetPerPage);
				}
				for (var i = 0, l = perPageList.length; i < l; i++) {
					perPageList[i] = Number(perPageList[i]);
				}
				if (paging.perPage && $(perPageList).index(Number(paging.perPage)) === -1) {
					perPageList.push(Number(paging.perPage));
					self.state.userSetPerPage = self.state.userSetPerPage || [];
					self.state.userSetPerPage.push(Number(paging.perPage));
				}
				if (typeof paging.perPage !== "number" && isNaN(Number(paging.perPage))) {
					paging.perPage = Number(perPageList[0]);
				} else if (paging.hasOwnProperty('perPage') && !isNaN(Number(paging.perPage))) {
					paging.perPage = Number(paging.perPage);
				}
				perPageList.sort(function(a, b) {
					return a - b;
				});
				righthtml.push('<select class="perPage">');
				$.each(perPageList, function(idx, count) {
					righthtml.push('<option value="', count, '"');
					if (Number(count) === Number(paging.perPage)) {
						righthtml.push(' selected="selected"');
					}
					righthtml.push(">", String(count), '</option>');
				});
				righthtml.push('</select>');
			}
			$right.html(righthtml.join(''));

			$p.off(".alopexgridpager");
			$p.on('change.alopexgridpager', ".perPage", function() {
				if (paging.customPaging) {
					if (option.on && $.isFunction(option.on.perPageChange)) {
						option.on.perPageChange.call(self, $(this).children("option:selected").val());
					}
				} else {
					var p = Number($(this).children("option:selected").val());
					if (isNaN(p))
						return;
					self.updateOption({
						pager: true,
						paging: {
							perPage: p
						}
					});
				}
			});
		}

		//TODO 가상페이징 - 서버에서 페이지 번호에 따라 데이터를 부분부분 가져와야 할 경우 total은 계산되는것이 아닌, 설정되어야 하는 값이다.
		paging.dataLength = data && data.length ? data.length : 0;
		paging.total = paging.perPage ? (paging.dataLength ? ((data.length / Number(paging.perPage)) | 0) + (paging.dataLength % Number(paging.perPage) ? 1 : 0) : 0) : (paging.dataLength ? 1 : 0);
		paging.enabled = !!option.pager;
		paging.pageDataLength = self.state.rendered.length;
		if (paging.customPaging) {
			$.extend(paging, paging.customPaging);
		}

		if (paging.current === undefined) {
			paging.current = 1;
		}
		if (paging.current < 1) {
			paging.current = 1;
		}
		if (paging.current > paging.total) {
			paging.current = paging.total;
		}

		if (option.pager && option.paging) {
			var $p = self.$pager;
			var $left = self.$pagerleft;
			var $right = self.$pagerright;

			var lefthtml = [];
			if ($.isFunction(paging.pagerTotal)) {
				lefthtml.push(paging.pagerTotal(paging));
			} else if (typeof paging.pagerTotal === "string") {
				lefthtml.push(paging.pagerTotal);
			} else if (paging.pagerTotal) {
				var msg = '<span>총 조회건수 : '+ paging.dataLength+ '</span>';
				if(option.message && option.message.pagerTotal) {
					var optionmsg = option.message.pagerTotal;
					if(typeof optionmsg === "string") {
						msg = optionmsg
					} else if ($.isFunction(optionmsg)) {
						msg = optionmsg.call(self.$root, paging);
					}
				}
				lefthtml.push(msg);
			}
			$left.html(lefthtml.join(''));
		}

		//pager update
		if (option.pager) {
			var $p = self.$pager;
			$p.find('.pagination.first-page').html("<a>").find('a').attr("href", "#page" + 1).html(option.paging.first || "");
			$p.find('.pagination.prev-page').html("<a>").find('a').attr("href", "#page" + (paging.current <= 1 ? 1 : Number(paging.current) - 1)).html(option.paging.prev || "");
			$p.find('.pagination.next-page').html("<a>").find('a').attr("href", "#page" + (paging.current >= paging.total ? paging.total : Number(paging.current) + 1)).html(option.paging.next || "");
			$p.find('.pagination.last-page').html("<a>").find('a').attr("href", "#page" + paging.total).html(option.paging.last || "");
			$p.find('.pagination.page-list').empty();

			var startidx = 1;
			var endidx = paging.total;
			var perpager = Number(paging.pagerCount) || 5;
			if (self.option.currentPageInCenter && endidx - startidx >= perpager) {
				startidx = paging.current - ((perpager / 2) | 0);
				endidx = startidx + perpager - 1;
				if (startidx < 1) {
					startidx = 1;
					endidx = startidx + perpager - 1;
				}
				if (endidx > paging.total) {
					endidx = paging.total;
					startidx = paging.total - perpager + 1;
				}
			} else {
				endidx = _min(endidx, perpager);
				while(endidx < paging.current) {
					startidx += perpager;
					endidx += perpager;
				}
				if(endidx > paging.total) {
					endidx = paging.total;
				}
			}
			for (var i = startidx; i <= endidx; i++) {
				var li = $('<li>');
				li.html('<a href="#">' + i + '</a>').find('a').data('alopexgridpage', i).attr("href", "#page" + i);
				if (paging.current == i) {
					li.addClass("current");
				}
				$p.find('.pagination.page-list').append(li);
			}

			$p.on('click.alopexgridpager', ".pagination.first-page a", function(pe) {
				var topage = 1;
				if (option.on && $.isFunction(option.on.pageSet)) {
					if (option.on.pageSet.call(self,
						topage,
						paging.perPage ,
						$.extend({},option.paging,{current:topage})) === false) {
						return false;
					}
				}
				self.pageSet(topage);
				return false;
				//pe.preventDefault();
			}).on('click.alopexgridpager', ".pagination.prev-page a", function(pe) {
				var topage = (paging.current <= 1 ? 1 : Number(paging.current) - 1);
				if (option.on && $.isFunction(option.on.pageSet)) {
					if (option.on.pageSet.call(self,
						topage,
						paging.perPage ,
						$.extend({},option.paging,{current:topage})) === false) {
						return false;
					}
				}
				self.pageSet(topage);
				return false;
				//pe.preventDefault();
			}).on('click.alopexgridpager', ".pagination.page-list li a", function(pe) {
				var topage = $(this).data('alopexgridpage');
				if (option.on && $.isFunction(option.on.pageSet)) {
					if (option.on.pageSet.call(self,
						topage,
						paging.perPage ,
						$.extend({},option.paging,{current:topage})) === false) {
						return false;
					}
				}
				self.pageSet(topage);
				return false;
				//pe.preventDefault();
			}).on('click.alopexgridpager', ".pagination.next-page a", function(pe) {
				var topage = paging.current >= paging.total ? paging.total : Number(paging.current) + 1;
				if (option.on && $.isFunction(option.on.pageSet)) {
					if (option.on.pageSet.call(self,
						topage,
						paging.perPage ,
						$.extend({},option.paging,{current:topage})) === false) {
						return false;
					}
				}
				self.pageSet(topage);
				return false;
				//pe.preventDefault();
			}).on('click.alopexgridpager', ".pagination.last-page a", function(pe) {
				var topage = paging.total;
				if (option.on && $.isFunction(option.on.pageSet)) {
					if (option.on.pageSet.call(self,
						topage,
						paging.perPage ,
						$.extend({},option.paging,{current:topage})) === false) {
						return false;
					}
				}
				self.pageSet(topage);
				return false;
				//pe.preventDefault();
			}).on('mouseover.alopexgridpager','div.pagination,li',function(){
				$(this).addClass('hovering');
			}).on('mouseout.alopexgridpager','div.pagination,li',function(){
				$(this).removeClass('hovering');
			});
		}
		return paging;
	};
	function _inPage(self, data) {
		if(!data || !data._index) return false;
		if(!self.option.pager) return 1;
		var paging = self.pageInfo();
		if(!paging.enabled) return;
		var totallen = paging.dataLength;
		var perpage = paging.perPage;
		var dataindex = data._index.data;
		return Math.floor(dataindex / perpage) + 1;
	}
	AlopexGrid.prototype.pageSet = function(data, sync) {
		var self = this;
		var page = data;
		var prevcurr = Number(self.option.paging.current);
		var so = self._scrollOffset();
		self.option.paging.current = Number(page);
		self._closeTooltip();
		if ($.isFunction(self.option.paging.pageSet)) {
			self._showProgress(function(done) {
				self.option.paging.pageSet(page, function(list, pobj) {
					self.dataSet(list, pobj);
					done();
				}, function() {
					done();
				});
			}, 0, true);
		} else {
			if(sync) {
				self.pageInfo();
				self.updateOption();
				if (self.option.paging.current !== prevcurr) {
					self.$scroller[0].scrollTop = 0;
					self.$scroller[0].scrollLeft = 0;
				}
			} else {
				self._showProgress((function(prev){
					return function(done){
						self.pageInfo();
						self.updateOption();
						if (self.option.paging.current !== prev) {
							self.$scroller[0].scrollTop = 0;
							self.$scroller[0].scrollLeft = 0;
						}
						done();
					};
				})(prevcurr), 0, true);
			}
		}
	};
	AlopexGrid.prototype._showProgress = function(callback, delay, async) {
		var self = this;
		if (delay === null || delay === undefined) {
			delay = self.option.progressDelay;
		}
		var $div = self.$root.children('div.progress');
		if (!$div.length) {
			$div = $('<div>');
		}
		var $background = self.$root.children('div.modal');
		if (!$background.length) {
			$background = $('<div>');
		}
		var text = self.option.progressText || 'loading...';
		$div.addClass('progress');
		$div.css($.extend({
			//      "position":"absolute",
			//      "margin-left":"-50px",
			//      "margin-top":"-15px",
			//      "width":"100px",
			//      "height":"30px",
			//      "top":"50%",
			//      "left":"50%",
			//      "background-color":"white",
			//      "border":"2px solid grey",
			//      "text-align":"center",
			//      "vertical-align":"middle"
		}, self.option.progressCss || {})).html(text);
		$background.addClass('modal').css($.extend({
			//        "position":"absolute",
			//        "width":"100%",
			//        "height":"100%",
			//        "top":"0px",
			//        "left":"0px"
		}, self.option.modalCss || {}));
		$background.appendTo(self.$root);
		$div.appendTo(self.$root);
		self.state.progressStack++;

		var setfunc = function() {
			function reduceProgress() {
				self.state.progressStack--;
				if (self.state.progressStack <= 0) {
					self.state.progressStack = 0;
					self.$root.children('.progress').remove();
					$div.remove();
					$background.remove();
				}
			}
			if (async) {
				callback(reduceProgress);
				return;
			}
			callback();
			reduceProgress();
		}
		if (delay === null || delay === undefined) {
			setfunc();
		} else {
			setTimeout(setfunc, delay);
		}
	};

	function _instance(elem) {
		//return elem[AlopexGrid.KEY_NAME];
		return $(elem).data(AlopexGrid.KEY_NAME);
	}

	$.fn.alopexGrid = function(option, param, param2) {
		if (!this.length) {
			return this;
		}
		if (typeof option == "string") {
			if (!AlopexGrid.prototype[option]) {
				throw new Error("[AlopexGrid] AlopexGrid has no method [" + option + "]");
			}
			var ret = undefined;
			var jqobj = undefined;
			var args = $.makeArray(arguments).slice(1);
			jqobj = this.each(function(idx, elem) {
				var instance = _instance(this);
				if (!instance) {
					instance = new AlopexGrid(this);
				}
				//instance._showProgress(function() {
				//ret = instance[option](param, param2);
				ret = instance[option].apply(instance, args)
				//});
				if (ret !== undefined) {
					return false;
				}
			});
			if (ret !== undefined) {
				return ret; //getter
			}
			return jqobj;//jquery method chain
		} else {
			return this.each(function(idx, elem) {
				var instance = _instance(this);
				if (!instance) {
					instance = new AlopexGrid(this, option);
				}
				instance.updateOption(option);
			});
		}
	};
	function commonoption(option) {
		if ($.isPlainObject(option)) {
			AlopexGrid.commonOption = AlopexGrid.commonOption || {};
			AlopexGrid.commonOption = $.extend({}, AlopexGrid.commonOption, option);
		}
	}
	if ($.alopex) {
		$.alopex.alopexGrid = commonoption;
		if ($.isFunction($.alopex.registerSetup)) {
			$.alopex.registerSetup('grid', commonoption);
		}
	}
	$.alopexGrid = commonoption;
})(jQuery);