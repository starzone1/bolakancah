import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, Fixture, ArticleComment } from '../types';
import { mockArticles, mockFixtures } from '../data/mockNews';

const ARTICLES_COLLECTION = 'articles';
const FIXTURES_COLLECTION = 'fixtures';

/**
 * Seed initial articles into Firestore if collection is empty
 */
const METADATA_COLLECTION = 'metadata';
const CONFIG_DOC = 'config';

export const seedInitialArticlesIfEmpty = async (initialArticles: Article[]) => {
  try {
    const configRef = doc(db, METADATA_COLLECTION, CONFIG_DOC);
    const configSnap = await getDoc(configRef);
    if (configSnap.exists() && configSnap.data()?.articlesSeeded) {
      return;
    }

    const colRef = collection(db, ARTICLES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Seeding initial articles to Firestore...');
      for (const art of initialArticles) {
        await setDoc(doc(db, ARTICLES_COLLECTION, art.id), {
          title: art.title || '',
          category: art.category || 'Sepak Bola',
          labels: art.labels || [],
          author: art.author || 'Admin Redaksi',
          date: art.date || '01 Juli 2026',
          image: art.image || '',
          summary: art.summary || '',
          content: art.content || '',
          featured: Boolean(art.featured),
          views: art.views || 100,
          commentsCount: art.commentsCount || 0
        });
      }
    }
    await setDoc(configRef, { articlesSeeded: true }, { merge: true });
  } catch (err) {
    console.error('Failed to seed initial articles:', err);
  }
};

/**
 * Seed initial fixtures into Firestore if collection is empty
 */
export const seedInitialFixturesIfEmpty = async (initialFixtures: Fixture[]) => {
  try {
    const configRef = doc(db, METADATA_COLLECTION, CONFIG_DOC);
    const configSnap = await getDoc(configRef);
    if (configSnap.exists() && configSnap.data()?.fixturesSeeded) {
      return;
    }

    const colRef = collection(db, FIXTURES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Seeding initial fixtures to Firestore...');
      for (const fix of initialFixtures) {
        await setDoc(doc(db, FIXTURES_COLLECTION, fix.id), {
          homeTeam: fix.homeTeam || '',
          awayTeam: fix.awayTeam || '',
          homeLogo: fix.homeLogo || '',
          awayLogo: fix.awayLogo || '',
          homeScore: fix.homeScore !== undefined ? fix.homeScore : null,
          awayScore: fix.awayScore !== undefined ? fix.awayScore : null,
          matchDate: fix.matchDate || 'Hari Ini',
          league: fix.league || 'Piala Dunia 2026',
          prediction: fix.prediction || '',
          odds: fix.odds || '',
          status: fix.status || 'Upcoming'
        });
      }
    }
    await setDoc(configRef, { fixturesSeeded: true }, { merge: true });
  } catch (err) {
    console.error('Failed to seed initial fixtures:', err);
  }
};

/**
 * Subscribe to real-time articles updates across all devices
 */
