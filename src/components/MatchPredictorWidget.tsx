import React, { useState, useEffect } from 'react';

interface OddsData {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  asianHandicap: string;
  homeTrend: 'up' | 'down' | 'stable';
  awayTrend: 'up' | 'down' | 'stable';
  confidenceScore: number;
  formScoreA: number;
  formScoreB: number;
}

export const MatchPredictorWidget: React.FC = () => {
  const [teamA, setTeamA] = useState('Meksiko');
  const [teamB, setTeamB] = useState('Afrika Selatan');
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveOddsActive, setLiveOddsActive] = useState(true);

  const teamList = [
    'Meksiko', 'Afrika Selatan', 'Amerika Serikat', 'Paraguay', 'Kanada', 'Nigeria',
    'Brasil', 'Argentina', 'Indonesia', 'Jepang', 'Prancis', 'Spanyol',
    'Jerman', 'Inggris', 'Portugal', 'Belanda', 'Uruguay', 'Kroasia'
  ];

  const [odds, setOdds] = useState<OddsData>({
    homeWin: 1.95,
    draw: 3.30,
    awayWin: 4.10,
    over25: 1.88,
    under25: 1.92,
    asianHandicap: '-0.5 / 1.0',
    homeTrend: 'stable',
    awayTrend: 'stable',
    confidenceScore: 88,
    formScoreA: 82,
    formScoreB: 68,
  });

  const [result, setResult] = useState<{
    score: string;
    winProbA: number;
    winProbB: number;
    drawProb: number;
    analysis: string;
    keyPlayer: string;
    valueBet: string;
  } | null>(null);

  // Recalculate baseline odds when teams change
  useEffect(() => {
    const baseHome = 1.8 + (Math.random() * 1.5);
    const baseDraw = 3.1 + (Math.random() * 0.8);
    const baseAway = 2.5 + (Math.random() * 2.5);
    const conf = Math.floor(Math.random() * 20) + 78;

    setOdds({
      homeWin: parseFloat(baseHome.toFixed(2)),
      draw: parseFloat(baseDraw.toFixed(2)),
      awayWin: parseFloat(baseAway.toFixed(2)),
      over25: parseFloat((1.75 + Math.random() * 0.35).toFixed(2)),
      under25: parseFloat((1.80 + Math.random() * 0.35).toFixed(2)),
      asianHandicap: baseHome < baseAway ? `-${(Math.random() > 0.5 ? 0.5 : 0.75)}` : `+${(Math.random() > 0.5 ? 0.25 : 0.5)}`,
      homeTrend: 'stable',
      awayTrend: 'stable',
      confidenceScore: conf,
      formScoreA: Math.floor(Math.random() * 25) + 70,
      formScoreB: Math.floor(Math.random() * 30) + 60,
    });
  }, [teamA, teamB]);

  // Real-time odds fluctuation ticker simulation
  useEffect(() => {
    if (!liveOddsActive) return;

    const interval = setInterval(() => {
      setOdds((prev) => {
        const deltaHome = (Math.random() - 0.5) * 0.08;
        const deltaAway = (Math.random() - 0.5) * 0.08;
        const newHome = Math.max(1.10, parseFloat((prev.homeWin + deltaHome).toFixed(2)));
        const newAway = Math.max(1.10, parseFloat((prev.awayWin + deltaAway).toFixed(2)));

        return {
          ...prev,
          homeWin: newHome,
          awayWin: newAway,
          homeTrend: deltaHome > 0.01 ? 'up' : deltaHome < -0.01 ? 'down' : 'stable',
          awayTrend: deltaAway > 0.01 ? 'up' : deltaAway < -0.01 ? 'down' : 'stable',
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveOddsActive]);

  const handleGenerate = () => {
    if (!teamA || !teamB || teamA === teamB) return;
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const scoreA = Math.floor(Math.random() * 3) + 1;
      const scoreB = Math.floor(Math.random() * 2);
      const winA = Math.floor(Math.random() * 25) + 40;
      const winB = Math.floor(Math.random() * 20) + 20;
      const draw = 100 - winA - winB;

      setResult({
        score: `${scoreA} - ${scoreB}`,
        winProbA: winA,
        winProbB: winB,
        drawProb: draw,
        analysis: `Pertandingan antara ${teamA} dan ${teamB} diprediksi dominan oleh ${teamA}. Dengan tingkat kepercayaan statistik ${odds.confidenceScore}%, pola taktikal menunjukkan transisi cepat dan konversi serangan sebesar ${winA}%.`,
        keyPlayer: `Pemain Kunci: Penyerang sayap ${teamA} diproyeksi menjadi pencetak gol utama.`,
        valueBet: `Rekomendasi Pasar Kancah4D: ${teamA} Win @${odds.homeWin} / Over 2.5 Goals`
      });
      setIsGenerating(false);
    }, 1100);
  };

  return (
    <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[var(--card)] via-[var(--bg2)] to-[var(--card)] border border-[var(--border)] relative overflow-hidden shadow-xl">
      {/* HEADER WITH LIVE TICKER BADGE */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)] flex-wrap gap-2">
        <h3 className="text-sm font-extrabold font-display uppercase tracking-wider text-[var(--fg)] flex items-center gap-2">
          <i className="fas fa-trophy text-[var(--accent)]" /> PREDIKSI PIALA DUNIA 2026
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveOddsActive(!liveOddsActive)}
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all border ${
              liveOddsActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-[var(--bg3)] text-[var(--fg3)] border-[var(--border)]'
            }`}
            title="Toggle Live Odds Feed Simulation"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${liveOddsActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-400'}`} />
            {liveOddsActive ? 'LIVE ODDS FEED' : 'ODDS PAUSED'}
          </button>
        </div>
      </div>

      {/* TEAM SELECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--fg3)] mb-1">
            Tim Tuan Rumah (Home):
          </label>
          <select
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg3)] border border-[var(--border)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] font-semibold"
          >
            {teamList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[var(--fg3)] mb-1">
            Tim Tamu (Away):
          </label>
          <select
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg3)] border border-[var(--border)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] font-semibold"
          >
            {teamList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DYNAMIC REAL-TIME ODDS MARKET DISPLAY */}
      <div className="mb-4 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-2 text-[10px] font-extrabold uppercase text-[var(--fg3)] tracking-wider">
          <span className="flex items-center gap-1">
            <i className="fas fa-chart-line text-[var(--accent)]" /> Pasaran Odds Kancah4D Live
          </span>
          <span className="text-[var(--accent-l)] font-mono">
            Kepercayaan Statistik: {odds.confidenceScore}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* HOME ODDS */}
          <div className="p-2 rounded-lg bg-[var(--bg2)] border border-[var(--border)] relative">
            <span className="text-[10px] text-[var(--fg3)] block font-bold truncate">{teamA} (1)</span>
            <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              {odds.homeWin.toFixed(2)}
              {odds.homeTrend === 'up' && <i className="fas fa-arrow-up text-[9px] text-emerald-400" />}
              {odds.homeTrend === 'down' && <i className="fas fa-arrow-down text-[9px] text-rose-400" />}
            </div>
          </div>

          {/* DRAW ODDS */}
          <div className="p-2 rounded-lg bg-[var(--bg2)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--fg3)] block font-bold">Seri (X)</span>
            <div className="text-sm font-black text-amber-400 mt-0.5">
              {odds.draw.toFixed(2)}
            </div>
          </div>

          {/* AWAY ODDS */}
          <div className="p-2 rounded-lg bg-[var(--bg2)] border border-[var(--border)] relative">
            <span className="text-[10px] text-[var(--fg3)] block font-bold truncate">{teamB} (2)</span>
            <div className="text-sm font-black text-[var(--accent-l)] flex items-center justify-center gap-1 mt-0.5">
              {odds.awayWin.toFixed(2)}
              {odds.awayTrend === 'up' && <i className="fas fa-arrow-up text-[9px] text-emerald-400" />}
              {odds.awayTrend === 'down' && <i className="fas fa-arrow-down text-[9px] text-rose-400" />}
            </div>
          </div>
        </div>

        {/* ASIAN HANDICAP & GOALS OVER/UNDER */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--fg2)]">
          <div className="flex justify-between px-2 py-1 rounded bg-[var(--bg3)]">
            <span className="font-semibold text-[var(--fg3)]">Asian HDP:</span>
            <span className="font-bold text-[var(--fg)]">{odds.asianHandicap}</span>
          </div>
          <div className="flex justify-between px-2 py-1 rounded bg-[var(--bg3)]">
            <span className="font-semibold text-[var(--fg3)]">Over/Under 2.5:</span>
            <span className="font-bold text-[var(--accent-l)]">{odds.over25} / {odds.under25}</span>
          </div>
        </div>
      </div>

      {/* GENERATE PREDICTION BUTTON */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || teamA === teamB}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] text-white text-xs font-bold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin" /> Menganalisis Taktik & Algoritma Odds...
          </>
        ) : (
          <>
            <i className="fas fa-calculator" /> Kalkulasi Prediksi & Rekomendasi Odds
          </>
        )}
      </button>

      {/* RESULT PANEL */}
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--bg2)] border border-[var(--accent)]/30 space-y-3 animate-fadeIn">
          <div className="text-center">
            <span className="text-[10px] text-[var(--fg3)] uppercase font-bold tracking-wider">
              Hasil Estimasi Skor KANCAHTOTO:
            </span>
            <div className="text-2xl font-black font-display text-[var(--accent-l)] mt-0.5">
              {teamA} {result.score} {teamB}
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-[var(--fg2)] font-semibold">
              <span>Peluang {teamA}: {result.winProbA}%</span>
              <span>Seri: {result.drawProb}%</span>
              <span>Peluang {teamB}: {result.winProbB}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg3)] rounded-full overflow-hidden flex">
              <div style={{ width: `${result.winProbA}%` }} className="bg-[var(--accent)] h-full" />
              <div style={{ width: `${result.drawProb}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${result.winProbB}%` }} className="bg-emerald-500 h-full" />
            </div>
          </div>

          <p className="text-xs text-[var(--fg2)] leading-relaxed bg-[var(--card)] p-2.5 rounded-lg border border-[var(--border)]">
            {result.analysis}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[var(--card)] p-2.5 rounded-lg border border-[var(--accent)]/20 text-[11px]">
            <div className="font-bold text-[var(--accent-l)] flex items-center gap-1.5">
              <i className="fas fa-bullseye" /> {result.valueBet}
            </div>
            <a
              href="https://akseslink.com/kancah4d"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-d)] text-white text-[10px] font-extrabold transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              Pasang di Kancah4D <i className="fas fa-external-link-alt text-[8px]" />
            </a>
          </div>

          <div className="text-[11px] font-bold text-[var(--fg2)] flex items-center gap-1">
            <i className="fas fa-star text-amber-400" /> {result.keyPlayer}
          </div>
        </div>
      )}
    </div>
  );
};

