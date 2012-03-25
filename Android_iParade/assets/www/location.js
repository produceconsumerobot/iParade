var fakeGPS = true; // for debugging
var faceGPSdelay = 7000; // delay to achieve location

var currentLoc; // where the device is currently
var targetNum; // which target is currently being sought after
//var nTargets; // number of targets
var targetLocations; // array of TargetLocations for this parade
var gMap;
var currentMarker;
var currentCircle;
var gpsWatch;
var gpsGood;
var minAccuracy;
var checkingForTargetLocation; 
var updateLocationTimerId; // timer ID
var testLocChangeTimerId; // timer ID

function initLocation() {
	console.log("initLocation()");
	currentLoc = new Location(40.777422, -74.071198, 500.0);
	targetNum = 0;
	//nTargets = 4;
	targetLocations = new Array();
	gMap = null;
	currentMarker = null;
	currentCircle = null;
	gpsWatch = null;
	gpsGood = false;
	minAccuracy = 50;
	checkingForTargetLocation = false; 
	updateLocationTimerId = null;
	testLocChangeTimerId = null;
}

//Timer to update gps location
function startUpdateLocationTimer() {
	if (updateLocationTimerId == null) {
		updateLocationTimerId = setInterval(
				"updateLocation(targetLocations[targetNum])", 1000);
	}
}
function clearUpdateLocationTimer() {
	if (updateLocationTimerId != null) {
		clearInterval(updateLocationTimerId);
		updateLocationTimerId = null;
	}
}

function startGpsTracking() {
	var options = { "maximumAge": 3000, "timeout": 5000, "enableHighAccuracy": true };
	gpsWatch = navigator.geolocation.watchPosition(geolocationCallbackSuccess, geolocationCallbackError, options);
}

// geolocation callbacks
function geolocationCallbackSuccess(position) {
	gpsGood = true;
	updateLocation({"latitude":position.coords.latitude, "longitude":position.coords.longitude, "accuracy":position.coords.accuracy});
}
function geolocationCallbackError(error) {
	gpsGood = false;
	badGpsAlert();
//    alert('code: '    + error.code    + '\n' +
//            'message: ' + error.message + '\n');
}

function badGpsAlert() {
	alert('Location not found or innacurate.\nPlease enable GPS location services and obtain a GPS fix to continue.');
}

function checkGPS() {
	if (fakeGPS) {
		return true;
	}
	if ((gpsGood) && (currentLoc.accuracy < minAccuracy)){
		return true;
	} else {
		return false;
	}
}

//Updates the current GPS location and performs checks
function updateLocation(loc) {
	console.log("updateLocation: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	currentLoc.latitude = loc.latitude;
	currentLoc.longitude = loc.longitude;
	currentLoc.accuracy = loc.accuracy;
	
	// TODO: make conditional on whether map is showing
	updateMarkerPosition(currentLoc);
	
	
//	// TODO: read from GPS
//	if (currentLoc == null) {
//		//alert("currentLoc == null");
//		currentLoc = new Location(40.777422,-74.071198);
//	}
//
	console.log("updateLocation: checkingForTargetLocation = " + checkingForTargetLocation);
	if (checkingForTargetLocation) {
		//alert("loc=" + currentLoc.latitude + "," + currentLoc.longitude + "," + currentLoc.accuracy + " target=" + targetLocations[targetNum].latitude + "," + targetLocations[targetNum].longitude + "," + targetLocations[targetNum].accuracy);
		//alert("checkingForTargetLocation");
		if (inTargetLocation(currentLoc, targetLocations[targetNum])) {
			//alert("locationCheck true");
			console.log("Target Location reached");
			checkingForTargetLocation = false;
			nextPage();
		}
	}		

}

function initializeMap(loc) {
    console.debug('initializeMap(loc)');
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
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(tLoc.latitude, tLoc.longitude),
			map: gMap,
			icon: "./design/01_targetLocation.png",
			title:""
		});		
	}
	
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
	
	//updateMarkerPosition();
}

