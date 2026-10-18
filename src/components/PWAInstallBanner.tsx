import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  CheckCircle,
  X,
  Share2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const PWAInstallBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed as standalone app or dismissed by user
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div
        className={`w-full p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#151d33] to-cyan-950/70 border-2 border-emerald-500/40 shadow-xl flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white tracking-wide uppercase truncate">
                মোবাইলে অ্যাপ ইনস্টল করুন
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                WebAPK
              </span>
            </div>
            <p className="text-[11px] text-gray-300 truncate">
              হোমস্ক্রিনে অ্যাপ আইকন ও ফুলস্ক্রিনে ব্যবহারের জন্য ইনস্টল করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:opacity-95 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>ইনস্টল করুন</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="লুকান"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Mobile Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#151d33] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-extrabold">
                <Smartphone className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">মোবাইলে কীভাবে ইনস্টল করবেন?</h3>
                <p className="text-xs text-gray-400">খুব সহজ ২টি ধাপে ফোনে অ্যাপ আইকন যুক্ত করুন</p>
              </div>
            </div>

            {/* Android Chrome Instructions */}
            <div className="p-4 rounded-2xl bg-[#0b1020] border border-[#243257] space-y-2.5 text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>অ্যান্ড্রয়েড ফোন (Google Chrome ব্রাউজার):</span>
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-300 leading-relaxed pl-1">
                <li>
                  ক্রোম ব্রাউজারের উপরে ডানদিকের <strong>৩-ডট (⋮) মেনু</strong> চাপুন।
                </li>
                <li>
                  মেনু থেকে <strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।
                </li>
                <li>
                  <strong>"Install"</strong> নিশ্চিত করলেই গুগল ক্রোম স্বয়ংক্রিয়ভাবে আপনার ফোনে অ্যাপটি ইনস্টল করে দেবে।
                </li>
              </ol>
            </div>

            {/* iOS Safari Instructions */}
            {isIOS && (
              <div className="p-4 rounded-2xl bg-[#0b1020] border border-[#243257] space-y-2.5 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>আইফোন (iOS Safari ব্রাউজার):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-300 leading-relaxed pl-1">
                  <li>
                    সাফারি ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার) আইকন ⎋</strong> চাপুন।
                  </li>
                  <li>
                    নিচে স্ক্রোল করে <strong>"Add to Home Screen"</strong> নির্বাচন করুন।
                  </li>
                  <li>
                    উপরে ডানদিকের <strong>"Add"</strong> চাপুন।
                  </li>
                </ol>
              </div>
            )}

            {/* Direct File Download */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-cyan-950/50 border border-emerald-500/40 space-y-2">
              <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>বিকল্প: সরাসরি অফলাইন ফাইল ডাউনলোড</span>
              </span>
              <p className="text-[11px] text-gray-300">
                ইন্টারনেট বা লিঙ্ক ছাড়াই সরাসরি ফাইল ফোনে নামিয়ে যেকোনো ব্রাউজারে অফলাইনে চালাতে পারেন:
              </p>
              <a
                href="/api/download/offline-app"
                download="Dr_Munna_Assist_AI_Offline.html"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition"
              >
                <Download className="w-4 h-4 text-black" />
                <span>অফলাইন অ্যাপ ফাইল ডাউনলোড (.HTML)</span>
              </a>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#1c2744] hover:bg-[#243257] text-gray-200 font-bold text-xs transition border border-[#243257]"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};
