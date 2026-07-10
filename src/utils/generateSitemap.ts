import { Article } from '../types';
import { slugify } from './urlUtils';

// Helper to construct absolute canonical URL for sitemap
export function getSitemapArticleUrl(article: { id: string; title: string; date?: string; slug?: string }): string {
  const slug = article.slug && article.slug.trim() !== '' 
    ? slugify(article.slug) 
    : slugify(article.title || `artikel-${article.id}`);
  let year = '2026';
  let month = '07';

  if (article.date) {
    const monthNames: Record<string, string> = {
      januari: '01', jan: '01',
      februari: '02', feb: '02',
      maret: '03', mar: '03',
      april: '04', apr: '04',
      mei: '05',
      juni: '06', jun: '06',
      juli: '07', jul: '07',
      agustus: '08', agu: '08', aug: '08',
      september: '09', sep: '09',
      oktober: '10', okt: '10', oct: '10',
      november: '11', nov: '11',
      desember: '12', des: '12', dec: '12'
    };

    const parts = article.date.toLowerCase().split(/[\s\/-]+/);
    for (const part of parts) {
      if (/^\d{4}$/.test(part)) {
        year = part;
      } else if (monthNames[part]) {
        month = monthNames[part];
      }
    }
  }

  return `https://bolakancah.asia/${year}/${month}/${slug}.html`;
}

// Helper to convert date strings like "10 Jul 2026" to "2026-07-10"
export function parseLastMod(dateStr: string): string {
  try {
    const monthNames: Record<string, string> = {
      januari: '01', jan: '01',
      februari: '02', feb: '02',
      maret: '03', mar: '03',
      april: '04', apr: '04',
      mei: '05',
      juni: '06', jun: '06',
      juli: '07', jul: '07',
      agustus: '08', agu: '08', aug: '08',
      september: '09', sep: '09',
      oktober: '10', okt: '10', oct: '10',
      november: '11', nov: '11',
      desember: '12', des: '12', dec: '12'
    };

    const parts = dateStr.toLowerCase().split(/[\s\/-]+/);
    let day = '09';
    let month = '07';
    let year = '2026';

    if (parts.length >= 1 && /^\d+$/.test(parts[0])) {
      day = parts[0].padStart(2, '0');
    }
    for (const part of parts) {
      if (/^\d{4}$/.test(part)) {
        year = part;
      } else if (monthNames[part]) {
        month = monthNames[part];
      }
    }

    return `${year}-${month}-${day}`;
  } catch (err) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Automatically scans the articles array and produces a fully qualified XML sitemap string
 */
export function generateSitemapXml(articles: Article[]): string {
  const articlesMap = new Map<string, { url: string; lastmod: string }>();

  // Canonical list of categories from the homepage
  const categories = [
    'sepak-bola',
    'piala-dunia-2026',
    'prediksi-skor',
    'kancah4d',
    'slot-gacor',
    'daftar-kancahtoto'
  ];

  // Merge articles
  for (const art of articles) {
    if (!art.title) continue;
    const url = getSitemapArticleUrl(art);
    const lastmod = parseLastMod(art.date);
    articlesMap.set(url, { url, lastmod });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!--  Homepage  -->
  <url>
    <loc>https://bolakancah.asia/</loc>
    <lastmod>${todayStr}</lastmod>
  </url>

  <!--  Categories  -->\n`;

  for (const cat of categories) {
    xml += `  <url>\n    <loc>https://bolakancah.asia/kategori/${cat}</loc>\n    <lastmod>${todayStr}</lastmod>\n  </url>\n`;
  }

  xml += `\n  <!--  Articles  -->\n`;

  // Sort articles by lastmod descending to keep it clean
  const articlesList = Array.from(articlesMap.values());
  articlesList.sort((a, b) => b.lastmod.localeCompare(a.lastmod));

  for (const art of articlesList) {
    xml += `  <url>\n    <loc>${art.url}</loc>\n    <lastmod>${art.lastmod}</lastmod>\n  </url>\n`;
  }

  xml += `\n</urlset>\n`;
  return xml;
}
