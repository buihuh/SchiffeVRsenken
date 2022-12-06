# SchiffeVRsenken 🚤

WebXR project for HBRS module **_Web Engineering_**.

## Getting started

Install [Node.js](https://nodejs.org/en/download/) and run:

```bash
npm install
```

### Setup: Firebase

For security reasons the config file for Firebase is excluded and needed to be added manually. Therefore, please add the
file `firebase-config.ts` in the folder [./src/firebase/firebase-config.ts](src/firebase). Please
contact the admin for more information.

### Setup: Browser

Install WebXR API Emulator in your Chrome browser:

```
https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje
```

### Setup: Oculus Quest 2

1. Enable developer mode:

```
https://learn.adafruit.com/sideloading-on-oculus-quest/enable-developer-mode
```

2. Connect your Quest with your PC via USB/USB-C. Accept the dialog popping up when connected to the PC.
3. Download Android SDK Platform Tools:

```
https://developer.android.com/studio/releases/platform-tools
```

Optional: Put the downloaded files into the folder [./ext](./ext) for an easier access.

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
http://localhost:63342/SchiffeVRsenken
```

The URL may differ according to your folder structure.

## Development

The project needed be built before running the index.html file:

```bash
npm run build
```

Check for newer dependency versions in package.json:

```bash
npx npm-check-updates
```

Upgrade versions in package.json (+ run ```npm install``` afterwards):

```bash
npx npm-check-updates -u
```