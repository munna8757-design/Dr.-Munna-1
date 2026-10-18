export type NavPage = 'Home' | 'AI Chat' | 'Learn' | 'Studio' | 'Tools';

export type AppLanguage = 'bn' | 'en' | 'hi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
}

export type OutfitType = 'sari' | 'threepiece' | 'casual' | 'professional' | 'doctor';

export type AvatarMode = 'human' | 'organs' | 'skeleton';

export type StudioKind = 'লেখা' | 'ছবি' | 'ভিডিও';

export interface BackendConfig {
  url: string;
  token: string;
  useBuiltinProxy: boolean;
}

export interface HealthCheckResult {
  ok: boolean;
  service?: string;
  chat_configured?: boolean;
  image_configured?: boolean;
  video_configured?: boolean;
  auth_configured?: boolean;
  error?: string;
}

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  detailedPoints?: string[];
}
