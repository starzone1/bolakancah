import React, { useEffect, useState } from 'react';

export const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('popupShown')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      sessionStorage.setItem('popupShown', 'true');
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className={`popup-ov ${isOpen ? 'show' : ''}`} 
      id="welcomePopup"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="popup-box">
        <img 
          alt="KANCAHTOTO Logo" 
          className="popup-logo" 
          src="https://ik.imagekit.io/dxokd3m9y/logokancah.png?updatedAt=1780809155541"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="popup-text">
          Selamat datang di portal berita dan prediksi terpercaya. Dapatkan informasi terkini seputar sepak bola dan game populer!
        </div>
        <button 
          className="popup-close" 
          id="closePopup"
          onClick={() => setIsOpen(false)}
        >
          <i className="fas fa-check-circle" /> Lanjutkan Membaca
        </button>
      </div>
    </div>
  );
};
