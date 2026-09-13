import React, { useState } from 'react';
import { Calendar, CheckCircle2, RotateCcw, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Trophy, BookOpen } from 'lucide-react';

interface LeitnerCard {
  id: string;
  materia: string;
  topico: string;
  pergunta: string;
  resposta: string;
  caixa: 1 | 2 | 3; // 1: 1 Dia, 2: 7 Dias, 3: 30 Dias
  proximaRevisao: string;
}

const INITIAL_CARDS: LeitnerCard[] = [
  {
    id: 'l1',
    materia: 'Matemática',
    topico: 'Função Quadrática',
    pergunta: 'Como determinar a coordenada X do vértice de uma parábola (Xv)?',
    resposta: 'Xv = -b / (2a)',
    caixa: 1,
    proximaRevisao: 'Hoje',
  },
  {
    id: 'l2',
    materia: 'Física',
    topico: 'Termodinâmica',
    pergunta: 'Qual a expressão da 1ª Lei da Termodinâmica?',
    resposta: 'ΔU = Q - W (A variação da energia interna é a diferença entre calor recebido e trabalho realizado)',
    caixa: 1,
    proximaRevisao: 'Hoje',
  },
  {
    id: 'l3',
    materia: 'Biologia',
    topico: 'Síntese Proteica',
    pergunta: 'Onde ocorre a tradução do RNAm na célula?',
    resposta: 'Nos ribossomos livres no citoplasma ou aderidos ao Retículo Endoplasmático Rugoso.',
    caixa: 2,
    proximaRevisao: 'Em 5 dias',
  },
  {
    id: 'l4',
    materia: 'Química',
    topico: 'Estequiometria',
    pergunta: 'O que é o Reagente Limitante em uma reação química?',
    resposta: 'É o reagente consumido totalmente em primeiro lugar, que limita a quantidade máxima de produto formado.',
    caixa: 3,
    proximaRevisao: 'Em 22 dias',
  },
];

export const LeitnerSpacedRepetitionSection: React.FC<{ onAddXp?: (xp: number) => void }> = ({ onAddXp }) => {
  const [cards, setCards] = useState<LeitnerCard[]>(INITIAL_CARDS);
  const [activeBoxFilter, setActiveBoxFilter] = useState<number | 'todas'>('todas');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const handleCardResult = (id: string, success: boolean) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        let newBox: 1 | 2 | 3 = c.caixa;
        let newRev = c.proximaRevisao;

        if (success) {
          if (c.caixa === 1) {
            newBox = 2;
            newRev = 'Em 7 dias';
          } else if (c.caixa === 2) {
            newBox = 3;
            newRev = 'Em 30 dias';
          }
          if (onAddXp) onAddXp(25);
        } else {
          newBox = 1;
          newRev = 'Amanhã';
        }

        return {
          ...c,
          caixa: newBox,
          proximaRevisao: newRev,
        };
      })
    );
    setFlippedCardId(null);
  };

  const cardsDueToday = cards.filter((c) => c.caixa === 1);

  const filteredCards = cards.filter((c) => {
    if (activeBoxFilter === 'todas') return true;
    return c.caixa === activeBoxFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-indigo-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Calendar className="w-3.5 h-3.5" /> Algoritmo Leitner de Fixação
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              📅 Gerenciador de Revisão Espaçada
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Organização automática em 3 caixas de memória (1 dia, 7 dias e 30 dias). Acerte para avançar de caixa; erre para retornar à revisão diária.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-xl">
              ⚡
            </div>
            <div>
              <span className="text-xs text-indigo-200 font-bold block uppercase tracking-wider">Revisões Hoje</span>
              <span className="text-sm font-black text-white">{cardsDueToday.length} Cards Pendentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEITNER BOXES OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Box 1 */}
        <button
          onClick={() => setActiveBoxFilter(activeBoxFilter === 1 ? 'todas' : 1)}
          className={`p-5 rounded-3xl border text-left transition cursor-pointer space-y-2 ${
            activeBoxFilter === 1
              ? 'bg-rose-600 text-white border-rose-700 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Caixa 1 • Intervalo 1 Dia
            </span>
            <span className="text-lg font-black">{cards.filter((c) => c.caixa === 1).length}</span>
          </div>
          <h4 className="text-sm font-extrabold">Revisão Diária</h4>
          <p className="text-xs opacity-80">Cards em fase de memorização inicial.</p>
        </button>

        {/* Box 2 */}
        <button
          onClick={() => setActiveBoxFilter(activeBoxFilter === 2 ? 'todas' : 2)}
          className={`p-5 rounded-3xl border text-left transition cursor-pointer space-y-2 ${
            activeBoxFilter === 2
              ? 'bg-amber-600 text-white border-amber-700 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Caixa 2 • Intervalo 7 Dias
            </span>
            <span className="text-lg font-black">{cards.filter((c) => c.caixa === 2).length}</span>
          </div>
          <h4 className="text-sm font-extrabold">Revisão Semanal</h4>
          <p className="text-xs opacity-80">Cards em fase de consolidação.</p>
        </button>

        {/* Box 3 */}
        <button
          onClick={() => setActiveBoxFilter(activeBoxFilter === 3 ? 'todas' : 3)}
          className={`p-5 rounded-3xl border text-left transition cursor-pointer space-y-2 ${
            activeBoxFilter === 3
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Caixa 3 • Intervalo 30 Dias
            </span>
            <span className="text-lg font-black">{cards.filter((c) => c.caixa === 3).length}</span>
          </div>
          <h4 className="text-sm font-extrabold">Memória de Longo Prazo</h4>
          <p className="text-xs opacity-80">Cards dominados e retidos definitivamente.</p>
        </button>
      </div>

      {/* CARDS LIST / FLIP AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Cards Programados para Revisão Espaçada
          </h3>

          {activeBoxFilter !== 'todas' && (
            <button
              onClick={() => setActiveBoxFilter('todas')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Exibir Todas as Caixas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((c) => {
            const isFlipped = flippedCardId === c.id;
            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between hover:border-indigo-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-md">
                      {c.materia} • {c.topico}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Caixa {c.caixa} ({c.proximaRevisao})
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {c.pergunta}
                  </p>

                  {isFlipped && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs font-bold text-indigo-950 dark:text-indigo-200 animate-in fade-in">
                      💡 Resposta: {c.resposta}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  {!isFlipped ? (
                    <button
                      onClick={() => setFlippedCardId(c.id)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer"
                    >
                      Revelar Resposta 👁️
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => handleCardResult(c.id, false)}
                        className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer"
                      >
                        Errei (Voltar Caixa 1) ❌
                      </button>
                      <button
                        onClick={() => handleCardResult(c.id, true)}
                        className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer"
                      >
                        Acertei (+25 XP) ✅
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
