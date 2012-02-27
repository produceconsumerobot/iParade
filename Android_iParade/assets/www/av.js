var loopingAudio = false;
var _position = -1;
var _duration = -1;


// Plays a video
function playVideo() {
	if (vidPath == null) {
		alert('Video Not Found.');
	} else {
		pauseAudio();
		showVideo2(vidPath);
	}
	document.getElementById("nextButton").style.visibility="visible";
	// play the locally stored video
}

// Audio player
//
// Play audio
//
function playAudio(src) {
	// Create Media object from src
	console.log("playAudio: " + src);
	my_audio = new Media(src, onSuccess, onError);

	// Play audio
	my_audio.play();

	// Update my_audio position every second
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
								console.log("AudioPosition: " + my_audio._position);
								console.log("AudioDuration: " + my_audio._duration);
								
								checkAudioLoop();
							}
						},
						// error callback
						function(e) {
							console.log("Error getting pos=" + e);
							setAudioPosition("Error: " + e);
						}
				);
			}
		}, 500);
	}
}

// onSuccess Callback
//
function onSuccess() {
	console.log("playAudio():Audio Success");
	//_duration = 
}

// onError Callback 
//
function onError(error) {
	alert( 'Audio Error:\n' +
			'code: '    + error.code    + '\n' + 
			'message: ' + error.message + '\n');
	if (my_audio) {
		my_audio.stop();
		my_audio.release();
	}
	my_audio = null;
	audioTimer = null;
}

// Set audio position
// 
function setAudioPosition(position) {
	document.getElementById('audio_position').innerHTML = position;
}

// Pause audio
// 
function pauseAudio() {
	if (my_audio) {
		my_audio.pause();
	}
}

// Stop audio
// 
function stopAudio() {
	if (my_audio) {
		my_audio.stop();
	}
	clearInterval(audioTimer);
	audioTimer = null;
}


function getVideo(targetNumber) {
	var remoteFile = contentVideoDir + targetNumber + "_video" + vidExt;
	var localPath = storageBase + localDir;
	var localFile = localPath + "/" + localVidName;

	if (DEBUG > 0) alert("targetNumber=" + targetNumber);

	var fileTransfer = new FileTransfer();

	fileTransfer.download(
			remoteFile,
			localFile,
		    function(entry) {
		        console.log("download complete: " + entry.fullPath);
		        document.getElementById("playVideoButton").childNodes[0].nodeValue="Play Video";
				document.getElementById("playVideoButton").onclick=function(){ playVideo(); };
				vidPath = localFile;
		    },
		    function(error) {
		        console.log("download error source " + error.source);
		        console.log("download error target " + error.target);
		        console.log("upload error code" + error.code);
		    }
		);
	
//	var params = new Object;
//	params.overwrite = true;
//	params.dirName = localPath;
//	params.fileName = localVidName;
	
	//download(filename, {overwrite: true, dirName: "/mnt/sdcard/download", fileName: "test.jpg"}, function(res) { alert(JSON.stringify(result));}, function(error) {alert(error); } );
//	download(filename, params, 
//			function(res) { 
//		if (res.status == 1) {
//			document.getElementById("playVideoButton").childNodes[0].nodeValue="Play Video";
//			document.getElementById("playVideoButton").onclick=function(){ playVideo(); };
//			vidPath = storageBase + localDir + "/" + localVidName;
//			//document.getElementById("playVideoButton").style.backgroundColor="#999999";
//		}
//	}, 
//	function(error) {alert('Video download failed: ' + error); } );	
}

function getVoiceover(targetNumber) {
	var filename = contentVoiceoverDir + targetNumber + "_voiceover" + voiceoverExt;

	var playRemoteAudio = true;

	if (playRemoteAudio) {
		if (voiceover) {
			voiceoverPath = filename;
			if (voiceoverPath) {
				playAudio(voiceoverPath);
			}
		}
	} else {
		var params = new Object;
		params.overwrite = true;
		params.dirName = storageBase + localDir;
		params.fileName = localVoiceoverName;

		if (DEBUG > 0) alert("targetNumber=" + targetNumber);

		//download(filename, {overwrite: true, dirName: "/mnt/sdcard/download", fileName: "test.jpg"}, function(res) { alert(JSON.stringify(result));}, function(error) {alert(error); } );
		download(filename, params, 
				function(res) { 
			if (res.status == 1) {
				document.getElementById("playVideoButton").childNodes[0].nodeValue="Play Video";
				document.getElementById("playVideoButton").onclick=function(){ playVideo(); };
				voiceoverPath = localDir + localVoiceoverName;
				//playAudio("/android_asset/www/" + localVoiceoverName);
				playAudio(storageBase + localVoiceoverName);

				//playAudio(voiceoverPath);
				//playAudio(filename);
				//document.getElementById("playVideoButton").style.backgroundColor="#999999";
			}
		}, 
		function(error) {
			if (DEBUG > 0) {
				alert(error + ": " + filename); 
			} else {
				alert("Error: " + error);
			}
		}
		);	
	}
}


function getAudioTheme() {
	var filename = contentAudioTheme + voiceoverExt;

	var playRemoteAudio = true;
	
	loopingAudio = true;

	if (playRemoteAudio) {
		audioThemePath = filename;
		if (audioThemePath) {
			playAudio(audioThemePath);
		}
	} 
}

function startAudioLooper() {
	if (audioLooperTimerId == null) {
		audioLooperTimerId = setInterval(
				"updateLocation(targetLocations[targetNum])", 500);
	}
}

function checkAudioLoop() {
	console.log("checkAudioLoop:");
	if (loopingAudio) {
		//console.log("checkAudioLoop: loopingAudio");
		if (my_audio){
			//console.log("checkAudioLoop: my_audio");
			if ((my_audio._duration > -1) && (my_audio._position > -1)) {
				//console.log("checkAudioLoop: duration/position");
				if ((my_audio._duration - my_audio._position) < 1.0){
					console.log("checkAudioLoop: seekTo");
					my_audio.seekTo(0);
				}
			}
		}
	}
}

