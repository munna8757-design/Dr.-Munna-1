import React, { useState, useEffect, useRef } from 'react';
import { OutfitType, AvatarMode, AppLanguage } from '../types';
import {
  VoiceService,
  SWEET_VOICE_PRESETS,
  VoicePreset,
  SweetVoiceConfig
} from '../services/voiceService';
import { LiveVoiceModal } from './LiveVoiceModal';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  Eye,
  Shirt,
  Activity,
  Heart,
  ChevronDown,
  Smile,
  Mic,
  MessageCircle,
  Radio,
  UserCheck,
  Music,
  Sliders,
  Check,
  Languages,
  Info,
  ShieldCheck,
  Headphones
} from 'lucide-react';

interface AvatarDisplayProps {
  initialOutfit?: OutfitType;
  initialMode?: AvatarMode;
  onNavigateToChat?: () => void;
  className?: string;
}

// Photorealistic real human portrait assets generated for each outfit
const REAL_HUMAN_IMAGES: Record<OutfitType, string> = {
  doctor: '/src/assets/images/avatar_doctor_1792299251841.jpg',
  sari: '/src/assets/images/avatar_sari_1792299252956.jpg',
  threepiece: '/src/assets/images/avatar_threepiece_1792299252947.jpg',
  professional: '/src/assets/images/avatar_professional_1792299253101.jpg',
  casual: '/src/assets/images/avatar_casual_1792299253249.jpg'
};

const REAL_ANATOMY_IMAGE = '/src/assets/images/anatomy_organs_1792300685684.jpg';

const OUTFIT_NAMES: Record<
  AppLanguage,
  Record<OutfitType, { label: string; description: string }>
