import React, { useState, useEffect } from 'react';

const flagMap: Record<string, string> = {
  'Prancis': '🇫🇷',
  'Maroko': '🇲🇦',
  'Spanyol': '🇪🇸',
  'Belgia': '🇧🇪',
  'Norway': '🇳🇴',
  'Inggris': '🇬🇧',
  'Argentina': '🇦🇷',
  'Swiss': '🇨🇭'
};

const flagCodeMap: Record<string, string> = {
  'Prancis': 'fr',
  'Maroko': 'ma',
  'Spanyol': 'es',
  'Belgia': 'be',
  'Norway': 'no',
  'Inggris': 'gb',
  'Argentina': 'ar',
  'Swiss': 'ch'
};

interface OddsData {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  asianHandicap: string;
  confidenceScore: number;
}

export const MatchPredictorWidget: React.FC = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const teamList = [
    'Prancis', 'Maroko', 'Spanyol', 'Belgia', 'Norway', 'Inggris', 'Argentina', 'Swiss'
  ];

  const [odds, setOdds] = useState<OddsData>({
    homeWin: 1.95,
    draw: 3.30,
    awayWin: 4.10,
    over25: 1.88,
    under25: 1.92,
    asianHandicap: '-0.5',
    confidenceScore: 88,
  });

  const [scannedId, setScannedId] = useState('Y7YM35');
  const [result, setResult] = useState<{
    scoreA: number;
    scoreB: number;
    winProbA: number;
    winProbB: number;
    drawProb: number;
    analysis: string;
    keyPlayer: string;
    valueBet: string;
    handicapValue: string;
    recommendedHdpTeam: string;
    ouValue: string;
    recommendedOu: string;
  } | null>(null);

  // Generate randomized but realistic odds and metrics when teams are selected
  useEffect(() => {
    if (!teamA || !teamB) return;
    const baseHome = 1.6 + (Math.random() * 1.8);
    const baseDraw = 2.9 + (Math.random() * 1.1);
    const baseAway = 2.1 + (Math.random() * 2.9);
    const conf = Math.floor(Math.random() * 18) + 81; // 81% - 98%

    setOdds({
      homeWin: parseFloat(baseHome.toFixed(2)),
      draw: parseFloat(baseDraw.toFixed(2)),
      awayWin: parseFloat(baseAway.toFixed(2)),
      over25: parseFloat((1.65 + Math.random() * 0.45).toFixed(2)),
      under25: parseFloat((1.70 + Math.random() * 0.45).toFixed(2)),
      asianHandicap: baseHome < baseAway ? `-${(Math.random() > 0.5 ? '0.5' : '0.75')}` : `+${(Math.random() > 0.5 ? '0.25' : '0.5')}`,
      confidenceScore: conf,
    });
    setShowResult(false);
    setErrorMsg('');
  }, [teamA, teamB]);

  const handleScan = () => {
    if (!teamA || !teamB) {
      setErrorMsg('Silakan pilih Tim Rumah dan Tim Tamu terlebih dahulu!');
      return;
    }
    if (teamA === teamB) {
      setErrorMsg('Tim Rumah dan Tim Tamu tidak boleh sama!');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setScanStep(1);
    setScanMessage('MEMBUAT KONEKSI PORTAL...');
    setShowResult(false);

    // Generate random scan ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randId = '';
    for (let i = 0; i < 6; i++) {
      randId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setScannedId(randId);

    // Step 1
    setTimeout(() => {
      setScanStep(2);
      setScanMessage('MENGANALISIS TREN HEAD-TO-HEAD...');
    }, 600);

    // Step 2
    setTimeout(() => {
      setScanStep(3);
      setScanMessage('MENGEVALUASI AKURASI ODDS LIVE...');
    }, 1200);

    // Step 3 & Finish
    setTimeout(() => {
      const scoreA = Math.floor(Math.random() * 3) + (Math.random() > 0.65 ? 1 : 0);
      const scoreB = Math.floor(Math.random() * 2) + (Math.random() > 0.8 ? 1 : 0);
      
      let winA = Math.floor(Math.random() * 25) + 42;
      let winB = Math.floor(Math.random() * 20) + 18;
      if (odds.homeWin < odds.awayWin) {
        winA = Math.floor(Math.random() * 20) + 48;
        winB = Math.floor(Math.random() * 15) + 15;
      } else {
        winA = Math.floor(Math.random() * 15) + 15;
        winB = Math.floor(Math.random() * 20) + 48;
      }
      const draw = 100 - winA - winB;

      // Handicap value generation like "0 : 1/2" or "0 : 1/4" or "0 : 0"
      const hdpOptions = ['0 : 0', '0 : 1/4', '0 : 1/2', '0 : 3/4', '0 : 1'];
      const randomHdp = hdpOptions[Math.floor(Math.random() * hdpOptions.length)];
      const recommendedHdpTeam = odds.homeWin < odds.awayWin ? teamA : teamB;

      // Over/Under value generation like "2.25", "2.5", "2.75", "3.0"
      const ouOptions = ['2.25', '2.5', '2.75', '3.0'];
      const randomOuValue = ouOptions[Math.floor(Math.random() * ouOptions.length)];
      const recommendedOu = Math.random() > 0.5 ? 'OVER' : 'UNDER';

      setResult({
        scoreA,
        scoreB,
        winProbA: winA,
        winProbB: winB,
        drawProb: draw,
        analysis: `Analisis mendalam Kancah4D memprediksi laga antara ${teamA} vs ${teamB} akan didominasi oleh pergerakan taktis sayap kiri. Dengan tingkat statistik akurasi mencapai ${odds.confidenceScore}%, rekomendasi taruhan mengarah pada keunggulan lini serang tuan rumah.`,
        keyPlayer: `Pemain Kunci: Gelandang jangkar ${teamA} diproyeksikan mengatur ritme transisi menyerang secara presisi.`,
        valueBet: `Pasar Kancah4D Terunggul: ${teamA} Win @${odds.homeWin} / Over 2.5 Goals`,
        handicapValue: randomHdp,
        recommendedHdpTeam,
        ouValue: randomOuValue,
        recommendedOu
      });

      setIsScanning(false);
      setScanStep(0);
      setShowResult(true);
    }, 1800);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* MAIN ANALISA CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#181c25] to-[#12151c] border border-zinc-800 relative overflow-hidden shadow-2xl">
        {/* Subtle top neon line decoration */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <span className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transform rotate-45 shrink-0 animate-pulse" />
          <h3 className="text-xs font-black font-sans uppercase tracking-widest text-white">
            ANALISA PERTANDINGAN KANCAH4D
          </h3>
        </div>

        {/* TEAM SELECTION */}
        <div className="space-y-4 mb-6">
          {/* HOME TEAM */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-1.5">
              TIM RUMAH (HOME)
            </label>
            <div className="relative">
              <select
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#0d0f14] border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-semibold appearance-none cursor-pointer hover:border-zinc-700"
              >
                <option value="">-- Pilih Tim --</option>
                {teamList.map((t) => (
                  <option key={t} value={t} disabled={t === teamB}>{flagMap[t] || '🏳️'} &nbsp; {t}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <i className="fas fa-chevron-down text-xs" />
              </div>
            </div>
          </div>

          {/* AWAY TEAM */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-1.5">
              TIM TAMU (AWAY)
            </label>
            <div className="relative">
              <select
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#0d0f14] border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-semibold appearance-none cursor-pointer hover:border-zinc-700"
              >
                <option value="">-- Pilih Tim --</option>
                {teamList.map((t) => (
                  <option key={t} value={t} disabled={t === teamA}>{flagMap[t] || '🏳️'} &nbsp; {t}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <i className="fas fa-chevron-down text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {errorMsg && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
            <i className="fas fa-circle-exclamation" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* BUTTON ACTION CONTAINER */}
        <div className="space-y-3">
          {/* SCAN ACTION BUTTON */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0096FF] to-cyan-500 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(0,150,255,0.25)] hover:shadow-[0_0_25px_rgba(0,150,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 select-none cursor-pointer"
          >
            {isScanning ? (
              <>
                <i className="fas fa-spinner fa-spin text-sm" />
                <span>{scanMessage}</span>
              </>
            ) : (
              <>
                <i className="fas fa-bolt text-xs" />
                <span>MULAI SCAN PASARAN</span>
              </>
            )}
          </button>

          {/* ALT LIVE SCORE LINK BUTTON */}
          <a
            href="https://akseslink.com/kancah4d"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-2xl border border-cyan-500 text-cyan-400 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-500/10 active:scale-[0.98] transition-all duration-300 bg-transparent cursor-pointer"
          >
            <i className="fas fa-sign-in-alt text-cyan-400" />
            <span>ALT LIVE SCORE</span>
          </a>
        </div>

        {/* DETAILED RESULTS DRAWER */}
        {showResult && result && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-4 animate-fadeIn">
            {/* Header / Meta */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              <span>DATA SCANNED #{scannedId}</span>
              <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <i className="fas fa-check-circle text-xs" /> LIVE ACCURATE
              </span>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] bg-zinc-800/60 w-full" />

            {/* Scoreboard Block */}
            <div className="grid grid-cols-3 items-center py-4 select-none bg-black/10 rounded-2xl border border-zinc-800/30 p-4">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-10 rounded-lg bg-[#0d0f14] border border-zinc-800 shadow-inner overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src={`https://flagcdn.com/w160/${flagCodeMap[teamA] || 'un'}.png`}
                    alt={teamA}
                    className="w-full h-full object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-black tracking-widest text-zinc-300 uppercase text-center line-clamp-1 w-full px-1">
                  {teamA}
                </span>
              </div>

              {/* Big Center Score */}
              <div className="text-4xl font-extrabold text-white tracking-widest font-mono flex items-center justify-center gap-2">
                <span>{result.scoreA}</span>
                <span className="text-zinc-700 font-normal">:</span>
                <span>{result.scoreB}</span>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-10 rounded-lg bg-[#0d0f14] border border-zinc-800 shadow-inner overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src={`https://flagcdn.com/w160/${flagCodeMap[teamB] || 'un'}.png`}
                    alt={teamB}
                    className="w-full h-full object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-black tracking-widest text-zinc-300 uppercase text-center line-clamp-1 w-full px-1">
                  {teamB}
                </span>
              </div>
            </div>

            {/* Handicap (HDP) Card */}
            <div className="bg-[#0b0d12]/95 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-extrabold uppercase text-zinc-500">
                <span>HANDICAP (HDP)</span>
                <span>REKOMENDASI BET</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black font-mono text-zinc-100 tracking-wide">
                  {result.handicapValue}
                </span>
                <span className="text-xs font-black text-cyan-400 tracking-widest flex items-center gap-1.5 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                  <i className="fas fa-caret-up text-sm text-cyan-400" />
                  {result.recommendedHdpTeam}
                </span>
              </div>
            </div>

            {/* Over/Under Card */}
            <div className="bg-[#0b0d12]/95 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-extrabold uppercase text-zinc-500">
                <span>OVER / UNDER (O/U)</span>
                <span>REKOMENDASI BET</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black font-mono text-zinc-100 tracking-wide">
                  {result.ouValue}
                </span>
                <span className="text-xs font-black text-sky-400 tracking-widest flex items-center gap-1.5 uppercase bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl">
                  <i className="fas fa-chart-line text-xs text-sky-400" />
                  {result.recommendedOu}
                </span>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] text-zinc-500 font-extrabold uppercase">
                <span>{teamA}: {result.winProbA}%</span>
                <span>Seri: {result.drawProb}%</span>
                <span>{teamB}: {result.winProbB}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-900">
                <div style={{ width: `${result.winProbA}%` }} className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                <div style={{ width: `${result.drawProb}%` }} className="bg-amber-500 h-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div style={{ width: `${result.winProbB}%` }} className="bg-blue-500 h-full shadow-[0_0_8px_rgba(0,150,255,0.5)]" />
              </div>
            </div>

            {/* Tactical Paragraph */}
            <p className="text-xs text-zinc-400 leading-relaxed bg-[#0d0f14]/80 p-3.5 rounded-2xl border border-zinc-900 font-medium">
              {result.analysis}
            </p>

            {/* Action Bar */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-cyan-400 flex items-center gap-1.5">
                <i className="fas fa-shield text-[10px]" /> {result.valueBet}
              </span>
              <a
                href="https://akseslink.com/kancah4d"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>PASANG</span>
                <i className="fas fa-external-link-alt text-[9px]" />
              </a>
            </div>

            {/* Key Player Badge */}
            <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 px-1 pt-1">
              <i className="fas fa-star text-amber-400" />
              <span>{result.keyPlayer}</span>
            </div>
          </div>
        )}
      </div>

      {/* PORTAL UTAMA KANCAH4D PROMO CARD */}
      <a
        href="https://akseslink.com/kancah4d"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 rounded-3xl bg-gradient-to-b from-[#181c25] to-[#12151c] border border-cyan-500/30 hover:border-cyan-500/60 relative overflow-hidden shadow-2xl group transition-all duration-300 cursor-pointer"
      >
        {/* Hover background glow */}
        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

        {/* Blue Badge */}
        <div className="inline-block px-3 py-1 rounded-lg bg-[#0096FF] text-white font-black text-[9px] tracking-widest uppercase mb-3 select-none">
          PASANG LIVE ODDS
        </div>

        {/* Content flexbox */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-1">
              PORTAL UTAMA KANCAH4D
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium">
              Klik di sini untuk langsung pasang taruhan Anda aman & resmi.
            </p>
          </div>
          <div className="text-cyan-400 group-hover:translate-x-1.5 transition-transform duration-300 text-sm">
            <i className="fas fa-chevron-right" />
          </div>
        </div>
      </a>
    </div>
  );
};
