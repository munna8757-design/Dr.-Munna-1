import React, { useState } from 'react';
import { NavPage, BackendConfig } from './types';
import { ApiClient } from './services/apiClient';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { LearnScreen } from './components/LearnScreen';
import { StudioScreen } from './components/StudioScreen';
import { ToolsScreen } from './components/ToolsScreen';
import { NavigationBar } from './components/NavigationBar';
import { BackendSettingsDialog } from './components/BackendSettingsDialog';
import { ApkInstallDialog } from './components/ApkInstallDialog';
import { Settings, Sparkles, Mic, Bot, Smartphone } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('Home');
  const [showSettings, setShowSettings] = useState(false);
  const [showApkDialog, setShowApkDialog] = useState(false);
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(() =>
    ApiClient.getSettings()
  );

  const handleSaveSettings = (newConfig: BackendConfig) => {
    setBackendConfig(newConfig);
    ApiClient.saveSettings(newConfig);
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex flex-col font-sans selection:bg-[#61e7f5] selection:text-black relative">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-[#151d33]/95 backdrop-blur-md border-b border-[#243257] px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setCurrentPage('Home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-black font-extrabold shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#61e7f5] transition">
                  Dr. Munna Assist AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400 leading-none">
                বাংলা ও English ভার্চুয়াল সহকারী
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* APK / Install App Button */}
            <button
              onClick={() => setShowApkDialog(true)}
              title="Android APK ও অ্যাপ ইনস্টল"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK ইনস্টল</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              title="Backend সেটিংস"
              className="p-2 rounded-xl text-[#61e7f5] hover:text-white hover:bg-[#1c2744] border border-[#243257] transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-5">
        {currentPage === 'Home' && <HomeScreen onNavigate={setCurrentPage} />}
        {currentPage === 'AI Chat' && <ChatScreen config={backendConfig} />}
        {currentPage === 'Learn' && <LearnScreen />}
        {currentPage === 'Studio' && <StudioScreen config={backendConfig} />}
        {currentPage === 'Tools' && <ToolsScreen />}
      </main>

      {/* Floating Assistant Widget (ভাসমান ডট অবতার ও ভয়েস বাটন) */}
      {currentPage !== 'AI Chat' && (
        <button
          onClick={() => setCurrentPage('AI Chat')}
          title="Dr. Munna Voice Assistant খুলুন"
          className="fixed bottom-20 right-4 z-40 p-3 rounded-full bg-gradient-to-tr from-[#61e7f5] via-blue-600 to-purple-600 text-black shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-2 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-black" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping" />
          </div>
          <Mic className="w-4 h-4 text-black" />
          <span className="hidden sm:inline text-xs font-bold pr-1 text-black">
            ভয়েস সহকারী
          </span>
        </button>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <NavigationBar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Backend Settings Dialog */}
      <BackendSettingsDialog
        isOpen={showSettings}
        currentConfig={backendConfig}
        onDismiss={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />

      {/* Android APK & Install Dialog */}
      <ApkInstallDialog
        isOpen={showApkDialog}
        onClose={() => setShowApkDialog(false)}
      />
    </div>
  );
};

export default App;
