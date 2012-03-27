var loopingAudio = false;
var _position = -1;
var _duration = -1;
var vidDownloadComplete = false;
var maxTries = 10;
var tryDelay = 1000;
var localVidPath = null;

// Plays a video
function playVideo() {
	console.log("playVideo()");
	if ((localVidPath == null) || (!vidDownloadComplete)) {
		alert('Video Not Found.');
	} else {
		//pauseAudio();
		stopAudio();
		if (device.platform.toLowerCase().search("android") >= 0) {
			showVideo2(localVidPath); // play the locally stored video
		}
	}
	setTimeout(function() { document.getElementById("nextButton").style.visibility="visible"; }, 500);
	//document.getElementById("nextButton").style.visibility="visible";
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
		releaseAudio();
		//_duration = 
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

function displayVidElement() {
	console.log("displayVidElement()");
	if (vidDownloadComplete && !checkingForTargetLocation) {
		console.log("displaying Video element");

		$("#playVideoButton #downloadingImg").css("display", "none");
	    
	    // Check if the device supports video
	    var vidTest = $("#playVid");
	    if (vidTest.canPlayType && vidTest.canPlayType('video/mp4').replace(/no/, '')) {
	    	// Video supported!!
	    	setTimeout(function() { $("#playVideoButton #playVid").css("display", "block"); }, 1000);	
	    	vidTest.children("source").attr("src", localVidPath);
	    } else {
	    	// Video not supported :(
	    	setTimeout(function() { $("#playVideoButton #playImg").css("display", "block"); }, 1000);
	    	document.getElementById("playVideoButton").ontouchstart=function(){ playVideo(); };
	    }
	}
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
}


function getAudioTheme() {
	console.log("getAudioTheme()");
	var filename = remoteContentDir + remoteAudioThemeBase + audioThemeExt;

	loopingAudio = true;
	
	playAudio(filename);
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
					console.log("checkAudioLoop: seekTo");
					my_audio.seekTo(0);
				}
			}
		}
	}
}

