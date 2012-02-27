var floater = function () {
	//if (0) {
    console.debug('floater');
    var devicePlatform = device.platform;
    console.debug("platform=" + devicePlatform);
    if ((device.platform == 'iPhone') || (device.platform == 'iOS')) {
	    console.debug('iOS');
	    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
	    document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
	    document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
    }
	//}
};

