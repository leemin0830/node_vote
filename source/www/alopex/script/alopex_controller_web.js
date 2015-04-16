/* 
 * Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved. 
 * 
 * This software is the confidential and proprietary information of SK C&C. 
 * You shall not disclose such confidential information and shall use it 
 * only in accordance with the terms of the license agreement you entered into 
 * with SK C&C. 
 */
/**
 * @version 3.0.11
 */

var _anomFunkMap = {};
var _anomFunkMapNextId = 0;

function AlopexConfigManager() {
	this.pageList = null;
	this.initialize();
}

AlopexConfigManager.prototype.getDefaultPageInfo = function(pageId) {
	var rootUri = window.location.href.substring(0, window.location.href.indexOf("www") + 3);
	var info = {};
	
	info.id = pageId.replace(rootUri, "");
	info.uri = rootUri + pageId;
	info.type = "local";
	info.orientation = "portrait";
	info.skipPage = false;
	
	return info;
};

AlopexConfigManager.prototype.getPageById = function(pageId) {
	if(this.pageList == null) {
		this.pageList = JSON.parse(window.sessionStorage.alopexConfig);
	}
	
	if(this.pageList[pageId] == undefined || this.pageList[pageId] == null || this.pageList[pageId] == "") {
		return this.getDefaultPageInfo(pageId);
	} else {
		return this.pageList[pageId];
	}
};

AlopexConfigManager.prototype.getPageByUrl = function(url) {
	if(this.pageList == null) {
		this.pageList = JSON.parse(window.sessionStorage.alopexConfig);
	}
	
	if(this.pageList[url] == undefined || this.pageList[url] == null || this.pageList[url] == "") {
		return this.getDefaultPageInfo(url);
	} else {
		return this.pageList[url];
	}
};

AlopexConfigManager.prototype.initialize = function() {
	var rootUri = window.location.href.substring(0, window.location.href.indexOf("www") + 3);
	
	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET", rootUri + "/alopexconfig.xml", false);
	xmlhttp.send();
	
	var pageElementList = xmlhttp.responseXML.getElementsByTagName("page");
	var pageList = {};
	var page;
	
	for( var i = 0; i < pageElementList.length; i++) {
		page = {};
		page.id = pageElementList[i].getAttribute("id");
		page.uri = pageElementList[i].getAttribute("uri");
		
		if("local" == pageElementList[i].getAttribute("type"))
			page.uri = rootUri + page.uri;
		
		pageList[page.id] = page;
		pageList[page.uri] = page;
	}
	
	window.sessionStorage.alopexConfig = JSON.stringify(pageList);
};

var alopexConfigManager = new AlopexConfigManager();

function anomToNameFunk(fun) {
	var funkId = "f" + _anomFunkMapNextId++;
	var funk = function() {
		_anomFunkMap[funkId].apply(this, arguments);
		_anomFunkMap[funkId] = null;
		delete _anomFunkMap[funkId];
	};
	
	_anomFunkMap[funkId] = funk;
	return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn) {
	if(fn) {
		var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
		return m ? m[1] : anomToNameFunk(fn);
	} else {
		return null;
	}
}

function isValid(arg) {
	if(arg == undefined || arg == null) {
		log.warn("There are invalid arguements.");
		
		var caller = arguments.callee;
		
		while(true) {
			caller = caller.caller;
			
			if(caller == null) {
				break;
			}
			
			if(caller.name != "") {
				log.warn("Caller : " + caller.name);
			}
		}
		
		return false;
	} else {
		return true;
	}
}

window.onload = function() {
	setAlopexEvent("alopexready");
	
	if(window.sessionStorage.backFlag != undefined && window.sessionStorage.backFlag != null && window.sessionStorage.backFlag != "null") {
		if(typeof onScreenBack != "undefined") {
			onScreenBack();
		}
		setAlopexEvent("screenback");
		window.sessionStorage.backFlag = null;
	}
};

function setAlopexEvent(eventName) {
	var e = document.createEvent('Events');
	e.initEvent(eventName, true, true);
	document.dispatchEvent(e);
}

function notSupported(functionName) {
	alert(functionName + " is not supported on " + device.platformName);
}

function deprecated(functionName, alternative) {
	console.log(functionName + " is deprecated. Use " + alternative + " instead");
}

Alopex = {};

Alopex.exec = function() {
	notSupported("Alopex.exec");
	
	deprecated("Alopex.exec", "jsniCaller.invoke");
};

function JSNICaller() {
}

JSNICaller.prototype.invoke = function() {
	notSupported("JSNICaller.invoke");
};

var jsniCaller = new JSNICaller();

function AlopexController() {
	this.parameters = null;
	this.results = null;
	this.pageId = null;
}

AlopexController.prototype.back = function(results) {
	console.log("[AlopexController/back]");
	deprecated("alopexController.back", "navigation.back");
	
	navigation.back(results);
};

AlopexController.prototype.backTo = function(navigationRule) {
	console.log("[AlopexController/backTo]");
	deprecated("alopexController.backTo", "navigation.backToOrNavigate");
	
	navigation.backTo(navigationRule);
};

AlopexController.prototype.backToOrNavigate = function(navigationRule) {
	console.log("[AlopexController/backToOrNavigate]");
	deprecated("alopexController.backToOrNavigate", "navigation.backToOrNavigate");
	
	navigation.backToOrNavigate(navigationRule);
};

AlopexController.prototype.dismissLoadImage = function() {
	console.log("[AlopexController/dismissLoadImage]");
	notSupported("AlopexController.dismissLoadImage");
};

AlopexController.prototype.exit = function() {
	console.log("[AlopexController/exit]");
	deprecated("alopexController.exit", "navigation.exit");
	
	navigation.exit(navigationRule);
};

AlopexController.prototype.goHome = function() {
	console.log("[AlopexController/goHome]");
	deprecated("alopexController.goHome", "navigation.goHome");
	
	navigation.goHome();
};

AlopexController.prototype.navigate = function(navRule) {
	console.log("[AlopexController/navigate]");
	deprecated("alopexController.navigate", "navigation.navigate");
	
	navigation.navigate(navRule);
};

AlopexController.prototype.setCustomizedBack = function(callback) {
	console.log("[AlopexController/setCustomizedBack]");
	notSupported("AlopexController.setCustomizedBack");
};

AlopexController.prototype.setOnPause = function(callback) {
	console.log("[AlopexController/setOnPause]");
	notSupported("AlopexController.setOnPause");
};

AlopexController.prototype.setOnResume = function(callback) {
	console.log("[AlopexController/setOnResume]");
	notSupported("AlopexController.setOnResume");
};

AlopexController.prototype.setOnScreenTouch = function(callback) {
	console.log("[AlopexController/setOnScreenTouch]");
	notSupported("AlopexController.setOnResume");
};

AlopexController.prototype.start = function(initHandler) {
	console.log("[AlopexController/start] :" + initHandler);
	deprecated("alopexController.start", "alopexready event");
	
	if(isValid(initHandler)) {
		if(typeof (initHandler) == "function")
			initHandler();
		else if(typeof (initHandler) == "string")
			eval(initHandler + "();");
	}
};

