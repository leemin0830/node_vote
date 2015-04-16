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

window.onerror = function(msg, url, linenumber) {
	log.log("Javascript Error Message");
	log.log("msg : " + msg);
	log.log("url : " + url);
	log.log("linenumber : " + linenumber);
	return true;
};

var _anomFunkMap = {};
var _anomFunkMapNextId = 0;

function anomToNameFunk(fun, isPermanent) {
	var funkId = "f" + _anomFunkMapNextId++;
	var funk = function(id, f) {
		return function() {
			if(!isPermanent) {
				_anomFunkMap[id] = null;
				delete _anomFunkMap[id];
			}
			return f.apply(this, arguments);
		};
	}(funkId, fun, isPermanent);
	
	_anomFunkMap[funkId] = funk;
	return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn, isPermanent) {
	if(fn) {
		return anomToNameFunk(fn, isPermanent);
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

function notSupported(functionName) {
	log.log(functionName + " is not supported on " + device.platformName);
}

function setAlopexEvent(eventName) {
	var e = document.createEvent('Events');
	e.initEvent(eventName, true, true);
	document.dispatchEvent(e);
}

/*
 * 페이지 진입 시점에 초기화 되어야 하는 정보들
 */
if(typeof (DeviceInfo) != "object") {
	DeviceInfo = {};
}

if(typeof (NavigationInfo) != "object") {
	NavigationInfo = {};
}

if(typeof (PreferenceInfo) != "object") {
	PreferenceInfo = {};
}

onload = function() {
	document.readyState = "loaded";
};

Alopex = {
	queue : {
		ready : true,
		commands : [],
		timer : null
	},
	_constructors : []
};

Alopex.addConstructor = function(func) {
	
	var state = document.readyState;
	
	if((state == 'loaded' || state == 'complete')) {
		func();
	} else {
		Alopex._constructors.push(func);
	}
};

(function() {
	var timer = setInterval(function() {
		var state = document.readyState;
		
		// DeviceInfo, NavigationInfo, PreferenceInfo는 device ready event 발생의 전제
		// 조건임.
		if((state == "loaded" || state == "complete") && (DeviceInfo.deviceId != null) && (NavigationInfo.pageId != null) && PreferenceInfo.globalPreference != null && PreferenceInfo.memoryPreference != null && PreferenceInfo.preference != null) {
			// alert(JSON.stringify(PreferenceInfo.globalPreference));
			// alert(JSON.stringify(PreferenceInfo.memoryPreference));
			// alert(JSON.stringify(PreferenceInfo.preference));
			
			clearInterval(timer); // stop looking
			
			// run our constructors list
			while(Alopex._constructors.length > 0) {
				var constructor = Alopex._constructors.shift();
				
				try {
					constructor();
				} catch(e) {
					if(typeof (debug) != "undefined" && typeof (debug['log']) == 'function')
						debug.log("Failed to run constructor: " + debug.processMessage(e));
					else
						log.error("Failed to run constructor: " + e.message + e);
				}
			}
			;
			
			// all constructors run, now fire the alopexready event
			setAlopexEvent('alopexready');
			// 하위 호환성 daprecated
			alopexController.isAlopexReady = true;
			if(alopexController.startFunc != null) {
				eval(alopexController.startFunc + "();");
			}
		}
	}, 1);
})();

Alopex.exec = function() {
	Alopex.queue.commands.push(arguments);
	
	if(Alopex.queue.timer == null) {
		Alopex.queue.timer = setInterval(Alopex.run_command, 10);
	}
};

Alopex.run_command = function() {
	if(!Alopex.available || !Alopex.queue.ready)
		return;
	
	Alopex.queue.ready = false;
	
	var args = Alopex.queue.commands.shift();
	
	if(Alopex.queue.commands.length == 0) {
		clearInterval(Alopex.queue.timer);
		Alopex.queue.timer = null;
	}
	
	var uri = [];
	var dict = null;
	
	for( var i = 1; i < args.length; i++) {
		var arg = args[i];
		
		if(arg == undefined || arg == null)
			arg = '';
		
		if(typeof (arg) == 'object')
			dict = arg;
		else
			uri.push(encodeURIComponent(arg));
	}
	
	var url = "alopex://" + args[0] + "/" + uri.join("/");
	
	if(dict != null) {
		var query_args = [];
		
		for( var name in dict) {
			if(typeof (name) != 'string')
				continue;
			
			query_args.push(encodeURIComponent(name) + "=" + encodeURIComponent(dict[name]));
		}
		
		if(query_args.length > 0)
			url += "?" + query_args.join("&");
	}
	
	document.location = url;
};

function AlopexController() {
	this.parameters = NavigationInfo.parameters;
	this.results = null;
	this.pageId = NavigationInfo.pageId;
	this.startFunc = null;
	this.isAlopexReady = false;
}

AlopexController.prototype.back = function(results) {
	navigation.back(results);
	
	deprecated("alopexController.back", "navigation.back");
};

AlopexController.prototype.backTo = function(navigationRule) {
	navigation.backToOrNavigate(navigationRule);
	
	deprecated("alopexController.backTo", "navigation.backToOrNavigate");
};

AlopexController.prototype.dismissLoadImage = function() {
	Alopex.exec("Alopex.dismissLoadImage");
};

AlopexController.prototype.dismissLoadingView = function() {
	Alopex.exec("Alopex.dismissLoadingView");
};

AlopexController.prototype.exit = function() {
	navigation.exit();
	
	deprecated("alopexController.exit", "navigation.exit");
};

AlopexController.prototype.goHome = function() {
	navigation.goHome();
	
	deprecated("alopexController.goHome", "navigation.goHome");
};

AlopexController.prototype.initPreferences = function() {
};

AlopexController.prototype.navigate = function(navigationRule) {
	navigation.navigate(navigationRule);
	
	deprecated("alopexController.navigate", "navigation.navigate");
};

AlopexController.prototype.setCustomizedBack = function(callback) {
	notSupported("AlopexController.setCustomizedBack");
};

AlopexController.prototype.setOnPause = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnPause", GetFunctionName(callback));
	
	deprecated("alopexController.setOnPause", "onpause event");
};

AlopexController.prototype.setOnResume = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnResume", GetFunctionName(callback));
	
	deprecated("alopexController.setOnResume", "onresume event");
};

