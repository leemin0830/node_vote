/* 
 * Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved. 
 * 
 * This software is the confidential and proprietary information of SK C&C. 
 * You shall not disclose such confidential information and shall use it 
 * only in accordance with the terms of the license agreement you entered into 
 * with SK C&C. 
 */
/**
 * @version 3.0.5
 */
var _anomFunkMap = {};
var _anomFunkMapNextId = 0;
var alopexready = false;

//function anomToNameFunk(fun) {
//	var funkId = "f" + _anomFunkMapNextId++;
//	var funk = function() {
////	  alert('anomToNameFunk');
//		_anomFunkMap[funkId].apply(this, arguments);
//		_anomFunkMap[funkId] = null;
//		
//		delete _anomFunkMap[funkId];
//	};
//	
//	_anomFunkMap[funkId] = funk;
//	
//	return "_anomFunkMap." + funkId;
//}
//
//function GetFunctionName(fn) {
//  
//	if(fn) {
//		var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
//		
//		console.log('m = ' + m);
//		console.log('m[1] = ' + m[1]);
//		
//		
//		return m ? m[1] : anomToNameFunk(fn);
//	} else
//		return null;
//}

function anomToNameFunk(fun) {
  var funkId = "f" + _anomFunkMapNextId++;
  var funk = function(id, f) {
    return function() {
      _anomFunkMap[id] = null;
      delete _anomFunkMap[id];
      return f.apply(this, arguments);
    };
  }(funkId, fun);
  
  _anomFunkMap[funkId] = funk;
  return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn) {
  if(fn) {
    return anomToNameFunk(fn);
  } else
    return null;
}

function isValid(arg) {
	// var currentScreen = alopexControllerD.getCurrentScreen();//sy
	//	
	// if(ownerScreen != undefined) {
	// if(ownerScreen != currentScreen) {
	// logD.warn("ownerScreen = " + ownerScreen);
	// logD.warn("getCurrentScreen = " + currentScreen);
	//			
	// return false;
	// }
	// }
	
	if(arg == undefined || arg == null) {
		log.warn("There are invalid arguements.");
		
		var caller = arguments.callee;
		
		while(true) {
			caller = caller.caller;
			
			if(caller == null)
				break;
			
			if(caller.name != "")
				log.warn("Caller : " + caller.name);
		}
		
		return false;
	} else
		return true;
}

function notSupported(functionName) {
	log.log(functionName + " is not supported on " + device.platformName);
}

function deprecated(functionName, alternative) {
	log.error(functionName + " is deprecated. Use " + alternative + " instead");
}

(function() {
	var timer = setInterval(function() {
		try{
			if(alopexready == true) {
				clearInterval(timer);
				
				setAlopexEvent("alopexready");
			}
		} catch(e){}
	}, 1);
})();

function setAlopexEvent(eventName) {
	var e = document.createEvent('Events');
	e.initEvent(eventName, true, true);
	document.dispatchEvent(e);
}

Alopex = {};

Alopex.exec = function() {
	alopexCommandInterpreterD.exec(arguments);
	
	deprecated("Alopex.exec", "jsniCaller.invoke");
};

/**
 * Custom Javascript Delegator를 호출을 관장하는 클래스.
 * 호출 예> jsniCaller.invoke(.);
 * 
 * @constructor
 */
function JSNICaller() {
}

/**
 * Custom Javascript Delegator를 호출 하는 함수.
 * 함수의 첫 번째 파라미터는 호출할 Custom JavascriptDelegatorClass.Function.
 * 파라미터의 갯수는 제한이 없으며 첫번째 파라미터 이후의 파라미터는 호출할 Custom Javascript Delegator 함수에 전달된다.
 * 
 * @param {String} target 호출할 Custom JavascriptDelegatorClass.Function
 * @param {String|number|booean..} ... 호출할 함수에 전달 될 parameter로 개수에 제한없음.
 * 
 * @example
 * javasScript : jsniCaller.invoke("SampleJSNI.sampleFunction", "stringParams", 1, true);
 * Native : public void sampleFunction(String stringParams, int intParams, boolean booleanParams)
 */
JSNICaller.prototype.invoke = function() {
	var script = arguments[0] + "(";
	for(var i = 1 ; i < arguments.length ; i++) {
		script += "arguments[" + i + "]";
		
		if(i < arguments.length -1)
			script += ",";
	}
	
	script += ");";
	
	eval(script);
};

var jsniCaller = new JSNICaller();

/**
 * 어플리케이션의 네비게이션, 라이프사이클 등을 관리하는 클래스.
 * 전역으로 선언된 alopexController 를 이용해서 사용 
 * 호출 예> alopexController.goHome(); 
 *
 * @constructor
 * @property {json} parameters 이전 페이지에서 전달받은 데이터.
 * @property {json} results alopexController.back(results) 를 통해서 전달받은 데이터.
 * @example
 * A페이지에서 B페이지로 이동 시 parameters를 B페이지에서 다음과 같이 사용.
 * var param = alopexController.parameters.key
 * A페이지에서 B페이지로 이동 후 back을 통해 다시 A페이지로 이동시 results를 다음과 같이 사용.
 * var param = alopexController.results.key
 * 
 * var params = {
 * 	"key1" : "value1",
 * 	"key2" : "value2",
 * 	"key3" : "value3"
 * }
 */
function AlopexController() {
	this.parameters = null;
	this.results = null;
	this.pageId = null;
	this.startFunction = null;
}

/**
 * 이전 페이지로 이동하는 함수. 
 * 이동시 전달할 데이터가 있으면 json 형식으로, 없으면 생략가능.
 * 
 * @deprecated alopexController.back is deprecated. Use navigation.back instead.
 * @param {json|empty} results 이전 페이지로 이동시 전달할 데이터, 없으면 생략가능.
 * @example
 * var results = {
 * 	"key1" : "value1",
 * 	"key2" : "value2",
 * 	"key3" : "value3"
 * };
 * 
 * -android 플랫폼 고유 기능- 시작 페이지에서 back호출 시 앱종료 
 */
AlopexController.prototype.back = function(results) {
	navigation.back(results);
	
	deprecated("alopexController.back", "navigation.back");
};

/**
 * 특정 페이지로 이동하는 함수.
 * 어플리케이션 screen history에 이동하고자 하는 페이지가 존재하는 경우 그 화면까지의 history를 모두 삭제하고 해당 페이지로 이동. 어플리케이션 screen history에 해당 페이지가 존재 하지 않는 경우 navigation함수를 통해 페이지 이동.
 * 
 * @deprecated alopexController.backTo is deprecated. Use navigation.backToOrNavigate instead.
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "page id",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * };
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters : optional
 * 
 * A화면에서 B화면으로 이동 후 다시 B화면에서 C화면으로 이동 C화면에서 backTo를 통해 A로 이동시 히스토리에 A화면이 존재하기 때문에 히스토리에서 B를 삭제하고 A로이동
 * C화면에서 backTo D를 하면 히스토리에 D가 존재 하지 않기 때문에 navigate D로 동작함
 */
AlopexController.prototype.backTo = function(navigationRule) {
	navigation.backToOrNavigate(navigationRule);
	
	deprecated("alopexController.backTo", "navigation.backToOrNavigate");
};

/**
 * 특정 페이지로 이동하는 함수.
 * 어플리케이션 screen history에 이동하고자 하는 페이지가 존재하는 경우 그 화면까지의 history를 모두 삭제하고 해당 페이지로 이동. 어플리케이션 screen history에 해당 페이지가 존재 하지 않는 경우 navigation함수를 통해 페이지 이동.
 * 
 * @deprecated alopexController.backToOrNavigate is deprecated. Use navigation.backToOrNavigate instead.
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "page id",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * };
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters : optional
 * 
 * A화면에서 B화면으로 이동 후 다시 B화면에서 C화면으로 이동 C화면에서 backTo를 통해 A로 이동시 히스토리에 A화면이 존재하기 때문에 히스토리에서 B를 삭제하고 A로이동
 * C화면에서 backTo D를 하면 히스토리에 D가 존재 하지 않기 때문에 navigate D로 동작함
 */
AlopexController.prototype.backToOrNavigate = function(navigationRule) {
	navigation.backToOrNavigate(navigationRule);
	
	deprecated("alopexController.backToOrNavigate", "navigation.backToOrNavigate");
};

/**
* 웹뷰가 로딩되기 전에, 표시되도록 설정해 놓은 로딩이미지를 dismiss시키는 함수
* 로딩이미지를 설정할때 autoDismiss설정을 false로 해놓은 경우에 사용. 
*/
AlopexController.prototype.dismissLoadImage = function() {
	alopexControllerD.dismissLoadImage();
	
};

/**
 * -android 플렛폼 고유 함수(apple정책상 강제로 어플리케이션 종료 시킬수 없음)-
 * 어플리케이션을 종료 시키는 함수.
 * 
 * @deprecated alopexController.goHome is exit. Use navigation.exit instead.
 */
AlopexController.prototype.exit = function() {
	navigation.exit();
	
	deprecated("alopexController.exit", "navigation.exit");
};

/**
 * 어플리케이션의 Navigate History의 root screen 으로 이동하는 함수.
 * 
 * @deprecated alopexController.goHome is deprecated. Use navigation.goHome instead.
 */
AlopexController.prototype.goHome = function() {
	navigation.goHome();
	
	deprecated("alopexController.goHome", "navigation.goHome");
};

/**
 * 어플리케이션 screen 이동 하는 함수.
 * 
 * @deprecated alopexController.navigate is deprecated. Use navigation.navigate instead.
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "pageid",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * 	"loadImage": "image url",
 * 	"autoDismiss" : true | false
 * }
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters, loadImage, autoDismiss : optional
 * loadImage가 있으면 네비게이션 중간에 이미지를 로드함. loadImage가 있는데 autoDismiss가 없으면 자동으로 true
 */
AlopexController.prototype.navigate = function(navigationRule) {
	navigation.navigate(navigationRule);
	
	deprecated("alopexController.navigate", "navigation.navigate");
};

/**
 * -android 플랫폼 고유 함수-
 * 하드웨어 back 버튼이 눌렸을 때 호출될 사용자 지정 함수 설정하는 함수.
 * 
 * @param {function} callback back 버튼이 눌렸을때 동작할 callback 함수.
 */
AlopexController.prototype.setCustomizedBack = function(callback) {
	if(isValid(callback))
		alopexControllerD.setCustomizedBack(GetFunctionName(callback));
};

/**
 * 어플리케이션의 정지시 호출될 사용자 지정 함수를 설정하는 함수.
 * 
 * @deprecated alopexController.setOnPause is deprecated. Use setonpause event instead.
 * @param {function} callback 어플리케이션의 정지 시 호출될 함수.
 */
AlopexController.prototype.setOnPause = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnPause(GetFunctionName(callback));
	
	deprecated("alopexController.setOnPause", "onpause event");
};

/**
 * 어플리케이션의 다시 시작될때 호출될 사용자 지정 함수를 설정하는 함수.
 * 
 * @deprecated alopexController.setOnResume is deprecated. Use setonresume event instead.
 * @param {function} callback 어플리케이션의 다시 시작될 때 호출될 함수.
 */
AlopexController.prototype.setOnResume = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnResume(GetFunctionName(callback));
	
	deprecated("alopexController.setOnResume", "onresume event");
};

/**
 * alopexScreen의 webview가 touch 될때 호출될 사용자 지정 함수를 설정하는 함수.
 * 
 * @param {function} callback alopexScreen의 webview가 touch 될때 호출될 함수.
 */
AlopexController.prototype.setOnScreenTouch = function(callback) {
	if(isValid(callback))
		alopexControllerD.setOnScreenTouch(GetFunctionName(callback));
};

/***
 * screen이 시작될 시 처음으로 불려져야할 함수를 설정하는 함수.
 * alopex_ui에서 연계되는 함수로 사용자가 사용할 필요 없음.
 * 
 * @deprecated alopexController.start is deprecated. Use alopexready event instead.
 * @param {string} initHandler 처음 실행이 될 함수명
 **/
AlopexController.prototype.start = function(initHandler) {
	if(isValid(initHandler)) {
		if(alopexready == true) {
			if(typeof (initHandler) == "function")
				initHandler();
			else if(typeof (initHandler) == "string")
				eval(initHandler + "();");
		} else {
			if(typeof (initHandler) == "function")
				alopexController.startFunction = GetFunctionName(initHandler);
			else if(typeof (initHandler) == "string")
				alopexController.startFunction = initHandler;
		}
	}
	
	deprecated("alopexController.start", "alopexready event");
};

var alopexController = new AlopexController();

/**
 * 다른 어플리케이션을 호출 및 정보를 가져오기 위한 클래스.
 * 전역으로 선언된 application 를 이용해서 사용 
 * 호출 예> application.startApplication("com.skcc.app");
 * 
 * @constructor
 * @property {string} appId 안드로이드는 패키지명, iOS는 URL Scheme.
 * @property {string} appVersion 앱의 version.
 * @property {string} contentVersion 앱의 contentVersion(www의 버전).
 */
