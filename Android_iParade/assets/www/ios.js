var floater = function () {
    console.log('floater');
    //console.log(window.pageYOffset + ', ' + (document.documentElement.clientHeight - window.pageYOffset + window.innerHeight));
    document.getElementById('tabs').style.top = (window.pageYOffset) + 'px';
    document.getElementById('tabs').style.bottom = (-window.pageYOffset) + 'px';
};

window.onscroll = floater;