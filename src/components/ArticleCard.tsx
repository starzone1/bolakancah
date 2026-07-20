import React from 'react';
import { Article } from '../types';
import { getArticleUrl } from '../utils/urlUtils';
import { ArticleCardSkeleton } from './SkeletonLoader';

interface ArticleCardProps {
  article?: Article;
  isFeatured?: boolean;
  onSelect?: (article: Article) => void;
  onSelectCategory?: (category: string) => void;
  isLoading?: boolean;
}

export { ArticleCardSkeleton };

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isFeatured = false,
  onSelect,
  onSelectCategory,
  isLoading = false
}) => {
  if (isLoading || !article) {
    return <ArticleCardSkeleton isFeatured={isFeatured} />;
  }

  const articleUrl = getArticleUrl(article);

  return (
    <a 
      href={articleUrl}
      className={`index-card ${isFeatured ? 'featured-card' : ''} block text-inherit no-underline`}
      onClick={(e) => {
        // Prevent full page reload if left click without ctrl/cmd key
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          onSelect(article);
        }
      }}
    >
      <div className="ic-img relative">
        <img 
          alt={article.title} 
          src={article.image || "https://ik.imagekit.io/dxokd3m9y/1b125f12-4ddf-426c-a226-a28d53f39340.png"} 
          loading="lazy"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = "https://ik.imagekit.io/dxokd3m9y/1b125f12-4ddf-426c-a226-a28d53f39340.png";
          }}
        />
        {isFeatured && (
          <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 border border-[var(--accent-l)]/30">
            <i className="fas fa-star text-[9px]" /> Berita Utama
          </span>
        )}
      </div>
      
      <div className="ic-body">
        {article.labels && article.labels.length > 0 && (
          <span 
            className="chip cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectCategory) {
                onSelectCategory(article.labels[0]);
              }
            }}
          >
            {article.labels[0]}
          </span>
        )}
        
        <h3 className="ic-title">{article.title}</h3>

        <p className="text-xs text-[var(--fg2)] mt-2 line-clamp-2 hidden sm:block leading-relaxed">
          {article.summary}
        </p>

        <div className="ic-meta flex items-center gap-2 text-[11px] text-[var(--fg3)] pt-3 border-t border-[var(--border)]/40 mt-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            {article.authorAvatar && article.authorAvatar.trim() !== '' ? (
              <img 
                src={article.authorAvatar}
                alt={article.Author || article.author || article.authorName || 'Author'}
                className="w-5 h-5 rounded-full object-cover border border-[var(--border)] flex-shrink-0"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--bg3)] border border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--accent-l)] flex-shrink-0">
                <i className="fas fa-user-circle text-[11px]" />
              </div>
            )}
            <span className="font-semibold text-[var(--fg)] truncate max-w-[120px]" title={article.Author || article.author || article.authorName || 'Redaksi'}>
              {article.Author || article.author || article.authorName || 'Redaksi'}
            </span>
          </div>
          
          <span className="ic-meta-dot flex-shrink-0" />
          <span className="truncate flex-shrink-0">{article.date}</span>
          
          {article.views !== undefined && (
            <>
              <span className="ic-meta-dot flex-shrink-0" />
              <span className="flex-shrink-0 font-mono">
                <i className="far fa-eye mr-0.5 text-[var(--accent)]" /> 
                {article.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  );
};