function Application() {
	this.appId = applicationJSNI.getAppId();
	this.appVersion = applicationJSNI.getAppVersion();
	this.contentVersion = applicationJSNI.getContentVersion();
}

/**
 * identifier(Android : Package name, iPhone : URLScheme) 어플리케이션 버전을 가져오는 함수.
 * 
 * @param {string} identifier 버전을 가져올 어플리케이션 identifier.
 * @returns {string} Returns identifier의 appVersion.
 */
Application.prototype.getVersion = function(identifier) {
	if(isValid(identifier))
		return applicationJSNI.getVersion(identifier);
};

/**
 * identifier(Android : Package name, iPhone : URL Scheme)가 디바이스에 설치되어 있는지 확인 하는 함수.
 * 
 * @param {string} identifier 설치 유무를 판단할 어플리케이션 identifier.
 * @param {function} callback 앱의 설치 유무를 확인할 callback 함수.
 * @example
 * function callback(hasIt) {
 * 	alert(hasIt);
 * }
 * 
 * hasIt : true | false
 */
Application.prototype.hasApp = function(identifier, callback) {
	if(isValid(identifier) && isValid(callback)) {
		if(typeof (callback) == "function")
			applicationJSNI.hasApp(identifier, GetFunctionName(callback));
		else if(typeof (callback) == "string")
			applicationJSNI.hasApp(identifier, callback);
	}
};

/**
 * -android 플랫폼 고유 함수-
 * filePath의 apk를 실행하여 앱을 설치하는 함수.
 * 
 * @param {string} filePath apk의 경로.
 * @exsample
 * appication.installApplication("file:///mnt/sdcard/....../skcc.apk");
 */
Application.prototype.installApplication = function(filePath) {
	if(isValid(filePath))
		applicationJSNI.installApplication(filePath);
};

/**
 * RemoteContens기능을 사용하여 다운받은 Contents를 삭제 하는 기능.
 * 
 * @param {function} callback contents삭제 성공 여부를 전달 받을 함수.
 * @exsample
 * function removeCallback(result) {
 * 	if(result)
 * 		alert("contents 삭제 완료");
 * }
 * 
 * result : true|false
 */
Application.prototype.removeContents = function(callback) {
	if(isValid(callback))
		applicationJSNI.removeContents(GetFunctionName(callback));
};

/**
 * identifier(Android : Package name, iPhone : URL Scheme + ://) 어플리케이션을 실행 시키는 함수.
 * 
 * @param {string} identifier 시작할 어플리케이션의 identifier.
 * @param {json} parameters 전달될 데이터.
 * @example
 * application.startApplication("com.skcc.app");
 * 
 * iOS에서는 URL Scheme 뒤에 "://"를 추가해야함
 * 호출 예> application.startApplication("com.skcc.app://");
 * or
 * 
 * var parameters = {
 * 	"boolean" : {"booleanKey1" : true, "booleanKey2" : false},
 * 	"float" : {"floatKey1" : 37.123456, "floatKey2" : 128.123456},
 * 	"int" : {"intKey1" : 1, "intKey2" : 2},
 * 	"string" : {"stringKey1" : "value1", "stringKey1" : "value2"}
 * };
 * application.startApplication("com.skcc.app", parameters);
 * 
 * identifier : required
 * parameters : optional
 */
Application.prototype.startApplication = function(identifier, parameters) {
	if(isValid(identifier)) {
		if(isValid(parameters))
			applicationJSNI.startApplication(identifier, JSON.stringify(parameters));
		else
			applicationJSNI.startApplication(identifier, null);
	}
};

/**
 * identifier(Android : Package name, iPhone : URLScheme) Alopex 어플리케이션을 실행 시키는 함수.
 * 
 * @param {string} identifier 시작할 어플리케이션의 identifier.
 * @param {string} pageId 실행할 page id in alopexconfig.xml file.
 * @param {json} parameters 전달될 데이터.
 * @example
 * application.startAlopexApplication("com.skcc.app", "samplePage");
 * 
 * or
 * 
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2"
 * 	};
 * application.startAlopexApplication("com.skcc.app", "samplePage", parameters);
 * 
 * identifier : required
 * pageId : required
 * parameters : optional
 */
Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
	if(isValid(identifier) && isValid(pageId)) {
		if(isValid(parameters))
			applicationJSNI.startAlopexApplication(identifier, pageId, JSON.stringify(parameters));
		else
			applicationJSNI.startAlopexApplication(identifier, pageId, null);
	}
};

/**
 * 디바이스 기본 웹 브라우저를 실행 시키는 함수.
 * 
 * @param {string} url 웹 브라우저를 실행시 시작할 url.
 * @example
 * application.startWebBrowser("http://m.naver.com");
 */
Application.prototype.startWebBrowser = function(url) {
	if(isValid(url))
		applicationJSNI.startWebBrowser(url);
};

var application = new Application();

/**
 * 어플리케이션의 전화번호부를 관리하는 클래스
 * 전역으로 선언된 contact 를 이용해서 사용
 * 호출 예> navigation.add();
 *
 * @constructor
 */
function Contact() {
}