function updateMarkerPosition(loc) {
	console.log("updateMap: " + loc.latitude + ", " + loc.longitude + ", " + loc.accuracy);
	var latlng = new google.maps.LatLng(loc.latitude, loc.longitude);
	
	if (currentMarker) {
		currentMarker.setPosition(latlng);
	} else {
		console.log("currentMarker == null");
	}

	if (currentCircle) {
		currentCircle.setRadius(loc.accuracy);
	} else {
		console.log("currentRadius == null");
	}
}

function recenterMap() {
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
	//alert("currentLoc=" + currentLocation.latitude + ", " + currentLocation.longitude);
	//return false;

	var currlatlng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
	var targetlatlng = new google.maps.LatLng(targetLocation.latitude, targetLocation.longitude);
	var distance = google.maps.geometry.spherical.computeDistanceBetween(currlatlng, targetlatlng);
	
	console.log("inTargetLocation: distance = " + distance);
	console.log("inTargetLocation: currentLocation.accuracy = " + currentLocation.accuracy);
	console.log("inTargetLocation: targetLocation.accuracy = " + targetLocation.accuracy);
	
	if ((distance!=null) && ((distance - currentLocation.accuracy - targetLocation.accuracy) <= 0)) {
		return true;
	} else {
		return false;
	}
	
//	if ((targetLocation.latitude > (currentLocation.latitude - currentLocation.accuracy)) &&
//			(targetLocation.latitude < (currentLocation.latitude + currentLocation.accuracy)) &&
//			(targetLocation.longitude > (currentLocation.longitude - currentLocation.accuracy)) &&
//			(targetLocation.longitude < (currentLocation.longitude + currentLocation.accuracy))) {
//		return true;
//	} else {
//		return false;
//	}

	
//	if ((currentLocation.latitude > (targetLocation.loc.latitude - targetLocation.dev)) &&
//			(currentLocation.latitude < (targetLocation.loc.latitude + targetLocation.dev)) &&
//			(currentLocation.longitude > (targetLocation.loc.longitude - targetLocation.dev)) &&
//			(currentLocation.longitude < (targetLocation.loc.longitude + targetLocation.dev))) {
//		return true;
//	} else {
//		return false;
//	}

}

//increment to the next TargetLocation
function incrementTarget() {
	//if ((targetNum + 1) < nTargets) {
	if ((targetNum + 1) < targetLocations.length) {
		targetNum++;
	}
	if (DEBUG > 0) alert("targetNum=" + targetNum);
}	


//This is for testing with fakeGPS
function testLocChangeTimer() {
	if (testLocChangeTimerId != null) {
		clearTimeout(testLocChangeTimerId);
	}
	testLocChangeTimerId = setTimeout("testLocChange()", faceGPSdelay);	
	//alert("targetNum = " + targetNum);
}
function testLocChange() {
	console.log("testLocChange");
	//alert("testLocChange");
	updateLocation(targetLocations[targetNum]);
	//currentLoc = targetLocations[targetNum];
}

//Location constructor
function Location(latitude, longitude, accuracy) {
	this.latitude = latitude;
	this.longitude = longitude;
	this.accuracy = accuracy;
}

//Lookup the targetLocations
//Currently all locations are hard-coded
//In the future locations may be acquired via remote lookup
function getTargetLocations(currentLocation) {
	console.log("getTargetLocations(" + currentLocation + ")");
	fileName = "targetLocations.json";
	filePath = contentImageDir + fileName;
	
	$.getJSON( filePath )
	.success(function(data) {parseTargetLocations(data);})
	.error(function(err) { 
		console.erorr("ERROR with $.getJSON(" + filePath + ")");
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
	
//	function onSuccess(data) {
//	}

//	var accuracy = 1.0;
//	targetLocations[0] = new Location(0.0,0.0, accuracy);
//	targetLocations[1] = new Location(40.763495,-73.981381, accuracy);
//	targetLocations[2] = new Location(40.762471,-73.978935, accuracy);
//	targetLocations[3] = new Location(40.761476,-73.978173, accuracy);
	//alert("getTargetLocations: " + targetLocations[0].loc.latitude);
}


