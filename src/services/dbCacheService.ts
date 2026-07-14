import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, ArticleComment, User, Category } from '../types';
import { INITIAL_ARTICLES, INITIAL_COMMENTS, INITIAL_USERS } from '../data/initialData';
import { getStoredArticles, saveArticles, getStoredUsers, saveStoredUser } from '../utils/storage';

// --- CONFIGURATION & CONSTANTS ---
const COLLECTIONS = {
  ARTICLES: 'articles',
  COMMENTS: 'comments',
  USERS: 'users',
} as const;

const CACHE_DURATION_MS = 15 * 60 * 1000; // Cache durasi: 15 Menit

// --- CACHE CONTRACTS & STORAGE ---
interface CacheEntry<T> {
  data: T;
  lastFetched: number;
}

class DatabaseCache {
  private articles: CacheEntry<Article[]> | null = null;
  private users: CacheEntry<User[]> | null = null;
  private comments: Map<string, CacheEntry<ArticleComment[]>> = new Map();

  // Articles Cache Accessors
  public getArticles(): Article[] | null {
    if (this.articles && (Date.now() - this.articles.lastFetched < CACHE_DURATION_MS)) {
      return this.articles.data;
    }
    return null;
  }

  public setArticles(data: Article[]): void {
    this.articles = { data, lastFetched: Date.now() };
  }

  public invalidateArticles(): void {
    this.articles = null;
  }

  // Users Cache Accessors
  public getUsers(): User[] | null {
    if (this.users && (Date.now() - this.users.lastFetched < CACHE_DURATION_MS)) {
      return this.users.data;
    }
    return null;
  }

  public setUsers(data: User[]): void {
    this.users = { data, lastFetched: Date.now() };
  }

  // Comments Cache Accessors
  public getComments(articleId: string): ArticleComment[] | null {
    const entry = this.comments.get(articleId);
    if (entry && (Date.now() - entry.lastFetched < CACHE_DURATION_MS)) {
      return entry.data;
    }
    return null;
  }

  public setComments(articleId: string, data: ArticleComment[]): void {
    this.comments.set(articleId, { data, lastFetched: Date.now() });
  }

  public addSingleComment(articleId: string, comment: ArticleComment): void {
    const currentComments = this.getComments(articleId) || [];
    this.setComments(articleId, [comment, ...currentComments]);
  }
}

// Global Single Instance Cache Layer
const cache = new DatabaseCache();

// --- CORE UTILITY / FETCHERS ---

/**
 * Mengambil daftar artikel dari Firestore dengan backup otomatis ke LocalStorage
 * serta mekanisme caching memori berjangka waktu (Time-Based Cache Layer).
 */
async function fetchArticlesAndCache(): Promise<Article[]> {
  const cachedArticles = cache.getArticles();
  if (cachedArticles) return cachedArticles;

  try {
    const articlesRef = collection(db, COLLECTIONS.ARTICLES);
    const snapshot = await getDocs(articlesRef);
    
    const articles: Article[] = [];
    const existingIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Article;
      if (data) {
        articles.push({
          ...data,
          id: docSnap.id
        });
        existingIds.add(docSnap.id);
      }
    });

    // Menggabungkan Data Awal (Fallback) secara dinamis jika belum terdaftar di Firestore
    INITIAL_ARTICLES.forEach((initialArticle) => {
      if (!existingIds.has(initialArticle.id)) {
        articles.push(initialArticle);
        existingIds.add(initialArticle.id);
      }
    });

    // Urutkan artikel dari yang terbaru (berdasarkan createdAt)
    articles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Perbarui Cache Memori dan LocalStorage perangkat
    cache.setArticles(articles);
    saveArticles(articles);

    return articles;
  } catch (error) {
    console.warn('[Cache Layer] Gagal memuat data dari Firestore, beralih ke penyimpanan lokal:', error);
    const localFallback = getStoredArticles();
    cache.setArticles(localFallback);
    return localFallback;
  }
}

/**
 * Mengambil daftar user dari Firestore dengan mekanisme caching memori.
 */
