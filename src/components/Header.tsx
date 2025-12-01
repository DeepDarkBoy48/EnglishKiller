import React from 'react';
import { Sparkles, Book, PenTool } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { ApiKeySettingsButton } from './ApiKeySettings';

interface HeaderProps {
  hasApiKey: boolean;
  onApiKeyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasApiKey, onApiKeyClick }) => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
      isActive
        ? 'bg-white text-pink-600 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">SmashEnglish</span>
          <span className="font-bold text-xl tracking-tight text-slate-800 md:hidden">SE</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <NavLink to="/analyzer" className={getLinkClass}>
              <Sparkles className="w-4 h-4 hidden sm:block" />
              句法
            </NavLink>
            <NavLink to="/dictionary" className={getLinkClass}>
              <Book className="w-4 h-4 hidden sm:block" />
              词典
            </NavLink>
            <NavLink to="/writing" className={getLinkClass}>
              <PenTool className="w-4 h-4 hidden sm:block" />
              写作
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center">
            {/* Articles Link */}
            <Link 
            to="/articles" 
            className="mr-2 md:mr-4 px-3 py-2 text-slate-600 hover:text-pink-600 font-medium transition-colors text-sm rounded-lg hover:bg-slate-50"
            >
            文章中心
            </Link>

            {/* API Key Settings Button */}
            <ApiKeySettingsButton onClick={onApiKeyClick} hasApiKey={hasApiKey} />
        </div>
      </div>
    </header>
  );
};
