import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Copy, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Loader2, Wand2, ArrowRight, X, Quote, MousePointerClick, Info, FileText, ArrowDown, ChevronDown, Split, BookOpen } from 'lucide-react';
import { WritingResult, WritingMode, WritingSegment, AnalysisResult, PageMode } from '../types';
import { evaluateWritingService, analyzeSentenceService } from '../services/geminiService';
import { ResultDisplay } from './ResultDisplay';

interface WritingPageProps {
    initialResult: WritingResult | null;
    onResultChange: (result: WritingResult | null) => void;
}

const MODES: { value: WritingMode; label: string; shortLabel: string }[] = [
    { value: 'fix', label: '基础纠错', shortLabel: '纠错' },
];

const PAGE_MODES: { value: PageMode; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { value: 'writing', label: '写作纠错', icon: PenTool, description: '智能纠正语法错误' },
    { value: 'reading', label: '文章精读', icon: BookOpen, description: '深度分析句法结构' },
];

type ViewMode = 'diff' | 'syntax';

export const WritingPage: React.FC<WritingPageProps> = ({ initialResult, onResultChange }) => {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode] = useState<WritingMode>('fix');
    const [result, setResult] = useState<WritingResult | null>(initialResult);

    const [pageMode, setPageMode] = useState<PageMode>('writing');
    const [isPageModeDropdownOpen, setIsPageModeDropdownOpen] = useState(false);
    const pageModeDropdownRef = useRef<HTMLDivElement>(null);

    const [readingModeActive, setReadingModeActive] = useState(false);
    const [readingText, setReadingText] = useState("");

    const [viewMode, setViewMode] = useState<ViewMode>('diff');
    const [showOriginal, setShowOriginal] = useState(false);

    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

    const [activeSentence, setActiveSentence] = useState<string | null>(null);
    const [syntaxResult, setSyntaxResult] = useState<AnalysisResult | null>(null);
    const [isSyntaxLoading, setIsSyntaxLoading] = useState(false);
    const [syntaxCache, setSyntaxCache] = useState<Record<string, AnalysisResult>>({});

    useEffect(() => {
        setActiveSegmentIndex(null);
        setActiveSentence(null);
        setSyntaxResult(null);
        setSyntaxCache({});
        setViewMode('diff');
    }, [result]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pageModeDropdownRef.current && !pageModeDropdownRef.current.contains(event.target as Node)) {
                setIsPageModeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAnalyze = async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setShowOriginal(false);

        try {
            const data = await evaluateWritingService(inputText, mode);
            setResult(data);
            onResultChange(data);
        } catch (err: any) {
            setError(err.message || "分析失败，请稍后再试。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyntaxAnalyze = async (sentence: string) => {
        if (sentence === activeSentence && syntaxResult) return;
        if (isSyntaxLoading) return;

        setActiveSentence(sentence);

        if (syntaxCache[sentence]) {
            setSyntaxResult(syntaxCache[sentence]);
            return;
        }

        setSyntaxResult(null);
        setIsSyntaxLoading(true);

        try {
            const data = await analyzeSentenceService(sentence);
            setSyntaxResult(data);
            setSyntaxCache(prev => ({ ...prev, [sentence]: data }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSyntaxLoading(false);
        }
    };

    const copyFullText = () => {
        if (!result) return;
        const fullText = result.segments.map(s => s.text).join('');
        navigator.clipboard.writeText(fullText);
    };

    const handleReset = () => {
        setResult(null);
        onResultChange(null);
        setActiveSegmentIndex(null);
        setShowOriginal(false);
        setViewMode('diff');
        setSyntaxResult(null);
        setActiveSentence(null);
        setReadingModeActive(false);
        setReadingText("");
        setSyntaxCache({});
    };

    const handleStartReading = () => {
        if (!inputText.trim()) return;
        setReadingText(inputText);
        setReadingModeActive(true);
        setSyntaxCache({});
        setActiveSentence(null);
        setSyntaxResult(null);
    };

    const handlePageModeChange = (newMode: PageMode) => {
        if (newMode === pageMode) {
            setIsPageModeDropdownOpen(false);
            return;
        }
        handleReset();
        setPageMode(newMode);
        setIsPageModeDropdownOpen(false);
    };

    const isIeltsMode = (_m: WritingMode) => false;
    const isDiffView = viewMode === 'diff';

    return (
        <div className="w-full h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] flex flex-col gap-4 animate-fade-in font-sans">
            <div className="flex flex-col items-center shrink-0 gap-6 mb-2">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif flex items-center justify-center gap-2">
                        {pageMode === 'writing' ? (
                            <PenTool className="w-6 h-6 text-pink-500" />
                        ) : (
                            <BookOpen className="w-6 h-6 text-amber-500" />
                        )}
                        {pageMode === 'writing' ? 'AI 写作润色' : 'AI 文章精读'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        {PAGE_MODES.find(m => m.value === pageMode)?.description}
                    </p>
                </div>

                <div className="relative" ref={pageModeDropdownRef}>
                    <button
                        onClick={() => setIsPageModeDropdownOpen(!isPageModeDropdownOpen)}
                        className={`
                            flex items-center gap-2 pl-4 pr-3 py-2.5
                            rounded-xl text-sm font-bold
                            border shadow-sm transition-all
                            ${pageMode === 'writing'
                                ? 'bg-green-50 text-green-900 border-green-100 hover:bg-green-100'
                                : 'bg-amber-50 text-amber-900 border-amber-100 hover:bg-amber-100'
                            }
                        `}
                    >
                        {pageMode === 'writing' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                            <BookOpen className="w-4 h-4 text-amber-600" />
                        )}
                        {PAGE_MODES.find(m => m.value === pageMode)?.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isPageModeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPageModeDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                            {PAGE_MODES.map((m) => {
                                const Icon = m.icon;
                                const isActive = pageMode === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        onClick={() => handlePageModeChange(m.value)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors
                                            ${isActive
                                                ? (m.value === 'writing' ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900')
                                                : 'hover:bg-slate-50 text-slate-700'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? (m.value === 'writing' ? 'text-green-600' : 'text-amber-600') : 'text-slate-400'}`} />
                                        <div>
                                            <div className="font-bold">{m.label}</div>
                                            <div className="text-xs text-slate-400">{m.description}</div>
                                        </div>
                                        {isActive && (
                                            <CheckCircle2 className={`w-4 h-4 ml-auto ${m.value === 'writing' ? 'text-green-500' : 'text-amber-500'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 shrink-0 self-center">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="flex-grow flex flex-col overflow-hidden relative min-h-0">
                {pageMode === 'writing' && (
                    <div className={`flex flex-col gap-3 transition-all duration-500 h-full ${result ? 'hidden' : 'w-full mx-auto max-w-4xl'}`}>
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">原文输入</label>
                            <span className="text-xs text-slate-300">{inputText.length} 字符</span>
                        </div>
                        <div className="flex-grow relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="请在此粘贴或输入英语文章/段落..."
                                className="w-full h-full p-6 rounded-2xl border border-slate-200 bg-white text-slate-700 text-lg leading-relaxed resize-none focus:ring-4 focus:ring-pink-50 focus:border-pink-300 outline-none shadow-sm placeholder:text-slate-300 font-serif whitespace-pre-wrap"
                                disabled={isLoading}
                            />
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!inputText.trim() || isLoading}
                                    className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white
                                        ${isIeltsMode(mode) ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
                                    `}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isIeltsMode(mode) ? <Wand2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />)}
                                    <span>{isIeltsMode(mode) ? '开始升格' : '开始纠错'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {pageMode === 'reading' && !readingModeActive && (
                    <div className="flex flex-col gap-3 transition-all duration-500 h-full w-full mx-auto max-w-4xl">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-amber-600 uppercase tracking-wider">文章输入</label>
                            <span className="text-xs text-slate-300">{inputText.length} 字符</span>
                        </div>
                        <div className="flex-grow relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="请在此粘贴或输入要精读的英语文章..."
                                className="w-full h-full p-6 rounded-2xl border border-amber-100 bg-white text-slate-700 text-lg leading-relaxed resize-none focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none shadow-sm placeholder:text-slate-300 font-serif whitespace-pre-wrap"
                            />
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleStartReading}
                                    disabled={!inputText.trim()}
                                    className="px-6 py-3 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    <span>开始精读</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="w-full h-full flex flex-col gap-4 animate-slide-in-right min-h-0 w-full">
                        <div className="flex justify-between items-center px-1 shrink-0">
                            <div className="flex items-center gap-3">
                                <label className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isIeltsMode(result.mode) ? 'text-indigo-600' : 'text-green-600'}`}>
                                    {isIeltsMode(result.mode) ? <Wand2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {MODES.find(m => m.value === result.mode)?.label || '结果'}
                                </label>
                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {result.segments.filter(s => s.type === 'change').length} 处修改
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {isDiffView && (
                                    <button
                                        onClick={() => setShowOriginal(!showOriginal)}
                                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-medium border shadow-sm ${showOriginal ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {showOriginal ? '返回修订' : '查看原文'}
                                    </button>
                                )}
                                <button
                                    onClick={copyFullText}
                                    className="text-xs flex items-center gap-1 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    <Copy className="w-3.5 h-3.5" /> 复制全文
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 px-2 py-1 transition-colors"
                                >
                                    <X className="w-4 h-4" /> 重写
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className={`flex flex-col bg-white rounded-3xl border overflow-hidden shadow-xl shadow-slate-200/40 h-full ${isIeltsMode(result.mode) ? 'border-indigo-100/80' : 'border-green-100/80'}`}>
                                <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between text-xs md:text-sm text-slate-500 shrink-0 gap-2">
                                    <div className="flex p-1 bg-slate-200/60 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('diff')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'diff' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Split className="w-3 h-3" />
                                            改写对比 (Diff)
                                        </button>
                                        <button
                                            onClick={() => setViewMode('syntax')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'syntax' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            句法分析
                                        </button>
                                    </div>

                                    {viewMode === 'diff' && !showOriginal && (
                                        <div className="flex items-center gap-4 ml-auto">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50"></span>
                                                <span className="line-through opacity-70">原文</span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 opacity-30" />
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isIeltsMode(result.mode) ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
                                                <span className={`font-bold ${isIeltsMode(result.mode) ? 'text-indigo-700' : 'text-green-700'}`}>
                                                    修改后
                                                </span>
                                            </div>
                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MousePointerClick className="w-3 h-3" />
                                                <span className="text-[10px]">点击详情</span>
                                            </div>
                                        </div>
                                    )}
                                    {viewMode === 'syntax' && (
                                        <div className="flex items-center gap-2 ml-auto text-pink-500/70 text-xs">
                                            <MousePointerClick className="w-3 h-3" />
                                            点击任意句子查看句法结构
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-grow">
                                    <div className="font-serif text-lg md:text-xl leading-loose text-slate-800 whitespace-pre-wrap">
                                        {viewMode === 'diff' ? (
                                            showOriginal ? (
                                                inputText
                                            ) : (
                                                result.segments.map((segment, idx) => (
                                                    <UnifiedSegmentRenderer
                                                        key={idx}
                                                        segment={segment}
                                                        mode={result.mode}
                                                        isActive={activeSegmentIndex === idx}
                                                        onClick={() => {
                                                            if (segment.type === 'change') {
                                                                setActiveSegmentIndex(idx);
                                                            }
                                                        }}
                                                    />
                                                ))
                                            )
                                        ) : (
                                            <SyntaxModeTextRenderer
                                                fullText={result.segments.map(s => s.text).join('')}
                                                activeSentence={activeSentence}
                                                onSentenceClick={handleSyntaxAnalyze}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col h-full min-h-0">
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 h-full overflow-hidden flex flex-col relative">
                                    <div className={`px-5 py-4 border-b shrink-0 flex items-center gap-2 ${viewMode === 'syntax' ? 'bg-pink-50/50 border-pink-100' : (isIeltsMode(result.mode) ? 'bg-indigo-50/50 border-indigo-100' : 'bg-green-50/50 border-green-100')}`}>
                                        {viewMode === 'syntax' ? (
                                            <>
                                                <div className="p-1 rounded-md bg-pink-100 text-pink-600">
                                                    <Split className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-bold text-sm text-pink-900">句法分析</h3>
                                            </>
                                        ) : (
                                            activeSegmentIndex !== null ? (
                                                <>
                                                    <div className={`p-1 rounded-md ${isIeltsMode(result.mode) ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <h3 className={`font-bold text-sm ${isIeltsMode(result.mode) ? 'text-indigo-900' : 'text-green-900'}`}>修改详情</h3>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={`p-1 rounded-md ${isIeltsMode(result.mode) ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                        <Lightbulb className="w-4 h-4" />
                                                    </div>
                                                    <h3 className={`font-bold text-sm ${isIeltsMode(result.mode) ? 'text-indigo-900' : 'text-green-900'}`}>AI 点评</h3>
                                                </>
                                            )
                                        )}
                                    </div>

                                    <div className="overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30 relative">
                                        {viewMode === 'syntax' ? (
                                            <div className="p-0 h-full">
                                                {isSyntaxLoading ? (
                                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                                                        <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                                                        <p className="text-sm">正在解析句子结构...</p>
                                                    </div>
                                                ) : syntaxResult ? (
                                                    <ResultDisplay result={syntaxResult} compact={true} />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                                                        <MousePointerClick className="w-12 h-12 text-slate-300 mb-3" />
                                                        <p className="text-slate-500 text-sm">请点击左侧文章中的<br />任意句子进行分析</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-5">
                                                {activeSegmentIndex !== null ? (
                                                    <DetailContent
                                                        segment={result.segments[activeSegmentIndex]}
                                                        mode={result.mode}
                                                    />
                                                ) : (
                                                    <GeneralFeedbackContent
                                                        feedback={result.generalFeedback}
                                                        mode={result.mode}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {viewMode === 'diff' && activeSegmentIndex === null && (
                                        <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                                            点击左侧 <span className={`${isIeltsMode(result.mode) ? 'text-indigo-500' : 'text-green-500'} font-bold`}>高亮区域</span> 查看具体修改原因
                                        </div>
                                    )}
                                    {viewMode === 'diff' && activeSegmentIndex !== null && (
                                        <button
                                            onClick={() => setActiveSegmentIndex(null)}
                                            className="p-3 text-center text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 transition-colors font-medium"
                                        >
                                            返回整体点评
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {pageMode === 'reading' && readingModeActive && (
                    <div className="w-full h-full flex flex-col gap-4 animate-slide-in-right min-h-0">
                        <div className="flex justify-between items-center px-1 shrink-0">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-amber-600">
                                    <BookOpen className="w-4 h-4" />
                                    文章精读
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReset}
                                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 px-2 py-1 transition-colors"
                                >
                                    <X className="w-4 h-4" /> 重新选择
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex flex-col bg-white rounded-3xl border border-amber-100/80 overflow-hidden shadow-xl shadow-amber-100/30 h-full">
                                <div className="bg-amber-50/50 border-b border-amber-100 px-6 py-3 flex flex-wrap items-center justify-between text-xs md:text-sm text-slate-500 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 text-amber-700 font-bold">
                                        <FileText className="w-4 h-4" />
                                        原文阅读
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-500/70 text-xs">
                                        <MousePointerClick className="w-3 h-3" />
                                        点击任意句子查看句法结构
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-grow">
                                    <div className="font-serif text-lg md:text-xl leading-loose text-slate-800 whitespace-pre-wrap">
                                        <SyntaxModeTextRenderer
                                            fullText={readingText}
                                            activeSentence={activeSentence}
                                            onSentenceClick={handleSyntaxAnalyze}
                                            themeColor="amber"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col h-full min-h-0">
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 h-full overflow-hidden flex flex-col relative">
                                    <div className="px-5 py-4 border-b shrink-0 flex items-center gap-2 bg-amber-50/50 border-amber-100">
                                        <div className="p-1 rounded-md bg-amber-100 text-amber-600">
                                            <Split className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-amber-900">句法分析</h3>
                                    </div>

                                    <div className="overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30 relative">
                                        <div className="p-0 h-full">
                                            {isSyntaxLoading ? (
                                                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                                    <p className="text-sm">正在解析句子结构...</p>
                                                </div>
                                            ) : syntaxResult ? (
                                                <ResultDisplay result={syntaxResult} compact={true} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                                                    <MousePointerClick className="w-12 h-12 text-slate-300 mb-3" />
                                                    <p className="text-slate-500 text-sm">请点击左侧文章中的<br />任意句子进行分析</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

const SyntaxModeTextRenderer: React.FC<{
    fullText: string;
    activeSentence: string | null;
    onSentenceClick: (s: string) => void;
    themeColor?: 'pink' | 'amber';
}> = ({ fullText, activeSentence, onSentenceClick, themeColor = 'pink' }) => {
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'sentence' });
    const sentences = Array.from(segmenter.segment(fullText)) as { segment: string }[];

    const themeClasses = themeColor === 'amber'
        ? {
            active: 'bg-amber-100 text-amber-900 ring-2 ring-amber-200 shadow-sm font-medium',
            hover: 'hover:bg-amber-50 hover:text-amber-700 text-slate-600'
        }
        : {
            active: 'bg-pink-100 text-pink-900 ring-2 ring-pink-200 shadow-sm font-medium',
            hover: 'hover:bg-pink-50 hover:text-pink-700 text-slate-600'
        };

    return (
        <>
            {sentences.map((seg, idx) => {
                const text = seg.segment;
                const isWhitespace = /^\s+$/.test(text);

                if (isWhitespace) return <span key={idx}>{text}</span>;

                const isActive = activeSentence === text;

                return (
                    <span
                        key={idx}
                        onClick={() => onSentenceClick(text)}
                        className={`
                            transition-all duration-200 cursor-pointer rounded px-1 decoration-clone
                            ${isActive ? themeClasses.active : themeClasses.hover}
                        `}
                    >
                        {text}
                    </span>
                );
            })}
        </>
    );
};

const UnifiedSegmentRenderer: React.FC<{
    segment: WritingSegment;
    mode: WritingMode;
    isActive: boolean;
    onClick: () => void;
}> = ({ segment, mode, isActive, onClick }) => {

    if (segment.type === 'unchanged') {
        return <span>{segment.text}</span>;
    }

    const isIelts = mode.startsWith('ielts');

    const themeClasses = isIelts
        ? {
            bg: isActive ? 'bg-indigo-600 shadow-md shadow-indigo-200 scale-105' : 'bg-indigo-50',
            border: isActive ? 'border-indigo-600' : 'border-indigo-100',
            text: isActive ? 'text-white' : 'text-indigo-900',
            hover: !isActive ? 'hover:bg-indigo-100 hover:border-indigo-300' : '',
            original: isActive ? 'text-indigo-200 decoration-indigo-300' : 'text-slate-500 decoration-slate-400/50',
            arrow: isActive ? 'text-indigo-300' : 'text-indigo-300'
        }
        : {
            bg: isActive ? 'bg-green-600 shadow-md shadow-green-200 scale-105' : 'bg-green-50',
            border: isActive ? 'border-green-600' : 'border-green-100',
            text: isActive ? 'text-white' : 'text-green-900',
            hover: !isActive ? 'hover:bg-green-100 hover:border-green-300' : '',
            original: isActive ? 'text-green-200 decoration-green-300' : 'text-slate-500 decoration-slate-400/50',
            arrow: isActive ? 'text-green-300' : 'text-green-300'
        };

    return (
        <span
            className={`
                relative inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer align-middle mx-0.5 my-1 select-none
                ${themeClasses.bg} ${themeClasses.border} ${themeClasses.text} ${themeClasses.hover}
            `}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {segment.original && (
                <span className={`line-through decoration-2 text-[0.9em] transition-colors ${themeClasses.original}`}>
                    {segment.original}
                </span>
            )}

            {segment.original && segment.text && (
                <ArrowRight className={`w-3.5 h-3.5 ${themeClasses.arrow}`} />
            )}

            {segment.text && (
                <span className="font-bold">
                    {segment.text}
                </span>
            )}
        </span>
    );
};

const GeneralFeedbackContent: React.FC<{ feedback: string; mode: WritingMode }> = ({ feedback, mode }) => {
    const isIelts = mode.startsWith('ielts');
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <Quote className={`w-8 h-8 mb-3 opacity-20 ${isIelts ? 'text-indigo-600' : 'text-green-600'}`} />
                <p className="text-slate-700 leading-relaxed text-base font-medium">
                    {feedback}
                </p>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">使用指南</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isIelts ? 'bg-indigo-400' : 'bg-green-400'}`}></div>
                        <span>点击左侧文中的彩色区域，查看详细的修改建议和原因。</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-slate-300"></div>
                        <span>右上角按钮可以一键复制修改后的全文。</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const DetailContent: React.FC<{ segment: WritingSegment; mode: WritingMode }> = ({ segment, mode }) => {
    const isIelts = mode.startsWith('ielts');
    const themeColors = isIelts ? {
        text: 'text-indigo-700',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        tagBg: 'bg-indigo-100',
        tagText: 'text-indigo-600',
        originalBorder: 'border-indigo-300'
    } : {
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-100',
        tagBg: 'bg-green-100',
        tagText: 'text-green-600',
        originalBorder: 'border-blue-300'
    };

    return (
        <div className="flex flex-col items-center space-y-4 animate-in slide-in-from-right-4 duration-300 py-4">
            <div className="w-full flex flex-col items-start">
                <span className="text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">原文</span>
                <div className={`relative w-full p-4 rounded-2xl border-2 bg-white text-center shadow-sm ${themeColors.originalBorder} border-opacity-60`}>
                    <p className="text-slate-500 line-through decoration-red-300 decoration-2 font-serif text-lg break-words">
                        {segment.original || <span className="italic opacity-30 text-sm">None</span>}
                    </p>
                </div>
            </div>

            <div className="text-slate-300 animate-bounce-slow">
                <ArrowDown className="w-6 h-6" />
            </div>

            <div className="w-full flex flex-col items-start">
                <span className={`text-xs font-bold mb-1.5 ml-1 uppercase tracking-wide ${themeColors.tagText}`}>修改后</span>
                <div className={`w-full p-4 rounded-2xl border-2 bg-white text-center shadow-sm ${themeColors.text} ${themeColors.border} bg-opacity-30`}>
                    <p className="font-serif text-xl font-bold break-words">
                        {segment.text}
                    </p>
                </div>
            </div>

            <div className="py-2">
                <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${themeColors.tagBg} ${themeColors.tagText} tracking-wider shadow-sm`}>
                    {segment.category || 'SUGGESTION'}
                </span>
            </div>

            <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mt-2">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase">修改原因</span>
                </div>
                <div className="p-4">
                    <p className="text-slate-600 text-sm leading-relaxed text-justify">
                        {segment.reason || "AI 建议优化表达以更符合语境。"}
                    </p>
                </div>
            </div>
        </div>
    );
};