> = {
  bn: {
    doctor: { label: 'ডক্টরস কোট', description: 'মেডিকেল অ্যাপ্রন, স্ক্রাবস ও স্টেথোস্কোপ' },
    sari: { label: 'শাড়ি', description: 'ঐতিহ্যবাহী জামদানি শাড়ি ও অলংকার' },
    threepiece: { label: 'থ্রি-পিস', description: 'মার্জিত সালোয়ার কামিজ ও ওড়না' },
    casual: { label: 'ক্যাজুয়াল', description: 'স্মার্ট ডেনিম জ্যাকেট ও টপ' },
    professional: { label: 'প্রফেশনাল', description: 'কর্পোরেট ফরমাল এক্সিকিউটিভ স্যুট' }
  },
  en: {
    doctor: { label: "Doctor's Coat", description: 'Lab coat, scrubs & stethoscope' },
    sari: { label: 'Traditional Sari', description: 'Elegant silk jamdani drape' },
    threepiece: { label: 'Salwar Kameez', description: 'Graceful three-piece outfit' },
    casual: { label: 'Casual Denim', description: 'Modern jacket & stylish jeans' },
    professional: { label: 'Executive Suit', description: 'Tailored corporate blazer' }
  },
  hi: {
    doctor: { label: 'डॉक्टर्स कोट', description: 'मेडिकल एप्रन, स्क्रब्स और स्टेथोस्कोप' },
    sari: { label: 'पारंपरिक साड़ी', description: 'सुरुचिपूर्ण सिल्क साड़ी और आभूषण' },
    threepiece: { label: 'थ्री-पीस सूट', description: 'सुंदर सलवार कमीज और दुपट्टा' },
    casual: { label: 'कैज़ुअल डेनिम', description: 'स्मार्ट जैकेट और आधुनिक लुक' },
    professional: { label: 'प्रोफेशनल सूट', description: 'कॉरपोरेट फॉर्मल ब्लेज़र' }
  }
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  initialOutfit = 'doctor',
  initialMode = 'human',
  onNavigateToChat,
  className = ''
}) => {
  const [currentDress, setCurrentDress] = useState<OutfitType>(initialOutfit);
  const [viewMode, setViewMode] = useState<AvatarMode>(initialMode);
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('bn');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activeGesture, setActiveGesture] = useState<'idle' | 'wave' | 'explain' | 'heart'>('idle');
  const [mouthOpen, setMouthOpen] = useState(false);

  // Sweet voice settings
  const [voiceConfig, setVoiceConfig] = useState<SweetVoiceConfig>(() =>
    VoiceService.getConfig()
  );
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const defaultGreeting = {
    bn: 'আসসালামু আলাইকুম! আমি Dr. Munna AI-এর রিয়েল ভার্চুয়াল অ্যাসিস্ট্যান্ট।',
    en: 'Hello! I am Dr. Munna AI, your real human virtual assistant.',
    hi: 'नमस्ते! मैं Dr. Munna AI की रियल वर्चुअल सहायक हूँ।'
  };

  const [actionMessage, setActionMessage] = useState(defaultGreeting['bn']);
  const [audioLevel, setAudioLevel] = useState<number[]>([40, 60, 85, 50, 75, 45, 90, 60]);

  // Load voices dynamically on mount and when voices change
  useEffect(() => {
    const loadVoices = () => {
      const list = VoiceService.getSweetFemaleVoices(currentLanguage);
      setAvailableVoices(list);
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [currentLanguage]);

  // Handle language switch
  const handleLanguageChange = (lang: AppLanguage) => {
    setCurrentLanguage(lang);
    setActionMessage(defaultGreeting[lang]);
    const updated = { ...voiceConfig, currentLanguage: lang };
    setVoiceConfig(updated);
    VoiceService.saveConfig(updated);

    const confirmation =
      lang === 'bn'
        ? 'ভাষা বাংলায় পরিবর্তন করা হয়েছে।'
        : lang === 'hi'
        ? 'भाषा हिन्दी में बदल दी गई है।'
        : 'Language switched to English.';
    playSweetVoice(confirmation, lang);
  };

  // Mouth and lip-sync animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSpeaking) {
      timer = setInterval(() => {
        setMouthOpen((prev) => !prev);
        setAudioLevel([
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 60),
          Math.floor(55 + Math.random() * 45),
          Math.floor(35 + Math.random() * 65),
          Math.floor(60 + Math.random() * 40),
          Math.floor(45 + Math.random() * 55),
          Math.floor(25 + Math.random() * 75),
          Math.floor(40 + Math.random() * 60)
        ]);
      }, 130);
    } else {
      setMouthOpen(false);
      setAudioLevel([20, 20, 20, 20, 20, 20, 20, 20]);
    }
    return () => clearInterval(timer);
  }, [isSpeaking]);

  // Play sweet female voice using VoiceService
  const playSweetVoice = (text: string, lang = currentLanguage) => {
    if (isSpeaking) {
      VoiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setActionMessage(text);
    VoiceService.speak(text, {
      language: lang,
      customPitch: voiceConfig.pitch,
      customRate: voiceConfig.rate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  // Trigger gestures
  const triggerGesture = (type: 'wave' | 'explain' | 'heart') => {
    setActiveGesture(type);
    if (type === 'wave') {
      const msg =
        currentLanguage === 'bn'
          ? '👋 হ্যালো! কেমন আছেন? আমি আপনাকে সাহায্য করতে প্রস্তুত।'
          : currentLanguage === 'hi'
          ? '👋 नमस्ते! आप कैसे हैं? मैं आपकी मदद के लिए तैयार हूँ।'
          : '👋 Hello! How are you? I am ready to assist you.';
      playSweetVoice(msg);
    } else if (type === 'explain') {
      const msg =
        currentLanguage === 'bn'
          ? 'মানবদেহের অ্যানাটমি ও বিজ্ঞানসম্মত সুস্থতার নিয়ম সম্পর্কে জানতে প্রশ্ন করুন।'
          : currentLanguage === 'hi'
          ? 'मानव शरीर रचना और विज्ञान आधारित स्वास्थ्य नियमों के बारे में पूछें।'
          : 'Ask me anything about human anatomy and evidence-based health guidance.';
      playSweetVoice(msg);
    } else if (type === 'heart') {
      const msg =
        currentLanguage === 'bn'
          ? '💖 আপনার সুন্দর স্বাস্থ্য ও দীর্ঘায়ুর জন্য আমার আন্তরিক শুভকামনা।'
          : currentLanguage === 'hi'
          ? '💖 आपके अच्छे स्वास्थ्य और खुशियों के लिए मेरी हार्दिक शुभकामनाएँ।'
          : '💖 Wishing you vibrant health, peace, and happiness always.';
      playSweetVoice(msg);
    }
    setTimeout(() => setActiveGesture('idle'), 3000);
  };

  const sweetSpeechLines = {
    bn: [
      {
        title: '🌸 মিষ্টি কণ্ঠে পরিচয়',
        text: 'নমস্কার ও স্বাগতম! আমি Dr. Munna AI-এর মিষ্টি কণ্ঠের ভার্চুয়াল সহকারী। আপনার দিনটি সুন্দর ও আনন্দময় কাটুক।'
      },
      {
        title: '🩺 স্নেহশীল স্বাস্থ্য টিপস',
        text: 'নিজের যত্ন নিন, প্রচুর বিশুদ্ধ পানি পান করুন, এবং নিয়ম মেনে পরিমিত খাবার গ্রহণ করুন। আপনার সুস্বাস্থ্যই আমার সবচেয়ে বড় আনন্দ।'
      },
      {
        title: '👗 মিষ্টি কণ্ঠে পোশাকের রূপ',
        text: `আমি এখন পরে আছি ${OUTFIT_NAMES.bn[currentDress].label} (${OUTFIT_NAMES.bn[currentDress].description})।`
      }
    ],
    en: [
      {
        title: '🌸 Warm Introduction',
        text: 'Hello and welcome! I am your AI medical assistant. It is a pleasure to assist you with science and health education.'
      },
      {
        title: '🩺 Health & Wellness Tip',
        text: 'Stay hydrated, sleep 7 to 8 hours daily, and take time for gentle walking in the fresh air to maintain optimal wellness.'
      },
      {
        title: '👗 Current Outfit Info',
        text: `I am currently dressed in the ${OUTFIT_NAMES.en[currentDress].label} (${OUTFIT_NAMES.en[currentDress].description}).`
      }
    ],
    hi: [
      {
        title: '🌸 मधुर परिचय',
        text: 'नमस्ते और स्वागत है! मैं Dr. Munna AI की मीठी आवाज़ वाली वर्चुअल सहायक हूँ। आपकी सहायता करना मेरा सौभाग्य है।'
      },
      {
        title: '🩺 स्वास्थ्य सलाह',
        text: 'नियमित रूप से पर्याप्त पानी पिएं, पौष्टिक भोजन लें और प्रतिदिन तनावमुक्त रहकर मुस्कुराते रहें।'
      },
      {
        title: '👗 पोशाक परिचय',
        text: `मैंने अभी ${OUTFIT_NAMES.hi[currentDress].label} पहनी हुई है (${OUTFIT_NAMES.hi[currentDress].description})।`
      }
    ]
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c2242] via-[#151d33] to-[#0b1020] border border-cyan-500/35 shadow-2xl ${className}`}
    >
      {/* Top Header Controls: Languages + Live Mode Button */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between">
        {/* Language Switcher (বাংলা, English, हिन्दी) */}
        <div className="flex items-center gap-1 bg-[#0b1020]/90 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg">
          <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          {(
            [
              { id: 'bn', label: 'বাংলা' },
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिन्दी' }
            ] as const
          ).map((l) => (
            <button
              key={l.id}
              onClick={() => handleLanguageChange(l.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition ${
                currentLanguage === l.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Live Voice Chat Button (সরাসরি কথা বলুন) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsLiveOpen(true)}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition"
            title="লাইভ ভয়েস মোড খুলুন"
          >
            <Headphones className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Voice</span>
          </button>

          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="p-2 rounded-full border border-pink-500/40 bg-[#151d33]/90 text-pink-300 hover:bg-pink-950/40 transition shadow-md"
            title="মিষ্টি কণ্ঠ টিউন সেটিংস"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice Tuner Drawer */}
      {showVoiceSettings && (
        <div className="absolute top-14 left-4 right-4 z-30 p-3.5 rounded-2xl bg-[#0f172a]/95 backdrop-blur-md border border-pink-500/40 shadow-2xl text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-pink-300 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-pink-400" />
              <span>মিষ্টি নারী কণ্ঠ টিউনিং ({currentLanguage.toUpperCase()})</span>
            </span>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="text-gray-400 hover:text-white px-2 py-0.5"
            >
              ✕
            </button>
          </div>

          {/* Voice Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-gray-300 font-semibold">ভয়েস টিউন প্রিসেট:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SWEET_VOICE_PRESETS.map((p) => {
                const active = voiceConfig.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      const updated = {
                        ...voiceConfig,
                        presetId: p.id,
                        pitch: p.pitch,
                        rate: p.rate
                      };
                      setVoiceConfig(updated);
                      VoiceService.saveConfig(updated);
                      playSweetVoice(`ভয়েস টিউন সেট করা হয়েছে: ${p.name}`);
                    }}
                    className={`p-2 rounded-xl text-left border transition ${
                      active
                        ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-pink-400 text-white'
                        : 'bg-[#151d33] border-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">{p.name}</div>
                    <div className="text-[9px] text-gray-400 line-clamp-1">{p.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders for Pitch and Rate */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1">
                <span>কণ্ঠের মিষ্টতা (Pitch):</span>
                <span className="text-pink-300 font-bold">{voiceConfig.pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.45"
                step="0.02"
                value={voiceConfig.pitch}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const updated = { ...voiceConfig, pitch: val };
                  setVoiceConfig(updated);
                  VoiceService.saveConfig(updated);
                }}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1">
                <span>কথা বলার গতি (Speed):</span>
                <span className="text-cyan-300 font-bold">{voiceConfig.rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.1"
                step="0.02"
                value={voiceConfig.rate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const updated = { ...voiceConfig, rate: val };
                  setVoiceConfig(updated);
                  VoiceService.saveConfig(updated);
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Avatar Stage */}
      <div className="relative w-full h-[400px] sm:h-[430px] flex items-center justify-center pt-8 overflow-hidden select-none">
        {/* Glow ambient background aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-72 h-72 rounded-full transition-all duration-700 blur-3xl ${
              isSpeaking
                ? 'bg-gradient-to-tr from-pink-500/35 via-rose-500/30 to-cyan-500/30 scale-110'
                : 'bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-transparent'
            }`}
          />
        </div>

        {/* REAL HUMAN AVATAR (Photorealistic Portrait with Movement & Gestures) */}
        {viewMode === 'human' && (
          <div className="relative w-full h-full flex items-center justify-center p-3 animate-fade-in">
            <div
              className={`relative h-[340px] sm:h-[370px] w-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500 group ${
                isSpeaking
                  ? 'border-pink-400 shadow-pink-500/30 scale-[1.02]'
                  : 'border-cyan-500/30'
              }`}
            >
              <img
                src={REAL_HUMAN_IMAGES[currentDress]}
                alt={`Real Human Female Avatar - ${OUTFIT_NAMES[currentLanguage][currentDress].label}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-top transition-transform duration-700 ${
                  isSpeaking ? 'scale-[1.04]' : 'scale-100'
                }`}
              />

              {/* Realistic Lip-sync / Speaking Mouth Movement Overlay */}
              {isSpeaking && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-[47%] transition-all duration-100 ${
                    mouthOpen
                      ? 'w-4 h-2.5 bg-[#8b1e3f] rounded-full scale-110 shadow-inner'
                      : 'w-3.5 h-1 bg-[#8b1e3f] rounded-full opacity-70'
                  }`}
                />
              )}

              {/* Interactive Gesture Floating Icon (Wave / Explain / Heart) */}
              {activeGesture !== 'idle' && (
                <div className="absolute top-4 right-4 z-20 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-cyan-400/50 text-white animate-bounce">
                  {activeGesture === 'wave' && <Smile className="w-5 h-5 text-amber-300" />}
                  {activeGesture === 'explain' && <Activity className="w-5 h-5 text-cyan-300" />}
                  {activeGesture === 'heart' && <Heart className="w-5 h-5 text-rose-400 fill-current" />}
                </div>
              )}

              {/* Realistic subtle ambient light vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/90 via-transparent to-black/20 pointer-events-none" />

              {/* Live Real Sweet Voice Soundwave Overlay */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-black/75 backdrop-blur-md border border-pink-400/50 shadow-lg shadow-pink-500/20">
                  <Radio className="w-4 h-4 text-pink-400 animate-pulse shrink-0" />
                  <div className="flex items-center gap-1 h-6">
                    {audioLevel.map((lvl, idx) => (
                      <span
                        key={idx}
                        style={{ height: `${lvl}%` }}
                        className="w-1 bg-gradient-to-t from-pink-400 via-purple-400 to-cyan-300 rounded-full transition-all duration-100"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-pink-200 pl-1">
                    {currentLanguage === 'bn'
                      ? 'মিষ্টি কণ্ঠে কথা বলছে…'
                      : currentLanguage === 'hi'
                      ? 'मधुर आवाज़ में बोल रही हैं…'
                      : 'Speaking with Sweet Voice…'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: ANATOMY & INTERNAL ORGANS (Photorealistic Medical 3D View) */}
        {viewMode === 'organs' && (
          <div className="relative w-full h-full flex items-center justify-center p-3 animate-fade-in">
            <div className="relative h-[340px] sm:h-[370px] w-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-400/40 group">
              <img
                src={REAL_ANATOMY_IMAGE}
                alt="Realistic Medical Anatomy Organs System"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Glowing Heart Pulse Indicator */}
              <div className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span className="w-6 h-6 rounded-full bg-red-500/40 animate-ping block" />
              </div>

              {/* Organ Labels overlay */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/75 backdrop-blur-md border border-cyan-500/30 text-[10px] text-cyan-200 space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>বাস্তবসম্মত অঙ্গসংস্থান ও সংবহনতন্ত্র (3D Medical Anatomy)</span>
                </div>
                <p className="text-gray-300">
                  মস্তিষ্ক (Brain), হৃৎপিণ্ড (Aorta & Heart), ফুসফুস (Lungs), রক্তনালী ও মেরুদণ্ড।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: SKELETAL SYSTEM */}
        {viewMode === 'skeleton' && (
          <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
            <svg viewBox="0 0 300 380" className="w-full h-full max-h-[360px] drop-shadow-xl">
              <ellipse cx="150" cy="75" rx="24" ry="28" fill="#f1f5f9" />
              <ellipse cx="141" cy="76" rx="4.5" ry="5.5" fill="#0f172a" />
              <ellipse cx="159" cy="76" rx="4.5" ry="5.5" fill="#0f172a" />
              <path d="M148 88 L150 83 L152 88 Z" fill="#0f172a" />
              <path d="M141 98 L159 98" stroke="#0f172a" strokeWidth="2" />

              <line x1="150" y1="108" x2="150" y2="280" stroke="#cbd5e1" strokeWidth="7" strokeDasharray="4 2" />

              {[135, 150, 165, 180, 195, 210].map((y, idx) => (
                <ellipse
                  key={idx}
                  cx="150"
                  cy={y}
                  rx={32 - idx * 2}
                  ry="9"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
              ))}

              <path
                d="M120 270 C128 250 172 250 180 270 C170 300 130 300 120 270 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              <line x1="135" y1="285" x2="135" y2="365" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
              <line x1="165" y1="285" x2="165" y2="365" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />

              <text x="150" y="32" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">
                কঙ্কালতন্ত্র (Skeletal System)
              </text>
            </svg>
          </div>
        )}

        {/* Live Action Toast Feedback Bar */}
        <div className="absolute bottom-3 left-4 right-4 z-20">
          <div className="bg-[#0b1020]/90 backdrop-blur-md border border-pink-500/30 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-pink-200 shadow-xl">
            <span className="truncate pr-2">{actionMessage}</span>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 text-[11px] text-pink-400 font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                Real Voice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTROL DOCK: VIEW, POSAK, & PLAY OPTIONS BUTTON         */}
      {/* ======================================================== */}
      <div className="p-3.5 bg-[#0b1020]/95 backdrop-blur-md border-t border-cyan-500/25 space-y-3">
        {/* Row 1: View Modes + PLAY OPTION BUTTON */}
        <div className="flex items-center justify-between gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#151d33] p-1 rounded-2xl border border-gray-800">
            <span className="text-[11px] font-bold text-gray-300 pl-1.5 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>View:</span>
            </span>
            {(
              [
                { id: 'human', label: 'রিয়েল মানুষ' },
                { id: 'organs', label: 'অঙ্গসংস্থান (Real)' },
                { id: 'skeleton', label: 'কঙ্কাল' }
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setViewMode(v.id);
                  const msgs = {
                    bn: {
                      human: 'বাস্তব মানুষ অবতার ভিউ প্রদর্শিত হচ্ছে।',
                      organs: 'বাস্তবসম্মত মানবদেহের অঙ্গসংস্থান ও সংবহনতন্ত্র ভিউ।',
                      skeleton: 'কঙ্কালতন্ত্র ও দেহকাঠামো ভিউ।'
                    },
                    en: {
                      human: 'Displaying real human female assistant view.',
                      organs: 'Displaying realistic anatomical organ system view.',
                      skeleton: 'Displaying skeletal structure system view.'
                    },
                    hi: {
                      human: 'रियल मानव अवतार दृश्य प्रदर्शित हो रहा है।',
                      organs: 'वास्तविक मानव अंग और संचलन प्रणाली दृश्य।',
                      skeleton: 'कंकाल तंत्र संरचना दृश्य।'
                    }
                  };
                  setActionMessage(msgs[currentLanguage][v.id]);
                }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition ${
                  viewMode === v.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* PLAY OPTION BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowPlayMenu(!showPlayMenu)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-600/30 hover:opacity-95 active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Play অপশন</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showPlayMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expandable Play Action Menu */}
            {showPlayMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#151d33] border border-pink-500/40 rounded-2xl p-2 shadow-2xl z-30 space-y-1 animate-fade-in text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-pink-400 uppercase tracking-wider border-b border-white/5 flex items-center gap-1">
                  <Music className="w-3 h-3 text-pink-400" />
                  <span>মিষ্টি কণ্ঠ ও বডি অ্যাকশন ({currentLanguage.toUpperCase()})</span>
                </div>

                {/* Gesture Triggers */}
                <div className="grid grid-cols-3 gap-1 pt-1 pb-1 border-b border-white/5">
                  <button
                    onClick={() => {
                      triggerGesture('wave');
                      setShowPlayMenu(false);
                    }}
                    className="p-1.5 rounded-lg bg-[#0b1020] text-center hover:bg-white/10 text-[10px] text-amber-300 font-bold"
                  >
                    👋 হাত নাড়ান
                  </button>
                  <button
                    onClick={() => {
                      triggerGesture('explain');
                      setShowPlayMenu(false);
                    }}
                    className="p-1.5 rounded-lg bg-[#0b1020] text-center hover:bg-white/10 text-[10px] text-cyan-300 font-bold"
                  >
                    🩺 ব্যাখ্যা দিন
                  </button>
                  <button
                    onClick={() => {
                      triggerGesture('heart');
                      setShowPlayMenu(false);
                    }}
                    className="p-1.5 rounded-lg bg-[#0b1020] text-center hover:bg-white/10 text-[10px] text-rose-300 font-bold"
                  >
                    💖 ভালোবাসা
                  </button>
                </div>

                {sweetSpeechLines[currentLanguage].map((line, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playSweetVoice(line.text);
                      setShowPlayMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-gray-200 hover:text-pink-300 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{line.title}</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    const dressList: OutfitType[] = [
                      'doctor',
                      'sari',
                      'threepiece',
                      'professional',
                      'casual'
                    ];
                    const nextIdx = (dressList.indexOf(currentDress) + 1) % dressList.length;
                    const nextDress = dressList[nextIdx];
                    setCurrentDress(nextDress);
                    setViewMode('human');
                    setActionMessage(
                      `পোশাক পরিবর্তন: ${OUTFIT_NAMES[currentLanguage][nextDress].label}`
                    );
                    setShowPlayMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-purple-300 font-semibold transition"
                >
                  <Shirt className="w-3.5 h-3.5 text-purple-400" />
                  <span>পরবর্তী পোশাক অটো-সুইচ</span>
                </button>

                {/* Direct Live Voice Room Access */}
                <button
                  onClick={() => {
                    setShowPlayMenu(false);
                    setIsLiveOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 font-bold flex items-center gap-2 transition pt-2 border-t border-white/5"
                >
                  <Headphones className="w-4 h-4 text-pink-400" />
                  <span>লাইভ ভয়েস রুমে কথা বলুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Waterdrop & Round Shape Outfit / Posak Buttons */}
        {viewMode === 'human' && (
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-[#b59bff]" />
                <span>পোশাক পরিবর্তন (Posak):</span>
              </span>
              <span className="text-[10px] text-pink-300">Waterdrop Round বাটন</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'doctor', label: OUTFIT_NAMES[currentLanguage].doctor.label },
                  { id: 'sari', label: OUTFIT_NAMES[currentLanguage].sari.label },
                  { id: 'threepiece', label: OUTFIT_NAMES[currentLanguage].threepiece.label },
                  { id: 'casual', label: OUTFIT_NAMES[currentLanguage].casual.label },
                  { id: 'professional', label: OUTFIT_NAMES[currentLanguage].professional.label }
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setCurrentDress(d.id);
                    setActionMessage(
                      `${OUTFIT_NAMES[currentLanguage][d.id].label} (${OUTFIT_NAMES[currentLanguage][d.id].description})`
                    );
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border shadow-md ${
                    currentDress === d.id
                      ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white border-pink-300 shadow-pink-500/30 scale-105 rounded-2xl rounded-br-none'
                      : 'bg-[#151d33] text-gray-300 border-gray-700/70 hover:border-pink-400 hover:text-white rounded-2xl rounded-br-none'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Live Voice Chat Room Modal */}
      <LiveVoiceModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
        language={currentLanguage}
        outfit={currentDress}
      />
    </div>
  );
};
