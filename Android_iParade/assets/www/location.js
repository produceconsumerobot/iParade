var fakeGPS = true; // for debugging
var faceGPSdelay = 7000; // delay to achieve location

var currentLoc; // where the device is currently
var targetNum; // which target is currently being sought after
var nTargets; // number of targets
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
	currentLoc = new Location(40.777422, -74.071198, 500.0);
	targetNum = 0;
	nTargets = 4;
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
	updateLocation({"lat":position.coords.latitude, "lon":position.coords.longitude, "acc":position.coords.accuracy});
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
	if ((gpsGood) && (currentLoc.acc < minAccuracy)){
		return true;
	} else {
		return false;
	}
}

//Updates the current GPS location and performs checks
function updateLocation(loc) {
	console.log("updateLocation: " + loc.lat + ", " + loc.lon + ", " + loc.acc);
	currentLoc.lat = loc.lat;
	currentLoc.lon = loc.lon;
	currentLoc.acc = loc.acc;
	
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
		//alert("loc=" + currentLoc.lat + "," + currentLoc.lon + "," + currentLoc.acc + " target=" + targetLocations[targetNum].lat + "," + targetLocations[targetNum].lon + "," + targetLocations[targetNum].acc);
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
	
	console.log("initializeMap: " + loc.lat + ", " + loc.lon + ", " + loc.acc);
	var latlng = new google.maps.LatLng(loc.lat, loc.lon);
	
	getTargetLocations(currentLoc);
	
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
		//console.log("initializeMap: " + tLoc.lat + ", " + tLoc.lon + ", " + tLoc.acc);
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(tLoc.lat, tLoc.lon),
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
	      radius: currentLoc.acc
	    });
    currentCircle.bindTo('center', currentMarker, 'position');
	
	//updateMarkerPosition();
}

function updateMarkerPosition(loc) {
	console.log("updateMap: " + loc.lat + ", " + loc.lon + ", " + loc.acc);
	var latlng = new google.maps.LatLng(loc.lat, loc.lon);
	
	if (currentMarker) {
		currentMarker.setPosition(latlng);
	} else {
		console.log("currentMarker == null");
	}

	if (currentCircle) {
		currentCircle.setRadius(loc.acc);
	} else {
		console.log("currentRadius == null");
	}
}

function recenterMap() {
	if (gMap) {
		var latlng = new google.maps.LatLng(currentLoc.lat, currentLoc.lon);
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
	console.log("inTargetLocation: " + currentLocation.lat + ", " + currentLocation.lon +
			"; " + targetLocation.lat + ", " + targetLocation.lon);
	//alert("currentLoc=" + currentLocation.lat + ", " + currentLocation.lon);
	//return false;

	var currlatlng = new google.maps.LatLng(currentLocation.lat, currentLocation.lon);
	var targetlatlng = new google.maps.LatLng(targetLocation.lat, targetLocation.lon);
	var distance = google.maps.geometry.spherical.computeDistanceBetween(currlatlng, targetlatlng);
	
	console.log("inTargetLocation: distance = " + distance);
	console.log("inTargetLocation: currentLocation.acc = " + currentLocation.acc);
	console.log("inTargetLocation: targetLocation.acc = " + targetLocation.acc);
	
	if ((distance!=null) && ((distance - currentLocation.acc - targetLocation.acc) <= 0)) {
		return true;
	} else {
		return false;
	}
	
//	if ((targetLocation.lat > (currentLocation.lat - currentLocation.acc)) &&
//			(targetLocation.lat < (currentLocation.lat + currentLocation.acc)) &&
//			(targetLocation.lon > (currentLocation.lon - currentLocation.acc)) &&
//			(targetLocation.lon < (currentLocation.lon + currentLocation.acc))) {
//		return true;
//	} else {
//		return false;
//	}

	
//	if ((currentLocation.lat > (targetLocation.loc.lat - targetLocation.dev)) &&
//			(currentLocation.lat < (targetLocation.loc.lat + targetLocation.dev)) &&
//			(currentLocation.lon > (targetLocation.loc.lon - targetLocation.dev)) &&
//			(currentLocation.lon < (targetLocation.loc.lon + targetLocation.dev))) {
//		return true;
//	} else {
//		return false;
//	}

}

//increment to the next TargetLocation
function incrementTarget() {
	if ((targetNum + 1) < nTargets) {
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
	this.lat = latitude;
	this.lon = longitude;
	this.acc = accuracy;
}

//Lookup the targetLocations
//Currently all locations are hard-coded
//In the future locations may be acquired via remote lookup
function getTargetLocations(currentLocation) {
	// This would ideally read from a remote server

	var accuracy = 1.0;
	targetLocations[0] = new Location(0.0,0.0, accuracy);
	targetLocations[1] = new Location(40.763495,-73.981381, accuracy);
	targetLocations[2] = new Location(40.762471,-73.978935, accuracy);
	targetLocations[3] = new Location(40.761476,-73.978173, accuracy);
	//alert("getTargetLocations: " + targetLocations[0].loc.lat);
}


