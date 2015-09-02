$(document).ready(function() {
    document.addEventListener("deviceready", function () {
        init();
    }, false);
});

var DEBUG = 0,
    CRAZYD = false,
    IS_RIPPLE_EMULATOR = (window.tinyHippos != undefined),
    tabLinks = null,
    tabListItems = null,
    contentDivs = null,
    contentPage = 0,
    locCheckTimerId = null, // timer ID
    startTabsTimerId = null, // timer ID
    themeAudioPlayer = null,
    voicoverAudioPlayer = null,
    iParades = null,
    remoteContentHub  = "http://archive.rhizome.org:8080/lovid/iparade/",
    remoteContentDir = null,
    remoteVidBase = "_video",
    remoteVoiceOverBase = "_voiceover",
    remoteAudioThemeBase = "audioTheme",
    remoteCssFilename = "stylesheet.css",
    iParadesFile = "iParades.php",
    localDir = "iParade",
    localVidBase = "iparadeVideo",
    localAudioThemeBase = "iparadeTheme",
    localVoiceoverBase = "iparadeVoiceover",
    localContentDir = null,
    vidExt = ".mp4",
    voiceoverExt = ".mp3",
    audioThemeExt = ".mp3",
    localDirectoryEntry = null,
    voiceover = true,
    hideTabsTimeout = 2000,
    inTargetVibLen = 200,
    maxTries = 15,
    tryDelay = 1000,
    splashImg = 'splash-tmp.gif';

function init() {
    //console.log('init()');

    if (DEBUG > 0) {
        showDebugger();
    }

    loadCssFile(remoteContentHub + remoteCssFilename);

    tabLinks = new Array();
    tabListItems = new Array();
    contentDivs = new Array();

    contentPage = 0;
    locCheckTimerId = null; // timer ID
    startTabsTimerId = null; // timer ID
    my_audio = null;
    audioTimer = null;

    initLocation();

    hideTabs();

    initExternalLinks();

    // Get the home content
    getHomeContent(contentPage);

    // Grab the tab links and content divs from the page
    var tabList = document.getElementById('tabs').childNodes;
    for ( var i = 0; i < tabList.length; i++ ) {
        if ( tabList[i].nodeName == "LI" ) {
            var id = getHash( tabList[i].getAttribute('href') );
            tabListItems[id] = tabList[i];
            contentDivs[id] = document.getElementById( id );

            var h = getWindowHeight();

            if (id == 'map') {
                contentDivs[id].style.height = (h - (h*0.06)) + "px";
            } else {
                contentDivs[id].style.height = (h - (h*0.13)) + "px";
            }
        }
    }

    // Assign onclick events to the tab links, and
    // highlight the first tab
    var i = 0;
    for ( var id in tabListItems ) {
        tabListItems[id].ontouchstart = showTab;
        //tabListItems[id].onclick = showTab;
        if ( i == 0 ) tabListItems[id].className = 'selected';
        i++;
    }

    // Hide all content divs except the first
    var i = 0;
    for ( var id in contentDivs ) {
        if ( i != 0 ) contentDivs[id].className = 'tabContent hide';
        i++;
    }

    //console.log("device.platform=" + device.platform);
    //console.log("device.uuid=" + device.uuid);
    //console.log("device.name=" + device.name);
    //console.log("device.version=" + device.version);
    //console.log("device.phonegap=" + device.phonegap);

    // need to stub the backbutton event handler for Ripple
    if (IS_RIPPLE_EMULATOR) {
        cordova.addDocumentEventHandler('backbutton');
    }
    checkConnection();

    // override the back button on android/blackberry
    document.addEventListener("backbutton", onBackKeyDown, false);

    // Start the menubutton listener
    document.addEventListener("menubutton", onMenuKeyDown, false);

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    // Request the file system for devices
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, onFileSystemSuccess, onFileSystemFail);

    startGpsTracking();
    if (!CRAZYD) {
        if (themeAudioPlayer) {
            themeAudioPlayer.release();
            themeAudioPlayer = null;
        }
        themeAudioPlayer = new AudioPlayer(remoteContentHub + remoteAudioThemeBase + audioThemeExt);
        themeAudioPlayer.looping(true);
        themeAudioPlayer.play();
    }

    if (!checkGPS()) {
        badGpsAlert();
    }
}

