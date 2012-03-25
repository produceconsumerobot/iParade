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
    PhoneGap.exec(null, null, "VideoPlayer", "playVideo", [url]);
};

/**
 * Load VideoPlayer
 */
PhoneGap.addConstructor(function() {
    if (device.platform.toLowerCase().search("android") >= 0) {
        PhoneGap.addPlugin("videoPlayer", new VideoPlayer());
    }
});


function showVideo2(url) {
	window.plugins.videoPlayer.play(url);
}