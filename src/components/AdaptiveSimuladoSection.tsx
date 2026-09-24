import React, { useState, useEffect } from 'react';
import { Target, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Brain, RotateCcw, Trophy, Award, Zap, Shuffle } from 'lucide-react';
import { getCadernoErros, WrongQuestion } from '../utils/cadernoErros';
import { shuffleQuestionOptions, prepareQuestionsWithFullShuffle } from '../utils/questionShuffle';
import { getRandomOfflineQuestions } from '../data/offlineQuestionBank';
import { generateSimuladoTri } from '../services/geminiService';

interface AdaptiveSimuladoSectionProps {
  onAddXp?: (xp: number) => void;
}

interface Question {
  id: number;
  materia: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  explicacao: string;
}

export const AdaptiveSimuladoSection: React.FC<AdaptiveSimuladoSectionProps> = ({ onAddXp }) => {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<{ materia: string; count: number }[]>([]);
  const [simuladoStarted, setSimuladoStarted] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const shuffleQuestionList = (list: Question[]): Question[] => {
    return prepareQuestionsWithFullShuffle(list, {
      randomizeListOrder: true,
      randomizeStart: true,
      shuffleOptions: true,
    });
  };

  useEffect(() => {
    const list = getCadernoErros();
    setWrongQuestions(list);

    // Group errors by subject
    const counts: Record<string, number> = {};
    list.forEach((q) => {
      counts[q.materia] = (counts[q.materia] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([materia, count]) => ({ materia, count }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      setWeakSubjects([
        { materia: 'Matemática', count: 4 },
        { materia: 'Física', count: 3 },
        { materia: 'Biologia', count: 2 },
      ]);
    } else {
      setWeakSubjects(sorted);
    }
  }, []);

  const handleStartSimulado = async () => {
    setIsLoading(true);
    const topSubjects = weakSubjects.slice(0, 3).map((s) => s.materia);

    try {
      // Call centralized service to generate custom simulation
      const data = await generateSimuladoTri({
        materiaFocus: topSubjects.join(', '),
        quantidade: 5,
      });

      if (data?.questoes?.length) {
        setQuestions(shuffleQuestionList(data.questoes));
      } else if (data?.data?.questoes?.length) {
        setQuestions(shuffleQuestionList(data.data.questoes));
      } else {
        // Fallback adaptive set
        setQuestions(shuffleQuestionList(getFallbackQuestions(topSubjects[0] || 'Matemática')));
      }
    } catch (e) {
      setQuestions(shuffleQuestionList(getFallbackQuestions(weakSubjects[0]?.materia || 'Matemática')));
    } finally {
      setIsLoading(false);
      setSimuladoStarted(true);
      setCurrentIndex(0);
      setUserAnswers({});
      setIsFinished(false);
    }
  };

  const getFallbackQuestions = (mainMateria: string): Question[] => {
    const offlinePool = getRandomOfflineQuestions(mainMateria, 5);
    if (offlinePool && offlinePool.length > 0) {
      return offlinePool.map((q, idx) => ({
        id: idx + 1,
        materia: q.materia,
        pergunta: q.pergunta,
        opcoes: q.opcoes,
        resposta_correta_index: q.resposta_correta_index,
        explicacao: q.explicacao,
      }));
    }
    return [
      {
        id: 1,
        materia: mainMateria,
        pergunta: `[Simulado Adaptativo - ${mainMateria}] Qual o conceito principal necessário para superar os erros recorrentes identificados no seu histórico?`,
        opcoes: [
          'Aplicação direta das fórmulas fundamentais e verificação de unidades',
          'Interpretação gráfica isolada sem contexto teórico',
          'Resolução por eliminação sem cálculo prévio',
          'Memorização pontual de conceitos sem prática',
        ],
        resposta_correta_index: 0,
        explicacao: 'A base para resolver questões do seu histórico de erros é a relação entre fundamentação teórica e verificação de unidades físicas/matemáticas.',
      },
    ];
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (isFinished) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleFinish = () => {
    setIsFinished(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.resposta_correta_index) {
        correctCount++;
      }
    });
    if (onAddXp) onAddXp(correctCount * 30);
  };

  const calculateScore = () => {
    let hits = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.resposta_correta_index) hits++;
    });
    return { hits, total: questions.length, percent: Math.round((hits / questions.length) * 100) };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-700/50 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Diagnóstico do Caderno de Erros
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🎯 Simulado Adaptativo Inteligente
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 font-medium leading-relaxed">
              Algoritmo que analisa suas fraquezas reais e gera provas personalizadas de 5 a 10 questões focando exatamente nos seus tópicos com menor taxa de acerto.
            </p>
          </div>

          <button
            onClick={handleStartSimulado}
            disabled={isLoading}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Gerando Simulado Adaptativo...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Iniciar Simulado Personalizado</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WEAK SUBJECTS DIAGNOSTIC CARDS */}
      {!simuladoStarted && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Seu Radar de Pontos Fracos Identificados
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {weakSubjects.map((s, idx) => (
              <div
                key={s.materia}
                className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-300 block">
                    Foco #{idx + 1}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {s.materia}
                  </h4>
                </div>
                <span className="text-xs font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2.5 py-1 rounded-xl">
                  {s.count} erros salvos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE SIMULATION DISPLAY */}
      {simuladoStarted && questions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {!isFinished ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-3 py-1 rounded-full">
                  Questão {currentIndex + 1} de {questions.length} • {questions[currentIndex]?.materia}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <span>Progresso:</span>
                  <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {questions[currentIndex]?.pergunta}
              </h3>

              <div className="space-y-3">
                {questions[currentIndex]?.opcoes.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(currentIndex, optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-purple-400 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  ← Anterior
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                  >
                    Próxima Questão →
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                  >
                    Finalizar Simulado Adaptativo ✅
                  </button>
                )}
              </div>
            </>
          ) : (
            /* RESULTS DISPLAY */
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/80 rounded-full flex items-center justify-center mx-auto text-4xl text-amber-500 shadow-inner">
                🏆
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Simulado Adaptativo Concluído!
                </h3>
                <p className="text-xs text-slate-500">
                  Desempenho focado em reforçar fraquezas do seu Caderno de Erros.
                </p>
              </div>

              {(() => {
                const res = calculateScore();
                return (
                  <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 max-w-sm mx-auto space-y-2">
                    <span className="text-xs font-extrabold uppercase text-purple-600 dark:text-purple-300 block">
                      Resultado Final
                    </span>
                    <p className="text-3xl font-black text-purple-900 dark:text-purple-100">
                      {res.hits} de {res.total} acertos ({res.percent}%)
                    </p>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      +{(res.hits * 30)} XP adicionados ao seu perfil! ⚡
                    </span>
                  </div>
                );
              })()}

              <button
                onClick={() => setSimuladoStarted(false)}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition cursor-pointer"
              >
                Voltar ao Painel Adaptativo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