AlopexController.prototype.setOnScreenTouch = function(callback) {
	if(isValid(callback))
		Alopex.exec("Alopex.setOnScreenTouch", GetFunctionName(callback));
};

AlopexController.prototype.start = function(initHandler) {
	this.startFunc = initHandler;
	
	if(this.isAlopexReady) {
		eval(initHandler + "();");
	}
	
	deprecated("alopexController.setOnResume", "onresume event");
};

var alopexController;

Alopex.addConstructor(function() {
	alopexController = new AlopexController();
});

function Application() {
	this.appId = DeviceInfo.appId;
	this.appVersion = DeviceInfo.appVersion;
	this.contentVersion = DeviceInfo.contentVersion;
}

Application.prototype.getVersion = function(identifier) {
	if(isValid(identifier))
		return globalPreference.get(identifier);
};

Application.prototype.hasApp = function(identifier, callback) {
	if(isValid(identifier) && isValid(callback)) {
		if(typeof (callback) == "function") {
			Alopex.exec("ApplicationJSNI.hasApp", identifier, GetFunctionName(callback));
		} else if(typeof (callback) == "string") {
			Alopex.exec("ApplicationJSNI.hasApp", identifier, callback);
		}
	}
};

Application.prototype.installApplication = function(filePath) {
	notSupported("Application.installApplication");
};

Application.prototype.startApplication = function(identifier, parameters) {
	if(isValid(identifier)) {
		if(isValid(parameters))
			Alopex.exec("ApplicationJSNI.startApplication", identifier, JSON.stringify(parameters));
		else
			Alopex.exec("ApplicationJSNI.startApplication", identifier);
	}
};

Application.prototype.startAlopexApplication = function(identifier, pageId, parameters) {
	if(isValid(identifier) && isValid(pageId)) {
		if(isValid(parameters))
			Alopex.exec("ApplicationJSNI.startAlopexApplication", identifier, pageId, JSON.stringify(parameters));
		else
			Alopex.exec("ApplicationJSNI.startAlopexApplication", identifier, pageId);
	}
};

Application.prototype.startWebBrowser = function(url) {
	if(isValid(url))
		Alopex.exec("ApplicationJSNI.startWebBrowser", url);
};

Application.prototype.removeContents = function(callback) {
	if(isValid(callback))
		Alopex.exec("ApplicationJSNI.removeContents", GetFunctionName(callback));
};

var application;

Alopex.addConstructor(function() {
	application = new Application();
});

function Contact() {
}