var alopexController = new AlopexController();

function Application() {
	this.appId = "Simulator Application";
	this.appVersion = "Simulator Application appVersion";
	this.contentVersion = "Simulator Application contentVersion";
}

Application.prototype.getVersion = function(identifier) {
	console.log("[Application/getVersion]");
	notSupported("Application.getVersion");
	
	if(isValid(identifier))
		return null;
};

Application.prototype.hasApp = function(identifier, callback) {
	console.log("[Application/hasApp]");
	notSupported("Application.getVersion");
	
	if(isValid(identifier) && isValid(callback)) {
		if(typeof (callback) == "function")
			callback(false);
		else if(typeof (callback) == "string")
			eval(callback)(false);
	}
};

Application.prototype.installApplication = function(filePath) {
	console.log("[Application/installApplication]");
	notSupported("Application.installApplication");
	
	isValid(filePath);
};

Application.prototype.startApplication = function(identifier, parameters) {
	console.log("[Application/installApplication]");
	notSupported("Application.installApplication");
	
	isValid(identifier);
	isValid(parameters);
};

Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
	console.log("[Application/startAlopexApplication]");
	notSupported("Application.startAlopexApplication");
	
	isValid(identifier);
	isValid(pageId);
	isValid(parameters);
};

Application.prototype.startWebBrowser = function(url) {
	console.log("[Application/startWebBrowser]");
	if(isValid(url)) {
		window.location = url;
	}
};

var application = new Application();

function Contact() {
}

Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	console.log("[Contact/add]");
	notSupported("Contact.add");
	
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Contact.add is not supported on Simulator.");
};

Contact.prototype.get = function(contactId, successCallback, errorCallback) {
	console.log("[Contact/get]");
	notSupported("Contact.get");
	
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Contact.get is not supported on Simulator.");
};

Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	console.log("[Contact/remove]");
	notSupported("Contact.remove");
	
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Contact.remove is not supported on Simulator.");
};

Contact.prototype.search = function(filter, successCallback, errorCallback) {
	console.log("[Contact/search]");
	notSupported("Contact.search");
	
	if(isValid(option) && option != "") {
		if(isValid(successCallback) && isValid(errorCallback)) {
			errorCallback("Contact.search is not supported on Simulator.");
		}
	} else {
		if(isValid(successCallback) && isValid(errorCallback)) {
			errorCallback("Contact.search is not supported on Simulator.");
		}
	}
};

Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	console.log("[Contact/update]");
	notSupported("Contact.update");
	
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Contact.search is not supported on Simulator.");
};

var contact = new Contact();

function Database() {
}

Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	if(isValid(databaseName) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Database.commit is not supported on Simulator.");
};

Database.prototype.deleteRow = function(query) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	isValid(query);
};

Database.prototype.execQuery = function(query) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	isValid(query);
};

Database.prototype.insert = function(query) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	isValid(query);
};

Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("Database.select is not supported on Simulator.");
};

Database.prototype.update = function(query) {
	console.log("[Database/commit]");
	notSupported("Database.commit");
	
	isValid(query);
};

var database = new Database();

function Device() {
	this.isTablet = false;
	this.isTV = false;
	this.platformName = "Simulator";
	this.platform = "Simulator";
	this.deviceId = "ALOPEXSIMULATOR";
	this.osName = "Simulator OS";
	this.osVersion = "-1";
	this.deviceModel = "ALOPEXSIMULATOR";
	this.deviceManufacturer = "SK C&C";
	this.mobileEquipmentId = "ALOPEXSIMULATOR";
}

Device.prototype.getDeviceDpi = function() {
	console.log("[Device/getDeviceDpi]");
	notSupported("Device.getDeviceDpi");
	
	return null;
};

Device.prototype.getLanguage = function(callback) {
	console.log("[Device/getLanguage]");
	
	if(isValid(callback)) {
		var language = "en";
		if(navigator.language) {
			language = navigator.language;
		} else if(navigator.browserLanguage) {
			language = navigator.browserLanguage;
		} else if(navigator.systemLanguage) {
			language = navigator.systemLanguage;
		} else if(navigator.userLanguage) {
			language = navigator.userLanguage;
		}
		callback(language);
	}
};

Device.prototype.getNetworkType = function(callback) {
	console.log("[Device/getNetworkType]");
	notSupported("Device.getNetworkType");
	
	if(isValid(callback)) {
		callback("wifi");
	}
};

var device = new Device();

function File() {
}

File.prototype.copy = function(from, to, callback) {
	console.log("[File/copy]");
	notSupported("File.copy");
	
	if(isValid(from) && isValid(to) && isValid(callback))
		callback(false);
};

File.prototype.createNewFile = function(path, callback) {
	console.log("[File/createNewFile]");
	notSupported("File.createNewFile");
	
	if(isValid(path) && isValid(callback))
		callback(false);
};

File.prototype.deleteFile = function(from, callback) {
	console.log("[File/deleteFile]");
	notSupported("File.deleteFile");
	
	if(isValid(from) && isValid(callback))
		callback(false);
};

File.prototype.exists = function(path, callback) {
	console.log("[File/exists]");
	notSupported("File.exists");
	
	if(isValid(path) && isValid(callback))
		callback(false);
};

File.prototype.getStoragePath = function(callback, onPrivate) {
	console.log("[File/getStoragePath]");
	notSupported("File.getStoragePath");
	
	if(isValid(onPrivate) && isValid(callback))
		callback(false);
};

File.prototype.isDirectory = function(path, callback) {
	console.log("[File/isDirectory]");
	notSupported("File.isDirectory");
	
	if(isValid(path) && isValid(callback))
		callback(false);
};

File.prototype.mkdirs = function(path, callback) {
	console.log("[File/mkdirs]");
	notSupported("File.mkdirs");
	
	if(isValid(path) && isValid(callback))
		callback(false);
};

File.prototype.move = function(from, to, callback) {
	console.log("[File/move]");
	notSupported("File.move");
	
	if(isValid(from) && isValid(to) && isValid(callback))
		callback(false);
};

File.prototype.rename = function(path, name, callback) {
	console.log("[File/rename]");
	notSupported("File.rename");
	
	if(isValid(path) && isValid(name) && isValid(callback))
		callback(false);
};

var file = new File();

function Geolocation() {
	this.geolocationError = {};
	this.geolocationError.NETWORK_UNAVAILABLE = 998;
	this.geolocationError.DEVICE_NOT_SUPPORTED = 999;
	this.successCallback;
	this.errorCallback;
}

Geolocation.prototype.getLocation = function(successCallback, errorCallback) {
	console.log("[Geolocation/getLocation]");
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

function GlobalPreference() {
}

GlobalPreference.prototype.contains = function(key) {
	console.log("[GlobalPreference/contains]");
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var keyArray = keys.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "gp-" + key) {
					console.log("[GlobalPreference/contains] TRUE");
					return true;
				}
			}
		}
		console.log("[GlobalPreference/contains] FALSE");
		return false;
	}
};

