var DEBUG = 0;

var tabLinks = new Array();
var contentDivs = new Array();
var contentPage = 0;

var targetLocations = new Array(); // array of TargetLocations for this parade
var currentLoc = null; // where the device is currently
var targetNum = 0; // which target is currently being sought after
var nTargets = 3; // number of targets
var locCheckTimerId = null; // timer ID
var updateLocationTimerId = null; // timer ID
var checkingForTargetLocation = false; 
var startTabsTimerId = null; // timer ID
var testLocChangeTimerId = null; // timer ID
//var contentImageDir = "./content/"; // content images directory
var contentImageDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var contentVideoDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var storageBase = "/mnt/sdcard/";
var localDir = "download/";
var localVidBase = "iparadeVideo";
var vidExt = ".3gp";
var localVidName = localVidBase + vidExt;
var localVidPath = null;

var voiceOver = true;
var contentVoiceoverDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var localVoiceoverBase = "iparadeVoiceover";
var voiceoverExt = ".mp3";
var localVoiceoverName = localVoiceoverBase + voiceoverExt;
var voiceoverPath = null;
var my_audio = null;
var audioTimer = null;

var fakeGPS = true; // for debugging




// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
function onDeviceReady() {
	//updateLocation();
	//initializeMap();
	//showTab();
	document.addEventListener("online", onOnline, false);
}

// Handle the online event
//
function onOnline() {
}

// Alert to notify user that they are offline
function offlineAlert() {
	altert('You are currently offline. Please connect to the internet to continue.');
	//confirm();
}

function getVideo(targetNumber) {
	var filename = contentVideoDir + targetNumber + "_video" + vidExt;
	var params = new Object;
	params.overwrite = true;
	params.dirName = storageBase + localDir;
	params.fileName = localVidName;

	if (DEBUG > 0) alert("targetNumber=" + targetNumber);

	//download(filename, {overwrite: true, dirName: "/mnt/sdcard/download", fileName: "test.jpg"}, function(res) { alert(JSON.stringify(result));}, function(error) {alert(error); } );
	download(filename, params, 
			function(res) { 
		if (res.status == 1) {
			document.getElementById("playVideoButton").childNodes[0].nodeValue="Play Video";
			document.getElementById("playVideoButton").onclick=function(){ playVideo(); };
			vidPath = storageBase + localDir + "/" + localVidName;
			//document.getElementById("playVideoButton").style.backgroundColor="#999999";
		}
	}, 
	function(error) {alert(error); } );	
}

