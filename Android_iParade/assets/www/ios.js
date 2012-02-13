var floater = function () {
    console.debug('floater');
    var devidePlatform = window.device.platform;
    console.debug(devidePlatform);
    if ((device.platform == 'iPhone') || (device.platform == 'iOS')) {
    console.debug('iOS');
    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
    document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
    document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
    }
};

window.onscroll = floater;