import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { Analyzer } from './pages/Analyzer';
import { Dictionary } from './pages/Dictionary';
import { Writing } from './pages/Writing';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { ArticleList } from './pages/ArticleList';
import { ArticleDetail } from './pages/ArticleDetail';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/analyzer" replace />} />
            <Route path="/analyzer" element={<Analyzer />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
          </Route>
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
