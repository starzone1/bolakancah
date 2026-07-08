import React, { useState } from 'react';
import { Article, Fixture } from '../types';
import { slugify } from '../utils/urlUtils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onAddArticle: (article: Omit<Article, 'id'>) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  fixtures?: Fixture[];
  onAddFixture?: (fixture: Omit<Fixture, 'id'>) => void;
  onUpdateFixture?: (fixture: Fixture) => void;
  onDeleteFixture?: (id: string) => void;
  onLogout: () => void;
  categories: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  articles,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  fixtures = [],
  onAddFixture,
  onUpdateFixture,
  onDeleteFixture,
  onLogout,
  categories
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'fixtures' | 'stats'>('create');
  
  // Fixture Form State
  const [editingFixId, setEditingFixId] = useState<string | null>(null);
  const [fixHomeTeam, setFixHomeTeam] = useState('Meksiko');
  const [fixAwayTeam, setFixAwayTeam] = useState('Afrika Selatan');
  const [fixLeague, setFixLeague] = useState('Piala Dunia 2026 (Grup A)');
  const [fixDate, setFixDate] = useState('11 Juni 2026, 22:00 WIB');
  const [fixPrediction, setFixPrediction] = useState('2 - 0 / Meksiko');
  const [fixOdds, setFixOdds] = useState('Meksiko -1.0');
  const [fixStatus, setFixStatus] = useState<'Upcoming' | 'Live' | 'Finished'>('Upcoming');
  const [fixHomeScore, setFixHomeScore] = useState<string>('');
  const [fixAwayScore, setFixAwayScore] = useState<string>('');
  
  // Article Form State
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
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });
  const [image, setImage] = useState('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Search filter for manage tab
  const [searchFilter, setSearchFilter] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
  };

  const resetFixtureForm = () => {
    setEditingFixId(null);
    setFixHomeTeam('');
    setFixAwayTeam('');
    setFixLeague('Piala Dunia 2026');
    setFixDate('11 Juni 2026, 22:00 WIB');
    setFixPrediction('2 - 0');
    setFixOdds('Over 2.5');
    setFixStatus('Upcoming');
    setFixHomeScore('');
    setFixAwayScore('');
  };

  const handleEditFixtureClick = (fix: Fixture) => {
    setEditingFixId(fix.id);
    setFixHomeTeam(fix.homeTeam);
    setFixAwayTeam(fix.awayTeam);
    setFixLeague(fix.league);
    setFixDate(fix.matchDate);
    setFixPrediction(fix.prediction);
    setFixOdds(fix.odds || '');
    setFixStatus(fix.status);
    setFixHomeScore(fix.homeScore !== undefined ? String(fix.homeScore) : '');
    setFixAwayScore(fix.awayScore !== undefined ? String(fix.awayScore) : '');
    setActiveTab('fixtures');
  };

  const handleFixtureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixHomeTeam.trim() || !fixAwayTeam.trim()) {
      alert('Nama Tim Tuan Rumah dan Tim Tamu wajib diisi!');
      return;
    }

    const fixtureData: Omit<Fixture, 'id'> = {
      homeTeam: fixHomeTeam.trim(),
      awayTeam: fixAwayTeam.trim(),
      league: fixLeague.trim() || 'Piala Dunia 2026',
      matchDate: fixDate.trim() || 'Hari Ini',
      prediction: fixPrediction.trim() || '1 - 0',
      odds: fixOdds.trim() || undefined,
      status: fixStatus,
      homeScore: fixHomeScore !== '' ? Number(fixHomeScore) : undefined,
      awayScore: fixAwayScore !== '' ? Number(fixAwayScore) : undefined
    };

    if (editingFixId) {
      if (onUpdateFixture) {
        onUpdateFixture({
          ...fixtureData,
          id: editingFixId
        });
      }
      showToast('Prediksi skor berhasil disinkronkan ke Cloud!');
    } else {
      if (onAddFixture) {
        onAddFixture(fixtureData);
      }
      showToast('Prediksi skor baru berhasil diterbitkan!');
    }

    resetFixtureForm();
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
    setActiveTab('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    if (editingId) {
      // Update existing
      onUpdateArticle({
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
      showToast('Artikel berhasil diperbarui & tersinkronisasi!');
    } else {
      // Create new
      onAddArticle({
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
        views: 1,
        commentsCount: 0
      });
      showToast('Artikel baru berhasil diterbitkan ke Cloud!');
    }

    resetForm();
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

  const filteredManageArticles = articles.filter((art) =>
    art.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    art.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className={`modal-ov ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div 
        className="modal-box max-w-5xl w-full p-0 overflow-hidden flex flex-col max-h-[92vh] bg-[#0d0f14] border border-red-500/20 shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-emerald-400/30 animate-bounce">
            <i className="fas fa-check-circle text-sm" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Panel Header */}
        <div className="bg-gradient-to-r from-[#141721] via-[#1a1e2b] to-[#141721] border-b border-zinc-800/80 p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xl shadow-lg shadow-red-600/30 border border-red-400/20">
              <i className="fas fa-sliders-h" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-display tracking-wide">
                Panel Kontrol Redaksi Admin KANCAHTOTO
              </h3>
              <div className="flex items-center gap-2 text-[11px] mt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Real-time Connected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              title="Keluar dari akun Admin"
            >
              <i className="fas fa-sign-out-alt text-xs" />
              <span className="hidden sm:inline">Keluar Admin</span>
            </button>

            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center text-sm transition-all border border-zinc-700/50"
              title="Tutup Panel"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Panel Tabs Navigation Bar */}
        <div className="bg-[#12151f] border-b border-zinc-800/80 px-4 pt-3 pb-0 flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold tracking-wide flex items-center gap-2.5 transition-all border-t border-x whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-[#0d0f14] text-white border-red-500/40 border-b-0 text-red-400 shadow-md'
                : 'bg-zinc-900/40 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'} text-sm ${activeTab === 'create' ? 'text-red-500' : 'text-zinc-400'}`} />
            <span>{editingId ? 'Edit Artikel' : 'Posting Artikel Baru'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold tracking-wide flex items-center gap-2.5 transition-all border-t border-x whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-[#0d0f14] text-white border-red-500/40 border-b-0 text-red-400 shadow-md'
                : 'bg-zinc-900/40 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <i className={`fas fa-newspaper text-sm ${activeTab === 'manage' ? 'text-red-500' : 'text-zinc-400'}`} />
            <span>Kelola Berita</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${activeTab === 'manage' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold tracking-wide flex items-center gap-2.5 transition-all border-t border-x whitespace-nowrap ${
              activeTab === 'fixtures'
                ? 'bg-[#0d0f14] text-white border-red-500/40 border-b-0 text-red-400 shadow-md'
                : 'bg-zinc-900/40 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <i className={`fas fa-futbol text-sm ${activeTab === 'fixtures' ? 'text-red-500' : 'text-zinc-400'}`} />
            <span>Kelola Prediksi Skor</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ${activeTab === 'fixtures' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
              {fixtures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold tracking-wide flex items-center gap-2.5 transition-all border-t border-x whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-[#0d0f14] text-white border-red-500/40 border-b-0 text-red-400 shadow-md'
                : 'bg-zinc-900/40 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <i className={`fas fa-chart-line text-sm ${activeTab === 'stats' ? 'text-red-500' : 'text-zinc-400'}`} />
            <span>Statistik & Informasi</span>
          </button>
        </div>

        {/* Panel Main Content Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-[#0d0f14]">
          {/* TAB 1: POSTING / EDIT ARTIKEL */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {editingId && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-sm">
                  <span className="font-bold flex items-center gap-2">
                    <i className="fas fa-edit text-amber-400" /> Sedang Mengedit Artikel ID: #{editingId}
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-[11px] font-bold underline hover:text-white px-2 py-1 rounded bg-amber-500/20"
                  >
                    Batal Edit & Buat Baru
                  </button>
                </div>
              )}

              {/* 1. Judul Berita Utama * */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Judul Berita Utama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: KANCAH4D - Portal Berita Sepak Bola & Prediksi Skor Akurat Di KANCAHTOTO"
                  className="w-full px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-bold placeholder:text-zinc-600"
                  required
                />
              </div>

              {/* 2. Custom Permalink / URL Slug (Opsional) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Custom Permalink / URL Slug <span className="text-zinc-500 font-medium">(Opsional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 bg-[#12151f] border border-zinc-800 rounded-xl text-[10px] text-zinc-500 font-mono select-none">
                    /2026/07/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                    placeholder="judul-permalink-kustom"
                    className="flex-1 px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono"
                  />
                  <span className="px-3 py-2.5 bg-[#12151f] border border-zinc-800 rounded-xl text-[10px] text-zinc-500 font-mono select-none">
                    .html
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Kosongkan untuk membuat otomatis berdasarkan judul. Gunakan huruf kecil, angka, dan tanda hubung (-).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3. Kategori Berita * */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                    Kategori Berita <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-semibold cursor-pointer"
                    required
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Lainnya">+ Tambah Kategori Baru</option>
                  </select>
                </div>

                {/* 4. Kata Kunci / Tag Artikel */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                    Kata Kunci / Tag Artikel <span className="text-zinc-500 font-medium">(Pisahkan Koma)</span>
                  </label>
                  <input
                    type="text"
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    placeholder="Sepak Bola, Prediksi Skor, Kancahtoto"
                    className="w-full px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {category === 'Lainnya' && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                    Kategori Kustom Baru
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Masukkan nama kategori baru..."
                    className="w-full px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                  />
                </div>
              )}

              {/* 5. Foto Sampul Utama Berita * */}
              <div className="p-4 rounded-2xl bg-[#12151f] border border-zinc-800/80 space-y-3.5">
                <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Foto Sampul Utama Berita <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 bg-[#0d0f14] border border-zinc-700/60 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono"
                  required
                />

                {/* Preset Image Selector */}
                <div>
                  <span className="text-[11px] text-zinc-400 font-semibold block mb-2">
                    Pilih Gambar Preset Cepat:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(p.url)}
                        className={`group relative h-16 rounded-xl overflow-hidden border transition-all ${
                          image === p.url ? 'border-red-500 ring-2 ring-red-500/40 opacity-100 scale-[1.02]' : 'border-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/85 text-[9px] text-white p-0.5 text-center truncate font-bold">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Live Preview */}
                {image && (
                  <div className="p-2.5 rounded-xl bg-[#0d0f14] border border-zinc-800 flex items-center gap-3">
                    <img src={image} alt="Preview" className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-zinc-700/50" />
                    <div className="text-xs text-zinc-400 truncate">
                      <span className="font-bold text-white block mb-0.5">Pratinjau Foto Sampul</span>
                      <span className="font-mono text-[10px] text-zinc-500 truncate block">{image}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Meta Deskripsi Berita (SEO) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Meta Deskripsi Berita (SEO)
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tuliskan deskripsi ringkas 1-2 kalimat (maksimal 160 karakter) untuk hasil pencarian Google..."
                  className="w-full px-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all leading-relaxed placeholder:text-zinc-600"
                  maxLength={160}
                />
                <div className="text-right text-[10px] text-zinc-500">
                  {summary.length}/160 karakter
                </div>
              </div>

              {/* 7. Pratinjau Hasil Pencarian & Media Sosial */}
              <div className="p-4 rounded-2xl bg-[#12151f] border border-zinc-800/80 space-y-4">
                <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider block font-display">
                  <i className="fas fa-eye mr-1" /> Pratinjau Hasil Pencarian & Media Sosial
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Search Preview */}
                  <div className="p-3 bg-[#0d0f14] rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      <i className="fab fa-google text-blue-500 mr-1" /> Google Search Result
                    </span>
                    <div className="text-[10px] text-emerald-500 truncate font-mono">
                      https://kancah4d.news/2026/07/{slug ? slugify(slug) : slugify(title || 'judul-berita')}.html
                    </div>
                    <div className="text-xs text-[#4b8df8] hover:underline font-semibold truncate font-sans">
                      {title || 'Judul Berita Utama...'}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      <span className="text-zinc-500">{date || '07 Jul 2026'} — </span>
                      {summary || 'Tulis Meta Deskripsi Berita (SEO) untuk melihat pratinjau cuplikan pencarian Google di sini.'}
                    </div>
                  </div>

                  {/* Social Media Card Preview */}
                  <div className="p-3 bg-[#0d0f14] rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      <i className="fab fa-facebook text-blue-600 mr-1" /> Facebook / Twitter Share Card
                    </span>
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-[#12151f] text-[11px]">
                      <div className="h-20 bg-zinc-900 overflow-hidden relative">
                        {image ? (
                          <img src={image} alt="Social Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px]">Belum Ada Gambar Sampul</div>
                        )}
                      </div>
                      <div className="p-2 space-y-0.5">
                        <div className="text-[9px] text-zinc-500 uppercase font-semibold font-mono tracking-wider">KANCAH4D.NEWS</div>
                        <div className="font-bold text-zinc-200 truncate">{title || 'Judul Berita Utama...'}</div>
                        <div className="text-zinc-400 line-clamp-1">{summary || 'Meta deskripsi artikel...'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Isi Lengkap Berita (Mendukung paragraf HTML / <p> <h3> <blockquote>) * */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                    Isi Lengkap Berita (Mendukung paragraf HTML / &lt;p&gt; &lt;h3&gt; &lt;blockquote&gt;) <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Toolbar Helper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertFormatting('h2')}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                      title="Tambah Judul Sub-bab"
                    >
                      H2 Judul
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('p')}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                      title="Tambah Paragraf"
                    >
                      P Paragraf
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                      title="Tebalkan Teks"
                    >
                      B Tebal
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('list')}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
                      title="Tambah Daftar List"
                    >
                      List
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis isi berita lengkap di sini. Anda dapat menggunakan tag HTML seperti <p>, <h2>, <ul>, <li>, <strong>..."
                  className="w-full px-4 py-3 bg-[#141721] border border-zinc-800 rounded-2xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono leading-relaxed placeholder:text-zinc-600"
                  required
                />
              </div>

              {/* COLLAPSIBLE ADVANCED SETTINGS (Untuk profil penulis, tanggal publish, dan star/featured) */}
              <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-[#12151f]">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-zinc-300 hover:bg-zinc-800/40 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <i className="fas fa-cog text-red-500" />
                    <span>Pengaturan Tambahan & Profil Penerbit (Default Favicon)</span>
                  </span>
                  <i className={`fas ${showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-zinc-500`} />
                </button>

                {showAdvanced && (
                  <div className="p-4 border-t border-zinc-800/80 bg-[#0d0f14] space-y-4">
                    {/* Author Info */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">
                        Informasi Profil Penulis Berita (Author Bio)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">
                            Nama Penulis
                          </label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-3 py-2 bg-[#12151f] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">
                            Jabatan / Peran
                          </label>
                          <input
                            type="text"
                            value={authorRole}
                            onChange={(e) => setAuthorRole(e.target.value)}
                            className="w-full px-3 py-2 bg-[#12151f] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">
                            URL Foto Profil (Avatar)
                          </label>
                          <input
                            type="url"
                            value={authorAvatar}
                            onChange={(e) => setAuthorAvatar(e.target.value)}
                            className="w-full px-3 py-2 bg-[#12151f] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">
                          Biografi Penulis (Author Bio)
                        </label>
                        <input
                          type="text"
                          value={authorBio}
                          onChange={(e) => setAuthorBio(e.target.value)}
                          className="w-full px-3 py-2 bg-[#12151f] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
                          Tanggal Terbit Berita
                        </label>
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#12151f] border border-zinc-800 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      {/* Featured Option Toggle */}
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#12151f] border border-zinc-800">
                        <input
                          type="checkbox"
                          id="featuredToggle"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                        <label htmlFor="featuredToggle" className="text-xs font-bold text-white cursor-pointer select-none flex items-center gap-2">
                          <i className="fas fa-star text-amber-400 text-xs" />
                          <span>Jadikan Berita Utama / Featured Banner</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all"
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                >
                  <i className="fas fa-cloud-upload-alt text-sm" />
                  <span>{editingId ? 'Simpan & Sync Ke Cloud' : 'Terbitkan Artikel Ke Cloud'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: KELOLA BERITA */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Cari berita berdasarkan judul atau kategori..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#141721] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500 placeholder:text-zinc-500"
                  />
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 flex-shrink-0 shadow-md transition-all"
                >
                  <i className="fas fa-plus text-xs" />
                  <span>Tambah Artikel</span>
                </button>
              </div>

              {/* Article List Table */}
              <div className="space-y-3">
                {filteredManageArticles.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#12151f] border border-zinc-800 text-xs text-zinc-400">
                    Tidak ada berita ditemukan.
                  </div>
                ) : (
                  filteredManageArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-3.5 rounded-2xl bg-[#12151f] border border-zinc-800/80 hover:border-zinc-700 flex items-center gap-4 transition-all"
                    >
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-20 h-14 object-cover rounded-xl flex-shrink-0 bg-zinc-900 border border-zinc-800"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = "https://ik.imagekit.io/dxokd3m9y/1b125f12-4ddf-426c-a226-a28d53f39340.png";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                            {art.category}
                          </span>
                          {art.featured && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <i className="fas fa-star text-[9px] mr-1" /> Featured
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono ml-auto hidden sm:inline">
                            {art.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mb-0.5">{art.title}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{art.summary}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(art)}
                          className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500 flex items-center justify-center text-xs transition-all"
                          title="Edit Artikel"
                        >
                          <i className="fas fa-edit" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus artikel "${art.title}" dari database Cloud?`)) {
                              onDeleteArticle(art.id);
                              showToast('Artikel telah dihapus dari Cloud!');
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center text-xs transition-all"
                          title="Hapus Artikel"
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA PREDIKSI SKOR (FIXTURES) */}
          {activeTab === 'fixtures' && (
            <div className="space-y-6">
              {/* Form Tambah/Edit Prediksi */}
              <form onSubmit={handleFixtureSubmit} className="p-5 rounded-2xl bg-[#12151f] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fas fa-futbol text-red-500" />
                    <span>{editingFixId ? 'Edit Prediksi Skor Match' : 'Tambah Pertandingan & Prediksi Skor Baru'}</span>
                  </h4>
                  {editingFixId && (
                    <button
                      type="button"
                      onClick={resetFixtureForm}
                      className="text-xs text-zinc-400 hover:text-white underline font-medium"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Tim Tuan Rumah (Home) *
                    </label>
                    <input
                      type="text"
                      value={fixHomeTeam}
                      onChange={(e) => setFixHomeTeam(e.target.value)}
                      placeholder="Contoh: Meksiko, Brasil, Real Madrid"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Tim Tamu (Away) *
                    </label>
                    <input
                      type="text"
                      value={fixAwayTeam}
                      onChange={(e) => setFixAwayTeam(e.target.value)}
                      placeholder="Contoh: Afrika Selatan, Argentina, Barcelona"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Liga / Turnamen *
                    </label>
                    <input
                      type="text"
                      value={fixLeague}
                      onChange={(e) => setFixLeague(e.target.value)}
                      placeholder="Contoh: Piala Dunia 2026 (Grup A)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Jadwal / Waktu Pertandingan *
                    </label>
                    <input
                      type="text"
                      value={fixDate}
                      onChange={(e) => setFixDate(e.target.value)}
                      placeholder="Contoh: 11 Juni 2026, 22:00 WIB"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Prediksi Skor / Hasil *
                    </label>
                    <input
                      type="text"
                      value={fixPrediction}
                      onChange={(e) => setFixPrediction(e.target.value)}
                      placeholder="Contoh: 2 - 0 / Meksiko"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Pasaran / Odds
                    </label>
                    <input
                      type="text"
                      value={fixOdds}
                      onChange={(e) => setFixOdds(e.target.value)}
                      placeholder="Contoh: Over 2.5, Meksiko -1.0"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                      Status Pertandingan
                    </label>
                    <select
                      value={fixStatus}
                      onChange={(e) => setFixStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white focus:border-red-500 outline-none"
                    >
                      <option value="Upcoming">Upcoming (Akan Datang)</option>
                      <option value="Live">Live (Sedang Berlangsung)</option>
                      <option value="Finished">Finished (Selesai)</option>
                    </select>
                  </div>

                  {(fixStatus === 'Finished' || fixStatus === 'Live') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">Skor Home</label>
                        <input
                          type="number"
                          value={fixHomeScore}
                          onChange={(e) => setFixHomeScore(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">Skor Away</label>
                        <input
                          type="number"
                          value={fixAwayScore}
                          onChange={(e) => setFixAwayScore(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-[#0d0f14] border border-zinc-700/60 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-save" />
                    <span>{editingFixId ? 'Simpan Perubahan Prediksi' : 'Terbitkan Prediksi Ke Cloud'}</span>
                  </button>
                </div>
              </form>

              {/* Daftar Prediksi Skor Saat Ini */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-list text-red-500" /> Daftar Prediksi Skor Terpasang ({fixtures.length})
                </h4>

                {fixtures.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#12151f] border border-zinc-800 text-xs text-zinc-400">
                    Belum ada data prediksi skor. Silakan tambahkan lewat formulir di atas.
                  </div>
                ) : (
                  fixtures.map((fix) => (
                    <div
                      key={fix.id}
                      className="p-3.5 rounded-2xl bg-[#12151f] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                            {fix.league}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            fix.status === 'Finished' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {fix.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white">
                          {fix.homeTeam} {fix.homeScore !== undefined ? `(${fix.homeScore})` : ''} <span className="text-red-500 font-normal text-xs px-1">VS</span> {fix.awayTeam} {fix.awayScore !== undefined ? `(${fix.awayScore})` : ''}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                          <span><i className="far fa-clock text-red-400 mr-1" />{fix.matchDate}</span>
                          <span className="text-emerald-400 font-bold"><i className="fas fa-bullseye mr-1" />Prediksi: {fix.prediction}</span>
                          {fix.odds && <span className="text-amber-400"><i className="fas fa-chart-line mr-1" />Odds: {fix.odds}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditFixtureClick(fix)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <i className="fas fa-edit" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus prediksi laga ${fix.homeTeam} vs ${fix.awayTeam}?`)) {
                              if (onDeleteFixture) onDeleteFixture(fix.id);
                              showToast('Prediksi skor berhasil dihapus dari Cloud!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <i className="fas fa-trash-alt" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STATISTIK & METRICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#12151f] border border-zinc-800 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center text-xl border border-red-500/20">
                    <i className="fas fa-newspaper" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-display block">
                      {articles.length}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">Total Artikel Terbit</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#12151f] border border-zinc-800 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl border border-purple-500/20">
                    <i className="fas fa-tags" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-display block">
                      {categories.length}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">Kategori Aktif</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#12151f] border border-zinc-800 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl border border-amber-500/20">
                    <i className="fas fa-eye" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white font-display block">
                      {articles.reduce((acc, a) => acc + (a.views || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">Total Pembaca (Views)</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Database Status Card */}
              <div className="p-6 rounded-2xl bg-[#12151f] border border-emerald-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fas fa-cloud-upload-alt text-emerald-400 text-base" />
                    <span>Sistem Cloud Auto-Sync Data Database</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>● Live Sync Aktif</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Seluruh berita, artikel baru, prediksi skor, dan data redaksi disinkronkan secara otomatis (<strong>Real-time Cloud Database Auto-Sync</strong>). Setiap perubahan yang dilakukan melalui Panel Admin ini akan langsung muncul secara serentak di semua perangkat pembaca (Smartphone, Tablet, PC, Laptop) di mana pun berada secara instant!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#0d0f14] border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
                    <i className="fas fa-mobile-alt text-emerald-400 text-sm" />
                    <span>Dukungan Lintas Device (HP & Laptop)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d0f14] border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
                    <i className="fas fa-bolt text-amber-400 text-sm" />
                    <span>Perubahan Langsung Live Tanpa Delay</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
