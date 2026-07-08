import React, { useState, useEffect, useRef } from 'react';
import { Article, ArticleComment } from '../types';
import { getArticleUrl } from '../utils/urlUtils';
import { subscribeArticleComments, addArticleCommentToDb } from '../services/dbService';
import { ArticleDetailSkeleton } from './SkeletonLoader';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  isLoading?: boolean;
}

const DEFAULT_COMMENTS: ArticleComment[] = [
  { name: 'Rian Bola', text: 'Prediksi mantap bang, semoga tembus Parlay malam ini!', date: '1 jam lalu' },
  { name: 'KancahPro', text: 'Analisis H2H sangat mendalam. Sukses terus KANCAHTOTO!', date: '3 jam lalu' }
];

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  onBack,
  relatedArticles,
  onSelectArticle,
  isLoading = false
}) => {
  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [comments, setComments] = useState<ArticleComment[]>(() => {
    try {
      const stored = localStorage.getItem(`kancahtoto_comments_${article.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading comments from localStorage:', e);
    }
    return DEFAULT_COMMENTS;
  });

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Load local comments first for fast render
    try {
      const stored = localStorage.getItem(`kancahtoto_comments_${article.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
        } else {
          setComments(DEFAULT_COMMENTS);
        }
      } else {
        setComments(DEFAULT_COMMENTS);
      }
    } catch (e) {
      console.error(e);
    }

    // Subscribe to Firestore for cloud sync
    const unsubscribe = subscribeArticleComments(article.id, (remoteComments) => {
      if (remoteComments.length > 0) {
        setComments((prev) => {
          const combined = [...remoteComments];
          prev.forEach((p) => {
            const exists = combined.some(
              (c) => c.text === p.text && c.name === p.name
            );
            if (!exists) {
              combined.push(p);
            }
          });
          try {
            localStorage.setItem(`kancahtoto_comments_${article.id}`, JSON.stringify(combined));
          } catch (err) {
            console.error(err);
          }
          return combined;
        });
      }
    });

    return () => unsubscribe();
  }, [article.id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment: ArticleComment = {
      id: Date.now().toString(),
      articleId: article.id,
      name: commentName.trim(),
      text: commentText.trim(),
      date: 'Baru saja',
      createdAt: Date.now()
    };

    const updated = [newComment, ...comments];
    setComments(updated);

    // Save immediately to localStorage
    try {
      localStorage.setItem(`kancahtoto_comments_${article.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save comment to localStorage:', e);
    }

    // Save to Firestore
    addArticleCommentToDb(article.id, {
      name: newComment.name,
      text: newComment.text,
      date: newComment.date
    });

    setCommentName('');
    setCommentText('');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Baca Berita KANCAHTOTO: ${article.title}`;

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: article.title,
        text: text,
        url: url
      }).catch(() => {});
      return;
    }

    if (platform === 'wa') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    } else if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'tg') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="item-post">
      {/* BACK BUTTON */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--fg2)] hover:text-[#fff] hover:border-[var(--accent)] transition-all text-xs font-bold"
        >
          <i className="fas fa-arrow-left text-[var(--accent)]" /> Kembali ke Berita
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent-l)] border border-[var(--accent)]/20">
          {article.category}
        </span>
      </div>

      <article>
        <div className="post-header">
          <span>
            <i className="far fa-user mr-1 text-[var(--accent)] opacity-70" /> {article.author}
          </span>
          <span>
            <i className="far fa-calendar mr-1 text-[var(--accent)] opacity-70" /> {article.date}
          </span>
          <span>
            <i className="far fa-eye mr-1 text-[var(--accent)] opacity-70" /> {article.views?.toLocaleString() ?? 1250}x dibaca
          </span>
        </div>

        <h1 className="post-title">{article.title}</h1>

        {/* TOP QUICK SHARE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-4 py-2 px-3 rounded-lg bg-[var(--bg2)] border border-[var(--border)] text-xs">
          <span className="text-[var(--fg3)] font-semibold flex items-center gap-1.5">
            <i className="fas fa-share-alt text-[var(--accent)]" /> Bagikan:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleShare('wa')}
              title="Bagikan ke WhatsApp"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all"
            >
              <i className="fab fa-whatsapp" /> WA
            </button>
            <button
              onClick={() => handleShare('fb')}
              title="Bagikan ke Facebook"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all"
            >
              <i className="fab fa-facebook" /> FB
            </button>
            <button
              onClick={() => handleShare('x')}
              title="Bagikan ke X / Twitter"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-black text-slate-200 hover:text-white border border-slate-700 text-[11px] font-bold transition-all"
            >
              <i className="fab fa-x-twitter" /> X
            </button>
            <button
              onClick={() => handleShare('tg')}
              title="Bagikan ke Telegram"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 text-[11px] font-bold transition-all"
            >
              <i className="fab fa-telegram-plane" /> Telegram
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                title="Bagikan via Aplikasi Lain"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 text-[11px] font-bold transition-all"
              >
                <i className="fas fa-share-nodes" /> Lainnya
              </button>
            )}
            <button
              onClick={() => handleShare('copy')}
              title="Salin Tautan Berita"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg3)] hover:bg-[var(--accent)] text-[var(--fg2)] hover:text-white border border-[var(--border)] text-[11px] font-bold transition-all"
            >
              <i className="fas fa-link" /> {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="my-6 rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] relative group cursor-zoom-in bg-[var(--bg2)]">
          <div className="w-full aspect-video sm:aspect-[16/9] overflow-hidden relative">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              onClick={() => setLightboxImg(article.image)}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = "https://ik.imagekit.io/dxokd3m9y/1b125f12-4ddf-426c-a226-a28d53f39340.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/90 flex items-center gap-1.5 shadow-lg pointer-events-none group-hover:bg-black/85 transition-all">
            <i className="fas fa-search-plus text-[var(--accent-l)]" />
            <span>Klik untuk memperbesar</span>
          </div>
        </div>

        {/* POST CONTENT */}
        <div 
          className="post-body entry-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* AUTHOR BIO CARD */}
        <div className="my-8 p-4 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none opacity-50" />
          
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent-l)] mb-4 flex items-center gap-1.5 font-display">
            <i className="fas fa-feather-alt text-xs" /> Tentang Penulis Berita
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* AVATAR */}
            <div className="relative flex-shrink-0">
              <img
                src={(article.authorAvatar && article.authorAvatar.trim() !== '' && !article.authorAvatar.includes('unsplash.com')) ? article.authorAvatar : 'https://ik.imagekit.io/dxokd3m9y/favicon.png'}
                alt={article.author}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain border-2 border-[var(--accent)]/40 shadow-md group-hover:scale-105 transition-transform duration-300 bg-[#0d0f14] p-2"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = 'https://ik.imagekit.io/dxokd3m9y/favicon.png';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center border-2 border-[var(--card)] shadow" title="Penulis Terverifikasi">
                <i className="fas fa-check" />
              </span>
            </div>

            {/* AUTHOR INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-base sm:text-lg font-extrabold text-[var(--fg)] font-display tracking-tight flex items-center gap-1.5">
                  {article.author}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent-l)] border border-[var(--accent)]/30">
                  {article.authorRole || 'Redaksi & Analis Kancahtoto'}
                </span>
              </div>

              <p className="text-xs text-[var(--fg2)] leading-relaxed mb-3">
                {article.authorBio || 'Penulis resmi KANCAHTOTO yang menyajikan analisis taktis, kabar seputar Piala Dunia 2026, serta prediksi olahraga yang presisi dan terpercaya.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--fg3)] pt-2 border-t border-[var(--border)]/60">
                <span className="flex items-center gap-1 font-semibold text-[var(--fg2)]">
                  <i className="fas fa-newspaper text-[var(--accent)]" /> 30+ Artikel Ditulis
                </span>
                <span className="text-[var(--border)]">•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <i className="fas fa-shield-alt" /> Terverifikasi KANCAHTOTO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SHARE BUTTONS */}
        <div className="my-8 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
          <div className="text-xs font-extrabold text-[var(--fg3)] uppercase tracking-widest mb-3.5 flex items-center gap-2 font-display">
            <i className="fas fa-share-alt text-[var(--accent)]" /> Bagikan Berita Ini Ke Media Sosial:
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
            <button
              onClick={() => handleShare('wa')}
              title="Bagikan ke WhatsApp"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
            >
              <i className="fab fa-whatsapp text-xs sm:text-sm" /> WA
            </button>
            <button
              onClick={() => handleShare('fb')}
              title="Bagikan ke Facebook"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
            >
              <i className="fab fa-facebook text-xs sm:text-sm" /> FB
            </button>
            <button
              onClick={() => handleShare('x')}
              title="Bagikan ke X"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-black text-slate-200 hover:text-white border border-slate-700 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
            >
              <i className="fab fa-x-twitter text-xs sm:text-sm" /> X
            </button>
            <button
              onClick={() => handleShare('tg')}
              title="Bagikan ke Telegram"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
            >
              <i className="fab fa-telegram-plane text-xs sm:text-sm" /> Telegram
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                title="Bagikan via Aplikasi Lain"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/15 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
              >
                <i className="fas fa-share-nodes text-xs sm:text-sm" /> Lainnya
              </button>
            )}
            <button
              onClick={() => handleShare('copy')}
              title="Salin Tautan"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg3)] hover:bg-[var(--accent)] text-[var(--fg)] hover:text-white border border-[var(--border)] text-[11px] sm:text-xs font-bold transition-all shadow-sm"
            >
              <i className="fas fa-link text-xs sm:text-sm" /> {copied ? 'Disalin' : 'Salin'}
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="my-10 p-4 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
          <h3 className="text-lg font-bold font-display text-[var(--fg)] mb-6 flex items-center gap-2">
            <i className="far fa-comments text-[var(--accent)]" /> Komentar ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="mb-8 space-y-3">
            <input
              type="text"
              placeholder="Nama Anda"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-all"
            />
            <textarea
              rows={3}
              placeholder="Tulis pendapat atau tanggapan Anda..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
            >
              <i className="fas fa-paper-plane" /> Kirim Komentar
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((cmt, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--fg)]">{cmt.name}</span>
                  <span className="text-[10px] text-[var(--fg3)]">{cmt.date}</span>
                </div>
                <p className="text-xs text-[var(--fg2)] leading-relaxed">{cmt.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RELATED ARTICLES CAROUSEL */}
        {relatedArticles.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-[var(--fg)] flex items-center gap-2">
                <i className="fas fa-layer-group text-[var(--accent)] text-sm" /> Berita Terkait Lainnya
              </h3>
              {relatedArticles.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="w-8 h-8 rounded-lg bg-[var(--bg2)] hover:bg-[var(--accent)] text-[var(--fg2)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-all shadow-sm active:scale-95"
                    title="Geser Kiri"
                    type="button"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="w-8 h-8 rounded-lg bg-[var(--bg2)] hover:bg-[var(--accent)] text-[var(--fg2)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-all shadow-sm active:scale-95"
                    title="Geser Kanan"
                    type="button"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={carouselRef}
              className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1 -mx-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedArticles.slice(0, 8).map((rel) => (
                <a
                  key={rel.id}
                  href={getArticleUrl(rel)}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      onSelectArticle(rel);
                    }
                  }}
                  className="snap-start flex-shrink-0 w-[220px] sm:w-[250px] p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/60 cursor-pointer transition-all hover:shadow-lg group flex flex-col justify-between text-inherit no-underline"
                >
                  <div>
                    <div className="w-full aspect-[16/10] rounded-lg overflow-hidden relative mb-2.5 bg-[var(--bg2)]">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-[var(--accent-l)] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-[var(--accent)]/30">
                        {rel.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--fg)] line-clamp-2 leading-snug group-hover:text-[var(--accent-l)] transition-colors mb-1">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--fg3)] pt-2 border-t border-[var(--border)]/50 mt-2">
                    <span><i className="far fa-clock mr-1 text-[var(--accent)]/70" />{rel.date}</span>
                    <span className="text-[var(--accent-l)] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Baca <i className="fas fa-arrow-right text-[8px]" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Enlarged"
            className="max-w-[92vw] max-h-[92vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
