import React, { useState, useMemo } from 'react';
import {
  Swords,
  Trophy,
  Search,
  Filter,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Users,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  Award
} from 'lucide-react';
import { DuelResultLog } from '../types';

interface ArenaMyDuelsTabProps {
  duels: DuelResultLog[];
  onOpenScoreModal: (duel: DuelResultLog) => void;
  onStartRematch: (duel: DuelResultLog) => void;
  onStartNewQuickMatch: () => void;
}

export const ArenaMyDuelsTab: React.FC<ArenaMyDuelsTabProps> = ({
  duels,
  onOpenScoreModal,
  onStartRematch,
  onStartNewQuickMatch,
}) => {
  const [filter, setFilter] = useState<'todos' | 'vitorias' | 'derrotas' | 'amigos' | 'ranqueadas'>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate high-level summary metrics
  const totalDuels = duels.length;
  const totalVictories = duels.filter((d) => d.winner === 'player1').length;
  const totalDefeats = duels.filter((d) => d.winner === 'player2').length;
  const totalTies = duels.filter((d) => d.winner === 'tie').length;
  const winRate = totalDuels > 0 ? Math.round((totalVictories / totalDuels) * 100) : 0;
  const totalXPEarned = duels.reduce((acc, d) => acc + (d.xpAwarded || 0), 0);

  // Filtered and searched list
  const filteredDuels = useMemo(() => {
    return duels.filter((duel) => {
      // Filter tab
      if (filter === 'vitorias' && duel.winner !== 'player1') return false;
      if (filter === 'derrotas' && duel.winner !== 'player2') return false;
      if (filter === 'amigos' && duel.mode !== '1v1_amigo') return false;
      if (filter === 'ranqueadas' && duel.mode === '1v1_amigo') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOpponent = duel.player2Name?.toLowerCase().includes(q);
        const matchCourse = duel.player2Course?.toLowerCase().includes(q);
        const matchMateria = duel.materia?.toLowerCase().includes(q);
        const matchTopico = duel.topico?.toLowerCase().includes(q);
        if (!matchOpponent && !matchCourse && !matchMateria && !matchTopico) {
          return false;
        }
      }

      return true;
    });
  }, [duels, filter, searchQuery]);

  return (
    <div id="arena-my-duels-tab-container" className="space-y-6 animate-fadeIn">
      {/* 1. ESTATÍSTICAS RESUMIDAS DO USUÁRIO EM DUELOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total de Duelos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
            ⚔️
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              Total de Duelos
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {totalDuels} <span className="text-xs text-slate-400 font-semibold">partidas</span>
            </div>
          </div>
        </div>

        {/* Taxa de Vitória (Winrate) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            📈
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              Aproveitamento
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {winRate}% <span className="text-xs text-slate-400 font-semibold">win rate</span>
            </div>
          </div>
        </div>

        {/* Vitórias / Derrotas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            🏆
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              Vitórias / Derrotas
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              <span className="text-emerald-500">{totalVictories}V</span>{' '}
              <span className="text-slate-400 text-sm">/</span>{' '}
              <span className="text-rose-500">{totalDefeats}D</span>
              {totalTies > 0 && <span className="text-indigo-400 text-xs ml-1">({totalTies}E)</span>}
            </div>
          </div>
        </div>

        {/* XP Acumulado */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              XP em Duelos
            </span>
            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
              +{totalXPEarned} <span className="text-xs font-semibold">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROLES: FILTROS + BUSCA + NOVO DUELO */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Filtros em Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {(
            [
              { id: 'todos', label: 'Todos' },
              { id: 'vitorias', label: 'Vitórias' },
              { id: 'derrotas', label: 'Derrotas' },
              { id: 'amigos', label: 'Amigos (1v1)' },
              { id: 'ranqueadas', label: 'Ranqueadas' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Busca e Ação Rápida */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar oponente ou matéria..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={onStartNewQuickMatch}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 whitespace-nowrap transition-all cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Duelo 1v1</span>
            <span className="sm:hidden">Duelo</span>
          </button>
        </div>
      </div>

      {/* 3. LISTAGEM DE RESULTADOS RECENTES */}
      {filteredDuels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl mx-auto">
            ⚔️
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Nenhum duelo encontrado
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? 'Nenhuma partida corresponde aos termos da sua busca. Tente buscar por outro oponente ou matéria.'
                : 'Você ainda não disputou partidas com esse filtro. Que tal desafiar um vestibulando agora?'}
            </p>
          </div>
          <button
            onClick={onStartNewQuickMatch}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Iniciar Partida Rápida</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDuels.map((duel) => {
            const isUserWinner = duel.winner === 'player1';
            const isTie = duel.winner === 'tie';
            const formattedTime = new Date(duel.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Dot indicators for rounds
            const totalRounds = duel.totalQuestions || 5;
            const roundsArray = Array.from({ length: totalRounds }, (_, i) => {
              const won = i < duel.player1Score;
              return won;
            });

            return (
              <div
                key={duel.id}
                id={`duel-card-${duel.id}`}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Lado Esquerdo: Adversário + Avatar + Detalhes */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar do Oponente */}
                  <div className="relative shrink-0">
                    {duel.player2Avatar ? (
                      <img
                        src={duel.player2Avatar}
                        alt={duel.player2Name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {duel.player2Name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-xs">
                      {isUserWinner ? '👑' : '⚔️'}
                    </span>
                  </div>

                  {/* Informações do Oponente e Matéria */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        vs. {duel.player2Name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          duel.mode === '1v1_amigo'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30'
                        }`}
                      >
                        {duel.mode === '1v1_amigo' ? 'Amigo' : 'Ranqueada'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {duel.materia || 'Geral ENEM'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{duel.player2Course || 'Vestibulando'}</span>
                      <span>•</span>
                      <span className="text-slate-400">{formattedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Centro: Placar Geral + Indicadores de Rodadas */}
                <div className="flex items-center justify-between sm:justify-center gap-6 py-2 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  {/* Placar Numérico */}
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 justify-center">
                      <span className={duel.player1Score > duel.player2Score ? 'text-emerald-500 font-black' : 'text-slate-700 dark:text-slate-200'}>
                        Você {duel.player1Score}
                      </span>
                      <span className="text-slate-400 text-xs">x</span>
                      <span className={duel.player2Score > duel.player1Score ? 'text-rose-500 font-black' : 'text-slate-700 dark:text-slate-200'}>
                        {duel.player2Score} {duel.player2Name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      Placar Geral ({totalRounds} rodadas)
                    </span>
                  </div>

                  {/* Visual Round Dots */}
                  <div className="flex items-center gap-1">
                    {roundsArray.map((won, idx) => (
                      <div
                        key={idx}
                        title={`Rodada ${idx + 1}: ${won ? 'Você acertou' : 'Você errou'}`}
                        className={`w-2.5 h-2.5 rounded-full ${
                          won ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Lado Direito: Tag de Resultado + Ações */}
                <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
                  {/* Tag de Resultado & XP */}
                  <div className="text-right">
                    <div
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl inline-flex items-center gap-1 ${
                        isUserWinner
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : isTie
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isUserWinner ? 'Vitória' : isTie ? 'Empate' : 'Derrota'}
                    </div>
                    {duel.xpAwarded ? (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                        +{duel.xpAwarded} XP
                      </span>
                    ) : null}
                  </div>

                  {/* Botão Ver Placar por Rodada */}
                  <button
                    id={`btn-ver-placar-rodada-${duel.id}`}
                    onClick={() => onOpenScoreModal(duel)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Ver placar e respostas de cada rodada"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Placar por Rodada</span>
                  </button>

                  {/* Botão Revanche */}
                  <button
                    id={`btn-revanche-${duel.id}`}
                    onClick={() => onStartRematch(duel)}
                    className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title={`Desafiar ${duel.player2Name} novamente`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Revanche</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