function onFileSystemSuccess(fileSystem) {
    console.log('onFileSystemSuccess()');
    console.log('fileSystem: ', fileSystem);
    var entry = fileSystem.root;
    entry.getDirectory(localDir, {create: true, exclusive: false}, getDirSuccess, onFileSystemFail);
}

function onFileSystemFail(evt) {
    console.log("onFileSystemFail: ", evt.code);
}

function getFileSuccess(fileEntry) {
    console.log("getFileSuccess(): " + fileEntry.fullPath);
}

function getDirSuccess(dir) {
    console.log("getDirSuccess(): " + dir.toURL());
    localDirectoryEntry = dir;
    /*
    var temp = dir.toURL();
    if (device.platform.toLowerCase().search("android") >= 0) {
        // If it's an Android device and there's no SD card, give fair warning
        if (temp.toLowerCase().search("sdcard") < 0) {
            noSdCardAlert();
        }
    }
    */
    localContentDir = dir.toURL();
    dir.getFile(localVidBase + vidExt, {create: true, exclusive: false}, getFileSuccess, onFileSystemFail);
}

function checkConnection() {
    //console.log('checkConnection()');
    var networkState = navigator.network.connection.type;

    //console.log('Connection type: ' + networkState);

    //if ((!networkState) || (networkState == Connection.UNKNOWN) ||  (networkState == Connection.NONE)) {
    if ((!networkState)  ||  (networkState == Connection.NONE)) {
        //offlineAlert();
        //setTimeout(function() { checkConnection(); }, 1000);
        return false;
    } else {
        return true;
    }
    //console.log('checkConnection() finished');
}

function noSdCardAlert() {
    console.log("noSdCardAlert()");
    navigator.notification.alert('Cannot find SD card.\nPlease insert an SD card.');
}

// Alert to notify user that they are offline
function offlineAlert() {
    console.log("offlineAlert()");
    navigator.notification.alert('You are currently offline.\nPlease connect to the network to continue.');
}

//Alert to notify user that they are offline
function localStorageAlert() {
    console.log("localStorageAlert()");
    navigator.notification.alert('Cannot access local file system. Try inserting an SD card.');
}

function toggleVoiceover() {
    //console.log("toggleVoiceover()");
    voiceover = !voiceover;
    if (!voiceover) {
        //console.log("voiceover off");
        if (voicoverAudioPlayer) {
            voicoverAudioPlayer.release();
            voicoverAudioPlayer = null;
        }
        document.getElementById("toggleVoiceoverButton").src = "img/voice_over_off.jpg";
    } else {
        //console.log("voiceover on");
        document.getElementById("toggleVoiceoverButton").src = "img/voice_over_on.jpg";
        playVoiceover();
    }
    //console.log("toggleVoiceover finished");
}

function mouseDown() {
    //console.log("mouseDown()");
    document.getElementById("tabs").style.display="inline";
    startTabsTimer();
}

function onPause() {
    //console.log("onPause()");
//    if (device.platform.toLowerCase().search("android") >= 0) {
//        if (themeAudioPlayer && themeAudioPlayer.isPlaying()) {
//            themeAudioPlayer.pause();
//        }
//        if (voicoverAudioPlayer && voicoverAudioPlayer.isPlaying()) {
//            voicoverAudioPlayer.pause();
//        }
//    }
}

function onResume() {
    //console.log("onResume()");
//    if (device.platform.toLowerCase().search("android") >= 0) {
//        if (themeAudioPlayer && !themeAudioPlayer.isPlaying()) {
//            themeAudioPlayer.play();
//        }
//        if (voicoverAudioPlayer && !voicoverAudioPlayer.isPlaying()) {
//            voicoverAudioPlayer.play();
//        }
//    }
}

function onBackKeyDown() {
    // Handle the back button
    //console.log("onBackKeyDown()");

    function onConfirm(button) {
        //console.log("onConfirm(" + button + ")");
        if (button==1) {
            if (voicoverAudioPlayer) {
                voicoverAudioPlayer.release();
                voicoverAudioPlayer = null;
            }
            if (themeAudioPlayer) {
                themeAudioPlayer.release();
                themeAudioPlayer = null;
            }
            stopGpsTracking();
            navigator.app.exitApp();
        }
    }

    // Show a custom confirmation dialog
    navigator.notification.confirm(
            'Do you want to quit iParade?',  // message
            onConfirm,              // callback to invoke with index of button pressed
            'Quit iParade?',            // title
            'Quit,Cancel'          // buttonLabels
    );
}

