import React, { useEffect, useState } from 'react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      id="btt"
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '22px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-d))',
        color: '#fff',
        fontSize: '14px',
        boxShadow: 'var(--shadow-accent)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'all' : 'none',
        transition: 'all .35s'
      }}
      title="Kembali ke atas"
    >
      <i className="fas fa-chevron-up" />
    </button>
  );
};
