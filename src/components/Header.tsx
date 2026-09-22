import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  History,
  HelpCircle,
  Flame,
  Sun,
  Moon,
  Zap,
  Settings,
  Bell,
  BellRing,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  User,
  Search,
  MoreVertical,
  X,
} from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendStreakReminderNotification,
  isTodayStudyCompleted,
} from '../utils/notifications';
import { StudyMaterial, TutorPlan, ELI5Explanation } from '../types';
import { HeaderGlobalSearch } from './HeaderGlobalSearch';
import { GabiAvatar } from './GabiAvatar';
import { OpcoesGeraisModal } from './OpcoesGeraisModal';
import { PrimaryTab } from './BottomNavigationBar';
import { AbaAtiva } from './NavigationTabs';

export type AbaTopo = 'bento' | 'banca' | 'calendario' | 'flashcards' | 'ranking' | 'profe' | 'pro' | 'graficos';

interface HeaderProps {
  historyCount: number;
  studyStreak: number;
  theme: 'light' | 'dark';
  canGoBack?: boolean;
  onGoBack?: () => void;
  activeTabLabel?: string;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenGabi?: () => void;
  onOpenPro?: () => void;
  onOpenProfile?: () => void;
  onOpenRanking?: () => void;
  onOpenFlashcards?: () => void;
  onOpenCalendar?: () => void;
  onOpenBanca?: () => void;
  onOpenGraficosTri?: () => void;
  onOpenOnboarding?: () => void;
  onOpenTour?: () => void;
  onOpenOpcoesPage?: () => void;
  onResetView?: () => void;
  activeAbaTopo?: AbaTopo;
  onSelectAbaTopo?: (aba: AbaTopo) => void;
  materials?: StudyMaterial[];
  tutorPlans?: TutorPlan[];
  eli5Explanations?: ELI5Explanation[];
  onSelectMaterial?: (material: StudyMaterial) => void;
  onSelectTutorPlan?: (plan: TutorPlan) => void;
  onSelectELI5?: (explanation: ELI5Explanation) => void;
  onNavigate?: (primaryTab: PrimaryTab, subTab?: AbaAtiva) => void;
  onOpenModal?: (modalName: string) => void;
  onSelectFlashcardTopic?: (topic: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  studyStreak,
  theme,
  canGoBack,
  onGoBack,
  onToggleTheme,
  onOpenHistory,
  onOpenHelp,
  onOpenGabi,
  onOpenPro,
  onOpenProfile,
  onOpenRanking,
  onOpenFlashcards,
  onOpenCalendar,
  onOpenBanca,
  onOpenGraficosTri,
  onOpenOnboarding,
  onOpenTour,
  onOpenOpcoesPage,
  onResetView,
  activeAbaTopo: controlledAbaTopo,
  onSelectAbaTopo,
  materials = [],
  tutorPlans = [],
  eli5Explanations = [],
  onSelectMaterial,
  onSelectTutorPlan,
  onSelectELI5,
  onNavigate,
  onOpenModal,
  onSelectFlashcardTopic,
}) => {
  const [isOpcoesModalOpen, setIsOpcoesModalOpen] = useState(false);
  const [internalAbaTopo, setInternalAbaTopo] = useState<AbaTopo>('bento');
  const activeAbaTopo = controlledAbaTopo || internalAbaTopo;

  const setAbaTopo = (aba: AbaTopo) => {
    setInternalAbaTopo(aba);
    if (onSelectAbaTopo) {
      onSelectAbaTopo(aba);
    }
    if (aba === 'bento') {
      onResetView?.();
    } else if (aba === 'banca') {
      onOpenBanca?.();
    } else if (aba === 'calendario') {
      onOpenCalendar?.();
    } else if (aba === 'flashcards') {
      onOpenFlashcards?.();
    } else if (aba === 'ranking') {
      onOpenRanking?.();
    } else if (aba === 'profe') {
      onOpenGabi?.();
    } else if (aba === 'pro') {
      onOpenPro?.();
    } else if (aba === 'graficos') {
      onOpenGraficosTri?.();
    }
  };
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [notifState, setNotifState] = useState(() => ({
    settings: getNotificationSettings(),
    permission: getNotificationPermission(),
    isCompletedToday: isTodayStudyCompleted(),
  }));
  const [headerMsg, setHeaderMsg] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  // Mobile state toggles
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setHeaderMsg(message);
    setTimeout(() => {
      setToastNotification(null);
      setHeaderMsg(null);
    }, 4500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifState({
        settings: getNotificationSettings(),
        permission: getNotificationPermission(),
        isCompletedToday: isTodayStudyCompleted(),
      });
      setIsLoadingSettings(false);
    }, 400);

    const updateNotifStatus = () => {
      setNotifState({
        settings: getNotificationSettings(),
        permission: getNotificationPermission(),
        isCompletedToday: isTodayStudyCompleted(),
      });
    };

    const interval = setInterval(updateNotifStatus, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu on outside click (touch and mouse)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleTimeChange = (newTime: string) => {
    setIsSavingSettings(true);
    const updated = { ...notifState.settings, time: newTime };
    saveNotificationSettings(updated);
    setNotifState((prev) => ({ ...prev, settings: updated }));
    showToast(`⏰ Horário do lembrete alterado para as ${newTime}!`, 'info');
    setTimeout(() => setIsSavingSettings(false), 300);
  };

  const handleHeaderNotificationClick = async () => {
    console.log('[Header] 🔔 Lembrete de Notificação clicado no cabeçalho.');
    let perm = notifState.permission;
    if (perm !== 'granted') {
      console.log('[Header] Solicitando permissão de notificação...');
      perm = await requestNotificationPermission();
      setNotifState((prev) => ({ ...prev, permission: perm }));
    }

    if (perm === 'granted') {
      const isAtRisk = !isTodayStudyCompleted();
      sendStreakReminderNotification(studyStreak, isAtRisk);
      console.log('[Header] ✅ Notificação de lembrete de streak enviada com sucesso.');
      showToast('🚨 Hora de Estudar! Lembrete de streak enviado!', 'success');
    } else {
      console.warn('[Header] ⚠️ Notificações bloqueadas no navegador.');
      showToast('⚠️ Notificações bloqueadas no seu navegador. Permita o acesso nas configurações.', 'warning');
    }
  };

  const handleQuickTestNotification = async () => {
    console.log('[Header] ⚡ [Testar Notificação] Botão clicado. Iniciando disparo da notificação push local...');
    let perm = notifState.permission;

    if (perm !== 'granted') {
      console.log('[Header] [Testar Notificação] Permissão atual não concedida. Solicitando ao usuário...');
      perm = await requestNotificationPermission();
      setNotifState((prev) => ({ ...prev, permission: perm }));
    }

    if (perm === 'granted') {
      const isAtRisk = !isTodayStudyCompleted();
      console.log('[Header] [Testar Notificação] Permissão concedida. Enviando notificação de teste...', { studyStreak, isAtRisk });
      const sent = sendStreakReminderNotification(studyStreak, isAtRisk);
      
      console.info('✅ [Header] [Testar Notificação] Notificação enviada com sucesso ao sistema/navegador!', { sent });
      showToast('⚡ Teste Rápido enviado com sucesso! Verifique o alerta "Hora de Estudar!".', 'success');
    } else {
      console.warn('⚠️ [Header] [Testar Notificação] Permissão de notificação negada ou indisponível.');
      showToast('⚠️ Notificações bloqueadas no seu navegador. Ative as permissões para visualizar.', 'warning');
    }
  };

  return (
    <header 
      style={{ width: '100%', boxSizing: 'border-box' }}
      className={`w-full max-w-full box-border bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 transition-colors duration-200 pointer-events-auto shadow-xs ${
        isMobileSearchOpen ? 'z-[60]' : 'z-30'
      }`}
    >
      {/* LINHA 1: BARRA SUPERIOR PRINCIPAL */}
      <div 
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box' }}
        className="w-full max-w-7xl mx-auto px-3 py-2 sm:px-6 sm:py-3 flex flex-row items-center justify-between flex-nowrap gap-2 box-border relative"
      >
        {/* Se a busca mobile estiver aberta, exibe campo de busca full-width */}
        {isMobileSearchOpen ? (
          <div className="flex items-center w-full gap-2 animate-in fade-in duration-150">
            <div className="flex-1 min-w-0">
              <HeaderGlobalSearch
                materials={materials}
                tutorPlans={tutorPlans}
                eli5Explanations={eli5Explanations}
                onSelectMaterial={(m) => {
                  setIsMobileSearchOpen(false);
                  onSelectMaterial?.(m);
                }}
                onSelectTutorPlan={(p) => {
                  setIsMobileSearchOpen(false);
                  onSelectTutorPlan?.(p);
                }}
                onSelectELI5={(e) => {
                  setIsMobileSearchOpen(false);
                  onSelectELI5?.(e);
                }}
                onNavigate={(prim, sub) => {
                  setIsMobileSearchOpen(false);
                  onNavigate?.(prim, sub);
                }}
                onOpenModal={(modal) => {
                  setIsMobileSearchOpen(false);
                  onOpenModal?.(modal);
                }}
                onSelectFlashcardTopic={(topic) => {
                  setIsMobileSearchOpen(false);
                  onSelectFlashcardTopic?.(topic);
                }}
                onShowToast={showToast}
                autoFocus={true}
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 active:scale-95 transition"
              title="Fechar busca"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Brand & Back Button (Left) */}
            <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto shrink-0 min-w-0">
              {canGoBack && onGoBack && (
                <button
                  type="button"
                  onClick={onGoBack}
                  className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs shrink-0"
                  title="Voltar para a tela anterior"
                >
                  <span className="text-sm">←</span>
                  <span className="hidden sm:inline">Voltar</span>
                </button>
              )}

              <div
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0"
                onClick={onResetView}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                      CFJVMG
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/80 uppercase tracking-wider shrink-0">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-indigo-600 dark:text-indigo-400" /> IA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                    Plataforma Inteligente de Estudos & Scanner Tira-Dúvidas
                  </p>
                </div>
              </div>
            </div>

            {/* Global Search Bar (Desktop Center) */}
            <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-3">
              <HeaderGlobalSearch
                materials={materials}
                tutorPlans={tutorPlans}
                eli5Explanations={eli5Explanations}
                onSelectMaterial={onSelectMaterial}
                onSelectTutorPlan={onSelectTutorPlan}
                onSelectELI5={onSelectELI5}
                onNavigate={onNavigate}
                onOpenModal={onOpenModal}
                onSelectFlashcardTopic={onSelectFlashcardTopic}
                onShowToast={showToast}
                className="w-full"
              />
            </div>

            {/* Action Controls & Badges (Right) */}
            <div className="flex flex-row items-center justify-end flex-nowrap gap-1.5 sm:gap-2 shrink-0 pointer-events-auto">
              {/* Mobile Search Toggle Icon (Lupa 🔍 com label) */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition shrink-0"
                title="Buscar recursos, flashcards ou matérias"
                aria-label="Abrir busca global"
              >
                <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold">Buscar</span>
              </button>

              {/* Banca Personality Button (Desktop) */}
              {onOpenBanca && (
                <button
                  type="button"
                  onClick={onOpenBanca}
                  className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-extrabold transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Seletor de Personalidade da Banca (ENEM, FUVEST, VUNESP)"
                >
                  <span className="text-sm">🏛️</span>
                  <span>Banca IA</span>
                </button>
              )}

              {/* Calendário de Estudos Button (Desktop) */}
              {onOpenCalendar && (
                <button
                  type="button"
                  onClick={onOpenCalendar}
                  className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200 text-xs font-extrabold transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Calendário de Estudos & Desafio Diário"
                >
                  <span className="text-sm">📅</span>
                  <span>Calendário</span>
                </button>
              )}

              {/* Flashcards Generator Button (Desktop) */}
              {onOpenFlashcards && (
                <button
                  type="button"
                  onClick={onOpenFlashcards}
                  className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-extrabold transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Gerador de Flashcards com IA"
                >
                  <span className="text-sm">🎴</span>
                  <span>Flashcards</span>
                </button>
              )}

              {/* Ranking Semanal Header Button (Desktop) */}
              {onOpenRanking && (
                <button
                  type="button"
                  onClick={onOpenRanking}
                  className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Ranking Semanal & Gamificação"
                >
                  <span className="text-sm">🏆</span>
                  <span>Ranking</span>
                </button>
              )}

              {/* Gabi Assistant Header Button (Desktop) */}
              {onOpenGabi && (
                <button
                  id="header-gabi-assistant-button"
                  type="button"
                  onClick={onOpenGabi}
                  className="hidden md:inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-white text-xs font-black transition shadow-sm cursor-pointer pointer-events-auto active:scale-95 group relative shrink-0"
                  title="Falar com a Professora Gabi IA - Tutora e Assistente Virtual (Atalho: Alt + G ou Ctrl + G)"
                >
                  <GabiAvatar size={24} showOnlineStatus={true} statusBadgeSize={6} />
                  <span className="text-slate-900 dark:text-slate-100 font-extrabold flex items-center gap-1">
                    <span>Professora Gabi</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                </button>
              )}

              {/* Tour Guiado Button (Desktop) */}
              {onOpenTour && (
                <button
                  id="header-open-welcome-tour-btn"
                  type="button"
                  onClick={onOpenTour}
                  className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Abrir Tour Guiado de Boas-Vindas (Scanner, Redação e Simulados)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tour Guiado</span>
                </button>
              )}

              {/* Plano PRO Button (Desktop) */}
              {onOpenPro && (
                <button
                  type="button"
                  onClick={onOpenPro}
                  className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer pointer-events-auto active:scale-95 shrink-0"
                  title="Planos & Assinatura PRO"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>PRO</span>
                </button>
              )}

              {/* Local Push Notification Config Group & Quick Test Button (Desktop) */}
              <div className="hidden md:flex items-center gap-2 pointer-events-auto shrink-0">
                {isLoadingSettings ? (
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-1.5 rounded-2xl shrink-0 animate-pulse pointer-events-auto">
                    <div className="hidden sm:block w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="w-20 h-6 bg-amber-200 dark:bg-amber-800/50 rounded-lg" />
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-1 rounded-2xl shrink-0 transition-opacity pointer-events-auto ${isSavingSettings ? 'opacity-50 animate-pulse' : ''}`}>
                    <div className="flex items-center space-x-1 px-1.5 py-0.5" title="Horário Agendado do Lembrete de Estudos">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <input
                        type="time"
                        value={notifState.settings.time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="bg-transparent text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pointer-events-auto w-auto max-w-16"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickTestNotification}
                      className="px-2.5 py-1.5 min-h-9 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[11px] transition-all flex items-center space-x-1 cursor-pointer pointer-events-auto shadow-xs shrink-0"
                      title="Disparar notificação push imediata para testar a configuração de lembrete"
                    >
                      <Send className="w-3 h-3 shrink-0" />
                      <span className="whitespace-nowrap">Teste Rápido</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Button */}
              <button
                type="button"
                onClick={handleHeaderNotificationClick}
                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl border transition cursor-pointer pointer-events-auto flex items-center justify-center active:scale-95 shrink-0 ${
                  !notifState.isCompletedToday
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                }`}
                title={
                  !notifState.isCompletedToday
                    ? 'Hora de Estudar! Sua streak de estudos está em risco hoje. Clique para testar/enviar notificação.'
                    : 'Notificação Push de Estudos Ativa (Horário: ' + notifState.settings.time + ')'
                }
              >
                {!notifState.isCompletedToday ? (
                  <BellRing className="w-4 h-4 text-rose-500" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {!notifState.isCompletedToday && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Theme Selector Button (Desktop) */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="hidden sm:flex sm:w-auto sm:h-auto sm:px-3 sm:py-2 items-center gap-1.5 justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100 transition cursor-pointer pointer-events-auto active:scale-95 shrink-0 shadow-xs"
                title={theme === 'dark' ? 'Modo Noite Ativo. Clique para alternar para Modo Dia.' : 'Modo Dia Ativo. Clique para alternar para Modo Noite.'}
                aria-label="Alternar tema dia/noite"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
                    <span>Modo Noite</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    <span>Modo Dia</span>
                  </>
                )}
              </button>

              {/* Student Profile & Settings Button */}
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition cursor-pointer pointer-events-auto active:scale-95 shrink-0 flex items-center justify-center space-x-1.5"
                  title="Abrir Meu Perfil & Configurações"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Meu Perfil</span>
                </button>
              )}

              {/* Quick Options Menu Button (3 Pontos / Mais Opções - Abre a Nova Página Dedicada de Opções & Configurações) */}
              <button
                id="header-open-opcoes-hub-btn"
                type="button"
                onClick={() => {
                  if (onOpenOpcoesPage) {
                    onOpenOpcoesPage();
                  } else {
                    setIsOpcoesModalOpen(true);
                  }
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95 transition shrink-0 cursor-pointer pointer-events-auto relative z-50 hover:ring-2 hover:ring-violet-500/40"
                title="Abrir Página de Opções, Conta e Configurações"
                aria-label="Abrir Página de Opções e Configurações"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* History Button (Desktop) */}
              <button
                type="button"
                onClick={onOpenHistory}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 min-h-10 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition cursor-pointer pointer-events-auto active:scale-95 shrink-0"
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
                {historyCount > 0 && (
                  <span className="bg-indigo-500 dark:bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* LINHA 2: GRADE COMPACTA DE NAVEGAÇÃO SECUNDÁRIA DO TOPO (100% VISÍVEL, SEM SCROLL) */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
        <div 
          id="header-secondary-navigation-grid"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full p-2.5 bg-[#18181B] border-b border-white/10 rounded-2xl my-2"
        >
          {/* 🍱 Bento AI */}
          <button
            id="header-nav-bento"
            type="button"
            onClick={() => setAbaTopo('bento')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'bento'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>🍱</span>
            <span>Bento AI</span>
          </button>

          {/* 🏛️ Banca IA */}
          <button
            id="header-nav-banca"
            type="button"
            onClick={() => setAbaTopo('banca')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'banca'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>🏛️</span>
            <span>Banca IA</span>
          </button>

          {/* 📅 Calendário */}
          <button
            id="header-nav-calendario"
            type="button"
            onClick={() => setAbaTopo('calendario')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'calendario'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>📅</span>
            <span>Calendário</span>
          </button>

          {/* 📇 Flashcards */}
          <button
            id="header-nav-flashcards"
            type="button"
            onClick={() => setAbaTopo('flashcards')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'flashcards'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>📇</span>
            <span>Flashcards</span>
          </button>

          {/* 🏆 Ranking */}
          <button
            id="header-nav-ranking"
            type="button"
            onClick={() => setAbaTopo('ranking')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'ranking'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>🏆</span>
            <span>Ranking</span>
          </button>

          {/* 👩‍🏫 Professora IA */}
          <button
            id="header-nav-profe"
            type="button"
            onClick={() => setAbaTopo('profe')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'profe'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>👩‍🏫</span>
            <span>Professora IA</span>
          </button>

          {/* 💎 Plano PRO */}
          <button
            id="header-nav-pro"
            type="button"
            onClick={() => setAbaTopo('pro')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'pro'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>💎</span>
            <span>Plano PRO</span>
          </button>

          {/* 📈 Gráficos TRI */}
          <button
            id="header-nav-graficos"
            type="button"
            onClick={() => setAbaTopo('graficos')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all active:scale-95 text-center w-full relative z-50 pointer-events-auto cursor-pointer ${
              activeAbaTopo === 'graficos'
                ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 hover:bg-violet-600/30 border border-white/10 text-zinc-200 font-medium'
            }`}
          >
            <span>📈</span>
            <span>Gráficos TRI</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification / Banner Confirmation */}
      {toastNotification ? (
        <div 
          className={`px-4 py-2 text-xs font-black text-center flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-1 transition-all pointer-events-auto shadow-md ${
            toastNotification.type === 'success'
              ? 'bg-emerald-500 text-white'
              : toastNotification.type === 'warning'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {toastNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
          {toastNotification.type === 'warning' && <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />}
          {toastNotification.type === 'info' && <BellRing className="w-4 h-4 shrink-0 text-white" />}
          <span>{toastNotification.message}</span>
        </div>
      ) : headerMsg ? (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs font-black text-center flex items-center justify-center space-x-2 animate-in fade-in pointer-events-auto">
          <BellRing className="w-3.5 h-3.5" />
          <span>{headerMsg}</span>
        </div>
      ) : null}

      {/* DEDICATED FULL MODAL PAGE: Central de Opções & Configurações (Acionado pelos 3 pontinhos) */}
      <OpcoesGeraisModal
        isOpen={isOpcoesModalOpen}
        onClose={() => setIsOpcoesModalOpen(false)}
        historyCount={historyCount}
        studyStreak={studyStreak}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenProfile={() => {
          setIsOpcoesModalOpen(false);
          onOpenProfile?.();
        }}
        onOpenHistory={() => {
          setIsOpcoesModalOpen(false);
          onOpenHistory();
        }}
        onOpenHelp={() => {
          setIsOpcoesModalOpen(false);
          onOpenHelp();
        }}
        onOpenOnboarding={() => {
          setIsOpcoesModalOpen(false);
          onOpenOnboarding?.();
        }}
      />
    </header>
  );
};

