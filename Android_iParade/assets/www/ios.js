var floater = function () {
	//if (0) {
    console.debug('floater');
    var dp = device.platform;
    console.debug("platform=" + dp);
    if ((dp.toLowerCase().search("iphone") >= 0) ||
        (dp.toLowerCase().search("ipad") >= 0) ||
        (dp.toLowerCase().search("ios") >= 0))
    {
 	    console.debug('iOS');
	    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
	    document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
	    document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
    }
	//}
};

