import { BackendConfig, HealthCheckResult } from '../types';
import { AssistantLogic } from './assistantLogic';

const SETTINGS_KEY = 'dr_munna_settings';

export const ApiClient = {
  getSettings(): BackendConfig {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse backend settings', e);
    }
    return {
      url: '',
      token: '',
      useBuiltinProxy: true // Default to using built-in /api backend proxy
    };
  },

  saveSettings(config: BackendConfig) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
  },

  getBaseUrl(config: BackendConfig): string {
    if (config.url && config.url.trim()) {
      return config.url.trim().replace(/\/+$/, '');
    }
    return '/api';
  },

  getAuthHeaders(config: BackendConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (config.token && config.token.trim()) {
      headers['Authorization'] = `Bearer ${config.token.trim()}`;
    }
    return headers;
  },

  async checkHealth(): Promise<HealthCheckResult> {
    const config = this.getSettings();
    const base = this.getBaseUrl(config);
    try {
      const res = await fetch(`${base}/health`, {
        headers: this.getAuthHeaders(config),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) {
        return { ok: false, error: `Status ${res.status}: ${res.statusText}` };
      }
      return await res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Connection failed' };
    }
  },

  async askChat(prompt: string): Promise<string> {
    const config = this.getSettings();
    const base = this.getBaseUrl(config);

    // If using custom URL but none provided and built-in proxy disabled
    if (!config.useBuiltinProxy && !config.url.trim()) {
      return AssistantLogic.localReply(prompt);
    }

    try {
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: this.getAuthHeaders(config),
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.reply) {
          return errorData.reply;
        }
        // Fallback to local rule engine if server is unreachable
        return `${AssistantLogic.localReply(prompt)}\n\n(Server note: ${res.status} ${res.statusText})`;
      }

      const data = await res.json();
      return data.reply || 'উত্তর পাওয়া যায়নি। পুনরায় চেষ্টা করুন।';
    } catch (e: any) {
      console.warn('Backend chat request failed, falling back to local logic:', e);
      return AssistantLogic.localReply(prompt);
    }
  },

  async generateImage(prompt: string): Promise<{ reply: string; imageBase64?: string; mimeType?: string }> {
    const config = this.getSettings();
    const base = this.getBaseUrl(config);

    try {
      const res = await fetch(`${base}/image`, {
        method: 'POST',
        headers: this.getAuthHeaders(config),
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ reply: `Server error ${res.status}` }));
        return { reply: err.reply || `Image generation error (${res.status})` };
      }

      return await res.json();
    } catch (e: any) {
      return {
        reply: `ছবি তৈরির সার্ভারে সংযোগ করা যায়নি: ${e.message || 'Network error'}। ইন্টারনেট ও সেটিংস চেক করুন।`
      };
    }
  },

  async startVideo(prompt: string): Promise<{ ok?: boolean; operation?: string; status?: string; reply?: string }> {
    const config = this.getSettings();
    const base = this.getBaseUrl(config);

    try {
      const res = await fetch(`${base}/video`, {
        method: 'POST',
        headers: this.getAuthHeaders(config),
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ reply: `Video error ${res.status}` }));
        return { reply: err.reply || `Video generation error (${res.status})` };
      }

      return await res.json();
    } catch (e: any) {
      return { reply: `ভিডিও সার্ভারে সংযোগ ব্যর্থ: ${e.message || 'Network error'}` };
    }
  },

  async getVideoStatus(operation: string): Promise<{ ok?: boolean; done?: boolean; status?: string; videoUri?: string; reply?: string }> {
    const config = this.getSettings();
    const base = this.getBaseUrl(config);

    try {
      const res = await fetch(`${base}/video/status?operation=${encodeURIComponent(operation)}`, {
        headers: this.getAuthHeaders(config)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ reply: `Status check error ${res.status}` }));
        return { reply: err.reply || `Status error (${res.status})` };
      }
      return await res.json();
    } catch (e: any) {
      return { reply: `Status চেক করা সম্ভব হয়নি: ${e.message}` };
    }
  }
};