/**
 * contact를 추가하는 함수
 * 
 * @param {json} contactInfo 저장할 contact의 정보
 * @param {function} successCallback add 성공시 호출될 함수
 * @param {function} errorCallback add 실패시 호출될 함수
 * 
 * @example
 * var contactInfo = {
 * 	"firstName" : "이름",
 * 	"lastName" : "성",
 * 	"mobilePhone" : "01012345678"
 *  "workPhone" : "0264001234"
 *  "email" :  "abcd@sk.com"
 *  "organization" : "skcc"
 *  "department" :"solutionD"
 *  "jobTitle" : "assistance"
 * }
 * 
 * contact.add(contactInfo, successCallback, errorCallback);
 * 
 * function successCallback() {
 * }
 * 
 * function errorCallback(errorMessage : string) {
 * 	log.log(errorMessage);
 * }
 * 
 */
Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		contactJSNI.add(JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 입력받은 contactId에 해당하는 contact정보를 얻는 함수
 * 
 * @param {int} contactId 정보를 가져올 contact의 고유 ID
 * @param {function} successCallback get성공시 호출될 함수
 * @param {function} errorCallback get실패시 호출될 함수
 * 
 * @example
 * function successCallback(contactInfo :json) {
 * 	log.log(contactInfo.firstName);
 * 	log.log(contactInfo.lastName);
 * 	log.log(contactInfo.mobilePhone);
 * 	log.log(contactInfo.workPhone);
 * 	log.log(contactInfo.email);
 * 	log.log(contactInfo.organization);
 * 	log.log(contactInfo.department);
 * 	log.log(contactInfo.jobTitle);
 * }
 * 
 * @example
 * var contactInfo = {
 * "firstName" : string
 * "lastName" : string,
 * "mobilePhone" : string,
 * "workPhone" : string
 * "email" : string
 * "organization" : string
 * "department" : string,
 * "jobTitle" : string
 * };
 * 
 * function errorCallback(errorMessage : string) {
 * 	log.log(errorMessage);
 * }
 * 
 */
Contact.prototype.get = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		contactJSNI.get(contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 입력받은 contactId에 해당하는 contact를 삭제하는 함수
 * 
 * @param {int} contactId 삭제할 contact의 고유ID
 * @param {function} successCallback 삭제 성공시 호출될 함수
 * @param {function} errorCallback 삭제 실패시 호출될 함수
 * 
 * @example
 * function successCallback() {
 * }
 * 
 * function errorCallback(errorMessage : string) {
 * 	log.log(errorMessage);
 * }
 * 
 */
Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		contactJSNI.remove(contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 입력받은 값으로 저장된 contact를 검색하는 함수
 * 
 * @param {json} filter 검색조건들의 집합
 * @param {function} successCallback 검색 성공시 호출될 함수
 * @param {function} errorCallback 검색 실패시 호출될 함수
 * 
 * @example
 * var filter = {
 * 	"firstName" : string,
 *	"lastName" : string,
 *	"mobilePhone" : string,
 *	"workPhone" : string,
 *	"email" : string,
 *	"organization" : string,
 *	"department" : string,
 *	"jobTitle" : string,
 * };
 * 
 * var searchOption = {
 * 	"filter" : filter,
 * 	"andOption" : false
 * };
 * 
 * 검색에 필요하지 않은 항목은 생략 가능. andOption은 필수
 * andOption이 true이면, 검색조건을 모두 만족시키는 항목 찾음. false면 검색 조건 중 하나라도 만족하는 항목 찾음.
 * 전화번호부 전체를 가져오려면 filter에 ""을 넣으면 됨
 * 
 * contact.search(searchOption, successCallback, errorCallback);
 * 
 * function successCallback(contactList :jsonList) {
 *	for(var i = 0 ;i < contactList.length ; i++) {
 * 		log.log(contactList[i].contactId);
 * 		log.log(contactList[i].firstName);
 * 		log.log(contactList[i].lastName);
 * 		log.log(contactList[i].mobilePhone);
 * 		log.log(contactList[i].workPhone);
 * 		log.log(contactList[i].email);
 * 		log.log(contactList[i].organization);
 * 		log.log(contactList[i].jobTitle);
 * 		log.log(contactList[i].organization);
 *	}
 * 
 * function errorCallback(errorMessage : string) {
 * 	log.log(errorMessage);
 * }
 * 
 */
Contact.prototype.search = function(option, successCallback, errorCallback) {
	if(isValid(option) && option != "") {
		if(isValid(successCallback) && isValid(errorCallback)){
			contactJSNI.search(JSON.stringify(option), GetFunctionName(successCallback), GetFunctionName(errorCallback));
		}
	} else {
		if(isValid(successCallback) && isValid(errorCallback)){
			contactJSNI.search(null, GetFunctionName(successCallback), GetFunctionName(errorCallback));
		}
	}
};

/**
 * 입력받은 contactId에 해당하는 contact를 업데이트 하는 함수
 * 
 * @param {json} contactInfo 업데이트할 contact의 정보
 * @param {function} successCallback 업데이트 성공시 호출될 함수
 * @param {function} errorCallback 업데이트 실패시 호출될 함수
 * 
 * @example
 * var contactInfo = {
 * 	"contactId" : int
 * 	"firstName" : string,
 *	"lastName" : string,
 *	"mobilePhone" : string,
 *	"workPhone" : string,
 *	"email" : string,
 *	"organization" : string,
 *	"department" : string,
 *	"jobTitle" : string,
 *	"andOption" : boolean
 * };
 * 
 * contact.update(contactInfo, successCallback, errorCallback);
 * 
 * function successCallback() {
 * }
 * 
 * function errorCallback(errorMessage : string) {
 * 	log.log(errorMessage);
 * }
 * 
 */
Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		contactJSNI.update(JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var contact = new Contact();

/**
 * 디바이스 내장 Database에 접근 하는 클래스
 * 전역으로 선언된 database를 이용해서 사용
 * 호출 예> database.insert();
 *
 * @constructor
 */
function Database() {
	this.resultSet;
	this.resultRaw;
}

/**
 * 등록된 query들을 실행 하는 함수
 * insert, uptate, delete, execQuery함수가 등록한 query문을 실행
 * 
 * 
 * @param {string} databaseName commit을 실행할 database의 이름
 * @param {function} successCallback 등록된 query실행이 성공할 경우 호출될 함수
 * @param {function} errorCallback 등록된 query실행이 실패할 경우 호출될 함수
 * 
 * @example
 * successCallback(resultArray){
 * 		for( var i = 0; i < resultArray.length; i++) {
 * 			log.log(resultArray[i]);
 * 		}
 * }
 * 
 * errorCallback(){errorMsg : string}
 * 
 * resultArray : 등록된 각 query의 retrunValue.
 */
Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(successCallback) && isValid(errorCallback))
		databaseJSNI.commit(databaseName, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 삭제 query를 등록하는 함수.
 * 등록된 query는 commit이 호출 되었을 때 실행
 * 
 * @param {json} query 실행할 query의 정보
 * 
 * @example
 * var query = {
 * "tableName" : string,
 * "whereClause" : string,
 * "args" : array
 * }
 * 
 * database.deleteRow(query);
 * 
 * tableName : query를 수행할 테이블명
 * whereClause : query의 where조건문
 * args : whereCluse의 ?에 해당하는 data
 * 
 * returnValue : 삭제된 row의 개수 /삭제된 row가 없다면 0 (commit의 successCallback으로 전달)
 */
Database.prototype.deleteRow = function(query) {
	if(isValid(query)) {
		databaseJSNI.deleteRow(JSON.stringify(query));
	}
};

/**
 * query를 등록하는 함수.
 * 등록된 query는 commit이 호출 되었을 때 실행
 * 
 * @param {json} query 실행할 query의 정보
 * 
 * @example
 * var query = {
 * "sql" : string,
 * "args" : array
 * }
 * 
 * database.execQuery(query);
 * 
 * sql : 실행할 sql문
 * args : sql문의 ?에 해당하는 data
 * 
 * returnValue : 0 (고정값으로 commit의 successCallback으로 전달)
 */
Database.prototype.execQuery = function(query) {
	if(isValid(query)) {
		databaseJSNI.execQuery(JSON.stringify(query));
	}
};

/**
 * 삽입 query를 등록하는 함수.
 * 등록된 query는 commit이 호출 되었을 때 실행
 * 
 * @param {json} query 실행할 query의 정보
 * 
 * @example
 * var query = {
 * "tableName" : string,
 * "insertValues" : json
 * }
 * 
 * database.insert(query);
 * 
 * tableName : query를 수행할 테이블명
 * insertValues : insert할 data / 내부 json은 column명 : value
 * 
 * returnValue: insert된 row의 id, insert실패시 -1 (commit의 successCallback으로 전달)
 */
Database.prototype.insert = function(query) {
	if(isValid(query)) {
		databaseJSNI.insert(JSON.stringify(query));
	}
};

/**
 * 입력받은 query를 실행하여 Database를 검색하는 함수
 * 
 * @param {string} databaseName select query를 실행할 database의 이름
 * @param {json} query 실행할 query의 정보
 * @param {function} successCallback 성공시 호출될 함수
 * @param {function} errorCallback 실패시 호출될 함수
 * 
 * @example
 * var query = {
 * "sql" : string,
 * "args" : array
 * }
 * 
 * database.select("databaseName", query, successCallback, errorCallback);
 * 
 * successCallback(var result){
 * for( var i = 0; i < result.length; i++) {
 * log.log(result[i].columnName);
 * }
 * }
 * 
 * errorCallback(errorMsg : string){
 * log.log(errorMsg);
 * }
 * 
 * sql : 실행할 sql문
 * args : sql문의 ?에 해당하는 data
 * 
 * result : 검색 결과 배열.배열 하나의 항목이 하나의 Row에 해당. 인덱스를 통해 검색 결과의 Row에 접근하고 Column명을 통해 value를 사용할 수 있다.
 */
Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback))
		databaseJSNI.select(databaseName, JSON.stringify(query), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 수정 query를 등록하는 함수.
 * 등록된 query는 commit이 호출 되었을 때 실행
 * 
 * @param {json} query 실행할 query의 정보
 * 
 * @example
 * var query = {
 * "tableName" : string
 * "whereClause" : string,
 * "args" : array,
 * "updateValues" : json
 * }
 * 
 * database.update(query);
 * 
 * tableName : query를 수행할 테이블명
 * whereClause : query의 where조건문
 * args : whereCluse의 ?에 해당하는 data
 * updateValues : updateValues data / 내부 json은 column명 : value
 * 
 * returnValue : update된 row의 개수 /update row가 없다면 0(commit의 successCallback으로 전달)
 */
Database.prototype.update = function(query) {
	if(isValid(query)) {
		databaseJSNI.update(JSON.stringify(query));
	}
};

var database = new Database();

/**
 * 디바이스 상태정보를 가지고 있는 클래스.
 * 전역으로 선언된 device 를 이용해서 사용 
 * 호출 예>  device.getLanguage(callback);
 *
 * @constructor
 * @property {boolean} isTablet Table PC 인지 Phone 인지 알려주는 프로퍼티.
 * @property {boolean} isTV Table PC 인지 Phone, TV 인지 알려주는 프로퍼티.
 * @property {string} platformName 플랫폼 종류를 구분.(Android, iPhone)
 * @property {string} deviceId 디바이스 고유 아이디.
 * @property {string} deviceModel 디바이스 모델 번호.
 * @property {string} deviceManufacturer 디바이스 제조사.
 * @property {string} osVersion 디바아스 os 버전.
 * @property {string} mobileEquipmentId 안드로이드 디바이스 고유 아이디(not recommended)
 */
function Device() {
	this.isTablet = deviceJSNI.isTablet();
	this.isTV = deviceJSNI.isTV();
	this.platformName = deviceJSNI.getPlatformName();
	this.platform = deviceJSNI.getPlatform();
	this.deviceId = deviceJSNI.getDeviceId();
	this.osName = deviceJSNI.getOsName();
	this.osVersion = deviceJSNI.getOsVersion() + "";
	this.deviceModel = deviceJSNI.getDeviceModel();
	this.deviceManufacturer = deviceJSNI.getDeviceManufacturer();
	this.mobileEquipmentId = deviceJSNI.getMobileEquipmentId();
}

/**
 * -android 플랫폼 고유 함수-
 * 디바이스의 dpi를 구하는 함수.
 * @returns {string} 디바이스 dpi.
 */
Device.prototype.getDeviceDpi = function() {
	return deviceJSNI.getDeviceDpi();
};

/**
 * 디바이스에 설정된 언어를 알려주는 함수.
 * 
 * @param {string} callback
 * @example
 * function callback(language) {
 * 	alert(language);
 * }
 * 
 * language = "ko", "en", etc
 */
Device.prototype.getLanguage = function(callback) {
	if(isValid(callback))
		deviceJSNI.getLanguage(GetFunctionName(callback));
};

/**
 * 현재 연결되어 있는 네트워크 타입을 알려주는 함수.
 * 
 * @param {string} callback
 * @example
 * function callback(type) {
 * 	alert(type);
 * }
 * 
 * type = "wifi", "mobile", or "null" : mobile could be 2g, 3g or 4g while null means no connection.
 */
Device.prototype.getNetworkType = function(callback) {
	if(isValid(callback))
		deviceJSNI.getNetworkType(GetFunctionName(callback));
};

var device = new Device();

/**
 * 파일을 관리하는 클래스
 * 전역으로 선언된 file변수를 이용해서 사용
 * 호출 예> file.copy();
 *
 * @constructor
 */
function File() {
}

/**
 * 파일 및 디렉토리를 복사하는 함수.
 * 
 * @param {string} from 복사의 대상이 되는 파일/디렉토리의 경로.
 * @param {string} to 복사본을 저장할 디렉토리의 경로.
 * @param {string} callback 복사 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.copy = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		fileJSNI.copy(from, to, GetFunctionName(callback));
};

/**
 * 새로운 파일을 생성하는 함수
 * 
 * @param {string} path 생성된 파일이 저장될 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * 입력받은 파일의 경로 중 존재하는 않는 디렉토리가 있는 경우 자동으로 생성됨.
 * dir1존재 dir2가 존재 하지 않을 경우 dir2 자동 생성.
 * file.createNewFile("dir1/dir2/newFile", callback);
 * 
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.createNewFile = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileJSNI.createNewFile(path, GetFunctionName(callback));
};

/**
 * 파일 및 디렉토리를 삭제하는 함수.
 * 
 * @param {string} from 삭제할 파일/디렉토리의 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.deleteFile = function(from, callback) {
	if(isValid(from) && isValid(callback))
		fileJSNI.deleteFile(from, GetFunctionName(callback));
};

/**
 * 파일 및 디렉토리가 존재하는 확인하는 함수.
 * 
 * @param {string} path 존재를 확인할 파일/디렉토리의 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("exist");
 * }
 * 
 * result : 파일이 존재하는지 여부(true|false)
 * 
 */
File.prototype.exists = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileJSNI.exists(path, GetFunctionName(callback));
};

/**
 * 저장소의 경로를 가져오는 함수.
 * 
 * @param {string} callback 성공/실패시 호출될 함수.
 * @param {string} onPrivate 내장 메모리(true) or 외장 메모리(false) 사용 android only
 * 
 * @example
 * function callback(path) {
 * 	alert(path);
 * }
 * 
 * path : 저장소의 경로(string)
 * 
 */
File.prototype.getStoragePath = function(callback, onPrivate) {
	if(isValid(onPrivate) && isValid(callback))
		fileJSNI.getStoragePath(GetFunctionName(callback), onPrivate);
};

/**
 * 특정 파일이 디렉토리인지 확인
 * 
 * @param {string} path 디렉토리인지 확인할 파일/디렉토리의 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("directory");
 * }
 * 
 * result : directory 여부(true|false)
 * 
 */
File.prototype.isDirectory = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileJSNI.isDirectory(path, GetFunctionName(callback));
};

/**
 * 새로운 디렉토리를 생성하는 함수.
 * 
 * @param {string} path 새로 생성할 디렉토리의 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * 입력받은 경로에 존재하지 않는 디렉토리는 모두 생성.
 * 다음과 같은 경로중 dir1만 존재할 경우 dir2, dir3, dir4모두 생성됨.
 * file.mkdirs("dir1/dir2/di3/dir4", callback);
 * 
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.mkdirs = function(path, callback) {
	if(isValid(path) && isValid(callback))
		fileJSNI.mkdirs(path, GetFunctionName(callback));
};

/**
 * 파일 및 디렉토리를 이동하는 함수.
 * 
 * @param {string} from 이동할 파일/디렉토리의 경로.
 * @param {string} to 이동될 디렉토리의 경로.
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.move = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		fileJSNI.move(from, to, GetFunctionName(callback));
};

/**
 * 파일 및 디렉토리의 이름을 변경하는 함수.
 * 
 * @param {string} path 이름을 변경할 파일/디렉토리의 경로.
 * @param {string} name 변경될 파일/디렉토리 명. 
 * @param {string} callback 성공/실패시 호출될 함수.
 * 
 * @example
 * function callback(result) {
 * 	if(result)
 * 		alert("success");
 * }
 * 
 * result : 성공 여부(true|false)
 * 
 */
File.prototype.rename = function(path, name, callback) {
	if(isValid(path) && isValid(name) && isValid(callback))
		fileJSNI.rename(path, name, GetFunctionName(callback));
};

var file = new File();

/**
 * HTML5의 geolocation에 제어하는 클래스
 * 호출 예> geolocation.getLocation(successCallback, errorCallback);
 *
 * @constructor
 */
function Geolocation() {
	this.geolocationError = {};
	this.geolocationError.NETWORK_UNAVAILABLE = 998;
	this.geolocationError.DEVICE_NOT_SUPPORTED = 999;
	this.successCallback;
	this.errorCallback;
}

/**
 * 현재 위치값(Latitude, Longitude)을 가져오는 함수
 * 
 * @param {function} successCallback 위치값을 성공적으로 가져왔을 경우 호출될 함수
 * @param {function} errorCallback 위치값 가져오기에 실패한 경우 호출될 함수
 * 
 * @example
 * function successCallback(position) {
 * 	alert("Latitude: " + position.coords.latitude +" \nLongitude: " + position.coords.longitude);
 * }
 * 
 * function errorCallback(error) {
 * 	switch(error.code) {
 * 		case error.PERMISSION_DENIED:
 * 			alert("User denied the request for Geolocation.");
 * 		break;
 * 
 *		case error.POSITION_UNAVAILABLE:
 *			alert("Location information is unavailable.");
 *		break;
 *
 *		case error.TIMEOUT:
 *			alert("The request to get user location timed out.");
 *		break;
 *
 *		case error.UNKNOWN_ERROR:
 *			alert("An unknown error occurred.");
 *		break;
 *
 *		case error.NETWORK_UNAVAILABLE:
 *			alert("Network is not available.");
 *		break;
 *
 *		case error.DEVICE_NOT_SUPPORTED:
 *			alert("Device is not support geolocation.");
 *		break;
 *	}
 *}
 *
 * HTML5 geolocation return value를 그대로 전달.
 */
Geolocation.prototype.getLocation = function(successCallback, errorCallback) {
	if(isValid(successCallback) && isValid(errorCallback)) {
		if(navigator.geolocation) {
			this.successCallback = successCallback;
			this.errorCallback = errorCallback;
			
			device.getNetworkType(AlopexGeolocationNetworkCheckCallback);
		} else {
			this.geolocationError.code = this.geolocationError.DEVICE_NOT_SUPPORTED;
			
			errorCallback(this.geolocationError);
		}
	}
};

function AlopexGeolocationNetworkCheckCallback(networkType) {
	if(networkType != "null")
		navigator.geolocation.getCurrentPosition(geolocation.successCallback, geolocation.errorCallback);
	else {
		geolocation.geolocationError.code = geolocation.geolocationError.NETWORK_UNAVAILABLE;
		errorCallback(geolocation.geolocationError);
	}
}

var geolocation = new Geolocation();

/**
 * 다른 어플리케이션들과 공유하는 영구 저장소 클래스.
 * 전역으로 선언된 globalPreference 를 이용해서 사용 
 * 호출 예> globalPreference.contains(key);
 *
 * @constructor
 */
function GlobalPreference() {
}

/**
 * GlobalPreference 해당 key가 존재하는 알아보는 함수.
 * 
 * @param {string} key 존재 유무를 확인할 key.
 * @returns {boolean} Returns GlobalPreference 해당키가 존재하면 true, 존재 하지 않으면 false리턴.
 */
GlobalPreference.prototype.contains = function(key) {
	if(isValid(key))
		return globalPreferenceJSNI.contains(key);
};

/**
 * GlobalPreference value를 가져오는 함수.
 * 
 * @param {string} key Preference에서 가져올 value의 key.
 * @returns {string} Value key에 해당하는 value.
 */
GlobalPreference.prototype.get = function(key) {
	if(isValid(key))
		return globalPreferenceJSNI.get(key);
	else
		return undefined;
};

/**
 * GlobalPreference value를 저장 하는 함수.
 * 
 * @param {string} key 저장할 value의 key.
 * @param {string} value 저장할 value.
 * 
 * GlobalPreference key가 중복 될 수 없다. 때문에 GlobalPreference에 이미 존재하는 key라면 value가 수정됨.
 */
GlobalPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		globalPreferenceJSNI.put(key, value);
};

/**
 * GlobalPreference key, value를 제거하는 함수.
 * 
 * @param {string} key GlobalPreference 제거하기 원하는 key.
 */
GlobalPreference.prototype.remove = function(key) {
	if(isValid(key))
		globalPreferenceJSNI.remove(key);
};

var globalPreference = new GlobalPreference();

var httpObjects = new Array();

/**
 * http 통신을 관리하는 클래스.
 * 
 * @example
 * Http 클래스는 다른 API 들과 다르게 미리 정의 되어 있는 전역 변수가 없음.
 * Http 클래스를 사용하기 전에 다음과 같이 선언해야함.
 * 
 * var http = new Http();
 * var myHttp = new Http();
 * 
 * @constructor
 * @property {number} errorCode error code
 * @property {string} errorMessage error message
 * @property {string} response response from network
 * @property {json} responseHeader response headers
 */
function Http() {
	this.errorCode = -1;
	this.errorMessage = null;
	this.response = null;
	this.responseHeader = {};
	httpObjects.push(this);
	this.index = httpObjects.length - 1;
}

/**
 * 다운로드를 취소하는 함수.
 */
Http.prototype.cancelDownload = function() {
	httpJSNI.cancelDownload(this.index);
};


/**
 * 리퀘스트를 취소하는 함수.
 */
Http.prototype.cancelRequest = function() {
	httpJSNI.cancelRequest(this.index);
};

/**
 * 업로드를 취소하는 함수.
 */
Http.prototype.cancelUpload = function() {
	httpJSNI.cancelUpload(this.index);
};

/**
 * 파일을 다운로드하는 함수.
 * @param {json} entity
 * @param {function} successCallback download 성공 시 불려질 함수.
 * @param {function} errorCallback download 실패 시 불려질 함수.
 * @param {function} progressCallback download가 진행이 될때 불려질 함수 0 ~ 100 사이 값.
 * @param {function} cancelCallback download가 취소 시 불려질 함수.
 * 
 * @example
 * var entity = {
 * 	"url" : "http://localhost:8080/a.zip",
 * 	"fileName" : "file name on SDCard"
 * };
 * 
 * url : required
 * fileName : optional, 파일 이름이 없으면 url에서 마지막 패스(a.zip)가 파일이름으로 잡힘
 * 
 * @example
 * function successCallback(filePath) {
 * 	alert(filePath);
 * }
 * 
 * filePath : 다운받은 파일이 저장된 절대 경로.
 * 
 * @example
 * function errorCallback(http) {
 * 	alert("error = " + http.errorCode + " : " + http.errorMessage);
 * }
 * 
 * @example
 * function cancelCallback(http) {
 * 	// do something....
 * }
 * 
 * callback 함수에 전달되는 http는 request에 사용된 http객체임.
 * 
 * errorCode:
 * 3: External Storage is not available *android only
 * 4 : TimeoutException
 * 1004 : 사용 가능한 통신수단이 없는 경우(3g, wifi 등등)
 * 1012 : SSL 인증이 실패 
 *  
 * @example
 * function progressCallback(progress) {
 * 	platformUIComponent.setProgress(progress);
 * }
 * 
 * progress : percentage of progress(0 ~ 100)
 * 
 * callback 함수에 전달되는 http는 request에 사용된 http객체임.
 */
Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback))
		httpJSNI.download(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback), GetFunctionName(cancelCallback), this.index);
};