async function fetchUsersAndCache(): Promise<User[]> {
  const cachedUsers = cache.getUsers();
  if (cachedUsers) return cachedUsers;

  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);

    const users: User[] = [];
    const existingUserIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const userData = docSnap.data() as User;
      if (userData) {
        users.push({
          ...userData,
          id: docSnap.id
        });
        existingUserIds.add(docSnap.id);
      }
    });

    // Masukkan data admin awal jika tidak ditemukan di Firestore
    INITIAL_USERS.forEach((initialUser) => {
      if (!existingUserIds.has(initialUser.id)) {
        users.push(initialUser);
        existingUserIds.add(initialUser.id);
      }
    });

    // Sinkronisasi ke Cache Memori & LocalStorage
    cache.setUsers(users);
    users.forEach((user) => {
      saveStoredUser(user);
    });

    return users;
  } catch (error) {
    console.warn('[Cache Layer] Gagal sinkronisasi user, menggunakan fallback lokal:', error);
    const localFallback = getStoredUsers();
    cache.setUsers(localFallback);
    return localFallback;
  }
}

/**
 * Mengambil seluruh komentar untuk satu artikel spesifik dari Firestore.
 */
async function fetchCommentsAndCache(articleId: string): Promise<ArticleComment[]> {
  const cachedComments = cache.getComments(articleId);
  if (cachedComments) return cachedComments;

  try {
    const commentsRef = collection(db, COLLECTIONS.COMMENTS);
    const q = query(commentsRef, where('articleId', '==', articleId));
    const snapshot = await getDocs(q);

    const comments: ArticleComment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ArticleComment;
      if (data) {
        comments.push({
          ...data,
          id: docSnap.id
        });
      }
    });

    // Urutkan komentar: Terbaru di paling atas
    comments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Daftarkan ke cache memori
    cache.setComments(articleId, comments);

    return comments;
  } catch (error) {
    console.warn('[Cache Layer] Gagal memuat komentar dari Firestore, menggunakan data awal:', error);
    return INITIAL_COMMENTS.filter(c => c.articleId === articleId);
  }
}

// --- PUBLIC DATABASE OPERATIONS (SAFE & MEMORY-FIRST) ---

/**
 * Berlangganan (Subscribe) ke pembaruan artikel.
 * Langsung memuat data lokal agar instan (Zero Lag), lalu memperbarui di latar belakang.
 */
export function subscribeToArticles(onUpdate: (articles: Article[]) => void): () => void {
  // 1. Tampilkan data instan dari LocalStorage tanpa jeda loading
  const localArticles = getStoredArticles();
  onUpdate(localArticles);

  // 2. Refresh data dari Firestore secara asinkron di background tanpa memblokir UI
  fetchArticlesAndCache()
    .then((articles) => {
      onUpdate(articles);
    })
    .catch(() => {
      onUpdate(getStoredArticles());
    });

  return () => {}; // Desain subscription hemat kuota tulis/baca (No-Cost)
}

/**
 * Menyimpan artikel baru ke Firestore.
 * Langsung perbarui cache memori & LocalStorage untuk memperbarui tampilan secara instan.
 */
export async function addArticleToFirestore(
  id: string, 
  title: string, 
  slug: string, 
  excerpt: string, 
  content: string, 
  imageUrl: string, 
  category: Category, 
  tags: string[], 
  authorId: string, 
  authorName: string
): Promise<Article> {
  const newArticle: Article = {
    id,
    title,
    slug,
    excerpt,
    content,
    imageUrl,
    category,
    tags,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
    views: 0,
    commentsCount: 0,
  };

  // 1. Tulis lokal (Optimistic UI Update) agar member tidak merasakan lag sedikitpun
  try {
    const localArticles = getStoredArticles();
    const updatedList = [newArticle, ...localArticles];
    saveArticles(updatedList);
    cache.setArticles(updatedList);
  } catch (e) {
    console.warn('[Cache Layer] Gagal melakukan Optimistic Save:', e);
  }

  // 2. Simpan permanen ke Firestore di latar belakang
  try {
    const docRef = doc(db, COLLECTIONS.ARTICLES, id);
    await setDoc(docRef, newArticle);
  } catch (error) {
    console.warn('[Cache Layer] Gagal mengunggah ke Firestore, perubahan tertahan lokal:', error);
  }

  return newArticle;
}

