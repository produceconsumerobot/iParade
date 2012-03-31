var fakeGPS = true; // for debugging
var faceGPSdelay = 7000; // delay to achieve location

var currentLoc; // where the device is currently
var targetNum; // which target is currently being sought after
//var nTargets; // number of targets
var targetLocations; // array of TargetLocations for this parade
var gMap;
var currentMarker;
var currentCircle;
var targetMarkers;
var gpsWatch;
var gpsGood;
var minAccuracy;
var checkingForTargetLocation; 
var updateLocationTimerId; // timer ID
var testLocChangeTimerId; // timer ID


//Location constructor
function Location(lat, long, acc) {
    console.log("Location:" + lat + "," + long + "," + acc);
	this.latitude = lat;
	this.longitude = long;
	this.accuracy = acc;
}

function initLocation() {
	console.log("initLocation()");
	currentLoc = new Location(40.777422, -74.071198, 500.0);
	targetNum = 0;
	//nTargets = 4;
	targetLocations = new Array();
	gMap = null;
	currentMarker = null;
	currentCircle = null;
	targetMarkers = new Array();
	gpsWatch = null;
	gpsGood = false;
	minAccuracy = 50;
	checkingForTargetLocation = false; 
	updateLocationTimerId = null;
	testLocChangeTimerId = null;
    console.log("initLocation() finished");
}

function initializeMap(loc) {
    console.log('initializeMap(loc)');
	//updateLocation(currentLoc);
	
	console.log("initializeMap: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	var latlng = new google.maps.LatLng(loc.latitude, loc.longitude);
	
	//getTargetLocations(currentLoc);
	
	//var latlng = new google.maps.LatLng(0.506185, 0.553519);
	var myOptions = {
    zoom: 15,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
    style: google.maps.MapTypeControlStyle.DEFAULT,
    position: google.maps.ControlPosition.LEFT_TOP
    },
    streetViewControl: true,
    streetViewControlOptions: {
    position: google.maps.ControlPosition.LEFT_CENTER
    }		    
	};
	var m = document.getElementById("map");
    //	var w = getWindowWidth() - getWindowWidth()/8;
    //	var h = getWindowHeight() - 30;
    //	m.style.width= w + "px";
    //	m.style.height= h + "px";
	gMap = new google.maps.Map(m, myOptions);
	
    
	for (var i=0; i<targetLocations.length; i++ ) {
		var tLoc = targetLocations[i];
		console.log("Marker: " + tLoc.latitude + ", " + tLoc.longitude + ", " + tLoc.accuracy);
		targetMarkers[i] = new google.maps.Marker({
                                            position: new google.maps.LatLng(tLoc.latitude, tLoc.longitude),
                                            map: gMap,
                                            icon: "./design/targetLocation.png",
                                            title:""
                                            });		
	}
	setTargetMarkerIcons();
	
	currentMarker = new google.maps.Marker({
                                           position: latlng,
                                           map: gMap,
                                           title:"Hello World!"
                                           });
    
	currentCircle = new google.maps.Circle({
                                           strokeColor: "#FF0000",
                                           strokeOpacity: 0.8,
                                           strokeWeight: 2,
                                           fillColor: "#FF0000",
                                           fillOpacity: 0.35,
                                           map: gMap,
                                           radius: currentLoc.accuracy
                                           });
    currentCircle.bindTo('center', currentMarker, 'position');
	
    console.log("initializeMap() finished");
}

function setTargetMarkerIcons() {
	console.log("setTargetMarkerIcons()");
	for (var i=0; i<targetMarkers.length; i++ ) {
		if (i == targetNum) {
			targetMarkers[i].setIcon("./design/targetLocation_next.png");
		} else if (i < targetNum) {
			targetMarkers[i].setIcon("./design/targetLocation_visited.png");
		} else {
			targetMarkers[i].setIcon("./design/targetLocation.png");
		}
	}
	console.log("setTargetMarkerIcons finished");
}


//Lookup the targetLocations
//Currently all locations are hard-coded
//In the future locations may be acquired via remote lookup
function getTargetLocations(currentLocation) {
	console.log("getTargetLocations(" + currentLocation + ")");
	fileName = "targetLocations.json";
	filePath = remoteContentDir + fileName;
	
	console.log("$.getJSON(" + filePath + ")");
	$.getJSON( filePath )
	.success(function(data) {parseTargetLocations(data);})
	.error(function(err) { 
		console.error("ERROR with $.getJSON(" + filePath + "): " + err);
	})
	.complete(function() { console.log("getJSON complete"); });
	
	function parseTargetLocations(data) {
		console.log("TargetLocations acquired: " + data);

		// The first location is a dummy location 
		targetLocations[0] = new Location(0.0, 0.0, 1.0);
		
		for (var i=0; i<data.length; i++) {
			console.log("TargetLocation" + i);
			if ((data[i].latitude) && (data[i].longitude) && (data[i].accuracy)) {
				console.log(data[i].latitude + ", " + data[i].longitude + ", " + data[i].accuracy);
				targetLocations[i+1] = new Location(data[i].latitude, data[i].longitude, data[i].accuracy);
			} else {
				console.error("TargetLocation " + i + "is missing data");
			}
		}	
		
		initializeMap(currentLocation);
	}
    console.log("getTargetLocations() finished");
}

