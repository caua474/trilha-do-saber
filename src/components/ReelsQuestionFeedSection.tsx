import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Smartphone, CheckCircle2, XCircle, Clock, Zap, ArrowDown, Bookmark, Share2, Sparkles, RefreshCw, AlertTriangle, Play, Pause, Flame, Shuffle } from 'lucide-react';
import { OFFLINE_QUESTION_BANK, OfflineQuestion } from '../data/offlineQuestionBank';
import { saveWrongQuestion } from '../utils/cadernoErros';
import { incrementDailyGoalProgress } from './DailyGoalsWidget';
import { shuffleAndRotateQuestions, shuffleQuestionOptions, ShuffledOptionsData } from '../utils/questionShuffle';

export const ReelsQuestionFeedSection: React.FC<{ onAddXp?: (xp: number) => void }> = ({ onAddXp }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [shuffleKey, setShuffleKey] = useState<number>(() => Math.floor(Math.random() * 1000));

  // Module 3: Treinador de Ritmo e Tempo por Questão
  const [timerDuration, setTimerDuration] = useState<number>(180); // 180 seconds = 3 minutes
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(180);

  // Lista de questões embaralhada com ponto de início alternado (Shuffle + Random Offset)
  const questionsPool = useMemo(() => {
    const filtered = OFFLINE_QUESTION_BANK.filter((q) => {
      if (selectedSubject === 'Todas') return true;
      return q.materia.toLowerCase().includes(selectedSubject.toLowerCase());
    });
    return shuffleAndRotateQuestions(filtered, {
      shuffleOrder: true,
      randomizeStart: true,
    });
  }, [selectedSubject, shuffleKey]);

  const handleReshufflePool = () => {
    setShuffleKey((prev) => prev + 1);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(timerDuration);
  };

  const currentQuestion: OfflineQuestion | undefined = questionsPool.length > 0 
    ? questionsPool[currentIndex % questionsPool.length] 
    : undefined;

  // Dynamic shuffle of options for the active question
  const shuffledData: ShuffledOptionsData | null = useMemo(() => {
    if (!currentQuestion) return null;
    return shuffleQuestionOptions(currentQuestion.opcoes, currentQuestion.resposta_correta_index);
  }, [currentQuestion?.id, currentIndex, selectedSubject]);

  // Timer countdown hook
  useEffect(() => {
    if (!timerActive || isAnswered || !currentQuestion) return;

    if (timeLeft <= 0) {
      // Time expired - mark auto incorrect if not answered
      setIsAnswered(true);
      setSelectedOption(-1); // -1 = Timeout
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isAnswered, timeLeft, currentQuestion]);

  // Reset question state when navigating
  const handleNextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(timerDuration);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQuestion || !shuffledData) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === shuffledData.correctIndex;

    if (isCorrect) {
      setStreakCount((prev) => prev + 1);
      if (onAddXp) onAddXp(20);
      incrementDailyGoalProgress(1);
    } else {
      setStreakCount(0);
      // Auto save to Caderno de Erros with shuffled context
      saveWrongQuestion({
        materia: currentQuestion.materia,
        topico: currentQuestion.topico,
        pergunta: currentQuestion.pergunta,
        opcoes: shuffledData.options,
        resposta_correta_index: shuffledData.correctIndex,
        resposta_usuario_index: idx,
        explicacao: currentQuestion.explicacao,
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    setSavedFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Timer color indicator calculation
  const timeRatio = timerDuration > 0 ? timeLeft / timerDuration : 1;
  let timerBadgeColor = 'bg-emerald-500 text-white border-emerald-400';
  let timerBarColor = 'bg-emerald-500';
  let timerStatusText = 'Pace Ideal 🟢';

  if (timeRatio <= 0.2) {
    timerBadgeColor = 'bg-rose-600 text-white border-rose-400 animate-pulse';
    timerBarColor = 'bg-rose-600';
    timerStatusText = 'Tempo Crítico! 🔴';
  } else if (timeRatio <= 0.5) {
    timerBadgeColor = 'bg-amber-500 text-slate-950 border-amber-300';
    timerBarColor = 'bg-amber-500';
    timerStatusText = 'Atenção ao Tempo 🟡';
  }

  const subjects = ['Todas', 'Biologia', 'Matemática', 'História', 'Química', 'Física', 'Geografia', 'Português'];

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Nenhuma questão encontrada para essa disciplina.
        </p>
        <button
          onClick={() => setSelectedSubject('Todas')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Ver Todas as Questões
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Feed Reels de Questões
            </span>
            {streakCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> {streakCount} Seguidas!
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-white">
            📱 Prática Rápida em Formato Vertical
          </h2>
          <p className="text-xs text-slate-300">
            Responda instantaneamente e deslize para a próxima questão do ENEM.
          </p>
        </div>

        {/* TIMER CONFIGURATION DROPDOWN */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0 space-y-1">
          <span className="text-[10px] font-black uppercase text-indigo-300 block">
            ⏱️ Ritmo por Questão:
          </span>
          <select
            value={timerDuration}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTimerDuration(val);
              setTimeLeft(val);
            }}
            className="bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded-xl border border-indigo-400/40 cursor-pointer"
          >
            <option value={60}>1 Minuto (Rápido)</option>
            <option value={180}>3 Minutos (Padrão ENEM)</option>
            <option value={300}>5 Minutos (Complexo)</option>
            <option value={99999}>Sem Temporizador</option>
          </select>
        </div>
      </div>

      {/* SUBJECT FILTER PILLS & SHUFFLE ACTION */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSelectedSubject(s);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setTimeLeft(timerDuration);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                selectedSubject === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={handleReshufflePool}
          title="Embaralhar ordem e sortear novo ponto de início"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shrink-0 cursor-pointer shadow-sm"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Misturar & Novo Início</span>
        </button>
      </div>

      {/* REELS CARD CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* TIMER PROGRESS BAR (MODULE 3) */}
        {timerDuration < 90000 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-extrabold ${timerBadgeColor}`}>
                {timerStatusText}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-extrabold font-mono text-sm">
                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${timerBarColor}`}
                style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* CARD TOP META */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
              {currentQuestion.materia}
            </span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Tópico: {currentQuestion.topico}
            </h4>
          </div>

          <button
            onClick={() => handleToggleFavorite(currentQuestion.id)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              savedFavorites.includes(currentQuestion.id)
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Salvar Questão"
          >
            <Bookmark className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* QUESTION TEXT */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.pergunta}
          </h3>
        </div>

        {/* OPTIONS A, B, C, D */}
        <div className="space-y-2.5">
          {(shuffledData?.rawOptions || currentQuestion.opcoes).map((optionText, idx) => {
            const isCorrect = idx === (shuffledData ? shuffledData.correctIndex : currentQuestion.resposta_correta_index);
            const isSelected = selectedOption === idx;

            let cardStyle =
              'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500';

            if (isAnswered) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md';
              } else if (isSelected) {
                cardStyle = 'bg-rose-500 text-white border-rose-600 font-bold shadow-md';
              } else {
                cardStyle = 'bg-slate-100 dark:bg-slate-900 opacity-40 text-slate-500';
              }
            }

            return (
              <button
                key={`${currentQuestion.id}-${idx}-${optionText.slice(0, 15)}`}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm font-semibold ${cardStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{optionText}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK & EXPLANATION PANEL */}
        {isAnswered && (
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-black text-xs uppercase">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gabarito Comentado com Dica de Ouro:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {currentQuestion.explicacao}
            </p>
          </div>
        )}

        {/* SWIPE / NEXT BUTTON */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            Questão {(currentIndex % questionsPool.length) + 1} de {questionsPool.length}
          </span>

          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg flex items-center gap-2 transition cursor-pointer transform hover:scale-105"
          >
            <span>Próxima Questão</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};
