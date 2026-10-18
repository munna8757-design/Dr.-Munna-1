import React, { useState } from 'react';
import { BackendConfig, HealthCheckResult } from '../types';
import { ApiClient } from '../services/apiClient';
import { ShieldCheck, Server, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BackendSettingsDialogProps {
  currentConfig: BackendConfig;
  isOpen: boolean;
  onDismiss: () => void;
  onSave: (config: BackendConfig) => void;
}

export const BackendSettingsDialog: React.FC<BackendSettingsDialogProps> = ({
  currentConfig,
  isOpen,
  onDismiss,
  onSave
}) => {
  const [url, setUrl] = useState(currentConfig.url);
  const [token, setToken] = useState(currentConfig.token);
  const [useBuiltinProxy, setUseBuiltinProxy] = useState(currentConfig.useBuiltinProxy);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [testResult, setTestResult] = useState<HealthCheckResult | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setChecking(true);
    setTestResult(null);
    setError('');

    // Temporarily save to test
    const tempConfig: BackendConfig = {
      url: url.trim(),
      token: token.trim(),
      useBuiltinProxy
    };
    ApiClient.saveSettings(tempConfig);

    const result = await ApiClient.checkHealth();
    setTestResult(result);
    setChecking(false);
  };

  const handleSave = () => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!useBuiltinProxy && trimmed.length > 0) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setError('একটি সঠিক HTTP/HTTPS URL প্রদান করুন (যেমন https://ai.example.com)');
          return;
        }
      } catch {
        setError('URL সঠিক ফরম্যাটে নেই (যেমন https://ai.example.com)');
        return;
      }
    }

    const newConfig: BackendConfig = {
      url: trimmed,
      token: token.trim(),
      useBuiltinProxy
    };
    onSave(newConfig);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151d33] border border-[#243257] rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Server className="w-6 h-6 text-[#61e7f5]" />
          <h2 className="text-xl font-bold text-white">AI Backend সেটিংস</h2>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          HTTPS backend URL এবং server-এর APP_API_TOKEN দিন। GOOGLE_API_KEY শুধু server-এ সুরক্ষিত থাকবে।
          আপনার prompt AI provider-এ পাঠানো হবে। খালি URL দিলে সীমিত offline demo চলবে।
        </p>

        {/* Built-in proxy option */}
        <div className="mb-4 p-3 bg-[#0b1020]/80 rounded-xl border border-cyan-500/30">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useBuiltinProxy}
              onChange={(e) => {
                setUseBuiltinProxy(e.target.checked);
                setTestResult(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-[#61e7f5]"
            />
            <div>
              <span className="text-sm font-medium text-cyan-300">
                বিল্ট-ইন Express Server Proxy ব্যবহার করুন (প্রস্তাবিত)
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                এটি সরাসরি অ্যাপ্লিকেশনের নিজস্ব <code className="text-cyan-200">/api</code> এন্ডপয়েন্ট ব্যবহার করে Gemini মডেলের সাথে নিরাপদ যোগাযোগ নিশ্চিত করে।
              </p>
            </div>
          </label>
        </div>

        {!useBuiltinProxy && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Backend HTTPS URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://your-server.example.com"
                className="w-full px-3 py-2 text-sm bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Backend Access Token (APP_API_TOKEN)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Bearer token string"
                className="w-full px-3 py-2 text-sm bg-[#0b1020] border border-[#243257] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#61e7f5]"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 mb-3 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs mb-3 ${
              testResult.ok
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {testResult.ok ? 'সার্ভার সক্রিয় ও প্রস্তুত!' : 'সার্ভার সংযোগে সতর্কতা'}
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              {testResult.ok
                ? `সার্ভিস: ${testResult.service || 'Ready'} | Chat: ${
                    testResult.chat_configured ? 'অনলাইন' : 'লোকাল ডেমো'
                  }`
                : `ত্রুটি: ${testResult.error || 'অপ্রত্যাশিত সমস্যা'}`}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#243257]">
          <button
            type="button"
            onClick={handleTest}
            disabled={checking}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30 transition disabled:opacity-50"
          >
            {checking ? 'টেস্ট হচ্ছে…' : 'সংযোগ পরীক্ষা করুন'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 text-xs font-medium rounded-xl text-gray-300 hover:bg-white/5 transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:opacity-95 shadow-md shadow-cyan-500/20 transition"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
