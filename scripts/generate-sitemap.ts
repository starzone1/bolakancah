import fs from 'fs';
import path from 'path';

// Helper function to slugify titles/paths exactly like the client app
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper function to construct full article URLs
function getArticleUrl(article: { id: string; title: string; date?: string; slug?: string }): string {
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
function parseLastMod(dateStr: string): string {
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
    return '2026-07-09';
  }
}

// 1. Guaranteed list of core/fallback articles requested by you
const coreArticles = [
  {
    id: "art-1",
    title: "kancah4d prediksi perempat final world cup 2026 spanyol vs belgia duel sengit berebut tiket semifinal",
    date: "10 Jul 2026",
    slug: "kancah4d-prediksi-perempat-final-world-cup-2026-spanyol-vs-belgia-duel-sengit-berebut-tiket-semifinal"
  },
  {
    id: "art-2",
    title: "kancah4d hasil perempat final world cup 2026 prancis tundukkan maroko 2-0 amankan tiket semifinal",
    date: "10 Jul 2026",
    slug: "kancah4d-hasil-perempat-final-world-cup-2026-prancis-tundukkan-maroko-2-0-amankan-tiket-semifinal"
  },
  {
    id: "art-3",
    title: "bukti nyata jackpot melimpah di kancah4d kemenangan berapapun pasti dibayar lunas",
    date: "10 Jul 2026",
    slug: "bukti-nyata-jackpot-melimpah-di-kancah4d-kemenangan-berapapun-pasti-dibayar-lunas"
  },
  {
    id: "art-4",
    title: "kancah4d bukti nyata jackpot id minyaklinta2 wd rp 3575000 di sugar rush 1000",
    date: "08 Jul 2026",
    slug: "kancah4d-bukti-nyata-jackpot-id-minyaklinta2-wd-rp-3575000-di-sugar-rush-1000"
  },
  {
    id: "art-5",
    title: "bukti nyata jackpot kancah4d modal receh withdraw rp 17943000 di gates of olympus 1000",
    date: "08 Jul 2026",
    slug: "bukti-nyata-jackpot-kancah4d-modal-receh-withdraw-rp-17943000-di-gates-of-olympus-1000"
  },
  {
    id: "art-6",
    title: "kancah4d hasil world cup 2026 portugal bungkam kroasia 2-1 di babak 32 besar",
    date: "03 Jul 2026",
    slug: "kancah4d-hasil-world-cup-2026-portugal-bungkam-kroasia-2-1-di-babak-32-besar"
  },
  {
    id: "art-7",
    title: "kancahtoto update skor piala dunia 2026 tercepat info lengkap akurat",
    date: "01 Jul 2026",
    slug: "kancahtoto-update-skor-piala-dunia-2026-tercepat-info-lengkap-akurat"
  }
];

// 2. Fetch live articles from Firestore Database REST API
async function fetchArticlesFromFirestore() {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.log('Firebase credentials file not found. Falling back to core articles only.');
      return [];
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const { projectId, firestoreDatabaseId } = config;

    if (!projectId || !firestoreDatabaseId) {
      console.log('Project details not specified in firebase-applet-config.json. Falling back.');
      return [];
    }

    console.log(`Connecting to Firestore REST API for database: ${firestoreDatabaseId}...`);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/articles?pageSize=300`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Firestore API returned status: ${response.status}. Fallback will be used.`);
      return [];
    }

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      console.log('No documents found in the Firestore articles collection.');
      return [];
    }

    const fetched = data.documents.map((doc: any) => {
      const fields = doc.fields || {};
      const id = path.basename(doc.name);
      
      const title = fields.title?.stringValue || '';
      const date = fields.date?.stringValue || '01 Juli 2026';
      const slug = fields.slug?.stringValue || '';

      return { id, title, date, slug };
    });

    console.log(`Successfully fetched ${fetched.length} live articles from Firestore.`);
    return fetched;
  } catch (err) {
    console.warn('Error fetching live articles from Firestore:', err);
    return [];
  }
}

async function generateDynamicSitemap() {
  const articlesMap = new Map<string, { url: string; lastmod: string }>();

  // A. Seed with the requested core articles first
  for (const art of coreArticles) {
    const url = getArticleUrl(art);
    const lastmod = parseLastMod(art.date);
    articlesMap.set(url, { url, lastmod });
  }

  // B. Merge any newly created articles fetched from Firestore
  const remoteArticles = await fetchArticlesFromFirestore();
  for (const art of remoteArticles) {
    if (!art.title) continue;
    const url = getArticleUrl(art);
    const lastmod = parseLastMod(art.date);
    
    // Add or overwrite (keeps the newest date if duplicate, or adds new ones automatically)
    articlesMap.set(url, { url, lastmod });
  }

  // C. Assemble sitemap XML contents
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!--  Homepage  -->
  <url>
    <loc>https://bolakancah.asia/</loc>
    <lastmod>2026-07-09</lastmod>
  </url>

  <!--  Categories  -->
  <url>
    <loc>https://bolakancah.asia/kategori/sepak-bola</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://bolakancah.asia/kategori/piala-dunia-2026</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://bolakancah.asia/kategori/prediksi-skor</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://bolakancah.asia/kategori/kancah4d</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://bolakancah.asia/kategori/slot-gacor</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
  <url>
    <loc>https://bolakancah.asia/kategori/daftar-kancahtoto</loc>
    <lastmod>2026-07-09</lastmod>
  </url>

  <!--  Articles  -->\n`;

  // Sort articles by lastmod descending to keep it clean
  const articlesList = Array.from(articlesMap.values());
  articlesList.sort((a, b) => b.lastmod.localeCompare(a.lastmod));

  for (const art of articlesList) {
    xml += `  <url>\n    <loc>${art.url}</loc>\n    <lastmod>${art.lastmod}</lastmod>\n  </url>\n`;
  }

  xml += `\n</urlset>\n`;

  // D. Write generated sitemap output to target folders
  const publicPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  const distPath = path.resolve(process.cwd(), 'dist/sitemap.xml');

  // Ensure public directory exists
  const publicDir = path.dirname(publicPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap] Saved dynamically generated sitemap to public/sitemap.xml (${articlesMap.size} articles)`);

  // Ensure dist directory exists before writing to dist
  const distDir = path.dirname(distPath);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap] Copied sitemap to dist/sitemap.xml (${fs.statSync(distPath).size} bytes)`);
  }
}

generateDynamicSitemap().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
