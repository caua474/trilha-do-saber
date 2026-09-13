import React, { useState } from 'react';
import { Target, PieChart, Sparkles, CheckCircle2, HelpCircle, BarChart2, ShieldAlert, Award } from 'lucide-react';

export const TestStrategyGabaritoSection: React.FC = () => {
  const [totalQuestions, setTotalQuestions] = useState<number>(45);
  const [markedA, setMarkedA] = useState<number>(8);
  const [markedB, setMarkedB] = useState<number>(10);
  const [markedC, setMarkedC] = useState<number>(3);
  const [markedD, setMarkedD] = useState<number>(9);
  const [markedE, setMarkedE] = useState<number>(8);

  const totalMarked = markedA + markedB + markedC + markedD + markedE;
  const missingCount = Math.max(0, totalQuestions - totalMarked);

  // Ideal target per letter (~20% per alternative in standard ENEM/FUVEST test sets)
  const idealPerLetter = Math.round(totalQuestions / 5);

  const counts: Record<string, number> = { A: markedA, B: markedB, C: markedC, D: markedD, E: markedE };

  // Calculate missing gaps per letter to balance to ideal
  const gaps: Record<string, number> = {
    A: Math.max(0, idealPerLetter - markedA),
    B: Math.max(0, idealPerLetter - markedB),
    C: Math.max(0, idealPerLetter - markedC),
    D: Math.max(0, idealPerLetter - markedD),
    E: Math.max(0, idealPerLetter - markedE),
  };

  // Find letter with highest deficit
  const sortedGaps = Object.entries(gaps).sort((a, b) => b[1] - a[1]);
  const bestChuteLetter = sortedGaps[0][0];
  const secondBestLetter = sortedGaps[1][0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <BarChart2 className="w-3.5 h-3.5" /> Análise Estatística de Gabarito
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🎯 Guia de Estratégia de Prova & Chute Matemático
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              No ENEM e principais vestibulares, a distribuição de alternativas (A, B, C, D, E) é praticamente uniforme (~20% cada). Calcule o balanço da sua prova e saiba exatamente qual letra escolher nas questões que restam!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black text-xl">
              📊
            </div>
            <div>
              <span className="text-xs text-amber-200 font-bold block uppercase tracking-wider">Estratégia TRI</span>
              <span className="text-sm font-black text-white">Chute Consciente</span>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Informe a Quantidade de Questões da Prova:
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Geralmente 45 questões por caderno no ENEM (Ex: Matemática, Linguagens, Ciências da Natureza).
            </p>
          </div>

          <div className="flex gap-2">
            {[45, 90].map((num) => (
              <button
                key={num}
                onClick={() => setTotalQuestions(num)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  totalQuestions === num
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {num} Questões
              </button>
            ))}
          </div>
        </div>

        {/* INPUTS FOR LETTERS A, B, C, D, E */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            Quantas alternativas de cada letra você já marcou com certeza?
          </label>

          <div className="grid grid-cols-5 gap-3">
            {[
              { letter: 'A', val: markedA, setter: setMarkedA, color: 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
              { letter: 'B', val: markedB, setter: setMarkedB, color: 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
              { letter: 'C', val: markedC, setter: setMarkedC, color: 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
              { letter: 'D', val: markedD, setter: setMarkedD, color: 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
              { letter: 'E', val: markedE, setter: setMarkedE, color: 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
            ].map((item) => (
              <div key={item.letter} className={`p-3 rounded-2xl border text-center space-y-1.5 ${item.color}`}>
                <span className="text-sm font-black block">Letra {item.letter}</span>
                <input
                  type="number"
                  min="0"
                  max={totalQuestions}
                  value={item.val}
                  onChange={(e) => item.setter(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full py-1 text-center font-black text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* STATS & BALANCE CHART */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Questões Marcadas com Certeza: {totalMarked} / {totalQuestions}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              Restantes para Chute: {missingCount} Questões
            </span>
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D', 'E'].map((letter) => {
              const count = counts[letter];
              const pct = Math.min(100, Math.round((count / totalQuestions) * 100));
              const idealPct = 20;

              return (
                <div key={letter} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">
                      Letra {letter}: {count} marcadas ({pct}%)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Meta Recomendada: ~{idealPerLetter} ({idealPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        count < idealPerLetter - 2
                          ? 'bg-amber-500'
                          : count > idealPerLetter + 3
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct * 5}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ESTRATÉGIA DE CHUTE RECOMENDADA */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-amber-950/40 dark:to-indigo-950/40 border border-amber-200 dark:border-indigo-900 space-y-3">
          <span className="text-[10px] uppercase font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> RECOMENDAÇÃO ESTRATÉGICA DE CHUTE CONSCIENTE
          </span>

          <div className="space-y-2 text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">
              💡 Para as {missingCount} questões que restam, dê prioridade total para a <span className="underline decoration-amber-400 decoration-2 font-black text-base text-amber-600 dark:text-amber-300">Letra {bestChuteLetter}</span> (Déficit de {gaps[bestChuteLetter]} questões)!
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Segunda melhor opção para alternar: <span className="font-extrabold text-slate-900 dark:text-white">Letra {secondBestLetter}</span>.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              *Nota Pedagógica: Utilize a estratégia de chute consciente apenas nas questões em que você realmente não souber resolver, após eliminar alternativas absurdas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