function onMenuKeyDown() {
    // Handle the menu button
    //console.log("onMenuKeyDown()");
    document.getElementById("tabs").style.display="inline";
    startTabsTimer();
}

// Shows the tabs for the brief period and then hides them
function startTabsTimer() {
    //console.log("startTabsTimer()");
    if (startTabsTimerId != null) {
        clearTimeout(startTabsTimerId);
    }
    startTabsTimerId = setTimeout("hideTabs()", hideTabsTimeout);
    //console.log("startTabsTimer() finished");
}
function hideTabs() {
    //console.log("hideTabs()");
    document.getElementById("tabs").style.display="none";
}

// Show a tab
function showTab(options) {
    //console.log('showTab()');
    var selectedId;

    if ((typeof options !== "undefined") && (typeof options.id !== "undefined")) {
        selectedId = options.id;
    } else {
        selectedId = getHash( this.getAttribute('href') );
    }

    // Highlight the selected tab, and dim all others.
    // Also show the selected content div, and hide all others.
    for ( var id in contentDivs ) {
        //console.log("showTab: IDs: " + id);
        if ( id == selectedId ) {
            tabListItems[id].className = 'selected';
            contentDivs[id].className = 'tabContent';
        } else {
            tabListItems[id].className = '';
            contentDivs[id].className = 'tabContent hide';
        }
    }

    if (selectedId == 'map') {
        resizeMap();
        recenterMap();
        if ((contentPage == 0) || (contentPage == 1)) {
            AutoBounds(targetMarkers);
        }
    }

    // Stop the browser following the link
    //console.log('showTab() finished');
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
    var w4 = 0;

    if (document.body.clientHeight != null) {
        w1 = document.body.clientHeight;
    }

    if (document.documentElement.clientHeight != null) {
        w2 = document.documentElement.clientHeight;
    }

    if (window.innerHeight != null) {
        w3 = window.innerHeight;
    }

    w4 = $(window).height();

    ww = $(window).width();

    // enforce landscape
    w = Math.min(w4, ww);

    if ((w == null) || (w == 0)) {
        w = "auto";
    }
    /*
    if (DEBUG > 1)  {
        alert ("h1=" + w1 + ", h2=" + w2 + ", h3=" + w3 + ", h=" + w);
    }
    */
    //console.log("h1=" + w1 + ", h2=" + w2 + ", h3=" + w3 + ", h4=" + w4 + ", ww=" + ww + ", h=" + w);
    //console.log("getWindowHeight()=" + w);
    return w + "";
}

// Returns the width of the current window
// ** May need some finesse for different platforms **
function getWindowWidth() {
    var w = 0;
    var w1 = 0;
    var w2 = 0;
    var w3 = 0;
    var w4 = 0;

    if (document.body.clientWidth != null) {
        w1 = document.body.clientWidth;
    }

    if (document.documentElement.clientWidth != null) {
        w2 = document.documentElement.clientWidth;
    }

    if (window.innerWidth != null) {
        w3 = window.innerWidth;
    }

    w4 = $(window).width();

    h = $(window).height();

    // enforce landscape
    w = Math.max(w4, h);

    if ((w == null) || (w == 0)) {
        w = "auto";
    }
    /*
    if (DEBUG > 1)  {
        alert ("w1=" + w1 + ", w2=" + w2 + ", w3=" + w3 + ", w=" + w);
    }
    */
    //console.log("w1=" + w1 + ", w2=" + w2 + ", w3=" + w3 + ", w4=" + w4 + ", h=" + h + ", w=" + w);
    //console.log("getWindowWidth()=" + w);
    return w + "";
}


