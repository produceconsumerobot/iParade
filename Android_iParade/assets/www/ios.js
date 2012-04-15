var floater = function () {
	//if (0) {
    console.log('floater()');
    
    var dp = device.platform;
    console.log("platform=" + dp);
    if ((dp.toLowerCase().search("iphone") >= 0) ||
        (dp.toLowerCase().search("ipad") >= 0) ||
        (dp.toLowerCase().search("ios") >= 0))
    {
 	    console.log('iOS');
	    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
	    //document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
	    //document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
        console.log("html.scrollTop=" + $("html").scrollTop());
        console.log("window.scrollTop=" + $(window).scrollTop());
        $("#tabs").css("top", $("html").scrollTop());
        //$("#tabs").css("bottom", $("html").scrollTop());
    }
	//}
    console.log('floater() finished'); 
};

