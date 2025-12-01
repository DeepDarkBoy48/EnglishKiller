import React, { useState, useEffect } from 'react';
import { Key, X, AlertCircle, CheckCircle2, ExternalLink, Settings } from 'lucide-react';
import { getApiKey, setApiKey, clearApiKey } from '../services/geminiService';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: () => void;
}

export const ApiKeyModal: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose, onApiKeySet }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExistingKey, setIsExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      if (existingKey) {
        setInputKey(existingKey);
        setIsExistingKey(true);
      } else {
        setInputKey('');
        setIsExistingKey(false);
      }
      setError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    if (!trimmedKey) {
      setError('请输入 API Key');
      return;
    }
    if (!trimmedKey.startsWith('AIza')) {
      setError('API Key 格式不正确，应以 "AIza" 开头');
      return;
    }
    setApiKey(trimmedKey);
    onApiKeySet();
    onClose();
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setIsExistingKey(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Gemini API Key</h2>
                <p className="text-sm text-white/80">配置 AI 服务密钥</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p className="mb-2">
              本应用需要 Google Gemini API Key 才能使用 AI 功能。
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              获取免费 API Key <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setError(null);
              }}
              placeholder="AIza..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-sm"
            />
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {isExistingKey && !error && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                已保存 API Key
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">🔒 安全提示</p>
            <p>API Key 仅存储在您的浏览器本地 (localStorage)，不会发送到任何服务器。</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {isExistingKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              清除
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors text-sm font-medium shadow-lg shadow-violet-200"
          >
            保存并使用
          </button>
        </div>
      </div>
    </div>
  );
};

// 设置按钮组件 - 用于 Header
interface SettingsButtonProps {
  onClick: () => void;
  hasApiKey: boolean;
}

export const ApiKeySettingsButton: React.FC<SettingsButtonProps> = ({ onClick, hasApiKey }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
        ${hasApiKey
          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 animate-pulse'
        }
      `}
      title={hasApiKey ? '已配置 API Key' : '需要配置 API Key'}
    >
      {hasApiKey ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden sm:inline">API 已配置</span>
        </>
      ) : (
        <>
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">设置 API Key</span>
        </>
      )}
    </button>
  );
};
