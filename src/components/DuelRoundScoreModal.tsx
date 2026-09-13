import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Swords,
  Award,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DuelResultLog, DuelRoundScore } from '../types';

interface DuelRoundScoreModalProps {
  duel: DuelResultLog;
  onClose: () => void;
  onRematch?: (duel: DuelResultLog) => void;
}

export const DuelRoundScoreModal: React.FC<DuelRoundScoreModalProps> = ({
  duel,
  onClose,
  onRematch,
}) => {
  // If roundsDetail is empty, synthesize fallback round details for display
  const rounds: DuelRoundScore[] =
    duel.roundsDetail && duel.roundsDetail.length > 0
      ? duel.roundsDetail
      : Array.from({ length: duel.totalQuestions || 5 }, (_, i) => {
          const p1Won = i < duel.player1Score;
          const p2Won = i < duel.player2Score;
          return {
            roundNumber: i + 1,
            questionTopic: `${duel.materia || 'Simulado ENEM'} - Questão ${i + 1}`,
            questionPreview: `Questão ${i + 1} de ${duel.materia || 'ENEM'}: Conceito avaliado na rodada.`,
            player1Correct: p1Won,
            player2Correct: p2Won,
            player1Points: p1Won ? 85 : 0,
            player2Points: p2Won ? 75 : 0,
            timeTakenSeconds: 3 + i * 2,
          };
        });

  const isUserWinner = duel.winner === 'player1';
  const isTie = duel.winner === 'tie';

  const totalUserPoints = rounds.reduce((acc, r) => acc + (r.player1Points || 0), 0);
  const totalRivalPoints = rounds.reduce((acc, r) => acc + (r.player2Points || 0), 0);

  const formattedDate = new Date(duel.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="duel-round-score-modal-backdrop"
      className="fixed inset-0 z-[100002] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isUserWinner
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-lg shadow-amber-500/20'
                  : isTie
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
              }`}
            >
              {isUserWinner ? '🏆' : isTie ? '🤝' : '⚔️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Placar Detalhado da Partida
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isUserWinner
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isTie
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isUserWinner ? 'Vitória' : isTie ? 'Empate' : 'Derrota'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="text-indigo-400 font-semibold">{duel.materia || 'Geral'}</span>
              </p>
            </div>
          </div>

          <button
            id="close-round-score-modal-button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HEAD TO HEAD BANNER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between gap-2">
            {/* Player 1 (User) */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                VC
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block truncate">
                  Você
                </span>
                <span className="text-[10px] text-indigo-300 font-medium block truncate">
                  {totalUserPoints > 0 ? `${totalUserPoints} pts` : `${duel.player1Score} acertos`}
                </span>
              </div>
            </div>

            {/* Score Big Display */}
            <div className="text-center px-3 shrink-0">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 justify-center">
                <span className={duel.player1Score > duel.player2Score ? 'text-emerald-400' : 'text-slate-200'}>
                  {duel.player1Score}
                </span>
                <span className="text-slate-600 text-sm">x</span>
                <span className={duel.player2Score > duel.player1Score ? 'text-rose-400' : 'text-slate-200'}>
                  {duel.player2Score}
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                {duel.totalQuestions || 5} Rodadas
              </span>
            </div>

            {/* Player 2 (Rival) */}
            <div className="flex items-center gap-3 justify-end text-right min-w-0">
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block truncate">
                  {duel.player2Name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  {duel.player2Elo || 'Rival da Arena'}
                </span>
              </div>
              {duel.player2Avatar ? (
                <img
                  src={duel.player2Avatar}
                  alt={duel.player2Name}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {duel.player2Name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROUND BY ROUND DETAILS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Desempenho por Rodada
            </h4>
            <span className="text-[11px] text-slate-400">
              {duel.xpAwarded ? `+${duel.xpAwarded} XP Concedido` : ''}
            </span>
          </div>

          <div className="space-y-2.5">
            {rounds.map((round) => {
              const roundWinner =
                round.player1Correct && !round.player2Correct
                  ? 'player1'
                  : round.player2Correct && !round.player1Correct
                  ? 'player2'
                  : 'draw';

              return (
                <div
                  key={round.roundNumber}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  {/* Round Header & Topic */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-black text-[11px] shrink-0">
                        {round.roundNumber}
                      </span>
                      <span className="font-bold text-slate-200 truncate">
                        {round.questionTopic || `Questão ${round.roundNumber}`}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {roundWinner === 'player1' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Ponto Seu 🏆
                        </span>
                      )}
                      {roundWinner === 'player2' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Ponto Rival
                        </span>
                      )}
                      {roundWinner === 'draw' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {round.player1Correct ? 'Ambos Acertaram' : 'Ambos Erraram'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question preview snippet if available */}
                  {round.questionPreview && (
                    <p className="text-[11px] text-slate-400 font-normal line-clamp-1 italic pl-1">
                      "{round.questionPreview}"
                    </p>
                  )}

                  {/* Round Comparison: User vs Rival */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                    {/* User Round Result */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 ${
                        round.player1Correct
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/30 border border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {round.player1Correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold">
                          {round.player1Correct ? 'Acertou' : 'Errou'}
                        </span>
                      </div>
                      <div className="text-right text-[10px] font-semibold text-slate-300">
                        {round.player1Points !== undefined && round.player1Points > 0 && (
                          <span className="text-emerald-400 font-bold">+{round.player1Points} pts</span>
                        )}
                        {round.timeTakenSeconds ? (
                          <span className="text-slate-400 ml-1">({round.timeTakenSeconds}s)</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Rival Round Result */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 ${
                        round.player2Correct
                          ? 'bg-slate-900 border border-slate-800 text-slate-200'
                          : 'bg-rose-950/20 border border-rose-500/20 text-rose-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {round.player2Correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold truncate">{duel.player2Name}</span>
                      </div>
                      <div className="text-right text-[10px] font-semibold text-slate-400">
                        {round.player2Points !== undefined && round.player2Points > 0 && (
                          <span>+{round.player2Points} pts</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            id="close-score-modal-footer-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {onRematch && (
            <button
              id="rematch-duel-btn"
              onClick={() => {
                onRematch(duel);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Desafiar {duel.player2Name}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
