import React, { useEffect, useState } from 'react';

interface HeaderProps {
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onToggleMobileMenu,
  isLightMode,
  onToggleTheme,
  onGoHome,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAdminPanel
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', value: null },
    { label: 'Sepak Bola', value: 'Sepak Bola' },
    { label: 'Piala Dunia 2026', value: 'Piala Dunia 2026' },
    { label: 'Prediksi Skor', value: 'prediksi skor' },
    { label: 'World Cup 2026', value: 'World Cup 2026' },
    { label: 'Kancah4D', value: 'Kancah4D' }
  ];

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="siteHeader">
      <div className="hdr-main">
        <a 
          className="logo-wrap cursor-pointer flex items-center" 
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
        >
          <img 
            alt="KANCAHTOTO" 
            src="https://ik.imagekit.io/dxokd3m9y/logokancah.png?updatedAt=1780809155541" 
            onError={(e) => {
              // fallback styling if image is missing
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
        </a>

        <nav className="desk-nav">
          {navItems.map((item, idx) => {
            const isActive = activeCategory === item.value;
            return (
              <a
                key={idx}
                className={`nav-a ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(item.value);
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="hdr-actions">
          {/* Admin Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenAdminPanel}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-d)] text-white font-extrabold text-[11px] flex items-center gap-1 sm:gap-1.5 shadow-[0_2px_10px_rgba(0,150,255,0.35)] transition-all"
              title="Buka Panel Admin Kancahtoto"
            >
              <i className="fas fa-edit" />
              <span className="hidden min-[400px]:inline">Panel Admin</span>
              <span className="min-[400px]:hidden">Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--card-h)] border border-[var(--border)] text-[var(--fg2)] hover:text-white font-bold text-[11px] flex items-center gap-1 sm:gap-1.5 transition-all"
              title="Login Admin Redaksi"
            >
              <i className="fas fa-user-shield text-[var(--accent)]" />
              <span className="hidden min-[360px]:inline">Admin</span>
            </button>
          )}

          <button 
            className="hdr-btn" 
            id="searchBtn"
            onClick={onOpenSearch}
            title="Cari Berita"
          >
            <i className="fas fa-search" />
          </button>
          
          <div 
            className="dm-sw" 
            id="themeToggle" 
            onClick={onToggleTheme}
            title={isLightMode ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"}
          />
          
          <button 
            className="hdr-btn lg:hidden flex" 
            id="mobOpen"
            onClick={onToggleMobileMenu}
            title="Menu Utama"
          >
            <i className="fas fa-bars" />
          </button>
        </div>
      </div>
    </header>
  );
};
