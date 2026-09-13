import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  History,
  Sun,
  Moon,
  HelpCircle,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  ShieldCheck,
  Award,
  Flame,
  Check,
  ChevronRight,
  BookOpen,
  Zap,
  ArrowLeft,
  Settings,
  GraduationCap,
  Target,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { playClickSound, getSoundEnabled, setSoundEnabled } from '../utils/audio';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendStreakReminderNotification,
  isTodayStudyCompleted,
} from '../utils/notifications';
import { UserProfile } from '../types';

interface CentralDeOpcoesSectionProps {
  userProfile: UserProfile;
  studyStreak: number;
  historyCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenOnboarding: () => void;
  onOpenGabi: () => void;
  onOpenPro?: () => void;
  onGoHome: () => void;
}

export const CentralDeOpcoesSection: React.FC<CentralDeOpcoesSectionProps> = ({
  userProfile,
  studyStreak,
  historyCount,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenHistory,
  onOpenHelp,
  onOpenOnboarding,
  onOpenGabi,
  onOpenPro,
  onGoHome,
}) => {
  const [soundActive, setSoundActive] = useState(() => getSoundEnabled());
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [notifSettings, setNotifSettings] = useState(() => getNotificationSettings());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [notificationTime, setNotificationTime] = useState(notifSettings.time || '19:00');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    showToast(next ? '🔊 Efeitos de som ativados!' : '🔇 Efeitos de som desativados.', 'info');
  };

  const handleRequestNotifications = async () => {
    playClickSound();
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      showToast('🔔 Notificações ativadas no seu dispositivo!', 'success');
    } else {
      showToast('⚠️ Permissão de notificações não concedida no navegador.', 'warn');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setNotificationTime(newTime);
    const updated = { ...notifSettings, time: newTime };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    showToast(`⏰ Lembrete diário agendado para ${newTime}`, 'info');
  };

  const handleSendTestNotification = async () => {
    playClickSound();
    setIsSendingTest(true);
    try {
      if (notifPermission !== 'granted') {
        const perm = await requestNotificationPermission();
        setNotifPermission(perm);
        if (perm !== 'granted') {
          showToast('⚠️ Habilite as notificações no navegador primeiro.', 'warn');
          setIsSendingTest(false);
          return;
        }
      }
      const sent = await sendStreakReminderNotification(studyStreak);
      if (sent) {
        showToast('🚀 Notificação de teste disparada!', 'success');
      } else {
        showToast('🔔 Teste emitido no navegador.', 'info');
      }
    } catch {
      showToast('Erro ao disparar notificação.', 'warn');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div id="central-opcoes-page-root" className="space-y-8 animate-in fade-in pb-12">
      {/* BANNER PRINCIPAL DO HUB DE OPÇÕES */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGoHome}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Início</span>
              </button>
              <span className="bg-violet-500/20 text-violet-300 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-violet-400/30">
                ⚙️ Central de Configurações
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>Opções & Configurações da Conta</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl">
              Gerencie suas preferências de estudo, perfil, curso alvo, tema visual, notificações e histórico em um ambiente completo.
            </p>
          </div>

          {/* Quick Streak & Profile Badge */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-600/30">
              {userProfile.avatar || '🎓'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">{userProfile.name || 'Estudante'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  🔥 {studyStreak}d
                </span>
              </div>
              <span className="text-xs text-zinc-400 block">{userProfile.targetCourse || 'Medicina'} • {userProfile.targetExam || 'ENEM 2026'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg transition animate-in slide-in-from-top ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'info'
              ? 'bg-violet-600 text-white'
              : 'bg-amber-500 text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4" />}
            {toastMessage.type === 'warn' && <AlertCircle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* GRADE PRINCIPAL DE SEÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BLOCO 1: CONTA & PERFIL */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Conta & Perfil</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Dados do estudante e metas</p>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-xl border border-violet-200 dark:border-violet-800">
                Ativo
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Nome do Aluno:</span>
                <span className="font-bold text-slate-900 dark:text-white">{userProfile.name || 'Estudante'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Curso dos Sonhos:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{userProfile.targetCourse || 'Medicina'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Vestibular Alvo:</span>
                <span className="font-bold text-slate-900 dark:text-white">{userProfile.targetExam || 'ENEM 2026'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
          >
            <User className="w-4 h-4" />
            <span>Editar Meu Perfil Completo</span>
          </button>
        </div>

        {/* BLOCO 2: HISTÓRICO & CONTEÚDOS */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Histórico de Estudos</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Resumos e planos salvos</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                {historyCount} Salvos
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Todos os seus resumos gerados, cronogramas de estudo criados pela IA e dúvidas resolvidas ficam salvos no seu armazenamento seguro local.
            </p>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <span className="font-bold block">💡 Dica de Revisão:</span>
              <p className="text-[11px] opacity-90">
                Acesse seus fichamentos salvos regularmente para reforçar a curva do esquecimento de Ebbinghaus.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenHistory();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
          >
            <History className="w-4 h-4" />
            <span>Abrir Painel de Histórico</span>
          </button>
        </div>

        {/* BLOCO 3: APARÊNCIA & EFEITOS */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Aparência & Áudio</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Tema do app e sons</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Alternar Tema */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {theme === 'dark' ? 'Modo Noite (Escuro)' : 'Modo Dia (Claro)'}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {theme === 'dark' ? 'Descanso visual para a noite' : 'Visual claro de alto contraste'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onToggleTheme();
                  showToast(theme === 'dark' ? '☀️ Modo Dia ativado!' : '🌙 Modo Noite ativado!', 'info');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Alternar Tema
              </button>
            </div>

            {/* Efeitos Sonoros */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                {soundActive ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Efeitos Sonoros</h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Sons de cliques, acertos e quizzes</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  soundActive
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {soundActive ? 'Ativado' : 'Mudo'}
              </button>
            </div>
          </div>
        </div>

        {/* BLOCO 4: NOTIFICAÇÕES & LEMBRETES */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Lembretes & Avisos</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Ofensiva e alertas diários</p>
              </div>
            </div>
            {notifPermission === 'granted' ? (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Ativo
              </span>
            ) : (
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                Pendente
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Horário */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Horário do Lembrete:</span>
              </div>
              <input
                type="time"
                value={notificationTime}
                onChange={handleTimeChange}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            {/* Ações de Notificação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {notifPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestNotifications}
                  className="py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Permitir Notificações</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={isSendingTest}
                className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Disparando...' : 'Disparar Teste de Push'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BLOCO 5: AJUDA, TOUR & SUPORTE */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Ajuda & Aprendizado</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Tutoriais e suporte</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenHelp();
              }}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-white/5 hover:border-teal-300 dark:hover:border-teal-500/40 text-left transition group cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                  Central de Dicas
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Guia de estudos & FAQ</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenOnboarding();
              }}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 hover:bg-pink-50 dark:hover:bg-pink-950/40 border border-slate-200 dark:border-white/5 hover:border-pink-300 dark:hover:border-pink-500/40 text-left transition group cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300">
                  Rever Tour do App
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Apresentação guiada</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenGabi();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Falar com a Professora Gabi IA</span>
          </button>
        </div>

        {/* BLOCO 6: STATUS DO SISTEMA */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Armazenamento & Versão</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Privacidade dos seus dados</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">GabaritaAí Inteligência Vestibulares</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Seus dados de simulados, pontuações TRI e fichamentos são salvos com persistência local no seu navegador através de banco de dados IndexedDB.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Versão da Aplicação:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">v2.6 Pro (Build 2026)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
