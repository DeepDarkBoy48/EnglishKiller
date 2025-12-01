import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { InputArea } from '../components/InputArea';
import { ResultDisplay } from '../components/ResultDisplay';
import { DictionaryPage } from '../components/DictionaryPage';
import { WritingPage } from '../components/WritingPage';
import { AiAssistant } from '../components/AiAssistant';
import { ApiKeyModal } from '../components/ApiKeySettings';
import { analyzeSentenceService, getApiKey } from '../services/geminiService';
import { AnalysisResult, DictionaryResult, WritingResult } from '../types';
import { Sparkles, BookOpen, AlertCircle, Key } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// 预加载的示例分析结果
const DEMO_RESULT: AnalysisResult = {
  englishSentence: "Regular exercise can improve confidence.",
  chineseTranslation: "规律的运动可以提升自信。",
  sentencePattern: "S + V + O (主谓宾)",
  mainTense: "Present Simple (一般现在时)",
  chunks: [
    { text: "Regular exercise", grammarDescription: "名词短语", partOfSpeech: "名词短语", role: "主语" },
    { text: "can improve", grammarDescription: "情态动词短语", partOfSpeech: "情态动词短语", role: "谓语" },
    { text: "confidence.", grammarDescription: "名词", partOfSpeech: "名词", role: "宾语" }
  ],
  detailedTokens: [
    { text: "Regular", partOfSpeech: "ADJECTIVE", role: "定语", meaning: "规律的，经常的", explanation: "形容词，修饰名词 'exercise'，表示规律的、经常性的。" },
    { text: "exercise", partOfSpeech: "NOUN", role: "主语", meaning: "运动，锻炼", explanation: "名词，意为运动、锻炼。在此句中作主语。" },
    { text: "can", partOfSpeech: "MODAL VERB", role: "情态动词", meaning: "能，可以", explanation: "情态动词，表示能力或可能性，后面接动词原形。" },
    { text: "improve", partOfSpeech: "VERB", role: "谓语动词", meaning: "改善，提高", explanation: "动词原形，意为改善、提高。与 'can' 共同构成谓语动词短语。" },
    { text: "confidence", partOfSpeech: "NOUN", role: "宾语", meaning: "自信，信心", explanation: "名词，意为自信、信心。作动词 'improve' 的宾语。" }
  ]
};

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'dictionary' | 'writing'>('analyzer');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Analyzer State
  const [isAnalyzerLoading, setIsAnalyzerLoading] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<AnalysisResult | null>(DEMO_RESULT);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Dictionary State
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);

  // Writing State
  const [writingResult, setWritingResult] = useState<WritingResult | null>(null);

  // Check for API Key on mount
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

  const handleAnalyze = async (sentence: string) => {
    if (!sentence.trim() || isAnalyzerLoading) return;

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsAnalyzerLoading(true);
    setAnalyzerError(null);
    setAnalyzerResult(null);

    try {
      const data = await analyzeSentenceService(sentence);
      setAnalyzerResult(data);
    } catch (err: any) {
      console.error(err);
      setAnalyzerError(err.message || "分析失败，请稍后再试。");
    } finally {
      setIsAnalyzerLoading(false);
    }
  };

  // Determine AI Assistant Context
  let assistantContextContent: string | null = null;
  let contextType: 'sentence' | 'word' | 'writing' = 'sentence';

  if (activeTab === 'analyzer') {
    assistantContextContent = analyzerResult?.englishSentence || null;
    contextType = 'sentence';
  } else if (activeTab === 'dictionary') {
    assistantContextContent = dictionaryResult?.word || null;
    contextType = 'word';
  } else {
    assistantContextContent = writingResult?.segments.map(s => s.text).join('') || null;
    contextType = 'writing';
  }

  // Dynamic container width based on active tab
  const getContainerMaxWidth = () => {
    if (activeTab === 'writing') {
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

        {/* Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "SmashEnglish",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "AI 驱动的英语学习工具，提供智能句法分析、深度词典查询和写作润色功能。"
            }
          `}
        </script>
      </Helmet>

      <Header
        activeTab={activeTab}
        onNavigate={setActiveTab}
        hasApiKey={hasApiKey}
        onApiKeyClick={() => setShowApiKeyModal(true)}
      />

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

        {activeTab === 'analyzer' && (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-4">
              <div className="inline-flex items-center justify-center p-2 bg-pink-50 rounded-full text-pink-600 mb-2">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">AI 驱动的英语语法分析</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 font-serif">
                英语句子成分可视化
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                输入任何英语句子，立刻解析其主谓宾定状补结构。
                <br className="hidden md:block" />适合英语学习者、教师及语言爱好者。
              </p>
            </div>

            {/* Input Section */}
            <div className="w-full max-w-2xl mx-auto">
              <InputArea onAnalyze={handleAnalyze} isLoading={isAnalyzerLoading} initialValue={DEMO_RESULT.englishSentence} />
            </div>

            {/* Results Section */}
            <div className="w-full">
              {isAnalyzerLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                  <p className="text-slate-500 animate-pulse">正在分析句子结构...</p>
                </div>
              )}

              {analyzerError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 max-w-2xl mx-auto">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">分析出错</h3>
                    <p className="text-sm mt-1 opacity-90">{analyzerError}</p>
                  </div>
                </div>
              )}

              {analyzerResult && !isAnalyzerLoading && (
                <div className="animate-fade-in">
                  <ResultDisplay result={analyzerResult} />
                </div>
              )}

              {!analyzerResult && !isAnalyzerLoading && !analyzerError && (
                <div className="text-center py-12 opacity-40 flex flex-col items-center">
                  <BookOpen className="w-16 h-16 mb-4 text-slate-300" />
                  <p>暂无分析结果，请在上方输入句子。</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'dictionary' && (
          <DictionaryPage
            initialResult={dictionaryResult}
            onResultChange={setDictionaryResult}
          />
        )}

        {activeTab === 'writing' && (
          <WritingPage
            initialResult={writingResult}
            onResultChange={setWritingResult}
          />
        )}
      </main>

      {/* Floating AI Assistant */}
      {hasApiKey && (
        <AiAssistant
          currentContext={assistantContextContent}
          contextType={contextType}
        />
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onApiKeySet={handleApiKeySet}
      />
    </>
  );
};
