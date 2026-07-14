import { Article, User } from '../types';

const ARTICLES_KEY = 'kancah4d_stored_articles';
const USERS_KEY = 'kancah4d_stored_users';

/**
 * Safely saves articles to LocalStorage
 */
export function saveArticles(articles: Article[]): void {
  try {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  } catch (error) {
    console.warn('[Storage] Gagal menyimpan artikel ke LocalStorage:', error);
  }
}

/**
 * Safely retrieves articles from LocalStorage
 */
export function getStoredArticles(): Article[] {
  try {
    const data = localStorage.getItem(ARTICLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('[Storage] Gagal membaca artikel dari LocalStorage:', error);
    return [];
  }
}

/**
 * Safely retrieves users from LocalStorage
 */
export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('[Storage] Gagal membaca user dari LocalStorage:', error);
    return [];
  }
}

/**
 * Safely saves or updates a single user in LocalStorage
 */
export function saveStoredUser(user: User): void {
  try {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('[Storage] Gagal menyimpan user ke LocalStorage:', error);
  }
}
