import { Article } from '../types';
import { getArticleUrl, slugify } from './urlUtils';

const BASE_URL = 'https://bolakancah.asia';

function setMetaTag(selector: string, content: string, attr: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attr}="${selector}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, selector);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

export function updateSeoMeta(options: {
  article?: Article | null;
  category?: string | null;
}) {
  const { article, category } = options;

  // Existing json-ld cleanup for article
  let articleJsonLd = document.getElementById('article-jsonld');

  if (article) {
    const fullUrl = `${BASE_URL}${getArticleUrl(article)}`;
    const title = `${article.title} - KANCAHTOTO`;
    const snippet = article.summary || article.content.substring(0, 160).replace(/<[^>]*>?/gm, '');

    document.title = title;
    setCanonical(fullUrl);

    setMetaTag('keywords', `${article.title}, KANCAHTOTO, kancah4d, Kancah 4D, kancah toto, prediksi kancah4d, ${article.category}`, 'name');
    setMetaTag('description', snippet, 'name');
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', snippet, 'property');
    setMetaTag('og:image', article.image, 'property');
    setMetaTag('og:url', fullUrl, 'property');
    setMetaTag('og:type', 'article', 'property');

    setMetaTag('twitter:title', title, 'name');
    setMetaTag('twitter:description', snippet, 'name');
    setMetaTag('twitter:image', article.image, 'name');

    // Add NewsArticle Schema
    if (!articleJsonLd) {
      articleJsonLd = document.createElement('script');
      articleJsonLd.id = 'article-jsonld';
      articleJsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(articleJsonLd);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': article.title,
      'image': [article.image],
      'datePublished': article.date || '2026-07-02',
      'articleSection': article.category,
      'author': {
        '@type': 'Organization',
        'name': 'KANCAHTOTO',
        'url': BASE_URL
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'KANCAHTOTO',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://aytextilemachinery.com/images/logo_kancah4d.webp'
        }
      },
      'description': snippet,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': fullUrl
      }
    };

    articleJsonLd.textContent = JSON.stringify(schemaData);
    return;
  }

  // Remove article schema if not on article view
  if (articleJsonLd) {
    articleJsonLd.remove();
  }

  if (category) {
    const catSlug = slugify(category);
    const fullUrl = `${BASE_URL}/kategori/${catSlug}`;
    const title = `Berita ${category} Terkini - KANCAHTOTO & Kancah4D`;
    const description = `Kumpulan berita ${category} sepak bola terkini, analisa laga, dan prediksi skor Kancah4D terbaru hanya di KANCAHTOTO.`;

    document.title = title;
    setCanonical(fullUrl);

    setMetaTag('keywords', `${category}, KANCAHTOTO, kancah4d, Kancah 4D, kancah toto, prediksi kancah4d`, 'name');
    setMetaTag('description', description, 'name');
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:url', fullUrl, 'property');
    setMetaTag('og:type', 'website', 'property');

    setMetaTag('twitter:title', title, 'name');
    setMetaTag('twitter:description', description, 'name');
    return;
  }

  // Fallback Home SEO
  const title = 'KANCAH4D - Portal Berita Sepak Bola & Prediksi Skor Akurat Di KANCAHTOTO';
  const description = 'Portal berita sepak bola resmi KANCAHTOTO dan Kancah4D. Tempatnya berita liga terupdate, jadwal pertandingan, analisa taktis, dan prediksi skor paling akurat.';

  document.title = title;
  setCanonical(`${BASE_URL}/`);

  setMetaTag('keywords', 'KANCAHTOTO, kancah4d, Kancah 4D, kancah toto, link kancah4d, prediksi kancah4d, berita kancah4d, portal kancah4d', 'name');
  setMetaTag('description', description, 'name');
  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description, 'property');
  setMetaTag('og:url', `${BASE_URL}/`, 'property');
  setMetaTag('og:image', 'https://aytextilemachinery.com/images/logo_kancah4d.webp', 'property');
  setMetaTag('og:type', 'website', 'property');

  setMetaTag('twitter:title', title, 'name');
  setMetaTag('twitter:description', description, 'name');
}