Contact.prototype.add = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("ContactJSNI.add", JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.get = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("ContactJSNI.get", contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.remove = function(contactId, successCallback, errorCallback) {
	if(isValid(contactId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("ContactJSNI.remove", contactId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Contact.prototype.search = function(option, successCallback, errorCallback) {
	if(isValid(option)) {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("ContactJSNI.search", JSON.stringify(option), GetFunctionName(successCallback), GetFunctionName(errorCallback));
	} else {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("ContactJSNI.search", GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
};

Contact.prototype.update = function(contactInfo, successCallback, errorCallback) {
	if(isValid(contactInfo) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("ContactJSNI.update", JSON.stringify(contactInfo), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var contact;

Alopex.addConstructor(function() {
	contact = new Contact();
});

function Database() {
	this.resultSet;
	this.resultRaw;
}

Database.prototype.commit = function(databaseName, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("DatabaseJSNI.commit", databaseName, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.deleteRow = function(query) {
	if(isValid(query))
		Alopex.exec("DatabaseJSNI.deleteRow", JSON.stringify(query));
};

Database.prototype.execQuery = function(query) {
	if(isValid(query))
		Alopex.exec("DatabaseJSNI.execQuery", JSON.stringify(query));
};

Database.prototype.insert = function(query) {
	if(isValid(query))
		Alopex.exec("DatabaseJSNI.insert", JSON.stringify(query));
};

Database.prototype.select = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("DatabaseJSNI.select", databaseName, JSON.stringify(query), GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Database.prototype.update = function(query) {
	if(isValid(query))
		Alopex.exec("DatabaseJSNI.update", JSON.stringify(query));
};

var database;

Alopex.addConstructor(function() {
	database = new Database();
});

function Device() {
	this.carrier = DeviceInfo.carrier;
	this.deviceId = DeviceInfo.deviceId;
	this.deviceModel = DeviceInfo.deviceModel;
	this.deviceManufacturer = DeviceInfo.deviceManufacturer;
	this.isTablet = DeviceInfo.isTablet;
	this.isTV = DeviceInfo.isTV;
	this.mobileEquipmentId = DeviceInfo.deviceId;
	this.osName = DeviceInfo.osName;
	this.osVersion = DeviceInfo.osVersion;
	this.platform = DeviceInfo.platform;
	this.platformName = DeviceInfo.platformName;
	this.available = Alopex.available = this.deviceId != null;
}

Device.prototype.getDeviceDpi = function() {
	notSupported("DeviceJSNI.getDeviceDpi");
};

Device.prototype.getLanguage = function(callback) {
	if(isValid(callback))
		Alopex.exec("DeviceJSNI.getLanguage", GetFunctionName(callback));
};

Device.prototype.getNetworkType = function(callback) {
	if(isValid(callback))
		Alopex.exec("DeviceJSNI.getNetworkType", GetFunctionName(callback));
};

var device;

Alopex.addConstructor(function() {
	device = window.device = new Device();
});

function File() {
}

File.prototype.copy = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		Alopex.exec("FileManagerJSNI.copy", from, to, GetFunctionName(callback));
}

File.prototype.createNewFile = function(path, callback) {
	if(isValid(path) && isValid(callback))
		Alopex.exec("FileManagerJSNI.createNewFile", path, GetFunctionName(callback));
}

File.prototype.deleteFile = function(from, callback) {
	if(isValid(from) && isValid(callback))
		Alopex.exec("FileManagerJSNI.deleteFile", from, GetFunctionName(callback));
}

File.prototype.exists = function(path, callback) {
	if(isValid(path) && isValid(callback))
		Alopex.exec("FileManagerJSNI.exists", path, GetFunctionName(callback));
}

File.prototype.getStoragePath = function(callback, onPrivate) {
	if(isValid(callback) && isValid(onPrivate))
		Alopex.exec("FileManagerJSNI.getStoragePath", GetFunctionName(callback), onPrivate);
}

File.prototype.isDirectory = function(path, callback) {
	if(isValid(path) && isValid(callback))
		Alopex.exec("FileManagerJSNI.isDirectory", path, GetFunctionName(callback));
}

File.prototype.mkdirs = function(path, callback) {
	if(isValid(path) && isValid(callback))
		Alopex.exec("FileManagerJSNI.mkdirs", path, GetFunctionName(callback));
}

File.prototype.move = function(from, to, callback) {
	if(isValid(from) && isValid(to) && isValid(callback))
		Alopex.exec("FileManagerJSNI.move", from, to, GetFunctionName(callback));
}

File.prototype.rename = function(path, name, callback) {
	if(isValid(path) && isValid(callback))
		Alopex.exec("FileManagerJSNI.rename", path, name, GetFunctionName(callback));
}

var file;

Alopex.addConstructor(function() {
	file = new File();
});

function Geolocation() {
	this.geolocationError = {};
	this.geolocationError.NETWORK_UNAVAILABLE = 998;
	this.geolocationError.DEVICE_NOT_SUPPORTED = 999;
	this.successCallback;
	this.errorCallback;
}

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

var geolocation;

Alopex.addConstructor(function() {
	geolocation = new Geolocation();
});

function GlobalPreference() {
	this.preferences = PreferenceInfo.globalPreference;
}

GlobalPreference.prototype.initPreferences = function() {
	Alopex.exec("GlobalPreferenceJSNI.initPreferences");
};

GlobalPreference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

GlobalPreference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	} else
		return undefined;
};

GlobalPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)) {
		this.preferences[key] = value;
		Alopex.exec("GlobalPreferenceJSNI.put", key, value);
	}
};

GlobalPreference.prototype.remove = function(key) {
	if(isValid(key)) {
		delete this.preferences[key];
		Alopex.exec("GlobalPreferenceJSNI.remove", key);
	}
};

var globalPreference;

Alopex.addConstructor(function() {
	globalPreference = new GlobalPreference();
});

var httpObjects = new Array();

function Http() {
	this.errorCode = -1;
	this.errorMessage = null;
	this.response = null;
	this.responseHeader = {};
	httpObjects.push(this);
	this.index = httpObjects.length - 1;
}

Http.prototype.cancelDownload = function() {
	Alopex.exec("HttpJSNI.cancelDownload", this.index);
};

Http.prototype.cancelRequest = function() {
	Alopex.exec("HttpJSNI.cancelRequest", this.index);
};

Http.prototype.cancelUpload = function() {
	Alopex.exec("HttpJSNI.cancelUpload", this.index);
};

Http.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback)) {
		if(typeof (successCallback) == "function" && typeof (errorCallback) == "function" && typeof (progressCallback) == "function" && typeof (cancelCallback) == "function")
			Alopex.exec("HttpJSNI.download", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback, true), GetFunctionName(cancelCallback));
		else if(typeof (successCallback) == "string" && typeof (errorCallback) == "string" && typeof (progressCallback) == "string" && typeof (cancelCallback) == "string")
			Alopex.exec("HttpJSNI.download", this.index, JSON.stringify(entity), successCallback, errorCallback, progressCallback, cancelCallback);
	}
};

Http.prototype.getResponseHeader = function(header) {
	if(isValid(header))
		return this.responseHeader[header];
};

Http.prototype.request = function(entity, successCallback, errorCallback, delegateClassName) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("HttpJSNI.request", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), delegateClassName);
};

Http.prototype.setRequestHeader = function(header, value) {
	if(isValid(header) && isValid(value))
		Alopex.exec("HttpJSNI.setRequestHeader", this.index, header, value);
};

Http.prototype.setTimeout = function(timeout) {
	if(isValid(timeout)) {
		if(!isNaN(timeout))
			Alopex.exec("HttpJSNI.setTimeout", this.index, timeout);
	}
};

Http.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	if(isValid(entity) && isValid(successCallback) && isValid(errorCallback) && isValid(progressCallback) && isValid(cancelCallback)) {
		if(typeof (successCallback) == "function" && typeof (errorCallback) == "function" && typeof (progressCallback) == "function" && typeof (cancelCallback) == "function")
			Alopex.exec("HttpJSNI.upload", this.index, JSON.stringify(entity), GetFunctionName(successCallback), GetFunctionName(errorCallback), GetFunctionName(progressCallback, true), GetFunctionName(cancelCallback));
		else if(typeof (successCallback) == "string" && typeof (errorCallback) == "string" && typeof (progressCallback) == "string" && typeof (cancelCallback) == "string")
			Alopex.exec("HttpJSNI.upload", this.index, JSON.stringify(entity), successCallback, errorCallback, progressCallback, cancelCallback);
	}
};

function JSNICaller() {
}

JSNICaller.prototype.invoke = function() {
	var script = "Alopex.exec" + "(";
	for( var i = 0; i < arguments.length; i++) {
		script += "arguments[" + i + "]"
		if(i < arguments.length - 1)
			script += ",";
	}
	script += ");";
	
	eval(script);
}

var jsniCaller;

Alopex.addConstructor(function() {
	jsniCaller = new JSNICaller();
});

function LocalNotification() {
}

LocalNotification.prototype.addNotification = function(id, time, action) {
	if(isValid(id) && isValid(time) && isValid(action))
		Alopex.exec("LocalNotificationJSNI.addNotification", id, JSON.stringify(time), JSON.stringify(action));
};

LocalNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		Alopex.exec("LocalNotificationJSNI.getUnreadNotifications", GetFunctionName(callback));
	
};