/**
 * 인자로 넘어온 header에 해당하는 value를 header field에서 가져오는 함수
 * @param {string} header header field에서 가져올 header의 이름
 * @returns {string} returns header field에 해당 header의 value. header값이 존재 하지 않을 경우 undefined.
 */
Http.prototype.getResponseHeader = function(header) {
	if(isValid(header))
		return httpJSNI.getResponseHeader(header, this.index);
};

/**
 * 서버에 request를 보내는 함수.
 * 
 * @param {json} entity request 정보
 * @param {function} successCallback success callback method
 * @param {function} errorCallback error callback method
 * 
 * @example
 * var entity = {
 * 	"url" : "http://serverURL.com",
 * 	"method" : "POST",
 * 	"onBody" : false,
 * 	"content" : "바디에 들어갈 내용",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2"
 * 	}
 * };
 * 
 * url {string} : required
 * method {string} : required, "get" | "post" | "GET" | "POST"
 * onBody {boolean} : optional, post방식 사용시 사용. ture설정시 content가 바디 영역에 들어감, false 일경우 content는 무시됨
 * content {string} : optional, post방식 시 body영역에 넣을 내용
 * parameters {json} : optional
 * 
 * @example
 * function successCallback(http) {
 * 	alert(http.response);
 * }
 * 
 * callback 함수에 전달되는 http는 request에 사용된 http객체임.
 * 
 * @example
 * function errorCallback(http) {
 * 	alert(http.errorCode + " : " + http.errorMessage);
 * }
 * 
 * errorCode:
 * 3: External Storage is not available *android only
 * 4 : TimeoutException
 * 1004 : 사용 가능한 통신수단이 없는 경우(3g, wifi 등등)
 * 1012 : SSL 인증이 실패 
 * 
 * callback 함수에 전달되는 http는 request에 사용된 http객체임.
 */
Http.prototype.request = function(entity, successCallback, errorCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback))
		httpJSNI.request(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), this.index);
};

/**
 * request property를 셋팅 하는 함수.
 * property가 이미 존재하는 경우 덮어 씌여짐.
 * 
 * @param {string} header 일반적으로 http통신에서 사용되는 header의 key에 해당됨 (e.g., "accept").
 * @param {string} value header에 셋팅할 value
 */
Http.prototype.setRequestHeader = function(header, value) {
	if(isValid(header) && isValid(value))
		httpJSNI.setRequestHeader(header, value, this.index);
};

/**
 * timeout시간을 셋팅 하는 함수
 * milliseconds를 기본 단위로 하며 request전에 설정 되어야 함
 * @param {number} timeout timeout의 시간으로 milliseconds를 기본 단위로 함
 * 
 * default time out 10 second
 */
Http.prototype.setTimeout = function(timeout) {
	if(isValid(timeout)) {
		if(!isNaN(timeout))
			httpJSNI.setTimeout(timeout, this.index);
	}
};

/**
 * file을 서버로 upload하는 함수
 * 
 * @param {json} entity upload request information
 * @param {function} successCallback success callback method
 * @param {function} errorCallback error callback method
 * @param {function} progressCallback progress callback method
 * @param {function} cancelCallback cancel callback method
 * 
 * @exaple
 * var entity = {
 * 	"url" : "http://serverURL.com/upload",
 * 	"filePath" : "file:///mnt/sdcard/........"
 * };
 * 
 * url : required
 * filePath : required
 * 
 * @example
 * function successCallback() {
 * 	alert("upload success");
 * }
 * 
 * @example
 * function errorCallback(http) {
 * 	alert(http.errorCode + " : " + http.errorMessage);
 * }
 * 
 * http is Http object that is called for request.
 * 
 * @example
 * function progressCallback(progress) {
 * 	platformUIComponent.setProgress(progress);
 * }
 * 
 * progress : percentage of progress(0 ~ 100)
 * 
 * @example
 * function cancelCallback(http) {
 * 	// do something....
 * }
 */
Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback)) {
		if(typeof (successCallback) == "function" && typeof (errorCallback) == "function" && typeof (progressCallback) == "function" && typeof (cancelCallback) == "function")
			httpJSNI.upload(JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback), GetFunctionName(cancelCallback), this.index);
		else if(typeof (successCallback) == "string" && typeof (errorCallback) == "string" && typeof (progressCallback) == "string" && typeof (cancelCallback) == "string") {
			httpJSNI.upload(JSON.stringify(entity), successCallback, errorCallback, progressCallback, cancelCallback, this.index);
		}
	}
	
};

/**
 * localNotification을 관장하는 클래스
 * 전역으로 선언된 localNotification 를 이용해서 사용
 * 호출 예> localNotification.addNotification();
 *
 * @constructor
 */
function LocalNotification() {
}

/**
 * localNotification을 추가하는 함수
 * 
 * @param {int} id 등록할 notifition의 고유 ID. required.
 * @param {json} time notification이 발생할 시간. required.
 * @param {json} action notification발생 시 동작. required.
 * 
 * @example
 * var time = {
 * 	"year" : 2012, 
 * 	"month" : 7, 
 * 	"date" : 12, 
 * 	"hour" : 1 ~ 12, 
 * 	"ampm" : "am" | "pm" | "AM" | "PM", 
 * 	"minute" : 0~59, 
 * 	"second" : 0~59
 * }
 * 
 * var action = {
 * 	"pageId" : "pageId value",
 * 	"parameters" : {"param1" : "value1", "param2" : "value2"},
 * 	"title" : "Notification Title",
 * 	"alert" : "Notification Content",
 * 	"useMultiMessages" : "true",
 * 	"aps" : {
 * 	"sound" : "true | false",
 * 	"badge" : 1
 * 	}
 * }
 * 
 * action.parameters: optional
 * aps는 iOS만 사용 
 * 
 * localNotification.addNotification(999, time, action);
 * 
 */
LocalNotification.prototype.addNotification = function(id, time, action) {
	if(isValid(id) && isValid(time) && isValid(action))
		localNotificationJSNI.addNotification(id, JSON.stringify(time), JSON.stringify(action));
};

/**
 * 저장된 모든 unreadNotification을 가져오는 함수.
 * 
 * @param {function} callback callback method
 * 
 * @example
 * localNotification.getUnreadNotifications(callback);
 * 
 * function callback(notifications) {
 * 	for( var i = 0; i < notifications.length; i++) {
 * 		alert(notifications[i].alert);
 * 	}
 * }
 * 
 * addNotification에 입력한 action정보가 그대로 전달됨.
 */
LocalNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		localNotificationJSNI.getUnreadNotifications(GetFunctionName(callback));
};

/**
 * 저장된 unreadNotification을 모두 삭제하는 함수
 * @example
 * localNotification.deleteAllUnreadNotifications();
 * 
 */
LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	localNotificationJSNI.deleteAllUnreadNotifications();
};

/**
 * 저장된 unreadNotification중 전달받은 index에 해당하는 unreadNotification을 삭제 하는 함수.
 * 
 * @param {int} index 삭제할 unreadNotification의 index
 * 
 * @example
 * localNotification.deleteUnreadNotification(0);
 * 
 */
LocalNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		localNotificationJSNI.deleteUnreadNotification(index);
};

/**
 * addNotification으로 설정한 notification을 취소하는 함수.
 * 
 * @param {int} id addNotification에서 사용한 id
 * 
 * @example
 * localNotification.removeNotification(id);
 * 
 */
LocalNotification.prototype.removeNotification = function(id) {
	if(isValid(id))
		localNotificationJSNI.removeNotification(id);
};

/**
 * Notification발생 시 즉시 보여줄 것인지 내부에 저장을 할것인지를 설정 하는 함수.
 * 
 * @param {boolean} use immediateForegroundNotification을 사용 할지 여부. 
 * true: 즉시 보여주기
 * false: 내부에 저장하기.
 * 
 * @example
 * localNotification.useImmediateForegroundNotification(true);
 * 
 */
LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		localNotificationJSNI.useImmediateForegroundNotification(use);
};

var localNotification = new LocalNotification();

/**
 * 로그를 관장하는 클래스.
 * 전역으로 선언된 log 를 이용해서 사용 
 * 호출 예> log.error();
 *
 * @constructor
 */
function Log() {
}

/**
 * ERROR log message 출력 하는 함수.
 * 
 * @param {string} message 출력될 message.
 */
Log.prototype.error = function(message) {
	if(isValid(message))
		logJSNI.error(message + "");
};

/**
 * log message 출력 하는 함수.
 * 
 * @param {string} message 출력될 message.
 */
Log.prototype.log = function(message) {
	if(isValid(message))
		logJSNI.log(message + "");
};

