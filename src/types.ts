export interface Article {
  id: string;
  title: string;
  category?: string;
  labels?: string[];
  author?: string;
  Author?: string;
  authorAvatar?: string;
  authorBio?: string;
  authorRole?: string;
  date?: string;
  image?: string;
  summary?: string;
  content?: string;
  featured?: boolean;
  views?: number;
  commentsCount?: number;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  imageUrl?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
}

export type ModalType = 'about' | 'contact' | 'privacy' | 'disclaimer' | null;

export interface Fixture {
  id: string;
  homeTeam: string;
  homeLogo?: string;
  awayTeam: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  matchDate: string;
  league: string;
  prediction: string;
  odds?: string;
  status: 'Live' | 'Upcoming' | 'Finished';
}

export interface CategoryInfo {
  name: string;
  count: number;
}

export interface ArticleComment {
  id?: string;
  articleId?: string;
  name?: string;
  text?: string;
  date?: string;
  createdAt?: number;
  authorName?: string;
  authorAvatarUrl?: string;
  likes?: number;
  content?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export type Category = string;


