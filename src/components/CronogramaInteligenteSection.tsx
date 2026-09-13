import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TaskCronograma {
  id: string;
  materia: string;
  topico: string;
  duracaoMin: number;
  questoesMeta: number;
  concluida: boolean;
  prioridade: 'Alta' | 'Média' | 'Normal';
}

const INITIAL_TASKS: TaskCronograma[] = [
  {
    id: 't1',
    materia: 'Matemática',
    topico: 'Geometria Espacial (Prismas e Cilindros)',
    duracaoMin: 50,
    questoesMeta: 15,
    concluida: true,
    prioridade: 'Alta',
  },
  {
    id: 't2',
    materia: 'Redação',
    topico: 'Treino de Proposta de Intervenção (C5)',
    duracaoMin: 45,
    questoesMeta: 1,
    concluida: false,
    prioridade: 'Alta',
  },
  {
    id: 't3',
    materia: 'Física',
    topico: 'Circuitos Elétricos e Lei de Ohm',
    duracaoMin: 40,
    questoesMeta: 10,
    concluida: false,
    prioridade: 'Média',
  },
  {
    id: 't4',
    materia: 'Biologia',
    topico: 'Ecologia e Ciclos Biogeoquímicos',
    duracaoMin: 35,
    questoesMeta: 12,
    concluida: false,
    prioridade: 'Normal',
  },
];

export const CronogramaInteligenteSection: React.FC = () => {
  const [tasks, setTasks] = useState<TaskCronograma[]>(INITIAL_TASKS);
  const [diasPerdidosCount, setDiasPerdidosCount] = useState<number>(0);
  const [recalculando, setRecalculando] = useState<boolean>(false);
  const [mensagemRecalculo, setMensagemRecalculo] = useState<string | null>(null);

  // Target exam date calculation
  const targetDate = new Date('2026-11-08T13:00:00');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diasRestantes = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, concluida: !t.concluida } : t))
    );
  };

  const handleMarcarDiaPerdido = () => {
    setRecalculando(true);
    setMensagemRecalculo(null);

    setTimeout(() => {
      setDiasPerdidosCount((prev) => prev + 1);

      // Redistribute tasks: add 10 min or +2 questions to remaining non-completed tasks
      setTasks((prev) =>
        prev.map((t) => {
          if (!t.concluida) {
            return {
              ...t,
              duracaoMin: Math.min(90, t.duracaoMin + 10),
              questoesMeta: t.questoesMeta + 3,
            };
          }
          return t;
        })
      );

      setRecalculando(false);
      setMensagemRecalculo(
        '🔄 Dia acumulado redistribuído com sucesso! Adicionamos +10 minutos de revisão leve aos próximos dias para garantir que você cubra 100% do edital sem sobrecarga.'
      );
    }, 1200);
  };

  const completedCount = tasks.filter((t) => t.concluida).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Pacing Adaptativo
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                Módulo nº 4
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Cronograma Inteligente & Recálculo de Faltas
            </h2>
          </div>
        </div>

        {/* Days remaining badge */}
        <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-3 px-5 text-right">
          <span className="text-[10px] font-black uppercase text-amber-400 block">
            Meta ENEM 2026
          </span>
          <span className="text-lg font-black text-white">
            {diasRestantes} Dias Restantes
          </span>
        </div>
      </div>

      {/* Recalculate Trigger Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
              Redistribuição Automática sem Acúmulo
            </span>
            <h3 className="text-sm font-extrabold text-white">
              Perdeu um dia de estudos por imprevisto?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Clique em "Marcar Dia Perdido" e nossa IA recalculará o ritmo ideal de estudo distribuindo os conteúdos nos dias seguintes de forma suave.
            </p>
          </div>

          <button
            onClick={handleMarcarDiaPerdido}
            disabled={recalculando}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
          >
            {recalculando ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Recalculando Edital...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-slate-950" />
                <span>Marcar Dia Perdido (Recalcular)</span>
              </>
            )}
          </button>
        </div>

        {mensagemRecalculo && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-purple-950/80 border border-purple-500/40 rounded-2xl text-xs font-semibold text-purple-200 leading-relaxed"
          >
            {mensagemRecalculo}
          </motion.div>
        )}
      </div>

      {/* Today's Tasks Checklist */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              Metas de Estudo de Hoje
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-bold">Progresso Diário:</span>
            <div className="w-32 bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-400 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-black text-amber-400">{progressPercent}%</span>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 rounded-2xl border text-xs transition cursor-pointer flex items-center justify-between ${
                task.concluida
                  ? 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-80'
                  : 'bg-slate-950 border-purple-500/20 text-white hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
                    task.concluida
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-slate-600 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-amber-400">{task.materia}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {task.duracaoMin} min
                    </span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
                      Meta: {task.questoesMeta} questões
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 font-medium ${task.concluida ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.topico}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  task.prioridade === 'Alta'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                }`}
              >
                {task.prioridade}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
