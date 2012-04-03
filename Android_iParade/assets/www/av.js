var vidDownloadComplete = false;
var audioThemeDownloadComplete = false;
var voiceoverDownloadComplete = false;

// Plays a video
function playVideo() {
	console.log("playVideo()");
	if (!vidDownloadComplete) {
		navigator.notification.alert('Video Not Found.');
	} else {
		if (voicoverAudioPlayer) {
			voicoverAudioPlayer.release();
			voicoverAudioPlayer = null;
		}			
		if (themeAudioPlayer) {
			themeAudioPlayer.release();
			themeAudioPlayer = null;
		}
		if (device.platform.toLowerCase().search("android") >= 0) {
			showVideo2(localContentDir + "/" + localVidBase + vidExt); // play the locally stored video
		} else {
            // Video supported!!
            console.log("Creating video element: " + localContentDir + "/" + localVidBase + vidExt);
            
            var html = "";
            html = html + "<video id='playVid' controls='controls' autoplay='autoplay' >";
            html = html + "<source src='" + localContentDir + "/" + localVidBase + vidExt + "' type='video/mp4' /></video>"; 
            
            $("#playVideoButton").html(html);
            setTimeout(function() {vidPrepFullScreen();}, 750);
        } 
	} 
    console.log("playVideo finished");
}

function vidPrepFullScreen(nthTry) {
	console.log("vidPrepFullScreen()");
	
	// function to try to add again
	function tryAgain(ntry) {
		if (ntry < maxTries) {
			// Wait and try try again...
	        setTimeout(function() { vidPrepFullScreen(ntry);}, ntry*tryDelay/4);
		}
	}
	
	// nthTry keeps track of number of attempts
	if (!nthTry) {
		nthTry = 1;
	} else {
		nthTry++;
	}	
	
    var vid = $("#playVid");
    if (vid) {
    	console.log("vid.addEventListener: loadedmetadata");
    	vid.addEventListener("loadedmetadata", vidFullscreen, false);
    } else {
    	console.log("#playVid not found, tries=" + nthTry);
    	tryAgain(nthTry);
    }
    console.log("vidPrepFullScreen() finished");
}

function vidFullscreen(){
	console.log("vidFullscreen()");
	var vid = $("#playVid");
    if (vid && vid.webkitSupportsFullscreen) {
    	console.log("vid.webkitEnterFullscreen()");
    	vid.webkitEnterFullscreen();
    }
    console.log("vidFullscreen() finished");
}

function getVideo(targetNumber, nthTry) {
	console.log("getVideo(" + targetNumber + ")");

	// function to try to get video again
	function tryAgain(tnum, ntry) {
		if (ntry < maxTries) {
			// Wait and try try again...
	        setTimeout(function() { getVideo(tnum, ntry);}, ntry*tryDelay);
		}
	}
	
	// nthTry keeps track of number of attempts
	if (!nthTry) {
		nthTry = 1;
	} else {
		nthTry++;
	}
	
	// If localContentDir isn't set yet, try again
	if (!localContentDir) {
		tryAgain(targetNumber, nthTry);
	} else {
		var remoteFile = remoteContentDir + targetNumber + "_video" + vidExt;
		var localFile = localContentDir + "/" + localVidBase + vidExt;
		
		vidDownloadComplete = false;
	
		var fileTransfer = new FileTransfer();
		fileTransfer.download(
				remoteFile,
				localFile,
			    function(entry) {
					console.log("download complete: " + entry.fullPath);
	
					vidDownloadComplete = true;
					displayVidElement();
			    },
			    function(error) {
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			        // Try try again...
			        tryAgain(targetNumber, nthTry);	
			    }
			);
	}
    console.log("getVideo finished");
}



