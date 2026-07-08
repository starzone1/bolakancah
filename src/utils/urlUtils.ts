import { Article } from '../types';

export function getAppBasePath(): string {
  const path = window.location.pathname;
  // If it contains /kategori/, find the index of /kategori/
  const katIndex = path.indexOf('/kategori/');
  if (katIndex > 0) {
    return path.substring(0, katIndex);
  }
  // If it contains /2026/ or similar 4-digit year pattern
  const yearMatch = path.match(/\/\d{4}\/\d{2}\//);
  if (yearMatch && yearMatch.index && yearMatch.index > 0) {
    return path.substring(0, yearMatch.index);
  }
  // If it is just a subfolder like /bolakancah/ or /bolakancah
  if (path !== '/' && !path.startsWith('/kategori/') && !path.match(/^\/\d{4}\/\d{2}\//)) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      // If the first segment is not "kategori" and not a year
      const first = segments[0];
      const reservedRoutes = ['kategori', 'tulis', 'write', 'editor', 'admin'];
      if (!reservedRoutes.includes(first) && !/^\d{4}$/.test(first)) {
        return `/${first}`;
      }
    }
  }
  return '';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getArticleUrl(article: { id: string; title: string; date?: string; slug?: string }): string {
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

  const base = getAppBasePath();
  return `${base}/${year}/${month}/${slug}.html`;
}

export function findArticleFromPath(
  pathname: string, 
  articles: Article[], 
  searchParams: URLSearchParams
): Article | null {
  // Check query params fallback first
  const qId = searchParams.get('article') || searchParams.get('id');
  if (qId) {
    const foundById = articles.find((a) => a.id === qId);
    if (foundById) return foundById;
  }

  const base = getAppBasePath();
  let cleanPath = pathname;
  if (base && pathname.startsWith(base)) {
    cleanPath = pathname.substring(base.length);
  }

  // Extract slug from URL pathname e.g. /2026/07/update-skor-piala-dunia-2026-tercepat.html
  cleanPath = cleanPath.replace(/\.html$/, '').replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length > 0) {
    const rawSlug = segments[segments.length - 1];

    // Match exact slugified title, custom slug, or ID
    const matched = articles.find((a) => {
      const aSlug = slugify(a.title);
      const customSlugValue = a.slug ? slugify(a.slug) : '';
      return aSlug === rawSlug || a.id === rawSlug || (customSlugValue && customSlugValue === rawSlug);
    });
    if (matched) return matched;

    // Partial match fallback
    const partialMatch = articles.find((a) => {
      const aSlug = slugify(a.title);
      const customSlugValue = a.slug ? slugify(a.slug) : '';
      return (aSlug.length > 5 && (aSlug.includes(rawSlug) || rawSlug.includes(aSlug))) ||
             (customSlugValue && customSlugValue.length > 5 && (customSlugValue.includes(rawSlug) || rawSlug.includes(customSlugValue)));
    });
    if (partialMatch) return partialMatch;
  }

  return null;
}

export function findCategoryFromPath(pathname: string, searchParams: URLSearchParams): string | null {
  const qCat = searchParams.get('cat') || searchParams.get('kategori');
  if (qCat) return qCat;

  const base = getAppBasePath();
  let cleanPath = pathname;
  if (base && pathname.startsWith(base)) {
    cleanPath = pathname.substring(base.length);
  }

  cleanPath = cleanPath.replace(/\/$/, '');
  if (cleanPath.startsWith('/kategori/')) {
    const rawCat = decodeURIComponent(cleanPath.replace('/kategori/', ''));
    return rawCat.replace(/-/g, ' ');
  }

  return null;
}