/**
 * WARN log message 출력 하는 함수.
 * 
 * @param {string} message 출력될 message.
 */
Log.prototype.warn = function(message) {
	if(isValid(message))
		logJSNI.warn(message + "");
};

var log = new Log();

/**
 * 어플리케이션이 실행되어 있는 동안에만 사용할 수 있는 저장소 클래스.
 * 다른 저장소(Preference and GlobalPreference)들과는 다르게 어플리케이션이 종료되면 저장되어 있던 값들이 사라짐.
 * 전역으로 선언된 memoryPreference 를 이용해서 사용 
 * 호출 예> memoryPreference.contains(key);
 *
 * @constructor
 */
function MemoryPreference() {
}

/**
 * MemoryPreference 해당 key가 존재하는 알아보는 함수.
 * 
 * @param {string} key 존재 유무를 확인할 key.
 * @returns {boolean} MemoryPreference 해당키가 존재하면 true, 존재 하지 않으면 false리턴.
 */
MemoryPreference.prototype.contains = function(key) {
	if(isValid(key))
		return memoryPreferenceJSNI.contains(key);
};

/**
 * MemoryPreference value를 가져오는 함수.
 * 
 * @param {string} key MemoryPreference 가져올 value의 key.
 * @returns {string} Value key에 해당하는 value.
 */
MemoryPreference.prototype.get = function(key) {
	if(isValid(key))
		return memoryPreferenceJSNI.get(key);
	else
		return undefined;
};

/**
 * MemoryPreference에 key, value쌍을 저장.
 * 
 * @param {string} key 저장할 value의 key.
 * @param {string} value 저장할 data의 value.
 */
MemoryPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		memoryPreferenceJSNI.put(key, value);
};

/**
 * MemoryPreference에서 key, value쌍을 제거하는 함수.
 * 
 * @param {string} key MemoryPreference에서 제거하기를 원하는 key.
 */
MemoryPreference.prototype.remove = function(key) {
	if(isValid(key))
		memoryPreferenceJSNI.remove(key);
};

/**
 * MemoryPreference의 모든 data를 지우는 함수.
 */
MemoryPreference.prototype.removeAll = function() {
	memoryPreferenceJSNI.removeAll();
};

var memoryPreference = new MemoryPreference();

/**
 * Multimedia 를 다루는 클래스
 * 사진을 찍고 디바이스에 저장되어 있는 사진을 가져올 수 있음.
 * 전역으로 선언된 multimedia 를 이용해서 사용 
 * 호출 예> multimedia.getPicture(successCallback, errorCallback);
 *
 * @constructor
 */
function Multimedia() {
}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	if(isValid(successCallback)) {
		notSupported("Multimedia.deleteImage");
		
		successCallback();
	}
};

/**
 * 디바이스에 저장되어 있는 사진의 회전 값을 가져오는 함수.
 * 
 * @param {string} imagePath 회전 값을 가져올 이미지의 경로.
 * @param {function} callback 성공 시 불려질 함수.
 * 
 * @example
 * function callback(imageInfo) {
 * 	// do something..
 * }
 * 
 * @example
 * var imageInfo = {
 * "path" : "path to Image",
 * "degree" : "rotate degree"}
 * 
 * degree : 선택된 사진의 회전
 * 
 * error 발생 시  callback함수의 인자로 "error"문자열 전달. 원인은 로그로 출력.
 */
Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	if(isValid(imagePath) && isValid(callback)) {
		if(typeof (callback) == "function")
			multimediaJSNI.getImageOrientation(imagePath, GetFunctionName(callback));
		else if(typeof (callback) == "string")
			multimediaJSNI.getImageOrientation(imagePath, callback);
	}
};

