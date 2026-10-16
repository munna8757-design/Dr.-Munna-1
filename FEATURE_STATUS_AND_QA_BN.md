# Dr. Munna Assist AI — Feature Status & QA (2026-10-16)

Status legend: **Implemented in source** does not mean compiled/device-tested.

| Feature | Source status | What is still needed |
|---|---|---|
| Compose navigation and home | Implemented in source | Gradle build + device UI test |
| Offline FAQ / writing samples | Limited demo | Not generative AI; expand only with tests |
| Live Gemini chat | Backend + Android client | Deploy HTTPS backend, set `GOOGLE_API_KEY` and `APP_API_TOKEN`, enter URL + token, real API test |
| Speech-to-text | Android SpeechRecognizer | Runtime microphone permission + device/language test |
| Text-to-speech | Android TextToSpeech | Test Bengali voice availability on device |
| 3D avatar | Procedural Three.js 3D demo | Requires internet for CDN; stylized, not photorealistic; test WebView/WebGL on device |
| Outfit switching | Avatar mesh/material changes | Test all controls on device; realistic clothes need a rigged asset |
| Text-to-image | Backend `/image` + Android preview code | Verify current model/access/quota, deploy HTTPS, test real image result |
| Text-to-video | Backend `/video`, `/video/status`, `/video/download` + UI | Veo access/billing, real job test, download/preview test |
| Notification reader | Android listener + app opt-in + sensitive keyword filter | User must enable Android Notification Access; test real notifications and privacy behavior |
| Mobile control | App launchers, Wi-Fi/Bluetooth settings, dialer/SMS draft | Intent behavior depends on installed apps; no covert automation |
| 3D anatomy assets | Not implemented | Add licensed educational model and validate rendering |
| Video trimming/editing | Not implemented | Add tested media editing dependency/workflow |
| Music/audio generation | Not implemented | Requires separate provider/model and UI |
| Full offline LLM | Not implemented | Download/ship a supported local model; storage/RAM/performance tests |
| APK/EXE self-builder inside app | Not implemented | Use real CI/build service; no local arbitrary code execution |

## Checks performed in this packaging pass
- Python syntax compilation for backend and tests.
- Backend unit tests: **6 passed**, covering `/health`, missing provider key, missing access token, unknown route and invalid video operation.
- XML parse for Android manifest and FileProvider paths.
- Kotlin delimiter balance / source review (not a substitute for compilation).
- ZIP integrity check after final packaging.

## Not yet verified
- Android Gradle `testDebugUnitTest`, `lintDebug`, `assembleDebug` have **not** been run in this environment because Gradle/Android SDK are unavailable here.
- No generated APK or real-device test is claimed.
- Live Google API requests have not been made; model access, quotas, regional availability and billing depend on the user's Google AI account.

## Before public release
The shared `APP_API_TOKEN` is a basic gate, not full user authentication. Add per-user authentication, rate limits, provider cost caps, privacy policy/consent, retention controls and robust abuse prevention. The included minimal backend is a starter, not a hardened public service.