GlobalPreference.prototype.get = function(key) {
	console.log("[GlobalPreference/get]");
	
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "gp-" + key) {
					console.log("[GlobalPreference/get] " + valueArray[i]);
					return valueArray[i];
				}
			}
		}
		console.log("[GlobalPreference/get] No Return Value");
		return "undefined";
	} else {
		console.log("[GlobalPreference/get] No Return Value");
		return "undefined";
	}
};

GlobalPreference.prototype.put = function(key, value) {
	console.log("[GlobalPreference/put]");
	if(isValid(key) && isValid(value)) {
		console.log("vv Key vv");
		console.log(key);
		console.log("vv Value vv");
		console.log(value);
		
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "gp-" + key) {
					valueArray[i] = value;
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
			keyArray.push("gp-" + key);
			valueArray.push(value);
			
			window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
		} else {
			window.parent.name = "gp-" + key + "ù" + value;
		}
	}
};

GlobalPreference.prototype.remove = function(key) {
	console.log("[GlobalPreference/remove]");
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		
		var keys = window.parent.name.split("ù")[0];
		var values = window.parent.name.split("ù")[1];
		
		if(keys != null && values != null) {
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "gp-" + key) {
					keyArray.splice(i, 1);
					valueArray.splice(i, 1);
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
		}
	}
};

var globalPreference = new GlobalPreference();

var httpObjects = new Array();

function Http() {
	this.errorCode = -1;
	this.errorMessage = null;
	this.response = null;
	this.responseHeader = null;
	httpObjects.push(this);
	this.index = httpObjects.length - 1;
	this.httpRequestKeys = [];
	this.httpRequestValues = [];
	this.httpObject;
}

Http.prototype.cancelDownload = function() {
	console.log("[Http/cancelDownload]");
	if(this.httpObject != null)
		this.httpObject.abort();
};

Http.prototype.cancelRequest = function() {
	console.log("[Http/cancelRequest]");
	if(this.httpObject != null)
		this.httpObject.abort();
};

Http.prototype.cancelUpload = function() {
	console.log("[Http/cancelUpload]");
	if(this.httpObject != null)
		this.httpObject.abort();
};

Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	console.log("[Http/download] *not supported on simulator");
};

Http.prototype.getResponseHeader = function(header) {
	console.log("[Http/getResponseHeader]");
	if(this.httpObject != null) {
		return this.httpObject.getResponseHeader(header);
	} else {
		return null;
	}
};

Http.prototype.request = function(entity, successCallback, errorCallback) {
	console.log("[Http/request]");
	
	if(isValid(entity) && isValid(successCallback) || isValid(errorCallback)) {
		entity.index = this.index;
		var http = {};
		var paramString = "";
		
		if(entity["parameters"] != null) {
			paramString = "?";
			for( var j in entity["parameters"])
				paramString = paramString + "&" + j + "=" + entity["parameters"][j];
			paramString = paramString.substring(0, 1) + paramString.substring(2);
		}
		
		console.log("[Http/request] Method: " + entity["method"] + "/ URL: " + entity["url"]);
		
		this.httpObject = new XMLHttpRequest();
		
		this.httpObject.onreadystatechange = function() {
			if(this.readyState == 4) {
				if(this.status == 200) {
					console.log("[Http/request] Success!");
					http.response = this.responseText;
					successCallback(http);
				} else if(this.status != 0) {
					console.log("[Http/request] Error: " + this.status + ": " + this.statusText);
					http.error = this.status;
					http.errorMessage = this.statusText;
					errorCallback(http);
				}
			}
		};
		
		if(entity["method"].toLowerCase() == "get") {
			this.httpObject.open(entity["method"], entity["url"] + paramString, true);
		} else {
			this.httpObject.open(entity["method"], entity["url"], true);
		}
		
		for( var i = 0; i < this.httpRequestKeys.length; i++) {
			this.httpObject.setRequestHeader(this.httpRequestKeys[i], this.httpRequestValues[i]);
		}
		
		try {
			if(entity["method"].toLowerCase() == "post") {
				if(entity["onBody"]) {
					console.log("[Http/request] Content: " + entity["content"]);
					this.httpObject.send(entity["content"]);
				} else {
					console.log("[Http/request] Method: " + entity["parameters"]);
					this.httpObject.send(paramString);
				}
			} else {
				this.httpObject.send();
			}
		} catch(e) {
			var result = {};
			result.errorCode = e.code;
			result.errorMessage = e.message;
			
			errorCallback(result);
			
			return;
		}
		
		this.httpRequestKeys = [];
		this.httpRequestValues = [];
	}
};

Http.prototype.setRequestHeader = function(header, value) {
	console.log("[Http/setRequestHeader] " + "Header: " + header + " / Value: " + value);
	if(isValid(header) && isValid(value)) {
		this.httpRequestKeys.push(header);
		this.httpRequestValues.push(value);
	}
};

Http.prototype.setTimeout = function(timeout) {
	console.log("[Http/setTimeout] *not supported on simulator");
};

Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	console.log("[Http/upload] *not supported on simulator");
};

function LocalNotification() {
}

LocalNotification.prototype.addNotification = function(id, time, action) {
	console.log("[LocalNotification/addNotification]");
	notSupported("LocalNotification.addNotification");
	
	isValid(id);
	isValid(time);
	isValid(action);
};

LocalNotification.prototype.getUnreadNotifications = function(callback) {
	console.log("[LocalNotification/getUnreadNotifications]");
	notSupported("LocalNotification.getUnreadNotifications");
	
	if(isValid(callback))
		callback([]);
};

LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	console.log("[LocalNotification/deleteAllUnreadNotifications]");
	notSupported("LocalNotification.deleteAllUnreadNotifications");
};

LocalNotification.prototype.deleteUnreadNotification = function(index) {
	console.log("[LocalNotification/deleteUnreadNotification]");
	notSupported("LocalNotification.deleteUnreadNotification");
	
	isValid(index);
};

LocalNotification.prototype.removeNotification = function(id) {
	console.log("[LocalNotification/removeNotification]");
	notSupported("LocalNotification.removeNotification");
	
	isValid(id);
};

LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
	console.log("[LocalNotification/useImmediateForegroundNotification]");
	notSupported("LocalNotification.useImmediateForegroundNotification");
	
	isValid(use);
};

var localNotification = new LocalNotification();

function Log() {
}

Log.prototype.error = function(message) {
	if(isValid(message))
		console.log("[Log/error] " + message);
};

Log.prototype.log = function(message) {
	if(isValid(message))
		console.log("[Log/log] " + message);
};

Log.prototype.warn = function(message) {
	if(isValid(message))
		console.log("[Log/warn] " + message);
};

var log = new Log();

function MemoryPreference() {
}

MemoryPreference.prototype.contains = function(key) {
	console.log("[MemoryPreference/contains]");
	
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var keyArray = keys.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "mp-" + key) {
					return true;
				}
			}
		}
		return false;
	}
};

