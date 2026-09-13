import React, { useState } from 'react';
import {
  Lightbulb,
  Puzzle,
  Brain,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { ELI5Explanation } from '../types';

interface ELI5SectionProps {
  onExplain: (duvida: string) => void;
  isLoading: boolean;
  explanation: ELI5Explanation | null;
}

export const ELI5Section: React.FC<ELI5SectionProps> = ({
  onExplain,
  isLoading,
  explanation,
}) => {
  const [duvida, setDuvida] = useState('');

  const sampleQuestions = [
    'Não entendi como funciona a Regra de Três Composta.',
    'Me explica Fotossíntese como se eu estivesse no 5º ano.',
    'Por que dividimos por zero é impossível na matemática?',
    'Como funciona a oferta e a demanda na economia?',
    'Me explica a diferença entre Mitose e Meiose sem complicação.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duvida.trim() || isLoading) return;
    onExplain(duvida);
  };

  return (
    <div className="space-y-8">
      {/* Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-5 bg-amber-500 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            Tira-Dúvidas Instantâneo ("Explicar de Jeito Fácil")
          </h2>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
          Cole sua dúvida, questão difícil ou conceito travado para receber uma explicação descomplicada com analogia do cotidiano e macete de ouro!
        </p>

        {/* Quick sample chips */}
        <div className="mb-6">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            💡 Dúvidas frequentes de alunos (Clique para testar):
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDuvida(q)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition text-left ${
                  duvida === q
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={duvida}
            onChange={(e) => setDuvida(e.target.value)}
            placeholder="Ex: 'Não entendi por que a água fervente não aumenta de temperatura', 'Me explica a Primeira Lei de Newton com exemplo de carro'..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-950/60 resize-y min-h-[110px]"
            disabled={isLoading}
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!duvida.trim() || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
                !duvida.trim() || isLoading
                  ? 'bg-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] shadow-amber-200 dark:shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Descomplicando Conceito...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Descomplicar Minha Dúvida</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Explanation Bento Output */}
      {explanation && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 sm:px-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Explicação Simplificada ("ELI5")
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-md">
                  Dúvida: "{explanation.duvida}"
                </p>
              </div>
            </div>
            <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              💡 Modo Fácil Ativado
            </span>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* 1. 💡 Analogia Simples (col-span-12 lg:col-span-6) */}
            <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                    💡 Analogia Simples (Do Dia a Dia)
                  </h2>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/60 text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-sm sm:text-base">
                  {explanation.analogiaSimples}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Metáfora visual intuitiva</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Linguagem do Cotidiano</span>
              </div>
            </div>

            {/* 2. 🧩 Passo a Passo (col-span-12 lg:col-span-6) */}
            <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                    🧩 Passo a Passo Lógico
                  </h2>
                </div>

                <div className="space-y-3">
                  {explanation.passoAPasso.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-start space-x-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Desmontado em etapas pequenas</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Sem Complicação</span>
              </div>
            </div>

            {/* 3. 🧠 Dica de Ouro (col-span-12) */}
            <div className="col-span-12 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-amber-200/40 dark:shadow-none relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🧠</span>
                  <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-90">
                    Dica de Ouro (Macete Prático)
                  </h2>
                </div>
                <p className="text-base sm:text-lg font-bold leading-snug max-w-3xl">
                  "{explanation.dicaDeOuro}"
                </p>
              </div>

              <div className="relative z-10 shrink-0 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-extrabold text-white">
                Guardar para a Prova!
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