/**
 * 디바이스에 저장되어 있는 사진을 가져오는 함수.
 * 
 * @param {function} successCallback 성공 시 불려질 함수.
 * @param {function} errorCallback 실패 시 불려질 함수.
 * @param {json} option 좌표. iPad에서만 사용 
 * 
 * @example
 * function successCallback(path) {
 * 	alert(path);
 * }
 * 
 * path : 선택된 사진의 저장 경로.
 * 
 * @example
 * function errorCallback(error) {
 * 	alert("error message : " + error);
 * }
 * 
 * error : error message
 * 
 * @example
 * var option = {"x" : number,"y" : number};
 */
Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	if(isValid(successCallback) && isValid(errorCallback))
		multimediaJSNI.getPicture(GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

/**
 * 디바이스에 저장되어 있는 사진의 크기를 수정하는 함수.
 * 
 * @param {json} imageInfo 수정할 이미의 경로, 수정할 이미지의 크기
 * @param {function} callback 성공 시 불려질 함수.
 * 
 * @example
 * var = imageInfo {
 * "path" : "mnt/Alopex/testImage.jpeg",
 * "width" : 100,
 * "height" : 100,
 * "overwrite" : true | false
 * };
 * 
 * function callback(path) {
 * 	alert(path);
 * }
 * 
 * path : 저장된 사진의 저장 경로.
 * overwrite : true일 경우 원본파일 수정, false일경우 복사본 만들어서 수정, android only
 * 
 * error 발생 시  callback함수의 인자로 "error"문자열 전달. 원인은 로그로 출력.
 */
Multimedia.prototype.resizePicture = function(pictureInfo, callback) {
	if(isValid(pictureInfo) && isValid(callback)) {
		if(typeof (callback) == "function")
			multimediaJSNI.resizePicture(JSON.stringify(pictureInfo), GetFunctionName(callback));
		else if(typeof (callback) == "string")
			multimediaJSNI.resizePicture(JSON.stringify(pictureInfo), callback);
	}
};

/**
 * 디바이스에 저장되어 있는 사진을 회전 시키는 함수.
 * 
 * @param {json} imageInfo 수정할 이미의 경로, 회전 시킬 각도.(90|180|270)
 * @param {function} callback 성공 시 불려질 함수.
 * 
 * @example
 * var = imageInfo {
 * "path" : "mnt/Alopex/testImage.jpeg",
 * "degree" : 90,
 * "overwrite" : true | false
 * };
 * 
 * function callback(path) {
 * 	alert(path);
 * }
 * 
 * path : 저장된 사진의 저장 경로.
 * overwrite : true일 경우 원본파일 수정, false일경우 복사본 만들어서 수정, android only
 * 
 * error 발생 시  callback함수의 인자로 "error"문자열 전달. 원인은 로그로 출력.
 */
Multimedia.prototype.rotateImage = function(imageInfo, callback) {
	if(isValid(imageInfo) && isValid(callback)) {
		if(typeof (callback) == "function")
			multimediaJSNI.rotateImage(JSON.stringify(imageInfo), GetFunctionName(callback));
		else if(typeof (callback) == "string")
			multimediaJSNI.rotateImage(JSON.stringify(imageInfo), callback);
	}
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	if(isValid(successCallback)) {
		notSupported("Multimedia.saveImage");
		
		successCallback();
	}
};

/**
 * 디바이스의 카메라를 이용하여 사진을 찍는 함수.
 * 
 * @param {function} successCallback 성공 시 불려질 함수.
 * @param {function} errorCallback 실패 시 불려질 함수.
 * 
 * @example
 * function successCallback(picture) {
 * 	alert("path = " + picture.path);
 * 	alert("width of picture = " + picture.width);
 * 	alert("height of picture = " + picture.height);
 * }
 * 
 * picture = {
 * 	"path" : "path to picture",
 * 	"width" : 1024,
 * 	"height" : 2048
 * };
 * 
 * path : 저장된 사진의 저장 경로.
 * width : 저장된 사진의 가로 길이.(px)
 * height : 저장된 사진의 세로 길이.(px)
 * 
 * @example
 * function errorCallback(error) {
 * 	alert("error message : " + error);
 * }
 * 
 * error : error message
 */
Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	if(isValid(successCallback) && isValid(errorCallback))
		multimediaJSNI.takePicture(GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var multimedia = new Multimedia();

/**
 * 디바이스 플렛폼 UI API.
 * 전역으로 선언된 nativeUI 를 이용해서 사용 
 * 호출 예> nativeUI.dismissProgressDialog();
 *
 * @constructor
 * @deprecated NativeUI Calss is deprecated. Use PlatformUIComponent class instead.
 */
function NativeUI() {
	deprecated("NativeUI Class", "PlatformUIComponent Class");
}

/**
 * 활성화 되어 있는 프로그래스 다이얼 로그를 닫는 함수.
 * @deprecated nativeUI.dismissProgressBarDialog is deprecated. Use platformUIComponent.dismissProgressBarDialog instead.
 */
NativeUI.prototype.dismissProgressBarDialog = function() {
	platformUIComponent.dismissProgressBarDialog();
	
	deprecated("nativeUI.dismissProgressBarDialog", "platformUIComponent.dismissProgressBarDialog");
};

/**
 * 활성화 되어 있는 프로그래스 바 다이얼 로그를 닫는 함수.
 * @deprecated nativeUI.dismissProgressDialog is deprecated. Use platformUIComponent.dismissProgressDialog instead.
 */
NativeUI.prototype.dismissProgressDialog = function() {
	platformUIComponent.dismissProgressDialog();
	
	deprecated("nativeUI.dismissProgressDialog", "platformUIComponent.dismissProgressDialog");
};

/**
 * 활성화 되어 있는 소프트 키보드를 닫는 함수.
 * @deprecated nativeUI.dismissSoftKeyboard is deprecated. Use platformUIComponent.dismissSoftKeyboard instead.
 */
NativeUI.prototype.dismissSoftKeyboard = function(callback) {
	platformUIComponent.dismissSoftKeyboard(callback);
	
	deprecated("nativeUI.dismissSoftKeyboard", "platformUIComponent.dismissSoftKeyboard");
};

/**
 * SoftKeyboard가 올라왔는지 확인하는 함수.
 * iOS platform에서 SoftKeyboard가 올라왔는 지 유무를 체크해 callback함수에 true 또는 false를 전달.
 * Android platfor에서는 SoftKeyboard가 확인 할 수 있는 방법이 없어서 빈 더미 펑션임. 항상 true를 전달.
 * 
 * @example
 * function callback(state){
 * 		alert(state);
 * };
 * 
 * @deprecated nativeUI.isKeyboardShowing is deprecated. Use platformUIComponent.isKeyboardShowing instead.
 */
NativeUI.prototype.isKeyboardShowing = function(callback) {
	platformUIComponent.isKeyboardShowing(callback);
	
	deprecated("nativeUI.isKeyboardShowing", "platformUIComponent.isKeyboardShowing");
};

/**
 * 프로그래스 바 다이얼의 현재 프로그래스를 설정 하는 함수.
 * 
 * @param {number} progress 새로운 프로그래서 값 0 ~ 100 사이.
 * @deprecated nativeUI.setProgress is deprecated. Use platformUIComponent.setProgress instead.
 */
NativeUI.prototype.setProgress = function(progress) {
	platformUIComponent.setProgress(progress);
	
	deprecated("nativeUI.setProgress", "platformUIComponent.setProgress");
};

/**
 * 선택 매뉴를 화면별로 설정하는 함.
 * 
 * @param {json} menuItems required
 * 
 * @example
 * var menuItems = [{"title" : "선택", "callback" : "select", "icon" : "/res/image/icon1.png"},
 *                  {"title" : "추가", "callback" : "add", "icon" : ""},
 *                  {"title" : "종료", "callback" : "exit"}];
 * 
 * nativeUI.setOptionMenu(menuItems);
 * 
 * icon 항목은 옵션 항목으로서 메뉴에 보여질 아이콘 이미지 가 있으면 넣고 없으면 생략가능
 * 
 * @deprecated nativeUI.setOptionMenu is deprecated. Use platformUIComponent.setOptionMenu instead.
 */
NativeUI.prototype.setOptionMenu = function(menuItems) {
	platformUIComponent.setOptionMenu(menuItems);
	
	deprecated("nativeUI.setOptionMenu", "platformUIComponent.setOptionMenu");
};

/**
 * 사용자 선택 매뉴를 화면에 보여주는 함수.
 * 
 * @param {json} menuItems required
 * @param {json} option optional
 * 
 * @example
 * var menuItems = {
 * 	"items" : [
 * 		{"전체 선택" : "selectAll"},
 * 		{"전제 삭제" : "deleteAll"},
 * 		{"종료" : "finish"}
 * 	]
 * };
 * 
 * items : context menu에서 보여질 목록의 집합.
 * 첫 필드: contex menu에서 보여질 text.
 * 두번째 필드: 목록들중 특정 목록이 선택 되었을 때 호출될 callback의 함수 이름.
 *  
 * var option = {"title" : "This is title of context menu"};
 * 
 * title : contenx menu 상단에 보여질 context menu의 title text
 * 
 * nativeUI.showContextMenu(menuItems);
 * 
 * or
 * 
 * nativeUI.showContextMenu(menuItems, option);
 * 
 * option is optional arguement.
 * 
 * @deprecated nativeUI.showContextMenu is deprecated. Use platformUIComponent.showContextMenu instead.
 */
NativeUI.prototype.showContextMenu = function(menuItems, option) {
	platformUIComponent.showContextMenu(menuItems, option);
	
	deprecated("nativeUI.showContextMenu", "platformUIComponent.showContextMenu");
};

/**
 * 날짜를 선택할 수 있는 다이얼 로그를 보여줍니다.
 * 기본 값으로 오늘의 날짜가 선택되어 있습니다.
 * 
 * @param {function} callback 날짜를 선택 했을 시 불려질 함수.
 * @param {json} option 좌표. iPad에서만 사용 
 * 
 * @example
 * function callback(date) {
 * 	alert(date.year + " : " + date.month + " : " + date.day);
 * }
 * 
 * @example
 * var option = {"x" : number,"y" : number};
 * 
 * @deprecated nativeUI.showDatePicker is deprecated. Use platformUIComponent.showDatePicker instead.
 */
NativeUI.prototype.showDatePicker = function(callback, option) {
	platformUIComponent.showDatePicker(callback, option);
	
	deprecated("nativeUI.showDatePicker", "platformUIComponent.showDatePicker");
};

/**
 * 날짜를 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값을 설정 할 수 있습니다.
 * 
 * @param {json} date 기본 값으로 설정할 날짜 정보
 * @param {function} callback 날짜를 선택 했을 시 불려질 함수
 * @param {json} option 좌표. iPad에서만 사용 
 * 
 * @example
 * var date = {"year" : 2011, "month" : 10, "day" : 31};
 * 
 * @example
 * function callback(date) {
 * 	alert(date.year + " : " + date.month + " : " + date.day);
 * }
 * 
 * @example
 * var option = {"x" : number,"y" : number};
 * 
 * @deprecated nativeUI.showDatePickerWithData is deprecated. Use platformUIComponent.showDatePickerWithData instead.
 */
NativeUI.prototype.showDatePickerWithData = function(date, callback, option) {
	platformUIComponent.showDatePickerWithData(date, callback, option);
	
	deprecated("nativeUI.showDatePickerWithData", "platformUIComponent.showDatePickerWithData");
};

/**
 * 다중 선택 할 수 있는 다이알 로그를 보여주는 함수.
 * 
 * @param {json} selection 선택 옵션 정보
 * 
 * @example
 * var = selection {
 * 	"items" : [{"item1" : false}, {"item2" : false}, {"item3" : true}],
 * 	"callback" : "multiSelectCallback",
 * 	"title" : "This is a title",
 *  "x" : number, 															// iPad only
 *  "y" : number															// iPad only
 * };
 * 
 * itmes : 다이얼로그에 보여질 항목들의 집합
 * 첫 필드 : 다이얼로그에 보여질 항목의 text
 * 두번째 필드 : 다이얼로그 보여 졌을 때 선택 여부
 * callback : 다이얼로그에서 항목을 선택하고 확인 버튼을 선택 했을 때 호출될 함수명
 * title : optional. 다이얼로그 상단에 보여질 title text.
 * x, y : iPad에서 Pop-up view의 좌표
 * 
 * function multiSelectCallback(selectedItems : Array) {
 * 	for(var i = 0; i < array.length; i++)
 * 		alert(array[i]);
 * }
 * 
 * selectedItems : 다이얼로그에서 선택된 item들의 집합
 * 
 * @deprecated nativeUI.showMultiSelect is deprecated. Use platformUIComponent.showMultiSelect instead.
 */
NativeUI.prototype.showMultiSelect = function(selection) {
	platformUIComponent.showMultiSelect(selection);
	
	deprecated("nativeUI.showMultiSelect", "platformUIComponent.showMultiSelect");
};

/**
 * 프로그레스 바 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} option 옵션 정보
 * 
 * option : optional (null, json or empty)
 * 
 * @example
 * var option = {
 * 	"message" : "message content",		// optional
 * 	"cancelable" : true | false,		// optional
 * 	"cancelCallback" : "function name"	// optional
 * };
 * 
 * message : 다이얼로그에서 보여질 text
 * cancelable : 다이얼로그를 취소 할 수 있을지 여부
 * cancelCallback : 다이얼로그가 취소 되었을때 호출될 callback function, cancelable이 true인 경우에만 동작
 * 
 * @deprecated nativeUI.showProgressBarDialog is deprecated. Use platformUIComponent.showProgressBarDialog instead.
 */
NativeUI.prototype.showProgressBarDialog = function(option) {
	platformUIComponent.showProgressBarDialog(option);
	
	deprecated("nativeUI.showProgressBarDialog", "platformUIComponent.showProgressBarDialog");
};

/**
 * 프로그레스 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} option 옵션 정보
 * 
 * option : optional (null, json or empty)
 * 
 * @example
 * var option = {
 * 	"message" : "message content",		// optional
 * 	"cancelable" : true | false,		// optional
 * 	"cancelCallback" : "function name",	// optional
 * 	"color" : "white" | "grey"			// iOS only
 * };
 * 
 * message : 다이얼로그에서 보여질 text (Android 전용)
 * cancelable : 다이얼로그를 취소 할 수 있을지 여부 (Android 전용)
 * cancelCallback : 다이얼로그가 취소 되었을때 호출될 callback function, cancelable이 true인 경우에만 동작
 * color : 다이얼로그의 생상(iOS 전용)
 * 
 * @example
 * showProgressDialog();
 * showProgressDialog(null);
 * showProgressDialog(option);
 * 
 * nativeUI.showProgressDialog(); or nativeUI.showProgressDialog(option);
 * 
 * @deprecated nativeUI.showProgressDialog is deprecated. Use platformUIComponent.showProgressDialog instead.
 */
NativeUI.prototype.showProgressDialog = function(option) {
	platformUIComponent.showProgressDialog(option);
	
	deprecated("nativeUI.showProgressDialog", "platformUIComponent.showProgressDialog");
};

/**
 * 단일 선택 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} selection 선택 옵션
 * 
 * @example
 * var selection = {
 * 	"items" : ["item 1", "item 2", "item 3"],	// required
 * 	"defValue" : 0,								// required
 * 	"callback" : "singleSelectCallback",		// required
 * 	"title" : "this is a title"					// optional
 *  "x" : number, 								// iPad only
 *  "y" : number								// iPad only
 * }
 * 
 * items : 다이얼로그에 보여줄 항목의 집합
 * 필드 : 다이얼로그에 보여줄 항목의 text
 * callback : 다이얼로그에서 특정 항목이 선택 되었을때 호출될 callback 함수명
 * title : 다이얼로그 상단에 보여질 title text.
 * x, y : iPad에서 Pop-up view의 좌표
 *  
 * function singleSelectCallback(selectedIndex) {
 * 	alert("Selected index is " + selectedIndex);
 * }
 * 
 * selectedIndex : 다이얼로그에서 선택된 항목의 index
 * 
 * @deprecated nativeUI.showSingleSelect is deprecated. Use platformUIComponent.showSingleSelect instead.
 */
NativeUI.prototype.showSingleSelect = function(selection) {
	platformUIComponent.showSingleSelect(selection);
	
	deprecated("nativeUI.showSingleSelect", "platformUIComponent.showSingleSelect");
};

/**
 * 시간을 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값으로 현제 시간이 선택 됨.
 * 
 * @param {function} callback 선택후 불려질 함수
 * @param {json} option
 * 
 * @example
 * function callback(time) {
 * 	alert(time.hour + "" : "" + time.minute + "" : "" + time.ampm);
 * }"
 * 
 * @example
 * var option = {
 *  "is24HourView" : ture | false,
 *  "x" : number, 						// iPad only
 *  "y" : number						// iPad only
 * }
 * 
 * x, y : iPad에서 Pop-up view의 좌표
 * 만약, option이 없다면 그대로 실행됨.
 * is24HourView가 true이면 display되어지고 데이터타입은 24HourView mode.
 * 
 * @deprecated nativeUI.showTimePicker is deprecated. Use platformUIComponent.showTimePicker instead.
 */
NativeUI.prototype.showTimePicker = function(callback, option) {
	platformUIComponent.showTimePicker(callback, option);
	
	deprecated("nativeUI.showTimePicker", "platformUIComponent.showTimePicker");
};

/**
 * 시간을 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값을 설정 할 수 있음.
 * 
 * @param {json} time 기본 설정 시간 정보
 * @param {function} callback 선택후 불려질 함수
 * 
 * @example
 * var time = {"hour" : 7, "minute" : 16, "ampm" :"am" | "pm"}
 * 
 * hour : 다이얼로그에서 보여줄 시간 정보
 * minute : 다이얼로그에서 보여줄 분 정보
 * ampm : 다이얼로그에서 보여줄 am/pm 정보
 * 
 * function callback(time) {
 * 	alert(time.hour + " : " + time.minute + " : " + time.ampm);
 * }
 * 
 * @example
 * var option = {
 *  "is24HourView" : ture | false,
 *  "x" : number, 						// iPad only
 *  "y" : number						// iPad only
 * }
 * 
 * x, y : iPad에서 Pop-up view의 좌표
 * 만약, option이 없다면 그대로 실행됨.
 * is24HourView가 true이면 display되어지고 데이터타입은 24HourView mode.
 * 
 * @deprecated nativeUI.showTimePickerWithData is deprecated. Use platformUIComponent.showTimePickerWithData instead.
 */
NativeUI.prototype.showTimePickerWithData = function(time, callback, option) {
	platformUIComponent.showTimePickerWithData(time, callback, option);
	
	deprecated("nativeUI.showTimePickerWithData", "platformUIComponent.showTimePickerWithData");
};

var nativeUI = new NativeUI();

/**
 * 디바이스 기본 전화기능 클래스
 * 전역으로 선언된 phone 를 이용해서 사용 
 * 호출 예> phone.call(number);
 *
 * @constructor
 */
function Phone() {
}

/**
 * 전화걸기 실행 함수.
 * 
 * @param {number} number 전화번호.
 */
Phone.prototype.call = function(number) {
	if(isValid(number))
		phoneJSNI.call(number);
};

/**
 * 이메일 보내기 함수.
 * @param {json} mail 이메일 정보 데이터
 * 
 * @example
 * var mail = {
 * 	"to" : ["a@b.com", "c@d.com", "e@f.com"],
 * 	"title" : "title value",
 * 	"body" : "body contents",
 * 	"cc" : ["a@b.com", "c@d.com", "e@f.com"],
 * "bcc" : ["a@b.com", "c@d.com", "e@f.com"]
 * };
 */
Phone.prototype.sendEmail = function(mail) {
	if(isValid(mail))
		phoneJSNI.sendEmail(JSON.stringify(mail));
};

/**
 * SMS 보내기 함수.
 * @param {json} sms sms 정보 데이터
 * 
 * @example
 * var sms = {
 * 	"numbers" : ["01011112222", "01022223333"],
 * 	"message" : "message body",
 * };
 * 
 * 갤럭시S2 LTE HD버전에서 number만 들어가고 message body는 들어가지않음.
 */
Phone.prototype.sendSMS = function(sms) {
	if(isValid(sms))
		phoneJSNI.sendSMS(JSON.stringify(sms));
};

var phone = new Phone();

/**
 * 어플리케이션 저장소 클래스
 * 어플리케이션이 종료 되었다가 실행되어도 preference의 정보는 유지됨.
 * 전역으로 선언된 preference 를 이용해서 사용 
 * 호출 예> preference.contains(key);
 *
 * @constructor
 */
function Preference() {
}

/**
 * preferences에 해당 key가 존재하는 알아보는 함수.
 * 
 * @param {string} key 존재 유무를 확인할 key.
 * @returns {boolean} Returns Preference에 해당키가 존재하면 true, 존재 하지 않으면 false리턴.
 */
Preference.prototype.contains = function(key) {
	if(isValid(key))
		return preferenceJSNI.contains(key);
};

/**
 * Preference에서 value를 가져오는 함수.
 * 
 * @param {string} key Preference에서 가져올 value의 key.
 * @returns {string} Value key에 해당하는 value.
 */
Preference.prototype.get = function(key) {
	if(isValid(key))
		return preferenceJSNI.get(key);
	else
		return undefined;
};

/**
 * Preference에 value를 저장하는 함수.
 * 
 * @param {string} key value의 key.
 * @param {string} value 저장할 value.
 * 
 * Preference는 key가 중복 될 수 없다. 때문에 GlobalPreference에 이미 존재하는 key라면 value가 수정됨.
 */
Preference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value))
		preferenceJSNI.put(key, value);
};

/**
 * Preference에서 key, value를 제거하는 함수.
 * 
 * @param {string} key Preference에서 제거하기를 원하는 key.
 */