MemoryPreference.prototype.get = function(key) {
	console.log("[MemoryPreference/get]");
	
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "mp-" + key) {
					console.log("[MemoryPreference/get] " + valueArray[i]);
					return valueArray[i];
				}
			}
		}
		console.log("[MemoryPreference/get] No Return Value");
		return "undefined";
	} else {
		console.log("[MemoryPreference/get] No Return Value");
		return "undefined";
	}
};

MemoryPreference.prototype.put = function(key, value) {
	console.log("[MemoryPreference/put]");
	if(isValid(key) && isValid(value)) {
		console.log("vv Key vv");
		console.log(key);
		console.log("vv Value vv");
		console.log(value);
		
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "mp-" + key) {
					valueArray[i] = value;
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
			keyArray.push("mp-" + key);
			valueArray.push(value);
			
			window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
		} else {
			window.parent.name = "mp-" + key + "ù" + value;
		}
	}
};

MemoryPreference.prototype.remove = function(key) {
	console.log("[MemoryPreference/remove]");
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		
		var keys = window.parent.name.split("ù")[0];
		var values = window.parent.name.split("ù")[1];
		
		if(keys != null && values != null) {
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "mp-" + key) {
					keyArray.splice(i, 1);
					valueArray.splice(i, 1);
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
		}
	}
};

MemoryPreference.prototype.removeAll = function() {
	console.log("[MemoryPreference/removeAll]");
	
	var keys = window.parent.name.split("ù")[0];
	var values = window.parent.name.split("ù")[1];
	
	if(keys != null && values != null) {
		var keyArray = keys.split("♠");
		var valueArray = values.split("♠");
		
		var len = keyArray.length;
		for( var i = 0; i < len; i++) {
			if(keyArray[i] != null) {
				if(keyArray[i].substring(0, 3) == "mp-") {
					keyArray.splice(i, 1);
					valueArray.splice(i, 1);
					i--;
					len--;
				}
			}
		}
		window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	}
};

var memoryPreference = new MemoryPreference();

function Multimedia() {
}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	console.log("[Multimedia/deleteImage]");
	notSupported("Multimedia.deleteImage");
	
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("error");
};

Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	console.log("[Multimedia/getImageOrientation]");
	notSupported("Multimedia.getImageOrientation");
	
	if(isValid(imagePath) && isValid(callback)) {
		if(typeof (callback) == "function")
			callback("error");
		else if(typeof (callback) == "string")
			eval(callback)("error");
	}
};

Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	console.log("[Multimedia/getPicture]");
	notSupported("Multimedia.getPicture");
	
	if(isValid(successCallback) && isValid(errorCallback))
		errorCallback("error");
};

Multimedia.prototype.resizePicture = function(imageInfo, callback) {
	console.log("[Multimedia/resizePicture]");
	notSupported("Multimedia.resizePicture");
	
	if(isValid(pictureInfo) && isValid(callback))
		errorCallback("error");
};

Multimedia.prototype.rotateImage = function(imageInfo, callback) {
	console.log("[Multimedia/rotateImage]");
	notSupported("Multimedia.rotateImage");
	
	if(isValid(imageInfo) && isValid(callback))
		errorCallback("error");
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	console.log("[Multimedia/saveImage]");
	notSupported("Multimedia.saveImage");
	
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		errorCallback("error");
};

Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	console.log("[Multimedia/takePicture]");
	notSupported("Multimedia.takePicture");
	
	if(isValid(successCallback) && isValid(errorCallback))
		errorCallback("error");
};

var multimedia = new Multimedia();

function NativeUI() {
}

NativeUI.prototype.dismissProgressBarDialog = function() {
	console.log("[NativeUI/dismissProgressBarDialog]");
	deprecated("NativeUI.dismissProgressBarDialog", "platformUIComponent.dismissProgressBarDialog");
	
	platformUIComponent.dismissProgressBarDialog();
};

NativeUI.prototype.dismissProgressDialog = function() {
	console.log("[NativeUI/dismissProgressDialog]");
	deprecated("NativeUI.dismissProgressDialog", "platformUIComponent.dismissProgressDialog");
	
	platformUIComponent.dismissProgressDialog();
};

NativeUI.prototype.dismissSoftKeyboard = function(callback) {
	console.log("[NativeUI/dismissSoftKeyboard]");
	notSupported("NativeUI.dismissSoftKeyboard");
	deprecated("NativeUI.dismissSoftKeyboard", "platformUIComponent.dismissSoftKeyboard");
};

NativeUI.prototype.isKeyboardShowing = function(callback) {
	console.log("[NativeUI/isKeyboardShowing]");
	notSupported("NativeUI.isKeyboardShowing");
	deprecated("NativeUI.isKeyboardShowing", "platformUIComponent.isKeyboardShowing");
};

NativeUI.prototype.setOptionMenu = function(menuItems) {
	console.log("[NativeUI/setOptionMenu]");
	notSupported("NativeUI.setOptionMenu");
	deprecated("NativeUI.setOptionMenu", "platformUIComponent.setOptionMenu");
};

NativeUI.prototype.setProgress = function(progress) {
	platformUIComponent.setProgress(progress);
};

NativeUI.prototype.showContextMenu = function(menuItems, option) {
	console.log("[NativeUI/showContextMenu]");
	deprecated("NativeUI.showContextMenu", "platformUIComponent.showContextMenu");
	
	platformUIComponent.showContextMenu(menuItems, option);
};

NativeUI.prototype.showDatePicker = function(callback, option) {
	console.log("[NativeUI/showDatePicker]");
	deprecated("NativeUI.showDatePicker", "platformUIComponent.showDatePicker");
	
	platformUIComponent.showDatePicker(callback, option);
};

NativeUI.prototype.showDatePickerWithData = function(date, callback, option) {
	console.log("[NativeUI/showDatePickerWithData]");
	deprecated("NativeUI.showDatePickerWithData", "platformUIComponent.showDatePickerWithData");
	
	platformUIComponent.showDatePickerWithData(date, callback, option);
};

NativeUI.prototype.showMultiSelect = function(selection) {
	console.log("[NativeUI/showMultiSelect]");
	deprecated("NativeUI.showMultiSelect", "platformUIComponent.showMultiSelect");
	
	platformUIComponent.showMultiSelect(selection);
};

NativeUI.prototype.showProgressBarDialog = function(option) {
	console.log("[NativeUI/showProgressBarDialog]");
	deprecated("NativeUI.showProgressBarDialog", "platformUIComponent.showProgressBarDialog");
	
	platformUIComponent.showProgressBarDialog(option);
};

NativeUI.prototype.showProgressDialog = function(option) {
	console.log("[NativeUI/showProgressDialog]");
	deprecated("NativeUI.showProgressDialog", "platformUIComponent.showProgressDialog");
	
	platformUIComponent.showProgressDialog(option);
};

NativeUI.prototype.showSingleSelect = function(selection) {
	console.log("[NativeUI/showSingleSelect]");
	deprecated("NativeUI.showSingleSelect", "platformUIComponent.showSingleSelect");
	
	platformUIComponent.showSingleSelect(selection);
};

