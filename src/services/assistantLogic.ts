/**
 * Offline rule-based assistant logic ported directly from AssistantLogic.kt.
 * Provides instant responses when offline or when no live AI backend is configured.
 */
export const AssistantLogic = {
  makeCreation(kind: string, prompt: string): string {
    const subject = prompt.trim() || 'একটি সুন্দর উদাহরণ';
    switch (kind) {
      case 'কবিতা':
        return `শিরোনাম: ${subject}\n\nনীরব আকাশে স্বপ্ন জাগে,\nনতুন দিনের আলো লাগে;\nচলার পথে আশা রাখি,\nনিজের শক্তি নিজেই আঁকি।\n\n(এটি একটি offline sample—আরও নির্দিষ্ট ও বড় কবিতা পেতে AI backend যুক্ত করুন।)`;
      case 'গল্প':
        return `শিরোনাম: ${subject}\n\nএকদিন এক কৌতূহলী মানুষ নতুন কিছু শেখার সিদ্ধান্ত নিল। পথে নানা বাধা এল, কিন্তু সে ধৈর্য ধরে ছোট ছোট পদক্ষেপ নিল। শেষে সে বুঝল—প্রশ্ন করা ও চেষ্টা চালিয়ে যাওয়াই শেখার সবচেয়ে বড় শক্তি।\n\n(বিষয় অনুযায়ী পূর্ণাঙ্গ গল্প তৈরি করতে AI backend চালু করুন।)`;
      case 'গান':
        return `গানের ভাবনা: ${subject}\n\nকোরাস (নমুনা):\nস্বপ্ন নিয়ে চলি আজ,\nআশার আলো হৃদয়-মাঝ।\nকুয়াশা কেটে সুর ভেসে যায়,\nনতুন ভোরে গান গাই।\n\n(এটি শুধু একটি offline lyric sample; audio/music তৈরি করে না।)`;
      case 'পোস্ট':
        return `বিষয়: ${subject}\n\nছোট ছোট পদক্ষেপেই বড় পরিবর্তন আসে। নিজের লক্ষ্য ঠিক করুন, নিয়মিত চেষ্টা করুন, আর প্রতিটি দিন শেখার সুযোগ হিসেবে কাজে লাগান।\n\n#অনুপ্রেরণা #শিক্ষা #DrMunnaAI #স্বাবলম্বী`;
      case 'কোড':
        return `// Request: ${subject}\n// Offline template only. Configure an AI backend for custom code generation, review, and debugging.\nfunction solution() {\n  console.log("Hello from Dr. Munna Assist AI - ${subject}");\n  // Add your logic here\n}\nsolution();`;
      case 'স্বাস্থ্য':
      case 'health':
        return `স্বাস্থ্য পরামর্শ: ${subject}\n\n১. নিয়মিত পরিমিত পুষ্টিকর খাদ্য ও পর্যাপ্ত বিশুদ্ধ পানি পান করুন।\n২. দিনে অন্তত ৭-৮ ঘণ্টা পর্যাপ্ত বিশ্রাম নিন।\n৩. কোনো অস্বাভাবিক উপসর্গ দেখা দিলে বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন।\n\n(এটি সাধারণ স্বাস্থ্য সচেতনতামূলক তথ্য, চিকিৎসকের বিকল্প নয়।)`;
      default:
        return `Offline demo sample for: ${subject}\n\nসৃজনশীল ভাবনা তৈরি করা হয়েছে। পূর্ণাঙ্গ generative AI উত্তরের জন্য Settings-এ Backend সচল করুন।`;
    }
  },

  localReply(message: string): string {
    const q = message.trim().toLowerCase();
    if (!q) {
      return 'আপনার প্রশ্নটি লিখুন।';
    }

    const greetings = ['hello', 'hi', 'হ্যালো', 'হাই', 'আসসালামু', 'নমস্কার', 'কেমন'];
    if (greetings.some((k) => q.includes(k))) {
      return 'স্বাগতম! আমি Dr. Munna Assist AI-এর ভার্চুয়াল অ্যাসিস্ট্যান্ট। স্বাস্থ্য শিক্ষা, ক্রিয়েটিভ লেখা, কোড বা সাধারণ বিষয়ে কী সাহায্য চান?';
    }

    const capabilities = ['তুমি কি করতে পার', 'কি করতে পার', 'what can you do', 'help', 'সাহায্য', 'ফিচার'];
    if (capabilities.some((k) => q.includes(k))) {
      return 'এই অ্যাপে আপনি পাবেন:\n১. বাংলা ও ইংরেজি ভয়েস এবং টেক্সট AI চ্যাট\n২. 3D ভার্চুয়াল অ্যাসিস্ট্যান্ট অবতার (পোশাক পরিবর্তনযোগ্য)\n৩. মানবদেহের অ্যানাটমি ও প্রজনন স্বাস্থ্য শিক্ষা গাইড\n৪. AI Creation Studio (লেখা, ছবি ও ভিডিও প্রম্পট)\n৫. মোবাইল টুলস ও কোড বিল্ডার।\n\nSettings থেকে লাইভ AI সচল রাখতে পারেন!';
    }

    const health = ['যৌনশিক্ষা', 'প্রজনন', 'menstrual', 'মাসিক', 'গর্ভধারণ', 'অ্যানাটমি', 'কন্ডোম', 'sti', 'রোগ'];
    if (health.some((k) => q.includes(k))) {
      return 'এটি শিক্ষামূলক স্বাস্থ্যবিষয়। নির্ভরযোগ্য তথ্য, সম্মতি, ঋতুচক্র, গর্ভনিরোধ ও STI প্রতিরোধ সম্পর্কে বিস্তারিত জানতে নিচের "Learn" ট্যাব ব্যবহার করুন। কোনো ব্যক্তিগত শারীরিক সমস্যা বা ওষুধের জন্য সবসময় নিবন্ধিত চিকিৎসকের পরামর্শ নিন।';
    }

    const offline = ['offline', 'ইন্টারনেট নেই', 'নেট নেই', 'সার্ভার'];
    if (offline.some((k) => q.includes(k))) {
      return 'Offline mode-এ অ্যাপের স্থানীয় ডাটাবেস ও রুল-বেসড রেসপন্স কাজ করে। লাইভ জেনারেটিভ AI রেসপন্সের জন্য ইন্টারনেট ও ব্যাকএন্ড সংযোগ প্রয়োজন।';
    }

    const doctorMunna = ['munna', 'মুন্না', 'কে তৈরি', 'who are you', 'কে তুমি'];
    if (doctorMunna.some((k) => q.includes(k))) {
      return 'আমি Dr. Munna Assist AI — আপনার ব্যক্তিগত বহুভাষিক সহকারী। স্বাস্থ্য শিক্ষা, ক্রিয়েটিভ সহায়তা ও ডিজিটাল টাস্কে আপনাকে গাইড করাই আমার লক্ষ্য।';
    }

    return `এই starter সংস্করণে আপনার প্রশ্নের বিষয় ("${message.slice(0, 40)}") নোট করা হয়েছে। লাইভ Gemini AI দিয়ে বিশদ উত্তরের জন্য Settings থেকে Backend চালু করুন অথবা নিচের Learn/Studio সেকশনগুলো ঘুরে দেখুন।`;
  }
};
