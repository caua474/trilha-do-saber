import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, Sparkles, HelpCircle, Eye, Share2, Shuffle } from 'lucide-react';
import { StudyMaterial } from '../types';
import * as db from '../utils/db';
import { shuffleAndRotateQuestions } from '../utils/questionShuffle';
import {
  playQuizSuccessPling,
  playSuccessSound,
  playErrorSound,
  getQuizSuccessSoundEnabled,
  getSoundEnabled,
} from '../utils/audio';

interface InteractiveQuizModalProps {
  material: StudyMaterial;
  onClose: () => void;
  onShare?: (score: number, total: number, topic: string) => void;
  onCompleted?: () => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  material,
  onClose,
  onShare,
  onCompleted,
}) => {
  // Embaralha as questões e alterna o ponto de início para nunca repetir na mesma ordem
  const [shuffledQuestions, setShuffledQuestions] = useState(() =>
    shuffleAndRotateQuestions(material.perguntas || [], {
      shuffleOrder: true,
      randomizeStart: true,
    })
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userScores, setUserScores] = useState<Record<number, boolean | null>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = shuffledQuestions[currentIndex] || material.perguntas[currentIndex];
  const total = shuffledQuestions.length || material.perguntas.length;

  const handleScore = (correct: boolean) => {
    const newScores = {
      ...userScores,
      [currentIndex]: correct,
    };
    setUserScores(newScores);

    if (correct) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setIsCompleted(true);

      // Verifica a configuração de 'Som de Sucesso' do usuário antes de emitir o feedback auditivo
      const soundEffectsActive = getSoundEnabled();
      const quizSuccessSoundActive = getQuizSuccessSoundEnabled();
      if (soundEffectsActive && quizSuccessSoundActive) {
        playQuizSuccessPling();
      }

      // Save attempt to IndexedDB
      const correctTotal = Object.values(newScores).filter(Boolean).length;
      db.saveQuizResult({
        id: 'quiz_' + Date.now(),
        materia: material.title.split(' ')[0] || 'Geral',
        topico: material.focusTopic || material.title,
        acertos: correctTotal,
        totalQuestoes: total,
        porcentagem: Math.round((correctTotal / total) * 100),
        createdAt: new Date().toISOString()
      })
        .then(() => {
          onCompleted?.();
        })
        .catch(err => console.error('Erro ao salvar no IndexedDB:', err));
    }
  };

  const handleRestart = () => {
    // Ao reiniciar, re-embaralha e rotaciona o ponto de partida
    setShuffledQuestions(
      shuffleAndRotateQuestions(material.perguntas || [], {
        shuffleOrder: true,
        randomizeStart: true,
      })
    );
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserScores({});
    setIsCompleted(false);
  };

  const correctCount = Object.values(userScores).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
              📝
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Flashcards de Teste Rápido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {material.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {!isCompleted ? (
            <div className="space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>Pergunta {currentIndex + 1} de {total}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {Math.round(((currentIndex + 1) / total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flashcard Box */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 min-h-[220px] flex flex-col justify-between shadow-inner">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 block mb-2">
                    Pergunta #{currentIndex + 1}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {currentQ.pergunta}
                  </h4>
                </div>

                {showAnswer ? (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                      Gabarito Correto:
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {currentQ.resposta}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="mt-6 w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Clique para Revelar a Resposta</span>
                  </button>
                )}
              </div>

              {/* Self Assessment Action */}
              {showAnswer ? (
                <div className="space-y-2">
                  <p className="text-xs text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Como foi o seu desempenho?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleScore(false)}
                      className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                    >
                      ❌ Preciso Revisar
                    </button>
                    <button
                      onClick={() => handleScore(true)}
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                      ✅ Acertei de Primeira!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => {
                      setCurrentIndex((prev) => prev - 1);
                      setShowAnswer(false);
                    }}
                    className="inline-flex items-center space-x-1 disabled:opacity-30 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>
                  <span>Tente responder mentalmente primeiro</span>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/80 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Teste Concluído com Sucesso!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Você acertou <strong className="text-amber-600 dark:text-amber-400">{correctCount}</strong> de{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{total}</strong> perguntas de fixação.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                {correctCount === total
                  ? '🌟 Excelente retenção! Você fixou os pontos essenciais do material.'
                  : '👍 Bom trabalho! Repasse os tópicos principais para consolidar os detalhes.'}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer</span>
                </button>

                {onShare && (
                  <button
                    type="button"
                    onClick={() => {
                      onShare(correctCount, total, material.title);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md inline-flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar Resultado</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
