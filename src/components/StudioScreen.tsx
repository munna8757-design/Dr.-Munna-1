import React, { useState } from 'react';
import { BackendConfig, StudioKind } from '../types';
import { ApiClient } from '../services/apiClient';
import { AssistantLogic } from '../services/assistantLogic';
import { CinematicVideoPlayer } from './CinematicVideoPlayer';
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  Copy,
  Share2,
  Check,
  Download,
  RefreshCw,
  Film,
  Music,
  Smile,
  BookOpen
} from 'lucide-react';

interface StudioScreenProps {
  config: BackendConfig;
}

export const StudioScreen: React.FC<StudioScreenProps> = ({ config }) => {
  const [kind, setKind] = useState<StudioKind>('ভিডিও');
  const [subCategory, setSubCategory] = useState<string>('গান');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMime, setImageMime] = useState('image/png');
  const [videoOperation, setVideoOperation] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const writingSubTypes = [
    { id: 'গান', label: 'গান (Music Video)', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'ছড়া', label: 'ছড়া (Cartoon Rhyme)', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'গল্প', label: 'গল্প (Cinema Movie Clip)', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'কবিতা', label: 'কবিতা (Poetry)', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'পোস্ট', label: 'পোস্ট ও কোড', icon: <FileText className="w-3.5 h-3.5" /> }
  ];

  // Handle generation for text, image, or cinema video
  const handleGenerate = async () => {
    const p = prompt.trim();
    if (!p || busy) return;

    setBusy(true);
    setResult('');
    setImageBase64('');
    setVideoOperation('');
    setVideoStatus('');
    setCopied(false);
    setShareSuccess(false);

    try {
      if (kind === 'ছবি') {
        const res = await ApiClient.generateImage(p);
        if (res.imageBase64) {
          setImageBase64(res.imageBase64);
          setImageMime(res.mimeType || 'image/png');
          setResult(res.reply || 'ছবি তৈরি সম্পন্ন হয়েছে!');
        } else {
          setResult(res.reply || 'ছবি তৈরি করা যায়নি। সার্ভার কনফিগারেশন পরীক্ষা করুন।');
        }
      } else {
        // Video or Writing generation: create the tailored lyrics, poem, rhyme or story
        const fullPrompt =
          subCategory === 'গান'
            ? `একটি আকর্ষণীয় ও শ্রুতিমধুর গান/লিরিক্স রচনা করুন। বিষয়: ${p}। গানটিতে সুর, ছন্দ ও তাল বজায় রাখুন যেন শিল্পীর কণ্ঠে সুন্দরভাবে গাওয়া যায়।`
            : subCategory === 'ছড়া'
            ? `ছোটদের ও বড়দের জন্য একটি মিষ্টি, ছন্দময় ও মজার ছড়া লিখুন। বিষয়: ${p}। প্রতিটি চরণে সুন্দর অন্ত্যমিল রাখুন যেন সুর করে আবৃত্তি করা যায়।`
            : subCategory === 'গল্প'
            ? `একটি সিনেমার দৃশ্য বা আকর্ষণীয় গল্প লিখুন। বিষয়: ${p}। এতে নাটকীয়তা, সংলাপ ও ভিজ্যুয়াল বর্ণনা দিন যেন একটি সিনেমা মুভি ক্লিপ তৈরি করা যায়।`
            : `বাংলায় মানসম্মত ${subCategory} তৈরি করুন। বিষয়: ${p}। সুললিত ভাষায় লিখুন।`;

        if (!config.useBuiltinProxy && !config.url.trim()) {
          const offlineRes = AssistantLogic.makeCreation(subCategory, p);
          setResult(offlineRes);
        } else {
          try {
            const serverRes = await ApiClient.askChat(fullPrompt);
            setResult(serverRes);
          } catch {
            const fallback = AssistantLogic.makeCreation(subCategory, p);
            setResult(`${fallback}\n\n(অফলাইন ডেমো টেমপ্লেট থেকে প্রদর্শিত)`);
          }
        }

        // If in video mode, also trigger async backend video operation tracking
        if (kind === 'ভিডিও') {
          try {
            const opRes = await ApiClient.startVideo(p);
            if (opRes.operation) {
              setVideoOperation(opRes.operation);
              setVideoStatus(opRes.status || 'processing');
            }
          } catch (_) {}
        }
      }
    } catch (err: any) {
      setResult(`এই কাজটি সম্পন্ন করা যায়নি: ${err.message || 'অপ্রত্যাশিত ত্রুটি'}`);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dr. Munna AI - ${subCategory}`,
          text: result
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  const downloadImage = () => {
    if (!imageBase64) return;
    const link = document.createElement('a');
    link.href = `data:${imageMime};base64,${imageBase64}`;
    link.download = `dr-munna-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#61e7f5]" />
          <span className="text-xs font-bold tracking-wider text-[#61e7f5] uppercase">
            MULTIMODAL CINEMATIC STUDIO
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Cinema & Video Studio
        </h1>
        <p className="text-xs text-gray-300">
          লেখা দিলে গান হলে শিল্পীর কণ্ঠে সুর, ছড়া হলে ছড়ার আবৃত্তি এবং গল্প হলে দৃশ্যপট ও ভয়েস সহ সম্পূর্ণ সিনেমা মুভি ক্লিপ তৈরি করুন।
        </p>
      </div>

      {/* Mode Filter Tabs: ভিডিও মেকার, লেখা, ছবি */}
      <div className="flex items-center gap-2 p-1.5 bg-[#151d33] border border-[#243257] rounded-2xl">
        {(
          [
            { id: 'ভিডিও', label: 'মুভি ও ভিডিও মেকার', icon: <Video className="w-4 h-4" /> },
            { id: 'লেখা', label: 'টেক্সট লিরিক্স ও গল্প', icon: <FileText className="w-4 h-4" /> },
            { id: 'ছবি', label: 'AI ছবি', icon: <ImageIcon className="w-4 h-4" /> }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setKind(tab.id);
              setResult('');
              setImageBase64('');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              kind === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subcategory pills for Video/Writing */}
      {kind !== 'ছবি' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs text-gray-400 font-medium shrink-0">ভিডিওর ধরন:</span>
          {writingSubTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSubCategory(t.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition flex items-center gap-1.5 shrink-0 ${
                subCategory === t.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 font-bold shadow-sm'
                  : 'bg-[#151d33] border-[#243257] text-gray-300 hover:border-gray-500'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-3 bg-[#151d33] p-4 rounded-2xl border border-[#243257]">
        <label className="block text-xs font-semibold text-gray-200">
          {kind === 'ছবি'
            ? 'ছবির বিস্তারিত প্রম্পট লিখুন:'
            : `কী নিয়ে ${subCategory} এবং মুভি ক্লিপ বানাতে চান?`}
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            kind === 'ছবি'
              ? 'যেমন: ডিজিটাল ক্লিনিকে আধুনিক চিকিৎসকের দৃষ্টিনন্দন স্টুডিও পোর্ট্রেট...'
              : subCategory === 'গান'
              ? 'যেমন: মেঘলা দিনের ভালোবাসার গান, বৃষ্টির ছন্দ...'
              : subCategory === 'ছড়া'
              ? 'যেমন: চাঁদের দেশে খোকন সোনা, রঙিন প্রজাপতি...'
              : 'যেমন: এক সাহসী যোদ্ধার গল্প, রহস্যময় পাহাড়ি অভিযান...'
          }
          className="w-full p-3 text-sm bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy || !prompt.trim()}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#61e7f5] via-blue-500 to-purple-600 text-black hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          {busy ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>মুভি ক্লিপ ও মিউজিক তৈরি হচ্ছে… অপেক্ষা করুন</span>
            </>
          ) : (
            <>
              <Film className="w-4 h-4" />
              <span>
                {kind === 'ছবি'
                  ? 'ছবি তৈরি করুন'
                  : `সম্পূর্ণ ${subCategory} ও সিনেমা মুভি ক্লিপ বানান`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* FULL CINEMATIC MOVIE & VIDEO PLAYER */}
      {result && (
        <CinematicVideoPlayer
          text={result}
          category={subCategory}
          topic={prompt}
          onShare={handleShare}
        />
      )}

      {/* Raw Text View (Lyrics / Story / Poem) */}
      {result && (
        <div className="bg-[#151d33] border border-[#243257] rounded-2xl p-4 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#243257] pb-2">
            <span className="text-xs font-bold text-[#61e7f5] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>মূল স্ক্রিপ্ট ও লিরিক্স ({subCategory})</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs rounded-lg text-gray-300 hover:text-white hover:bg-[#243257] flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
              <button
                onClick={handleShare}
                className="px-2.5 py-1 text-xs rounded-lg text-gray-300 hover:text-white hover:bg-[#243257] flex items-center gap-1 transition"
              >
                {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>শেয়ার</span>
              </button>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-sm text-gray-100 leading-relaxed select-text font-normal max-h-64 overflow-y-auto pr-1">
            {result}
          </div>
        </div>
      )}

      {/* Generated Image Output */}
      {imageBase64 && (
        <div className="bg-[#151d33] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300">জেনারেটেড ছবি</span>
            <button
              onClick={downloadImage}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#243257] text-white hover:bg-[#2e406f] flex items-center gap-1.5 transition font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড করুন</span>
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#243257] bg-black/40">
            <img
              src={`data:${imageMime};base64,${imageBase64}`}
              alt="AI Generated"
              className="w-full max-h-[420px] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
