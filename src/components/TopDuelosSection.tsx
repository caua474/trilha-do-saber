import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Swords,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { TopDuelist, DuelResultLog } from '../types';
import { getTopDuelistsThisWeek, clearAllDuelResults } from '../utils/db';

interface TopDuelosSectionProps {
  onStart1v1Duel?: () => void;
  currentUserName?: string;
}

export const TopDuelosSection: React.FC<TopDuelosSectionProps> = ({
  onStart1v1Duel,
  currentUserName = 'Você',
}) => {
  const [leaderboard, setLeaderboard] = useState<TopDuelist[]>([]);
  const [recentDuels, setRecentDuels] = useState<DuelResultLog[]>([]);
  const [userStats, setUserStats] = useState<{
    totalDuels: number;
    wins: number;
    defeats: number;
    ties: number;
    winRate: number;
    weeklyPoints: number;
    weeklyXp: number;
    currentRank: number;
  }>({
    totalDuels: 0,
    wins: 0,
    defeats: 0,
    ties: 0,
    winRate: 0,
    weeklyPoints: 0,
    weeklyXp: 0,
    currentRank: 5,
  });

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'recent_duels'>('leaderboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTopDuelistsThisWeek(currentUserName);
      setLeaderboard(data.leaderboard);
      setRecentDuels(data.recentDuels);
      setUserStats(data.userStats);
    } catch (err) {
      console.error('Erro ao carregar dados do Top Duelos do banco local:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserName]);

  const handleClearHistory = async () => {
    if (window.confirm('Deseja limpar todo o histórico de duelos salvos no banco local?')) {
      await clearAllDuelResults();
      await loadData();
    }
  };

  // Podium top 3
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div id="top-duelos-arena-section" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 fill-slate-950" /> Ranking Semanal da Arena
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Sincronizado com Banco Local
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              🏆 Top Duelos & Campeões da Semana
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Consulte os estudantes com maior pontuação e vitórias nos duelos 1v1 e Arena X1 desta semana. Participe de duelos para somar vitórias e subir no pódio!
            </p>
          </div>

          {/* Quick Action & User Rank Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-indigo-500/30 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-inner">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                #{userStats.currentRank}
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Sua Posição</span>
                <span className="text-xs font-black text-white">{userStats.weeklyPoints} pts • {userStats.wins} Vitórias</span>
              </div>
            </div>

            {onStart1v1Duel && (
              <button
                onClick={onStart1v1Duel}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 shrink-0"
              >
                <Swords className="w-4 h-4 fill-slate-950" />
                <span>Desafiar no 1v1 Agora!</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. USER STATS METRIC TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Vitórias no 1v1</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {userStats.wins}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Taxa de Vitória</span>
            <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {userStats.winRate}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Pontuação Semanal</span>
            <span className="text-base sm:text-lg font-black text-amber-500 tabular-nums">
              {userStats.weeklyPoints} pts
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">XP de Duelos</span>
            <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 tabular-nums">
              +{userStats.weeklyXp} XP
            </span>
          </div>
        </div>
      </div>

      {/* 3. PODIUM (TOP 3 DUELISTAS) */}
      {top1 && top2 && top3 && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-center space-y-1 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
              Pódio dos Melhores da Semana
            </span>
            <h4 className="text-lg font-black text-white">Campeões dos Duelos X1</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4">
            {/* 2nd Place (Left) */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-lg bg-slate-800">
                  <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-2 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow">
                  🥈 2
                </span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[90px] sm:max-w-[140px]">
                  {top2.name}
                </h5>
                <span className="text-[10px] text-slate-400 block truncate max-w-[90px] sm:max-w-[140px]">
                  {top2.curso}
                </span>
                <span className="text-xs font-black text-amber-300 block">{top2.vitorias} Vitórias</span>
                <span className="text-[10px] text-slate-400 font-bold">{top2.pontos} pts</span>
              </div>
              <div className="w-full h-16 sm:h-20 bg-slate-800/80 rounded-t-2xl border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-400 text-xs sm:text-sm">
                2º LUGAR
              </div>
            </div>

            {/* 1st Place (Center - Elevated) */}
            <div className="flex flex-col items-center text-center space-y-2 -mt-4">
              <div className="relative">
                <Crown className="w-6 h-6 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-800 ring-4 ring-amber-400/30">
                  <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-2.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-900 shadow-lg">
                  🥇 1
                </span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs sm:text-base font-black text-amber-300 truncate max-w-[110px] sm:max-w-[160px]">
                  {top1.name}
                </h5>
                <span className="text-[10px] sm:text-xs text-slate-300 block truncate max-w-[110px] sm:max-w-[160px]">
                  {top1.curso}
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 block">{top1.vitorias} Vitórias</span>
                <span className="text-[11px] text-amber-400 font-extrabold">{top1.pontos} pts</span>
              </div>
              <div className="w-full h-22 sm:h-28 bg-gradient-to-b from-amber-500/30 to-amber-600/10 rounded-t-2xl border-t-4 border-amber-400 flex flex-col items-center justify-center font-black text-amber-300 text-xs sm:text-base">
                <span>1º LUGAR</span>
                <span className="text-[10px] font-bold text-amber-200/80">Líder Regional</span>
              </div>
            </div>

            {/* 3rd Place (Right) */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-700 shadow-lg bg-slate-800">
                  <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-2 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow">
                  🥉 3
                </span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[90px] sm:max-w-[140px]">
                  {top3.name}
                </h5>
                <span className="text-[10px] text-slate-400 block truncate max-w-[90px] sm:max-w-[140px]">
                  {top3.curso}
                </span>
                <span className="text-xs font-black text-amber-300 block">{top3.vitorias} Vitórias</span>
                <span className="text-[10px] text-slate-400 font-bold">{top3.pontos} pts</span>
              </div>
              <div className="w-full h-14 sm:h-16 bg-slate-800/80 rounded-t-2xl border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-600 text-xs sm:text-sm">
                3º LUGAR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TABS: TABELA GERAL VS HISTÓRICO DE DUELOS DO BANCO LOCAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Tabela Geral da Semana ({leaderboard.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('recent_duels')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recent_duels'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Seus Duelos no Banco Local ({recentDuels.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Atualizar dados do banco local"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {recentDuels.length > 0 && activeTab === 'recent_duels' && (
              <button
                onClick={handleClearHistory}
                title="Limpar duelos locais"
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Histórico</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: LEADERBOARD LIST */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-2.5">
            {leaderboard.map((item) => {
              const isFirst = item.rank === 1;
              const isSecond = item.rank === 2;
              const isThird = item.rank === 3;
              const isUser = item.isCurrentUser;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isUser
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Name & Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h5>
                        {isUser && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-600 text-white">
                            Você
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] text-amber-500 font-bold hidden md:inline">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.curso} • <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.elo}</span>
                      </p>
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vitórias</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {item.vitorias}V / {item.derrotas}D ({item.winRate}%)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pontos</span>
                      <span className="text-xs sm:text-sm font-black text-amber-500 tabular-nums">
                        {item.pontos} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: RECENT DUELS LOGS FROM LOCAL DB */}
        {activeTab === 'recent_duels' && (
          <div className="space-y-3">
            {recentDuels.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center text-xl">
                  ⚔️
                </div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhum duelo registrado no banco local ainda
                </h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dispute uma batalha 1v1 online, contra o Bot ou no Modo Pass & Play para registrar suas vitórias no banco de dados IndexedDB!
                </p>
                {onStart1v1Duel && (
                  <button
                    onClick={onStart1v1Duel}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Iniciar Primeiro Duelo 1v1
                  </button>
                )}
              </div>
            ) : (
              recentDuels.map((duel) => {
                const isWin = duel.winner === 'player1';
                const isTie = duel.winner === 'tie';

                return (
                  <div
                    key={duel.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : isTie
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isWin ? 'V' : isTie ? 'E' : 'D'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {duel.player1Name} ({duel.player1Score}) vs {duel.player2Name} ({duel.player2Score})
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              isWin
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                : isTie
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isWin ? 'Vitória 🎉' : isTie ? 'Empate ⚖️' : 'Derrota'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {duel.materia} • {duel.topico} • {new Date(duel.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(duel.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-500 block">+{duel.xpAwarded} XP</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{duel.mode}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default TopDuelosSection;