LocalNotification.prototype.deleteAllUnreadNotifications = function() {
	Alopex.exec("LocalNotificationJSNI.deleteAllUnreadNotifications");
};

LocalNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		Alopex.exec("LocalNotificationJSNI.deleteUnreadNotification", index);
};

LocalNotification.prototype.removeNotification = function(id) {
	if(isValid(id))
		Alopex.exec("LocalNotificationJSNI.removeNotification", id);
};

LocalNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		Alopex.exec("LocalNotificationJSNI.useImmediateForegroundNotification", use);
};

var localNotification;

Alopex.addConstructor(function() {
	localNotification = new LocalNotification();
});

function Log() {
	this.show = true;
}

Log.prototype.error = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("LogJSNI.error", message, {
				logLevel : "ERROR"
			});
	}
};

Log.prototype.log = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("LogJSNI.log", message, {
				logLevel : "INFO"
			});
	}
};

Log.prototype.warn = function(message) {
	if(isValid(message)) {
		if(!this.show)
			return;
		
		if(Alopex.available)
			Alopex.exec("LogJSNI.warn", message, {
				logLevel : "WARN"
			});
	}
};

var log;

Alopex.addConstructor(function() {
	log = new Log();
});

function MemoryPreference() {
	this.preferences = PreferenceInfo.memoryPreference;
}