NativeUI.prototype.showTimePicker = function(callback, option) {
	console.log("[NativeUI/showTimePicker]");
	deprecated("NativeUI.showTimePicker", "platformUIComponent.showTimePicker");
	
	platformUIComponent.showTimePicker(callback, option);
};

NativeUI.prototype.showTimePickerWithData = function(time, callback, option) {
	console.log("[NativeUI/showTimePickerWithData]");
	deprecated("NativeUI.showTimePickerWithData", "platformUIComponent.showTimePickerWithData");
	
	platformUIComponent.showTimePickerWithData(time, callback, option);
};

var nativeUI = new NativeUI();

function Phone() {
}

Phone.prototype.call = function(number) {
	console.log("[Phone/call]");
	notSupported("Phone.call");
	
	isValid(number);
};

Phone.prototype.sendEmail = function(mail) {
	console.log("[Phone/sendEmail]");
	if(isValid(mail)) {
		
		console.log("vv Mail vv");
		console.log(mail);
		
		var toList = "";
		var ccList = "";
		var bccList = "";
		
		for( var i = 0; i < mail["to"].length; i++)
			toList = toList + mail["to"][i] + ",";
		toList = toList.substring(0, toList.length - 1);
		
		for( var i = 0; i < mail["cc"].length; i++)
			ccList = ccList + mail["cc"][i] + ",";
		ccList = ccList.substring(0, ccList.length - 1);
		
		for( var i = 0; i < mail["bcc"].length; i++)
			bccList = bccList + mail["bcc"][i] + ",";
		bccList = bccList.substring(0, bccList.length - 1);
		
		var link = "mailto:" + toList + "?cc= " + ccList + "&subject=" + escape(mail["title"]) + "&body=" + escape(mail["body"]);
		
		window.location.href = link;
	}
};

Phone.prototype.sendSMS = function(sms) {
	console.log("[Phone/sendSMS]");
	notSupported("Phone.sendSMS");
	
	isValid(sms);
};

var phone = new Phone();

function Preference() {
}

Preference.prototype.contains = function(key) {
	console.log("[Preference/contains]");
	
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var keyArray = keys.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "pp-" + key) {
					return true;
				}
			}
		}
		return false;
	}
};

Preference.prototype.get = function(key) {
	console.log("[Preference/get]");
	
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "pp-" + key) {
					console.log("[Preference/get] " + valueArray[i]);
					return valueArray[i];
				}
			}
		}
		console.log("[Preference/get] No Return Value");
		return "undefined";
	} else {
		console.log("[Preference/get] No Return Value");
		return "undefined";
	}
};

Preference.prototype.put = function(key, value) {
	console.log("[Preference/put]");
	if(isValid(key) && isValid(value)) {
		console.log("vv Key vv");
		console.log(key);
		console.log("vv Value vv");
		console.log(value);
		
		if(window.parent.name.indexOf("ù") != -1) {
			var keys = window.parent.name.split("ù")[0];
			var values = window.parent.name.split("ù")[1];
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "pp-" + key) {
					valueArray[i] = value;
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
			keyArray.push("pp-" + key);
			valueArray.push(value);
			
			window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
		} else {
			window.parent.name = "pp-" + key + "ù" + value;
		}
	}
};

Preference.prototype.remove = function(key) {
	console.log("[Preference/remove]");
	if(isValid(key)) {
		console.log("vv Key vv");
		console.log(key);
		
		var keys = window.parent.name.split("ù")[0];
		var values = window.parent.name.split("ù")[1];
		
		if(keys != null && values != null) {
			var keyArray = keys.split("♠");
			var valueArray = values.split("♠");
			
			for( var i = 0; i < keyArray.length; i++) {
				if(keyArray[i] == "pp-" + key) {
					keyArray.splice(i, 1);
					valueArray.splice(i, 1);
					window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
					return;
				}
			}
		}
	}
};

Preference.prototype.removeAll = function() {
	console.log("[Preference/removeAll]");
	
	var keys = window.parent.name.split("ù")[0];
	var values = window.parent.name.split("ù")[1];
	
	if(keys != null && values != null) {
		var keyArray = keys.split("♠");
		var valueArray = values.split("♠");
		
		var len = keyArray.length;
		for( var i = 0; i < len; i++) {
			if(keyArray[i] != null) {
				if(keyArray[i].substring(0, 3) == "pp-") {
					keyArray.splice(i, 1);
					valueArray.splice(i, 1);
					i--;
					len--;
				}
			}
		}
		window.parent.name = keyArray.join("♠") + "ù" + valueArray.join("♠");
	}
};

var preference = new Preference();

function PushNotification() {
}

PushNotification.prototype.deleteAllUnreadNotifications = function() {
	console.log("[PushNotification/deleteAllUnreadNotifications]");
	notSupported("PushNotification.deleteAllUnreadNotifications");
};

PushNotification.prototype.deleteUnreadNotification = function(index) {
	console.log("[PushNotification/deleteUnreadNotification]");
	notSupported("PushNotification.deleteUnreadNotification");
	
	isValid(index);
};

PushNotification.prototype.getRegistrationId = function(callback) {
	console.log("[PushNotification/getRegistrationId]");
	notSupported("PushNotification.getRegistrationId");
	
	if(isValid(callback))
		callback(null);
};

PushNotification.prototype.getUnreadNotifications = function(callback) {
	console.log("[PushNotification/getUnreadNotifications]");
	notSupported("PushNotification.getUnreadNotifications");
	
	if(isValid(callback))
		callback(null);
};

PushNotification.prototype.register = function(senderID) {
	console.log("[PushNotification/register]");
	notSupported("PushNotification.register");
	
	isValid(senderId);
};

PushNotification.prototype.unregister = function() {
	console.log("[PushNotification/unregister]");
	notSupported("PushNotification.unregister");
};

PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	console.log("[PushNotification/useImmediateForegroundNotification]");
	notSupported("PushNotification.useImmediateForegroundNotification");
	
	isValid(use);
};

var pushNotification = new PushNotification();

function Navigation() {
	this.parameters = null;
	this.results = null;
	this.pageId = null;
	
	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for( var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable) {
				return pair[1];
			}
		}
	}
	
	if(getQueryVariable("parameters") != undefined) {
		this.parameters = JSON.parse(decodeURI(getQueryVariable("parameters")));
	}
	
	if(window.sessionStorage.resuls != undefined && window.sessionStorage.resuls != null) {
		this.results = JSON.parse(window.sessionStorage.resuls);
		window.sessionStorage.resuls = null;
	}
	
	this.pageId = alopexConfigManager.getPageByUrl(window.location.href.replace(window.location.search, "")).id;
	
	console.log(this.pageId);
	
	alopexController.parameters = this.parameters;
	alopexController.results = this.results;
	alopexController.pageId = this.pageId;
}

Navigation.prototype.back = function(results) {
	console.log("[Navigation/back]");
	
	window.sessionStorage.backFlag = true;
	
	if(results != null && typeof results != "undefined") {
		window.sessionStorage.resuls = JSON.stringify(results);
	}
	
	history.back();
};

