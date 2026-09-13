import React, { useState } from 'react';
import {
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Target,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface DayPlan {
  dia: number;
  fase: string;
  topico8020: string;
  materia: string;
  frequenciaEnem: string;
  missaoDoDia: string;
  tempoMinutos: number;
  concluida?: boolean;
}

const INITIAL_PARETO_PLAN: DayPlan[] = [
  {
    dia: 1,
    fase: 'Semanas 1 & 2: Matemática & Redação Reta Final',
    topico8020: 'Regra de 3 Simples e Composta + Escala Mapas',
    materia: 'Matemática',
    frequenciaEnem: '22% da Prova de Matemática',
    missaoDoDia: 'Resolver 15 questões de Regra de Três com proporção direta e inversa.',
    tempoMinutos: 45,
    concluida: true,
  },
  {
    dia: 2,
    fase: 'Semanas 1 & 2: Matemática & Redação Reta Final',
    topico8020: 'Porcentagem, Acréscimos e Descontos',
    materia: 'Matemática',
    frequenciaEnem: '18% da Prova de Matemática',
    missaoDoDia: 'Dominar calculo mental de porcentagens e aumentos sucessivos.',
    tempoMinutos: 40,
    concluida: true,
  },
  {
    dia: 3,
    fase: 'Semanas 1 & 2: Matemática & Redação Reta Final',
    topico8020: 'Estrutura C5 Redação: Agente, Ação, Meio, Efeito, Detalhamento',
    materia: 'Redação',
    frequenciaEnem: '200 Pontos Garantidos na C5',
    missaoDoDia: 'Escrever 3 propostas de intervenção completas com os 5 elementos.',
    tempoMinutos: 50,
    concluida: false,
  },
  {
    dia: 4,
    fase: 'Semanas 1 & 2: Matemática & Redação Reta Final',
    topico8020: 'Geometria Plana: Área de Triângulos, Círculos e Retângulos',
    materia: 'Matemática',
    frequenciaEnem: '15% da Prova de Matemática',
    missaoDoDia: 'Memorizar fórmulas de áreas clássicas e resolver 10 questões.',
    tempoMinutos: 45,
    concluida: false,
  },
  {
    dia: 5,
    fase: 'Semanas 1 & 2: Matemática & Redação Reta Final',
    topico8020: 'Repertórios Coringa para Eixo Social e Meio Ambiente',
    materia: 'Redação',
    frequenciaEnem: 'Competência 2 & 3',
    missaoDoDia: 'Memorizar 2 citações universais (Constituição + Zygmunt Bauman).',
    tempoMinutos: 35,
    concluida: false,
  },
  {
    dia: 6,
    fase: 'Semanas 3 & 4: Ciências da Natureza & Humanas Intensivo',
    topico8020: 'Ecologia: Cadeia Alimentar, Impactos Ambientais e Biomas',
    materia: 'Biologia',
    frequenciaEnem: '28% de Biologia no ENEM',
    missaoDoDia: 'Revisar Relações Ecológicas e Ciclo do Nitrogênio/Carbono.',
    tempoMinutos: 50,
    concluida: false,
  },
  {
    dia: 7,
    fase: 'Semanas 3 & 4: Ciências da Natureza & Humanas Intensivo',
    topico8020: 'Eletrodinâmica: Primeira Lei de Ohm (V = R.I) e Potência P = V.I',
    materia: 'Física',
    frequenciaEnem: '20% de Física no ENEM',
    missaoDoDia: 'Resolver 12 questões de consumo de energia em kWh de aparelhos.',
    tempoMinutos: 45,
    concluida: false,
  },
  {
    dia: 8,
    fase: 'Semanas 3 & 4: Ciências da Natureza & Humanas Intensivo',
    topico8020: 'Estequiometria Básica e Cálculo de Massa Molar',
    materia: 'Química',
    frequenciaEnem: '19% de Química no ENEM',
    missaoDoDia: 'Passo a passo: Balanceamento -> Proporção em Moles -> Massa.',
    tempoMinutos: 50,
    concluida: false,
  },
  {
    dia: 9,
    fase: 'Semanas 3 & 4: Ciências da Natureza & Humanas Intensivo',
    topico8020: 'Brasil Colônia & Era Vargas',
    materia: 'História',
    frequenciaEnem: '25% de História no ENEM',
    missaoDoDia: 'Fazer mapa mental dos direitos trabalhistas e economia açucareira.',
    tempoMinutos: 40,
    concluida: false,
  },
  {
    dia: 10,
    fase: 'Semanas 3 & 4: Ciências da Natureza & Humanas Intensivo',
    topico8020: 'Geografia Urbana & Impactos Ambientais Agrários',
    materia: 'Geografia',
    frequenciaEnem: '22% de Geografia no ENEM',
    missaoDoDia: 'Revisar Gentrificação, Ilhas de Calor e Estandardização Urbana.',
    tempoMinutos: 40,
    concluida: false,
  },
];

export const EmergencyFinal30DaysSection: React.FC = () => {
  const [planDays, setPlanDays] = useState<DayPlan[]>(INITIAL_PARETO_PLAN);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(3);

  const toggleDayCompletion = (diaNum: number) => {
    setPlanDays((prev) =>
      prev.map((d) => (d.dia === diaNum ? { ...d, concluida: !d.concluida } : d))
    );
  };

  const completedCount = planDays.filter((d) => d.concluida).length;
  const progressPercent = Math.round((completedCount / planDays.length) * 100);

  const currentDayPlan = planDays.find((d) => d.dia === selectedDayNumber) || planDays[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-rose-500/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-rose-500 font-black text-9xl">
          80/20
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
              <Flame className="w-3.5 h-3.5" /> Modo Reta Final • Princípio de Pareto
            </span>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              Faltam 30 Dias!
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Plano de Emergência 30 Dias (Estratégia 80/20) ⚡
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Sem tempo para ver todo o edital? Foque estritamente nos <strong>20% de tópicos de altíssima recorrência</strong> que cobrem <strong>80% das questões do ENEM e vestibulares</strong>.
          </p>

          {/* Progress bar */}
          <div className="pt-2 space-y-1.5 max-w-md">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-300">Progresso do Reta Final:</span>
              <span className="text-amber-400">{completedCount} de {planDays.length} Missões ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PARETO HIGH-YIELD TOPICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-indigo-600 font-black text-xs">
            <span>📐 MATEMÁTICA</span>
            <span className="bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-[10px]">Top Recorrência</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Regra de 3, Porcentagens & Geometria
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Responsável por ~30 de todas as 45 questões da prova.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-emerald-600 font-black text-xs">
            <span>🌱 NATUREZA</span>
            <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full text-[10px]">Top Recorrência</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Ecologia, V=R.I & Estequiometria
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tópicos fundamentais de Biologia, Física e Química.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-amber-600 font-black text-xs">
            <span>📜 HUMANAS</span>
            <span className="bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full text-[10px]">Top Recorrência</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Brasil Colônia, Era Vargas & Geografia Urbana
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Foco em interpretação de textos históricos e gráficos.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-rose-600 font-black text-xs">
            <span>✍️ REDAÇÃO & LINGUAGENS</span>
            <span className="bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full text-[10px]">Top Recorrência</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Competência 5 & Funções da Linguagem
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proposta de Intervenção de 200 pontos + conectivos.
          </p>
        </div>
      </div>

      {/* ROADMAP SELECTOR & DAILY MISSION DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: 30-DAY TIMELINE STEPS */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Cronograma Intensivo (30 Dias)
          </h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {planDays.map((d) => (
              <button
                key={d.dia}
                onClick={() => setSelectedDayNumber(d.dia)}
                type="button"
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                  selectedDayNumber === d.dia
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/40'
                    : d.concluida
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                      selectedDayNumber === d.dia
                        ? 'bg-white text-indigo-700'
                        : d.concluida
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    D{d.dia}
                  </div>
                  <div>
                    <span className="text-xs font-black block truncate max-w-[180px] sm:max-w-xs">
                      {d.topico8020}
                    </span>
                    <span
                      className={`text-[10px] font-bold block ${
                        selectedDayNumber === d.dia ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {d.materia} • {d.tempoMinutos} min
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {d.concluida ? (
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        selectedDayNumber === d.dia ? 'text-emerald-300' : 'text-emerald-500'
                      }`}
                    />
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 ${
                        selectedDayNumber === d.dia ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: SELECTED DAY MISSION & DETAILS */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Dia {currentDayPlan.dia} do Reta Final
                </span>
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {currentDayPlan.frequenciaEnem}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {currentDayPlan.topico8020}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentDayPlan.fase}
              </p>
            </div>

            <button
              onClick={() => toggleDayCompletion(currentDayPlan.dia)}
              type="button"
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md active:scale-95 ${
                currentDayPlan.concluida
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentDayPlan.concluida ? 'Missão Concluída!' : 'Marcar como Concluída'}
              </span>
            </button>
          </div>

          {/* Mission Card */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Missão do Dia {currentDayPlan.dia} (Meta do Pareto 80/20):
            </h4>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              "{currentDayPlan.missaoDoDia}"
            </p>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Tempo Sugerido: {currentDayPlan.tempoMinutos} min
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Recompensa: +100 XP
              </span>
            </div>
          </div>

          {/* Quick Strategy Checklist */}
          <div className="space-y-2">
            <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Passos Recomendados para esta Missão:
            </h5>
            <div className="space-y-2">
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-black text-[10px] shrink-0">1</span>
                <span>Revise o resumo super didático de 5 minutos sobre este tema na aba de Flashcards.</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-black text-[10px] shrink-0">2</span>
                <span>Resolva ao menos 10 questões de provas anteriores do ENEM.</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-black text-[10px] shrink-0">3</span>
                <span>Anote as pegadinhas em que escorregou direto no seu Caderno de Erros.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