function getVoiceover(targetNumber) {
	var filename = contentVoiceoverDir + targetNumber + "_voiceover" + voiceoverExt;

	var playRemoteAudio = true;

	if (playRemoteAudio) {
		if (voiceOver) {
			voiceoverPath = filename;
		}
		if (voiceoverPath) {
			playAudio(voiceoverPath);
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


// Location constuctor
function Location(latitude, longitude) {
	this.lat = latitude;
	this.lon = longitude;
}

// TargetLocation Constructor
// includes: a Location and an acceptable deviation
// may specify a rectangle in future
function TargetLocation(location, deviation) {
	this.loc = location; //new Location(location.lat, location.lon);
	this.dev = deviation;
}

// This is just a test
function testLocChangeTimer() {
	if (testLocChangeTimerId != null) {
		clearTimeout(testLocChangeTimerId);
	}
	testLocChangeTimerId = setTimeout("testLocChange()", 4500);	
	//alert("targetNum = " + targetNum);
}
function testLocChange() {
	currentLoc = targetLocations[targetNum].loc;
}


// increment to the next TargetLocation
function incrementTarget() {
	if ((targetNum + 1) < nTargets) {
		targetNum++;
	}
	if (DEBUG > 0) alert("targetNum=" + targetNum);
}	

function mouseDown() {
	document.getElementById("tabs").style.display="inline";
	startTabsTimer();
}

// Shows the tabs for the brief period and then hides them
function startTabsTimer() {
	if (startTabsTimerId != null) {
		clearTimeout(startTabsTimerId);
	}
	startTabsTimerId = setTimeout("hideTabs()", 2000);		
}
function hideTabs() {
	document.getElementById("tabs").style.display="none";
}


// This is a timer used in place of changing GPS locations
function startUpdateLocationTimer() {
	if (updateLocationTimerId == null) {
		updateLocationTimerId = setInterval("updateLocation()", 500);
	}
}
function clearUpdateLocationTimer() {
	if (updateLocationTimerId != null) {
		clearInterval(updateLocationTimerId);
		updateLocationTimerId = null;
	}
}

// Updates the current GPS location and performs checks
function updateLocation() {
	// TODO: read from GPS
	if (currentLoc == null) {
		//alert("currentLoc == null");
		currentLoc = new Location(0.506185, 0.553519);
	}

	if (checkingForTargetLocation) {
		if (inTargetLocation(currentLoc, targetLocations[targetNum])) {
			//alert("locationCheck true");
			checkingForTargetLocation = false;
			nextPage();
		}	
	}		

}

// Lookup the targetLocations
// Currently all locations are hard-coded
// In the future locations may be aquired via remote lookup
function getTargetLocations(currentLocation) {
	// This would ideally read from a remote server

	var deviation = 0.01;
	targetLocations[0] = new TargetLocation(new Location(40.606185, -73.453519), deviation);
	targetLocations[1] = new TargetLocation(new Location(40.806185, -73.953519), deviation);		
	targetLocations[2] = new TargetLocation(new Location(40.506185, -73.553519), deviation);		
	//alert("getTargetLocations: " + targetLocations[0].loc.lat);
}

// Check if the current GPS location is within the passed target location
function inTargetLocation(currentLocation, targetLocation) {
	//alert("currentLoc=" + currentLocation.lat + ", " + currentLocation.lon);
	//return false;
	if ((currentLocation.lat > (targetLocation.loc.lat - targetLocation.dev)) &&
			(currentLocation.lat < (targetLocation.loc.lat + targetLocation.dev)) &&
			(currentLocation.lon > (targetLocation.loc.lon - targetLocation.dev)) &&
			(currentLocation.lon < (targetLocation.loc.lon + targetLocation.dev))) {
		return true;
	} else {
		return false;
	}

}

// Initializes the page
function init() {
	// Wait for PhoneGap to load
	document.addEventListener("deviceready", onDeviceReady, false);

	contentPage = 0;
	getTargetLocations(currentLoc);
	startUpdateLocationTimer();
	//updateLocationTimer();
	document.getElementById('home').innerHTML = getHomeContent(contentPage);

	//$("div.tabContent").css(".min-height", getWindowHeight());
	// Grab the tab links and content divs from the page
	var tabListItems = document.getElementById('tabs').childNodes;
	for ( var i = 0; i < tabListItems.length; i++ ) {
		if ( tabListItems[i].nodeName == "LI" ) {
			var tabLink = getFirstChildWithTagName( tabListItems[i], 'A' );
			var id = getHash( tabLink.getAttribute('href') );
			tabLinks[id] = tabLink;
			contentDivs[id] = document.getElementById( id );
			contentDivs[id].style.height = getWindowHeight() + "px";
		}
	}
	
	//updateLocation();
	initializeMap();
	//showTab();

	// Assign onclick events to the tab links, and
	// highlight the first tab
	var i = 0;

	for ( var id in tabLinks ) {
		tabLinks[id].onclick = showTab;
		tabLinks[id].onfocus = function() { this.blur(); };
		if ( i == 0 ) tabLinks[id].className = 'selected';
		i++;
	}

	// Hide all content divs except the first
	var i = 0;

	for ( var id in contentDivs ) {
		if ( i != 0 ) contentDivs[id].className = 'tabContent hide';
		i++;
	}
}

// Show a tab
function showTab() {
	var selectedId = getHash( this.getAttribute('href') );

	//document.getElementById('about').style.height = getWindowHeight();

	// Highlight the selected tab, and dim all others.
	// Also show the selected content div, and hide all others.
	for ( var id in contentDivs ) {
		if ( id == selectedId ) {
			switch (selectedId) {
			case 'map':
				//var loc = new Location(40.806185, -73.953519);
				//document.getElementById('map').innerHTML = getMap(currentLoc);
				//initializeMap();
				break;
			case 'notes':
				document.getElementById('home').innerHTML = getHomeContent(contentPage);
				break;
			default:
			}     


			tabLinks[id].className = 'selected';
			contentDivs[id].className = 'tabContent';

			//document.getElementById('home').style.height = getWindowHeight();
		} else {
			tabLinks[id].className = '';
			contentDivs[id].className = 'tabContent hide';
		}
	}
	contentDivs[selectedId].style.height = getWindowHeight() + "px";

	// Stop the browser following the link
	return false;
}

function getFirstChildWithTagName( element, tagName ) {
	for ( var i = 0; i < element.childNodes.length; i++ ) {
		if ( element.childNodes[i].nodeName == tagName ) return element.childNodes[i];
	}
}

function getHash( url ) {
	var hashPos = url.lastIndexOf ( '#' );
	return url.substring( hashPos + 1 );
}

// Returns the height of the current window
// ** May need some finesse for different platforms **
function getWindowHeight() {
	var w = 0;
	var w1 = 0;
	var w2 = 0;
	var w3 = 0;

	if (document.body.clientHeight != null) {
		w1 = document.body.clientHeight;
	}

	if (document.documentElement.clientHeight != null) {
		w2 = document.documentElement.clientHeight;
	}

	if (window.innerHeight != null) {
		w3 = window.innerHeight;
	}

	//w = Math.max(w, w1, w2, w3);
	w = w2;				

	if ((w == null) || (w == 0)) {
		w = "auto";
	}	
	if (DEBUG > 1)  {
		alert ("h1=" + w1 + ", h2=" + w2 + ", h3=" + w3 + ", h=" + w);
	}
	return w + "";
}

// Returns the width of the current window
// ** May need some finesse for different platforms **
function getWindowWidth() {
	var w = 0;
	var w1 = 0;
	var w2 = 0;
	var w3 = 0;

	if (document.body.clientWidth != null) {
		w1 = document.body.clientWidth;
	}

	if (document.documentElement.clientWidth != null) {
		w2 = document.documentElement.clientWidth;
	}

	if (window.innerWidth != null) {
		w3 = window.innerWidth;
	}

	//w = Math.max(w, w1, w2, w3);	
	w = w2;			

	if ((w == null) || (w == 0)) {
		w = "auto";
	}	
	if (DEBUG > 1)  {
		alert ("w1=" + w1 + ", w2=" + w2 + ", w3=" + w3 + ", w=" + w);
	}
	return w + "";
}

// Returns html for a map centered on the current location
function getMap(loc) {
	initializeMap();
	/*
    var latlng = new google.maps.LatLng(loc.lat, loc.lon);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);

		var maphtml = "<div id='map_canvas' style='width:100%; height:100%'></div>";
		return maphtml;
	 */

	/*
		//w = document.getElementById('map').offsetWidth;
		//h = document.getElementById('map').offsetHeight;
		w = getWindowWidth() - getWindowWidth()/8;
		h = getWindowHeight() - 20;
		var map = "<iframe width='" + w + "' height='" + h + "' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' src='http://maps.google.com/?ie=UTF8&amp;ll=" + loc.lat + "," + loc.lon + "&amp;spn=0.035019,0.072098&amp;t=m&amp;z=14&amp;vpsrc=6&amp;output=embed'></iframe>";
		//var map = "<iframe width=\"" + w + "\" height=\"" + h + "\" frameborder=\"0\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\" src=\"http://maps.google.com/maps?q=281+west+119th+street+new+york&amp;ie=UTF8&amp;hq=&amp;hnear=281+W+119th+St,+New+York,+10026&amp;gl=us&amp;z=14&amp;ll=" + loc.lat +"," + loc.lon + "&amp;output=embed\"></iframe>"S;
		//map = "<p>" + w + " " + h + "</p>";
		return map;
	 */


}		
//<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://maps.google.com/?ie=UTF8&amp;ll=40.80387,-73.946571&amp;spn=0.035019,0.072098&amp;t=m&amp;z=14&amp;vpsrc=6&amp;output=embed"></iframe><br /><small><a href="http://maps.google.com/?ie=UTF8&amp;ll=40.80387,-73.946571&amp;spn=0.035019,0.072098&amp;t=m&amp;z=14&amp;vpsrc=6&amp;source=embed" style="color:#0000FF;text-align:left">View Larger Map</a></small>

// Returns html for the home tab based on the value of pageNum	
function getHomeContent(pageNum) {
	var html = "";
	switch (pageNum) {
	case 0:
		html = html + "<h2 align='center'>iParade#2: Unchanged When Exhumed</h2> <p>";
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_mainImage" + ".jpg'>";
		html = html + "<p>This text describes how to experience this app, what do do, where to go etc. </p>";
		html = html + "<button type='button' class='rightFloat button' onclick='nextPage()'>Next</button>";
		html = html +  "<div class='clearBoth'>";
		break;
	case 1:
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_btwImage" + ".jpg'>";
		//html = html + "<p>" + getText() + "</p>";
		//html = html + "<iframe src=\"http://produceconsumerobot.com/temp/lovid/iparade/01.html\"><iframe>";s
		//html = html + "<div src=\"http://produceconsumerobot.com/temp/lovid/iparade/01.html\"><div>";
		//html = html + "<iframe src=\"http://produceconsumerobot.com/temp/lovid/iparade/01.html\" width=\"100%\" height=\"100%\" scrolling=\"no\" frameborder=\"0\" vspace=\"0\" hspace=\"0\" marginwidth=\"0\" marginheight=\"0\" ></iframe>";
		html = html +  "<div class='clearBoth'>";
		checkingForTargetLocation = true;
		if (fakeGPS) testLocChangeTimer();
		break;
	case 2:
		html = html + "<h2 align='center'>Step #1</h2> <p>";
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_mainImage" + ".jpg'>";
		html = html + "<p>Location 1 text invites the viewer to reexamine their relationship to reality and the manner in which their perception reveals the underlying inter-relationship between the objective and subjective universe.</p>";
		html = html + "<button id='playVideoButton' type='button' class='buttonCenter button' >...Downloading Video...</button>";
		html = html + "<button id='nextButton' type='button' class='rightFloat button' onclick='nextPage()' style='visibility:hidden;'>Next</button>";
		html = html +  "<div class='clearBoth'>";
		getVoiceover(targetNum);
		getVideo(targetNum);
		break;
	case 3:
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_btwImage" + ".jpg'>";
		html = html +  "<div class='clearBoth'>";
		checkingForTargetLocation = true;
		if (fakeGPS) testLocChangeTimer();
		break;
	case 4:
		html = html + "<h2 align='center'>Step #2</h2> <p>";
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_mainImage" + ".jpg'>";
		html = html + "<p>Location 2 text describes a magical kingdom where people are inanimate and the universe exists without time or space.</p>";
		html = html + "<button id='playVideoButton' type='button' class='buttonCenter button' >...Downloading Video...</button>";
		html = html + "<button id='nextButton' type='button' class='rightFloat button' onclick='nextPage()' style='visibility:hidden;'>Next</button>";
		html = html +  "<div class='clearBoth'>";
		getVoiceover(targetNum);
		getVideo(targetNum);
		break;
	default:
		break;
	}
	return html;
}

// Plays a video
function playVideo() {
	if (vidPath == null) {
		alert('Video Not Found.');
	} else {
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
			// get my_audio position
			my_audio.getCurrentPosition(
					// success callback
					function(position) {
						if (position > -1) {
							setAudioPosition((position) + " sec");
						}
					},
					// error callback
					function(e) {
						console.log("Error getting pos=" + e);
						setAudioPosition("Error: " + e);
					}
			);
		}, 1000);
	}
}

// onSuccess Callback
//
function onSuccess() {
	console.log("playAudio():Audio Success");
}

// onError Callback 
//
function onError(error) {
	alert('code: '    + error.code    + '\n' + 
			'message: ' + error.message + '\n');
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



// Moves to the next page in the sequence
function nextPage() {
	vidPath = null;
	if (my_audio) {
		my_audio.stop();
		my_audio.release();
	}
	my_audio = null;
	audioTimer = null;
	contentPage = contentPage + 1;
	if ((contentPage % 2) > 0) {
		incrementTarget();
	}
	document.getElementById('home').innerHTML = getHomeContent(contentPage);
	hideTabs();
	return;
}

// Broken function to read text from a text file	
function getText() {
	var allText = null;
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "http://produceconsumerobot.com/temp/lovid/iparade/01.txt");
	/*txtFile.onreadystatechange = function() {
		  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
			if (txtFile.status === 200) {  // Makes sure it's found the file.
			  allText = txtFile.responseText; 
			  lines = txtFile.responseText.split("\n"); // Will separate each line into an array
			} else {
				alltext = "status failure";
			}
		  } else {
		  	alltext = "readyState failed";
		  }
		}
	 */
	txtFile.send(false);

	allText = txtFile.responseText;
	//file = fopen("C:\\Pub\\dropbox\\iParade\\android\\iParade01\\assets\\www\\01.txt", 0);
	//var file_length = flength(file);
	//var content = fread(file, file_length);

	if (allText != null) {
		return allText;
	} else {
		return "This is a failed test to read text from a file using javascript";
	}
} 

function initializeMap() {
	updateLocation();
	
	var latlng = new google.maps.LatLng(currentLoc.lat, currentLoc.lon);
	//var latlng = new google.maps.LatLng(0.506185, 0.553519);
	var myOptions = {
			zoom: 8,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var m = document.getElementById("map");
	var w = getWindowWidth() - getWindowWidth()/6;
	var h = getWindowHeight() - 20;
	m.style.width= w + "px";
	m.style.height=h + "px";
	var map = new google.maps.Map(m,
			myOptions);
}