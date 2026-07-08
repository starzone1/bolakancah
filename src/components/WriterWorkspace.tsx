import React, { useState } from 'react';
import { Article } from '../types';
import { slugify, getArticleUrl } from '../utils/urlUtils';

interface WriterWorkspaceProps {
  articles: Article[];
  onAddArticle: (article: Omit<Article, 'id'>) => Promise<void>;
  onUpdateArticle: (article: Article) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  categories: string[];
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onGoToPortal: () => void;
  onOpenAdminPanel?: () => void;
}

export const WriterWorkspace: React.FC<WriterWorkspaceProps> = ({
  articles,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  categories,
  isAdminLoggedIn,
  onLoginSuccess,
  onGoToPortal,
  onOpenAdminPanel,
}) => {
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Sepak Bola');
  const [customCategory, setCustomCategory] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [author, setAuthor] = useState('Admin Redaksi');
  const [authorRole, setAuthorRole] = useState('Senior Sports Analyst');
  const [authorAvatar, setAuthorAvatar] = useState('https://ik.imagekit.io/dxokd3m9y/favicon.png');
  const [authorBio, setAuthorBio] = useState('Jurnalis dan pengamat olahraga senior di KANCAHTOTO.');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });
  const [image, setImage] = useState('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Search/Filter for Article List Sidebar
  const [searchQuery, setSearchQuery] = useState('');

  // Login Form States (if not logged in)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Success state / feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const presetImages = [
    {
      label: 'Stadion Sepak Bola',
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: 'Laga Piala Dunia',
      url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Aksi Pemain Bintang',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Trophy Juara',
      url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Banner Piala Dunia',
      url: 'https://ik.imagekit.io/dxokd3m9y/1b125f12-4ddf-426c-a226-a28d53f39340.png'
    },
    {
      label: 'Teknologi & Esports',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory(categories[0] || 'Sepak Bola');
    setCustomCategory('');
    setLabelsInput('');
    setAuthor('Admin Redaksi');
    setAuthorRole('Senior Sports Analyst');
    setAuthorAvatar('https://ik.imagekit.io/dxokd3m9y/favicon.png');
    setAuthorBio('Jurnalis dan pengamat olahraga senior di KANCAHTOTO.');
    setImage(presetImages[0].url);
    setSummary('');
    setContent('');
    setFeatured(false);
    setActiveTab('editor');
  };

  const handleEditClick = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug || '');
    setCategory(categories.includes(art.category) ? art.category : 'Lainnya');
    if (!categories.includes(art.category)) {
      setCustomCategory(art.category);
    }
    setLabelsInput(art.labels ? art.labels.join(', ') : '');
    setAuthor(art.author || 'Admin Redaksi');
    setAuthorRole(art.authorRole || 'Senior Sports Analyst');
    setAuthorAvatar(art.authorAvatar || 'https://ik.imagekit.io/dxokd3m9y/favicon.png');
    setAuthorBio(art.authorBio || 'Jurnalis dan pengamat olahraga senior di KANCAHTOTO.');
    setDate(art.date || '01 Juli 2026');
    setImage(art.image || presetImages[0].url);
    setSummary(art.summary || '');
    setContent(art.content || '');
    setFeatured(Boolean(art.featured));
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Judul dan Isi artikel wajib diisi!');
      return;
    }

    const finalCategory = category === 'Lainnya' && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    const parsedLabels = labelsInput
      ? labelsInput.split(',').map((l) => l.trim()).filter(Boolean)
      : [finalCategory, 'Kancahtoto'];

    try {
      if (editingId) {
        await onUpdateArticle({
          id: editingId,
          title: title.trim(),
          slug: slug.trim() || undefined,
          category: finalCategory,
          labels: parsedLabels,
          author: author.trim() || 'Admin Redaksi',
          authorRole: authorRole.trim(),
          authorAvatar: authorAvatar.trim(),
          authorBio: authorBio.trim(),
          date,
          image: image.trim() || presetImages[0].url,
          summary: summary.trim() || title.trim(),
          content: content.trim(),
          featured
        });
        showToast('Artikel berhasil diperbarui & tersinkronisasi ke Cloud!');
      } else {
        await onAddArticle({
          title: title.trim(),
          slug: slug.trim() || undefined,
          category: finalCategory,
          labels: parsedLabels,
          author: author.trim() || 'Admin Redaksi',
          authorRole: authorRole.trim(),
          authorAvatar: authorAvatar.trim(),
          authorBio: authorBio.trim(),
          date,
          image: image.trim() || presetImages[0].url,
          summary: summary.trim() || title.trim(),
          content: content.trim(),
          featured,
          views: 120,
          commentsCount: 0
        });
        showToast('Artikel baru berhasil diterbitkan ke Cloud!');
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Gagal menerbitkan artikel ke database.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      const u = username.trim().toLowerCase();
      if (
        (u === '@kancahtoto' || u === 'kancahtoto' || u === 'admin') &&
        password === 'Bos@210514'
      ) {
        setIsLoggingIn(false);
        onLoginSuccess();
      } else {
        setIsLoggingIn(false);
        setLoginError('Username atau Password salah!');
      }
    }, 400);
  };

  const insertFormatting = (type: 'h2' | 'p' | 'bold' | 'list') => {
    let snippet = '';
    switch (type) {
      case 'h2':
        snippet = '\n<h2>Judul Sub-Bab Baru</h2>\n';
        break;
      case 'p':
        snippet = '\n<p>Tulis paragraf analisis atau berita di sini...</p>\n';
        break;
      case 'bold':
        snippet = '<strong>Teks Tebal</strong>';
        break;
      case 'list':
        snippet = '\n<ul>\n  <li>Poin pertama</li>\n  <li>Poin kedua</li>\n</ul>\n';
        break;
    }
    setContent((prev) => prev + snippet);
  };

  const filteredArticles = articles.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not logged in, show inline login workspace
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-3xl mx-auto shadow-lg shadow-red-600/30 border border-red-400/20 mb-3">
            <i className="fas fa-feather-alt" />
          </div>
          <h2 className="text-xl font-black text-white font-display">Portal Penulis KANCAHTOTO</h2>
          <p className="text-xs text-[var(--fg3)] mt-1.5">
            Silakan login untuk mulai membuat, mengedit, dan mempublikasikan artikel olahraga Anda ke Firestore.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--fg2)] uppercase tracking-wider mb-1.5">
              Username Penulis
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg4)] text-xs" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--fg2)] uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg4)] text-xs" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <i className="fas fa-exclamation-circle" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Masuk...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" /> Masuk Portal Writer
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
          <button
            onClick={onGoToPortal}
            className="text-xs text-zinc-400 hover:text-red-400 font-bold flex items-center justify-center gap-1.5 mx-auto"
          >
            <i className="fas fa-arrow-left text-[10px]" /> Kembali ke Portal Pembaca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-emerald-400/30 animate-bounce">
          <i className="fas fa-check-circle text-sm" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-2xl shadow-md border border-red-500/20">
            <i className="fas fa-feather" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white font-display tracking-wide flex items-center gap-2">
              Workspace Penulis KANCAHTOTO
            </h1>
            <p className="text-xs text-[var(--fg3)]">
              Posting artikel olahraga, optimalkan SEO, dan sinkronkan hasil tulisan secara real-time ke Firestore Cloud.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoToPortal}
            className="px-4 py-2 bg-[#12151f] hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <i className="fas fa-globe" />
            <span>Lihat Portal Publik</span>
          </button>

          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 rounded-xl text-xs font-black text-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
              title="Kelola Prediksi Skor Harian (Tambah/Edit/Hapus/Impor Massal)"
            >
              <i className="fas fa-futbol" />
              <span>Kelola Prediksi Skor</span>
            </button>
          )}
          
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-red-600/10"
          >
            <i className="fas fa-plus" />
            <span>Tulis Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: published articles list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Daftar Tulisan Anda</h3>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono">
                {articles.length}
              </span>
            </div>

            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[11px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tulisan..."
                className="w-full pl-8 pr-3 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
              {filteredArticles.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Tidak ada tulisan ditemukan.</p>
              ) : (
                filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleEditClick(art)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 text-left ${
                      editingId === art.id
                        ? 'bg-red-500/10 border-red-500/50'
                        : 'bg-[#12151f] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{art.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{art.category}</p>
                      
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500">{art.date}</span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditClick(art)}
                            className="text-[10px] text-zinc-400 hover:text-white"
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Hapus artikel "${art.title}" dari database Cloud?`)) {
                                await onDeleteArticle(art.id);
                                showToast('Artikel telah dihapus dari Cloud!');
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-400"
                            title="Hapus"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Body */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md">
            {/* Editor vs Live Preview Tabs */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'editor'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-edit" />
                  <span>Editor Tulisan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-eye" />
                  <span>Pratinjau Hasil</span>
                </button>
              </div>

              {editingId && (
                <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold flex items-center gap-1.5">
                  <i className="fas fa-info-circle" /> Modifikasi ID #{editingId}
                </div>
              )}
            </div>

            {activeTab === 'editor' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Judul Utama */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                    Judul Utama Artikel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Prediksi Skor Piala Dunia 2026 Meksiko vs Afrika Selatan"
                    className="w-full px-4 py-3 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-bold"
                    required
                  />
                </div>

                {/* 2. Permalink / URL Slug */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                    URL Slug / Permalink <span className="text-zinc-500 font-medium">(Otomatis/Kustom)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-[#12151f] border border-[var(--border)] rounded-xl text-[10px] text-zinc-500 font-mono">
                      /2026/07/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      placeholder={slugify(title || 'judul-artikel')}
                      className="flex-1 px-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono"
                    />
                    <span className="px-3 py-2.5 bg-[#12151f] border border-[var(--border)] rounded-xl text-[10px] text-zinc-500 font-mono">
                      .html
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Ini adalah URL permanen artikel Anda di Cloudflare Pages. Berguna untuk meningkatkan performa SEO.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 3. Kategori */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                      Kategori Artikel <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 cursor-pointer font-bold"
                      required
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Lainnya">+ Kategori Baru</option>
                    </select>
                  </div>

                  {/* 4. Tags */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                      Kata Kunci / Tag <span className="text-zinc-500 font-medium">(Pisahkan Koma)</span>
                    </label>
                    <input
                      type="text"
                      value={labelsInput}
                      onChange={(e) => setLabelsInput(e.target.value)}
                      placeholder="Sepak Bola, Prediksi, Kancahtoto"
                      className="w-full px-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                {category === 'Lainnya' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                      Nama Kategori Kustom Baru
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori baru..."
                      className="w-full px-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                )}

                {/* 5. Cover Image */}
                <div className="p-4 bg-[#12151f] rounded-2xl border border-zinc-800 space-y-3.5">
                  <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                    Foto Sampul Utama Berita <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-[var(--bg3)] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono"
                    required
                  />

                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold block mb-2">
                      Pilih Foto Preset Cepat:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      {presetImages.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(p.url)}
                          className={`group relative h-14 rounded-lg overflow-hidden border transition-all ${
                            image === p.url ? 'border-red-500 ring-2 ring-red-500/40 opacity-100 scale-[1.02]' : 'border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] text-white p-0.5 text-center truncate font-bold">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {image && (
                    <div className="p-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] flex items-center gap-3">
                      <img src={image} alt="Preview" className="w-16 h-12 object-cover rounded-lg flex-shrink-0 border border-zinc-800" />
                      <div className="text-xs text-zinc-400 truncate">
                        <span className="font-bold text-white block">Pratinjau Foto Sampul</span>
                        <span className="font-mono text-[9px] text-zinc-500 truncate block">{image}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Meta Deskripsi (SEO) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                    Meta Deskripsi Artikel (Ringkasan Pencarian Google)
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Tulis ringkasan singkat artikel dalam 1-2 kalimat (maksimal 160 karakter)..."
                    className="w-full px-4 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all leading-relaxed"
                    maxLength={160}
                  />
                  <div className="text-right text-[10px] text-zinc-500 font-mono">
                    {summary.length}/160 karakter
                  </div>
                </div>

                {/* Google Snippet & Social Live Preview */}
                <div className="p-4 rounded-2xl bg-[#12151f] border border-zinc-800 space-y-4">
                  <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block font-mono">
                    <i className="fas fa-eye mr-1" /> Pratinjau Tampilan SEO Real-time
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google */}
                    <div className="p-3 bg-[var(--bg3)] rounded-xl border border-[var(--border)] space-y-1 text-[11px]">
                      <div className="text-zinc-500 uppercase font-bold text-[9px]">Google Search Result</div>
                      <div className="text-[10px] text-emerald-400 truncate font-mono">
                        bolakancah.pages.dev/2026/07/{slug ? slugify(slug) : slugify(title || 'judul-artikel')}.html
                      </div>
                      <div className="text-xs text-blue-400 font-semibold hover:underline truncate">
                        {title || 'Judul Utama Artikel Olahraga...'}
                      </div>
                      <div className="text-zinc-400 line-clamp-2 leading-relaxed">
                        <span className="text-zinc-500">{date} — </span>
                        {summary || 'Tuliskan meta deskripsi di atas untuk melihat bagaimana ringkasan artikel Anda muncul pada laman hasil pencarian Google.'}
                      </div>
                    </div>

                    {/* Social Share */}
                    <div className="p-3 bg-[var(--bg3)] rounded-xl border border-[var(--border)] space-y-2 text-[10px]">
                      <div className="text-zinc-500 uppercase font-bold text-[9px]">Facebook / Telegram Card</div>
                      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-[#12151f]">
                        <div className="h-20 bg-zinc-900 overflow-hidden relative">
                          <img src={image} alt="Social Card" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 space-y-0.5">
                          <div className="text-[8px] text-zinc-500 uppercase font-mono font-bold">BOLAKANCAH.PAGES.DEV</div>
                          <div className="font-bold text-zinc-200 truncate">{title || 'Judul Utama...'}</div>
                          <div className="text-zinc-400 truncate">{summary || 'Ringkasan deskripsi artikel...'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. Isi Lengkap Artikel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                      Isi Lengkap Artikel <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertFormatting('h2')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer"
                        title="Masukkan Subjudul H2"
                      >
                        Subjudul
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('p')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer"
                        title="Masukkan Paragraf P"
                      >
                        Paragraf
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('bold')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer"
                        title="Tebalkan Teks"
                      >
                        Tebal
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('list')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer"
                        title="Daftar Bullets"
                      >
                        List
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={11}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis isi berita lengkap di sini. Anda dapat menggunakan format tag HTML seperti <p>, <h2>, <strong>, <ul>..."
                    className="w-full px-4 py-3 bg-[var(--bg3)] border border-[var(--border)] rounded-2xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono leading-relaxed"
                    required
                  />
                </div>

                {/* Additional Settings (Collapsible profiles) */}
                <div className="p-4 rounded-2xl bg-[#12151f] border border-zinc-800 space-y-4">
                  <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block font-mono">
                    <i className="fas fa-user-edit mr-1" /> Profil Penulis & Opsi Publikasi
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nama Penulis</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Jabatan / Peran</label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Foto Profil Penulis</label>
                      <input
                        type="url"
                        value={authorAvatar}
                        onChange={(e) => setAuthorAvatar(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Biografi Penulis</label>
                      <input
                        type="text"
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--bg3)] border border-[var(--border)] rounded-xl">
                      <input
                        type="checkbox"
                        id="featuredToggleWriter"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                      <label htmlFor="featuredToggleWriter" className="text-xs font-bold text-white cursor-pointer select-none flex items-center gap-1.5">
                        <i className="fas fa-star text-amber-400 text-xs" />
                        <span>Featured Headline / Slider Utama</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-all"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2"
                  >
                    <i className="fas fa-cloud-upload-alt text-sm" />
                    <span>{editingId ? 'Perbarui & Publish ke Cloud' : 'Terbitkan ke Cloud Firestore'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* LIVE PREVIEW COMPONENT */
              <div className="space-y-6 text-left">
                {/* Header metadata */}
                <div className="space-y-3 pb-5 border-b border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">
                    {category === 'Lainnya' && customCategory ? customCategory : category}
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-white leading-tight font-display">
                    {title || 'Judul Utama Artikel Olahraga Anda'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <img src={authorAvatar} alt={author} className="w-6 h-6 rounded-full border border-zinc-700" />
                      <span className="font-semibold text-white">{author}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{authorRole}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <i className="far fa-calendar text-[11px]" />
                      <span>{date}</span>
                    </div>
                  </div>
                </div>

                {/* Article Main Cover Image */}
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[16/9] max-h-[400px]">
                  <img src={image} alt="Cover image preview" className="w-full h-full object-cover" />
                </div>

                {/* Article Body Content */}
                <div 
                  className="article-body-text text-zinc-300 text-sm leading-relaxed space-y-4 max-w-none prose prose-invert font-sans"
                  dangerouslySetInnerHTML={{ 
                    __html: content || '<p className="text-zinc-500 italic">Isi artikel Anda kosong. Kembali ke tab "Editor Tulisan" untuk mulai menulis berita Anda.</p>' 
                  }}
                />

                {/* Author Box Preview */}
                <div className="p-4 rounded-xl bg-[#12151f] border border-zinc-800 flex items-start gap-3.5 mt-8">
                  <img src={authorAvatar} alt={author} className="w-11 h-11 rounded-xl object-cover border border-zinc-700 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-extrabold text-white">{author}</h5>
                    <p className="text-[10px] text-red-400 font-bold mt-0.5">{authorRole}</p>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{authorBio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