export const subscribeArticles = (
  onSuccess: (articles: Article[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, ARTICLES_COLLECTION);
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onSuccess([]);
      } else {
        const articles: Article[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            category: data.category || 'Sepak Bola',
            labels: Array.isArray(data.labels) ? data.labels : [],
            author: data.author || 'Admin Redaksi',
            date: data.date || '01 Juli 2026',
            image: data.image || '',
            summary: data.summary || '',
            content: data.content || '',
            featured: Boolean(data.featured),
            views: typeof data.views === 'number' ? data.views : 1,
            commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0
          };
        });

        // Stable sort: featured first, then newest ID
        articles.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.id.localeCompare(a.id);
        });

        onSuccess(articles);
      }
    },
    (error) => {
      console.error('Firestore articles snapshot error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Save new article to Firestore (Auto-synced across all devices)
 */
export const saveArticleToDb = async (article: Article) => {
  const docRef = doc(db, ARTICLES_COLLECTION, article.id);
  await setDoc(docRef, {
    title: article.title || '',
    category: article.category || 'Sepak Bola',
    labels: article.labels || [],
    author: article.author || 'Admin Redaksi',
    date: article.date || '01 Juli 2026',
    image: article.image || '',
    summary: article.summary || '',
    content: article.content || '',
    featured: Boolean(article.featured),
    views: article.views || 1,
    commentsCount: article.commentsCount || 0
  });
};

/**
 * Update existing article in Firestore
 */
export const updateArticleInDb = async (article: Article) => {
  const docRef = doc(db, ARTICLES_COLLECTION, article.id);
  await setDoc(docRef, {
    title: article.title || '',
    category: article.category || 'Sepak Bola',
    labels: article.labels || [],
    author: article.author || 'Admin Redaksi',
    date: article.date || '01 Juli 2026',
    image: article.image || '',
    summary: article.summary || '',
    content: article.content || '',
    featured: Boolean(article.featured),
    views: article.views || 1,
    commentsCount: article.commentsCount || 0
  }, { merge: true });
};

/**
 * Delete article from Firestore
 */
export const deleteArticleFromDb = async (id: string) => {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Subscribe to real-time fixtures & predictions updates across all devices
 */
export const subscribeFixtures = (
  onSuccess: (fixtures: Fixture[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, FIXTURES_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onSuccess([]);
      } else {
        const fixtures: Fixture[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            homeTeam: data.homeTeam || '',
            awayTeam: data.awayTeam || '',
            homeLogo: data.homeLogo || '',
            awayLogo: data.awayLogo || '',
            homeScore: typeof data.homeScore === 'number' ? data.homeScore : undefined,
            awayScore: typeof data.awayScore === 'number' ? data.awayScore : undefined,
            matchDate: data.matchDate || 'Hari Ini',
            league: data.league || 'Piala Dunia 2026',
            prediction: data.prediction || '',
            odds: data.odds || '',
            status: data.status || 'Upcoming'
          };
        });

        // Stable sort: by ID
        fixtures.sort((a, b) => a.id.localeCompare(b.id));

        onSuccess(fixtures);
      }
    },
    (error) => {
      console.error('Firestore fixtures snapshot error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Save new fixture to Firestore
 */
export const saveFixtureToDb = async (fixture: Fixture) => {
  const docRef = doc(db, FIXTURES_COLLECTION, fixture.id);
  await setDoc(docRef, {
    homeTeam: fixture.homeTeam || '',
    awayTeam: fixture.awayTeam || '',
    homeLogo: fixture.homeLogo || '',
    awayLogo: fixture.awayLogo || '',
    homeScore: fixture.homeScore !== undefined ? fixture.homeScore : null,
    awayScore: fixture.awayScore !== undefined ? fixture.awayScore : null,
    matchDate: fixture.matchDate || 'Hari Ini',
    league: fixture.league || 'Piala Dunia 2026',
    prediction: fixture.prediction || '',
    odds: fixture.odds || '',
    status: fixture.status || 'Upcoming'
  });
};

/**
 * Update fixture in Firestore
 */
export const updateFixtureInDb = async (fixture: Fixture) => {
  const docRef = doc(db, FIXTURES_COLLECTION, fixture.id);
  await setDoc(docRef, {
    homeTeam: fixture.homeTeam || '',
    awayTeam: fixture.awayTeam || '',
    homeLogo: fixture.homeLogo || '',
    awayLogo: fixture.awayLogo || '',
    homeScore: fixture.homeScore !== undefined ? fixture.homeScore : null,
    awayScore: fixture.awayScore !== undefined ? fixture.awayScore : null,
    matchDate: fixture.matchDate || 'Hari Ini',
    league: fixture.league || 'Piala Dunia 2026',
    prediction: fixture.prediction || '',
    odds: fixture.odds || '',
    status: fixture.status || 'Upcoming'
  }, { merge: true });
};

/**
 * Delete fixture from Firestore
 */
export const deleteFixtureFromDb = async (id: string) => {
  const docRef = doc(db, FIXTURES_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Subscribe to comments for a specific article from Firestore
 */
export const subscribeArticleComments = (
  articleId: string,
  onSuccess: (comments: ArticleComment[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, ARTICLES_COLLECTION, articleId, 'comments');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const comments: ArticleComment[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          articleId,
          name: data.name || 'Anonim',
          text: data.text || '',
          date: data.date || 'Baru saja',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now()
        };
      });

      // Sort newest first
      comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onSuccess(comments);
    },
    (error) => {
      console.error('Firestore comments error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Add a comment to an article in Firestore
 */
export const addArticleCommentToDb = async (
  articleId: string,
  comment: { name: string; text: string; date: string }
) => {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION, articleId, 'comments');
    await addDoc(colRef, {
      name: comment.name,
      text: comment.text,
      date: comment.date,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error('Failed to add comment to Firestore:', err);
  }
};


