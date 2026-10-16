# Dr. Munna Assist AI — Android Starter

**Project type:** Kotlin + Jetpack Compose Android app source. **This ZIP does not contain a built APK.**

## What works in this starter
- Native Android app shell and bottom navigation
- Home screen and feature cards
- Local demo chat (not connected to a live AI model)
- Education Center topics for anatomy and evidence-based sexual/reproductive health
- Clearly labelled placeholder pages for Creation Studio and Tools/Builder

## Not connected yet
- Live Gemini/other AI answers, secure backend, and API credentials
- Real-time 3D avatar, lip-sync, outfit assets, and avatar animation
- Image/audio/video generation providers
- Software build/export service
- Notification reading, floating overlay, Accessibility Service app control, or location sharing

Do not put a Gemini/API key in the Android app or public GitHub repository. Use a backend service to protect credentials.

## Build locally with Android Studio
1. Install Android Studio and Android SDK Platform 35.
2. Extract the ZIP.
3. Android Studio → **Open** → select the `Android-Starter` folder (the folder containing `settings.gradle.kts`).
4. Let Gradle sync finish. Use JDK 17 if Android Studio asks.
5. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
6. The debug APK should appear at `app/build/outputs/apk/debug/app-debug.apk` if the build succeeds.

## Build APK in GitHub Actions (cloud build)
1. Create a new empty repository on GitHub.
2. Upload the **contents** of the `Android-Starter` folder to the repository root (not the parent ZIP folder). Include the hidden `.github` folder.
3. Commit/push to `main` or `master`. The workflow at `.github/workflows/build-apk.yml` will run automatically. You can also go to **Actions → Build Dr. Munna Assist AI APK → Run workflow**.
4. Open the completed workflow run, scroll to **Artifacts**, and download `Dr-Munna-Assist-AI-debug-apk`.
5. Extract the artifact ZIP to get `app-debug.apk`, then transfer it to your Android phone and install it. Android may ask you to allow installation from that file app.

The workflow and source are provided, but the remote build has **not** run yet. GitHub will only produce the APK after you upload the source and the workflow succeeds. A debug APK is for testing, not a signed Play Store release.

## Security and permissions
- Do not add covert tracking, caller-ID spoofing, secret recording, or unauthorized account access.
- Phone/SMS, notification reading, overlay, Accessibility Service, and location functions must be separately implemented with transparent explanations and user consent.
- Educational reproductive anatomy and sexual-health content should remain clinical and age-appropriate, using verified/licensed educational assets.