Navigation.prototype.backTo = function(navigationRule) {
	console.log("[Navigation/backTo]");
	
	if(isValid(navigationRule))
		this.navigate(navigationRule);
};

Navigation.prototype.backToOrNavigate = function(navigationRule) {
	console.log("[Navigation/backToOrNavigate]");
	
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
		
		this.navigate(navigationRule);
	}
};

Navigation.prototype.exit = function() {
	console.log("[Navigation/exit]");
	window.open('', '_self', '');
	window.close();
};

Navigation.prototype.goHome = function() {
	console.log("[Navigation/goHome]");
	window.history.go((history.length - 1) * -1);
};

Navigation.prototype.navigate = function(navigationRule) {
	console.log("[Navigation/navigate]");
	
	if(isValid(navigationRule)) {
		if(typeof (navigationRule) == "string") {
			var pageInfo = {};
			pageInfo.pageId = navigationRule;
			navigationRule = pageInfo;
		}
		
		if(navigationRule.pageId == undefined) {
			log.error("Page id is not defined in the navigation rule JSON object.");
			return;
		}
		
		if(navigationRule["parameters"] != null) {
			window.location.href = alopexConfigManager.getPageById(navigationRule.pageId).uri + "?parameters=" + JSON.stringify(navigationRule["parameters"]);
		} else {
			window.location.href = alopexConfigManager.getPageById(navigationRule.pageId).uri;
		}
	}
};

var navigation = new Navigation();

function PlatformUIComponent() {
	this.progressBarDialog = null;
	this.progressElement = null;
	this.interval = null;
	
	this.datePicker = null;
	this.timePicker = null;
	this.contextMenu = null;
	this.selectDialog = null;
}

PlatformUIComponent.prototype.dismissProgressBarDialog = function() {
	console.log("[PlatformUIComponent/dismissProgressBarDialog]");
	
	if(this.progressBarDialog != null) {
		document.body.removeChild(this.progressBarDialog);
		this.progressBarDialog = null;
	}
};

PlatformUIComponent.prototype.dismissProgressDialog = function() {
	console.log("[PlatformUIComponent/dismissProgressDialog]");
	
	if(this.progressBarDialog != null) {
		platformUIComponent.dismissProgressBarDialog();
		this.progressBarDialog = null;
		clearInterval(this.interval);
		this.interval = null;
	}
};

PlatformUIComponent.prototype.dismissSoftKeyboard = function(callback) {
	console.log("[PlatformUIComponent/dismissSoftKeyboard]");
	notSupported("PlatformUIComponent.dismissSoftKeyboard");
	
	if(isValid(callback))
		callback();
};

PlatformUIComponent.prototype.isKeyboardShowing = function(callback) {
	console.log("[PlatformUIComponent/isKeyboardShowing]");
	notSupported("PlatformUIComponent.isKeyboardShowing");
	
	if(isValid(callback))
		callback(true);
};

PlatformUIComponent.prototype.setOptionMenu = function(menuItems) {
	console.log("[PlatformUIComponent/setOptionMenu]");
	notSupported("PlatformUIComponent.setOptionMenu");
	
	isValid(menuItems);
};

PlatformUIComponent.prototype.setProgress = function(progress) {
	if(isValid(progress)) {
		if(progress >= 0 && progress <= 100) {
			if(this.progressBarDialog != null)
				this.progressElement.value = progress;
		}
	}
};

PlatformUIComponent.prototype.showContextMenu = function(menuItems, option) {
	console.log("[PlatformUIComponent/showContextMenu]");
	
	if(!isValid(menuItems))
		return;
	
	this.contextMenu = document.createElement("div");
	var wrapper = document.createElement("div");
	var dataWrapper = document.createElement("div");
	var title = document.createElement("div");
	var span = document.createElement('span');
	
	this.contextMenu.setAttribute("style", "z-index:999;position:absolute; width:100%; height:100%; background: rgba(180, 180, 180, .3);");
	wrapper.setAttribute("style", "height:212px;width:250px;position:absolute;top:50%;left:50%;margin-top:-105px;margin-left:-125px;border:1px solid black; background:#e6e6fa");
	title.setAttribute("style", "padding-left:10px; padding-top: 5px; width:240px; height:38px; border-bottom: 1px solid black;");
	span.setAttribute("style", "font-size:20px;");
	dataWrapper.setAttribute("style", "width:100%; height:167px; overflow:scroll; overflow-x:hidden; overflow-x:hidden;");
	
	span.appendChild(document.createTextNode("ContextMenu"));
	title.appendChild(span);
	wrapper.appendChild(title);
	
	var data = null;
	
	for( var i = 0; i < menuItems.items.length; i++) {
		for( var name in menuItems.items[i]) {
			data = document.createElement("div");
			data.setAttribute("style", "height:35px;width:100%;background:#ffffff;text-align:center;");
			
			if(i % 2 == 0)
				data.style.background = "#fffff0";
			
			data.name = menuItems.items[i][name];
			data.appendChild(document.createTextNode(name));
			dataWrapper.appendChild(data);
			
			data.addEventListener("click", alopexContextMenuHandler, false);
		}
	}
	
	wrapper.appendChild(dataWrapper);
	this.contextMenu.appendChild(wrapper);
	document.body.appendChild(this.contextMenu);
	
	function alopexContextMenuHandler(e) {
		document.body.removeChild(platformUIComponent.contextMenu);
		eval(e.currentTarget.name + "();");
		
		platformUIComponent.contextMenu = null;
	}
};

PlatformUIComponent.prototype.showDatePicker = function(callback, option) {
	console.log("[PlatformUIComponent/showDatePicker]");
	
	if(isValid(callback)) {
		var date = new Date();
		var currentDate = {};
		currentDate.year = date.getFullYear();
		currentDate.month = date.getMonth();
		currentDate.day = date.getDate();
		
		platformUIComponent.showDatePickerWithData(currentDate, callback, option);
	}
};

