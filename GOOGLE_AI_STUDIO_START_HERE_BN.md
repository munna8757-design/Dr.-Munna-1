# Google AI Studio দিয়ে Dr. Munna Assist AI উন্নত করার নির্দেশিকা

## ফাইলগুলো
1. `AI-Studio-Prompt/GOOGLE_AI_STUDIO_MASTER_PROMPT_BN.txt` — পুরো master prompt.
2. `Android-Starter/` — Kotlin/Compose Android source.
3. `Backend-Gemini/` — Gemini chat, image ও Veo video backend.
4. `FEATURE_STATUS_AND_QA_BN.md` — কোন ফিচার বাস্তবে কতটা প্রস্তুত তার matrix.

## Google AI Studio-তে কাজ
1. Master Prompt পুরো কপি করুন।
2. Source code attach/upload করার সুবিধা থাকলে `Android-Starter` এবং backend ফাইলগুলো দিন।
3. লিখুন: “আগে সব ফাইল audit করো; তারপর ছোট ধাপে changes করো। Existing working code নষ্ট করো না। Compile/test চালিয়ে প্রতিটি failure ঠিক করো। Feature status evidence ছাড়া WORKING বলবে না।”
4. Google AI Studio কোড লিখতে/পরিবর্তন করতে সাহায্য করতে পারে; আপনার বর্তমান mode-এ native APK build/export সরাসরি নাও থাকতে পারে। APK তৈরির জন্য Android Studio/Gradle বা GitHub Actions ব্যবহার করুন।

## বর্তমানে source-এ যোগ করা হয়েছে
- Three.js procedural 3D character preview ও sari/three-piece/casual/professional outfit style selector. Internet/CDN লাগে; photorealistic model বা lip-sync নয়.
- Backend Gemini chat, image generation request, Veo video job start/status/download endpoints.
- Android notification reader with app opt-in, Android Notification Access flow এবং basic sensitive-message keyword filter.
- Quick app launch, Wi-Fi/Bluetooth settings, dialer ও SMS draft.
- Backend-এর shared `APP_API_TOKEN` check; এটি production-grade user authentication নয়.

## Backend configuration
`Backend-Gemini/README_BN.md` দেখুন। HTTPS hosting-এ `GOOGLE_API_KEY` এবং long random `APP_API_TOKEN` server secret হিসেবে দিন। App-এর Settings-এ base URL ও matching token দিন। API key কখনো APK-তে রাখবেন না। Image/video access এবং billing account-ভেদে আলাদা হতে পারে।

## APK build
পুরো package folder-এর contents GitHub repository root-এ upload করুন (hidden root `.github`-সহ)। Actions → **Verify Dr. Munna Assist AI package** চালান। Build সফল হলে `Dr-Munna-Assist-AI-debug-apk` artifact পাওয়া যাবে। Artifact না থাকলে APK build হয়েছে ধরে নেবেন না।
