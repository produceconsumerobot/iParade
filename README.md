# iOS

After running `phonegap build ios`, a few things need to be set from within
XCode, as I haven't yet found a way to manage the plist settings properly from
config.xml.

- In ```iParade > Deployment info```, check boxes for *Device Orientation* to
"Landscape Left" and "Landscape Right" for both iPhone and iPad
- In ```iParade > Resources > iParade-Info.plist``` add a row for *View
controller-based status bar appearance* and set the Value to "NO".  Add another
row for *Status bar is initially hidden* and set the Value to "YES".
