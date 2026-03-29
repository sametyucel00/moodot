# iOS Ready Notes

Project is prepared for iOS EAS builds with:

- `Moodot` app name on iOS
- `com.moodot` bundle identifier
- Apple Sign In capability
- iOS build profile in `eas.json`
- GitHub Actions workflow for manual EAS iOS builds
- App Store export-compliance flag set for standard exempt encryption use
- AdMob SKAdNetwork identifiers added for iOS attribution support

GitHub Actions secrets to add:

- `EXPO_TOKEN`
- `ADMOB_ANDROID_APP_ID`
- `ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID`
- `EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID`
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
- `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
- `EXPO_PUBLIC_REVENUECAT_PRODUCT_ID`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_FIREBASE_MOODOT_ROOT`
- `EXPO_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID`
- `EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID`

Before the first iOS build, make sure these are ready:

1. Expo account owns the EAS project.
2. Apple Developer account is connected in Expo.
3. App Store Connect app exists for `com.moodot`.
4. `EXPO_TOKEN` is added to GitHub repository secrets.
5. EAS environment variables are present for production.
6. RevenueCat iOS production API key is used before release builds.

Suggested first build command if running manually:

```bash
eas build -p ios --profile preview
```

Suggested production build later:

```bash
eas build -p ios --profile production
```
