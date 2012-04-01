var loopingAudio = false;
var _position = -1;
var _duration = -1;
var vidDownloadComplete = false;
var audioThemeDownloadComplete = false;
var maxTries = 10;
var tryDelay = 1000;
var localVidPath = null;
var localAudioThemePath = null;

// Plays a video
function playVideo() {
	console.log("playVideo()");
	if ((localVidPath == null) || (!vidDownloadComplete)) {
		navigator.notification.alert('Video Not Found.');
	} else {
		//pauseAudio();
		releaseAudio();
		//stopAudio();
		if (device.platform.toLowerCase().search("android") >= 0) {
			showVideo2(localVidPath); // play the locally stored video
		} else {
            // Video supported!!
            console.log("Creating video element: " + localVidPath);
            
            var html = "";
            //html = html + "<div ontouchstart='showNextButton();'>";
            html = html + "<video id='playVid' controls='controls' autoplay='autoplay' >";
            html = html + "<source src='" + localVidPath + "' type='video/mp4' /></video>"; 
            //html = html + "</div>";
            
            $("#playVideoButton").html(html);
            
            //setTimeout(function() { console.log("full screen"); document.getElementById("playVideoButton").webkitRequestFullScreen(); }, 5000);
            
            //$("#playVid")[0].webkitEnterFullScreen();
        } 
	} 
	//document.getElementById("nextButton").style.visibility="visible";
    console.log("playVideo finished");
}

// Audio player
//
// Play audio
//
function playAudio(src) {
	console.log("playAudio: " + src);
	
	// onSuccess Callback
	function onSuccess() {
		console.log("playAudio():Audio Success");
//		if (loopingAudio) {
//			playAudio(src);
//		}
		//releaseAudio();
	}

	// onError Callback 
	function onError(error) {
		console.error( 'Audio Error:\n' +
				'code: '    + error.code    + '\n' + 
				'message: ' + error.message + '\n');
		releaseAudio();
	}
	
	// Create Media object from src
	my_audio = new Media(src, onSuccess, onError);

	// Play audio
	console.log("my_audio.play()");
	my_audio.play();

	// Update my_audio position
	if (audioTimer == null) {
		audioTimer = setInterval(function() {
			if (my_audio) {
				// get my_audio position
				my_audio.getCurrentPosition(
						// success callback
						function(position) {
							console.log("getCurrentPosition: success");
							if (position > -1) {
								//setAudioPosition((position) + " sec");
								if ((position % 5) < 1) { // Write to the console infrequently
									console.log("AudioPosition: " + my_audio._position + " / " + my_audio._duration);
								}
								checkAudioLoop();
							}
						},
						// error callback
						function(e) {
							console.log("Error getting pos=" + e);
						}
				);
			}
		}, 500);
	}
    console.log("playAudio finished");
}

// Pause audio
// 
function pauseAudio() {
	console.log("pauseAudio()");
	if (my_audio) {
		my_audio.pause();
	}
}

// Stop audio
// 
function stopAudio() {
	console.log("stopAudio()");
	if (my_audio) {
		my_audio.stop();
	}
	if (audioTimer) {
		clearInterval(audioTimer);
	}
	audioTimer = null;
}

function releaseAudio() {
	console.log("releaseAudio()");
	stopAudio();
	if (my_audio) {
		my_audio.release();
	}
	my_audio = null;
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
		localVidPath = localContentDir + "/" + localVidBase + vidExt;
		//var localPath = storageBase + localDir;
		
		vidDownloadComplete = false;
	
		var fileTransfer = new FileTransfer();
		fileTransfer.download(
				remoteFile,
				localVidPath,
			    function(entry) {
					console.log("download complete: " + entry.fullPath);
	
					//localVidPath = localFile;
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

function getVoiceover(targetNumber) {
	console.log("getVoiceover(" + targetNumber + ")");
	var filename = remoteContentDir + targetNumber + "_voiceover" + voiceoverExt;

	var playRemoteAudio = true;

	if (playRemoteAudio) {
		if (voiceover) {
			playAudio(filename);
		}
	} 
    console.log("getVoiceover finished");
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
		localAudioThemePath = localContentDir + "/" + localAudioThemeBase + audioThemeExt;
		//var localPath = storageBase + localDir;
		
		audioThemeDownloadComplete = false;
	
		var fileTransfer = new FileTransfer();
		fileTransfer.download(
				remoteFile,
				localAudioThemePath,
			    function(entry) {
					console.log("download complete: " + entry.fullPath);
	
					//localVidPath = localFile;
					audioThemeDownloadComplete = true;
					playAudioTheme();
					showNextButton(0);
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
    console.log("getVideo finished");
}

function playAudioTheme() {
	console.log("playAudioTheme()");
	
	if ((audioThemeDownloadComplete) && (localAudioThemePath)) {
		loopingAudio = true;
        if (device.platform.toLowerCase().search("android") >= 0) {
            playAudio(localDir + "/" + localAudioThemeBase + audioThemeExt);
        } else {
            playAudio(localAudioThemePath);
        }
	}
	
//	var filename = remoteContentDir + remoteAudioThemeBase + audioThemeExt;
//	loopingAudio = true;
//	playAudio(filename);
	
    console.log("playAudioTheme finished");
}

//function startAudioLooper() {
//	console.log("startAudioLooper()");
//	if (audioLooperTimerId == null) {
//		audioLooperTimerId = setInterval(
//				"updateLocation(targetLocations[targetNum])", 500);
//	}
//}

function checkAudioLoop() {
	//console.log("checkAudioLoop:");
	if (loopingAudio) {
		//console.log("checkAudioLoop: loopingAudio");
		if (my_audio){
			//console.log("checkAudioLoop: my_audio");
			if ((my_audio._duration > -1) && (my_audio._position > -1)) {
				//console.log("checkAudioLoop: duration/position");
				if ((my_audio._duration - my_audio._position) < 1.5){
					console.log("checkAudioLoop: seekTo 1");
					my_audio.seekTo(1);
				}
			}
		}
	}
}

