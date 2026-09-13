import React, { useState } from 'react';
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsDeckProps {
  flashcards: Flashcard[];
  title?: string;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({ flashcards, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});

  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  const current = flashcards[currentIndex];
  const total = flashcards.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleMark = (known: boolean) => {
    setKnownCards((prev) => ({
      ...prev,
      [currentIndex]: known,
    }));
    handleNext();
  };

  const knownCount = Object.values(knownCards).filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-5 bg-purple-600 dark:bg-purple-500 rounded-full" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
            🎴 Flashcards Interativos (Memorização Ativa)
          </h2>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">
            Cartão {currentIndex + 1} de {total}
          </span>
          <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
            {knownCount} Dominados
          </span>
        </div>
      </div>

      {/* Main Flashcard View */}
      <div className="relative perspective-1000 min-h-[240px]">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[220px] rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform flex flex-col justify-between border-2 shadow-md ${
            isFlipped
              ? 'bg-purple-900 dark:bg-purple-950 text-white border-purple-700 dark:border-purple-600 shadow-purple-900/20'
              : 'bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100/80 dark:hover:bg-slate-950/90 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider opacity-70 mb-4">
            <span>{isFlipped ? '💡 Verso (Resposta / Definição)' : '❓ Frente (Pergunta / Termo)'}</span>
            <span className="inline-flex items-center text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              Clique para Virar <RefreshCw className="w-3 h-3 ml-1" />
            </span>
          </div>

          <div className="my-auto text-center py-4">
            <p className={`text-base sm:text-xl font-bold leading-relaxed ${isFlipped ? 'text-purple-100' : 'text-slate-800 dark:text-slate-100'}`}>
              {isFlipped ? current.verso : current.frente}
            </p>
          </div>

          <div className="text-center text-[11px] font-semibold opacity-60 pt-2">
            {isFlipped ? 'Pense se você acertou antes de virar' : 'Tente responder mentalmente antes de virar'}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Active Recall Scoring */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => handleMark(false)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <XCircle className="w-4 h-4" />
            <span>Preciso Revisar</span>
          </button>

          <button
            onClick={() => handleMark(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-200 dark:shadow-none flex items-center justify-center space-x-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Já Sei Esse!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
