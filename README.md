# SchiffeVRsenken 🚤

WebXR project for HBRS module **_Web Engineering_**.

## Setup: Browser

- Install WebXR API Emulator in your Chrome browser:

```
https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje
```

## Setup: Oculus Quest 2

1. Enable developer mode:

```
https://learn.adafruit.com/sideloading-on-oculus-quest/enable-developer-mode
```

2. Connect your Quest with your PC via USB/USB-C. Accept the dialog popping up when connected to the PC.
3. Download Android SDK Platform Tools:

```
https://developer.android.com/studio/releases/platform-tools
```

Optional: Put the downloaded files into the folder [ext](./ext) for an easier access.

4. If the Quest is properly connected, it should show in:

```bash
./ext/platform-tools/adb devices
```

5. Forward the port used to host the site (Default for Live Server in Webstorm is 63342):

```bash
./ext/platform-tools/adb reverse tcp:63342 tcp:63342
```

6. Webstorm: Go to ```Settings | Build, Execution, Deployment | Debugger``` and click on ```Allow unsigned requests```.
7. Open your Oculus browser and go to:

```
http://localhost:63342/SchiffeVRsenken/index.html
```

The URL may differ according to your folder structure.
