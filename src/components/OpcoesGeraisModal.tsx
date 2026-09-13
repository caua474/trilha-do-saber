import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
  Info,
  Smartphone,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { playClickSound, getSoundEnabled, setSoundEnabled } from '../utils/audio';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendStreakReminderNotification,
  isNotificationSupported,
} from '../utils/notifications';

interface OpcoesGeraisModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyCount: number;
  studyStreak: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenOnboarding?: () => void;
}

export const OpcoesGeraisModal: React.FC<OpcoesGeraisModalProps> = ({
  isOpen,
  onClose,
  historyCount,
  studyStreak,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenHistory,
  onOpenHelp,
  onOpenOnboarding
}) => {
  const [soundActive, setSoundActive] = useState(() => getSoundEnabled());
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [notifSettings, setNotifSettings] = useState(() => getNotificationSettings());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    showToast(next ? '🔊 Efeitos sonoros ativados!' : '🔇 Efeitos sonoros silenciados.');
  };

  const handleRequestNotifications = async () => {
    playClickSound();
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      showToast('🔔 Notificações ativadas com sucesso!');
    } else {
      showToast('⚠️ Permissão de notificações não concedida no navegador.');
    }
  };

  const handleSendTestNotification = async () => {
    playClickSound();
    setIsSendingTest(true);
    try {
      if (notifPermission !== 'granted') {
        const perm = await requestNotificationPermission();
        setNotifPermission(perm);
        if (perm !== 'granted') {
          showToast('⚠️ Habilite as notificações no navegador primeiro.');
          setIsSendingTest(false);
          return;
        }
      }
      const sent = await sendStreakReminderNotification(studyStreak);
      if (sent) {
        showToast('🚀 Notificação de teste disparada com sucesso!');
      } else {
        showToast('🔔 Teste emitido (veja suas notificações na barra de tarefas).');
      }
    } catch {
      showToast('Erro ao disparar notificação.');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          id="opcoes-gerais-page-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-white dark:bg-[#18181B] text-slate-900 dark:text-zinc-100 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        >
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-violet-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Central de Opções & Configurações</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Gerencie sua conta, preferências de exibição, som e notificações do GabaritaAí
                </p>
              </div>
            </div>

            <button
              id="close-opcoes-gerais-btn"
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar (Esc)"
              aria-label="Fechar Central de Opções"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Seção 1: Conta & Perfil */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Conta & Estudos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card 1: Meu Perfil */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenProfile();
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                        Meu Perfil & Metas
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Curso dos sonhos, universidade e avatar
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Card 2: Histórico Geral */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenHistory();
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                          Histórico de Estudos
                        </h4>
                        {historyCount > 0 && (
                          <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {historyCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Resumos, cronogramas e fichamentos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Seção 2: Preferências do Sistema */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                Preferências & Aparência
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tema Dia / Noite */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {theme === 'dark' ? 'Modo Noite Ativado' : 'Modo Dia Ativado'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {theme === 'dark' ? 'Confortável para estudar no escuro' : 'Visual claro de alta legibilidade'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onToggleTheme();
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Alternar
                  </button>
                </div>

                {/* Efeitos Sonoros */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black">
                      {soundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Efeitos de Áudio
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Sons de cliques, acertos e notificações
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      soundActive
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300'
                    }`}
                  >
                    {soundActive ? 'Ligado' : 'Mudo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Seção 3: Notificações & Lembretes */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Lembretes & Notificações
              </span>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Lembretes de Ofensiva Diária</span>
                        {notifPermission === 'granted' && (
                          <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Receba lembretes automáticos no celular ou computador para não perder sua sequência
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notifPermission !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleRequestNotifications}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-violet-600 hover:bg-violet-500 text-white transition-all cursor-pointer shadow-md shadow-violet-600/30"
                      >
                        Permitir Avisos
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      disabled={isSendingTest}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingTest ? 'Enviando...' : 'Disparar Teste'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 4: Ajuda & Informações */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Ajuda, Dicas & Sobre
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Central de Ajuda */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenHelp();
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                        Central de Ajuda & FAQ
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Guia de uso e dicas para gabaritar no ENEM
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Tour do App */}
                {onOpenOnboarding && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50 text-left transition-all group cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                          Rever Tour do App
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Apresentação guiada de todas as ferramentas
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>

            {/* Informações do App & Status */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/70 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GabaritaAí Inteligência Vestibulares • v2.6 Pro</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Armazenamento Local Seguro
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="px-6 py-2.5 bg-violet-600 text-white text-xs font-bold text-center animate-in slide-in-from-bottom">
              {toastMessage}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
