var fakeGPS = false; // for debugging
var fakeGPSdelay = 7000; // delay to achieve location

var currentLoc; // where the device is currently
var targetNum; // which target is currently being sought after
var targetLocations; // array of TargetLocations for this parade
var infoWindows;
var gMap;
var currentMarker;
var currentCircle;
var targetMarkers;
var gpsWatch = null;
var gpsWatch2 = null;
var gpsGood;
var minAccuracy = 50;
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
	currentLoc = null;
	targetNum = 0;
	targetLocations = new Array();
	infoWindows = new Array();
	gMap = null;
	currentMarker = null;
	currentCircle = null;
	targetMarkers = new Array();
	gpsWatch = null;
	gpsWatch2 = null;
	gpsGood = false;
	checkingForTargetLocation = false; 
	updateLocationTimerId = null;
	testLocChangeTimerId = null;
    console.log("initLocation() finished");
}

function initializeMap(loc) {
    console.log('initializeMap(loc)');
	
	console.log("initializeMap: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	var latlng = new google.maps.LatLng(loc.latitude, loc.longitude);
	
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
	gMap = new google.maps.Map(m, myOptions);
	
	currentMarker = new google.maps.Marker({
                                           position: latlng,
                                           map: gMap,
                                           title:"Your are here"
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

function setZoom(zoom) {
	console.log("setZoom(" + zoom + ")");
	gMap.setZoom(zoom);
	console.log("setZoom finished");
}

function setTargetMarkers(targets) {
    console.log("setTargetMarkers()");
	for (var i=0; i<targets.length; i++ ) {
		var tLoc = targets[i];
		console.log("Marker " + ":" + tLoc.latitude + ", " + tLoc.longitude + ", " + tLoc.accuracy);
		targetMarkers[i] = new google.maps.Marker({
                                            position: new google.maps.LatLng(tLoc.latitude, tLoc.longitude),
                                            map: gMap,
                                            icon: "design/targetLocation_next.png",
                                            title: ""
                                            });		
	}
	console.log("setTargetMarkers Finished");
}

function setTargetMarkerInfoWindows(titles) {
	if (titles){
		for (var i=0; i<targetMarkers.length; i++ ) {
			if (titles[i]) {
				console.log("Setting title: " + titles[i]);
				var html = "";
				html = html + "<span class='mapInfo'>" + titles[i] + "</span>";
				html = html + "<button ontouchstart='initIparade("+ i +")'>Go!</button>";
				infoWindows[i] = new google.maps.InfoWindow({content: html});

				google.maps.event.addListener(targetMarkers[i], 'click', function() {
					for (var j=0; j<targetMarkers.length; j++ ) {
						if (this == targetMarkers[j]) {
							console.log("marker click: " + j);
							infoWindows[j].open(gMap,this);
						}
					}
				});
			}
		}
	}
}

function setTargetMarkerIcons() {
	console.log("setTargetMarkerIcons()");
	for (var i=0; i<targetMarkers.length; i++ ) {
		if (i == targetNum) {
			targetMarkers[i].setIcon("design/targetLocation_next.png");
		} else if (i < targetNum) {
			targetMarkers[i].setIcon("design/targetLocation_visited.png");
		} else {
			targetMarkers[i].setIcon("design/targetLocation.png");
		}
	}
	console.log("setTargetMarkerIcons finished");
}

function AutoBounds(markers) {
	console.log("AutoBounds()");
	var bounds = new google.maps.LatLngBounds();
	var latlng = new google.maps.LatLng(currentLoc.latitude, currentLoc.longitude);
	console.log("currentLoc:" + currentLoc.latitude + "," + currentLoc.longitude);
	bounds.extend(latlng);
	for (var i=0; i<markers.length; i++) {
		console.log("Marker" + i + ":" + markers[i].position.lat() + "," +  markers[i].position.lng());
		bounds.extend(markers[i].position);
	}
	if (gMap.getBounds()) {
		console.log("getBounds=" + gMap.getBounds().toString());
	} else {
		console.log("Map Bounds not yet set");
	}
	console.log("AutoBounds=" + bounds.toString());
	gMap.fitBounds(bounds);
	console.log("AutoBounds finished");
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

		for (var i=0; i<data.length; i++) {
			console.log("TargetLocation" + i);
			if ((data[i].latitude) && (data[i].longitude) && (data[i].accuracy)) {
				console.log(data[i].latitude + ", " + data[i].longitude + ", " + data[i].accuracy);
				targetLocations[i] = new Location(data[i].latitude, data[i].longitude, data[i].accuracy);
			} else {
				console.error("TargetLocation " + i + "is missing data");
			}
		}
		
		initializeMap(currentLocation);
    	setTargetMarkers(targetLocations);
    	setTargetMarkerIcons();
	}
    console.log("getTargetLocations() finished");
}

//Updates the current GPS location and performs checks
function updateLocation(loc) {
	console.log("updateLocation: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	
	if (!currentLoc) {
		// This is the first location update
		// call back to start processes
		getIparades(loc);
		currentLoc = new Location(loc.latitude, loc.longitude, loc.accuracy);
	} else {
		currentLoc.latitude = loc.latitude;
		currentLoc.longitude = loc.longitude;
		currentLoc.accuracy = loc.accuracy;
	}
	
	// TODO: make conditional on whether map is showing?
	updateMarkerPosition(currentLoc);
	
	console.log("updateLocation: checkingForTargetLocation = " + checkingForTargetLocation);
	if (checkingForTargetLocation) {
		if (targetLocations[targetNum]) {
			if (inTargetLocation(currentLoc, targetLocations[targetNum])) {
				console.log("Target Location reached");
				
				nextPage();
			}
		}
	}		
    console.log("updateLocation finished");
}

function startGpsTracking() {
	console.log("startGpsTracking()");
	//var options = { frequency: 1000, "maximumAge": 3000, "timeout": 5000, "enableHighAccuracy": true };
	var options = { frequency: 3000, maximumAge: 5000, timeout: 10000, enableHighAccuracy: true };
	gpsWatch = navigator.geolocation.watchPosition(geolocationCallbackSuccess, geolocationCallbackError, options);
	gpsWatch2 = setInterval( function() {navigator.geolocation.getCurrentPosition(geolocationCallbackSuccess, geolocationCallbackError, options);}, 7500);


	// geolocation callbacks
	function geolocationCallbackSuccess(position) {
		console.log("geolocationCallbackSuccess(): " + position.coords.latitude + ", " + position.coords.longitude + ", " + position.coords.accuracy + ", ");
		gpsGood = true;
		updateLocation({"latitude":position.coords.latitude, "longitude":position.coords.longitude, "accuracy":position.coords.accuracy});
	}
	function geolocationCallbackError(error) {
		console.log("geolocationCallbackError()");
		for (e in error) {
			console.log(e + ": " + error[e]);
		}
		//gpsGood = false;
		//badGpsAlert();
	}
}

function stopGpsTracking() {
	console.log("stopGpsTracking()");
	if (gpsWatch) {
		navigator.geolocation.clearWatch(gpsWatch);
		gpsWatch = null;
	}
	if (gpsWatch2) {
		window.clearInterval(gpsWatch2);
		gpsWatch2 = null;
	}
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
	if (device.platform.toLowerCase().search("android") >= 0) {
		if (gpsGood && currentLoc.accuracy < minAccuracy) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
	
	//if ((gpsGood) && (currentLoc.accuracy < minAccuracy)){
	//	return true;
	//} else {
	//	return false;
	//}
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
	
	if ((distance!=null) && ((distance - targetLocation.accuracy) <= 0)) {
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
	if ((targetNum) < targetLocations.length) {
		console.log("targetNum++");
		targetNum++;
		setTargetMarkerIcons();
	} else {
		console.log("targetNum=" + targetNum + ", targetLocations.length=" + targetLocations.length);
	}
}	

//This is for testing with fakeGPS
function testLocChangeTimer() {
	if (testLocChangeTimerId != null) {
		clearTimeout(testLocChangeTimerId);
	}
	testLocChangeTimerId = setTimeout("testLocChange()", fakeGPSdelay);	
}
function testLocChange() {
	console.log("testLocChange");
	if (targetLocations[targetNum]) {
		updateLocation(targetLocations[targetNum]);
	}
}


