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
        var dv = device.version;
        console.log("device.version=" + dv);
        var maxVersion = "5.0.0";
        //var vs;
        //if (dv) { vs = dv.split("."); }
        //if (vs && (vs.length >= 3) && (vs[0] <= 5) && (vs[1] <= 0) && (vs[2] <= 0)) {
        if (dv && (dv <= maxVersion)) {
            console.log("adjusting menu position (max v=" + maxVersion + ")");
        var top = $(window).scrollTop() + 'px';
        var bottom = (-$(window).scrollTop()) + 'px';
        //var bottom = ($(window).scrollTop() + getWindowHeight()) + 'px';
        console.log("top=" + top);
        console.log("bottom=" + bottom);
	    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
	    //document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
	    //document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
        //console.log("html.scrollTop=" + $("html").scrollTop());
        //console.log("window.scrollTop=" + $(window).scrollTop());
        $("#tabs").css("top", top);
        $("#tabs").css("bottom", bottom);
        //$("#tabs").css("bottom", ($(window).scrollTop() + getWindowHeight()) + 'px');
        }
    }
	//}
    console.log('floater() finished'); 
};

