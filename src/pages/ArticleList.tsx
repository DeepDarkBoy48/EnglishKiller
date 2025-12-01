import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, Article } from '../utils/articleLoader';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getArticles();
        setArticles(data);
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>文章中心 - SmashEnglish</title>
        <meta name="description" content="SmashEnglish 文章中心，提供英语学习指南、技巧和更新动态。" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 font-serif">文章中心</h1>
          <p className="text-lg text-slate-600">探索英语学习技巧、使用指南和最新动态</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full font-medium">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 hover:text-pink-600 transition-colors">
                      <Link to={`/articles/${article.id}`}>
                        {article.title}
                      </Link>
                    </h2>
                    
                    <p className="text-slate-600 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <Link 
                      to={`/articles/${article.id}`}
                      className="inline-flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors group"
                    >
                      阅读全文
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            
            {articles.length === 0 && (
              <div className="text-center text-slate-500 py-12">
                暂无文章
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};
