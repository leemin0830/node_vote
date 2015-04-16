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
var imported = document.createElement('script');
try {
	deviceJSNI.getOsName();
	var currentHtmlPath = location.pathname.replace("//", "/");
	imported.src = currentHtmlPath.substring(0, currentHtmlPath.indexOf("www") + 3) + "/js/lib/alopex/alopex_controller_android.js";
	document.head.appendChild(imported);
} catch(e) {
	if(navigator.userAgent.search("Chrome") >= 0 || (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0)) { // Chrome
																																				// ||
																																				// Apple
																																				// Safari
		imported.src = location.pathname.substring(0, location.pathname.indexOf("www") + 3) + "/js/lib/alopex/alopex_controller_web.js";
		document.head.appendChild(imported);
	} else {
		(function() {
			var timer = setInterval(function() {
				if(DeviceInfo.osName != null) {
					clearInterval(timer); // stop looking
					
					if(DeviceInfo.osName == "iOS") {
						imported.src = location.pathname.substring(0, location.pathname.indexOf("www") + 3) + "/js/lib/alopex/alopex_controller_ios.js";
						document.head.appendChild(imported);
					}
				}
			}, 1);
		})();
	}
}