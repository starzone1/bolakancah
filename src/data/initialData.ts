import { Article, ArticleComment, User } from '../types';
import { mockArticles } from './mockNews';

export const INITIAL_ARTICLES: Article[] = mockArticles;

export const INITIAL_COMMENTS: ArticleComment[] = [
  {
    id: 'comment-1',
    articleId: '1',
    name: 'Budi Santoso',
    text: 'Sangat membantu informasinya! Kancah4d emang mantap.',
    date: '02 Juli 2026',
    createdAt: Date.now() - 3600000,
    authorName: 'Budi Santoso',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    likes: 12
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Admin Redaksi',
    email: 'admin@kancah4d.com',
    role: 'administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  }
];
