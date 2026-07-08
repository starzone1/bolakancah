import React from 'react';
import { ModalType } from '../types';

interface FooterProps {
  onOpenModal: (type: NonNullable<ModalType>) => void;
  onSelectCategory: (category: string) => void;
  onGoHome: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenModal,
  onSelectCategory,
  onGoHome,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAdminPanel
}) => {
  return (
    <footer className="site-ft">
      <div className="ft-inner">
        <div className="ft-grid">
          {/* BRAND COLUMN */}
          <div className="ft-col ft-brand">
            <a 
              onClick={(e) => {
                e.preventDefault();
                onGoHome();
              }}
              className="cursor-pointer inline-flex items-center mb-3"
            >
              <img 
                alt="KANCAHTOTO" 
                src="https://ik.imagekit.io/dxokd3m9y/logokancah.png?updatedAt=1780809155541" 
                style={{ height: '34px', width: 'auto' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </a>
            <p style={{ fontSize: '12.5px', color: 'var(--fg3)', lineHeight: 1.75, marginTop: '8px' }}>
              Portal berita sepak bola terkini dan terpercaya persembahan <strong>KANCAHTOTO</strong>. Menyajikan informasi prediksi, tips, dan update dunia olahraga dan gaming.
            </p>

            {/* SOCIAL MEDIA LINKS */}
            <div className="mt-4 flex items-center gap-2.5">
              <a
                href="https://shortq.site/Official-Center-KANCAH4D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white flex items-center justify-center transition-all shadow-md group"
                title="WhatsApp Resmi"
              >
                <i className="fab fa-whatsapp text-base group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.facebook.com/kancah4dteams/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white flex items-center justify-center transition-all shadow-md group"
                title="Facebook Resmi"
              >
                <i className="fab fa-facebook-f text-base group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://x.com/kancah4d1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-500/10 hover:bg-black border border-slate-600/40 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md group"
                title="Twitter / X Resmi"
              >
                <i className="fab fa-x-twitter text-base group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://t.me/OficialKancah4D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-sky-500/10 hover:bg-sky-500 border border-sky-400/30 text-sky-400 hover:text-white flex items-center justify-center transition-all shadow-md group"
                title="Telegram Resmi"
              >
                <i className="fab fa-telegram text-base group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* SEPAK BOLA COLUMN */}
          <div className="ft-col">
            <div className="ft-hd">Sepak Bola</div>
            <a className="ft-a" onClick={() => onSelectCategory('Sepak Bola')}>Sepak Bola</a>
            <a className="ft-a" onClick={() => onSelectCategory('Piala Dunia 2026')}>Piala Dunia 2026</a>
            <a className="ft-a" onClick={() => onSelectCategory('prediksi skor')}>Prediksi Skor</a>
            <a className="ft-a" onClick={() => onSelectCategory('World Cup 2026')}>World Cup 2026</a>
          </div>

          {/* KANCAHTOTO & KANCAH4D COLUMN */}
          <div className="ft-col">
            <div className="ft-hd">Kancah4D & Kancahtoto</div>
            <a className="ft-a" onClick={() => onSelectCategory('Kancah4D')}>Kancah4D Official</a>
            <a className="ft-a" onClick={() => onSelectCategory('KANCAHTOTO')}>KANCAHTOTO Online</a>
            <a className="ft-a" onClick={() => onSelectCategory('Prediksi Kancah4D')}>Prediksi Kancah4D</a>
            <a className="ft-a" href="https://akseslink.com/kancah4d" target="_blank" rel="noopener noreferrer">Link Alternatif Kancah4D</a>
            <a className="ft-a" onClick={() => onSelectCategory('Daftar Kancahtoto')}>Daftar Kancahtoto VVIP</a>
          </div>

          {/* HALAMAN COLUMN */}
          <div className="ft-col">
            <div className="ft-hd">Halaman</div>
            <a className="ft-a" onClick={() => onOpenModal('about')}>Tentang Kami</a>
            <a className="ft-a" onClick={() => onOpenModal('contact')}>Kontak</a>
            <a className="ft-a flex items-center gap-1.5" href="mailto:astrakancah@gmail.com">
              <i className="far fa-envelope text-xs" /> Hubungi Redaksi
            </a>
            <a className="ft-a" onClick={() => onOpenModal('privacy')}>Kebijakan Privasi</a>
            <a className="ft-a" onClick={() => onOpenModal('disclaimer')}>Disclaimer</a>
            <a 
              className="ft-a text-[var(--accent-l)] font-bold flex items-center gap-1 mt-1"
              onClick={() => {
                if (isAdminLoggedIn && onOpenAdminPanel) {
                  onOpenAdminPanel();
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
            >
              <i className="fas fa-lock text-xs" /> Admin Redaksi
            </a>
          </div>
        </div>

        {/* QUICK LINK TAGS */}
        <div className="border-t border-[var(--border)] pt-6 pb-2 mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[var(--fg3)] uppercase tracking-wider mr-2 font-mono">Tag Populer:</span>
            {[
              'Sepak Bola',
              'Piala Dunia 2026',
              'Prediksi Skor',
              'Jadwal Bola',
              'Analisis Taktis',
              'Teknologi Esports',
              'Kancah4D',
              'KANCAHTOTO',
              'Link Alternatif',
              'ID VIP Kancah'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (tag === 'Link Alternatif') {
                    window.open('https://akseslink.com/kancah4d', '_blank', 'noopener,noreferrer');
                  } else {
                    onSelectCategory(tag);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] text-[var(--fg3)] transition-all cursor-pointer font-medium"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="ft-bottom">
          <span>&#169; {new Date().getFullYear()} KANCAHTOTO. All rights reserved.</span>
          <span>Powered by KANCAHTOTO | STAR GAMING ASIA</span>
        </div>
      </div>
    </footer>
  );
};
