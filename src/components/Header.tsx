import React from 'react';
import { Sparkles, Book, PenTool } from 'lucide-react';
import { ApiKeySettingsButton } from './ApiKeySettings';

interface HeaderProps {
  activeTab: 'analyzer' | 'dictionary' | 'writing';
  onNavigate: (tab: 'analyzer' | 'dictionary' | 'writing') => void;
  hasApiKey: boolean;
  onApiKeyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, hasApiKey, onApiKeyClick }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('analyzer')}
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">SmashEnglish</span>
          <span className="font-bold text-xl tracking-tight text-slate-800 md:hidden">SE</span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => onNavigate('analyzer')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'analyzer'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Sparkles className="w-4 h-4 hidden sm:block" />
              句法
            </button>
            <button
              onClick={() => onNavigate('dictionary')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'dictionary'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Book className="w-4 h-4 hidden sm:block" />
              词典
            </button>
            <button
              onClick={() => onNavigate('writing')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'writing'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <PenTool className="w-4 h-4 hidden sm:block" />
              写作
            </button>
          </nav>
        </div>

        {/* API Key Settings Button */}
        <ApiKeySettingsButton onClick={onApiKeyClick} hasApiKey={hasApiKey} />
      </div>
    </header>
  );
};