function restartApp() {
    //console.log("restartApp()");
    // process the confirmation dialog result
    function onConfirm(button) {
        //console.log("onConfirm(" + button + ")");
        if (button==1) {
            if (voicoverAudioPlayer) {
                voicoverAudioPlayer.release();
                voicoverAudioPlayer = null;
            }
            if (themeAudioPlayer) {
                themeAudioPlayer.release();
                themeAudioPlayer = null;
            }

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

function reloadHome(pageNum) {
    //console.log("reloadHome()");
    // process the confirmation dialog result
    function onConfirm(button) {
        //console.log("onConfirm(" + button + ")");
        if (button==1) {
            // If the device isn't online, don't move to the next page
            if (!checkConnection()) {
                offlineAlert();
                return;
            }

            // If the device GPS isn't enabled, don't move to the next page
            //if (!checkGPS()) {
            //    badGpsAlert();
            //    return;
            //}

            if (voicoverAudioPlayer) {
                voicoverAudioPlayer.release();
                voicoverAudioPlayer = null;
            }
            if (themeAudioPlayer) {
                themeAudioPlayer.release();
                themeAudioPlayer = null;
            }

            if (pageNum == 0) {
                // startup screen is special
                if (navigator.app) {
                    navigator.app.loadUrl("file:///android_asset/www/index.html");
                } else {
                    //window.location = "index.html";
                    window.location.reload(true);
                }
            } else if (pageNum == 1) {
                // First page is special

                // This is a hack because file transfer isn't cancelable
                // and we don't want to play the theme endlessly without recourse
                //if (navigator.app) {
                //    navigator.app.loadUrl("file:///android_asset/www/index.html");
                //} else {
                //    //window.location = "index.html";
                //    window.location.reload(true);
                //}

                getHomeContent(contentPage);
                showTab({"id" : 'home'});
                setTimeout("hideTabs()", 100);
            } else if (targetNum == (targetLocations.length)) {
                // Last page is special
                getHomeContent(contentPage);
                showTab({"id" : 'home'});
                setTimeout("hideTabs()", 100);
            } else if ((pageNum % 2) == 0) {
                // Between page
                getHomeContent(contentPage);
                showTab({"id" : 'home'});
                setTimeout("hideTabs()", 100);
            } else {
                // Main content page

                // Re-download voiceover and video
                vidDownloadComplete = false;
                voiceoverDownloadComplete = false;
                getVoiceover((targetNum + 1));
                getVideo((targetNum + 1));

                getHomeContent(contentPage);
                showTab({"id" : 'home'});
                setTimeout("hideTabs()", 100);
            }


        }
    }

    // Show a custom confirmation dialog
    navigator.notification.confirm(
                                   'Reload the current step?',  // message
                                   onConfirm,              // callback to invoke with index of button pressed
                                   'Reload Step?',            // title
                                   'Reload,Cancel'          // buttonLabels
                                   );

    //console.log("reloadHome() finished");
}

// Moves to the next page in the sequence
function nextPage() {
    //console.log("nextPage()");

    // If the device isn't online, don't move to the next page
    if (!checkConnection()) {
        offlineAlert();
        return;
    }

    // If the device GPS isn't enabled, don't move to the next page
    //if (!checkGPS()) {
    //    badGpsAlert();
    //    return;
    //}

    if (!localContentDir) {
        localStorageAlert();
        return;
    }

    checkingForTargetLocation = false;

    if (voicoverAudioPlayer) {
        voicoverAudioPlayer.release();
        voicoverAudioPlayer = null;
    }
    if (themeAudioPlayer) {
        themeAudioPlayer.release();
        themeAudioPlayer = null;
    }

    contentPage++;
    if ((contentPage > 2) && (contentPage % 2) == 0) {
        incrementTarget();
    }
    getHomeContent(contentPage);
    showTab({"id" : 'home'});
    setTimeout("hideTabs()", 100);
    //hideTabs();
    //console.log("nextPage finished");
}

//Returns html for the home tab based on the value of pageNum
function getHomeContent(pageNum) {
    //console.log("getHomeContent(" + pageNum + ")");
    var html = "";

    if (pageNum == 0) {
        // startup screen is special
        // html += "<div id='startScreen' style='margin-top:" + getMarginTop() + "px' >";
        html += "<div id='startScreen'>";
        html += "<p id='iParadeSearching'>Searching for iParades...</p>";
        html += "<img class='fullSplashImage' src='img/" + splashImg + "'/>";
        html += "</div>";
        document.getElementById('home').innerHTML = html;
    } else if (pageNum == 1) {
        // First page is special
        getAudioTheme();
        html += "<div id='textContent' class='paddedContent'></div>";
        html += "<div id='progress-" + targetNum + "' class='progress'></div>";
        html += "<img src='img/reload_page.jpg' id='reloadButton' ontouchstart='reloadHome(contentPage)' />";
        html += "<div id='playVideoButton'>";
        if (!audioThemeDownloadComplete) {
            html += "<img id='downloadingImg' src='img/downloading.gif'/>";
        } else {
            //console.log("audioThemeDownloadComplete == true");
        }
        html += "</div>";
        html += getNextButton(false);
         document.getElementById('home').innerHTML = html;
        loadHtml($("#textContent"), remoteContentDir + "0_text.html");
    } else if (targetNum == (targetLocations.length)) {
        // Last page is special
        html += "<div id='textContent' class='paddedContent'></div>";
        html += "<img src='img/reload_page.jpg' id='reloadButton' ontouchstart='reloadHome(contentPage)' />";
        html += "<img src='img/repeat.jpg' id='nextButton' ontouchstart='restartApp()' />";
        document.getElementById('home').innerHTML = html;
        loadHtml($("#textContent"), remoteContentDir + (targetNum + 1) + "_text.html");
        playAudioTheme();
        deleteLocalMedia();
    } else if ((pageNum % 2) == 0) {
        // Between page
        html += "<img class='bodyImage' src='" + remoteContentDir + (targetNum + 1) + "_btwImage" + ".jpg' style='margin-top:" + getMarginTop() + "px' />";
        document.getElementById('home').innerHTML = html;
        checkingForTargetLocation = true;
        vidDownloadComplete = false;
        voiceoverDownloadComplete = false;
        playAudioTheme();
        getVoiceover((targetNum + 1));
        getVideo((targetNum + 1));
        if (fakeGPS) testLocChangeTimer();
    } else {
        // Main content page
        //html += "<img src='img/reload_page.jpg' id='reloadButton' ontouchstart='reloadHome(contentPage)' />";
        html += "<div id='textContent' class='paddedContent'></div>";
        html += "<div id='progress-" + targetNum + "' class='progress'></div>";
        html += "<img src='img/reload_page.jpg' id='reloadButton' ontouchstart='reloadHome(contentPage)' />";
        html += "<div id='playVideoButton'>";
        // If the video has already downloaded we don't need to show the downloading gif
        if (!vidDownloadComplete) {
            html += "<img id='downloadingImg' src='img/downloading.gif'/>";
        } else {
            //console.log("vidDownloadComplete == true");
        }
        html += "</div>";
        html += getNextButton(false);
        document.getElementById('home').innerHTML = html;
        loadHtml($("#textContent"), remoteContentDir + (targetNum + 1) + "_text.html");
        navigator.notification.vibrate(inTargetVibLen);
        if (!voicoverAudioPlayer) { // only play voiceover if it wasn't started already
            playVoiceover();
        }
        displayVidElement();
    }
    //console.log("finishing getHomeContent");
}

function loadHtml(element, url, nthTry) {
    //console.log("loadHtml(" + url + ")");

    function tryAgain(elem, address, ntry) {
        //console.log("tryAgain(" + ntry + ")");
        if (ntry < maxTries) {
            // Wait and try try again...
            setTimeout(function() { loadHtml(elem, address, ntry);}, ntry*tryDelay/2);
        }
    }

    // nthTry keeps track of number of attempts
    if (!nthTry) {
        nthTry = 1;
    } else {
        nthTry++;
    }

    element.load(url, function(response, status, xhr) {
        //console.log("load response");
        if (status == "error") {
            //console.log("load error: " + url);
            tryAgain(element, url, nthTry);
        }
    });

    //console.log("loadHtml finished");
}

function getNextButton(visible) {
    //console.log("getNextButton(" + visible + ")");
    var nextButton;
    if (visible) {
        nextButton = "<img id='nextButton' src='img/next_arrow.jpg' ontouchstart='nextPage()'/>";
    } else {
        nextButton = "<img id='nextButton' src='img/next_arrow.jpg' ontouchstart='nextPage()' style='visibility:hidden;'/>";
    }
    //console.log("returning nextButton");
    return nextButton;
}

function showNextButton(delay) {
    //console.log("showNextButton(" + delay + ")");
    setTimeout(function() {
               //console.log("showing nextButton");
               if ($("#nextButton")) {
                $("#nextButton").css("visibility", "visible");
               } else {
                //console.log("nextButton not found");
               }
               //document.getElementById("nextButton").style.visibility="visible";
               //console.log("finished showing nextButton");
               }, delay);
}

function hideDownloadingImg(delay) {
    //console.log("hideDownloadingImg(" + delay + ")");
    setTimeout(function() {
               if ($("#downloadingImg")) {
               //console.log("hiding downloadingImg");
               $("#downloadingImg").css("display", "none");
               }
               }, delay);
}

function displayVidElement() {
    //console.log("displayVidElement()");
    if (vidDownloadComplete && !checkingForTargetLocation) {
        //console.log("displaying Video element");

        hideDownloadingImg(0);

        //console.log("Creating img element");

        var html = "";
        html += "<img id='playImg' src='img/play.jpg' ontouchstart='playVideo(); showNextButton(2000);'/>";
        $("#playVideoButton").html(html);

    }
    //console.log("displayVidElement finished");
}

function loadCssFile(filename) {
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    if (typeof fileref!="undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function getIparades(loc, nthTry) {
    console.log("getIparades(" + loc.latitude + "," + loc.longitude + ")");

    function tryAgain(location, ntry) {
        //console.log("tryAgain(" + ntry + ")");
        if (ntry < maxTries) {
            // Wait and try try again...
            setTimeout(function() { getIparades(location, ntry);}, ntry*tryDelay/2);
        }
    }

    // If the device isn't online, don't try ajax
    if (!checkConnection()) {
        offlineAlert();
        setTimeout(function() { getIparades(loc, nthTry);}, 5000);
    } else {

        // nthTry keeps track of number of attempts
        if (!nthTry) {
            nthTry = 1;
        } else {
            nthTry++;
        }

        $.ajax({
            type : 'POST',
            url : remoteContentHub + iParadesFile,
            dataType : 'json',
            data : {
              latitude : loc.latitude,
              longitude : loc.longitude
            },
            success : function(data) {
              // sweet! we win!
                iParades = data;
                var targets = new Array();
                var titles = new Array();
                for (var i=0; i<data.length; i++) {
                    //console.log(data[i].name + ": " + data[i].location.latitude + ", " + data[i].location.longitude);
                    targets[i] = data[i].location;
                    titles[i] = data[i].name;
                }
                showIparades();
                initializeMap(currentLoc);
                setTargetMarkers(targets);
                setTargetMarkerInfoWindows(titles);
            },
            error : function(data) {
              console.error("error in getIparades(" + loc.latitude + "," + loc.longitude + ")");
              tryAgain(loc, nthTry);
            }
          });
    }

    //console.log("getIparades finished");
}

function showIparades() {
    //console.log("showIparades()");

    var html = "";
    html += "<img class='fullSplashImage' src='img/" + splashImg + "'/>";
    html += "<div class='iparadeSelectOverlay'>";
    html += "<span>Choose an iParade:</span>";
    html += "<select id=iParadeSelect>";
    for (var i=0; i<iParades.length; i++) {
        html += "<option value='" + i + "' id='select" + i + "' >" + iParades[i].name + "</option>";
    }
    html += "</select>";
    html += "<img id='splashNextButton' src='img/next_arrow.jpg' ontouchstart='initIparade()'/>";
    html += "<span class='splashNextText'>Press NEXT<br/>to begin:</span>";
    html += "</div>";
    document.getElementById('startScreen').innerHTML = html;

    //console.log("showIparades finished");
}


function initIparade(listNum) {
    //console.log("initIparade()");

    if (!checkGPS()) {
        badGpsAlert();
        return;
    }

    if (!listNum) {
        listNum = $("#iParadeSelect option:selected").attr("value");
    }

    remoteContentDir = iParades[listNum].url;

    loadCssFile(remoteContentDir + remoteCssFilename);

    loadHtml($("#notes > div.paddedContent"), remoteContentDir + "notes.html");

    getTargetLocations(currentLoc);

    nextPage();

    //console.log("initIparade finished");
}

function initExternalLinks() {
    $(document).on('click', 'a', function(e) {
        e.preventDefault();
        if ($(e.target).attr("target") == "_blank") {
            window.open(e.target, '_system');
        }
    });
}

function getMarginTop() {
    //console.log("getMarginTop()");
    w = getWindowWidth();
    h = getWindowHeight();

    var mt = (h-(w/480*270))/2 + "";

    //console.log("getMarginTop finished: " + mt);

    return mt;
}

function showDebugger() {
    var $debug = $("#debug");
    $debug.show();

    $("#toggle-next-location").on("click", function() {
        nextPage();
    });
}