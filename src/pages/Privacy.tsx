import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';

export const Privacy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>隐私政策 - SmashEnglish</title>
        <meta name="description" content="SmashEnglish 的隐私政策。了解我们如何收集、使用和保护您的个人信息。" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header hasApiKey={false} onApiKeyClick={() => {}} />

      <main className="container mx-auto px-4 py-12 max-w-4xl text-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">隐私政策</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p>生效日期：2024年1月1日</p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. 信息收集</h2>
            <p>
              SmashEnglish（"我们要"、"我们的"）致力于保护您的隐私。当您使用我们的服务时，我们可能会收集以下类型的信息：
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>API 密钥：</strong> 为了使用 AI 功能，您需要在本地浏览器中存储 Google Gemini API 密钥。该密钥仅保存在您的设备本地存储（LocalStorage）中，不会发送到我们的服务器。
              </li>
              <li>
                <strong>使用数据：</strong> 我们可能会收集有关您如何访问和使用服务的匿名数据，例如访问的页面、停留时间等，以改善用户体验。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. 信息使用</h2>
            <p>我们收集的信息主要用于：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>提供、维护和改进我们的服务。</li>
              <li>分析使用趋势，优化用户体验。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Cookie 和类似技术</h2>
            <p>
              我们使用 Cookie 来存储您的偏好设置（如 API 密钥状态）。您可以随时通过浏览器设置清除 Cookie。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. 第三方服务</h2>
            <p>
              我们的服务依赖于 Google Gemini API。在使用 AI 功能时，您的输入数据将直接发送至 Google 的服务器进行处理。请参阅 Google 的隐私政策以了解更多信息。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. 联系我们</h2>
            <p>
              如果您对本隐私政策有任何疑问，请通过以下方式联系我们：contact@smashenglish.com
            </p>
          </section>
        </div>
      </main>
    </>
  );
};
