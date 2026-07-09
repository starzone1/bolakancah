import React from 'react';
import { ModalType } from '../types';

interface ModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <>
      {/* ABOUT MODAL */}
      <div 
        className={`modal-ov ${activeModal === 'about' ? 'show' : ''}`}
        id="modal-about"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-box">
          <div className="modal-head">
            <h3><i className="fas fa-building" /> Tentang Kami</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="modal-body">
            <p>Selamat datang di <strong>KANCAHTOTO</strong>, portal berita sepak bola terkini dan terpercaya yang menyajikan informasi seputar dunia olahraga, analisa liga top, dan hiburan gaming.</p>
            <h4><i className="fas fa-bullseye" /> Misi Kami</h4>
            <p>Misi kami adalah memberikan informasi yang akurat, prediksi yang tajam, dan tips berharga bagi para penggemar sepak bola dan pecinta game online.</p>
            <h4><i className="fas fa-handshake" /> Komitmen</h4>
            <p>Kami berkomitmen untuk selalu menjaga kualitas konten dan memberikan pengalaman membaca terbaik bagi Anda.</p>
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      <div 
        className={`modal-ov ${activeModal === 'contact' ? 'show' : ''}`}
        id="modal-contact"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-box">
          <div className="modal-head">
            <h3><i className="fas fa-headset" /> Hubungi Kami</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="modal-body">
            <p>Butuh bantuan atau memiliki pertanyaan? Jangan ragu untuk menghubungi kami melalui saluran resmi berikut:</p>
            
            <h4><i className="fa-solid fa-link" /> Alternatif Link VVIP</h4>
            <p>
              <a href="https://bolakancah.asia" target="_blank" rel="noopener noreferrer">
                Daftar ID VVIP
              </a>
            </p>

            <h4><i className="fab fa-whatsapp" /> WhatsApp Official</h4>
            <p>
              <a href="https://shortq.site/Official-Center-KANCAH4D" target="_blank" rel="noopener noreferrer">
                Official Center WhatsApp
              </a>
            </p>

            <h4><i className="fab fa-facebook" /> Facebook Group & Page</h4>
            <p>
              <a href="https://www.facebook.com/kancah4dteams/" target="_blank" rel="noopener noreferrer">
                facebook.com/kancah4dteams
              </a>
            </p>

            <h4><i className="fab fa-x-twitter" /> Twitter / X</h4>
            <p>
              <a href="https://x.com/kancah4d1" target="_blank" rel="noopener noreferrer">
                x.com/kancah4d1
              </a>
            </p>

            <h4><i className="fab fa-telegram" /> Telegram Official</h4>
            <p>
              <a href="https://t.me/OficialKancah4D" target="_blank" rel="noopener noreferrer">
                t.me/OficialKancah4D
              </a>
            </p>

            <h4><i className="fas fa-clock" /> Jam Operasional</h4>
            <p>All Time | 24/7 Aktif Nonstop</p>
          </div>
        </div>
      </div>

      {/* PRIVACY MODAL */}
      <div 
        className={`modal-ov ${activeModal === 'privacy' ? 'show' : ''}`}
        id="modal-privacy"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-box">
          <div className="modal-head">
            <h3><i className="fas fa-shield-alt" /> Kebijakan Privasi</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="modal-body">
            <p>Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat mengunjungi situs kami.</p>
            <h4><i className="fas fa-database" /> Informasi yang Dikumpulkan</h4>
            <ul>
              <li>Data browser dan perangkat (Cookies untuk pengalaman pengguna).</li>
              <li>Informasi yang Anda berikan secara sukarela (seperti email untuk newsletter).</li>
            </ul>
            <h4><i className="fas fa-lock" /> Perlindungan Data</h4>
            <p>Kami menggunakan langkah-langkah keamanan standar industri untuk melindungi data pribadi Anda dari akses yang tidak sah.</p>
          </div>
        </div>
      </div>

      {/* DISCLAIMER MODAL */}
      <div 
        className={`modal-ov ${activeModal === 'disclaimer' ? 'show' : ''}`}
        id="modal-disclaimer"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-box">
          <div className="modal-head">
            <h3><i className="fas fa-exclamation-triangle" /> Disclaimer</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="modal-body">
            <p>Informasi yang disediakan di situs <strong>KANCAHTOTO</strong> hanya untuk tujuan hiburan dan informasi umum.</p>
            <h4><i className="fas fa-ban" /> Batasan Tanggung Jawab</h4>
            <p>Kami tidak menjamin keakuratan, kelengkapan, atau validitas informasi apapun di situs ini. Tindakan yang diambil berdasarkan informasi dari situs ini sepenuhnya menjadi risiko pengguna.</p>
            <h4><i className="fas fa-gavel" /> Aturan Hukum</h4>
            <p>Penggunaan situs ini tunduk pada hukum yang berlaku. Aktivitas ilegal yang melibatkan konten kami sangat dilarang.</p>
          </div>
        </div>
      </div>
    </>
  );
};