Preference.prototype.remove = function(key) {
	if(isValid(key))
		preferenceJSNI.remove(key);
};

/**
 * preference의 모든 key, value를 지우는 함수.
 */
Preference.prototype.removeAll = function() {
	preferenceJSNI.removeAll();
};

var preference = new Preference();

/**
 * PushNotification을 관장하는 클래스
 * 전역으로 선언된 pushNotification 를 이용해서 사용
 * 호출 예> pushNotification.addNotification();
 *
 * @constructor
 */
function PushNotification() {
}

/**
 * 저장된 unreadNotification을 모두 삭제하는 함수
 * @example
 * pushNotification.deleteAllUnreadNotifications();
 * 
 */
PushNotification.prototype.deleteAllUnreadNotifications = function() {
	pushNotificationJSNI.deleteAllUnreadNotifications();
};

/**
 * 저장된 unreadNotification중 전달받은 index에 해당하는 unreadNotification을 삭제 하는 함수.
 * 
 * @param {int} index 삭제할 unreadNotification의 index
 * 
 * @example
 * pushNotification.deleteUnreadNotification(0);
 * 
 */
PushNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		pushNotificationJSNI.deleteUnreadNotification(index);
};

/**
 * register함수를 통해 Push Server(GCM or apns)에 등록된 id를 가져오는 함수.
 * 
 * @param {function} callback callback method
 * 
 * @example
 * pushNotification.getRegistrationId(callback);
 * 
 * function callback(id) {
 * 	alert(id);
 * }
 */
PushNotification.prototype.getRegistrationId = function(callback) {
	if(isValid(callback))
		pushNotificationJSNI.getRegistrationId(GetFunctionName(callback));
};

/**
 * 저장된 모든 unreadNotification을 가져오는 함수.
 * 
 * @param {function} callback callback method
 * 
 * @example
 * pushNotification.getUnreadNotifications(callback);
 * 
 * function callback(notifications) {
 * 	for( var i = 0; i < notifications.length; i++) {
 * 		alert(notifications[i].alert);
 * 	}
 * }
 * 
 * addNotification에 입력한 action정보가 그대로 전달됨.
 */
PushNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		pushNotificationJSNI.getUnreadNotifications(GetFunctionName(callback));
};

/**
 * Push Server(GCM)에 식별자(디바이스, 어플리케이션)를 등록하는 함수.
 * -android 플랫폼 고유 함수-
 * 
 * @param {string} senderId 구글GCM을 사용하기 위한 senderId
 * 
 * @example
 * pushNotification.register("0000000");
 * 
 */
PushNotification.prototype.register = function(senderId) {
	if(isValid(senderId))
		pushNotificationJSNI.register(senderId);
};

/**
 * Push Server(GCM)에 등록된 식별자(디바이스, 어플리케이션)를 제거하는 함수.
 * -android 플랫폼 고유 함수-
 * 
 * @example
 * pushNotification.unregister();
 * 
 */
PushNotification.prototype.unregister = function() {
	pushNotificationJSNI.unregister();
};

/**
 * addNotification으로 설정한 notification을 취소하는 함수.
 * 
 * @param {boolean} use immediateForegroundNotification을 사용 할지 여부.
 * 
 * @example
 * pushNotification.useImmediateForegroundNotification(true);
 * 
 */
PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		pushNotificationJSNI.useImmediateForegroundNotification(use);
};

var pushNotification = new PushNotification();

/**
 * 어플리케이션의 네비게이션을 관리하는 클래스.
 * 전역으로 선언된 navigation을 이용해서 사용 
 * 호출 예> navigation.goHome(); 
 *
 * @constructor
 * @property {json} parameters 이전 페이지에서 전달받은 데이터.
 * @property {json} results navigation.back(results) 를 통해서 전달받은 데이터.
 * @property {string} pageId 현제 화면의 pageId
 * @example
 * A페이지에서 B페이지로 이동 시 parameters를 B페이지에서 다음과 같이 사용.
 * var param = navigation.parameters.key
 * A페이지에서 B페이지로 이동 후 back을 통해 다시 A페이지로 이동시 results를 다음과 같이 사용.
 * var param = navigation.results.key
 * 
 * var params = {
 * 	"key1" : "value1",
 * 	"key2" : "value2",
 * 	"key3" : "value3"
 * }
 */
function Navigation() {
	this.parameters = null;
	this.results = null;
	this.pageId = null;
}

/**
 * 이전 페이지로 이동하는 함수. 
 * 이동시 전달할 데이터가 있으면 json 형식으로, 없으면 생략가능.
 * 
 * @param {json|empty} results 이전 페이지로 이동시 전달할 데이터, 없으면 생략가능.
 * @example
 * var results = {
 * 	"key1" : "value1",
 * 	"key2" : "value2",
 * 	"key3" : "value3"
 * };
 * 
 * -android 플랫폼 고유 기능- 시작 페이지에서 back호출 시 앱종료 
 */
Navigation.prototype.back = function(results) {
	if(results)
		navigationJSNI.back(JSON.stringify(results));
	else
		navigationJSNI.back();
};

/**
 * 화면 히스토리 상의 특정 페이지로 이동하는 함수.
 * 어플리케이션 screen history에 이동하고자 하는 페이지가 존재하는 경우 그 화면까지의 history를 모두 삭제하고 해당 페이지로 이동.
 * 어플리케이션 screen history에 해당 페이지가 존재 하지 않는 경우 화면 전환 하지 않음.
 * 
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "page id",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * };
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters : optional
 * 
 * A화면에서 B화면으로 이동 후 다시 B화면에서 C화면으로 이동 C화면에서 backTo를 통해 A로 이동시 히스토리에 A화면이 존재하기 때문에 히스토리에서 B를 삭제하고 A로이동
 */
Navigation.prototype.backTo = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(typeof (navigationRule) == "string") {
			var pageInfo = {};
			pageInfo.pageId = navigationRule;
			navigationRule = pageInfo;
		}
		
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		navigationJSNI.backTo(JSON.stringify(navigationRule));
	}
};

/**
 * 특정 페이지로 이동하는 함수.
 * 어플리케이션 screen history에 이동하고자 하는 페이지가 존재하는 경우 그 화면까지의 history를 모두 삭제하고 해당 페이지로 이동.
 * 어플리케이션 screen history에 해당 페이지가 존재 하지 않는 경우 navigation함수를 통해 페이지 이동.
 * 
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "page id",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * };
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters : optional
 * 
 * A화면에서 B화면으로 이동 후 다시 B화면에서 C화면으로 이동 C화면에서 backTo를 통해 A로 이동시 히스토리에 A화면이 존재하기 때문에 히스토리에서 B를 삭제하고 A로이동
 * C화면에서 backTo D를 하면 히스토리에 D가 존재 하지 않기 때문에 navigate D로 동작함
 */
Navigation.prototype.backToOrNavigate = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(typeof (navigationRule) == "string") {
			var pageInfo = {};
			pageInfo.pageId = navigationRule;
			navigationRule = pageInfo;
		}
		
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		navigationJSNI.backToOrNavigate(JSON.stringify(navigationRule));
	}
};

/**
 * -android 플렛폼 고유 함수(apple정책상 강제로 어플리케이션 종료 시킬수 없음)-
 * 어플리케이션을 종료 시키는 함수.
 */
Navigation.prototype.exit = function() {
	navigationJSNI.exit();
};

/**
 * 어플리케이션의 Navigate History의 root screen 으로 이동하는 함수.
 */
Navigation.prototype.goHome = function() {
	navigationJSNI.goHome();
};

/**
 * 어플리케이션 screen 이동 하는 함수.
 * 
 * @param {json} navigationRule 이동할 screen의 정보.
 * @example
 * var navigationRule = {
 * 	"pageId" : "pageid",
 * 	"parameters" : {
 * 		"parameter1" : "value1",
 * 		"parameter2" : "value2",
 * 		"parameter3" : "value3"
 * 	}
 * 	"loadImage": "image url",
 * 	"autoDismiss" : true | false
 * }
 * 
 * pageId : required (이동할 페이지의 id)
 * parameters, loadImage, autoDismiss : optional
 * loadImage가 있으면 네비게이션 중간에 이미지를 로드함. loadImage가 있는데 autoDismiss가 없으면 자동으로 true
 */
Navigation.prototype.navigate = function(navigationRule) {
	if(isValid(navigationRule)) {
		if(typeof (navigationRule) == "string") {
			var pageInfo = {};
			pageInfo.pageId = navigationRule;
			navigationRule = pageInfo;
		}
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule object.");
			
			return;
		}
		
		this.results = null;
		navigationJSNI.navigate(JSON.stringify(navigationRule));
	}
};

var navigation = new Navigation();


/**
 * 디바이스 플렛폼 UI API.
 * 전역으로 선언된 platformUIComponent 를 이용해서 사용 
 * 호출 예> platformUIComponent.dismissProgressDialog();
 *
 * @constructor
 */
function PlatformUIComponent() {
}

/**
 * 활성화 되어 있는 프로그래스 바 다이얼 로그를 닫는 함수.
 */
PlatformUIComponent.prototype.dismissProgressBarDialog = function() {
	platformUIComponentJSNI.dismissProgressBarDialog();
};

/**
 * 활성화 되어 있는 프로그래스 다이얼 로그를 닫는 함수.
 */
PlatformUIComponent.prototype.dismissProgressDialog = function() {
	platformUIComponentJSNI.dismissProgressDialog();
};

/**
 * 활성화 되어 있는 소프트 키보드를 닫는 함수.
 * 
 * @param {function} callback softKeyboard가 사라질 때 호출될 함수.
 */
PlatformUIComponent.prototype.dismissSoftKeyboard = function(callback) {
	if(isValid(callback))
		platformUIComponentJSNI.dismissSoftKeyboard(GetFunctionName(callback));
};

/**
 * SoftKeyboard가 올라왔는지 확인하는 함수.
 * iOS platform에서 SoftKeyboard가 올라왔는 지 유무를 체크해 callback함수에 true 또는 false를 전달.
 * Android platfor에서는 SoftKeyboard가 확인 할 수 있는 방법이 없어서 빈 더미 펑션임. 항상 true를 전달.
 * 
 * @param {function} callback 결과값을 전달 받을 함수.
 * @example
 * function callback(state){
 * 		alert(state);
 * };
 */
PlatformUIComponent.prototype.isKeyboardShowing = function(callback) {
	if(isValid(callback))
		callback(true);
};

/**
 * 프로그래스 바 다이얼의 현재 프로그래스를 설정 하는 함수.
 * 
 * @param {number} progress 진행 값 0 ~ 100 사이.
 */
PlatformUIComponent.prototype.setProgress = function(progress) {
	if(isValid(progress)) {
		if(progress >= 0 && progress <= 100)
			platformUIComponentJSNI.setProgress(progress);
	}
};

/**
 * 선택 매뉴를 화면별로 설정하는 함.
 * 
 * @param {json} menuItems 메뉴에 보여질 항목.
 * 
 * @example
 * var menuItems = [{"title" : "선택", "callback" : "select", "icon" : "/res/image/icon1.png"},
 *                  {"title" : "추가", "callback" : "add", "icon" : ""},
 *                  {"title" : "종료", "callback" : "exit"}];
 * 
 * platformUIComponent.setOptionMenu(menuItems);
 * 
 * icon 항목은 옵션 항목으로서 메뉴에 보여질 아이콘 이미지 가 있으면 넣고 없으면 생략가능
 */
PlatformUIComponent.prototype.setOptionMenu = function(menuItems) {
	if(isValid(menuItems))
		platformUIComponentJSNI.setOptionMenu(JSON.stringify(menuItems));
};

/**
 * 사용자 선택 매뉴를 화면에 보여주는 함수.
 * 
 * @param {json} menuItems 메뉴에 보여질 항목. required
 * @param {json} option 추가 설정 정보. optional
 * 
 * @example
 * var menuItems = {
 * 	"items" : [
 * 		{"전체 선택" : "selectAll"},
 * 		{"전제 삭제" : "deleteAll"},
 * 		{"종료" : "finish"}
 * 	]
 * };
 * 
 * items : context menu에서 보여질 목록의 집합.
 * 첫 필드: contex menu에서 보여질 text.
 * 두번째 필드: 목록들중 특정 목록이 선택 되었을 때 호출될 callback의 함수 이름.
 *  
 * var option = {"title" : "This is title of context menu"};
 * 
 * title : contenx menu 상단에 보여질 context menu의 title text
 * 
 * platformUIComponent.showContextMenu(menuItems);
 * 
 * or
 * 
 * platformUIComponent.showContextMenu(menuItems, option);
 * 
 * option is optional arguement.
 */
PlatformUIComponent.prototype.showContextMenu = function(menuItems, option) {
	if(isValid(menuItems)) {
		if(isValid(option))
			platformUIComponentJSNI.showContextMenu(JSON.stringify(menuItems), JSON.stringify(option));
		else
			platformUIComponentJSNI.showContextMenu(JSON.stringify(menuItems), "");
	}
};

