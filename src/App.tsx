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
  deleteFixtureFromDb 
} from './services/dbService';

import { Header } from './components/Header';
import { MobileMenu } from './components/MobileMenu';
import { SearchOverlay } from './components/SearchOverlay';
import { WelcomePopup } from './components/WelcomePopup';
import { Modals } from './components/Modals';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { ArticleGridSkeleton, ArticleDetailSkeleton } from './components/SkeletonLoader';
import { Sidebar } from './components/Sidebar';
import { MatchPredictorWidget } from './components/MatchPredictorWidget';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';

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
    setArticles((prev) => [newArticle, ...prev]);
    // Save to Cloud Database (Auto-sync to all devices)
    await saveArticleToDb(newArticle);
  };

  const handleUpdateArticle = async (updatedArticle: Article) => {
    // Optimistic update
    setArticles((prev) =>
      prev.map((art) => (art.id === updatedArticle.id ? updatedArticle : art))
    );
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(updatedArticle);
    }
    // Update Cloud Database (Auto-sync to all devices)
    await updateArticleInDb(updatedArticle);
  };

  const handleDeleteArticle = async (id: string) => {
    // Optimistic update
    setArticles((prev) => prev.filter((art) => art.id !== id));
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
    }
    // Delete from Cloud Database (Auto-sync to all devices)
    await deleteArticleFromDb(id);
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

      // 1. Try to find article from URL path (e.g. /2026/07/judul-artikel.html or ?article=id)
      const matchedArticle = findArticleFromPath(pathname, articles, searchParams);
      if (matchedArticle) {
        setSelectedArticle(matchedArticle);
        updateSeoMeta({ article: matchedArticle });
        return;
      }

      // 2. Try to find category from URL path (e.g. /kategori/sepak-bola or ?cat=sepak-bola)
      const matchedCat = findCategoryFromPath(pathname, searchParams);
      if (matchedCat) {
        setSelectedArticle(null);
        setActiveCategory(matchedCat);
        updateSeoMeta({ category: matchedCat });
        return;
      }

      // 3. Fallback: home page
      setSelectedArticle(null);
      setActiveCategory(null);
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
    setDisplayCount(7);
    const base = getAppBasePath();
    window.history.pushState({}, '', `${base}/` || '/');
    updateSeoMeta({});
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsArticlesLoading(false);
    }, 200);
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
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
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
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Container */}
      <div className="site-content flex-1">
        <div className="main-wrap">
          {/* CONTENT COLUMN */}
          <div className="content-col">
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

                    {/* AI MATCH PREDICTOR WIDGET (Hero feature on home) */}
                    {!activeCategory && <MatchPredictorWidget />}

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
      </div>

      {/* Site Footer */}
      <Footer
        onOpenModal={(type) => setActiveModal(type)}
        onSelectCategory={handleSelectCategory}
        onGoHome={handleGoHome}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}

