import React from 'react';
import { Target, GraduationCap, Building2, Clock, Sparkles, Edit3, ArrowRight, PenTool, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface UserGoalFocusCardProps {
  userProfile: UserProfile;
  onEditGoal: () => void;
  onOpenTutorial?: () => void;
  onNavigateToRedacao?: () => void;
  onNavigateToSimulado?: () => void;
}

export function calculateDaysRemaining(targetExam?: string, customDateStr?: string): number {
  if (customDateStr) {
    try {
      const customDate = new Date(customDateStr);
      const diff = customDate.getTime() - Date.now();
      if (!isNaN(diff)) {
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }
    } catch {
      // fallback
    }
  }

  // Default dates for 2026 exams (assuming current date ~ August 12, 2026)
  const now = new Date();
  let targetDate = new Date('2026-11-08T00:00:00'); // ENEM date

  const examUpper = (targetExam || '').toUpperCase();
  if (examUpper.includes('REGIONAL') || examUpper.includes('FUVEST') || examUpper.includes('UNICAMP')) {
    targetDate = new Date('2026-11-15T00:00:00');
  } else if (examUpper.includes('CONCURSO') || examUpper.includes('REFORÇO')) {
    targetDate = new Date('2026-12-01T00:00:00');
  }

  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export const UserGoalFocusCard: React.FC<UserGoalFocusCardProps> = ({
  userProfile,
  onEditGoal,
  onOpenTutorial,
  onNavigateToRedacao,
  onNavigateToSimulado,
}) => {
  const course = userProfile.targetCourse || 'Medicina';
  const university = userProfile.targetUniversity || 'USP';
  const exam = userProfile.targetExam || 'ENEM';
  const routine = userProfile.studyRoutine || '2 a 4 horas';

  const daysRemaining = calculateDaysRemaining(exam, userProfile.examDate);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
      {/* Background glow circle */}
      <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top badges bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-slate-950" /> Meta Personalizada
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {university}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="text-xs font-extrabold text-amber-300 hover:text-white bg-indigo-900/80 hover:bg-indigo-800/80 px-3 py-1.5 rounded-xl border border-indigo-500/40 transition flex items-center gap-1.5 cursor-pointer pointer-events-auto shrink-0 shadow-xs active:scale-95"
                title="Abrir Tutorial Rápido com o carrossel da plataforma"
              >
                <span>💡</span>
                <span>Tutorial Rápido</span>
              </button>
            )}

            <button
              type="button"
              onClick={onEditGoal}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer pointer-events-auto shrink-0 active:scale-95"
              title="Editar objetivo de estudos"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editar Meta</span>
            </button>
          </div>
        </div>

        {/* Main Customized Title & Countdown */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Painel Focado em <span className="text-amber-400">{course}</span> {university ? `na ${university}` : ''}
          </h2>

          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-indigo-500/20 border border-amber-500/40 px-4 py-2 rounded-2xl">
            <span className="text-base sm:text-lg">⏳</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
              Faltam <strong className="text-amber-400 text-sm sm:text-base font-extrabold">{daysRemaining} dias</strong> para a prova ({exam})
            </span>
          </div>
        </div>

        {/* Meta summary stats pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Exame Alvo:</span>
              <span className="text-xs font-black text-white">{exam}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Rotina Diária:</span>
              <span className="text-xs font-black text-white">{routine}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-2.5 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Meta Diária:</span>
              <span className="text-xs font-black text-white">{userProfile.dailyHoursGoal || 4}h / {userProfile.dailyQuestionsGoal || 20} questões</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons for focused study */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {onNavigateToRedacao && (
            <button
              type="button"
              onClick={onNavigateToRedacao}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 active:scale-95"
            >
              <PenTool className="w-4 h-4 text-indigo-200" />
              <span>✍️ Treinar Redação para {course}</span>
            </button>
          )}

          {onNavigateToSimulado && (
            <button
              type="button"
              onClick={onNavigateToSimulado}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>📝 Iniciar Simulado {exam}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
