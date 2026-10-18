import React, { useState } from 'react';
import { NavPage } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { Avatar3D } from './Avatar3D';
import { PWAInstallBanner } from './PWAInstallBanner';
import {
  Mic,
  GraduationCap,
  Sparkles,
  Wrench,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Layers
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (page: NavPage) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [avatarFormat, setAvatarFormat] = useState<'2d' | '3d'>('2d');

  const features = [
    {
      page: 'AI Chat' as NavPage,
      title: 'AI Chat & Voice',
      description: 'চ্যাট, speech-to-text ও text-to-speech; live AI-এর জন্য backend সচল রাখুন',
      icon: <Mic className="w-6 h-6 text-[#61e7f5]" />,
      badge: 'ভয়েস ও চ্যাট'
    },
    {
      page: 'Learn' as NavPage,
      title: 'Human Body & Health Education',
      description: 'অ্যানাটমি, ঋতুচক্র, প্রজননস্বাস্থ্য, সম্মতি ও STI প্রতিরোধ',
      icon: <GraduationCap className="w-6 h-6 text-[#61e7f5]" />,
      badge: 'স্বাস্থ্য শিক্ষা'
    },
    {
      page: 'Studio' as NavPage,
      title: 'AI Creation Studio',
      description: 'লেখা তৈরি, AI request, কবিতা, গল্প, পোস্ট, ছবি ও ভিডিও',
      icon: <Sparkles className="w-6 h-6 text-[#61e7f5]" />,
      badge: 'সৃজনশীলতা'
    },
    {
      page: 'Tools' as NavPage,
      title: 'Tools & Builder',
      description: 'কোড টেমপ্লেট, dialer/SMS draft ও share',
      icon: <Wrench className="w-6 h-6 text-[#61e7f5]" />,
      badge: 'ইউটিলিটি'
    }
  ];

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Mobile Install PWA Banner */}
      <PWAInstallBanner />

      {/* Hero Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-[#61e7f5] uppercase px-2.5 py-0.5 rounded-full bg-[#61e7f5]/10 border border-[#61e7f5]/20">
              DR. MUNNA
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              AI Assistant Engine
            </span>
          </div>

          {/* 2D vs 3D Avatar Switcher */}
          <div className="flex items-center bg-[#151d33] border border-[#243257] p-1 rounded-2xl">
            <button
              onClick={() => setAvatarFormat('2d')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition flex items-center gap-1 ${
                avatarFormat === '2d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>2D Avatar</span>
            </button>
            <button
              onClick={() => setAvatarFormat('3d')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition flex items-center gap-1 ${
                avatarFormat === '3d'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>3D</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Assist AI
        </h1>
        <p className="text-sm text-gray-300">
          বাংলা ও English · online generative AI + basic offline tools
        </p>
      </div>

      {/* Main Avatar Section in Center */}
      <div className="transition-all duration-300">
        {avatarFormat === '2d' ? (
          <AvatarDisplay onNavigateToChat={() => onNavigate('AI Chat')} />
        ) : (
          <Avatar3D />
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>আপনি কী করতে চান?</span>
        </h2>

        <div className="grid gap-3">
          {features.map((item) => (
            <div
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="group p-4 bg-[#151d33] hover:bg-[#1c2744] border border-[#243257] hover:border-[#61e7f5]/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#0b1020] rounded-xl border border-[#243257] group-hover:border-[#61e7f5]/40 transition shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#61e7f5] transition truncate">
                      {item.title}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#243257] text-[#b59bff] font-medium shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#b59bff] group-hover:translate-x-1 group-hover:text-[#61e7f5] transition shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[#ffd58a]/10 border border-[#ffd58a]/30 text-[#ffd58a] text-xs flex items-start gap-2.5 leading-relaxed">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#ffd58a]" />
        <div>
          <span className="font-semibold">গুরুত্বপূর্ণ তথ্য:</span> ছবি/ভিডিও generation-এর জন্য backend provider access প্রয়োজন; 2D ও 3D avatar সংস্করণে পোশাক ও ভিউ ইন্টারঅ্যাক্টিভভাবে পরিবর্তনযোগ্য। অফলাইনে স্বয়ংক্রিয় রুল-বেসড লোকাল অ্যাসিস্ট্যান্ট কাজ করবে।
        </div>
      </div>
    </div>
  );
};
