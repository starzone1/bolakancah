import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const u = username.trim().toLowerCase();
      // Username: @kancahtoto, password: Bos@210514
      if (
        (u === '@kancahtoto' || u === 'kancahtoto' || u === 'admin' || u === 'admin@kancahtoto.com') &&
        password === 'Bos@210514'
      ) {
        setIsLoading(false);
        onLoginSuccess();
        setUsername('');
        setPassword('');
      } else {
        setIsLoading(false);
        setError('Username atau Password yang Anda masukkan salah!');
      }
    }, 400);
  };

  return (
    <div className={`modal-ov ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div 
        className="modal-box max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="text-base font-extrabold flex items-center gap-2 text-white">
            <i className="fas fa-user-shield text-[var(--accent)]" />
            Login Administrator Kancahtoto
          </h3>
          <button 
            onClick={onClose} 
            className="modal-close-btn"
            title="Tutup Modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--fg2)] uppercase tracking-wider mb-1.5">
                Username / Email Admin
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg4)] text-xs" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--fg2)] uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg4)] text-xs" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <i className="fas fa-exclamation-circle" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(0,150,255,0.35)] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> Masuk...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt" /> Masuk Ke Panel Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
