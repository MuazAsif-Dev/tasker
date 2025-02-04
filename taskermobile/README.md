Tasker Mobile App

The react native client for the Tasker project.

# Prerequisites

- Node.js (v22.13.1)
- Bun (package manager)
- React Native
- Firebase project (for push notifications)
  - `GoogleService-Info.plist` (for iOS) in ios/{place here}
  - `google-services.json` (for Android) in android/app/{place here}
- Google Cloud project (for Google OAuth Client IDs)

## Environment Variables

Create a `.env` file in the root directory, following the structure in `.env.example` for all required environment variables

# Getting Started

## Step 1: Start Metro

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start

# OR using Bun
bun start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android

# OR using Bun
bun run android
```

#### Note: If you are running into issues building the app, try the following and then run the build again:

```sh
cd android && ./gradlew clean
```

### iOS

```sh
cd ios && pod install
```

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios

# OR using Bun
bun run ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.
