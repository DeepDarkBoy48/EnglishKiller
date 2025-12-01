import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AiAssistant } from './AiAssistant';
import { ApiKeyModal } from './ApiKeySettings';
import { getApiKey } from '../services/geminiService';
import { Helmet } from 'react-helmet-async';
import { Key } from 'lucide-react';

export type AssistantContextType = {
  setAssistantContext: (content: string | null, type: 'sentence' | 'word' | 'writing') => void;
};

export const Layout: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [assistantContext, setAssistantContext] = useState<string | null>(null);
  const [contextType, setContextType] = useState<'sentence' | 'word' | 'writing'>('sentence');
  const location = useLocation();

  useEffect(() => {
    const key = getApiKey();
    setHasApiKey(!!key);
    if (!key) {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleApiKeySet = () => {
    setHasApiKey(true);
  };

  const updateAssistantContext = (content: string | null, type: 'sentence' | 'word' | 'writing') => {
    setAssistantContext(content);
    setContextType(type);
  };

  // Reset context on route change
  useEffect(() => {
      setAssistantContext(null);
  }, [location.pathname]);

  const getContainerMaxWidth = () => {
    if (location.pathname === '/writing') {
      return 'max-w-[98%] 2xl:max-w-[2400px]';
    }
    return 'max-w-5xl';
  };

  return (
    <>
       <Helmet>
        <title>SmashEnglish - AI 英语学习助手 | 句法分析 | 智能词典 | 写作润色</title>
        <meta name="description" content="SmashEnglish 是一款 AI 驱动的英语学习工具，提供智能句法分析、深度词典查询和写作润色功能，帮助您更高效地掌握英语。" />
        <meta name="keywords" content="英语学习, AI英语, 句法分析, 英语语法, 智能词典, 英语写作, 润色工具, 英语句子分析, 语法检查, AI写作助手" />
        <link rel="canonical" href="https://englishkiller.pages.dev/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://englishkiller.pages.dev/" />
        <meta property="og:title" content="SmashEnglish - AI 英语学习助手" />
        <meta property="og:description" content="AI 驱动的英语学习工具，一键分析句子结构，智能润色写作。" />
        <meta property="og:image" content="https://englishkiller.pages.dev/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://englishkiller.pages.dev/" />
        <meta property="twitter:title" content="SmashEnglish - AI 英语学习助手" />
        <meta property="twitter:description" content="AI 驱动的英语学习工具，一键分析句子结构，智能润色写作。" />
        <meta property="twitter:image" content="https://englishkiller.pages.dev/og-image.png" />
      </Helmet>

      <Header
        hasApiKey={hasApiKey}
        onApiKeyClick={() => setShowApiKeyModal(true)}
      />

      <div className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans">
        <main className={`flex-grow container mx-auto px-4 py-8 ${getContainerMaxWidth()} flex flex-col gap-8 relative transition-all duration-300 ease-in-out`}>
          {/* API Key Warning Banner */}
          {!hasApiKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-600" />
              <div className="flex-grow">
                <p className="text-amber-800 font-medium">需要配置 API Key</p>
                <p className="text-amber-600 text-sm">请先设置 Gemini API Key 才能使用 AI 功能</p>
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                立即设置
              </button>
            </div>
          )}

          <Outlet context={{ setAssistantContext: updateAssistantContext } satisfies AssistantContextType} />
        </main>

        <Footer />
      </div>

      {hasApiKey && (
        <AiAssistant
          currentContext={assistantContext}
          contextType={contextType}
        />
      )}

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onApiKeySet={handleApiKeySet}
      />
    </>
  );
};