//Updates the current GPS location and performs checks
function updateLocation(loc) {
	console.log("updateLocation: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	currentLoc.latitude = loc.latitude;
	currentLoc.longitude = loc.longitude;
	currentLoc.accuracy = loc.accuracy;
	
	// TODO: make conditional on whether map is showing?
	updateMarkerPosition(currentLoc);
	
	console.log("updateLocation: checkingForTargetLocation = " + checkingForTargetLocation);
	if (checkingForTargetLocation) {
		//alert("loc=" + currentLoc.latitude + "," + currentLoc.longitude + "," + currentLoc.accuracy + " target=" + targetLocations[targetNum].latitude + "," + targetLocations[targetNum].longitude + "," + targetLocations[targetNum].accuracy);
		//alert("checkingForTargetLocation");
		if (inTargetLocation(currentLoc, targetLocations[targetNum])) {
			console.log("Target Location reached");
			checkingForTargetLocation = false;
			nextPage();
		}
	}		
    console.log("updateLocation finished");
}

//Timer to update gps location
function startUpdateLocationTimer() {
    console.log("startUpdateLocationTimer()");
	if (updateLocationTimerId == null) {
		updateLocationTimerId = setInterval("updateLocation(targetLocations[targetNum])", 1000);
	}
}
function clearUpdateLocationTimer() {
    console.log("clearUpdateLocationTimer()");
	if (updateLocationTimerId != null) {
		clearInterval(updateLocationTimerId);
		updateLocationTimerId = null;
	}
}

function startGpsTracking() {
	console.log("startGpsTracking()");
	var options = { "maximumAge": 3000, "timeout": 5000, "enableHighAccuracy": true };
	gpsWatch = navigator.geolocation.watchPosition(geolocationCallbackSuccess, geolocationCallbackError, options);
}

// geolocation callbacks
function geolocationCallbackSuccess(position) {
	console.log("geolocationCallbackSuccess(): " + position.coords.latitude + ", " + position.coords.longitude + ", " + position.coords.accuracy + ", ");
	gpsGood = true;
	updateLocation({"latitude":position.coords.latitude, "longitude":position.coords.longitude, "accuracy":position.coords.accuracy});
}
function geolocationCallbackError(error) {
	console.log("geolocationCallbackError()");
	gpsGood = false;
	badGpsAlert();
}

function badGpsAlert() {
	console.log("badGpsAlert()");
	navigator.notification.alert('Location not found or innacurate.\nPlease enable GPS location services and obtain a GPS fix to continue.');
}

function checkGPS() {
	console.log("checkGPS()");
	if (fakeGPS) {
		return true;
	}
	if ((gpsGood) && (currentLoc.accuracy < minAccuracy)){
		return true;
	} else {
		return false;
	}
}


function updateMarkerPosition(loc) {
	console.log("updateMarkerPosition: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	var latlng = new google.maps.LatLng(loc.latitude, loc.longitude);
	
	if (currentMarker) {
		currentMarker.setPosition(latlng);
	} else {
		console.log("currentMarker == null");
	}
    
	if (currentCircle) {
		currentCircle.setRadius(loc.accuracy);
	} else {
		console.log("currentCircle == null");
	}
    console.log("updateMarkerPosition finished");
}

function recenterMap() {
    console.log("recenterMap()");
	if (gMap) {
		var latlng = new google.maps.LatLng(currentLoc.latitude, currentLoc.longitude);
        gMap.panTo(latlng);
		//gMap.setCenter(latlng);
	} else {
		console.log("gMap == null");
	}
}

function resizeMap() {
	console.log("resizeMap");
    if (map) {
    	google.maps.event.trigger(gMap, 'resize');
    }
}


// Check if the current GPS location is within the passed target location
function inTargetLocation(currentLocation, targetLocation) {
	console.log("inTargetLocation: targetNum = " + targetNum);
	console.log("inTargetLocation: " + currentLocation.latitude + ", " + currentLocation.longitude +
                "; " + targetLocation.latitude + ", " + targetLocation.longitude);
    
	var currlatlng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
	var targetlatlng = new google.maps.LatLng(targetLocation.latitude, targetLocation.longitude);
	var distance = google.maps.geometry.spherical.computeDistanceBetween(currlatlng, targetlatlng);
	
	console.log("inTargetLocation: distance = " + distance);
	console.log("inTargetLocation: currentLocation.accuracy = " + currentLocation.accuracy);
	console.log("inTargetLocation: targetLocation.accuracy = " + targetLocation.accuracy);
	
	if ((distance!=null) && ((distance - currentLocation.accuracy - targetLocation.accuracy) <= 0)) {
        console.log("inTargetLocation finished");
        return true;
	} else {
        console.log("inTargetLocation finished");
        return false;
	}
}

//increment to the next TargetLocation
function incrementTarget() {
	console.log("incrementTarget()");
	//if ((targetNum + 1) < nTargets) {
	if ((targetNum + 1) < targetLocations.length) {
		console.log("targetNum++");
		targetNum++;
		setTargetMarkerIcons();
	} else {
		console.log("targetNum=" + targetNum + ", targetLocations.length=" + targetLocations.length);
	}
	if (DEBUG > 0) alert("targetNum=" + targetNum);
}	

//This is for testing with fakeGPS
function testLocChangeTimer() {
	if (testLocChangeTimerId != null) {
		clearTimeout(testLocChangeTimerId);
	}
	testLocChangeTimerId = setTimeout("testLocChange()", faceGPSdelay);	
}
function testLocChange() {
	console.log("testLocChange");
	updateLocation(targetLocations[targetNum]);
}


