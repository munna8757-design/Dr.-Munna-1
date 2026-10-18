import React, { useState, useEffect, useRef } from 'react';
import { AppLanguage, OutfitType } from '../types';
import { VoiceService } from '../services/voiceService';
import { ApiClient } from '../services/apiClient';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  Bot,
  User,
  Heart,
  RotateCcw
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  outfit: OutfitType;
}

const REAL_HUMAN_IMAGES: Record<OutfitType, string> = {
  doctor: '/src/assets/images/avatar_doctor_1792299251841.jpg',
  sari: '/src/assets/images/avatar_sari_1792299252956.jpg',
  threepiece: '/src/assets/images/avatar_threepiece_1792299252947.jpg',
  professional: '/src/assets/images/avatar_professional_1792299253101.jpg',
  casual: '/src/assets/images/avatar_casual_1792299253249.jpg'
};

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  outfit
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(
    language === 'bn'
      ? 'হ্যালো! আমি প্রস্তুত। মাইক্রোফোন চালু করে যেকোনো বিষয়ে কথা বলুন।'
      : language === 'hi'
      ? 'नमस्ते! मैं तैयार हूँ। माइक चालू करें और मुझसे बात करें।'
      : 'Hello! I am ready. Tap the microphone and speak anything.'
  );

  const [mouthOpen, setMouthOpen] = useState(false);
  const [audioBars, setAudioBars] = useState([30, 60, 45, 80, 55, 70, 40, 65]);
  const recognitionRef = useRef<any>(null);

  // Lip-sync / mouth speaking animation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSpeaking) {
      timer = setInterval(() => {
        setMouthOpen((prev) => !prev);
        setAudioBars([
          Math.floor(20 + Math.random() * 75),
          Math.floor(35 + Math.random() * 60),
          Math.floor(50 + Math.random() * 45),
          Math.floor(30 + Math.random() * 65),
          Math.floor(65 + Math.random() * 30),
          Math.floor(40 + Math.random() * 55),
          Math.floor(25 + Math.random() * 70),
          Math.floor(45 + Math.random() * 50)
        ]);
      }, 140);
    } else {
      setMouthOpen(false);
      setAudioBars([15, 15, 15, 15, 15, 15, 15, 15]);
    }
    return () => clearInterval(timer);
  }, [isSpeaking]);

  // Setup Web Speech recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If user said something, automatically process and answer
        if (transcript.trim()) {
          handleProcessVoiceQuery(transcript.trim());
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      try {
        recognitionRef.current?.abort();
      } catch (_) {}
      VoiceService.stop();
    };
  }, [isOpen, language, transcript]);

  // Process user's voice query and speak back
  const handleProcessVoiceQuery = async (queryText: string) => {
    if (!queryText || busy) return;
    setBusy(true);
    setLastQuestion(queryText);
    setTranscript('');

    try {
      const reply = await ApiClient.askChat(queryText);
      setAiAnswer(reply);
      // Speak back with Sweet Voice in the matching language
      VoiceService.speak(reply, {
        language,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (err: any) {
      const errorMsg =
        language === 'bn'
          ? 'উত্তরে বিলম্ব হচ্ছে, অনুগ্রহ করে আবার বলুন।'
          : language === 'hi'
          ? 'उत्तर देने में देरी हो रही है, कृपया दोबारा कहें।'
          : 'Processing delayed, please speak again.';
      setAiAnswer(errorMsg);
      VoiceService.speak(errorMsg, { language });
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      if (isSpeaking) {
        VoiceService.stop();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start recognition failed', e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#151d33] via-[#0b1020] to-[#080d1a] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            VoiceService.stop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="w-full flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
            <span>LIVE VOICE CHAT · সরাসরি কথা বলুন</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold ml-auto mr-8">
            {language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'}
          </span>
        </div>

        {/* Center Real Human Animated Avatar */}
        <div className="relative my-2 flex items-center justify-center">
          {/* Animated Glowing Aura */}
          <div
            className={`absolute w-56 h-56 rounded-full blur-2xl transition-all duration-500 ${
              isSpeaking
                ? 'bg-gradient-to-tr from-pink-500/40 via-purple-600/40 to-cyan-400/40 scale-125'
                : isListening
                ? 'bg-gradient-to-tr from-red-500/40 via-amber-500/30 to-cyan-400/30 scale-115'
                : 'bg-cyan-500/15'
            }`}
          />

          {/* Portrait Container with Breathing & Sway */}
          <div
            className={`relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
              isSpeaking
                ? 'border-pink-400 shadow-pink-500/30 scale-105'
                : isListening
                ? 'border-red-400 shadow-red-500/30 scale-102'
                : 'border-cyan-500/40'
            }`}
          >
            <img
              src={REAL_HUMAN_IMAGES[outfit]}
              alt="Live Assistant"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />

            {/* Speaking Lip-Sync / Mouth Movement Animation Overlay */}
            {isSpeaking && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-[47%] transition-all duration-100 ${
                  mouthOpen
                    ? 'w-4 h-2.5 bg-[#8b1e3f] rounded-full scale-110 shadow-inner'
                    : 'w-3.5 h-1 bg-[#8b1e3f] rounded-full opacity-70'
                }`}
              />
            )}

            {/* Speaking Frequency Waves Overlay */}
            {isSpeaking && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center gap-1">
                {audioBars.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h * 0.25}px` }}
                    className="w-1 bg-gradient-to-t from-pink-400 to-cyan-400 rounded-full transition-all duration-100"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Subtitles & Text Output */}
        <div className="w-full bg-[#0b1020]/90 border border-[#243257] rounded-2xl p-3.5 my-2 space-y-1.5 text-xs min-h-[90px] max-h-[140px] overflow-y-auto">
          {lastQuestion && (
            <p className="text-gray-400 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">"{lastQuestion}"</span>
            </p>
          )}

          <div className="text-white leading-relaxed flex items-start gap-1.5">
            <Bot className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
            <p className="select-text">
              {busy ? (
                <span className="text-cyan-300 animate-pulse">উত্তর তৈরি হচ্ছে…</span>
              ) : transcript ? (
                <span className="text-amber-300 italic">শুনছি: "{transcript}"</span>
              ) : (
                aiAnswer
              )}
            </p>
          </div>
        </div>

        {/* Microphone and Audio Controls */}
        <div className="w-full flex items-center justify-around pt-2">
          {/* Repeat / Listen button */}
          <button
            onClick={() =>
              VoiceService.speak(aiAnswer, {
                language,
                onStart: () => setIsSpeaking(true),
                onEnd: () => setIsSpeaking(false)
              })
            }
            className="p-3 rounded-full bg-[#151d33] border border-gray-700 text-cyan-300 hover:text-white transition"
            title="পুনরায় শুনুন"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Giant Mic Toggle Button */}
          <button
            onClick={toggleMic}
            className={`p-5 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white scale-115 ring-8 ring-red-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 text-black hover:scale-105 active:scale-95 shadow-cyan-500/30'
            }`}
            title={isListening ? 'শোনা বন্ধ করুন' : 'কথা বলুন'}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          {/* Audio Stop Button */}
          <button
            onClick={() => {
              VoiceService.stop();
              setIsSpeaking(false);
            }}
            className="p-3 rounded-full bg-[#151d33] border border-gray-700 text-pink-300 hover:text-white transition"
            title="কণ্ঠ থামান"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-3 text-center">
          {isListening
            ? '🔴 কথা বলুন… আপনার ভাষা স্বয়ংক্রিয়ভাবে শনাক্ত হচ্ছে।'
            : isSpeaking
            ? '🔊 মিষ্টি কণ্ঠে উত্তর দেওয়া হচ্ছে।'
            : 'মাইক্রোফোনে ট্যাপ করে প্রশ্ন করুন (বাংলা / English / हिन्दी)'}
        </p>
      </div>
    </div>
  );
};
