var DEBUG = 0;

var tabLinks = new Array();
var tabListItems = new Array();
var contentDivs = new Array();
var contentPage = 0;
var locCheckTimerId = null; // timer ID
var startTabsTimerId = null; // timer ID
var my_audio = null;
var audioTimer = null;

// deprecated variables
//var contentImageDir = "http://produceconsumerobot.com/temp/lovid/content/";
//var contentVideoDir = "http://produceconsumerobot.com/temp/lovid/content/";
//var contentVoiceoverDir = "http://produceconsumerobot.com/temp/lovid/content/";
//var contentAudioTheme = "http://produceconsumerobot.com/temp/lovid/content/audioTheme";
//var localVoiceoverName = localVoiceoverBase + voiceoverExt;
//var localVoiceoverBase = "iparadeVoiceover";
//var storageBase = "/youlose/";
//var localVidName = localVidBase + vidExt;
//var localVidPath = null;
//var voiceoverPath = null;
//var storageBase = "/mnt/sdcard/";

//var contentImageDir = "./content/"; // content images directory
var remoteContentDir = "http://produceconsumerobot.com/temp/lovid/content/";
var remoteVidBase = "_video";
var remoteVoiceOverBase = "_voiceover";
var remoteAudioThemeBase = "audioTheme";

var localDir = "iParade";
var localVidBase = "iparadeVideo";
var localContentDir = null;
var vidExt = ".mp4";
var voiceoverExt = ".mp3";
var audioThemeExt = ".mp3";
var voiceover = true;

var hideTabsTimeout = 2000;
var inTargetVibLen = 200;



// PhoneGap is loaded and it is now safe to make calls to PhoneGap methods
function onDeviceReady() {
    console.debug('onDeviceReady()');
    console.debug("device=" + device.platform);
	//document.addEventListener("online", onOnline, false);
	checkConnection();
	
	// override the back button on android/blackberry
	document.addEventListener("backbutton", onBackKeyDown, false);
	
	// Start the menubutton listener
	document.addEventListener("menubutton", onMenuKeyDown, false);
	
	// Request the root file system for writing audio/video
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);
	
	window.onscroll = floater;
	
	getAudioTheme();
	//playAudio(contentAudioTheme + voiceoverExt);
	
	contentPage = 0;
	startGpsTracking();
	//startUpdateLocationTimer();
	
	getTargetLocations(currentLoc);
	//initializeMap(currentLoc);
}

function getFileSuccess(fileEntry) {
    console.log("getFileSuccess: " + fileEntry.fullPath);
}

function getDirSuccess(dir) {
	//console.log("getDirSuccess: " + dir.toURI());
	//console.log("getDirSuccess: " + dir.toURI().replace("file://",""));
    console.log("getDirSuccess: " + dir.fullPath);
	//localContentDir = dir.toURI().replace("file://","");
    //localContentDir = dir.toURI();
    localContentDir = dir.fullPath;
    dir.getFile(localVidBase + vidExt, {create: true, exclusive: false}, getFileSuccess, onFileSystemFail);
}

function onFileSystemSuccess(fileSystem) {
	console.log("onFileSystemSuccess()");
    console.log(fileSystem.name);
    console.log(fileSystem.root.name);
    var entry=fileSystem.root; 
    entry.getDirectory(localDir, {create: true, exclusive: false}, getDirSuccess, onFileSystemFail);
}

function onFileSystemFail(evt) {
    console.log(evt.target.error.code);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);
}


function checkConnection() {
    console.log('checkConnection()');
    var networkState = navigator.network.connection.type;

    console.log('Connection type: ' + networkState);
    
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if ((!networkState) || (networkState == Connection.UNKNOWN) ||  (networkState == Connection.NONE)) {
    	//offlineAlert();
    	setTimeout(function() { checkConnection(); }, 1000);
    	return false;
    } else {
    	//alert('Connection type: ' + networkState);
    	//alert('Connection type: ' + states[networkState]);
    	return true;
    }
}

// Alert to notify user that they are offline
function offlineAlert() {
	console.log("offlineAlert()");
	navigator.notification.alert('You are currently offline.\nPlease connect to the network to continue.');
	//confirm();
}

function toggleVoiceover() {
	console.log("toggleVoiceover()");
	voiceover = !voiceover;
	if (!voiceover) {
		console.log("voiceover off");
		releaseAudio();
		//document.getElementById("toggleVoiceoverButton").childNodes[0].nodeValue="Turn on voiceover";
		document.getElementById("toggleVoiceoverButton").src = "design/voice_over_off.jpg";
	} else {
		console.log("voiceover on");
		//document.getElementById("toggleVoiceoverButton").childNodes[0].nodeValue="Turn off voiceover";
		document.getElementById("toggleVoiceoverButton").src = "design/voice_over_on.jpg";
	}
}