/**
 * 날짜를 선택할 수 있는 다이얼 로그를 보여줍니다.
 * 기본 값으로 오늘의 날짜가 선택되어 있습니다.
 * 
 * @param {function} callback 날짜를 선택 했을 시 불려질 함수.
 * @param {json} option 좌표. iPad에서만 사용 
 * 
 * @example
 * function callback(date) {
 * 	alert(date.year + " : " + date.month + " : " + date.day);
 * }
 * 
 * @example
 * var option = {"x" : number,"y" : number};
 */
PlatformUIComponent.prototype.showDatePicker = function(callback, option) {
	if(isValid(callback))
		platformUIComponentJSNI.showDatePicker(GetFunctionName(callback));
};

/**
 * 날짜를 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값을 설정 할 수 있습니다.
 * 
 * @param {json} date 기본 값으로 설정할 날짜 정보
 * @param {function} callback 날짜를 선택 했을 시 불려질 함수
 * @param {json} option 좌표. iPad에서만 사용 
 * 
 * @example
 * var date = {"year" : 2011, "month" : 10, "day" : 31};
 * 
 * @example
 * function callback(date) {
 * 	alert(date.year + " : " + date.month + " : " + date.day);
 * }
 * 
 * @example
 * var option = {"x" : number,"y" : number};
 */
PlatformUIComponent.prototype.showDatePickerWithData = function(date, callback, option) {
	if(isValid(date) && isValid(callback)) {
		if(date.year < 1900) {
			log.warn("Set year to 1900 since " + date.year + " is not valid year.");
			date.year = 1900;
		} else if(date.year > 2100) {
			log.warn("Set year to 2100 since " + date.year + " is not valid year.");
			date.year = 2100;
		}
		
		if(date.month < 1) {
			log.warn("Set month to 1 since " + date.month + " is not valid month.");
			date.month = 1;
		} else if(date.month > 12) {
			log.warn("Set month to 12 since " + date.month + " is not valid month.");
			date.month = 12;
		}
		
		if(date.day < 1) {
			log.warn("Set day to 1 since " + date.day + " is not valid day.");
			date.day = 1;
		} else {
			if(date.month == 2) {
				if(date.year % 4 != 0) {
					if(date.day > 28) {
						log.warn("Set day to 28 since " + date.day + " is not valid day.");
						date.day = 28;
					}
				} else {
					if(date.day > 29) {
						log.warn("Set day to 29 since " + date.day + " is not valid day.");
						date.day = 29;
					}
				}
			} else if(date.month == 4 || date.month == 6 || date.month == 9 || date.month == 11) {
				if(date.day > 30) {
					log.warn("Set day to 30 since " + date.day + " is not valid day.");
					date.day = 30;
				}
			} else {
				if(date.day > 31) {
					log.warn("Set day to 31 since " + date.day + " is not valid day.");
					date.day = 31;
				}
			}
		}
		
		platformUIComponentJSNI.showDatePickerWithData(JSON.stringify(date), GetFunctionName(callback));
	}
};

/**
 * 다중 선택 할 수 있는 다이알 로그를 보여주는 함수.
 * 
 * @param {json} selection 선택 옵션 정보
 * 
 * @example
 * var = selection {
 * 	"items" : [{"item1" : false}, {"item2" : false}, {"item3" : true}],
 * 	"callback" : "multiSelectCallback",
 * 	"title" : "This is a title",
 *  "x" : number, 															// iPad only
 *  "y" : number															// iPad only
 * };
 * 
 * itmes : 다이얼로그에 보여질 항목들의 집합
 * 첫 필드 : 다이얼로그에 보여질 항목의 text
 * 두번째 필드 : 다이얼로그 보여 졌을 때 선택 여부
 * callback : 다이얼로그에서 항목을 선택하고 확인 버튼을 선택 했을 때 호출될 함수명
 * title : optional. 다이얼로그 상단에 보여질 title text.
 * x, y : iPad에서 Pop-up view의 좌표
 * 
 * function multiSelectCallback(selectedItems : Array) {
 * 	for(var i = 0; i < array.length; i++)
 * 		alert(array[i]);
 * }
 * 
 * selectedItems : 다이얼로그에서 선택된 item들의 집합
 */
PlatformUIComponent.prototype.showMultiSelect = function(selection) {
	if(isValid(selection))
		platformUIComponentJSNI.showMultiSelect(JSON.stringify(selection));
};

/**
 * 프로그레스 바 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} option 옵션 정보
 * 
 * option : optional (null, json or empty)
 * 
 * @example
 * var option = {
 * 	"message" : "message content",		// optional
 * 	"cancelable" : true | false,		// optional
 * 	"cancelCallback" : "function name"	// optional
 * };
 * 
 * message : 다이얼로그에서 보여질 text
 * cancelable : 다이얼로그를 취소 할 수 있을지 여부
 * cancelCallback : 다이얼로그가 취소 되었을때 호출될 callback function, cancelable이 true인 경우에만 동작
 */
PlatformUIComponent.prototype.showProgressBarDialog = function(option) {
	if(isValid(option))
		platformUIComponentJSNI.showProgressBarDialog(JSON.stringify(option));
	else
		platformUIComponentJSNI.showProgressBarDialog("");
};

/**
 * 프로그레스 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} option 옵션 정보
 * 
 * option : optional (null, json or empty)
 * 
 * @example
 * var option = {
 * 	"message" : "message content",		// optional
 * 	"cancelable" : true | false,		// optional
 * 	"cancelCallback" : "function name",	// optional
 * 	"color" : "white" | "grey"			// iOS only
 * };
 * 
 * message : 다이얼로그에서 보여질 text (Android 전용)
 * cancelable : 다이얼로그를 취소 할 수 있을지 여부 (Android 전용)
 * cancelCallback : 다이얼로그가 취소 되었을때 호출될 callback function, cancelable이 true인 경우에만 동작
 * color : 다이얼로그의 생상(iOS 전용)
 * 
 * @example
 * showProgressDialog();
 * showProgressDialog(null);
 * showProgressDialog(option);
 * 
 * platformUIComponent.showProgressDialog(); or platformUIComponent.showProgressDialog(option);
 */
PlatformUIComponent.prototype.showProgressDialog = function(option) {
	if(isValid(option))
		platformUIComponentJSNI.showProgressDialog(JSON.stringify(option));
};

/**
 * 단일 선택 다이얼 로그를 보여주는 함수.
 * 
 * @param {json} selection 선택 옵션
 * 
 * @example
 * var selection = {
 * 	"items" : ["item 1", "item 2", "item 3"],	// required
 * 	"defValue" : 0,								// required
 * 	"callback" : "singleSelectCallback",		// required
 * 	"title" : "this is a title"					// optional
 *  "x" : number, 								// iPad only
 *  "y" : number								// iPad only
 * }
 * 
 * items : 다이얼로그에 보여줄 항목의 집합
 * 필드 : 다이얼로그에 보여줄 항목의 text
 * callback : 다이얼로그에서 특정 항목이 선택 되었을때 호출될 callback 함수명
 * title : 다이얼로그 상단에 보여질 title text.
 * x, y : iPad에서 Pop-up view의 좌표
 *  
 * function singleSelectCallback(selectedIndex) {
 * 	alert("Selected index is " + selectedIndex);
 * }
 * 
 * selectedIndex : 다이얼로그에서 선택된 항목의 index
 */
PlatformUIComponent.prototype.showSingleSelect = function(selection) {
	if(isValid(selection))
		platformUIComponentJSNI.showSingleSelect(JSON.stringify(selection));
};

/**
 * 시간을 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값으로 현제 시간이 선택 됨.
 * 
 * @param {function} callback 선택후 불려질 함수
 * @param {json} option 12/24표기법, timePicker가 보여질 화면 좌표.
 * 
 * @example
 * function callback(time) {
 * 	alert(time.hour + "" : "" + time.minute + "" : "" + time.ampm);
 * }"
 * 
 * @example
 * var option = {
 *  "is24HourView" : ture | false,
 *  "x" : number, 						// iPad only
 *  "y" : number						// iPad only
 * }
 * 
 * x, y : iPad에서 Pop-up view의 좌표
 * 만약, option이 없다면 그대로 실행됨.
 * is24HourView가 true이면 display되어지고 데이터타입은 24HourView mode.
 */
PlatformUIComponent.prototype.showTimePicker = function(callback, option) {
	if(isValid(callback)) {
		if(isValid(option))
			platformUIComponentJSNI.showTimePicker(GetFunctionName(callback), JSON.stringify(option));
		else
			platformUIComponentJSNI.showTimePicker(GetFunctionName(callback), "");
	}
};

/**
 * 시간을 선택할 수 있는 다이얼 로그를 보여주는 함수.
 * 기본 값을 설정 할 수 있음.
 * 
 * @param {json} time 기본 설정 시간 정보
 * @param {function} callback 선택후 불려질 함수
 * @param {json} option 12/24표기법, timePicker가 보여질 화면 좌표.
 * 
 * @example
 * var time = {"hour" : 7, "minute" : 16, "ampm" :"am" | "pm"}
 * 
 * hour : 다이얼로그에서 보여줄 시간 정보
 * minute : 다이얼로그에서 보여줄 분 정보
 * ampm : 다이얼로그에서 보여줄 am/pm 정보
 * 
 * function callback(time) {
 * 	alert(time.hour + " : " + time.minute + " : " + time.ampm);
 * }
 * 
 * @example
 * var option = {
 *  "is24HourView" : ture | false,
 *  "x" : number, 						// iPad only
 *  "y" : number						// iPad only
 * }
 * 
 * x, y : iPad에서 Pop-up view의 좌표
 * 만약, option이 없다면 그대로 실행됨.
 * is24HourView가 true이면 display되어지고 데이터타입은 24HourView mode.
 */
PlatformUIComponent.prototype.showTimePickerWithData = function(time, callback, option) {
	if(isValid(time) && isValid(callback)) {
		if(time.ampm != "AM" && time.ampm != "am" && time.ampm != "PM" && time.ampm != "pm") {
			log.error("Insert AM, am, PM, or pm.");
			
			return;
		}
		
		if(time.hour < 1) {
			log.warn("Set hour to 1 since " + time.hour + " is not valid hour.");
			time.hour = 1;
		} else if(time.hour > 12) {
			log.warn("Set hour to 11 since " + time.hour + " is not valid hour.");
			time.hour = 12;
		}
		
		if(time.minute < 0) {
			log.warn("Set min to 0 since " + time.minute + " is not valid min.");
			time.minute = 0;
		} else if(time.minute > 59) {
			log.warn("Set min to 59 since " + time.minute + " is not valid min.");
			time.minute = 59;
		}
		
		if(isValid(option))
			platformUIComponentJSNI.showTimePickerWithData(JSON.stringify(time), GetFunctionName(callback), JSON.stringify(option));
		else
			platformUIComponentJSNI.showTimePickerWithData(JSON.stringify(time), GetFunctionName(callback), "");
	}
};

var platformUIComponent = new PlatformUIComponent();

function Sensor() {
}

Sensor.prototype.turnOnLight = function() {
	deviceSensorJSNI.turnOnLight();
};

Sensor.prototype.turnOffLight = function() {
	deviceSensorJSNI.turnOffLight();
};

Sensor.prototype.vibrate = function() {
	deviceSensorJSNI.vibrate();
};

Sensor.prototype.startAccelerometerSensor = function(successCallback, errorCallback, interval) {
	if(isValid(successCallback) && isValid(errorCallback)) {
		if(typeof (successCallback) == "function" && typeof (errorCallback) == "function") {
			if(interval == undefined || interval == null || interval == "") {
				deviceSensorJSNI.startAccelerometerSensor(GetFunctionName(successCallback), GetFunctionName(errorCallback), -1);
			} else {
				deviceSensorJSNI.startAccelerometerSensor(GetFunctionName(successCallback), GetFunctionName(errorCallback), interval);
			}
		}
	}
};

Sensor.prototype.stopAccelerometerSensor = function() {
	deviceSensorJSNI.stopAccelerometerSensor();
};

Sensor.prototype.startCompassSensor = function(successCallback, errorCallback, interval) {
	if(isValid(successCallback) && isValid(errorCallback)) {
		if(typeof (successCallback) == "function" && typeof (errorCallback) == "function") {
			if(interval == undefined || interval == null || interval == "") {
				deviceSensorJSNI.startCompassSensor(GetFunctionName(successCallback), GetFunctionName(errorCallback), -1);
			} else {
				deviceSensorJSNI.startCompassSensor(GetFunctionName(successCallback), GetFunctionName(errorCallback), interval);
			}
		}
	}
};

Sensor.prototype.stopCompassSensor = function() {
	deviceSensorJSNI.stopCompassSensor();
};

var sensor = new Sensor();