PlatformUIComponent.prototype.showDatePickerWithData = function(date, callback, option) {
	console.log("[PlatformUIComponent/showDatePickerWithData]");
	
	if(isValid(date) && isValid(callback) && this.datePicker == null) {
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
		
		this.datePicker = document.createElement("div");
		var wrapper = document.createElement("div");
		var title = document.createElement("div");
		var inputYear = document.createElement("input");
		var monthInput = document.createElement("input");
		var inputDay = document.createElement("input");
		var buttonOk = document.createElement("button");
		var buttonCancel = document.createElement("button");
		var span = document.createElement('span');
		
		this.datePicker.setAttribute("style", "z-index:12;position:absolute; width:100%; height:100%; background: rgba(180, 180, 180, .3);");
		wrapper.setAttribute("style", "padding: 5px 5px 5px 5px; height:110px;width:220px;position:absolute;top:50%;left:50%;margin-top:-55px;margin-left:-110px;border:1px solid black; background:#e6e6fa");
		title.setAttribute("style", "width:100%;margin-bottom:10px");
		inputYear.setAttribute("style", "text-align:right;width:45px;margin : 0px 0px 5px 0px");
		monthInput.setAttribute("style", "text-align:right;width:45px;margin : 0px 0px 5px 5px");
		inputDay.setAttribute("style", "text-align:right;width:45px;margin : 0px 0px 5px 5px");
		span.setAttribute("style", "font-size:20px;");
		
		buttonOk.setAttribute("style", "margin:10px 0px 0px 0px; width:100px; height:30px;");
		buttonCancel.setAttribute("style", "margin:10px 0px 0px 15px; width:100px; height:30px;");
		
		inputYear.id = "inputYear";
		inputYear.value = date.year;
		monthInput.id = "inputMonth";
		monthInput.value = date.month;
		inputDay.id = "inputDay";
		inputDay.value = date.day;
		buttonOk.id = "buttonOk";
		buttonCancel.id = "buttonCancel";
		
		span.appendChild(document.createTextNode("DatePicker"));
		title.appendChild(span);
		wrapper.appendChild(title);
		wrapper.appendChild(inputYear);
		wrapper.appendChild(document.createTextNode("년"));
		wrapper.appendChild(monthInput);
		wrapper.appendChild(document.createTextNode("월"));
		wrapper.appendChild(inputDay);
		wrapper.appendChild(document.createTextNode("일"));
		buttonOk.appendChild(document.createTextNode("OK"));
		wrapper.appendChild(buttonOk);
		buttonCancel.appendChild(document.createTextNode("Cancel"));
		wrapper.appendChild(buttonCancel);
		this.datePicker.appendChild(wrapper);
		document.body.appendChild(this.datePicker);
		
		buttonOk.addEventListener("click", function() {
			var date = {};
			date.year = document.getElementById("inputYear").value;
			date.month = document.getElementById("inputMonth").value;
			date.day = document.getElementById("inputDay").value;
			
			document.body.removeChild(platformUIComponent.datePicker);
			callback(date);
			
			platformUIComponent.datePicker = null;
			
		}, false);
		
		buttonCancel.addEventListener("click", function() {
			document.body.removeChild(platformUIComponent.datePicker);
			platformUIComponent.datePicker = null;
		}, false);
	}
};

PlatformUIComponent.prototype.showMultiSelect = function(selection) {
	console.log("[NativeUI/showMultiSelect]");
	
	if(isValid(selection))
		platformUIComponent.showSelectDialog(selection, "MutiSelect");
};

PlatformUIComponent.prototype.showSelectDialog = function(selection, type) {
	this.selectDialog = document.createElement("div");
	var wrapper = document.createElement("div");
	var title = document.createElement("div");
	var dataWrapper = document.createElement("form");
	var span = document.createElement('span');
	var buttonOk = document.createElement('button');
	var buttonCancel = document.createElement('button');
	
	this.selectDialog.setAttribute("style", "z-index:12;position:absolute; width:100%; height:100%; background: rgba(180, 180, 180, .3);");
	wrapper.setAttribute("style", "height:260px;width:250px;position:absolute;top:50%;left:50%;margin-top:-105px;margin-left:-125px;border:1px solid black; background:#e6e6fa");
	title.setAttribute("style", "padding-left:10px; padding-top: 5px; width:240px; height:38px; border-bottom: 1px solid black;");
	span.setAttribute("style", "font-size:20px;");
	dataWrapper.setAttribute("style", "width:100%; height:166px; overflow:scroll; overflow-x:hidden;");
	buttonOk.setAttribute("style", "width:100px; height:40px;margin: 5px 0px 0px 16px");
	buttonCancel.setAttribute("style", "width:100px; height:40px;margin: 5px 0px 0px 16px");
	
	dataWrapper.id = "selectDialog";
	buttonOk.name = "buttonOk";
	buttonCancel.name = "buttonCancel";
	
	var data = null;
	var checkBox = null;
	
	for( var i = 0; i < selection.items.length; i++) {
		data = document.createElement("div");
		checkBox = document.createElement("input");
		
		data.setAttribute("style", "height:35px;width:100%;background:#ffffff;text-align:left;padding:5px 0px 0px 10px;");
		checkBox.name = "data";
		
		if(i % 2 == 0)
			data.style.background = "#fffff0";
		
		if(type == "SingleSelect") {
			checkBox.type = "radio";
			
			if(i == selection.defValue)
				checkBox.checked = true;
			
			data.appendChild(checkBox);
			data.appendChild(document.createTextNode(selection.items[i]));
		} else {
			checkBox.type = "checkBox";
			
			for( var name in selection.items[i]) {
				if(selection.items[i][name] == "true")
					checkBox.checked = true;
				
				data.appendChild(checkBox);
				data.appendChild(document.createTextNode(name));
			}
		}
		
		dataWrapper.appendChild(data);
	}
	
	if(type == "SingleSelect") {
		span.appendChild(document.createTextNode(selection.title == undefined ? "SingleSelect" : selection.title));
		buttonCancel.addEventListener("click", alopexSingeSelectCallback, false);
		buttonOk.addEventListener("click", alopexSingeSelectCallback, false);
	} else {
		span.appendChild(document.createTextNode(selection.title == undefined ? "MultiSelect" : selection.title));
		buttonCancel.addEventListener("click", alopexMultiSelectCallback, false);
		buttonOk.addEventListener("click", alopexMultiSelectCallback, false);
	}
	
	title.appendChild(span);
	wrapper.appendChild(title);
	wrapper.appendChild(dataWrapper);
	buttonOk.appendChild(document.createTextNode("OK"));
	wrapper.appendChild(buttonOk);
	buttonCancel.appendChild(document.createTextNode("Cancel"));
	wrapper.appendChild(buttonCancel);
	this.selectDialog.appendChild(wrapper);
	document.body.appendChild(this.selectDialog);
	
	function alopexMultiSelectCallback(e) {
		if(e.currentTarget.name == "buttonOk") {
			var radios = document.forms["selectDialog"]["data"];
			var result = [];
			for( var i = 0; i < radios.length; i++) {
				if(radios[i].checked)
					result.push(true);
				else
					result.push(false);
			}
			
			document.body.removeChild(platformUIComponent.selectDialog);
			eval(selection.callback)(result);
		} else {
			document.body.removeChild(platformUIComponent.selectDialog);
		}
	}
	
	function alopexSingeSelectCallback(e) {
		if(e.currentTarget.name == "buttonOk") {
			var radios = document.forms["selectDialog"]["data"];
			
			for( var i = 0; i < radios.length; i++) {
				if(radios[i].checked) {
					document.body.removeChild(platformUIComponent.selectDialog);
					
					eval(selection.callback + "(" + i + ");");
					
					return;
				}
			}
		} else {
			document.body.removeChild(platformUIComponent.selectDialog);
		}
	}
};

