var vidDownloadComplete = false;
var audioThemeDownloadComplete = false;
var voiceoverDownloadComplete = false;
var videoFileTransfer = null;
var audioThemeFileTransfer = null;
var voiceoverFileTransfer = null;

//Plays a video
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
			console.log("showVideo2(" + localContentDir + "/" + localVidBase + vidExt + ")");
			showVideo2(localContentDir + "/" + localVidBase + vidExt); // play the locally stored video
		} else {
			// Video supported!!
			console.log("Creating video element: " + localContentDir + "/" + localVidBase + vidExt);

			var html = "";
			html = html + "<video id='playVid' controls='controls' autoplay='autoplay' >";
			html = html + "<source src='" + localContentDir + "/" + localVidBase + vidExt + "' type='video/mp4' /></video>"; 

			//var html = "";
			//html = html + "<video id='playVid' controls='controls' src='" + localContentDir + "/" + localVidBase + vidExt + "'>";
			//html = html + "</video>";
			//html = html + "<source src='" + localContentDir + "/" + localVidBase + vidExt + "' type='video/mp4' /></video>"; 


			$("#playVideoButton").html(html);

			//setTimeout(function() {vidPrepFullScreen();}, 750);
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

function getVideo(targetNumber) {
	console.log("getVideo(" + targetNumber + ")");

	vidDownloadComplete = false;	

	var remoteFile = remoteContentDir + targetNumber + "_video" + vidExt;
	var localFile = localContentDir + "/" + localVidBase + vidExt;

	if (videoFileTransfer) {
		videoFileTransfer.cancel();
	}
	videoFileTransfer = new FileTransferRepeater(remoteFile, localFile, 
			function (entry) {
		console.log("getVideo download complete: " + entry.fullPath);

		videoFileTransfer.cancel();
		videoFileTransfer = null;
		vidDownloadComplete = true;
		displayVidElement();
	}
	);
	videoFileTransfer.download();
	console.log("getVideo() finished");
}

function playAudioTheme() {
	console.log("playAudioTheme()");

	if (audioThemeDownloadComplete) {
		if (themeAudioPlayer) {
			themeAudioPlayer.release();
		}
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

function getAudioTheme() {
	console.log("getAudioTheme()");

	audioThemeDownloadComplete = false;

	var remoteFile = remoteContentDir + remoteAudioThemeBase + audioThemeExt;
	var localFile = localContentDir + "/" + localAudioThemeBase + audioThemeExt;

	if (audioThemeFileTransfer) {
		audioThemeFileTransfer.cancel();
	}
	audioThemeFileTransfer = new FileTransferRepeater(remoteFile, localFile, 
			function (entry) {
		console.log("getAudioTheme download complete: " + entry.fullPath);

		audioThemeFileTransfer.cancel();
		audioThemeFileTransfer = null;
		audioThemeDownloadComplete = true;
		playAudioTheme();
		hideDownloadingImg(0);
		showNextButton(500);
	}
	);
	audioThemeFileTransfer.download();
	console.log("getAudioTheme() finished");
}

function playVoiceover() {
	console.log("playVoiceover()");

	if (voiceoverDownloadComplete && !checkingForTargetLocation) {
		if (voiceover) {
			if (voicoverAudioPlayer) {
				voicoverAudioPlayer.release();
			}
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

function getVoiceover(targetNumber) {
	console.log("getVoiceover(" + targetNumber + ")");

	voiceoverDownloadComplete = false;

	var remoteFile = remoteContentDir + targetNumber + remoteVoiceOverBase + voiceoverExt;
	var localFile = localContentDir + "/" + localVoiceoverBase + voiceoverExt;
	
	if (voiceoverFileTransfer) {
		voiceoverFileTransfer.cancel();
	}
	voiceoverFileTransfer = new FileTransferRepeater(remoteFile, localFile, 
			function (entry) {
		console.log("getVoiceover download complete: " + entry.fullPath);

		voiceoverFileTransfer.cancel();
		voiceoverFileTransfer = null;
		voiceoverDownloadComplete = true;
		playVoiceover();
	}
	);
	voiceoverFileTransfer.download();
	console.log("getVoiceover() finished");
}
