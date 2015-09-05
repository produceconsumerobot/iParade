# Installation

iParade requires [Cordova](https://cordova.apache.org). Once installed, go to
the ```/dev``` directory of this repository and run the following commands:

```
cordova platform add ios
cordova platform add android
```

This will build the applications in the ```/platforms``` directory.

Plugins are managed via shell script [dev/hooks/after_platform_add/plugins.sh](dev/hooks/after_platform_add/plugins.sh)
which is run after each platform is added. You can also manually add or remove
plugins via the CLI:

```
cordova plugin add [plugin name]
cordova plugin rm [plugin name]
```

Plugins and platforms should not be saved to this repository, but rather
rebuilt on the local developer's file system.

# Simulation/Emulation

The iParade application can be tested using the iOS Simulator and/or the
Android Emulator. Check the [Cordova CLI documentation](http://cordova.apache.org/docs/en/5.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface) for more
information.

## iOS

The iOS simulator can be quirky when it comes to location services. If the
location is not set prior to the application loading, the geolocation error
callback will probably get thrown. To simulate the locations, open the built
iOS project, found at ```/dev/platforms/ios/iParade.xcodeproj```. Run the
project, and in XCode go to the menu: Debug > Simulate Location > Add GPX File
to Project. GPX location files are located in the [locations](locations) directory.

Sometimes, the application will not recognize the location on the first try.
After loading the GPX files and setting the location, try quitting the iOS
Simulator and running it again from XCode.

## Android

The Android Emulators are also a little quirky when it comes to location
services and GPS positioning. As per the [Android Emulator docs](http://developer.android.com/tools/devices/emulator.html), you can
set the location from the command line. After downloading the Android SDK and
creating a virtual device, start the emulator from the command line with:

```
cordova emulate --target=YourVirtualDeviceName android
```

Once the emulator is running, run:

```
telnet localhost 5554
```

And then use the geofix command to set the location:

```
geo fix -73.948793 40.822375
```

Note that longitude value comes first.

# Debugging

## iOS

When running the app from XCode, console.log outputs to the XCode debugger
pane. But you can also use the Safari Web Inspector tools to inspect the DOM,
insert JS breakpoints, and more. Once the Simulator is running, open Safari.
Click the [Develop](https://developer.apple.com/safari/tools/) menu and select
iOS Simulator.

## Android

Chrome provides a similar inspector for the Android Emulator. Once the
virtual device is running, open Chrome and proceed to [chrome://inspect/#devices](chrome://inspect/#devices).
Click the ```inspect``` link for the emulated to device to access the Chrome
inspector.

A full Android system log can be tailed via the command line with:

```
adb logcat
```
