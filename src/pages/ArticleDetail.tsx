import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getArticle, Article } from '../utils/articleLoader';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        const data = await getArticle(slug);
        if (data) {
          setArticle(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load article:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (notFound) {
    return <Navigate to="/articles" replace />;
  }

  if (loading) {
    return (
      <>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
        </div>
      </>
    );
  }

  if (!article) return null;

  return (
    <>
      <Helmet>
        <title>{article.title} - SmashEnglish</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          to="/articles" 
          className="inline-flex items-center text-slate-500 hover:text-pink-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回文章列表
        </Link>

        <article>
          <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
              <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-medium">
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif leading-tight">
              {article.title}
            </h1>
          </header>

          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-800
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-li:text-slate-600
            prose-img:rounded-xl prose-img:shadow-md
          ">
            <Markdown>{article.content}</Markdown>
          </div>
        </article>
      </main>
    </>
  );
};
