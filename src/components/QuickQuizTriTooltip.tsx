import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Zap,
  BookOpen,
  BrainCircuit,
  Award
} from 'lucide-react';

interface QuickQuizTriTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz?: () => void;
}

export const QuickQuizTriTooltip: React.FC<QuickQuizTriTooltipProps> = ({
  isOpen,
  onClose,
  onStartQuiz,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="quick-quiz-tri-tooltip"
        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[99999] w-[92vw] max-w-sm sm:max-w-md pointer-events-auto"
        onMouseEnter={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer Arrow */}
        <div className="w-3.5 h-3.5 bg-slate-900 border-t border-l border-slate-700/80 rotate-45 mx-auto -mb-2 z-10 relative shadow-sm" />

        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-700/90 shadow-2xl shadow-slate-950/80 backdrop-blur-xl space-y-4"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    Impacto do Quiz na sua Nota TRI
                  </h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ENEM Real
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Teoria de Resposta ao Item & Coerência Pedagógica
                </p>
              </div>
            </div>

            <button
              id="close-tri-tooltip-button"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar explicação TRI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MAIN EXPLANATION BODY */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <p className="text-[11px] text-slate-300">
              No ENEM, sua pontuação não é apenas uma contagem simples de acertos. O modelo <strong className="text-amber-400 font-bold">TRI (Teoria de Resposta ao Item)</strong> avalia a coerência do seu conhecimento em 3 pilares:
            </p>

            {/* 3 PARAMETERS CARDS */}
            <div className="grid grid-cols-1 gap-2">
              {/* 1. Coerência Pedagógica */}
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                  1
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-black text-slate-100 block">
                    Coerência Pedagógica (Curva TRI)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Acertar as fáceis do Quiz garante sua <strong className="text-emerald-300">nota-base alta</strong>. Se você acertar uma difícil mas errar as fáceis, a TRI interpreta como "chute" e atribui menos pontos.
                  </p>
                </div>
              </div>

              {/* 2. Calibração da Proficiência (Theta) */}
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                  2
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-black text-slate-100 block">
                    Calibração da Proficiência ($\theta$)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Cada rodada do Quiz Rápido atualiza seu mapa de habilidades na IA da Professora Gabi, ajustando os simulados para suas maiores brechas.
                  </p>
                </div>
              </div>

              {/* 3. Agilidade & Redução do Acaso */}
              <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                  3
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-black text-slate-100 block">
                    Treino de Ritmo Cronometrado
                  </span>
                  <p className="text-[11px] text-slate-400">
                    O tempo de resposta treina sua gestão de 3 minutos por questão, diminuindo a chance de erros por desatenção no dia da prova.
                  </p>
                </div>
              </div>
            </div>

            {/* MINI COMPARISON VISUAL */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Padrão Coerente (Quiz Diário)</span>
                <span className="text-emerald-400">+120 a 250 pts no TRI</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[75%]" title="Questões fáceis e médias consolidadas" />
                <div className="h-full bg-amber-500 w-[20%]" title="Questões difíceis" />
                <div className="h-full bg-indigo-500 w-[5%]" />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                💡 Dica da Gabi: Resolver 1 a 2 quizzes rápidos por dia estabiliza seu acerto nas questões médias do ENEM.
              </p>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold">
              Toque longo ou hover ativo
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Entendi
              </button>

              {onStartQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartQuiz();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Iniciar Quiz</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
