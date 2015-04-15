/* 
 * Copyright (c) 2012 SK C&C Co., Ltd. All rights reserved. 
 * 
 * This software is the confidential and proprietary information of SK C&C. 
 * You shall not disclose such confidential information and shall use it 
 * only in accordance with the terms of the license agreement you entered into 
 * with SK C&C. 
 */
/**
 * @version 3.0.4
 */

function ApplicationExtension() {
	applicationExtension = this;
	this.identifier = null;
	this.pageId = null;
	this.parameters = null;
	this.callback = null;
}

ApplicationExtension.prototype.startApplicationIfHasApp = function(identifier, hasAppCallback, parameters) {
	if(isValid(identifier) && isValid(hasAppCallback)) {
		this.identifier = identifier;
		this.parameters = parameters;
		this.callback = hasAppCallback;
		application.hasApp(identifier, "applicationExtension.hasAppCallback");
	}
};

ApplicationExtension.prototype.startAlopexApplicationIfHasApp = function(identifier, pageId, hasAppCallback, parameters) {
	if(isValid(identifier) && isValid(pageId) && isValid(hasAppCallback)) {
		this.identifier = identifier;
		this.pageId = pageId;
		this.parameters = parameters;
		this.callback = hasAppCallback;
		application.hasApp(identifier, "applicationExtension.hasAppCallback");
	}
};

ApplicationExtension.prototype.hasAppCallback = function(callback) {
	if(callback == true) {
		if(isValid(this.pageId)) {
			application.startAlopexApplication(this.identifier, this.pageId, this.parameters);
		} else {
			application.startApplication(this.identifier, this.parameters);
		}
	} else {
		this.callback(callback);
	}
};

var applicationExtension;

function DatabaseExtension() {
	databaseExtension = this;
}

DatabaseExtension.prototype.deleteRowAndCommit = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback)) {
		database.deleteRow(query);
		database.commit(databaseName, successCallback, errorCallback);
	}
};

DatabaseExtension.prototype.execQueryAndCommit = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback)) {
		database.execQuery(query);
		database.commit(databaseName, successCallback, errorCallback);
	}
};

DatabaseExtension.prototype.insertAndCommit = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback)) {
		database.insert(query);
		database.commit(databaseName, successCallback, errorCallback);
	}
};

DatabaseExtension.prototype.updateAndCommit = function(databaseName, query, successCallback, errorCallback) {
	if(isValid(databaseName) && isValid(query) && isValid(successCallback) && isValid(errorCallback)) {
		database.update(query);
		database.commit(databaseName, successCallback, errorCallback);
	}
};

var databaseExtension;

var httpExtensionObjects = new Array();

function HttpExtension() {
	this.http = new Http();
	httpExtensionObjects.push(this);
	this.index = httpExtensionObjects.length - 1;
}

HttpExtension.prototype.cancelDownload = function() {
	this.http.cancelDownload();
};

HttpExtension.prototype.cancelRequest = function() {
	this.http.cancelRequest();
};

HttpExtension.prototype.cancelUpload = function() {
	this.http.cancelUpload();
};

HttpExtension.prototype.download = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	this.http.download(entity, successCallback, errorCallback, progressCallback, cancelCallback);
};

HttpExtension.prototype.downloadWithProgressBarDialog = function(entity, successCallback, errorCallback, cancelCallback) {
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;
	this.cancelCallback = cancelCallback;
	httpExtensionObjects[this.index].download(entity, "httpExtensionObjects[" + this.index + "].downloadSuccessCallback", "httpExtensionObjects[" + this.index + "].downloadErrorCallback", "httpExtensionObjects[" + this.index + "].downloadProgressCallback", "httpExtensionObjects[" + this.index + "].downloadCancelCallback");
	
	var option = {
		"message" : "Downloading...",
		"cancelCallback" : "httpExtensionObjects[" + this.index + "].cancelDownload",
		"cancelable" : true
	};
	
	nativeUI.showProgressBarDialog(option);
};

HttpExtension.prototype.getResponseHeader = function(header) {
	this.http.getResponseHeader(header);
};

HttpExtension.prototype.request = function(entity, successCallback, errorCallback, delegateClassName) {
	this.http.request(entity, successCallback, errorCallback, delegateClassName);
};

HttpExtension.prototype.requestGet = function(url, parameters, successCallback, errorCallback, delegateClassName) {
	if(isValid(url) && isValid(parameters)) {
		var entity = {};
		entity.url = url;
		entity.parameters = parameters;
		entity.method = "GET";
		entity.onBody = false;
		this.http.request(entity, successCallback, errorCallback, delegateClassName);
	}
};

HttpExtension.prototype.requestPost = function(url, content, successCallback, errorCallback, delegateClassName) {
	if(isValid(url) && isValid(content)) {
		var entity = {};
		entity.url = url;
		entity.content = content;
		entity.method = "POST";
		entity.onBody = true;
		this.http.request(entity, successCallback, errorCallback, delegateClassName);
	}
};

