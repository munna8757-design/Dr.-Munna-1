# Dr. Munna Assist AI — Android + Gemini Backend Starter

এই ZIP-এ Android Kotlin/Jetpack Compose source, Google Gemini backend starter, 3D avatar demo, notification reader source, AI image/video endpoint এবং GitHub Actions verification workflow আছে। **এটি এখনো APK নয় এবং Android compile/device test সফল হয়েছে বলে দাবি করা হচ্ছে না।**

## এই source-এ কী আছে
- Android app: Home, AI Chat, Learn, Creation Studio, Tools.
- সীমিত offline FAQ ও sample writing; এটি পূর্ণ offline generative AI নয়।
- Android SpeechRecognizer voice input এবং TextToSpeech reply.
- Three.js দিয়ে procedural 3D avatar demo; outfit selector-এর মাধ্যমে clothing material/style বদলায়। এটি photorealistic human model বা lip-sync নয় এবং CDN load করতে internet লাগে।
- Backend `/chat` for Gemini text, `/image` for image generation, `/video` + `/video/status` + `/video/download` for asynchronous Veo jobs.
- NotificationListenerService: default off, app-level opt-in ও Android Notification Access লাগে; সম্ভাব্য OTP/bank/payment messages-এর জন্য basic keyword filter আছে।
- YouTube/Facebook launch, Wi-Fi/Bluetooth settings shortcut, dialer এবং SMS draft. Phone/SMS নিজে থেকে পাঠানো হয় না।
- GitHub workflow: backend tests, Android unit tests, lint, debug APK build এবং artifact upload.

## Live AI/backend setup
1. `Backend-Gemini/README_BN.md` ও `.env.example` পড়ুন।
2. Hosting secret-এ `GOOGLE_API_KEY` এবং আলাদা long random `APP_API_TOKEN` সেট করুন। Token তৈরির উদাহরণ: `openssl rand -hex 32`। Real keys/token GitHub source-এ commit করবেন না।
3. `Backend-Gemini` HTTPS hosting-এ deploy করুন। `Dockerfile` আছে।
4. Android app → Settings → AI Backend সেটিংস-এ HTTPS base URL ও একই `APP_API_TOKEN` দিন। URL-এর শেষে `/chat` যোগ করবেন না।
5. `/health` endpoint শুধু server status দেখায়; এটি model entitlement/quotas-এর পূর্ণ পরীক্ষা নয়।

**খরচ:** Chat/image/video provider access, region, quota ও billing account-ভেদে বদলায়। বিশেষ করে video generation ব্যয়বহুল হতে পারে। ব্যবহার করার আগে Google AI console-এ current terms/limits যাচাই করুন।

## GitHub-এ পুরো project দিয়ে APK build (প্রস্তাবিত)
1. ZIP Extract করুন।
2. GitHub-এ নতুন repository তৈরি করুন।
3. `Dr_Munna_Assist_AI_AIStudio_Package` ফোল্ডারের **ভেতরের সব ফাইল** repository root-এ upload করুন; root-এর hidden `.github` folder-ও থাকতে হবে।
4. GitHub → Actions → **Verify Dr. Munna Assist AI package** → Run workflow.
5. Workflow-এর `verify-backend` ও `build-android` jobs সফল হলে run-এর Artifacts থেকে `Dr-Munna-Assist-AI-debug-apk` ডাউনলোড করুন। APK হলো `app-debug.apk`।

শুধু `Android-Starter`-এর contents upload করলে nested `build-apk.yml` ব্যবহার করা যায়, কিন্তু backend tests/root workflow চলবে না।

## Google AI Studio ব্যবহার
- `GOOGLE_AI_STUDIO_START_HERE_BN.md` পড়ুন।
- `AI-Studio-Prompt/GOOGLE_AI_STUDIO_MASTER_PROMPT_BN.txt` পুরোটা prompt হিসেবে দিন এবং source files attach করুন।
- AI Studio-কে প্রথমে source audit, তারপর incremental edits, Gradle tests/lint/build এবং `FEATURE_STATUS_AND_QA_BN.md` update করতে বলুন।

## এখনও অসম্পূর্ণ / external setup দরকার
- Photorealistic 3D avatar, rigged clothing assets, facial expressions ও synchronized lip-sync.
- Real image/video generation-এর end-to-end provider tests; account/model access ও billing লাগতে পারে।
- Video trimming/editing, music/audio generation, 3D anatomy assets.
- Full offline LLM, automatic APK/EXE build inside app, production authentication, per-user quotas/rate limits.
- Floating overlay ও full Accessibility-based app control. Current mobile tools are safe launch/settings shortcuts only.

## Privacy and security
- AI prompt backend এবং Google provider-এ যায়। ব্যবহারকারীর সামনে privacy/consent notice দিতে হবে।
- `APP_API_TOKEN` basic shared-token gate; full user authentication নয়। Public release-এর আগে per-user auth, rate limits, quotas/cost caps, abuse prevention ও privacy review প্রয়োজন।
- Notification reader default বন্ধ; user-কে app toggle এবং Android Notification Access দুটোই enable করতে হবে। Notifications app storage-এ রাখা বা backend-এ পাঠানো হয় না।
- Health education সাধারণ তথ্য; diagnosis/medical treatment-এর বিকল্প নয়।

## Verification status
Backend Python syntax ও unit tests, Android manifest/FileProvider XML parsing এবং ZIP integrity পরীক্ষা করা হবে/হয়েছে packaging pass-এ। কিন্তু এই environment-এ Gradle/Android SDK নেই; তাই Android `testDebugUnitTest`, `lintDebug`, `assembleDebug` ও real-device testing এখনো যাচাই করা হয়নি। বিস্তারিত matrix: `FEATURE_STATUS_AND_QA_BN.md`।
