import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';

export const Terms: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>服务条款 - SmashEnglish</title>
        <meta name="description" content="SmashEnglish 的服务条款。使用本服务即表示您同意遵守这些条款。" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://englishkiller.pages.dev/terms" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://englishkiller.pages.dev/terms" />
        <meta property="og:title" content="服务条款 - SmashEnglish" />
        <meta property="og:description" content="使用本服务即表示您同意遵守这些条款。" />
        <meta property="og:image" content="https://englishkiller.pages.dev/og-image.png" />
      </Helmet>

      <Header hasApiKey={false} onApiKeyClick={() => {}} />

      <main className="container mx-auto px-4 py-12 max-w-4xl text-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">服务条款</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p>生效日期：2024年1月1日</p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. 条款接受</h2>
            <p>
              访问或使用 SmashEnglish（以下简称“本服务”），即表示您同意受本服务条款（以下简称“条款”）的约束。如果您不同意这些条款，请勿使用本服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. 服务描述</h2>
            <p>
              SmashEnglish 是一个 AI 驱动的英语学习辅助工具，提供句法分析、词典查询和写作润色等功能。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. 用户责任</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>您需自行负责保管您的 API 密钥。</li>
              <li>您同意不将本服务用于任何非法或未经授权的目的。</li>
              <li>您不得干扰或破坏本服务的完整性或性能。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. 免责声明</h2>
            <p>
              本服务按“原样”提供，不提供任何形式的明示或暗示保证。我们不保证服务将不间断、及时、安全或无错误。AI 生成的内容仅供参考，不保证其绝对准确性。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. 条款修改</h2>
            <p>
              我们保留随时修改这些条款的权利。修改后的条款将在发布时生效。您继续使用本服务将被视为接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. 联系我们</h2>
            <p>
              如有任何问题，请联系：contact@smashenglish.com
            </p>
          </section>
        </div>
      </main>
    </>
  );
};
