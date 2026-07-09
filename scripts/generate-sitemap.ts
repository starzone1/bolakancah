import fs from 'fs';
import path from 'path';

// Mock window environment before importing client utilities
(global as any).window = {
  location: {
    pathname: '/'
  }
};

import { mockArticles, mockCategories } from '../src/data/mockNews';
import { getArticleUrl, slugify } from '../src/utils/urlUtils';

const BASE_URL = 'https://bolakancah.asia';

interface FirestoreArticleDoc {
  name: string;
  fields?: Record<string, any>;
}

interface FirestoreResponse {
  documents?: FirestoreArticleDoc[];
}

function parseFirestoreArticle(doc: FirestoreArticleDoc) {
  const fields = doc.fields || {};
  const id = doc.name.split('/').pop() || '';
  
  const title = fields.title?.stringValue || '';
  const category = fields.category?.stringValue || 'Sepak Bola';
  const date = fields.date?.stringValue || '01 Juli 2026';
  const slug = fields.slug?.stringValue || '';

  return {
    id,
    title,
    category,
    date,
    slug
  };
}

async function fetchFirestoreArticles(): Promise<any[]> {
  let projectId = 'gen-lang-client-0169314778';
  let databaseId = 'ai-studio-kancahtotoportal-7859c1bb-6a48-438c-bbe3-87472a290388';
  let apiKey = '';

  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.projectId) projectId = config.projectId;
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
      if (config.apiKey) apiKey = config.apiKey;
    }
  } catch (err) {
    // Squelch configuration load errors
  }

  const queryParams = apiKey ? `?pageSize=100&key=${apiKey}` : '?pageSize=100';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/articles${queryParams}`;

  try {
    console.log('Fetching articles from Firestore REST API...');
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json() as FirestoreResponse;
    if (data.documents && data.documents.length > 0) {
      console.log(`Successfully fetched ${data.documents.length} articles from Firestore.`);
      return data.documents.map(parseFirestoreArticle);
    }
  } catch (err) {
    console.log('Note: Using local mock articles for sitemap generation (Firestore collection is currently empty or unseeded).');
  }
  return [];
}

async function generateSitemap() {
  const firestoreArticles = await fetchFirestoreArticles();
  
  // Merge firestore articles with mockArticles to ensure all are indexed
  const articleMap = new Map<string, any>();
  
  // Add mock articles first
  for (const art of mockArticles) {
    articleMap.set(art.id, {
      id: art.id,
      title: art.title,
      category: art.category,
      date: art.date,
      slug: art.slug || ''
    });
  }
  
  // Overwrite or add firestore articles
  for (const art of firestoreArticles) {
    articleMap.set(art.id, art);
  }
  
  const allArticles = Array.from(articleMap.values());
  console.log(`Total merged articles for sitemap: ${allArticles.length}`);

  // Build unique categories list
  const categoriesSet = new Set<string>();
  for (const cat of mockCategories) {
    categoriesSet.add(cat.name);
  }
  for (const art of allArticles) {
    if (art.category) {
      categoriesSet.add(art.category);
    }
  }
  const allCategories = Array.from(categoriesSet);

  // Generate XML
  const currentDate = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add Homepage
  xml += '  <!-- Homepage -->\n';
  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n\n';

  // Add Categories
  xml += '  <!-- Categories -->\n';
  for (const cat of allCategories) {
    const catSlug = slugify(cat);
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/kategori/${catSlug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }
  xml += '\n';

  // Add Articles
  xml += '  <!-- Articles -->\n';
  for (const art of allArticles) {
    // getArticleUrl might return paths starting with "/"
    let articlePath = getArticleUrl(art);
    if (articlePath.startsWith('/')) {
      articlePath = articlePath.substring(1);
    }
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/${articlePath}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';

  // Paths to save
  const publicPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  const distPath = path.resolve(process.cwd(), 'dist/sitemap.xml');

  // Ensure public directory exists (it should, but safety first)
  const publicDir = path.dirname(publicPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write to public
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`Saved sitemap to public/sitemap.xml (${fs.statSync(publicPath).size} bytes)`);

  // Write to dist if dist exists
  const distDir = path.dirname(distPath);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`Saved sitemap to dist/sitemap.xml (${fs.statSync(distPath).size} bytes)`);
  }
}

generateSitemap().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