HttpExtension.prototype.setRequestHeader = function(header, value) {
	this.http.setRequestHeader(header, value);
};

HttpExtension.prototype.setTimeout = function(timeout) {
	this.http.setTimeout(timeout);
};

HttpExtension.prototype.upload = function(entity, successCallback, errorCallback, progressCallback, cancelCallback) {
	this.http.upload(entity, successCallback, errorCallback, progressCallback, cancelCallback);
};

HttpExtension.prototype.uploadWithProgressBarDialog = function(entity, successCallback, errorCallback, cancelCallback) {
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;
	this.cancelCallback = cancelCallback;
	httpExtensionObjects[this.index].upload(entity, "httpExtensionObjects[" + this.index + "].uploadSuccessCallback", "httpExtensionObjects[" + this.index + "].uploadErrorCallback", "httpExtensionObjects[" + this.index + "].uploadProgressCallback", "httpExtensionObjects[" + this.index + "].uploadCancelCallback");
	
	var option = {
		"message" : "Uploading...",
		"cancelCallback" : "httpExtensionObjects[" + this.index + "].cancelUpload",
		"cancelable" : true
	};
	
	nativeUI.showProgressBarDialog(option);
};

HttpExtension.prototype.uploadSuccessCallback = function() {
	nativeUI.dismissProgressBarDialog();
	this.successCallback();
};

HttpExtension.prototype.uploadErrorCallback = function(http) {
	nativeUI.dismissProgressBarDialog();
	this.errorCallback(http);
};

HttpExtension.prototype.uploadProgressCallback = function(progress) {
	if(progress != 100) {
		nativeUI.setProgress(progress);
	} else if(progress == 100) {
		nativeUI.dismissProgressBarDialog();
	}
};

HttpExtension.prototype.uploadCancelCallback = function() {
	this.cancelCallback();
};

HttpExtension.prototype.downloadSuccessCallback = function(filePath) {
	nativeUI.dismissProgressBarDialog();
	this.successCallback(filePath);
};

HttpExtension.prototype.downloadErrorCallback = function(http) {
	nativeUI.dismissProgressBarDialog();
	this.errorCallback(http);
};

HttpExtension.prototype.downloadProgressCallback = function(progress) {
	if(progress != 100) {
		nativeUI.setProgress(progress);
	} else if(progress == 100) {
		nativeUI.dismissProgressBarDialog();
	}
};

HttpExtension.prototype.downloadCancelCallback = function() {
	this.cancelCallback();
};

function MultimediaExtension() {
	multimediaExtension = this;
	this.path = null;
	this.degree = null;
	this.callback = null;
}

MultimediaExtension.prototype.resizeAndRotateForward = function(path, size, callback) {
	this.callback = callback;
	
	if(isValid(path) && isValid(size) && isValid(callback)) {
		var pictureInfo = {
			"path" : path,
			"width" : size.width,
			"height" : size.height
		};
		multimedia.resizePicture(pictureInfo, "multimediaExtension.resizeCallback");
	}
};

MultimediaExtension.prototype.resizeCallback = function(path) {
	this.path = path;
	
	if(isValid(this.path))
		multimedia.getImageOrientation(path, "multimediaExtension.orientationCallback");
};

MultimediaExtension.prototype.orientationCallback = function(imageInfo) {
	this.degree = imageInfo.degree;
	
	if(isValid(this.degree)) {
		var rotateImageInfo = {
			"path" : this.path,
			"degree" : this.degree
		};
		multimedia.rotateImage(rotateImageInfo, this.callback);
	}
};

var multimediaExtension;

singleSelectedIndexAlopex = -1;
multiSelectedItemsAlopex = null;

function NativeUIExtension() {
	nativeUIExtension = this;
}

NativeUIExtension.prototype.showMultiSelect = function(selection) {
	if(isValid(selection)) {
		if(multiSelectedItemsAlopex == null) {
			multiSelectedItemsAlopex = selection.items;
		} else {
			selection.items = multiSelectedItemsAlopex;
		}
		selection.callback = "nativeUIExtension.multiSelectCallback";
		nativeUI.showMultiSelect(selection);
	}
};

NativeUIExtension.prototype.showSingleSelect = function(selection) {
	if(isValid(selection)) {
		if(singleSelectedIndexAlopex != -1) {
			selection.defValue = singleSelectedIndexAlopex;
		}
		selection.callback = "nativeUIExtension.singleSelectCallback";
		nativeUI.showSingleSelect(selection);
	}
};

NativeUIExtension.prototype.multiSelectCallback = function(selectedItems) {
	for( var item in multiSelectedItemsAlopex) {
		for(key in multiSelectedItemsAlopex[item]) {
			multiSelectedItemsAlopex[item][key] = selectedItems[item];
		}
	}
};

NativeUIExtension.prototype.singleSelectCallback = function(selectedIndex) {
	singleSelectedIndexAlopex = selectedIndex;
};

var nativeUIExtension;