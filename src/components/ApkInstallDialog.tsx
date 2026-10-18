import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  Terminal,
  Check
} from 'lucide-react';

interface ApkInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallDialog: React.FC<ApkInstallDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Preferred public live URL for mobile installation
  const liveUrl =
    typeof window !== 'undefined' && window.location.origin.includes('localhost')
      ? 'https://ais-pre-sbamo5zohiucbywigzt547-691586027003.asia-northeast1.run.app'
      : typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-sbamo5zohiucbywigzt547-691586027003.asia-northeast1.run.app';

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'আপনার অ্যান্ড্রয়েড ফোনে সরাসরি ইনস্টল করার নিয়ম:\n১. নিচের লিংকটি ক্রোম (Chrome) ব্রাউজারে খুলুন:\n' +
          liveUrl +
          '\n২. ব্রাউজারের উপরে ডানে থাকা ৩-ডট (⋮) মেনুতে চাপুন।\n৩. "Install app" অথবা "Add to Home screen" চাপুন।\n\nগুগল ক্রোম স্বয়ংক্রিয়ভাবে একটি সাইনড WebAPK ফাইল তৈরি করে আপনার ফোনে ইন্সটল করে দেবে।'
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  const bubblewrapCommand = `# Google-এর অফিশিয়াল Bubblewrap দিয়ে Android APK তৈরির নিয়ম:
npm i -g @bubblewrap/cli
bubblewrap init --manifest=${liveUrl}/manifest.json
bubblewrap build`;

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(bubblewrapCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#151d33] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>Android APK ও মোবাইল ইনস্টলেশন</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-xs text-gray-400">
              Dr. Munna Assist AI সরাসরি ফোনে অ্যাপ হিসেবে চালান
            </p>
          </div>
        </div>

        {/* DIRECT DOWNLOAD SECTION - 100% Guaranteed Working */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-[#0b1020] to-[#151d33] border-2 border-emerald-500/50 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>সরাসরি ফোনে ডাউনলোড (১০০% কার্যকর)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              ডিরেক্ট ফাইল
            </span>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed">
            কোনো ক্লাউড লিংক বা ইন্টারনেটের ঝামেলা ছাড়াই নিচের ফাইলগুলো সরাসরি আপনার ফোনের <strong>Download</strong> ফোল্ডারে নামিয়ে ইনস্টল করে নিন:
          </p>

          <div className="space-y-2">
            {/* Download Option 1: Standalone Offline Mobile App */}
            <a
              href="/api/download/offline-app"
              download="Dr_Munna_Assist_AI_Offline.html"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:opacity-95 transition flex items-center justify-between shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-black group-hover:scale-110 transition" />
                <div className="text-left">
                  <div className="font-extrabold">১. অফলাইন মোবাইল অ্যাপ ডাউনলোড (.HTML)</div>
                  <div className="text-[10px] text-gray-800 font-normal">যেকোনো ফোনে ডাউনলোড করে সরাসরি ফুলস্ক্রিন চালান</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-black shrink-0" />
            </a>

            {/* Download Option 2: Full Android Studio Project ZIP with APK builder */}
            <a
              href="/api/download/android-project"
              download="Dr_Munna_Assist_AI_Android_Project.zip"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#1c2744] hover:bg-[#243257] border border-cyan-500/40 text-cyan-200 transition flex items-center justify-between shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div className="font-extrabold text-white">২. সম্পূর্ণ Android Studio ও APK প্রজেক্ট (.ZIP)</div>
                  <div className="text-[10px] text-gray-400 font-normal">Android Studio দিয়ে সরাসরি APK বিল্ড ও ইনস্টল করুন</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-cyan-300 shrink-0" />
            </a>

            {/* Download Option 3: Web App Bundle */}
            <a
              href="/api/download/app-bundle"
              download="Dr_Munna_Assist_AI_App.zip"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-[#0b1020] hover:bg-[#151d33] border border-[#243257] text-gray-300 transition flex items-center justify-between"
            >
              <span className="text-[11px]">৩. সম্পূর্ণ ওয়েব অ্যাপ বান্ডেল (.ZIP)</span>
              <Download className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </a>
          </div>

          <div className="p-3 bg-[#0b1020]/80 rounded-xl border border-emerald-500/30 text-[11px] text-gray-300 space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>মোবাইলে যেভাবে চালাবেন ও অ্যাপ বানাবেন:</span>
            </div>
            <p>
              ১. উপরের <strong>&ldquo;অফলাইন মোবাইল অ্যাপ (.HTML)&rdquo;</strong> ফাইলে চাপ দিলে ফাইলটি আপনার ফোনে ডাউনলোড হবে।
            </p>
            <p>
              ২. ফাইলটিতে চাপ দিয়ে আপনার ফোনের <strong>Chrome</strong> বা <strong>Samsung Internet</strong> ব্রাউজারে খুলুন।
            </p>
            <p>
              ৩. ব্রাউজারের ৩-ডট মেনু (⋮) থেকে <strong>&ldquo;Add to Home screen&rdquo;</strong> চাপুন। সঙ্গে সঙ্গে এটি একটি অ্যাপ হিসেবে আপনার হোমস্ক্রিনে চলে আসবে!
            </p>
          </div>
        </div>

        {/* Live URL copy box for browser */}
        <div className="p-3.5 rounded-2xl bg-[#0b1020] border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ব্রাউজার লাইভ লিঙ্ক (যদি ক্রোমে খুলতে চান):</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Dev URL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="flex-1 bg-[#151d33] border border-[#243257] rounded-xl px-3 py-2 text-xs text-cyan-200 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition flex items-center gap-1 shrink-0 shadow-md"
            >
              {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
              <span>{copiedLink ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400">
            নোট: বাইরের নেটওয়ার্ক থেকে লিঙ্কটি অ্যাক্সেস করতে না পারলে উপরের <strong>সরাসরি ডাউনলোড বাটন</strong> ব্যবহার করুন।
          </p>
        </div>

        {/* Android PWA WebAPK Trigger Button */}
        <div className="p-3.5 rounded-2xl bg-[#0b1020] border border-[#243257] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>পদ্ধতি ৩: ব্রাউজার প্রম্পট থেকে সরাসরি ইনস্টল</span>
            </span>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-white" />
            <span>
              {isInstalled ? '✓ ফোনে সফলভাবে ইনস্টল করা আছে' : 'ব্রাউজার ইনস্টল উইজেট ট্রিগার করুন (WebAPK)'}
            </span>
          </button>
        </div>

        {/* Benefits List */}
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-300 space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ইনস্টল করলে যে সুবিধা পাবেন:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-gray-400 text-[11px]">
            <li>ফোনের অ্যাপ ড্রয়ারে ও হোমস্ক্রিনে আসল Dr. Munna AI লোগো আইকন থাকবে।</li>
            <li>ফুলস্ক্রিন অ্যাপ মোডে চলবে (কোনো ব্রাউজার ফ্রেম বা ইউআরএল বার থাকবে না)।</li>
            <li>অফলাইনেও অবতার, থ্রিডি ড্রেস ও এনাটমি টুলস দ্রুত লোড হবে।</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
