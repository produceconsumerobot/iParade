var DEBUG = 0;

var tabLinks = new Array();
var contentDivs = new Array();
var contentPage = 0;
var locCheckTimerId = null; // timer ID
var startTabsTimerId = null; // timer ID
var my_audio = null;
var audioTimer = null;


//var contentImageDir = "./content/"; // content images directory
var contentImageDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var contentVideoDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var storageBase = "/mnt/sdcard/";
var localDir = "download/";
var localVidBase = "iparadeVideo";
var vidExt = ".3gp";
var localVidName = localVidBase + vidExt;
var localVidPath = null;

var voiceover = true;
var contentVoiceoverDir = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/";
var contentAudioTheme = "http://produceconsumerobot.com/temp/lovid/iparade/iparade2/content/audioTheme";
var localVoiceoverBase = "iparadeVoiceover";
var voiceoverExt = ".mp3";
var localVoiceoverName = localVoiceoverBase + voiceoverExt;
var voiceoverPath = null;

var hideTabsTimeout = 2000;
var inTargetVibLen = 200;


// PhoneGap is loaded and it is now safe to make calls to PhoneGap methods
function onDeviceReady() {
	//document.addEventListener("online", onOnline, false);
	checkConnection();
	
	// override the back button on adroid/blackberry
	document.addEventListener("backbutton", onBackKeyDown, false);
	
	getAudioTheme();
	//playAudio(contentAudioTheme + voiceoverExt);
	
	contentPage = 0;
	startGpsTracking();
	//startUpdateLocationTimer();
	
	initializeMap(currentLoc);
}

function checkConnection() {
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
    	return false;
    } else {
    	//alert('Connection type: ' + networkState);
    	//alert('Connection type: ' + states[networkState]);
    	return true;
    }
}

// Alert to notify user that they are offline
function offlineAlert() {
	alert('You are currently offline.\nPlease connect to the network to continue.');
	//confirm();
}

function toggleVoiceover() {
	voiceover = !voiceover;
	if (!voiceover) {
		if (my_audio) {
			my_audio.stop();
			my_audio.release();
		}
		my_audio = null;
		audioTimer = null;
		document.getElementById("toggleVoiceoverButton").childNodes[0].nodeValue="Turn on voiceover";
	} else {
		document.getElementById("toggleVoiceoverButton").childNodes[0].nodeValue="Turn off voiceover";
	}
}

function mouseDown() {
	document.getElementById("tabs").style.display="inline";
	startTabsTimer();
}

function onBackKeyDown() {
	navigator.app.exitApp();
    // Handle the back button
}

// Shows the tabs for the brief period and then hides them
function startTabsTimer() {
	if (startTabsTimerId != null) {
		clearTimeout(startTabsTimerId);
	}
	startTabsTimerId = setTimeout("hideTabs()", hideTabsTimeout);		
}
function hideTabs() {
	document.getElementById("tabs").style.display="none";
}


// Initializes the page
function init() {
	
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
	document.addEventListener("deviceready", onDeviceReady, false);

	// Get the home content
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
				//document.getElementById('home').innerHTML = getHomeContent(contentPage);
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
	
	vidPath = null;
	if (my_audio) {
		my_audio.stop();
		my_audio.release();
		loopingAudio = false;
	}
	my_audio = null;
	audioTimer = null;
	
	contentPage++;
	if ((contentPage % 2) > 0) {
		incrementTarget();
	}
	document.getElementById('home').innerHTML = getHomeContent(contentPage);
	showTab({"id" : 'home'});
	hideTabs();
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

function restartApp() {
	if (my_audio) {
		my_audio.stop();
		my_audio.release();
	}
	my_audio = null;
	audioTimer = null;

	window.location.reload();
}

//Returns html for the home tab based on the value of pageNum	
function getHomeContent(pageNum) {
	var html = "";
	switch (pageNum) {
	case 0:
		html = html + "<h2 align='center'>iParade#2: Unchanged When Exhumed</h2> <p>";
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_mainImage" + ".jpg'>";
		html = html + "<p>This text describes how to experience this app, what do do, where to go etc. </p>";
		//html = html + "<button id='nextButton' type='button' class='rightFloat button' onclick='navigator.app.exitApp()'>Exit iParade</button>";
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
		navigator.notification.vibrate(inTargetVibLen);
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
		navigator.notification.vibrate(inTargetVibLen);
		getVoiceover(targetNum);
		getVideo(targetNum);
		break;
	case 5:
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_btwImage" + ".jpg'>";
		html = html +  "<div class='clearBoth'>";
		checkingForTargetLocation = true;
		if (fakeGPS) testLocChangeTimer();
		break;
	case 6:
		html = html + "<h2 align='center'>Step #3</h2> <p>";
		html = html + "<img class='bodyImage' src='" + contentImageDir + targetNum + "_mainImage" + ".jpg'>";
		html = html + "<p>Location 3 yabber jabber.</p>";
		html = html + "<button id='playVideoButton' type='button' class='buttonCenter button' >...Downloading Video...</button>";
		html = html + "<button id='nextButton' type='button' class='rightFloat button' onclick='navigator.app.exitApp()' style='visibility:hidden;'>Exit iParade</button>";
		html = html +  "<div class='clearBoth'>";
		navigator.notification.vibrate(inTargetVibLen);
		getVoiceover(targetNum);
		getVideo(targetNum);
		break;
	default:
		break;
	}
	return html;
}