MemoryPreference.prototype.initPreferences = function() {
	Alopex.exec("MemoryPreferenceJSNI.initPreferences");
};

MemoryPreference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

MemoryPreference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	} else
		return undefined;
};

MemoryPreference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)) {
		this.preferences[key] = value;
		Alopex.exec("MemoryPreferenceJSNI.put", key, value);
	}
};

MemoryPreference.prototype.remove = function(key) {
	if(isValid(key)) {
		delete this.preferences[key];
		Alopex.exec("MemoryPreferenceJSNI.remove", key);
	}
};

MemoryPreference.prototype.removeAll = function() {
	this.preferences = null;
	this.preferences = new Object();
	Alopex.exec("MemoryPreferenceJSNI.removeAll");
};

var memoryPreference;

Alopex.addConstructor(function() {
	memoryPreference = new MemoryPreference();
});

function Multimedia() {
}

Multimedia.prototype.deleteImage = function(path, successCallback, errorCallback) {
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("MultimediaJSNI.deleteImage", path, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Multimedia.prototype.getImageOrientation = function(imagePath, callback) {
	if(isValid(imagePath) && isValid(callback)) {
		if(typeof (callback) == "function")
			Alopex.exec("MultimediaJSNI.getImageOrientation", imagePath, GetFunctionName(callback));
		else if(typeof (callback) == "string")
			Alopex.exec("MultimediaJSNI.getImageOrientation", imagePath, callback);
	}
};

Multimedia.prototype.getPicture = function(successCallback, errorCallback, option) {
	if(isValid(option)) {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("MultimediaJSNI.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback), JSON.stringify(option));
	} else {
		if(isValid(successCallback) && isValid(errorCallback))
			Alopex.exec("MultimediaJSNI.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback));
	}
};

Multimedia.prototype.resizePicture = function(pictureInfo, callback) {
	if(isValid(pictureInfo) && isValid(callback)) {
		if(typeof (callback) == "function")
			Alopex.exec("MultimediaJSNI.resizePicture", JSON.stringify(pictureInfo), GetFunctionName(callback));
		else if(typeof (callback) == "string")
			Alopex.exec("MultimediaJSNI.resizePicture", JSON.stringify(pictureInfo), callback);
	}
};

Multimedia.prototype.rotateImage = function(imageInfo, callback) {
	if(isValid(imageInfo) && isValid(callback))
		Alopex.exec("MultimediaJSNI.rotateImage", JSON.stringify(imageInfo), GetFunctionName(callback));
};

Multimedia.prototype.saveImage = function(path, successCallback, errorCallback) {
	if(isValid(path) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("MultimediaJSNI.saveImage", path, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Multimedia.prototype.takePicture = function(successCallback, errorCallback) {
	if(isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("MultimediaJSNI.takePicture", GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

var multimedia;

Alopex.addConstructor(function() {
	multimedia = new Multimedia();
});

// deprecated API
function NativeUI() {
	deprecated("NativeUI Class", "PlatformUIComponent Class");
}

NativeUI.prototype.dismissProgressBarDialog = function() {
	platformUIComponent.dismissProgressBarDialog();
	
	deprecated("nativeUI.dismissProgressBarDialog", "platformUIComponent.dismissProgressBarDialog");
};

NativeUI.prototype.dismissProgressDialog = function() {
	platformUIComponent.dismissProgressDialog();
	
	deprecated("nativeUI.dismissProgressDialog", "platformUIComponent.dismissProgressDialog");
};

NativeUI.prototype.dismissSoftKeyboard = function(callback) {
	platformUIComponent.dismissSoftKeyboard(callback);
	
	deprecated("nativeUI.dismissSoftKeyboard", "platformUIComponent.dismissSoftKeyboard");
};

NativeUI.prototype.isKeyboardShowing = function(callback) {
	platformUIComponent.isKeyboardShowing(callback);
	
	deprecated("nativeUI.isKeyboardShowing", "platformUIComponent.isKeyboardShowing");
};

NativeUI.prototype.setOptionMenu = function(menuItems) {
	log.log("PlatformUIComponentJSNI.setOptionMenu is not supported on iOS platform");
};

NativeUI.prototype.setProgress = function(progress) {
	platformUIComponent.setProgress(progress);
	
	deprecated("nativeUI.setProgress", "platformUIComponent.setProgress");
};

NativeUI.prototype.setOptionMenu = function setOptionMenuItems(menuItems) {
	notSupported("PlatformUIComponentJSNI.setOptionMenu");
};

NativeUI.prototype.showContextMenu = function(menuItems, option) {
	platformUIComponent.showContextMenu(menuItems, option);
	
	deprecated("nativeUI.showContextMenu", "platformUIComponent.showContextMenu");
};

NativeUI.prototype.showDatePicker = function(callback, option) {
	platformUIComponent.showDatePicker(callback, option);
	
	deprecated("nativeUI.showDatePicker", "platformUIComponent.showDatePicker");
};

NativeUI.prototype.showDatePickerWithData = function(date, callback, option) {
	platformUIComponent.showDatePickerWithData(date, callback, option);
	
	deprecated("nativeUI.showDatePickerWithData", "platformUIComponent.showDatePickerWithData");
};

NativeUI.prototype.showMultiSelect = function(selection) {
	platformUIComponent.showMultiSelect(selection);
	
	deprecated("nativeUI.showMultiSelect", "platformUIComponent.showMultiSelect");
};

NativeUI.prototype.showProgressBarDialog = function(option) {
	platformUIComponent.showProgressBarDialog(option);
	
	deprecated("nativeUI.showProgressBarDialog", "platformUIComponent.showProgressBarDialog");
};

NativeUI.prototype.showProgressDialog = function(option) {
	platformUIComponent.showProgressDialog(option);
	
	deprecated("nativeUI.showProgressDialog", "platformUIComponent.showProgressDialog");
};

NativeUI.prototype.showSingleSelect = function(selection) {
	platformUIComponent.showSingleSelect(selection);
	
	deprecated("nativeUI.showSingleSelect", "platformUIComponent.showSingleSelect");
};

NativeUI.prototype.showTimePicker = function(callback, option) {
	platformUIComponent.showTimePicker(callback, option);
	
	deprecated("nativeUI.showTimePicker", "platformUIComponent.showTimePicker");
};

NativeUI.prototype.showTimePickerWithData = function(time, callback, option) {
	platformUIComponent.showTimePickerWithData(time, callback, option);
	
	deprecated("nativeUI.showTimePickerWithData", "platformUIComponent.showTimePickerWithData");
};

var nativeUI;

Alopex.addConstructor(function() {
	nativeUI = new NativeUI();
});

function Navigation() {
	this.parameters = NavigationInfo.parameters;
	this.results = null;
	this.pageId = NavigationInfo.pageId;
}

Navigation.prototype.back = function(results) {
	if(results)
		Alopex.exec("NavigationJSNI.back", JSON.stringify(results));
	else
		Alopex.exec("NavigationJSNI.back");
};

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
		Alopex.exec("NavigationJSNI.backTo", JSON.stringify(navigationRule));
	}
};

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
		Alopex.exec("NavigationJSNI.backToOrNavigate", JSON.stringify(navigationRule));
	}
};

Navigation.prototype.exit = function() {
	notSupported("NavigationJSNI.exit");
};

Navigation.prototype.goHome = function() {
	Alopex.exec("NavigationJSNI.goHome");
};

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
		Alopex.exec("NavigationJSNI.navigate", JSON.stringify(navigationRule));
	}
};

var navigation;

Alopex.addConstructor(function() {
	navigation = new Navigation();
});

function Phone() {
}

Phone.prototype.call = function(number) {
	if(isValid(number))
		Alopex.exec("PhoneJSNI.call", number);
};

Phone.prototype.sendEmail = function(mail) {
	if(isValid(mail))
		Alopex.exec("PhoneJSNI.sendEmail", JSON.stringify(mail));
};

Phone.prototype.sendSMS = function(sms) {
	if(isValid(sms))
		Alopex.exec("PhoneJSNI.sendSMS", JSON.stringify(sms));
};

var phone;

Alopex.addConstructor(function() {
	phone = new Phone();
});

function PlatformUIComponent() {
}

PlatformUIComponent.prototype.dismissProgressBarDialog = function() {
	Alopex.exec("PlatformUIComponentJSNI.dismissProgressBarDialog");
};

PlatformUIComponent.prototype.dismissProgressDialog = function() {
	Alopex.exec("PlatformUIComponentJSNI.dismissProgressDialog");
};

PlatformUIComponent.prototype.dismissSoftKeyboard = function(callback) {
	if(isValid(callback))
		Alopex.exec("PlatformUIComponentJSNI.dismissSoftKeyboard", GetFunctionName(callback));
	else
		Alopex.exec("PlatformUIComponentJSNI.dismissSoftKeyboard");
};

PlatformUIComponent.prototype.isKeyboardShowing = function(callback) {
	if(isValid(callback))
		Alopex.exec("PlatformUIComponentJSNI.keyboardShown", GetFunctionName(callback));
};

PlatformUIComponent.prototype.setOptionMenu = function(menuItems) {
	log.log("PlatformUIComponentJSNI.setOptionMenu is not supported on iOS platform");
};

PlatformUIComponent.prototype.setProgress = function(progress) {
	if(isValid(progress)) {
		if(progress >= 0 && progress <= 100)
			Alopex.exec("PlatformUIComponentJSNI.setProgress", progress);
	}
};

PlatformUIComponent.prototype.setOptionMenu = function setOptionMenuItems(menuItems) {
	notSupported("PlatformUIComponentJSNI.setOptionMenu");
};

PlatformUIComponent.prototype.showContextMenu = function(menuItems, option) {
	if(isValid(menuItems)) {
		if(isValid(option))
			Alopex.exec("PlatformUIComponentJSNI.showContextMenu", JSON.stringify(menuItems), JSON.stringify(option));
		else
			Alopex.exec("PlatformUIComponentJSNI.showContextMenu", JSON.stringify(menuItems));
	}
};

PlatformUIComponent.prototype.showDatePicker = function(callback, option) {
	if(isValid(callback)) {
		if(isValid(option))
			Alopex.exec("PlatformUIComponentJSNI.showDatePicker", GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("PlatformUIComponentJSNI.showDatePicker", GetFunctionName(callback));
	}
};

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
		
		if(isValid(option))
			Alopex.exec("PlatformUIComponentJSNI.showDatePickerWithData", JSON.stringify(date), GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("PlatformUIComponentJSNI.showDatePickerWithData", JSON.stringify(date), GetFunctionName(callback));
	}
};

PlatformUIComponent.prototype.showMultiSelect = function(selection) {
	if(isValid(selection))
		Alopex.exec("PlatformUIComponentJSNI.showMultiSelect", JSON.stringify(selection));
};

PlatformUIComponent.prototype.showProgressBarDialog = function(option) {
	if(isValid(option))
		Alopex.exec("PlatformUIComponentJSNI.showProgressBarDialog", JSON.stringify(option));
	else
		Alopex.exec("PlatformUIComponentJSNI.showProgressBarDialog");
};

PlatformUIComponent.prototype.showProgressDialog = function(option) {
	if(isValid(option))
		Alopex.exec("PlatformUIComponentJSNI.showProgressDialog", JSON.stringify(option));
	else
		Alopex.exec("PlatformUIComponentJSNI.showProgressDialog");
};

PlatformUIComponent.prototype.showSingleSelect = function(selection) {
	if(isValid(selection))
		Alopex.exec("PlatformUIComponentJSNI.showSingleSelect", JSON.stringify(selection));
};

PlatformUIComponent.prototype.showTimePicker = function(callback, option) {
	if(isValid(callback)) {
		if(isValid(option))
			Alopex.exec("PlatformUIComponentJSNI.showTimePicker", GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("PlatformUIComponentJSNI.showTimePicker", GetFunctionName(callback));
	}
};

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
			Alopex.exec("PlatformUIComponentJSNI.showTimePickerWithData", JSON.stringify(time), GetFunctionName(callback), JSON.stringify(option));
		else
			Alopex.exec("PlatformUIComponentJSNI.showTimePickerWithData", JSON.stringify(time), GetFunctionName(callback));
	}
};

var platformUIComponent;

Alopex.addConstructor(function() {
	platformUIComponent = new PlatformUIComponent();
});

function Preference() {
	this.preferences = PreferenceInfo.preference;
}

Preference.prototype.initPreferences = function() {
	Alopex.exec("PreferenceJSNI.initPreferences");
};

Preference.prototype.contains = function(key) {
	if(isValid(key)) {
		if(isValid(this.preferences[key]))
			return true;
		else
			return false;
	}
};

Preference.prototype.get = function(key) {
	if(isValid(key)) {
		var val = this.preferences[key];
		
		if(isValid(val))
			return val;
		else
			return undefined;
	} else
		return undefined;
};

Preference.prototype.put = function(key, value) {
	if(isValid(key) && isValid(value)) {
		this.preferences[key] = value;
		Alopex.exec("PreferenceJSNI.put", key, value);
	}
};

Preference.prototype.remove = function(key) {
	if(isValid(key)) {
		delete this.preferences[key];
		Alopex.exec("PreferenceJSNI.remove", key);
	}
};

Preference.prototype.removeAll = function() {
	this.preferences = null;
	this.preferences = new Object();
	Alopex.exec("PreferenceJSNI.removeAll");
};

var preference;

Alopex.addConstructor(function() {
	preference = new Preference();
});

function PushNotification() {
}

PushNotification.prototype.deleteAllUnreadNotifications = function() {
	Alopex.exec("PushNotificationJSNI.deleteAllUnreadNotifications");
};

PushNotification.prototype.deleteUnreadNotification = function(index) {
	if(isValid(index))
		Alopex.exec("PushNotificationJSNI.deleteUnreadNotification", index);
};

PushNotification.prototype.getRegistrationId = function(callback) {
	if(isValid(callback))
		Alopex.exec("PushNotificationJSNI.getRegistrationId", GetFunctionName(callback));
};

PushNotification.prototype.getUnreadNotifications = function(callback) {
	if(isValid(callback))
		Alopex.exec("PushNotificationJSNI.getUnreadNotifications", GetFunctionName(callback));
};

PushNotification.prototype.register = function(senderId) {
	notSupported("PushNotification.register");
};

PushNotification.prototype.unregister = function() {
	notSupported("PushNotification.unregister");
};

PushNotification.prototype.useImmediateForegroundNotification = function(use) {
	if(isValid(use))
		Alopex.exec("PushNotificationJSNI.useImmediateForegroundNotification", use);
};

var pushNotification;

Alopex.addConstructor(function() {
	pushNotification = new PushNotification();
});

function Resource() {
}

Resource.prototype.cancelGetContent = function() {
	Alopex.exec("Resource.cancelGetContent");
};

Resource.prototype.getContent = function(pageId, successCallback, errorCallback) {
	if(isValid(pageId) && isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("Resource.getContent", pageId, GetFunctionName(successCallback), GetFunctionName(errorCallback));
};

Resource.prototype.getPageUri = function(pageId, callback) {
	if(isValid(pageId) && isValid(callback))
		Alopex.exec("Resource.getPageUri", pageId, GetFunctionName(callback));
};

var resource;

Alopex.addConstructor(function() {
	resource = new Resource();
});

function Sensor() {
}

Sensor.prototype.startAccelerometerSensor = function(successCallback, errorCallback, interval) {
	if(isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("DeviceSensorJSNI.startAccelerometerSensor", GetFunctionName(successCallback, true), GetFunctionName(errorCallback, true), interval);
};

Sensor.prototype.stopAccelerometerSensor = function() {
	Alopex.exec("DeviceSensorJSNI.stopAccelerometerSensor");
};

Sensor.prototype.startCompassSensor = function(successCallback, errorCallback, interval) {
	if(isValid(successCallback) && isValid(errorCallback))
		Alopex.exec("DeviceSensorJSNI.startCompassSensor", GetFunctionName(successCallback, true), GetFunctionName(errorCallback, true), interval);
};

Sensor.prototype.stopCompassSensor = function() {
	Alopex.exec("DeviceSensorJSNI.stopCompassSensor");
};

Sensor.prototype.turnOnLight = function() {
	Alopex.exec("DeviceSensorJSNI.turnOnLight");
};

Sensor.prototype.turnOffLight = function() {
	Alopex.exec("DeviceSensorJSNI.turnOffLight");
};

Sensor.prototype.vibrate = function() {
	Alopex.exec("DeviceSensorJSNI.vibrate");
};

var sensor;

Alopex.addConstructor(function() {
	sensor = new Sensor();
});

function deprecated(functionName, alternative) {
	log.error(functionName + " is deprecated. Use " + alternative + " instead");
}
