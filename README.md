# Dr. Munna Assist AI (React Application)

A cross-framework rewrite of Dr. Munna Assist AI ported from Android (Kotlin/Jetpack Compose) to a modern React 18 + TypeScript + Vite + Tailwind CSS web application, backed by Express and Google Gemini API.

## Core Features Preserved & Enhanced

1. **3D Virtual Assistant Character (Three.js)**
   - Interactive procedural 3D avatar with real-time drag-to-rotate interaction, idle breathing animation, and zoom controls.
   - Traditional and contemporary outfit switcher: শাড়ি (Sari), থ্রি-পিস (Three-piece), ক্যাজুয়াল (Casual), and প্রফেশনাল (Professional).

2. **AI Chat & Voice Interaction**
   - Natural language conversation in Bengali and English.
   - Web Speech API integration for speech-to-text dictation.
   - SpeechSynthesis text-to-speech for vocalizing AI responses with Bengali voice support.
   - Full offline rule-based fallback engine directly ported from `AssistantLogic.kt` with instant answers for greetings, health, and capability queries.
   - Full-stack live Google Gemini API connectivity.

3. **Human Body & Health Education Center**
   - Evidence-based, clinical, and respectful modules covering:
     - Human Body Anatomy & Organ Systems (মস্তিষ্ক, হৃদ্‌যন্ত্র, ফুসফুস, হাড়, পেশি)
     - Reproductive Anatomy & Biology (ডিম্বস্ফোটন, ঋতুচক্র, নিষেক ও গর্ভধারণ)
     - Menstrual Cycle & Hygiene Management
     - Consent & Healthy Relationships (স্বেচ্ছাপ্রণোদিত, প্রত্যাহারযোগ্য, ও সম্মানজনক)
     - Contraception & STI Prevention
     - Hygiene and Medical Consultation Guidelines
     - Medical disclaimer emphasizing educational guidance over self-diagnosis.

4. **AI Creation Studio**
   - Multimodal creation workspace supporting:
     - Writing ("লেখা"): Poems (কবিতা), Stories (গল্প), Songs/Lyrics (গান), Social Posts (পোস্ট), Code (কোড), and Health Tips (স্বাস্থ্য).
     - Images ("ছবি"): AI-generated illustrations via Gemini Image models with instant download.
     - Videos ("ভিডিও"): Video prompt dispatch, asynchronous operation tracking, and status checking.
     - One-click Copy to clipboard and Web Share API sharing.

5. **Tools & Mobile Utilities**
   - Quick App launcher shortcuts (YouTube, Facebook, Network & Bluetooth scanner).
   - Opt-in Notification Reader with speech synthesis announcements.
   - Phone dialer (`tel:`) and SMS draft composer (`sms:`).
   - Multi-language Code Builder with templates for Kotlin, Python, and JavaScript.

6. **Backend Settings & Diagnostics**
   - Configurable remote backend URL and token, or built-in Express server proxy.
   - Real-time health diagnostic checks for AI connectivity and model availability.

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Three.js, Lucide Icons, Vite
- **Backend / Proxy:** Node.js, Express, tsx, `@google/genai`
- **Port:** Dev server listening on port 3000

## Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm start
```