function playAudioTheme() {
	console.log("playAudioTheme()");
	
	if (audioThemeDownloadComplete) {
        if (device.platform.toLowerCase().search("android") >= 0) {
        	themeAudioPlayer = new AudioPlayer(localDir + "/" + localAudioThemeBase + audioThemeExt);
        	themeAudioPlayer.looping(true);
        	themeAudioPlayer.play();
        } else {
        	themeAudioPlayer = new AudioPlayer(localContentDir + "/" + localAudioThemeBase + audioThemeExt);
        	themeAudioPlayer.looping(true);
        	themeAudioPlayer.play();
        }
	}
	
    console.log("playAudioTheme finished");
}

function getAudioTheme(nthTry) {
	console.log("getAudioTheme()");

	// function to try to get audio theme again
	function tryAgain(ntry) {
		if (ntry < maxTries) {
			// Wait and try try again...
	        setTimeout(function() { getAudioTheme(ntry);}, ntry*tryDelay/2);
		}
	}
	
	// nthTry keeps track of number of attempts
	if (!nthTry) {
		nthTry = 1;
	} else {
		nthTry++;
	}
	
	// If localContentDir isn't set yet, try again
	if (!localContentDir) {
		tryAgain(nthTry);
	} else {
		var remoteFile = remoteContentDir + remoteAudioThemeBase + audioThemeExt;
		var localFile = localContentDir + "/" + localAudioThemeBase + audioThemeExt;
		
		audioThemeDownloadComplete = false;
	
		var fileTransfer = new FileTransfer();
		fileTransfer.download(
				remoteFile,
				localFile,
			    function(entry) {
					console.log("download complete: " + entry.fullPath);
	
					audioThemeDownloadComplete = true;
					playAudioTheme();
					hideDownloadingImg(0);
					showNextButton(500);
			    },
			    function(error) {
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			        // Try try again...
			        tryAgain(nthTry);	
			    }
			);
	}
    console.log("getAudioTheme finished");
}

function playVoiceover() {
	console.log("playVoiceover()");
	
	if (voiceoverDownloadComplete && !checkingForTargetLocation) {
		if (voiceover) {
			if (device.platform.toLowerCase().search("android") >= 0) {
				voicoverAudioPlayer = new AudioPlayer(localDir + "/" + localVoiceoverBase + voiceoverExt);
				voicoverAudioPlayer.play();
			} else {
				voicoverAudioPlayer = new AudioPlayer(localContentDir + "/" + localVoiceoverBase + voiceoverExt);
				voicoverAudioPlayer.play();
			}
		}
	}

    console.log("playVoiceover finished");
}

function getVoiceover(targetNumber, nthTry) {
	console.log("getVoiceover(" + targetNumber + ")");

	// function to try to get audio theme again
	function tryAgain(ntry) {
		if (ntry < maxTries) {
			// Wait and try try again...
	        setTimeout(function() { getVoiceover(targetNumber, ntry);}, ntry*tryDelay/2);
		}
	}
	
	// nthTry keeps track of number of attempts
	if (!nthTry) {
		nthTry = 1;
	} else {
		nthTry++;
	}
	
	// If localContentDir isn't set yet, try again
	if (!localContentDir) {
		tryAgain(nthTry);
	} else {
		var remoteFile = remoteContentDir + targetNumber + remoteVoiceOverBase + voiceoverExt;
		var localFile = localContentDir + "/" + localVoiceoverBase + voiceoverExt;
		
		voiceoverDownloadComplete = false;
	
		var fileTransfer = new FileTransfer();
		fileTransfer.download(
				remoteFile,
				localFile,
			    function(entry) {
					console.log("download complete: " + entry.fullPath);
	
					voiceoverDownloadComplete = true;
					playVoiceover();
			    },
			    function(error) {
			        console.log("download error source " + error.source);
			        console.log("download error target " + error.target);
			        console.log("upload error code" + error.code);
			        // Try try again...
			        tryAgain(nthTry);	
			    }
			);
	}
    console.log("getVoiceover finished");
}

