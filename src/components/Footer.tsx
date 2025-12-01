import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto">
      <p>© {new Date().getFullYear()} SmashEnglish - AI 英语学习助手</p>
      <div className="mt-2 space-x-4">
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">隐私政策</Link>
        <Link to="/terms" className="hover:text-slate-600 transition-colors">服务条款</Link>
      </div>
    </footer>
  );
};
