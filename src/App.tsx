import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { mockArticles, mockCategories, mockFixtures } from './data/mockNews';
import { Article, Fixture, ModalType } from './types';
import { 
  getArticleUrl, 
  findArticleFromPath, 
  findCategoryFromPath, 
  slugify,
  getAppBasePath
} from './utils/urlUtils';
import { updateSeoMeta } from './utils/seoUtils';
import { 
  subscribeArticles, 
  subscribeFixtures, 
  seedInitialArticlesIfEmpty, 
  seedInitialFixturesIfEmpty,
  saveArticleToDb, 
  updateArticleInDb, 
  deleteArticleFromDb, 
  saveFixtureToDb, 
  updateFixtureInDb, 
  deleteFixtureFromDb,
  saveSitemapToDb
} from './services/dbService';
import { generateSitemapXml } from './utils/generateSitemap';

import { Header } from './components/Header';
import { MobileMenu } from './components/MobileMenu';
import { SearchOverlay } from './components/SearchOverlay';
import { WelcomePopup } from './components/WelcomePopup';
import { Modals } from './components/Modals';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { ArticleGridSkeleton, ArticleDetailSkeleton } from './components/SkeletonLoader';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { WriterWorkspace } from './components/WriterWorkspace';

export default function App() {
  // Articles state initialized with fallback mock, synced via Firestore
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [isArticlesLoading, setIsArticlesLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Fixtures / Predictions state initialized with fallback mock, synced via Firestore
  const [fixtures, setFixtures] = useState<Fixture[]>(mockFixtures);

  // Initialize and Subscribe to Firestore Real-Time DB Sync
  useEffect(() => {
    // Seed initial collections if empty in Firestore
    seedInitialArticlesIfEmpty(mockArticles);
    seedInitialFixturesIfEmpty(mockFixtures);

    // Subscribe to live articles updates across all devices
    const unsubscribeArticles = subscribeArticles((remoteArticles) => {
      setArticles(remoteArticles);
      setIsArticlesLoading(false);
    }, (err) => {
      console.error('Articles sync error:', err);
      setIsArticlesLoading(false);
    });

    // Subscribe to live fixtures updates across all devices
    const unsubscribeFixtures = subscribeFixtures((remoteFixtures) => {
      setFixtures(remoteFixtures);
    }, (err) => {
      console.error('Fixtures sync error:', err);
    });

    return () => {
      unsubscribeArticles();
      unsubscribeFixtures();
    };
  }, []);

  // Admin Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kancah_admin_session') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelDefaultTab, setAdminPanelDefaultTab] = useState<'create' | 'manage' | 'fixtures' | 'stats'>('create');

  // currentView can be 'reader' or 'writer'
  const [currentView, setCurrentView] = useState<'reader' | 'writer'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    const isWrite = pathname.includes('/tulis') || 
                    pathname.includes('/write') || 
                    pathname.includes('/editor') || 
                    pathname.includes('/admin') ||
                    searchParams.get('mode') === 'tulis' ||
                    searchParams.get('write') === 'true';
    return isWrite ? 'writer' : 'reader';
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [displayCount, setDisplayCount] = useState(7);

  // Sync theme with body class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light');
    }
  }, []);

  const handleToggleTheme = () => {
    const newLight = !isLightMode;
    setIsLightMode(newLight);
    if (newLight) {
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Admin Handlers linked directly to Cloud Database
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('kancah_admin_session', 'true');
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('kancah_admin_session');
    setIsAdminPanelOpen(false);
  };

  const handleAddArticle = async (newArticleData: Omit<Article, 'id'>) => {
    const newArticle: Article = {
      ...newArticleData,
      id: `art-${Date.now()}`
    };
    // Optimistic update
    const updatedArticles = [newArticle, ...articles];
    setArticles(updatedArticles);
    // Save to Cloud Database (Auto-sync to all devices)
    await saveArticleToDb(newArticle);
    // Auto-update sitemap in database
    try {
      const sitemapXml = generateSitemapXml(updatedArticles);
      await saveSitemapToDb(sitemapXml);
    } catch (err) {
      console.error('Failed to auto-update sitemap:', err);
    }
  };

  const handleUpdateArticle = async (updatedArticle: Article) => {
    // Optimistic update
    const updatedArticles = articles.map((art) => (art.id === updatedArticle.id ? updatedArticle : art));
    setArticles(updatedArticles);
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(updatedArticle);
    }
    // Update Cloud Database (Auto-sync to all devices)
    await updateArticleInDb(updatedArticle);
    // Auto-update sitemap in database
    try {
      const sitemapXml = generateSitemapXml(updatedArticles);
      await saveSitemapToDb(sitemapXml);
    } catch (err) {
      console.error('Failed to auto-update sitemap:', err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    // Optimistic update
    const updatedArticles = articles.filter((art) => art.id !== id);
    setArticles(updatedArticles);
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
    }
    // Delete from Cloud Database (Auto-sync to all devices)
    await deleteArticleFromDb(id);
    // Auto-update sitemap in database
    try {
      const sitemapXml = generateSitemapXml(updatedArticles);
      await saveSitemapToDb(sitemapXml);
    } catch (err) {
      console.error('Failed to auto-update sitemap:', err);
    }
  };

  const handleAddFixture = async (newFixtureData: Omit<Fixture, 'id'>) => {
    const newFix: Fixture = {
      ...newFixtureData,
      id: `fix-${Date.now()}`
    };
    // Optimistic update
    setFixtures((prev) => [newFix, ...prev]);
    // Save to Cloud Database
    await saveFixtureToDb(newFix);
  };

  const handleUpdateFixture = async (updatedFixture: Fixture) => {
    // Optimistic update
    setFixtures((prev) =>
      prev.map((fix) => (fix.id === updatedFixture.id ? updatedFixture : fix))
    );
    // Update Cloud Database
    await updateFixtureInDb(updatedFixture);
  };

  const handleDeleteFixture = async (id: string) => {
    // Optimistic update
    setFixtures((prev) => prev.filter((fix) => fix.id !== id));
    // Delete from Cloud Database
    await deleteFixtureFromDb(id);
  };

  // Available Categories (combines mock and newly posted categories, limited to 5 strong keywords)
  const categoryNames = Array.from(
    new Set([
      ...mockCategories.map((c) => c.name),
      ...articles.map((a) => a.category)
    ])
  );

  const dynamicCategories = categoryNames.map((name) => {
    const count = articles.filter(
      (a) =>
        a.category.toLowerCase() === name.toLowerCase() ||
        a.labels?.some((l) => l.toLowerCase() === name.toLowerCase())
    ).length;
    return { name, count };
  }).slice(0, 5);

  // Filter articles based on active category
  const filteredArticles = activeCategory
    ? articles.filter(
        (a) =>
          a.category.toLowerCase() === activeCategory.toLowerCase() ||
          a.labels?.some((l) => l.toLowerCase() === activeCategory.toLowerCase())
      )
    : articles;

  const visibleArticles = filteredArticles.slice(0, displayCount);
  const hasMore = visibleArticles.length < filteredArticles.length;

  // Update dynamic SEO & Schema metadata whenever route state changes
  useEffect(() => {
    updateSeoMeta({
      article: selectedArticle,
      category: activeCategory
    });
  }, [selectedArticle, activeCategory]);

  // Handle initial URL sync & popstate (browser back/forward buttons)
  useEffect(() => {
    const syncFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;

      // 1. Check for write/editor route
      const base = getAppBasePath();
      let relativePath = pathname;
      if (base && pathname.startsWith(base)) {
        relativePath = pathname.substring(base.length);
      }
      const pathSegments = relativePath.split('/').filter(Boolean);
      const isWriterRoute = pathSegments.length > 0 && ['tulis', 'write', 'editor', 'admin'].includes(pathSegments[0]);

      if (
        isWriterRoute ||
        searchParams.get('mode') === 'tulis' ||
        searchParams.get('write') === 'true'
      ) {
        setCurrentView('writer');
        setSelectedArticle(null);
        setActiveCategory(null);
        updateSeoMeta({
          category: 'Portal Penulis'
        });
        return;
      }

      // 2. Try to find article from URL path (e.g. /2026/07/judul-artikel.html or ?article=id)
      const matchedArticle = findArticleFromPath(pathname, articles, searchParams);
      if (matchedArticle) {
        setSelectedArticle(matchedArticle);
        setCurrentView('reader');
        updateSeoMeta({ article: matchedArticle });
        return;
      }

      // 3. Try to find category from URL path (e.g. /kategori/sepak-bola or ?cat=sepak-bola)
      const matchedCat = findCategoryFromPath(pathname, searchParams);
      if (matchedCat) {
        setSelectedArticle(null);
        setActiveCategory(matchedCat);
        setCurrentView('reader');
        updateSeoMeta({ category: matchedCat });
        return;
      }

      // 4. Fallback: home page
      setSelectedArticle(null);
      setActiveCategory(null);
      setCurrentView('reader');
      updateSeoMeta({});
    };

    syncFromUrl();

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [articles]);

  const handleSelectCategory = (cat: string | null) => {
    setIsArticlesLoading(true);
    setActiveCategory(cat);
    setSelectedArticle(null);
    setCurrentView('reader');
    setDisplayCount(7);
    const base = getAppBasePath();
    if (cat) {
      const catSlug = slugify(cat);
      window.history.pushState({ cat }, '', `${base}/kategori/${catSlug}`);
      updateSeoMeta({ category: cat });
    } else {
      window.history.pushState({}, '', `${base}/` || '/');
      updateSeoMeta({});
    }
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsArticlesLoading(false);
    }, 200);
  };

  const handleSelectArticle = (art: Article) => {
    setIsDetailLoading(true);
    setSelectedArticle(art);
    setCurrentView('reader');
    const cleanUrl = getArticleUrl(art);
    window.history.pushState({ articleId: art.id }, '', cleanUrl);
    updateSeoMeta({ article: art });
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsDetailLoading(false);
    }, 200);
  };

  const handleGoHome = () => {
    setIsArticlesLoading(true);
    setActiveCategory(null);
    setSelectedArticle(null);
    setCurrentView('reader');
    setDisplayCount(7);
    const base = getAppBasePath();
    window.history.pushState({}, '', `${base}/` || '/');
    updateSeoMeta({});
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsArticlesLoading(false);
    }, 200);
  };

  const handleGoToWriter = () => {
    setCurrentView('writer');
    setSelectedArticle(null);
    setActiveCategory(null);
    const base = getAppBasePath();
    window.history.pushState({}, '', `${base}/tulis`);
    updateSeoMeta({ category: 'Portal Penulis' });
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* Ambient Background Orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb o1" />
        <div className="ambient-orb o2" />
      </div>

      {/* Startup Welcome Popup */}
      <WelcomePopup />

      {/* Page Modals (About, Contact, Privacy, Disclaimer) */}
      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Control Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        articles={articles}
        onAddArticle={handleAddArticle}
        onUpdateArticle={handleUpdateArticle}
        onDeleteArticle={handleDeleteArticle}
        fixtures={fixtures}
        onAddFixture={handleAddFixture}
        onUpdateFixture={handleUpdateFixture}
        onDeleteFixture={handleDeleteFixture}
        onLogout={handleAdminLogout}
        categories={categoryNames}
        defaultTab={adminPanelDefaultTab}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={handleSelectArticle}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleGoToWriter}
        onOpenAdminPanel={handleGoToWriter}
      />

      {/* Site Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
        onGoHome={handleGoHome}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleGoToWriter}
        onOpenAdminPanel={handleGoToWriter}
      />

      {/* Main Container */}
      <div className="site-content flex-1">
        {currentView === 'writer' ? (
          <WriterWorkspace
            articles={articles}
            onAddArticle={handleAddArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            categories={categoryNames}
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginSuccess={handleAdminLoginSuccess}
            onGoToPortal={handleGoHome}
            onOpenAdminPanel={() => {
              setAdminPanelDefaultTab('fixtures');
              setIsAdminPanelOpen(true);
            }}
          />
        ) : (
          <div className="main-wrap">
            {/* CONTENT COLUMN */}
            <div className="content-col">
              {/* RUNNING TEXT / TICKER PREDIKSI SKOR HARIAN (Persistent on all pages, highly readable, unified single-color style) */}
              {fixtures && fixtures.length > 0 && (
                <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 mb-6 overflow-hidden flex items-center gap-3 shadow-lg shadow-black/10 select-none">
                  <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-1.5 rounded-lg shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                    </span>
                    <i className="fas fa-bullhorn text-xs animate-bounce" />
                  </div>
                  <div className="w-full overflow-hidden flex items-center">
                    <marquee 
                      scrollamount="4" 
                      onMouseOver={(e) => (e.currentTarget as any).stop()} 
                      onMouseOut={(e) => (e.currentTarget as any).start()}
                      className="text-cyan-400 text-xs font-black uppercase tracking-wider"
                    >
                      <span className="inline-flex items-center gap-10 whitespace-nowrap">
                        {fixtures.map((fix, index) => (
                          <span key={fix.id || index} className="inline-flex items-center gap-2 text-cyan-400 text-xs font-black">
                            <span className="text-[9px] font-black text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded uppercase font-mono tracking-widest">
                              {fix.league}
                            </span>
                            <span>
                              {fix.homeTeam} {fix.homeScore !== undefined && fix.homeScore !== null ? fix.homeScore : ''} - {fix.awayScore !== undefined && fix.awayScore !== null ? fix.awayScore : ''} {fix.awayTeam}
                            </span>
                            <span className="opacity-40">|</span>
                            <span className="flex items-center gap-1 font-black">
                              <i className="fas fa-magic text-[10px]" /> PREDIKSI: {fix.prediction}
                            </span>
                            {fix.odds && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="font-black">ODDS: {fix.odds}</span>
                              </>
                            )}
                            <span className="text-[10px] opacity-75 font-mono">({fix.matchDate})</span>
                            {index < fixtures.length - 1 && (
                              <span className="ml-6 font-bold opacity-50">★★★</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </marquee>
                  </div>
                </div>
              )}

              <LayoutGroup id="page-route-transitions">
                <AnimatePresence mode="wait">
                  {selectedArticle ? (
                    /* SINGLE ARTICLE READER VIEW */
                    <motion.div
                      key={`art-${selectedArticle.id}`}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ArticleDetail
                        article={selectedArticle}
                        onBack={handleGoHome}
                        relatedArticles={articles.filter((a) => a.id !== selectedArticle.id)}
                        onSelectArticle={handleSelectArticle}
                        isLoading={isDetailLoading}
                      />
                    </motion.div>
                  ) : (
                    /* ARTICLES LIST VIEW */
                    <motion.div
                      key={`cat-${activeCategory || 'home'}`}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* ACTIVE CATEGORY / BREADCRUMB BADGE */}
                      {activeCategory && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--fg3)] font-semibold">Kategori:</span>
                            <span className="text-sm font-extrabold text-[var(--accent-l)] font-display uppercase tracking-wider">
                              {activeCategory}
                            </span>
                            <span className="text-xs text-[var(--fg4)] font-mono ml-2">
                              ({filteredArticles.length} berita)
                            </span>
                          </div>
                          <button
                            onClick={handleGoHome}
                            className="text-xs text-[var(--fg3)] hover:text-white flex items-center gap-1 font-bold"
                          >
                            <i className="fas fa-times" /> Hapus Filter
                          </button>
                        </div>
                      )}



                      {isArticlesLoading ? (
                        <ArticleGridSkeleton count={displayCount} />
                      ) : filteredArticles.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                          <i className="fas fa-newspaper text-4xl text-[var(--fg4)] mb-3 block" />
                          <h3 className="text-sm font-bold text-[var(--fg)] mb-1">
                            Belum Ada Berita Dalam Kategori Ini
                          </h3>
                          <p className="text-xs text-[var(--fg3)] mb-4">
                            Silakan pilih kategori lain atau buat berita baru via Panel Admin.
                          </p>
                          <button
                            onClick={handleGoHome}
                            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold"
                          >
                            Lihat Semua Berita
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="index-post-grid">
                            {visibleArticles.map((article, idx) => (
                              <ArticleCard
                                key={article.id}
                                article={article}
                                isFeatured={idx === 0 && !activeCategory && article.featured}
                                onSelect={handleSelectArticle}
                                onSelectCategory={handleSelectCategory}
                              />
                            ))}
                          </div>

                          {/* BLOG PAGER / SHOW MORE */}
                          {hasMore && (
                            <div id="blog-pager">
                              <button
                                onClick={() => setDisplayCount((prev) => prev + 6)}
                                className="hover:scale-105"
                              >
                                Muat Berita Lebih Banyak <i className="fas fa-chevron-down ml-1" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            </div>

            {/* SIDEBAR COLUMN */}
            <Sidebar
              categories={dynamicCategories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              fixtures={fixtures}
              onOpenModal={(type) => setActiveModal(type)}
            />
          </div>
        )}
      </div>

      {/* Site Footer */}
      <Footer
        onOpenModal={(type) => setActiveModal(type)}
        onSelectCategory={handleSelectCategory}
        onGoHome={handleGoHome}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleGoToWriter}
        onOpenAdminPanel={handleGoToWriter}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}

