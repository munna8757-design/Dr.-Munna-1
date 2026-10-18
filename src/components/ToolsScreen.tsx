import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ExternalLink,
  Phone,
  MessageSquare,
  Bell,
  Code2,
  Copy,
  Share2,
  Check,
  Volume2,
  Radio,
  Wifi,
  Bluetooth,
  Youtube,
  Search,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

export const ToolsScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    valid: boolean;
    operator?: string;
    type?: string;
    note?: string;
  } | null>(null);

  const [codeLang, setCodeLang] = useState<'Kotlin' | 'Python' | 'JavaScript'>('Kotlin');
  const [notificationReaderEnabled, setNotificationReaderEnabled] = useState(() => {
    return localStorage.getItem('dr_munna_notification_reader') === 'true';
  });
  const [testNotificationTitle, setTestNotificationTitle] = useState('মেডিকেল অ্যাপয়েন্টমেন্ট');
  const [testNotificationBody, setTestNotificationBody] = useState(
    'আপনার নিয়মিত স্বাস্থ্য পরীক্ষার সময় হয়েছে।'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [announcingNotification, setAnnouncingNotification] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      'dr_munna_notification_reader',
      notificationReaderEnabled ? 'true' : 'false'
    );
  }, [notificationReaderEnabled]);

  // Bangladeshi Mobile Operator Prefix Detector
  const handleLookup = () => {
    const raw = lookupNumber.replace(/[\s-]/g, '');
    const clean = raw.startsWith('+88') ? raw.slice(3) : raw.startsWith('88') ? raw.slice(2) : raw;

    if (!clean) return;

    if (!/^01[3-9]\d{8}$/.test(clean)) {
      setLookupResult({
        valid: false,
        note: 'নম্বরটি সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর ফরম্যাটে (যেমন: 017xxxxxxxx) নেই।'
      });
      return;
    }

    const prefix = clean.substring(0, 3);
    let operator = 'অজানা অপারেটর';
    if (prefix === '017' || prefix === '013') operator = 'Grameenphone (GP)';
    else if (prefix === '018' || prefix === '016') operator = 'Robi / Airtel';
    else if (prefix === '019' || prefix === '014') operator = 'Banglalink';
    else if (prefix === '015') operator = 'Teletalk (রাষ্ট্রায়ত্ত)';

    setLookupResult({
      valid: true,
      operator,
      type: 'বাংলাদেশ মোবাইল জিএসএম নেটওয়ার্ক',
      note: 'টেলিকম রেগুলেশন (BTRC) এবং সাইবার নিরাপত্তা আইন অনুযায়ী কোনো ব্যক্তির ব্যক্তিগত লাইভ লোকেশন বা অননুমোদিত তথ্য ট্র্যাকিং করা সম্পূর্ণ নিষিদ্ধ। বৈধ নম্বর ফরম্যাট ও অপারেটর ইনফো এখানে যাচাই করা হয়েছে।'
    });
  };

  const codeTemplates = {
    Kotlin: `// Dr. Munna Assist AI - Kotlin Mobile Module
package com.munna.assistai

fun main() {
    println("Hello from Dr. Munna Assist AI")
    val assistant = "Dr. Munna AI"
    println("Active Assistant: $assistant")
}`,
    Python: `# Dr. Munna Assist AI - Python Script
import sys

def main():
    print("Hello from Dr. Munna Assist AI")
    user_status = {"assistant": "Dr. Munna", "language": "bn/en"}
    print(f"Status: {user_status}")

if __name__ == "__main__":
    main()`,
    JavaScript: `// Dr. Munna Assist AI - Web Integration
export function greetAssistant() {
  console.log("Hello from Dr. Munna Assist AI");
  return {
    status: "active",
    features: ["chat", "learn", "studio", "tools"]
  };
}
greetAssistant();`
  };

  const currentCode = codeTemplates[codeLang];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (_) {}
  };

  const handleShareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dr. Munna Code - ${codeLang}`,
          text: currentCode
        });
      } catch (_) {}
    } else {
      handleCopyCode();
    }
  };

  const announceTestNotification = () => {
    if (!notificationReaderEnabled) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speechText = `নতুন নোটিফিকেশন: ${testNotificationTitle}। ${testNotificationBody}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'bn-BD';
    utterance.rate = 1.0;

    utterance.onstart = () => setAnnouncingNotification(true);
    utterance.onend = () => setAnnouncingNotification(false);
    utterance.onerror = () => setAnnouncingNotification(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#61e7f5]" />
          <span className="text-xs font-bold tracking-wider text-[#61e7f5] uppercase">
            DEVICE UTILITIES
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Tools & Mobile Control
        </h1>
        <p className="text-xs text-gray-300">
          ডিভাইসের কাজগুলো আপনার সম্মতিতে এবং ব্রাউজার/অপারেটিং সিস্টেমের নিজস্ব পারমিশন অনুযায়ী পরিচালিত হয়।
        </p>
      </div>

      {/* 1. Mobile Number Info & Operator Verification */}
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-lg space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#b59bff] flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#61e7f5]" />
            <span>মোবাইল নম্বর ও অপারেটর যাচাই (Operator Lookup)</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            যেকোনো বাংলাদেশি মোবাইল নম্বরের অফিশিয়াল অপারেটর (GP, Robi, Banglalink, Teletalk) এবং নম্বর ভ্যালিডিটি যাচাই করুন।
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={lookupNumber}
            onChange={(e) => setLookupNumber(e.target.value)}
            placeholder="নম্বর লিখুন (যেমন: 01712345678)"
            className="flex-1 px-3 py-2 text-xs bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
          />
          <button
            type="button"
            onClick={handleLookup}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:opacity-95 transition"
          >
            যাচাই করুন
          </button>
        </div>

        {lookupResult && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-1 ${
              lookupResult.valid
                ? 'bg-[#0b1020] border-cyan-500/40 text-cyan-200'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {lookupResult.valid ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>অপারেটর: {lookupResult.operator}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>ত্রুটিপূর্ণ নম্বর</span>
                </>
              )}
            </div>
            {lookupResult.type && (
              <p className="text-[11px] text-gray-300">নেটওয়ার্ক ধরন: {lookupResult.type}</p>
            )}
            <p className="text-[11px] text-gray-400 leading-relaxed pt-1 border-t border-white/5">
              {lookupResult.note}
            </p>
          </div>
        )}
      </div>

      {/* 2. Quick App Launcher */}
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-lg space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#b59bff] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#61e7f5]" />
            <span>Quick App Launcher</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            সরাসরি অ্যাপ খুলুন বা সেবা সমূহে প্রবেশ করুন।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#0b1020] border border-[#243257] hover:border-red-500/50 flex items-center gap-2.5 text-xs font-semibold text-white transition hover:bg-[#1c2744]"
          >
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
              <Youtube className="w-4 h-4" />
            </div>
            <span>YouTube</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
          </a>

          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#0b1020] border border-[#243257] hover:border-blue-500/50 flex items-center gap-2.5 text-xs font-semibold text-white transition hover:bg-[#1c2744]"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              f
            </div>
            <span>Facebook</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              if (navigator.onLine) {
                alert('ইন্টারনেট সংযোগ চালু রয়েছে (Online Status: OK)');
              } else {
                alert('ডিভাইস বর্তমানে অফলাইনে রয়েছে।');
              }
            }}
            className="p-2.5 rounded-xl bg-[#1c2744] hover:bg-[#243257] border border-[#243257] text-xs font-medium text-gray-200 flex items-center gap-2 transition"
          >
            <Wifi className="w-4 h-4 text-[#61e7f5]" />
            <span>Wi-Fi / Network Status</span>
          </button>

          <button
            onClick={() => {
              if ('bluetooth' in navigator) {
                (navigator as any).bluetooth
                  ?.requestDevice?.({ acceptAllDevices: true })
                  .catch(() => {});
              } else {
                alert('Bluetooth API ব্রাউজারে উপলব্ধ নয় বা অনুমতি প্রয়োজন।');
              }
            }}
            className="p-2.5 rounded-xl bg-[#1c2744] hover:bg-[#243257] border border-[#243257] text-xs font-medium text-gray-200 flex items-center gap-2 transition"
          >
            <Bluetooth className="w-4 h-4 text-[#b59bff]" />
            <span>Bluetooth Device Scan</span>
          </button>
        </div>
      </div>

      {/* 3. Notification Reader (Opt-In) */}
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-lg space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#b59bff] flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#61e7f5]" />
            <span>Notification Reader (Opt-in)</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
            চালু করলে টেক্সট-টু-স্পিচ (TTS) ইঞ্জিনের সাহায্যে আসা নোটিফিকেশনের শিরোনাম ও বিষয়বস্তু পড়ে শোনাবে। কোনো নোটিফিকেশন ক্লাউডে সংরক্ষণ করা হয় না।
          </p>
        </div>

        <div className="p-3 bg-[#0b1020] rounded-xl border border-[#243257] flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationReaderEnabled}
              onChange={(e) => setNotificationReaderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-[#61e7f5]"
            />
            <span className="text-xs font-medium text-white">
              Notification পড়ে শোনানো সক্রিয় করুন
            </span>
          </label>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              notificationReaderEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {notificationReaderEnabled ? 'সক্রিয়' : 'বন্ধ'}
          </span>
        </div>

        {notificationReaderEnabled && (
          <div className="space-y-2 pt-1 border-t border-[#243257]/60">
            <span className="text-[11px] text-gray-400 font-medium">
              নোটিফিকেশন ঘোষণা টেস্ট করুন:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testNotificationTitle}
                onChange={(e) => setTestNotificationTitle(e.target.value)}
                placeholder="শিরোনাম"
                className="flex-1 px-3 py-1.5 text-xs bg-[#0b1020] border border-[#243257] rounded-lg text-white"
              />
              <button
                type="button"
                onClick={announceTestNotification}
                className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>শুনুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Phone / SMS Quick Actions */}
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-lg space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#b59bff] flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#61e7f5]" />
            <span>Phone / SMS Quick Action</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            ডিভাইসের নিজস্ব ডায়ালার ও মেসেজিং অ্যাপের মাধ্যমে সরাসরি কল বা ড্রাফট পাঠাতে পারেন।
          </p>
        </div>

        <div className="space-y-2.5">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="ফোন নম্বর লিখুন (যেমন: +88017...)"
            className="w-full px-3 py-2 text-xs bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
          />
          <textarea
            rows={2}
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            placeholder="এসএমএস মেসেজ ড্রাফট (ঐচ্ছিক)"
            className="w-full p-3 text-xs bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
          />

          <div className="flex items-center gap-2">
            <a
              href={phoneNumber ? `tel:${encodeURIComponent(phoneNumber)}` : '#'}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                phoneNumber
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-800 text-gray-500 pointer-events-none'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>ডায়াল করুন (Dial)</span>
            </a>

            <a
              href={
                phoneNumber
                  ? `sms:${encodeURIComponent(phoneNumber)}?body=${encodeURIComponent(smsBody)}`
                  : '#'
              }
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                phoneNumber
                  ? 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/30'
                  : 'border-gray-800 text-gray-600 pointer-events-none'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS ড্রাফট পাঠান</span>
            </a>
          </div>

          <div className="p-2.5 bg-[#0b1020] rounded-xl border border-white/5 text-[11px] text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>টেলিকম তথ্য:</strong> কলার আইডি পরিবর্তন (Caller ID Spoofing) বা ভুয়া নম্বর দেখিয়ে কল করা টেলিকমিউনিকেশন আইনে কঠোরভাবে নিষিদ্ধ। সঠিক নম্বর স্বচ্ছভাবে রেখে ডায়াল বা মেসেজ পাঠানোই নিরাপদ।
            </span>
          </div>
        </div>
      </div>

      {/* 5. Code Builder */}
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#b59bff] flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#61e7f5]" />
              <span>Code Builder · Basic Templates</span>
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              প্রয়োজনীয় প্রোগ্রামিং টেমপ্লেট এক্সপ্লোর করুন ও শেয়ার করুন।
            </p>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-2">
          {(['Kotlin', 'Python', 'JavaScript'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setCodeLang(lang)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                codeLang === lang
                  ? 'bg-[#61e7f5]/20 border-[#61e7f5] text-[#61e7f5] font-semibold'
                  : 'bg-[#0b1020] border-[#243257] text-gray-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Code Block Container */}
        <div className="bg-[#0b1020] border border-[#243257] rounded-xl p-3 relative font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed select-text">
          <pre>{currentCode}</pre>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-gray-400">
            এটি টেমপ্লেট কোড; কম্পাইল করতে নিজস্ব IDE বা টার্মিনাল ব্যবহার করুন।
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#243257] text-white hover:bg-[#2e406f] flex items-center gap-1.5 transition font-medium"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি কোড</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareCode}
              className="px-3 py-1.5 text-xs rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30 flex items-center gap-1.5 transition font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>শেয়ার</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
