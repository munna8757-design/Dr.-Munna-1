# Dr. Munna Assist AI — Build Plan & Feature Status

## Source already included
- Kotlin + Jetpack Compose Android starter with Home, AI Chat, Learn, Studio, Tools.
- Limited offline FAQ and sample writing; SpeechRecognizer and TextToSpeech integration.
- Three.js procedural 3D avatar demo in `Android-Starter/app/src/main/assets/avatar/index.html`, with outfit style/material changes. It is stylized, not photorealistic and uses an online CDN.
- Gemini backend routes: `/chat`, `/image`, `/video`, `/video/status`, `/video/download`.
- Server-side `GOOGLE_API_KEY` plus shared `APP_API_TOKEN` gate; Android Settings accepts HTTPS base URL and token.
- Opt-in `NotificationListenerService`, notification access settings shortcut, and basic sensitive-message keyword filtering.
- Quick app launch, Wi-Fi/Bluetooth settings, dialer/SMS draft; no covert phone control.
- GitHub Actions root workflow for Python backend tests and Android tests/lint/debug APK artifact.

## Build the APK with GitHub Actions
1. Extract the ZIP.
2. Create a GitHub repository and upload **all contents** of `Dr_Munna_Assist_AI_AIStudio_Package` to its root, including the hidden root `.github` folder.
3. Open Actions → `Verify Dr. Munna Assist AI package` → Run workflow.
4. Wait for both backend and Android jobs to pass.
5. Download `Dr-Munna-Assist-AI-debug-apk` from workflow artifacts.

If only `Android-Starter` contents are uploaded, the nested Android-only workflow can build the APK, but the root backend verification job is unavailable.

## Backend setup
Deploy `Backend-Gemini` to an HTTPS Python/Docker host. Set server environment secrets `GOOGLE_API_KEY` and a long random `APP_API_TOKEN`; never commit them. Enter the HTTPS base URL and matching token in app Settings. Image and Veo video model access, quota and cost depend on the Google account/provider.

## Not complete / needs further engineering
- Photorealistic human avatar, rigged clothing assets, facial expressions and TTS lip-sync.
- Real model-access tests for image/video, save/share validation on a device.
- Video editing/trimming, music/audio generation, 3D anatomy models.
- Full offline LLM and self-contained APK/EXE builder.
- Floating overlay and full Accessibility-based control.
- Production authentication, per-user rate limits, quotas/cost caps, privacy policy and abuse protection.

## Verification limitation
Backend syntax/tests and XML/static checks can run locally. Android Gradle `testDebugUnitTest`, `lintDebug`, `assembleDebug` and real-device testing have not run in this environment because Gradle/Android SDK are unavailable. No compiled APK is claimed until the GitHub Actions artifact exists.
