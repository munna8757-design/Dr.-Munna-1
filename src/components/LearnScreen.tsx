import React, { useState } from 'react';
import {
  Heart,
  Activity,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  Info,
  ChevronDown,
  Sparkles,
  Stethoscope
} from 'lucide-react';

interface TopicItem {
  id: string;
  title: string;
  summary: string;
  icon: React.ReactNode;
  category: string;
  details: string[];
  clinicalNote?: string;
}

export const LearnScreen: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>('anatomy');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const topics: TopicItem[] = [
    {
      id: 'anatomy',
      title: 'মানবদেহের অ্যানাটমি ও অঙ্গতন্ত্র',
      summary: 'মস্তিষ্ক, হৃদ্‌যন্ত্র, ফুসফুস, হাড়, পেশি ও প্রধান অঙ্গতন্ত্রের বৈজ্ঞানিক পরিচিতি।',
      icon: <Activity className="w-5 h-5 text-[#61e7f5]" />,
      category: 'অ্যানাটমি',
      details: [
        'মস্তিষ্ক ও স্নায়ুতন্ত্র: চিন্তাশক্তি, অনুভূতি এবং দেহের সমস্ত অঙ্গের কার্যক্রম সমন্বয় করে।',
        'সংবহনতন্ত্র (হৃৎপিণ্ড ও রক্তনালী): অক্সিজেন ও পুষ্টি উপাদান সারা শরীরে পৌঁছে দেয়।',
        'শ্বসনতন্ত্র (ফুসফুস ও শ্বাসনালী): বাতাস থেকে অক্সিজেন গ্রহণ ও কার্বন ডাই-অক্সাইড ত্যাগ করে।',
        'কঙ্কাল ও পেশিতন্ত্র: দেহকাঠামো গঠন, অভ্যন্তরীণ অঙ্গ রক্ষা ও চলাচলে সহায়তা করে।',
        'পরিপাকতন্ত্র: খাদ্য ভেঙে পুষ্টি শোষণ এবং বর্জ্য নিষ্কাশন করে।'
      ],
      clinicalNote:
        'শারীরিক সুস্থতার জন্য নিয়মিত ব্যায়াম, সুষম খাদ্য এবং পরিমিত পানি পান করা অঙ্গপ্রত্যঙ্গের কর্মক্ষমতা বজায় রাখতে অপরিহার্য।'
    },
    {
      id: 'reproduction',
      title: 'প্রজনন অঙ্গ ও জৈবিক প্রক্রিয়া',
      summary: 'প্রাপ্তবয়স্ক মানবদেহের বৈজ্ঞানিক গঠন, ডিম্বস্ফোটন, ঋতুচক্র, নিষেক ও গর্ভধারণ।',
      icon: <Heart className="w-5 h-5 text-[#b59bff]" />,
      category: 'প্রজনন স্বাস্থ্য',
      details: [
        'পুরুষ প্রজননতন্ত্র: শুক্রাণু ও টেস্টোস্টেরন হরমোন উৎপাদন এবং নিঃসরণ।',
        'নারী প্রজননতন্ত্র: ডিম্বাশয়, ফ্যালোপিয়ান টিউব, জরায়ু ও যোনিপথের সমন্বিত প্রাকৃতিক চক্র।',
        'ডিম্বস্ফোটন (Ovulation): প্রতি মাসে সাধারণত একটি পরিণত ডিম্বাণু নির্গত হয়।',
        'নিষেক ও গর্ভধারণ: শুক্রাণু ও ডিম্বাণুর মিলন জরায়ুর অভ্যন্তরীণ দেয়ালে রোপিত হয়ে ভ্রূণ তৈরি করে।'
      ],
      clinicalNote:
        'প্রজননতন্ত্রের স্বাস্থ্য রক্ষায় নিয়মিত পরিচ্ছন্নতা এবং যেকোনো জটিলতায় চিকিৎসকের শরণাপন্ন হওয়া জরুরি।'
    },
    {
      id: 'menstruation',
      title: 'ঋতুচক্র ও মাসিক স্বাস্থ্য ব্যবস্থাপনা',
      summary: 'চক্রের দৈর্ঘ্য ব্যক্তিভেদে ভিন্ন হতে পারে। অতিরিক্ত রক্তপাত, অজ্ঞান হওয়া বা তীব্র ব্যথায় চিকিৎসা নিন।',
      icon: <Calendar className="w-5 h-5 text-rose-400" />,
      category: 'প্রজনন স্বাস্থ্য',
      details: [
        'স্বাভাবিক চক্র: সাধারণত ২১ থেকে ৩৫ দিনের মধ্যে এবং রক্তস্রাব ৩ থেকে ৭ দিন স্থায়ী হয়।',
        'স্বাস্থ্যবিধি: প্রতি ৪-৬ ঘণ্টা পর পর পরিষ্কার প্যাড পরিবর্তন করা উচিত।',
        'লক্ষণ: মৃদু পেটব্যথা, ক্লান্তি স্বাভাবিক; তবে অতিরিক্ত রক্তপাত বা অসহ্য ব্যথা অবহেলা করবেন না।'
      ],
      clinicalNote:
        'অতিরিক্ত ব্যথা (Dysmenorrhea), অনিয়মিত চক্র বা অতিরিক্ত রক্তপাত থাকলে গাইনোকোলজিস্টের পরামর্শ নিন।'
    },
    {
      id: 'consent',
      title: 'সম্মতি ও নিরাপদ সম্পর্ক',
      summary: 'সম্মতি স্বেচ্ছায়, স্পষ্টভাবে এবং যেকোনো সময় প্রত্যাহারযোগ্য। চাপ, ভয় বা অক্ষমতার মধ্যে সম্মতি নয়।',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      category: 'সম্পর্ক ও সুরক্ষা',
      details: [
        'স্বেচ্ছাপ্রণোদিত (Freely Given): কোনো ধরনের জোরাজুরি বা ভীতি প্রদর্শন ছাড়াই পারস্পরিক ইচ্ছার প্রকাশ।',
        'প্রত্যাহারযোগ্য (Reversible): যেকোনো ব্যক্তি যেকোনো পর্যায়ে তার সিদ্ধান্ত পরিবর্তন বা প্রত্যাহার করতে পারেন।',
        'জ্ঞাতসারে (Informed): উভয় পক্ষের পূর্ণ মানসিক সুস্থতা এবং বিষয়টির স্পষ্ট উপলব্ধি থাকতে হবে।'
      ],
      clinicalNote:
        'পারস্পরিক সম্মান ও উন্মুক্ত যোগাযোগ যেকোনো সম্পর্কের মানসিক ও শারীরিক সুস্থতার মূল ভিত্তি।'
    },
    {
      id: 'contraception_sti',
      title: 'গর্ভনিরোধ ও যৌনবাহিত সংক্রমণ (STI)',
      summary: 'কনডম অনেক STI ঝুঁকি কমায়; অন্য গর্ভনিরোধক STI প্রতিরোধ করে না। সঠিক পরীক্ষা ও পরামর্শের জন্য স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      category: 'সুরক্ষা ও প্রতিরোধ',
      details: [
        'ব্যারিয়ার মেথড (যেমন কনডম): অনিচ্ছাকৃত গর্ভধারণ ও যৌনবাহিত সংক্রমণ (HIV, HPV, Syphilis ইত্যাদি) উভয় থেকেই সুরক্ষা দিতে সক্ষম।',
        'হরমোনাল মেথড (পিল, ইনজেকশন, ইমপ্লান্ট): গর্ভনিরোধে অত্যন্ত কার্যকর কিন্তু কোনো ধরনের STI সংক্রমণ প্রতিরোধ করে না।',
        'স্ক্রিনিং: সক্রিয় যৌনজীবনে নিয়মিত স্বাস্থ্য পরীক্ষা ও টিকা (যেমন HPV, Hepatitis B) নেওয়া উচিত।'
      ],
      clinicalNote:
        'কোনো লক্ষণ দেখা দিলে নিজে থেকে ওষুধ না খেয়ে দ্রুত যৌনরোগ বিশেষজ্ঞ বা চর্মরোগ বিশেষজ্ঞের পরামর্শ নিন।'
    },
    {
      id: 'hygiene_doctor',
      title: 'শারীরিক পরিচ্ছন্নতা ও কখন চিকিৎসক দেখাবেন',
      summary: 'নতুন গুটি/ঘা, অস্বাভাবিক স্রাব, জ্বর, তীব্র ব্যথা বা সংক্রমণের আশঙ্কায় যোগ্য স্বাস্থ্যসেবা নিন।',
      icon: <Stethoscope className="w-5 h-5 text-[#61e7f5]" />,
      category: 'সাধারণ স্বাস্থ্য',
      details: [
        'দৈনন্দিন পরিচ্ছন্নতা: মৃদু সাবান ও কুসুম গরম পানি দিয়ে শরীরের অঙ্গপ্রত্যঙ্গ পরিষ্কার রাখুন। কড়া সুগন্ধযুক্ত কেমিক্যাল এড়িয়ে চলুন।',
        'সতর্ক সংকেত: অস্বাভাবিক চুলকানি, দুর্গন্ধযুক্ত স্রাব, প্রস্রাবে জ্বালাপোড়া বা তলপেটে তীব্র ব্যথা।',
        'জরুরি চিকিৎসা: অতিরিক্ত রক্তপাত, উচ্চ তাপমাত্রা বা অজ্ঞান হওয়ার মতো অবস্থায় বিলম্ব না করে নিকটস্থ হাসপাতালে যান।'
      ],
      clinicalNote:
        'ইন্টারনেটের তথ্যের ওপর ভিত্তি করে আত্ম-চিকিৎসা বিপজ্জনক। সবসময় বিএমডিসি (BMDC) নিবন্ধিত চিকিৎসকের পরামর্শ গ্রহণ করুন।'
    }
  ];

  const categories = [
    { id: 'all', label: 'সব বিষয়' },
    { id: 'অ্যানাটমি', label: 'অ্যানাটমি' },
    { id: 'প্রজনন স্বাস্থ্য', label: 'প্রজনন স্বাস্থ্য' },
    { id: 'সুরক্ষা ও প্রতিরোধ', label: 'সুরক্ষা ও STI' },
    { id: 'সম্পর্ক ও সুরক্ষা', label: 'সম্মতি' },
    { id: 'সাধারণ স্বাস্থ্য', label: 'সাধারণ স্বাস্থ্য' }
  ];

  const filteredTopics =
    activeCategory === 'all'
      ? topics
      : topics.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#61e7f5]" />
          <span className="text-xs font-bold tracking-wider text-[#61e7f5] uppercase">
            EDUCATION CENTER
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Human Body & Health Education
        </h1>
        <p className="text-xs text-gray-300">
          বিজ্ঞানসম্মত ও নির্ভরযোগ্য সাধারণ শিক্ষা; কোনো অবস্থাতেই ব্যক্তিগত চিকিৎসা বা প্রেসক্রিপশনের বিকল্প নয়।
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition shrink-0 border ${
              activeCategory === c.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-400 font-semibold shadow-sm'
                : 'bg-[#151d33] text-gray-300 border-[#243257] hover:border-gray-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const isOpen = selectedTopic === topic.id;

          return (
            <div
              key={topic.id}
              className={`bg-[#151d33] border rounded-2xl transition-all duration-200 overflow-hidden shadow-lg ${
                isOpen ? 'border-[#61e7f5]/40 ring-1 ring-[#61e7f5]/20' : 'border-[#243257]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedTopic(isOpen ? null : topic.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-[#1c2744] transition"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#0b1020] border border-[#243257] shrink-0 mt-0.5">
                    {topic.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        {topic.title}
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#243257] text-[#b59bff]">
                        {topic.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                    isOpen ? 'rotate-180 text-[#61e7f5]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#243257]/60 space-y-3 bg-[#0f172a]/40 text-xs animate-fade-in">
                  <div className="space-y-1.5 pt-2">
                    <h3 className="font-semibold text-gray-200">মূল বৈজ্ঞানিক বিষয়সমূহ:</h3>
                    <ul className="space-y-1.5 text-gray-300">
                      {topic.details.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#61e7f5] mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {topic.clinicalNote && (
                    <div className="p-3 rounded-xl bg-[#243257]/50 border border-[#b59bff]/30 text-gray-200 flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#b59bff] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#b59bff]">চিকিৎসা নোট:</span>{' '}
                        <span>{topic.clinicalNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clinical Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-[#151d33] border border-[#243257] space-y-2">
        <div className="flex items-center gap-2 text-[#ffd58a] font-bold text-xs">
          <Stethoscope className="w-4 h-4" />
          <span>চিকিৎসা অস্বীকৃতি (Medical Disclaimer)</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Dr. Munna Assist AI-এর এই শিক্ষা বিভাগের সমস্ত বিষয়বস্তু কেবল সাধারণ জনসচেতনতা এবং বিজ্ঞানসম্মত শিক্ষার উদ্দেশ্যে তৈরি। এটি কোনো অবস্থাতেই রেজিস্টার্ড চিকিৎসকের রোগনির্ণয়, ব্যবস্থাপত্র বা বিকল্প পরামর্শ নয়। যেকোনো স্বাস্থ্য জটিলতায় অবিলম্বে নির্ভরযোগ্য স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
};
