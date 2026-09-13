import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Sparkles,
  Trophy,
  Target,
  Check,
  RotateCcw,
  BookOpen,
  Bell,
  BellRing,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendStreakReminderNotification,
  isNotificationSupported,
} from '../utils/notifications';

interface StudyCalendarModalProps {
  onClose: () => void;
  studyStreak: number;
  onUpdateStreak?: (newStreak: number) => void;
}

const STORAGE_KEY = 'gabaritai_completed_challenge_dates_v1';

// Helper to format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DAILY_CHALLENGES = [
  'Resolver 10 questões do ENEM ou criar 1 resumo',
  'Estudar 20 minutos de exatas e praticar flashcards',
  'Escrever ou analisar a introdução de uma redação',
  'Revisar 3 tópicos marcados como difíceis',
  'Completar 1 plano de tutor e responder aos quizzes',
];

export const StudyCalendarModal: React.FC<StudyCalendarModalProps> = ({
  onClose,
  studyStreak,
  onUpdateStreak,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Set of completed date strings YYYY-MM-DD
  const [completedDates, setCompletedDates] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
      
      // Default seed with recent consecutive days to match initial streak for realistic visualization
      const seed = new Set<string>();
      const today = new Date();
      for (let i = 0; i < Math.max(1, studyStreak); i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        seed.add(formatDateKey(d));
      }
      return seed;
    } catch {
      return new Set();
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification settings state
  const [notifSettings, setNotifSettings] = useState(() => getNotificationSettings());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  const handleToggleNotification = async () => {
    if (!isNotificationSupported()) {
      setToastMessage('Seu navegador não suporta notificações Push locais.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    if (!notifSettings.enabled) {
      // Request permission if not already granted
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);

      if (perm === 'granted') {
        const updated = { ...notifSettings, enabled: true };
        setNotifSettings(updated);
        saveNotificationSettings(updated);
        setToastMessage('🔔 Notificações diárias de Streak ativadas!');
        sendStreakReminderNotification(studyStreak);
      } else if (perm === 'denied') {
        setToastMessage('⚠️ Permissão de notificação foi bloqueada no seu navegador.');
      }
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      setToastMessage('Notificações de lembrete desativadas.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTimeChange = (newTime: string) => {
    const updated = { ...notifSettings, time: newTime };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setToastMessage(` Horário do lembrete alterado para as ${newTime}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestNotification = async () => {
    if (!isNotificationSupported()) {
      setToastMessage('Seu navegador não suporta a API de Notificação.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    let perm = notifPermission;
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
      setNotifPermission(perm);
    }

    if (perm === 'granted') {
      const sent = sendStreakReminderNotification(studyStreak);
      if (sent) {
        setToastMessage('⚡ Notificação de teste enviada! Confira a área de notificações do seu sistema.');
      } else {
        setToastMessage('Não foi possível disparar a notificação.');
      }
    } else {
      setToastMessage('Permissão de notificação negada no navegador.');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save to localStorage when completedDates change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedDates)));
    } catch (e) {
      console.error('Erro ao salvar datas no localStorage:', e);
    }
  }, [completedDates]);

  const todayKey = formatDateKey(new Date());
  const isTodayCompleted = completedDates.has(todayKey);

  // Get current challenge of the day based on day of month
  const todayChallengeIndex = new Date().getDate() % DAILY_CHALLENGES.length;
  const todayChallenge = DAILY_CHALLENGES[todayChallengeIndex];

  const toggleTodayChallenge = () => {
    const newSet = new Set(completedDates);
    if (isTodayCompleted) {
      newSet.delete(todayKey);
      setToastMessage('Desafio de hoje desmarcado.');
    } else {
      newSet.add(todayKey);
      setToastMessage('🎉 Parabéns! Desafio do dia concluído (+50 XP)!');
      if (onUpdateStreak) {
        onUpdateStreak(studyStreak + 1);
      }
    }
    setCompletedDates(newSet);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSpecificDate = (dateKey: string) => {
    // Only allow toggling past or present dates
    if (dateKey > todayKey) return;

    const newSet = new Set(completedDates);
    if (newSet.has(dateKey)) {
      newSet.delete(dateKey);
    } else {
      newSet.add(dateKey);
    }
    setCompletedDates(newSet);
  };

  // Calendar month rendering logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate monthly statistics
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const completedThisMonthCount = Array.from(completedDates).filter((key) =>
    key.startsWith(currentMonthPrefix)
  ).length;

  const monthProgressPercent = Math.round((completedThisMonthCount / daysInMonth) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-inner shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                  Gamificação & Hábito
                </span>
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300" /> {studyStreak} Dias Seguidos
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Calendário de Estudos & Desafios
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-emerald-500 text-white font-black text-xs rounded-2xl text-center shadow-lg animate-in fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TODAY'S DAILY CHALLENGE CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border-2 border-amber-400/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Desafio Diário
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> +50 XP bônus
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white">
                {todayChallenge}
              </h4>
              <p className="text-[11px] text-slate-300 font-medium">
                Complete o desafio para manter o fogo do seu Streak aceso hoje!
              </p>
            </div>

            <button
              onClick={toggleTodayChallenge}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-lg ${
                isTodayCompleted
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
              }`}
            >
              {isTodayCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Desafio Concluído!</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-slate-950" />
                  <span>Concluir Desafio de Hoje</span>
                </>
              )}
            </button>
          </div>

          {/* MONTHLY CALENDAR CONTROL & HEADER */}
          <div className="bg-slate-50 dark:bg-slate-950/80 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {MONTH_NAMES[month]} {year}
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition cursor-pointer"
                >
                  Hoje
                </button>
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MONTHLY PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300">
                <span>Consistência em {MONTH_NAMES[month]}: {completedThisMonthCount} de {daysInMonth} dias</span>
                <span className="text-indigo-500">{monthProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, monthProgressPercent)}%` }}
                />
              </div>
            </div>

            {/* WEEKDAY LABELS */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-400 uppercase tracking-wider pt-2">
              {WEEKDAYS.map((wd) => (
                <div key={wd}>{wd}</div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding cells before 1st of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-2xl bg-transparent" />
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateObj = new Date(year, month, dayNum);
                const dateKey = formatDateKey(dateObj);

                const isCompleted = completedDates.has(dateKey);
                const isToday = dateKey === todayKey;
                const isFuture = dateKey > todayKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => toggleSpecificDate(dateKey)}
                    disabled={isFuture}
                    title={
                      isCompleted
                        ? `${dayNum} de ${MONTH_NAMES[month]} - Desafio Concluído! 🔥`
                        : isFuture
                        ? 'Dia futuro'
                        : `Clique para marcar o desafio de ${dayNum}/${month + 1}`
                    }
                    className={`h-10 sm:h-12 rounded-2xl font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                      isCompleted
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                        : isToday
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 dark:ring-indigo-900 shadow-md'
                        : isFuture
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {isCompleted && (
                      <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950 absolute bottom-1" />
                    )}
                    {isToday && !isCompleted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEGEND & STREAK BADGES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                🔥
              </div>
              <div>
                <strong className="text-amber-900 dark:text-amber-200 block font-black">
                  Desafio Cumprido
                </strong>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                  Sequência mantida com sucesso
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                📍
              </div>
              <div>
                <strong className="text-indigo-900 dark:text-indigo-200 block font-black">
                  Dia Atual
                </strong>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  Meta pronta para ser concluída
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm shrink-0">
                🏆
              </div>
              <div>
                <strong className="text-emerald-900 dark:text-emerald-200 block font-black">
                  Conquista Semanal
                </strong>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  +150 XP bônus por 7 dias
                </span>
              </div>
            </div>
          </div>

          {/* PUSH NOTIFICATIONS REMINDER SETTINGS CARD */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-5 border border-indigo-700/50 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <BellRing className="w-5 h-5 text-indigo-300 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-extrabold text-sm text-white">Lembrete Diário Push</h5>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        notifPermission === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : notifPermission === 'denied'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {notifPermission === 'granted'
                        ? 'Permissão Concedida'
                        : notifPermission === 'denied'
                        ? 'Permissão Bloqueada'
                        : 'Aguardando Permissão'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium">
                    Receba notificações nativas do navegador no seu horário preferido para não quebrar a streak!
                  </p>
                </div>
              </div>

              {/* Enable Toggle Button */}
              <button
                onClick={handleToggleNotification}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shrink-0 shadow-md ${
                  notifSettings.enabled && notifPermission === 'granted'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {notifSettings.enabled && notifPermission === 'granted'
                    ? 'Lembretes Ativos'
                    : 'Ativar Notificações'}
                </span>
              </button>
            </div>

            {/* Time Picker & Test Trigger */}
            <div className="pt-3 border-t border-indigo-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <label className="text-xs font-bold text-indigo-100">Horário do Lembrete:</label>
                <input
                  type="time"
                  value={notifSettings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="bg-slate-950 border border-indigo-500/40 rounded-xl px-2.5 py-1 text-xs font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleTestNotification}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Testar Notificação Agora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
