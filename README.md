# SchiffeVRsenken
WebXR project for HBRS module 'Web Engineering'

## How to test on Quest 2
- Enable developer mode: https://learn.adafruit.com/sideloading-on-oculus-quest/enable-developer-mode
- Accept the dialog popping up when connected to the PC
- Install Android SDK Platform Tools: https://developer.android.com/studio/releases/platform-tools
- If the Quest is properly connected, it should show in ```adb devices```
- Forward the port used to host the site (Default for Live Server in Webstorm is 63342): ```adb reverse tcp:PORT tcp:PORT```
- Navigate to http://localhost:PORT in the Oculus browser
