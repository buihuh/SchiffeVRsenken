# SchiffeVRsenken 🚤

WebXR project for HBRS module 'Web Engineering'.

## Setup: Browser

- Install WebXR API Emulator in your Chrome browser

```
https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje/related?hl=de 
```

## Setup: Oculus Quest 2

1. Enable developer mode:

```
https://learn.adafruit.com/sideloading-on-oculus-quest/enable-developer-mode
```

2. Connect your Quest with your PC via USB/USB-C. Accept the dialog popping up when connected to the PC
3. Download Android SDK Platform Tools:

```
https://developer.android.com/studio/releases/platform-tools
```

Optional: Put the downloaded files into the folder [ext](./ext) for an easier access.

4. If the Quest is properly connected, it should show in:

```bash
./adb devices
```

5. Forward the port used to host the site (Default for Live Server in Webstorm is 63342):

```bash
./adb reverse tcp:PORT tcp:PORT
```

6. Webstorm: Go to ```Settings | Build, Execution, Deployment | Debugger``` and click on ```Allow unsigned requests```.
7. Navigate to http://localhost:PORT/SchiffeVRsenken/index.html in the Oculus browser.