/**
 * Memperbarui artikel yang sudah ada di Firestore dan cache.
 */
export async function updateArticleInFirestore(
  articleId: string, 
  updates: Partial<Article>
): Promise<void> {
  // 1. Perbarui secara instan pada penyimpanan lokal & memori
  try {
    const localArticles = getStoredArticles();
    const index = localArticles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      localArticles[index] = { ...localArticles[index], ...updates };
      saveArticles(localArticles);
      cache.setArticles(localArticles);
    }
  } catch (e) {
    console.warn('[Cache Layer] Gagal update lokal:', e);
  }

  // 2. Lakukan sinkronisasi tulis ke Firestore
  try {
    const docRef = doc(db, COLLECTIONS.ARTICLES, articleId);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error('[Cache Layer] Gagal memperbarui data di Firestore:', error);
  }
}

/**
 * Menghapus artikel dari Firestore dan penyimpanan lokal.
 */
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  // 1. Hapus langsung dari penyimpanan lokal agar perubahan langsung direfleksikan
  try {
    const localArticles = getStoredArticles();
    const filteredList = localArticles.filter(a => a.id !== articleId);
    saveArticles(filteredList);
    cache.setArticles(filteredList);
  } catch (e) {
    console.warn('[Cache Layer] Gagal menghapus data lokal:', e);
  }

  // 2. Eksekusi penghapusan di Firestore
  try {
    const docRef = doc(db, COLLECTIONS.ARTICLES, articleId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('[Cache Layer] Gagal menghapus dokumen di Firestore:', error);
  }
}

/**
 * Menambahkan jumlah tayangan (view count) artikel secara hemat kuota (lokal saja).
 */
export async function incrementArticleViewsInFirestore(articleId: string): Promise<void> {
  try {
    const localArticles = getStoredArticles();
    const index = localArticles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      localArticles[index].views = (localArticles[index].views || 0) + 1;
      saveArticles(localArticles);
      
      const cached = cache.getArticles();
      if (cached) {
        const cachedIndex = cached.findIndex(a => a.id === articleId);
        if (cachedIndex !== -1) {
          cached[cachedIndex].views = (cached[cachedIndex].views || 0) + 1;
        }
      }
    }
  } catch (e) {
    console.warn('[Cache Layer] Gagal increment tayangan lokal:', e);
  }
}

/**
 * Berlangganan ke komentar artikel tertentu.
 */
export function subscribeToComments(
  articleId: string, 
  onUpdate: (comments: ArticleComment[]) => void
): () => void {
  const cachedComments = cache.getComments(articleId);
  if (cachedComments) {
    onUpdate(cachedComments);
  } else {
    onUpdate(INITIAL_COMMENTS.filter(c => c.articleId === articleId));
  }

  fetchCommentsAndCache(articleId)
    .then((comments) => {
      onUpdate(comments);
    })
    .catch(() => {
      onUpdate(INITIAL_COMMENTS.filter(c => c.articleId === articleId));
    });

  return () => {};
}

/**
 * Menambahkan komentar baru ke dalam artikel di Firestore dan memori cache.
 */
export async function addCommentToFirestore(
  articleId: string,
  authorName: string,
  content: string,
  authorAvatarUrl?: string
): Promise<ArticleComment> {
  const generatedId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const newComment: ArticleComment = {
    id: generatedId,
    articleId,
    authorName,
    content,
    authorAvatarUrl: authorAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: Date.now(),
    likes: 0
  };

  // Tulis ke cache memori terlebih dahulu
  cache.addSingleComment(articleId, newComment);

  // Unggah dokumen ke Firestore
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, generatedId);
    await setDoc(docRef, newComment);
  } catch (error) {
    console.error('[Cache Layer] Gagal mengirimkan komentar ke Firestore:', error);
  }

  return newComment;
}

/**
 * Berlangganan ke data daftar user terdaftar.
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void): () => void {
  const localUsers = getStoredUsers();
  onUpdate(localUsers);

  fetchUsersAndCache()
    .then((users) => {
      onUpdate(users);
    })
    .catch(() => {
      onUpdate(getStoredUsers());
    });

  return () => {};
}
