import React from 'react';
import { NavPage } from '../types';
import { Home, MessageSquare, GraduationCap, Sparkles, Wrench } from 'lucide-react';

interface NavigationBarProps {
  currentPage: NavPage;
  onPageChange: (page: NavPage) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage, onPageChange }) => {
  const items: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    { id: 'Home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'AI Chat', label: 'AI Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'Learn', label: 'Learn', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'Studio', label: 'Studio', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'Tools', label: 'Tools', icon: <Wrench className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#151d33]/95 backdrop-blur-lg border-t border-[#243257] shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-[#61e7f5] font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-[#61e7f5]/15 ring-1 ring-[#61e7f5]/40 scale-105' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'text-[#61e7f5]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
