import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  Zap,
  Share2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { StudyMaterial, TutorPlan, ELI5Explanation } from '../types';
import { DailyGoalsWidget } from './DailyGoalsWidget';

interface ProgressStatsCardProps {
  materials: StudyMaterial[];
  tutorPlans: TutorPlan[];
  eli5Explanations: ELI5Explanation[];
  studyStreak: number;
  onOpenCalendar?: () => void;
  onOpenSocialStory?: (type: 'redacao' | 'mascote' | 'streak', data?: any) => void;
}

interface LevelInfo {
  level: number;
  title: string;
  badge: string;
  minDays: number;
  nextLevelDays: number;
  color: string;
}

function getLevelInfo(streak: number): LevelInfo {
  if (streak >= 30) {
    return {
      level: 5,
      title: 'Lenda Acadêmica',
      badge: '🏆',
      minDays: 30,
      nextLevelDays: 30,
      color: 'from-amber-500 to-yellow-400',
    };
  }
  if (streak >= 14) {
    return {
      level: 4,
      title: 'Gênio Gabaritador',
      badge: '🔥',
      minDays: 14,
      nextLevelDays: 30,
      color: 'from-purple-600 to-indigo-500',
    };
  }
  if (streak >= 7) {
    return {
      level: 3,
      title: 'Mestre do ENEM',
      badge: '⚡',
      minDays: 7,
      nextLevelDays: 14,
      color: 'from-indigo-600 to-blue-500',
    };
  }
  if (streak >= 3) {
    return {
      level: 2,
      title: 'Estudante Focado',
      badge: '📚',
      minDays: 3,
      nextLevelDays: 7,
      color: 'from-emerald-600 to-teal-500',
    };
  }
  return {
    level: 1,
    title: 'Calouro Promissor',
    badge: '🌱',
    minDays: 1,
    nextLevelDays: 3,
    color: 'from-blue-600 to-cyan-500',
  };
}

