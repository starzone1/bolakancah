import React, { useState } from 'react';
import { Article } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? articles.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.summary.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase()) ||
        a.labels.some(l => l.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className={`sovl ${isOpen ? 'open' : ''}`} id="searchOvl">
      <div className="sovl-inner">
        <button className="sovl-close" id="sovlClose" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            autoComplete="off"
            name="q"
            placeholder="Ketik dan tekan Enter..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>

        {query.trim() && (
          <div className="mt-8 max-h-[50vh] overflow-y-auto space-y-3 pr-2">
            <div className="text-xs font-bold uppercase text-[var(--fg3)] tracking-wider mb-2">
              Hasil Pencarian ({results.length}):
            </div>
            {results.length === 0 ? (
              <div className="text-center py-6 text-[var(--fg3)] text-sm">
                Tidak ada berita ditemukan dengan kata kunci "{query}".
              </div>
            ) : (
              results.map(article => (
                <div
                  key={article.id}
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                    setQuery('');
                  }}
                  className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all flex gap-3 items-center"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--accent-l)]">
                      {article.category}
                    </span>
                    <h4 className="text-xs font-semibold text-[var(--fg)] line-clamp-1">
                      {article.title}
                    </h4>
                    <p className="text-[11px] text-[var(--fg3)] line-clamp-1">
                      {article.date}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