PlatformUIComponent.prototype.showProgressBarDialog = function(option) {
	console.log("[PlatformUIComponent/showProgressBarDialog]");
	
	if(this.progressBarDialog == null) {
		var title = "";
		var cancelable = false;
		var cancelCallback = null;
		
		if(option != null && option != undefined) {
			title = option.message == undefined ? "" : option.message;
			cancelable = option.cancelable == undefined ? "" : option.cancelable;
			cancelCallback = option.cancelCallback == undefined ? "" : option.cancelCallback;
		}
		
		this.progressBarDialog = document.createElement("div");
		this.progressElement = document.createElement("progress");
		var wrapperElement = document.createElement("div");
		var titleElement = document.createTextNode(title);
		
		this.progressBarDialog.setAttribute("style", "z-index:12;position:absolute; width:100%; height:100%; background: rgba(180, 180, 180, .3);");
		this.progressElement.setAttribute("style", "height:20px;width:300px;position:absolute;top:50%;left:50%;border:1px solid black;margin-top:-10px;margin-left:-150px");
		this.progressElement.setAttribute("value", "0");
		this.progressElement.setAttribute("max", "100");
		wrapperElement.setAttribute("style", "height:70px;width:300px;position:absolute;top:50%;left:50%;margin-top:-10px;margin-left:-150px");
		
		wrapperElement.appendChild(titleElement);
		wrapperElement.appendChild(this.progressElement);
		this.progressBarDialog.appendChild(wrapperElement);
		document.body.appendChild(this.progressBarDialog);
		
		this.progressBarDialog.onclick = function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			if(cancelable) {
				eval(cancelCallback)();
				platformUIComponent.dismissProgressBarDialog();
			}
			
		};
	}
};

PlatformUIComponent.prototype.showProgressDialog = function(option) {
	console.log("[PlatformUIComponent/showProgressDialog]");
	
	if(this.progressBarDialog == null) {
		this.showProgressBarDialog(option);
		
		this.interval = setInterval(function() {
			if(platformUIComponent.progressElement.value == 100)
				platformUIComponent.progressElement.value = 0;
			
			platformUIComponent.setProgress(Number(platformUIComponent.progressElement.value) + 2);
		}, 8);
		
		var cancelable = false;
		var cancelCallback = null;
		
		if(option != null && option != undefined) {
			cancelable = option.cancelable == undefined ? "" : option.cancelable;
			cancelCallback = option.cancelCallback == undefined ? "" : option.cancelCallback;
		}
		
		this.progressBarDialog.onclick = function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			if(cancelable) {
				eval(cancelCallback)();
				platformUIComponent.dismissProgressDialog();
			}
			
		};
	}
};

PlatformUIComponent.prototype.showSingleSelect = function(selection) {
	console.log("[PlatformUIComponent/showSingleSelect]");
	
	if(isValid(selection))
		platformUIComponent.showSelectDialog(selection, "SingleSelect");
};

PlatformUIComponent.prototype.showTimePicker = function(callback, option) {
	console.log("[PlatformUIComponent/showTimePicker]");
	
	if(isValid(callback)) {
		var date = new Date();
		var time = {};
		time.ampm = "am";
		time.hour = date.getHours();
		time.minute = date.getMinutes();
		
		if(time.hour > 12) {
			time.ampm = "pm";
			time.hour -= 12;
		}
		
		platformUIComponent.showTimePickerWithData(time, callback, option);
	}
};

PlatformUIComponent.prototype.showTimePickerWithData = function(time, callback, option) {
	console.log("[PlatformUIComponent/showTimePickerWithData]");
	if(isValid(time) && isValid(callback) && this.timePicker == null) {
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
		
		this.timePicker = document.createElement("div");
		var wrapper = document.createElement("div");
		var title = document.createElement("div");
		var selectAmpm = document.createElement("select");
		var optionAm = document.createElement("option");
		var optionPm = document.createElement("option");
		var option24 = document.createElement("option");
		var inputHour = document.createElement("input");
		var inputMin = document.createElement("input");
		var buttonOk = document.createElement("button");
		var buttonCancel = document.createElement("button");
		var span = document.createElement('span');
		
		this.timePicker.setAttribute("style", "z-index:12;position:absolute; width:100%; height:100%; background: rgba(180, 180, 180, .3);");
		wrapper.setAttribute("style", "padding: 5px 5px 5px 5px; height:110px;width:220px;position:absolute;top:50%;left:50%;margin-top:-55px;margin-left:-110px;border:1px solid black; background:#e6e6fa");
		title.setAttribute("style", "width:100%;margin-bottom:10px");
		selectAmpm.setAttribute("style", "text-align:right;width:50px;margin : 0px 10px 5px 10px");
		inputHour.setAttribute("style", "text-align:right;width:45px;margin : 0px 0px 5px 5px");
		inputMin.setAttribute("style", "text-align:right;width:45px;margin : 0px 0px 5px 5px");
		span.setAttribute("style", "font-size:20px;");
		
		buttonOk.setAttribute("style", "margin:10px 0px 0px 0px; width:100px; height:30px;");
		buttonCancel.setAttribute("style", "margin:10px 0px 0px 15px; width:100px; height:30px;");
		
		selectAmpm.id = "inputAmpm";
		inputHour.id = "inputHour";
		inputHour.value = time.hour;
		inputMin.id = "inputMin";
		inputMin.value = time.minute;
		buttonOk.id = "buttonOk";
		buttonCancel.id = "buttonCancel";
		
		if("am" == time.ampm.toLowerCase())
			optionAm.selected = "selected";
		else if("pm" == time.ampm.toLowerCase())
			optionPm.selected = "selected";
		if(option != undefined) {
			if(option.is24HourView) {
				option24.selected = "selected";
				if("pm" == time.ampm)
					inputHour.value = time.hour + 12;
			}
		}
		
		span.appendChild(document.createTextNode("TimePicker"));
		title.appendChild(span);
		optionAm.appendChild(document.createTextNode("am"));
		optionPm.appendChild(document.createTextNode("pm"));
		option24.appendChild(document.createTextNode("24"));
		selectAmpm.appendChild(optionAm);
		selectAmpm.appendChild(optionPm);
		selectAmpm.appendChild(option24);
		wrapper.appendChild(title);
		wrapper.appendChild(selectAmpm);
		wrapper.appendChild(inputHour);
		wrapper.appendChild(document.createTextNode("시"));
		wrapper.appendChild(inputMin);
		wrapper.appendChild(document.createTextNode("분"));
		buttonOk.appendChild(document.createTextNode("OK"));
		wrapper.appendChild(buttonOk);
		buttonCancel.appendChild(document.createTextNode("Cancel"));
		wrapper.appendChild(buttonCancel);
		this.timePicker.appendChild(wrapper);
		document.body.appendChild(this.timePicker);
		
		buttonOk.addEventListener("click", function() {
			var time = {};
			var selectElement = document.getElementById("inputAmpm");
			time.ampm = selectElement.options[selectElement.selectedIndex].value;
			time.hour = document.getElementById("inputHour").value;
			time.minute = document.getElementById("inputMin").value;
			
			document.body.removeChild(platformUIComponent.timePicker);
			
			callback(time);
			
			platformUIComponent.timePicker = null;
			
		}, false);
		
		buttonCancel.addEventListener("click", function() {
			document.body.removeChild(platformUIComponent.timePicker);
			platformUIComponent.timePicker = null;
			
		}, false);
	}
};

var platformUIComponent = new PlatformUIComponent();