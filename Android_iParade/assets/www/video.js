/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

/**
 * Constructor
 */
function VideoPlayer() {
};

/**
 * Starts the video player intent
 *
 * @param url           The url to play
 */
VideoPlayer.prototype.play = function(url) {
	console.log("VideoPlayer.prototype.play()");
    //PhoneGap.exec(null, null, "VideoPlayer", "playVideo", [url]);
    cordova.exec(null, null, "VideoPlayer", "playVideo", [url]);
};

/**
 * Load VideoPlayer
 */
PhoneGap.addConstructor(function() {
//cordova.addConstructor(function() {
	console.log("cordova.addConstructor()");
	
	try {
		console.log("cordova.addConstructor: PhoneGap.addPlugin('videoPlayer', new VideoPlayer());");
		cordova.addPlugin("videoPlayer", new VideoPlayer());
	} catch (err){
		console.log("cordova.addConstructor: caught error, " + err);
	}
	
//	if (device && device.platform) {
//		if (device.platform.toLowerCase().search("android") >= 0) {
//	    	console.log("cordova.addConstructor: PhoneGap.addPlugin('videoPlayer', new VideoPlayer());");
//	    	//PhoneGap.addPlugin("videoPlayer", new VideoPlayer());
//	    	cordova.addPlugin("videoPlayer", new VideoPlayer());
//		}
//    } else {
//    	console.log("cordova.addConstructor: device.platform not found");
//    }
});


function showVideo2(url) {
	window.plugins.videoPlayer.play(url);
}