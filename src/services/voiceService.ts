import { AppLanguage } from '../types';

export interface VoicePreset {
  id: string;
  name: string;
  pitch: number;
  rate: number;
  description: string;
}

export const SWEET_VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'sweet_melody',
    name: '🌸 মিষ্টি ও কোমল কণ্ঠ (Sweet & Melodic)',
    pitch: 1.25,
    rate: 0.88,
    description: 'উচ্চ মধুরতা, কোমল ও শান্ত নারী বাচনভঙ্গি'
  },
  {
    id: 'natural_sweet',
    name: '💖 প্রাকৃতিক মিষ্টি কণ্ঠ (Natural Sweet)',
    pitch: 1.18,
    rate: 0.92,
    description: 'বাস্তবসম্মত মিষ্টি ও পরিষ্কার কথোপকথন'
  },
  {
    id: 'gentle_doc',
    name: '🩺 স্নিগ্ধ ডাক্তার সহকারী (Gentle Clinical)',
    pitch: 1.12,
    rate: 0.95,
    description: 'স্নেহশীল ও স্পষ্ট পেশাদার কণ্ঠ'
  }
];

const PREFS_KEY = 'dr_munna_sweet_voice_prefs';

export interface SweetVoiceConfig {
  presetId: string;
  pitch: number;
  rate: number;
  preferredVoiceURI: string;
  currentLanguage: AppLanguage;
}

export const VoiceService = {
  getConfig(): SweetVoiceConfig {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
      presetId: 'sweet_melody',
      pitch: 1.25,
      rate: 0.88,
      preferredVoiceURI: '',
      currentLanguage: 'bn'
    };
  },

  saveConfig(config: SweetVoiceConfig) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(config));
    } catch (_) {}
  },

  // Harmonic sweet intro chime
  playSweetChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(739.99, t); // F#5
      osc1.frequency.exponentialRampToValueAtTime(1108.73, t + 0.15); // C#6
      gain1.gain.setValueAtTime(0.06, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.36);
    } catch (_) {}
  },

  // Get filtered sweet female voices available on the device for chosen language
  getSweetFemaleVoices(lang: AppLanguage = 'bn'): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const all = window.speechSynthesis.getVoices();

    const isFemale = (v: SpeechSynthesisVoice) => {
      const n = (v.name + ' ' + v.lang).toLowerCase();
      const femaleKeywords = [
        'female',
        'woman',
        'girl',
        'subhasini',
        'nabaneeta',
        'zira',
        'samantha',
        'victoria',
        'karen',
        'sonia',
        'moira',
        'tessa',
        'fiona',
        'veena',
        'swara',
        'kalpana',
        'neerja',
        'ananya',
        'natural'
      ];
      const maleKeywords = ['male', 'man', 'david', 'george', 'mark', 'prabhat', 'hemant', 'ravi'];
      if (maleKeywords.some((m) => n.includes(m))) return false;
      return femaleKeywords.some((f) => n.includes(f));
    };

    const targetLangCode = lang === 'bn' ? 'bn' : lang === 'hi' ? 'hi' : 'en';

    const sorted = [...all].sort((a, b) => {
      const aName = (a.name + ' ' + a.lang).toLowerCase();
      const bName = (b.name + ' ' + b.lang).toLowerCase();

      // Top priority: matched language
      const aMatches = aName.includes(targetLangCode) || a.lang.startsWith(targetLangCode);
      const bMatches = bName.includes(targetLangCode) || b.lang.startsWith(targetLangCode);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;

      // Second priority: female sweet voices
      const aIsSweet = isFemale(a);
      const bIsSweet = isFemale(b);
      if (aIsSweet && !bIsSweet) return -1;
      if (!aIsSweet && bIsSweet) return 1;

      return 0;
    });

    return sorted;
  },

  // Pick the best natural sweet female voice
  getBestSweetVoice(lang: AppLanguage = 'bn', preferredURI?: string): SpeechSynthesisVoice | null {
    const list = this.getSweetFemaleVoices(lang);
    if (!list.length) {
      const all = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      return all[0] || null;
    }

    if (preferredURI) {
      const matched = list.find((v) => v.voiceURI === preferredURI);
      if (matched) return matched;
    }

    const targetLangCode = lang === 'bn' ? 'bn' : lang === 'hi' ? 'hi' : 'en';
    const langVoice = list.find((v) => v.lang.startsWith(targetLangCode) || v.name.toLowerCase().includes(targetLangCode));
    if (langVoice) return langVoice;

    return list[0] || null;
  },

  // Speak with sweet female tone in chosen language (bn, en, or hi)
  speak(
    text: string,
    options?: {
      language?: AppLanguage;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
      customPitch?: number;
      customRate?: number;
    }
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    this.playSweetChime();

    const config = this.getConfig();
    const lang = options?.language || config.currentLanguage || 'bn';

    const cleanText = text
      .replace(/^Munna AI:\s*/i, '')
      .replace(/[*#_~`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = this.getBestSweetVoice(lang, config.preferredVoiceURI);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || (lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US');
    } else {
      utterance.lang = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
    }

    // Sweet pitch & natural conversational speed
    utterance.pitch = options?.customPitch ?? config.pitch ?? 1.25;
    utterance.rate = options?.customRate ?? config.rate ?? 0.88;
    utterance.volume = 1.0;

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => options?.onEnd?.();
    utterance.onerror = () => options?.onEnd?.();

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);
  },

  stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};