function mouseDown() {
	document.getElementById("tabs").style.display="inline";
	startTabsTimer();
}

function onBackKeyDown() {
	// Handle the back button
	console.log("onBackKeyDown()");
	navigator.app.exitApp();
}

function onMenuKeyDown() {
    // Handle the menu button
	console.log("onMenuKeyDown()");
	document.getElementById("tabs").style.display="inline";
	startTabsTimer();
}

// Shows the tabs for the brief period and then hides them
function startTabsTimer() {
	if (startTabsTimerId != null) {
		clearTimeout(startTabsTimerId);
	}
	startTabsTimerId = setTimeout("hideTabs()", hideTabsTimeout);		
}
function hideTabs() {
	console.log("hideTabs()");
	document.getElementById("tabs").style.display="none";
}


// Initializes the page
function init() {
    console.debug('init()');
	
	tabLinks = new Array();
	contentDivs = new Array();
	contentPage = 0;
	locCheckTimerId = null; // timer ID
	startTabsTimerId = null; // timer ID
	my_audio = null;
	audioTimer = null;

	initLocation();
	
	//startTabsTimer();
	hideTabs();
	
	// Start listener for PhoneGap loaded
	console.log("Adding deviceready listener");
	document.addEventListener("deviceready", onDeviceReady, false);
	
	// Get the home content
	getHomeContent(contentPage);

	//$("div.tabContent").css(".min-height", getWindowHeight());
	
	// Grab the tab links and content divs from the page
	var tabList = document.getElementById('tabs').childNodes;
	for ( var i = 0; i < tabList.length; i++ ) {
		if ( tabList[i].nodeName == "LI" ) {
			//var tabLink = getFirstChildWithTagName( tabList[i], 'A' );
			//var id = getHash( tabLink.getAttribute('href') );
			var id = getHash( tabList[i].getAttribute('href') );
			//tabLinks[id] = tabLink;
			tabListItems[id] = tabList[i];
			contentDivs[id] = document.getElementById( id );
			contentDivs[id].style.height = getWindowHeight() + "px";
			//if ( i == 0 ) tabListItems[i].className = 'selected';
		}
	}
	
	// Assign onclick events to the tab links, and
	// highlight the first tab
	var i = 0;

	for ( var id in tabListItems ) {
		//tabLinks[id].onclick = showTab;
		//tabLinks[id].onfocus = function() { this.blur(); };
		tabListItems[id].ontouchend = showTab;
		tabListItems[id].onclick = showTab;
		//tabListItems[id].onfocus = function() { this.blur(); };
		if ( i == 0 ) tabListItems[id].className = 'selected';
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
function showTab(options) {
	var selectedId;
		
    if ((typeof options !== "undefined") && (typeof options.id !== "undefined")) {
		selectedId = options.id;
	} else {
		selectedId = getHash( this.getAttribute('href') );
	}

	//console.log("showTab: ID=" + selectedId);
	//document.getElementById('about').style.height = getWindowHeight();

	// Highlight the selected tab, and dim all others.
	// Also show the selected content div, and hide all others.
	for ( var id in contentDivs ) {
		//console.log("showTab: IDs: " + id);
		if ( id == selectedId ) {
			switch (selectedId) {
			case 'notes':
				break;
			default:
			}     


			//tabLinks[id].className = 'selected';
			tabListItems[id].className = 'selected';
			contentDivs[id].className = 'tabContent';

			//document.getElementById('home').style.height = getWindowHeight();
		} else {
			//tabLinks[id].className = '';
			tabListItems[id].className = '';
			contentDivs[id].className = 'tabContent hide';
		}
	}
	contentDivs[selectedId].style.height = getWindowHeight() + "px";
	
	if (selectedId == 'map') {
		resizeMap();
		recenterMap();
	}

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

// Moves to the next page in the sequence
function nextPage() {
	console.log("nextPage()");
	// If the device isn't online, don't move to the next page
	if (!checkConnection()) {
		offlineAlert();
		return;
	}
	
	// If the device GPS isn't enabled, don't move to the next page
	if (!checkGPS()) {
		badGpsAlert();
		return;
	}
	
	releaseAudio();
	loopingAudio = false;

	contentPage++;
	if ((contentPage % 2) > 0) {
		incrementTarget();
	}
	getHomeContent(contentPage);
	showTab({"id" : 'home'});
	hideTabs();
}

function restartApp() {
	console.log("restartApp()");
	// process the confirmation dialog result
    function onConfirm(button) {
        console.log("onConfirm(" + button + ")");
    	if (button==1) {
    		releaseAudio();
	    	
            if (navigator.app) {
                navigator.app.loadUrl("file:///android_asset/www/index.html"); 
            } else {
                //window.location = "index.html";
                window.location.reload(true);
            }
    	}
    }

    // Show a custom confirmation dialog
    navigator.notification.confirm(
        'Do you want to restart iParade?',  // message
        onConfirm,              // callback to invoke with index of button pressed
        'Restart iParade?',            // title
        'Restart,Cancel'          // buttonLabels
    );
}

window.addEventListener ? window.addEventListener("load", init, false) : window.attachEvent && window.attachEvent("onload", init);

//Returns html for the home tab based on the value of pageNum	
function getHomeContent(pageNum) {
	console.log("getHomeContent(" + pageNum + ")");
	var html = "";
	
	if (pageNum == 0) {
		// First page is special
		html = html + "<div id='textContent'></div>";
		html = html + getNextButton(true); 
		html = html +  "<div class='clearBoth'></div>";
		document.getElementById('home').innerHTML = html;
		$("#textContent").load(remoteContentDir + targetNum + "_text.html");
	} else if ((pageNum % 2) == 1) {
		// Between page
		html = html + "<img class='bodyImage' src='" + remoteContentDir + targetNum + "_btwImage" + ".jpg'>";
		html = html +  "<div class='clearBoth'></div>";
		document.getElementById('home').innerHTML = html;
		checkingForTargetLocation = true;
		localVidPath = null;
		getVideo(targetNum);
		if (fakeGPS) testLocChangeTimer();
	} else {
		// Main content page
		
		html = html + "<div id='textContent'></div>";
		html = html + "<div id='playVideoButton'";
		html = html + "<img id='downloadingImg' style='display:block' src='./design/downloading.gif'/>";
		//html = html + "<img id='playImg' style='display:none' src='./design/play.jpg'/>";
		//html = html + "<video id='playVid' style='display:none' controls='controls'>";
		//html = html + "<source src='' type='video/mp4' /></video>";
		html = html + "</div>";
		//html = html + "<button id='playVideoButton' type='button' class='buttonCenter button' >...Downloading Video...</button>";
		html = html + getNextButton(false);
		//html = html +  "<div class='clearBoth'>";
		document.getElementById('home').innerHTML = html;
		$("#textContent").load(remoteContentDir + targetNum + "_text.html");
		navigator.notification.vibrate(inTargetVibLen);
		getVoiceover(targetNum);
		displayVidElement();		
	}
	console.log("finishing getHomeContent");
}

function getNextButton(visible) {
	console.log("getNextButton(" + visible + ")");
	var nextButton;
	if (visible) {
		nextButton = "<img id='nextButton' src='design/next_arrow.jpg' ontouchstart='nextPage()'/>";
	} else {
		nextButton = "<img id='nextButton' src='design/next_arrow.jpg' ontouchstart='nextPage()' style='visibility:hidden;'/>";
	}
	console.log("returning nextButton");
	return nextButton;
	//"<button id='nextButton' type='button' class='rightFloat button' onclick='navigator.app.exitApp()' style='visibility:hidden;'>Exit iParade</button>";
}

function showNextButton() {
    setTimeout(function() { document.getElementById("nextButton").style.visibility="visible"; }, 500);
}

function displayVidElement() {
	console.log("displayVidElement()");
	if (vidDownloadComplete && !checkingForTargetLocation) {
		console.log("displaying Video element");
        
		$("#playVideoButton #downloadingImg").css("display", "none");
	    
	    // Check if the device supports video
	    //var vidTest = $("#playVid");
	    if (device.platform.toLowerCase().search("android") >= 0) {
	    	// Video not supported :(
            console.log("Creating img element");
            
            var html = "";
            html = html + "<img id='playImg' src='./design/play.jpg' ontouchstart='playVideo(); showNextButton();'/>";
	    	//setTimeout(function() { $("#playVideoButton #playImg").css("display", "block"); }, 1000);
	    	//document.getElementById("playVideoButton").ontouchstart=function(){ playVideo(); };
        } else {
            // Video supported!!
            console.log("Creating video element: " + localVidPath);
            
            var html = "";
            html = html + "<video id='playVid' controls='controls' ontouchstart='showNextButton();'>";
            html = html + "<source src='" + localVidPath + "' type='video/mp4' /></video>"; 
            
 	    } 
        $("#playVideoButton").html(html);
        
	}
}

