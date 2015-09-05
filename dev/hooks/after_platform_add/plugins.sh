#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
    "cordova-plugin-device",
    "cordova-plugin-console",
    "cordova-plugin-dialogs",
    "cordova-plugin-file",
    "cordova-plugin-file-transfer",
    "cordova-plugin-inappbrowser",
    "cordova-plugin-media",
    "cordova-plugin-network-information",
    "cordova-plugin-vibration",
    "cordova-plugin-geolocation",
    "cordova-plugin-whitelist",
    "com.moust.cordova.videoplayer"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