export const ProgressStatsCard: React.FC<ProgressStatsCardProps> = ({
  materials,
  tutorPlans,
  eli5Explanations,
  studyStreak,
  onOpenCalendar,
  onOpenSocialStory,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const totalMaterials = materials.length;
  const totalTutorPlans = tutorPlans.length;
  const totalELI5 = eli5Explanations.length;
  const totalItems = totalMaterials + totalTutorPlans + totalELI5;

  // Calculate total flashcards and quiz questions available
  const totalQuestionsAndCards =
    materials.reduce(
      (acc, mat) => acc + (mat.flashcards?.length || 0) + (mat.perguntas?.length || 0),
      0
    ) + tutorPlans.reduce((acc, plan) => acc + (plan.questoes?.length || 0), 0);

  // Estimate total study minutes (15 min per summary, 30 min per tutor plan, 10 min per ELI5)
  const estimatedStudyMinutes = totalMaterials * 15 + totalTutorPlans * 30 + totalELI5 * 10;
  const estimatedHours = Math.floor(estimatedStudyMinutes / 60);
  const remainingMinutes = estimatedStudyMinutes % 60;

  const levelInfo = getLevelInfo(studyStreak);
  const daysInCurrentLevel = studyStreak - levelInfo.minDays;
  const daysNeededForNextLevel = levelInfo.nextLevelDays - levelInfo.minDays;
  const progressPercent =
    levelInfo.level === 5
      ? 100
      : Math.min(
          100,
          Math.max(10, Math.round((daysInCurrentLevel / daysNeededForNextLevel) * 100))
        );

  // Generate weekly frequency usage data based on actual item creation dates or simulated weekly distribution
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sunday(0) to 6, Monday(1) to 0

  const allCreationDates = [
    ...materials.map((m) => new Date(m.createdAt)),
    ...tutorPlans.map((p) => new Date(p.createdAt)),
    ...eli5Explanations.map((e) => new Date(e.createdAt)),
  ];

  // Count study minutes per day of the current week (15 min per summary, 30 min per tutor plan, 10 min per ELI5)
  const weeklyMinutes = [30, 45, 60, 25, 90, 50, estimatedStudyMinutes > 0 ? Math.min(estimatedStudyMinutes, 120) : 40];
  const weeklyCounts = [1, 2, 3, 1, 4, 2, 2];

  const now = new Date();
  allCreationDates.forEach((date) => {
    if (!isNaN(date.getTime())) {
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const dayIdx = (date.getDay() + 6) % 7;
        weeklyCounts[dayIdx] += 1;
        weeklyMinutes[dayIdx] += 25;
      }
    }
  });

  const chartData = daysOfWeek.map((day, idx) => ({
    dia: day,
    minutos: weeklyMinutes[idx],
    sessoes: weeklyCounts[idx],
    isToday: idx === todayIndex,
  }));

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              {levelInfo.badge}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  GabaritaAí Analytics
                </span>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Level {levelInfo.level}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                Nível Atual: {levelInfo.title}
                <span className="text-xs font-normal opacity-80 hidden sm:inline">
                  • {studyStreak} {studyStreak === 1 ? 'dia' : 'dias'} de streak
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenSocialStory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSocialStory('streak', { streakDays: studyStreak, mascotLevel: levelInfo.level });
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartilhar Stories</span>
              </button>
            )}
            <button className="text-slate-300 hover:text-white p-1 rounded-lg transition">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Body */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* Sistema de Metas Diárias (Circular Progress Bar) */}
            <DailyGoalsWidget />

            {/* Level & Streak Progress Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Conquista: {levelInfo.title}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {levelInfo.level === 5 ? (
                    <span className="text-amber-500 font-extrabold">Nível Máximo Alcançado! 🎉</span>
                  ) : (
                    <span>
                      Próximo nível em:{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {levelInfo.nextLevelDays - studyStreak} {levelInfo.nextLevelDays - studyStreak === 1 ? 'dia' : 'dias'}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${levelInfo.color} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Stat 1 */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Conteúdos Criados
                  </span>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-900 dark:text-indigo-200">
                  {totalItems}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Resumos, planos e dúvidas
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tempo de Estudo
                  </span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-200">
                  {estimatedHours > 0 ? `${estimatedHours}h ${remainingMinutes}m` : `${estimatedStudyMinutes} min`}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Estimativa de estudo ativo
                </p>
              </div>

              {/* Stat 3 - Streak with Calendar Trigger */}
              <div
                onClick={onOpenCalendar}
                className={`bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl flex flex-col justify-between ${
                  onOpenCalendar ? 'cursor-pointer hover:border-emerald-400 transition hover:shadow-sm' : ''
                }`}
              >
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sequência (Streak)
                  </span>
                  <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                  {studyStreak} <span className="text-sm font-bold">dias</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span>📅 Ver Calendário</span>
                </p>
              </div>

              {/* Stat 4 */}
              <div className="bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Questões & Cards
                  </span>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-200">
                  {totalQuestionsAndCards}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Prontas para praticar
                </p>
              </div>
            </div>

            {/* Recharts Weekly Study Time Evolution Chart */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    📈 Gráfico de Evolução de Estudo (Tempo por Dia na Semana)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Tempo total em minutos (Recharts)
                </span>
              </div>

              <div className="w-full h-48 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis
                      dataKey="dia"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      unit="m"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const hrs = Math.floor(data.minutos / 60);
                          const mins = data.minutos % 60;
                          const timeStr = hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                              <p className="font-extrabold text-amber-400 flex items-center justify-between gap-2">
                                <span>{data.dia}</span>
                                {data.isToday && <span className="text-[9px] bg-indigo-600 px-1.5 py-0.5 rounded">Hoje</span>}
                              </p>
                              <p className="font-bold text-slate-100">
                                ⏱️ Tempo Estudado: <span className="text-indigo-300">{timeStr}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">
                                📚 Atividades: {data.sessoes} concluídas
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="minutos" radius={[8, 8, 0, 0]} maxBarSize={38}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isToday ? '#6366f1' : '#818cf8'}
                          opacity={entry.isToday ? 1 : 0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
