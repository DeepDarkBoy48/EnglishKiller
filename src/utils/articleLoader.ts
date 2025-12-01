export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
}

// Helper to parse frontmatter
const parseFrontmatter = (fileContent: string) => {
  const frontmatterRegex = /---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return {
      metadata: {},
      content: fileContent
    };
  }

  const metadataBlock = match[1];
  const content = match[2];
  
  const metadata: Record<string, string> = {};
  metadataBlock.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  });

  return {
    metadata,
    content
  };
};

export const getArticles = async (): Promise<Article[]> => {
  // Use Vite's import.meta.glob to load all .md files in src/posts
  const modules = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default' });
  
  const articles: Article[] = [];

  for (const path in modules) {
    const rawContent = await modules[path]() as string;
    const { metadata, content } = parseFrontmatter(rawContent);
    
    // Extract slug from filename (e.g., ../posts/hello-world.md -> hello-world)
    const slug = path.split('/').pop()?.replace('.md', '') || '';

    articles.push({
      id: slug,
      title: metadata.title || 'Untitled',
      excerpt: metadata.excerpt || '',
      content: content,
      date: metadata.date || '',
      author: metadata.author || 'Anonymous',
      category: metadata.category || 'Uncategorized'
    });
  }

  // Sort by date descending
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getArticle = async (slug: string): Promise<Article | null> => {
  const articles = await getArticles();
  return articles.find(article => article.id === slug) || null;
};
