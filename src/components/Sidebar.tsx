import React from 'react';
import { motion, LayoutGroup } from 'motion/react';
import { CategoryInfo, Fixture } from '../types';

interface SidebarProps {
  categories: CategoryInfo[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  fixtures: Fixture[];
  onOpenModal: (type: 'about' | 'contact' | 'privacy' | 'disclaimer') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  fixtures,
  onOpenModal
}) => {
  const totalArticlesCount = categories.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="sidebar-col">
      {/* VVIP QUICK ACTION BANNER */}
      <div className="sb-card p-4 bg-gradient-to-br from-[var(--card)] to-[#081828] border border-[var(--accent)]/30 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="https://ik.imagekit.io/dxokd3m9y/favicon.png" 
            alt="KANCAHTOTO VVIP" 
            className="w-9 h-9 object-contain rounded-lg p-1 bg-[var(--accent-glow)] border border-[var(--accent)]/30 shadow-md"
          />
          <span className="text-xs font-bold text-[var(--fg)] tracking-wide font-display uppercase">
            KANCAHTOTO ID VVIP
          </span>
        </div>
        <p className="text-[11px] text-[var(--fg3)] mb-3 leading-relaxed">
          Dapatkan prioritas transaksi 24/7, layanan VVIP eksklusif, & akses fitur prediksi eksklusif!
        </p>
        <a
          href="https://akseslink.com/kancah4d"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 transition-all text-center"
        >
          <i className="fa-solid fa-link" /> Daftar ID VVIP Kancah4D
        </a>
      </div>

      {/* CATEGORIES WIDGET WITH FRAMER-MOTION SMOOTH TRANSITION */}
      <div className="sb-card">
        <div className="sb-tt flex items-center justify-between">
          <span className="flex items-center gap-2">
            <i className="fas fa-layer-group text-[var(--accent)]" /> KATEGORI
          </span>
          {activeCategory && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSelectCategory(null)}
              className="text-[10px] text-[var(--accent-l)] hover:underline flex items-center gap-1 font-semibold"
              title="Tampilkan Semua Berita"
            >
              <i className="fas fa-rotate-left text-[9px]" /> Reset Filter
            </motion.button>
          )}
        </div>

        <LayoutGroup id="sidebar-category-filter">
          <div className="sidebar-label-list relative space-y-1">
            {/* ALL TOPICS BUTTON */}
            <motion.a
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className={`sidebar-label-item relative overflow-hidden transition-colors ${
                activeCategory === null ? 'active text-[var(--fg)] font-bold' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(null);
              }}
            >
              {/* Shared sliding active background pill */}
              {activeCategory === null && (
                <motion.div
                  layoutId="sidebarActiveBgPill"
                  className="absolute inset-0 bg-[var(--accent-glow-s)] border-l-4 border-[var(--accent)] rounded-lg z-0 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <span className="label-name-wrap relative z-10 flex items-center gap-2">
                <motion.span
                  animate={{
                    scale: activeCategory === null ? [1, 1.3, 1] : 1,
                    backgroundColor: activeCategory === null ? 'var(--accent)' : 'var(--fg4)',
                  }}
                  transition={{ duration: 0.25 }}
                  className="label-dot"
                />
                <span>Semua Topik</span>
              </span>

              <motion.span
                layout
                className={`label-count relative z-10 px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  activeCategory === null
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-[var(--bg3)] text-[var(--fg3)]'
                }`}
              >
                {totalArticlesCount}
              </motion.span>
            </motion.a>

            {/* CATEGORIES LIST */}
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <motion.a
                  key={cat.name}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`sidebar-label-item relative overflow-hidden transition-colors ${
                    isActive ? 'active text-[var(--fg)] font-bold' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory(isActive ? null : cat.name);
                  }}
                >
                  {/* Shared sliding active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBgPill"
                      className="absolute inset-0 bg-[var(--accent-glow-s)] border-l-4 border-[var(--accent)] rounded-lg z-0 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="label-name-wrap relative z-10 flex items-center gap-2">
                    <motion.span
                      animate={{
                        scale: isActive ? [1, 1.3, 1] : 1,
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--fg4)',
                      }}
                      transition={{ duration: 0.25 }}
                      className="label-dot"
                    />
                    <span>{cat.name}</span>
                  </span>

                  <motion.span
                    layout
                    className={`label-count relative z-10 px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'bg-[var(--bg3)] text-[var(--fg3)]'
                    }`}
                  >
                    {cat.count}
                  </motion.span>
                </motion.a>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* MATCH PREDICTIONS & TICKER WIDGET */}
      <div className="sb-card">
        <div className="sb-tt">
          <i className="fas fa-futbol" /> PREDIKSI SKOR HARIAN
        </div>
        <div className="space-y-3">
          {fixtures.map((fix) => (
            <div
              key={fix.id}
              className="p-3 rounded-xl bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
            >
              <div className="flex items-center justify-between text-[10px] text-[var(--fg3)] mb-2 font-semibold">
                <span className="truncate max-w-[140px] text-[var(--accent-l)]">{fix.league}</span>
                <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent-l)] font-bold">
                  {fix.status}
                </span>
              </div>

              <div className="flex items-center justify-between font-bold text-xs text-[var(--fg)] my-1">
                <span className="w-2/5 truncate">{fix.homeTeam}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg3)] text-[var(--accent-l)] font-mono">
                  {fix.homeScore !== undefined ? `${fix.homeScore} - ${fix.awayScore}` : 'VS'}
                </span>
                <span className="w-2/5 text-right truncate">{fix.awayTeam}</span>
              </div>

              {fix.matchDate && (
                <div className="text-[10px] text-[var(--fg3)] my-1 flex items-center gap-1">
                  <i className="far fa-clock text-[var(--accent)]" /> {fix.matchDate}
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--fg3)]">Prediksi:</span>
                <span className="font-extrabold text-[var(--fg)]">{fix.prediction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK HELP & SOCIAL WIDGET */}
      <div className="sb-card text-center p-4">
        <i className="fab fa-whatsapp text-3xl text-emerald-500 mb-2 block animate-pulse" />
        <h4 className="text-xs font-bold text-[var(--fg)] mb-1 font-display">
          Layanan Bantuan 24/7
        </h4>
        <p className="text-[11px] text-[var(--fg3)] mb-3 leading-relaxed">
          Ada kendala atau pertanyaan? CS Kancah siap melayani 24 jam nonstop.
        </p>
        <a
          href="https://shortq.site/Official-Center-KANCAH4D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all shadow-md mb-4"
        >
          <i className="fab fa-whatsapp text-sm" /> Hubungi WhatsApp
        </a>

        {/* SOCIAL MEDIA QUICK LINKS */}
        <div className="pt-3 border-t border-[var(--border)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg3)] block mb-2.5">
            Komunitas & Media Sosial
          </span>
          <div className="flex items-center justify-center gap-2">
            <a
              href="https://shortq.site/Official-Center-KANCAH4D"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-[var(--bg2)] hover:bg-emerald-600 text-[var(--fg2)] hover:text-white border border-[var(--border)] transition-all"
              title="WhatsApp"
            >
              <i className="fab fa-whatsapp text-sm" />
            </a>
            <a
              href="https://www.facebook.com/kancah4dteams/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-[var(--bg2)] hover:bg-blue-600 text-[var(--fg2)] hover:text-white border border-[var(--border)] transition-all"
              title="Facebook"
            >
              <i className="fab fa-facebook-f text-sm" />
            </a>
            <a
              href="https://x.com/kancah4d1"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-[var(--bg2)] hover:bg-black text-[var(--fg2)] hover:text-white border border-[var(--border)] transition-all"
              title="Twitter / X"
            >
              <i className="fab fa-x-twitter text-sm" />
            </a>
            <a
              href="https://t.me/OficialKancah4D"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-[var(--bg2)] hover:bg-sky-500 text-[var(--fg2)] hover:text-white border border-[var(--border)] transition-all"
              title="Telegram"
            >
              <i className="fab fa-telegram text-sm" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

