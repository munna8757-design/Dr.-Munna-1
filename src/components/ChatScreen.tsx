import React, { useState, useEffect, useRef } from 'react';
import { BackendConfig, ChatMessage, AppLanguage } from '../types';
import { ApiClient } from '../services/apiClient';
import { VoiceService } from '../services/voiceService';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Languages
} from 'lucide-react';

interface ChatScreenProps {
  config: BackendConfig;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ config }) => {
  const [chatLang, setChatLang] = useState<AppLanguage>('bn');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      sender: 'assistant',
      text: 'Munna AI: স্বাগতম! আমি বাংলা (বাংলা), English ও हिन्दी ভাষায় কথা বলতে ও লিখতে পারি। মাইক্রোফোন চাপলে voice input, speaker চাপলে মিষ্টি কণ্ঠে উত্তর শুনবেন।',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [lastAssistantReply, setLastAssistantReply] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  // Setup Web Speech API for voice recognition matching selected language
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        chatLang === 'bn' ? 'bn-BD' : chatLang === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setSpeechError(`ভয়েস রিকগনিশন সমস্যা: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      VoiceService.stop();
    };
  }, [chatLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট পাওয়া যায়নি। ক্রোম বা এজ ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition', err);
        setSpeechError('মাইক্রোফোন চালু করা যায়নি');
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      VoiceService.stop();
      setIsSpeaking(false);
      return;
    }

    VoiceService.speak(text, {
      language: chatLang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || busy) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    setSpeechError('');

    try {
      const reply = await ApiClient.askChat(promptToSend);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: reply.startsWith('Munna AI:') ? reply : `Munna AI: ${reply}`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLastAssistantReply(reply);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'system',
        text: `ত্রুটি: ${err.message || 'উত্তর পাওয়া যায়নি'}`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'initial',
        sender: 'assistant',
        text: 'Munna AI: নতুন চ্যাট শুরু হয়েছে। আপনি বাংলা, English বা हिन्दी ভাষায় যেকোনো প্রশ্ন করতে পারেন।',
        timestamp: Date.now()
      }
    ]);
    VoiceService.stop();
    setIsSpeaking(false);
  };

  const quickPromptsByLang: Record<AppLanguage, string[]> = {
    bn: [
      'স্বাস্থ্য ও সুস্থতার সহজ নিয়ম কী?',
      'মানবদেহের হৃৎপিণ্ড কীভাবে কাজ করে?',
      'একটি অনুপ্রেরণামূলক মিষ্টি কবিতা লিখুন',
      'প্রজনন স্বাস্থ্য ও পরিচ্ছন্নতার নিয়ম'
    ],
    en: [
      'What are essential daily health tips?',
      'How does the human heart function?',
      'Write an inspiring sweet poem for me',
      'Explain balanced nutrition and sleep'
    ],
    hi: [
      'स्वास्थ्य और तंदुरुस्ती के सरल नियम क्या हैं?',
      'मानव हृदय कैसे कार्य करता है?',
      'एक प्रेरणादायक मधुर कविता लिखिए',
      'संतुलित आहार और व्यायाम की सलाह'
    ]
  };

  const isConfigured = config.useBuiltinProxy || !!config.url.trim();

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] pb-4 animate-fade-in">
      {/* Header Info with Language Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-[#243257] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#61e7f5]">AI Chat & Voice</h1>
          </div>
          <p className="text-xs text-gray-400">
            {isConfigured
              ? 'বাংলা, English ও हिन्दी সমর্থিত · লাইভ মিষ্টি কণ্ঠ'
              : 'Offline demo · রুল-বেসড লোকাল অ্যাসিস্ট্যান্ট মোড'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-[#151d33] border border-gray-700 p-1 rounded-2xl">
            <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1" />
            {(
              [
                { id: 'bn', label: 'বাং' },
                { id: 'en', label: 'EN' },
                { id: 'hi', label: 'हिं' }
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                onClick={() => setChatLang(l.id)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-xl transition ${
                  chatLang === l.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            title="চ্যাট মুছুন"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {speechError && (
        <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-black font-bold'
                    : isSystem
                    ? 'bg-rose-900 text-rose-200'
                    : 'bg-[#243257] text-[#61e7f5]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-md transition-all ${
                  isUser
                    ? 'bg-[#1c2744] text-white border border-cyan-500/30'
                    : isSystem
                    ? 'bg-rose-950/40 text-rose-200 border border-rose-800/40'
                    : 'bg-[#151d33] text-gray-100 border border-[#243257]'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                  {msg.text}
                </div>

                {!isUser && !isSystem && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-end">
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-[11px] text-pink-300 hover:text-pink-200 flex items-center gap-1 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>মিষ্টি কণ্ঠে শুনুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#151d33] p-3 rounded-2xl border border-[#243257] w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-[#61e7f5] animate-spin" />
            <span>AI উত্তর তৈরি হচ্ছে…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickPromptsByLang[chatLang].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={busy}
              className="px-2.5 py-1 text-xs rounded-full bg-[#151d33] border border-[#243257] text-gray-300 hover:border-cyan-400/40 hover:text-white transition whitespace-nowrap shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Control Dock */}
      <div className="pt-2 border-t border-[#243257] space-y-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? chatLang === 'bn'
                    ? 'কথা বলুন… শুনছি'
                    : chatLang === 'hi'
                    ? 'बोलिए… सुन रही हूँ'
                    : 'Listening… please speak'
                  : chatLang === 'bn'
                  ? 'প্রশ্ন বা নির্দেশনা লিখুন (বাংলা/English/हिन्दी)…'
                  : chatLang === 'hi'
                  ? 'प्रश्न या निर्देश लिखें (हिंदी/English/বাংলা)…'
                  : 'Type your message or prompt (English/বাংলা/हिन्दी)…'
              }
              disabled={busy}
              className={`w-full px-4 py-3 text-sm bg-[#151d33] border rounded-2xl text-white placeholder-gray-400 focus:outline-none transition ${
                isListening
                  ? 'border-red-500 ring-2 ring-red-500/30'
                  : 'border-[#243257] focus:border-[#61e7f5]'
              }`}
            />
            {isListening && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </div>

          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'ভয়েস বন্ধ করুন' : 'ভয়েস ইনপুট শুরু করুন'}
            className={`p-3 rounded-2xl border transition ${
              isListening
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-[#151d33] border-[#243257] text-[#61e7f5] hover:bg-[#1c2744]'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            title="বার্তা পাঠান"
            className="p-3 rounded-2xl bg-gradient-to-tr from-[#61e7f5] to-blue-500 text-black hover:opacity-95 disabled:opacity-40 transition font-bold shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Global TTS Action Bar */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="truncate">
            {busy
              ? 'AI উত্তর তৈরি হচ্ছে…'
              : chatLang === 'bn'
              ? 'বাংলায় কথা বলুন বা লিখুন'
              : chatLang === 'hi'
              ? 'हिन्दी में बोलें या लिखें'
              : 'Speak or type in English'}
          </span>
          {lastAssistantReply && (
            <button
              onClick={() => handleSpeak(lastAssistantReply)}
              className="text-pink-300 hover:underline flex items-center gap-1"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>পড়া থামান</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>সর্বশেষ উত্তর শুনুন</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
