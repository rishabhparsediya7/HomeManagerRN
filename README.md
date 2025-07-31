# HomeManagerRN

HomeManagerRN is a React Native mobile application for managing household tasks, expenses, and shared responsibilities among family members or roommates.

## 🚀 Features

- Task management
- Expense tracking
- Shared responsibilities
- User authentication
- Cross-platform support (iOS & Android)

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or Yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)
- Watchman (recommended for macOS users)

## 🛠 Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/HomeManagerRN.git
   cd HomeManagerRN
   ```

2. **Install dependencies**
   ```sh
   # Using npm
   npm install
   
   # OR using Yarn
   yarn install
   ```

3. **Install iOS dependencies**
   ```sh
   cd ios && pod install && cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # API Configuration
   BASE_URL=your_api_base_url_here
   
   # Environment (development/production)
   ENVIRONMENT=development
   
   # Add other environment variables as needed
   ```

## 🚦 Available Scripts

### Development

#### Start Metro Bundler
```sh
# Development mode (default)
npm start
# or
yarn start

# Production mode
npm run start:prod
# or
yarn start:prod
```

#### Run on Android
```sh
# Development mode
npm run android-dev
# or
yarn android-dev

# Production mode
npm run android-prod
# or
yarn android-prod
```

#### Run on iOS
```sh
# Development mode
npm run ios-dev
# or
yarn ios-dev

# Production mode
npm run ios-prod
# or
yarn ios-prod
```

### Testing & Linting

#### Run Tests
```sh
npm test
# or
yarn test
```

#### Run Linter
```sh
npm run lint
# or
yarn lint
```

### Maintenance

#### Clean Build (Android)
```sh
npm run clean
# or
yarn clean
```
This will:
1. Clean the Android build
2. Remove the .gradle directory
3. Reset the Metro cache
4. Start Metro bundler on port 8081

## 📱 Tech Stack

- React Native 0.78.1
- React Navigation
- Axios for API calls
- AsyncStorage for local storage
- React Native Reanimated for animations
- React Native Vector Icons
- React Native Image Picker
- React Native Permissions
- React Native Dotenv for environment variables

## 📂 Project Structure

```
src/
├── assets/           # Images, fonts, and other static files
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── screens/          # App screens
├── services/         # API services and other services
├── store/            # State management (if using Redux/Context)
├── theme/            # Styling and theming
└── utils/            # Utility functions and helpers
```

## 🔐 Environment Variables

The following environment variables need to be set in your `.env` file:

- `BASE_URL`: The base URL for API requests
- `ENVIRONMENT`: The current environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org/)
- All other open-source libraries used in this project

---

<div align="center">
  Made with ❤️ by Rishabh Parsediya
</div>

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
