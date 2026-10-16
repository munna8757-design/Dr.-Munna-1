package com.munna.assistai

/**
 * Small, fully offline rule-based helper for the starter app.
 * This is NOT a generative AI model. Replace/extend it through a secure backend later.
 */
object AssistantLogic {
    fun makeCreation(kind: String, prompt: String): String {
        val subject = prompt.trim().ifBlank { "একটি সুন্দর উদাহরণ" }
        return when (kind) {
            "কবিতা" -> "শিরোনাম: $subject\n\nনীরব আকাশে স্বপ্ন জাগে,\nনতুন দিনের আলো লাগে;\nচলার পথে আশা রাখি,\nনিজের শক্তি নিজেই আঁকি।\n\nএটি একটি offline sample—আরও নির্দিষ্ট লেখা পেতে AI backend যুক্ত করুন।"
            "গল্প" -> "শিরোনাম: $subject\n\nএকদিন এক কৌতূহলী মানুষ নতুন কিছু শেখার সিদ্ধান্ত নিল। পথে নানা বাধা এল, কিন্তু সে ধৈর্য ধরে ছোট ছোট পদক্ষেপ নিল। শেষে সে বুঝল—প্রশ্ন করা ও চেষ্টা চালিয়ে যাওয়াই শেখার সবচেয়ে বড় শক্তি।\n\nবিষয় অনুযায়ী পূর্ণ গল্প তৈরি করতে AI backend যুক্ত করুন।"
            "গান" -> "গানের ভাবনা: $subject\n\nকোরাস (নমুনা):\nস্বপ্ন নিয়ে চলি আজ,\nআশার আলো হৃদয়-মাঝ।\n\nএটি শুধু একটি offline lyric sample; audio/music তৈরি করে না।"
            "পোস্ট" -> "বিষয়: $subject\n\nছোট ছোট পদক্ষেপেই বড় পরিবর্তন আসে। নিজের লক্ষ্য ঠিক করুন, নিয়মিত চেষ্টা করুন, আর শেখার সুযোগ কাজে লাগান।\n\n#অনুপ্রেরণা #শেখা"
            "কোড" -> "// Request: $subject\n// Offline template only. Configure an AI backend for code generation, review, and debugging.\nfun main() {\n    println(\"Replace this sample with your implementation\")\n}"
            else -> "Offline demo sample for: $subject\nAI backend যুক্ত করলে আরও উন্নত ফলাফল পাওয়া যাবে।"
        }
    }

    fun localReply(message: String): String {
        val q = message.trim().lowercase()
        if (q.isBlank()) return "আপনার প্রশ্নটি লিখুন।"

        return when {
            listOf("hello", "hi", "হ্যালো", "হাই", "আসসালামু").any { q.contains(it) } ->
                "স্বাগতম! আমি Dr. Munna Assist AI-এর offline demo assistant। কী বিষয়ে সাহায্য চান?"
            listOf("তুমি কি করতে পার", "কি করতে পার", "what can you do", "help").any { q.contains(it) } ->
                "এই সংস্করণে সীমিত offline FAQ, voice input/output, এবং internet-নির্ভর procedural 3D avatar demo আছে। Live AI সংযুক্ত নেই যতক্ষণ না secure backend URL দেওয়া হয়; ছবি/ভিডিও generation-এর জন্য backend provider access লাগবে।"
            listOf("যৌনশিক্ষা", "প্রজনন", "menstrual", "মাসিক", "গর্ভধারণ").any { q.contains(it) } ->
                "এটি শিক্ষামূলক স্বাস্থ্যবিষয়। নির্ভরযোগ্য তথ্য, সম্মতি, গর্ভনিরোধ ও STI প্রতিরোধ সম্পর্কে জানতে Learn বিভাগ ব্যবহার করুন। ব্যক্তিগত লক্ষণ বা চিকিৎসার সিদ্ধান্তে যোগ্য চিকিৎসকের পরামর্শ নিন।"
            listOf("offline", "ইন্টারনেট নেই", "নেট নেই").any { q.contains(it) } ->
                "Offline mode-এ এই সংস্করণে শুধু সীমিত rule-based উত্তর পাওয়া যায়। পূর্ণ AI উত্তর পেতে পরে নিরাপদ backend/API বা সমর্থিত local model যুক্ত করতে হবে।"
            else ->
                "এই starter সংস্করণে Live AI সংযুক্ত নেই, তাই আমি এখনো এই প্রশ্নের নির্ভরযোগ্য উত্তর তৈরি করতে পারি না। ভবিষ্যৎ সংস্করণে secure AI backend যুক্ত করা হবে।"
        }
    }
}
