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
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Article, Fixture, ArticleComment } from '../types';
import { mockArticles, mockFixtures } from '../data/mockNews';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let auth;
  try {
    auth = getAuth();
  } catch (e) {
    // Auth might not be initialized yet
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const ARTICLES_COLLECTION = 'articles';
const FIXTURES_COLLECTION = 'fixtures';

/**
 * Seed initial articles into Firestore if collection is empty
 */
const METADATA_COLLECTION = 'metadata';
const CONFIG_DOC = 'config';

export const seedInitialArticlesIfEmpty = async (initialArticles: Article[]) => {
  const configPath = `${METADATA_COLLECTION}/${CONFIG_DOC}`;
  try {
    const configRef = doc(db, METADATA_COLLECTION, CONFIG_DOC);
    let configSnap;
    try {
      configSnap = await getDoc(configRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, configPath);
      return;
    }

    if (configSnap.exists() && configSnap.data()?.articlesSeeded) {
      return;
    }

    let snap;
    try {
      const colRef = collection(db, ARTICLES_COLLECTION);
      snap = await getDocs(colRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, ARTICLES_COLLECTION);
      return;
    }

    if (snap.empty) {
      console.log('Seeding initial articles to Firestore...');
      for (const art of initialArticles) {
        try {
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
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${ARTICLES_COLLECTION}/${art.id}`);
        }
      }
    }

    try {
      await setDoc(configRef, { articlesSeeded: true }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, configPath);
    }
  } catch (err) {
    console.error('Failed to seed initial articles:', err);
    throw err;
  }
};

/**
 * Seed initial fixtures into Firestore if collection is empty
 */
export const seedInitialFixturesIfEmpty = async (initialFixtures: Fixture[]) => {
  const configPath = `${METADATA_COLLECTION}/${CONFIG_DOC}`;
  try {
    const configRef = doc(db, METADATA_COLLECTION, CONFIG_DOC);
    let configSnap;
    try {
      configSnap = await getDoc(configRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, configPath);
      return;
    }

    if (configSnap.exists() && configSnap.data()?.fixturesSeeded) {
      return;
    }

    let snap;
    try {
      const colRef = collection(db, FIXTURES_COLLECTION);
      snap = await getDocs(colRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, FIXTURES_COLLECTION);
      return;
    }

    if (snap.empty) {
      console.log('Seeding initial fixtures to Firestore...');
      for (const fix of initialFixtures) {
        try {
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
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${FIXTURES_COLLECTION}/${fix.id}`);
        }
      }
    }

    try {
      await setDoc(configRef, { fixturesSeeded: true }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, configPath);
    }
  } catch (err) {
    console.error('Failed to seed initial fixtures:', err);
    throw err;
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
      try {
        handleFirestoreError(error, OperationType.LIST, ARTICLES_COLLECTION);
      } catch (wrappedErr: any) {
        if (onError) onError(wrappedErr);
      }
    }
  );
};

/**
 * Save new article to Firestore (Auto-synced across all devices)
 */
export const saveArticleToDb = async (article: Article) => {
  const path = `${ARTICLES_COLLECTION}/${article.id}`;
  try {
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
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

/**
 * Update existing article in Firestore
 */
export const updateArticleInDb = async (article: Article) => {
  const path = `${ARTICLES_COLLECTION}/${article.id}`;
  try {
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
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
};

/**
 * Delete article from Firestore
 */
export const deleteArticleFromDb = async (id: string) => {
  const path = `${ARTICLES_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
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
      try {
        handleFirestoreError(error, OperationType.LIST, FIXTURES_COLLECTION);
      } catch (wrappedErr: any) {
        if (onError) onError(wrappedErr);
      }
    }
  );
};

/**
 * Save new fixture to Firestore
 */
export const saveFixtureToDb = async (fixture: Fixture) => {
  const path = `${FIXTURES_COLLECTION}/${fixture.id}`;
  try {
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
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

/**
 * Update fixture in Firestore
 */
export const updateFixtureInDb = async (fixture: Fixture) => {
  const path = `${FIXTURES_COLLECTION}/${fixture.id}`;
  try {
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
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
};

/**
 * Delete fixture from Firestore
 */
export const deleteFixtureFromDb = async (id: string) => {
  const path = `${FIXTURES_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, FIXTURES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
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
      const commentsPath = `${ARTICLES_COLLECTION}/${articleId}/comments`;
      try {
        handleFirestoreError(error, OperationType.LIST, commentsPath);
      } catch (wrappedErr: any) {
        if (onError) onError(wrappedErr);
      }
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
  const commentsPath = `${ARTICLES_COLLECTION}/${articleId}/comments`;
  try {
    const colRef = collection(db, ARTICLES_COLLECTION, articleId, 'comments');
    await addDoc(colRef, {
      name: comment.name,
      text: comment.text,
      date: comment.date,
      createdAt: Date.now()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, commentsPath);
  }
};


