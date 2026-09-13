import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckCircle2, RotateCcw, Trash2, AlertCircle, Sparkles, Trophy, HelpCircle, Check, X } from 'lucide-react';
import { getCadernoErros, markQuestionDominado, deleteWrongQuestion, clearCadernoErros, WrongQuestion } from '../utils/cadernoErros';
import { shuffleQuestionOptions, ShuffledOptionsData } from '../utils/questionShuffle';

export const CadernoDeErrosSection: React.FC<{ onAddXp?: (xp: number) => void }> = ({ onAddXp }) => {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'pendentes' | 'dominados'>('pendentes');
  const [selectedQuestion, setSelectedQuestion] = useState<WrongQuestion | null>(null);
  const [shuffledRetryData, setShuffledRetryData] = useState<ShuffledOptionsData | null>(null);
  const [userAnswerOption, setUserAnswerOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const loadQuestions = () => {
    const list = getCadernoErros();
    setQuestions(list);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenRetry = (q: WrongQuestion) => {
    const shuffled = shuffleQuestionOptions(q.opcoes, q.resposta_correta_index);
    setShuffledRetryData(shuffled);
    setSelectedQuestion(q);
    setUserAnswerOption(null);
    setShowExplanation(false);
  };

  const handleRetryQuestion = (q: WrongQuestion, optionIdx: number) => {
    setUserAnswerOption(optionIdx);
    setShowExplanation(true);

    const isCorrect = shuffledRetryData
      ? optionIdx === shuffledRetryData.correctIndex
      : optionIdx === q.resposta_correta_index;

    if (isCorrect) {
      markQuestionDominado(q.id, true);
      if (onAddXp) onAddXp(50);
    }
  };

  const handleMarkDominado = (id: string, state: boolean) => {
    markQuestionDominado(id, state);
    loadQuestions();
    setSelectedQuestion(null);
  };

  const handleDelete = (id: string) => {
    deleteWrongQuestion(id);
    loadQuestions();
    if (selectedQuestion?.id === id) setSelectedQuestion(null);
  };

  const handleClearAll = () => {
    if (confirm('Deseja realmente apagar todo o seu Caderno de Erros?')) {
      clearCadernoErros();
      loadQuestions();
      setSelectedQuestion(null);
    }
  };

  const subjects = ['Todos', ...Array.from(new Set(questions.map((q) => q.materia)))];

  const filtered = questions.filter((q) => {
    const matchSubject = filterSubject === 'Todos' || q.materia === filterSubject;
    const matchStatus = activeTab === 'dominados' ? q.dominado : !q.dominado;
    return matchSubject && matchStatus;
  });

  const countPendentes = questions.filter((q) => !q.dominado).length;
  const countDominados = questions.filter((q) => q.dominado).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Painel de Revisão Espaçada
              </span>
              <span className="bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                3, 7 e 15 Dias
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              📓 Caderno de Erros Automático
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Todas as questões eradas nos Quizzes e Simulados são salvas aqui automaticamente. Revise nos ciclos programados para fixação definitiva na memória de longo prazo!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
              🎯
            </div>
            <div>
              <span className="text-xs text-rose-300 font-bold uppercase tracking-wider block">Pendentes de Revisão</span>
              <span className="text-lg font-black text-white">{countPendentes} Questões</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS & SUBJECT FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pendentes')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'pendentes'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ⏳ Para Revisar ({countPendentes})
            </button>
            <button
              onClick={() => setActiveTab('dominados')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === 'dominados'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ✅ Já Dominadas ({countDominados})
            </button>
          </div>

          {questions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Caderno</span>
            </button>
          )}
        </div>

        {/* Subjects Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-extrabold text-slate-500 uppercase shrink-0">Matéria:</span>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterSubject === s
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* QUESTIONS LIST GRID */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 text-3xl">
              🎉
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTab === 'pendentes'
                ? 'Nenhuma questão pendente de revisão!'
                : 'Nenhuma questão marcada como dominada ainda.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ao responder simulados e quizes, qualquer erro será gravado aqui para sua revisão espaçada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-400 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 rounded-md">
                      {q.materia}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Rev. 3D: {new Date(q.proximaRevisao3Dias).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-3 leading-relaxed">
                    {q.pergunta}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenRetry(q)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    Refazer Questão ➔
                  </button>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Excluir do Caderno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RETRY QUESTION MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-3 py-1 rounded-full">
                {selectedQuestion.materia} • {selectedQuestion.topico}
              </span>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {selectedQuestion.pergunta}
            </h3>

            <div className="space-y-2">
              {(shuffledRetryData?.options || selectedQuestion.opcoes).map((opt, idx) => {
                const isCorrect = idx === (shuffledRetryData ? shuffledRetryData.correctIndex : selectedQuestion.resposta_correta_index);
                const isSelected = userAnswerOption === idx;

                let style = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-rose-400';
                if (showExplanation) {
                  if (isCorrect) style = 'bg-emerald-500 text-white border-emerald-600';
                  else if (isSelected) style = 'bg-rose-500 text-white border-rose-600';
                  else style = 'bg-slate-100 dark:bg-slate-900 opacity-40';
                }

                return (
                  <button
                    key={`${selectedQuestion.id}-${idx}-${opt.slice(0, 15)}`}
                    onClick={() => handleRetryQuestion(selectedQuestion, idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && isCorrect && <Check className="w-4 h-4 text-white shrink-0" />}
                    {showExplanation && isSelected && !isCorrect && <X className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 space-y-2 animate-in fade-in">
                <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 block">
                  💡 Explicação do Gabarito:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedQuestion.explicacao}
                </p>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleMarkDominado(selectedQuestion.id, true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer"
                  >
                    Marcar como Dominada ✅ (+50 XP)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
