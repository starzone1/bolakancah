import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAdminPanel
}) => {
  const categories = [
    { label: 'Home', value: null, icon: 'fas fa-home' },
    { label: 'Sepak Bola', value: 'Sepak Bola', icon: 'fas fa-futbol' },
    { label: 'Piala Dunia 2026', value: 'Piala Dunia 2026', icon: 'fas fa-trophy' },
    { label: 'Prediksi Skor', value: 'prediksi skor', icon: 'fas fa-chart-line' },
    { label: 'World Cup 2026', value: 'World Cup 2026', icon: 'fas fa-globe' },
    { divider: true },
    { label: 'Kancah4D Official', value: 'Kancah4D', icon: 'fas fa-gem' },
    { label: 'Slot Gacor Kancahtoto', value: 'Slot Gacor', icon: 'fas fa-star' },
    { label: 'Tips Menang Kancahtoto', value: 'Tips Menang Kancahtoto', icon: 'fas fa-lightbulb' },
    { label: 'Bukti Jackpot', value: 'Bukti Jackpot', icon: 'fas fa-gift' },
    { label: 'Daftar Kancahtoto', value: 'Daftar Kancahtoto', icon: 'fas fa-shield-alt' },
    { label: 'Game Populer 2026', value: 'Game Populer 2026', icon: 'fas fa-gamepad' }
  ];

  return (
    <>
      <div 
        className={`mob-bk ${isOpen ? 'open' : ''}`} 
        id="mobBk"
        onClick={onClose}
      />
      <nav className={`mob-menu ${isOpen ? 'open' : ''}`} id="mobMenu">
        <div className="mob-inner">
          <div className="mob-head">
            <img 
              alt="KANCAHTOTO" 
              src="https://ik.imagekit.io/dxokd3m9y/logokancah.png?updatedAt=1780809155541" 
              style={{ height: '30px', width: 'auto' }}
            />
            <button className="mob-close" id="mobClose" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>

          {categories.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="mob-divider" />;
            }
            const isActive = activeCategory === item.value;
            return (
              <a
                key={idx}
                className={`mob-a ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectCategory(item.value ?? null);
                  onClose();
                }}
              >
                <i className={item.icon} /> {item.label}
              </a>
            );
          })}

          <div className="mob-divider" />
          
          {/* SOCIAL MEDIA SECTION */}
          <div className="px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg3)] block mb-2">
              Media Sosial Resmi
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://shortq.site/Official-Center-KANCAH4D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                title="WhatsApp"
              >
                <i className="fab fa-whatsapp text-sm" />
              </a>
              <a
                href="https://www.facebook.com/kancah4dteams/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                title="Facebook"
              >
                <i className="fab fa-facebook-f text-sm" />
              </a>
              <a
                href="https://x.com/kancah4d1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg bg-slate-500/10 hover:bg-black border border-slate-600/40 text-slate-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                title="Twitter / X"
              >
                <i className="fab fa-x-twitter text-sm" />
              </a>
              <a
                href="https://t.me/OficialKancah4D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500 border border-sky-400/30 text-sky-400 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                title="Telegram"
              >
                <i className="fab fa-telegram text-sm" />
              </a>
            </div>
          </div>

          <div className="mob-divider" />
          
          <a
            className="mob-a text-[var(--accent-l)] font-bold"
            onClick={() => {
              onClose();
              if (isAdminLoggedIn) {
                onOpenAdminPanel();
              } else {
                onOpenAdminLogin();
              }
            }}
          >
            <i className="fas fa-user-shield text-[var(--accent)]" />
            {isAdminLoggedIn ? 'Panel Admin Redaksi' : 'Login Admin Posting Artikel'}
          </a>
        </div>
      </nav>
    </>
  );
};
