import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Swords,
  Zap,
  Check,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  User,
  Flame,
} from 'lucide-react';
import { OpponentData } from './ArenaX1Section';

export interface ArenaBattleHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentMateria: string;
  currentTopico?: string;
  timeLeft: number;
  maxTime?: number;
  userPoints: number;
  rivalPoints: number;
  userPatente: string;
  userRoundsWon: boolean[];
  rivalRoundsWon: boolean[];
  opponent: OpponentData;
  rivalStatusText: string;
  isRoundAnswered: boolean;
}

export const ArenaBattleHeader: React.FC<ArenaBattleHeaderProps> = ({
  currentQuestionIndex,
  totalQuestions,
  currentMateria,
  currentTopico,
  timeLeft,
  maxTime = 20,
  userPoints,
  rivalPoints,
  userPatente,
  userRoundsWon,
  rivalRoundsWon,
  opponent,
  rivalStatusText,
  isRoundAnswered,
}) => {
  // Calculate timer fraction for circular ring
  const timeProgress = Math.max(0, Math.min(1, timeLeft / maxTime));
  const circleRadius = 18;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - timeProgress * circleCircumference;
  const isTimeCritical = timeLeft <= 5 && !isRoundAnswered;

  // Calculate comparison tug-of-war percentages
  const totalScoreSum = userPoints + rivalPoints;
  let userDominancePercent = 50;
  let rivalDominancePercent = 50;

  if (totalScoreSum > 0) {
    userDominancePercent = Math.max(10, Math.min(90, Math.round((userPoints / totalScoreSum) * 100)));
    rivalDominancePercent = 100 - userDominancePercent;
  }

  // Who is winning
  const isUserWinning = userPoints > rivalPoints;
  const isTie = userPoints === rivalPoints;

  return (
    <div
      id="arena-battle-header-subsection"
      className="bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-3xl p-4 sm:p-6 text-white shadow-2xl space-y-4 sm:space-y-5 relative overflow-hidden"
    >
      {/* Subtle background ambient glow for the leader */}
      <div
        className={`absolute top-0 w-64 h-32 blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
          isUserWinning
            ? 'left-0 bg-indigo-500'
            : isTie
            ? 'left-1/3 bg-amber-500'
            : 'right-0 bg-rose-500'
        }`}
      />

      {/* 1. TOP BAR: ROUND INFO + CENTRAL COUNTDOWN TIMER + SPEED BONUS BADGE */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        {/* Left: Round & Topic */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-xs">
            <Swords className="w-3 h-3 text-indigo-400" />
            <span>
              Rodada {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold hidden md:inline truncate max-w-[150px]">
            {currentMateria}
          </span>
        </div>

        {/* Center: DYNAMIC COUNTDOWN TIMER (TOP) */}
        <div className="flex items-center gap-2">
          <div
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm border transition-all duration-300 shadow-sm select-none ${
              isTimeCritical
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/50 scale-105'
                : 'bg-slate-800/90 border-slate-700 text-slate-100'
            }`}
          >
            {/* SVG Circular Progress Ring */}
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={circleRadius}
                  className="text-slate-700/60"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={circleRadius}
                  className={`transition-all duration-300 ${
                    isTimeCritical ? 'text-rose-500' : 'text-indigo-400'
                  }`}
                  strokeWidth="4"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <Clock
                className={`absolute w-3 h-3 ${
                  isTimeCritical ? 'text-rose-400 animate-spin' : 'text-slate-400'
                }`}
              />
            </div>

            <div className="flex items-baseline gap-1">
              <span className="tabular-nums tracking-tight text-sm sm:text-base font-black">
                {timeLeft}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">seg</span>
            </div>

            {isTimeCritical && (
              <span className="hidden sm:inline-flex text-[9px] font-black uppercase text-rose-400 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800 animate-bounce">
                Rápido!
              </span>
            )}
          </div>
        </div>

        {/* Right: Speed Multiplier */}
        <div className="flex items-center gap-1.5 text-right">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
              Bônus Resposta
            </span>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>+{Math.round(50 + (timeLeft / maxTime) * 50)} pts máx</span>
            </span>
          </div>
          <div className="sm:hidden px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black flex items-center gap-1">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>+{Math.round(50 + (timeLeft / maxTime) * 50)}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN COMPARATIVE HUD: USER VS OPPONENT REAL-TIME SCORECARD */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* LEFT COLUMN (ALUNO / VOCÊ) */}
        <div className="col-span-5 flex items-center gap-2.5 sm:gap-3">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center border border-indigo-400/40 font-black text-indigo-300 text-xs sm:text-sm">
                VOCÊ
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[9px] text-white font-black">
              ★
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black text-white truncate">Você</h4>
              <span className="text-[9px] font-bold text-indigo-400 hidden sm:inline">
                ({userPatente})
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-lg font-black text-emerald-400 tabular-nums">
                {userPoints}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">pts</span>
            </div>

            {/* User Round Indicators (Mini-dots) */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isAnswered = idx < userRoundsWon.length;
                const isWon = userRoundsWon[idx];
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <div
                    key={`user-dot-${idx}`}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isAnswered
                        ? isWon
                          ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                          : 'bg-rose-500'
                        : isCurrent
                        ? 'bg-indigo-400 ring-2 ring-indigo-400/40 animate-ping'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                    title={`Rodada ${idx + 1}: ${
                      isAnswered ? (isWon ? 'Acertou' : 'Errou') : isCurrent ? 'Em andamento' : 'Pendente'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (VS BADGE + TUG-OF-WAR INDICATOR) */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-inner">
            <span className="text-[10px] sm:text-xs font-black tracking-tighter text-slate-300">
              VS
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mt-1 hidden sm:block">
            {isUserWinning ? 'Na Frente' : isTie ? 'Empatado' : 'Atrás'}
          </span>
        </div>

        {/* RIGHT COLUMN (OPONENTE / ADVERSÁRIO) */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-3 text-right flex-row-reverse sm:flex-row">
          <div className="min-w-0 flex flex-col items-end">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[9px] font-bold text-rose-400 hidden sm:inline">
                ({opponent.elo})
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[100px] sm:max-w-[120px]">
                {opponent.nome}
              </h4>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 justify-end">
              <span className="text-sm sm:text-lg font-black text-rose-400 tabular-nums">
                {rivalPoints}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">pts</span>
            </div>

            {/* Rival Round Indicators (Mini-dots) */}
            <div className="flex items-center gap-1 mt-1 justify-end">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isAnswered = idx < rivalRoundsWon.length;
                const isWon = rivalRoundsWon[idx];
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <div
                    key={`rival-dot-${idx}`}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isAnswered
                        ? isWon
                          ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                          : 'bg-rose-500'
                        : isCurrent
                        ? 'bg-rose-400 ring-2 ring-rose-400/40 animate-ping'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                    title={`Rodada ${idx + 1}: ${
                      isAnswered ? (isWon ? 'Acertou' : 'Errou') : isCurrent ? 'Em andamento' : 'Pendente'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 p-0.5 shadow-lg shadow-rose-500/20">
              <img
                src={opponent.avatar}
                alt={opponent.nome}
                className="w-full h-full rounded-[14px] object-cover border border-rose-300/40"
              />
            </div>
            <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-[9px] text-white font-black">
              ⚔
            </span>
          </div>
        </div>
      </div>

      {/* 3. COMPARATIVE TUG-OF-WAR PROGRESS BAR (SIMULADOR DE AVANÇO EM TEMPO REAL) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black px-1">
          <div className="flex items-center gap-1 text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            <span>Domínio: {userDominancePercent}%</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
            <Flame className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Disputa em Tempo Real</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span>{rivalDominancePercent}%</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          </div>
        </div>

        {/* Animated Double-Gradient Bar */}
        <div className="relative w-full h-3.5 sm:h-4 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex shadow-inner p-0.5">
          {/* User Progress Bar */}
          <motion.div
            className="h-full rounded-l-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 relative"
            initial={false}
            animate={{ width: `${userDominancePercent}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </motion.div>

          {/* Center Dividing Notch with Sword Indicator */}
          <div className="w-0.5 h-full bg-white/60 z-10 shrink-0 shadow-sm" />

          {/* Rival Progress Bar */}
          <motion.div
            className="h-full rounded-r-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 relative"
            initial={false}
            animate={{ width: `${rivalDominancePercent}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </motion.div>
        </div>

        {/* Live Rival Activity & Speed Guidance Footer */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-0.5 px-1">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Responda rápido para somar até 100 pts</span>
          </span>

          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span className="text-slate-300">{opponent.nome}:</span>
            <span
              className={`transition-colors ${
                rivalStatusText.includes('Acertou')
                  ? 'text-emerald-400'
                  : rivalStatusText.includes('Errou')
                  ? 'text-rose-400'
                  : 'text-amber-300'
              }`}
            >
              {rivalStatusText}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default ArenaBattleHeader;
