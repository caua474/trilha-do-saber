import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  GraduationCap,
  Target,
  Flame,
  Award,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Clock,
  Send,
  CheckCircle2,
  LogOut,
  Edit3,
  HelpCircle,
  Sparkles,
  BookOpen,
  Check,
  ShieldCheck,
  Play,
  PartyPopper
} from 'lucide-react';
import { UserProfile } from '../types';
import { CelebrationConfetti } from './CelebrationConfetti';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendStreakReminderNotification,
  isNotificationSupported,
} from '../utils/notifications';
import {
  getSoundEnabled,
  setSoundEnabled,
  getQuizSuccessSoundEnabled,
  setQuizSuccessSoundEnabled,
  playQuizSuccessPling,
  playSuccessSound,
  playErrorSound,
  playClickSound
} from '../utils/audio';

interface ProfileSettingsModalProps {
  onClose: () => void;
  studyStreak: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenOnboarding?: () => void;
  onLogout?: () => void;
}

const PROFILE_KEY = 'gabaritai_user_profile_v1';

const AVATARS = ['🎓', '🚀', '⚡', '🤖', '🎯', '💡', '📚', '🏆', '👑', '🦁'];

const COURSES = [
  'Medicina',
  'Direito',
  'Engenharia de Software',
  'Ciência da Computação',
  'Psicologia',
  'Odontologia',
  'Administração',
  'Arquitetura',
  'Outro Curso'
];

const EXAMS = [
  'ENEM 2026',
  'FUVEST / USP',
  'UNICAMP',
  'Vestibulares Regionais',
  'Concursos Públicos'
];

const TIME_PRESETS = [
  { time: '08:00', icon: '🌅', period: 'Manhã' },
  { time: '14:00', icon: '☀️', period: 'Tarde' },
  { time: '19:00', icon: '🌆', period: 'Noite' },
  { time: '22:00', icon: '🌙', period: 'Coruja' },
];

export const getSavedUserProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    name: 'Estudante Focado',
    avatar: '🎓',
    targetCourse: 'Medicina',
    targetExam: 'ENEM',
    targetUniversity: 'USP',
    studyRoutine: '2 a 4 horas',
    dailyHoursGoal: 4,
    dailyQuestionsGoal: 20,
    rankTitle: 'Calouro Promissor',
    soundEffects: getSoundEnabled(),
    quizSuccessSound: getQuizSuccessSoundEnabled(),
    notificationsEnabled: true,
    notificationTime: '19:00',
  };
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Erro ao salvar perfil:', e);
  }
};

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  onClose,
  studyStreak,
  theme,
  onToggleTheme,
  onOpenOnboarding,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>(getSavedUserProfile);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification state
  const [notifSettings, setNotifSettings] = useState(() => getNotificationSettings());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  // Sound state
  const [soundOn, setSoundOn] = useState<boolean>(() => getSoundEnabled());
  const [quizSoundOn, setQuizSoundOn] = useState<boolean>(() => getQuizSuccessSoundEnabled());

  // Celebration state
  const [celebration, setCelebration] = useState<{
    active: boolean;
    title: string;
    subtitle: string;
    badge: string;
  } | null>(null);

  useEffect(() => {
    setNameInput(profile.name);
  }, [profile.name]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'Estudante Focado';
    const updated = { ...profile, name: trimmed };
    setProfile(updated);
    setIsEditingName(false);
    playClickSound();
  };

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
    setProfile((prev) => ({ ...prev, soundEffects: nextVal }));
    if (nextVal) {
      playSuccessSound();
    }
  };

  const handleTestSound = () => {
    playSuccessSound();
  };

  const handleToggleQuizSound = () => {
    const nextVal = !quizSoundOn;
    setQuizSoundOn(nextVal);
    setQuizSuccessSoundEnabled(nextVal);
    setProfile((prev) => ({ ...prev, quizSuccessSound: nextVal }));
    if (nextVal) {
      playQuizSuccessPling();
    }
  };

  const handleTestQuizSound = () => {
    playQuizSuccessPling();
  };

  const handleToggleNotification = async () => {
    if (!isNotificationSupported()) {
      setNotifMsg('Seu navegador não suporta notificações Push.');
      setTimeout(() => setNotifMsg(null), 3000);
      return;
    }

    if (!notifSettings.enabled) {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        const updated = { ...notifSettings, enabled: true };
        setNotifSettings(updated);
        saveNotificationSettings(updated);
        setProfile((prev) => ({ ...prev, notificationsEnabled: true }));
        setNotifMsg('🔔 Lembretes Push ativados!');
        sendStreakReminderNotification(studyStreak);
      } else {
        setNotifMsg('Permissão bloqueada no navegador.');
      }
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      setProfile((prev) => ({ ...prev, notificationsEnabled: false }));
      setNotifMsg('Lembretes Push desativados.');
    }
    setTimeout(() => setNotifMsg(null), 3000);
  };

  const handleTimeChange = (newTime: string) => {
    const updated = { ...notifSettings, time: newTime };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setProfile((prev) => ({ ...prev, notificationTime: newTime }));
    setNotifMsg(`Horário salvo: ${newTime}`);
    setTimeout(() => setNotifMsg(null), 2500);
  };

  const handleTestNotification = async () => {
    let perm = notifPermission;
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
      setNotifPermission(perm);
    }
    if (perm === 'granted') {
      sendStreakReminderNotification(studyStreak);
      setNotifMsg('⚡ Notificação enviada!');
    } else {
      setNotifMsg('Permissão negada.');
    }
    setTimeout(() => setNotifMsg(null), 3000);
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setSoundEnabled(profile.soundEffects);
      setQuizSuccessSoundEnabled(profile.quizSuccessSound ?? true);
      playQuizSuccessPling();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
    }
  };

  const handleConfirmLogout = () => {
    playErrorSound();
    if (onLogout) {
      onLogout();
    } else {
      // default fallback
      try {
        localStorage.removeItem(PROFILE_KEY);
      } catch {
        // ignore
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Celebration Confetti Effect */}
      {celebration && (
        <CelebrationConfetti
          active={celebration.active}
          type="streak"
          title={celebration.title}
          subtitle={celebration.subtitle}
          badge={celebration.badge}
          onComplete={() => setCelebration(null)}
        />
      )}

      <div className="bg-slate-900 text-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Perfil e Configurações
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Personalize seus dados, metas acadêmicas e notificações
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer pointer-events-auto"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* SECTION 1: CABEÇALHO DO PERFIL */}
          <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
              
              {/* Avatar Selector */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-400 p-0.5 shadow-xl shadow-indigo-500/20 relative">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-4xl select-none">
                    {profile.avatar}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Clique para trocar:</span>
                <div className="flex flex-wrap max-w-[160px] gap-1 justify-center">
                  {AVATARS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setProfile((prev) => ({ ...prev, avatar: e }));
                      }}
                      className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition cursor-pointer pointer-events-auto ${
                        profile.avatar === e
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110'
                          : 'bg-slate-900/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Rank Info */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1 text-sm font-bold text-white focus:outline-none"
                          autoFocus
                          maxLength={30}
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-black text-white">{profile.name}</h2>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer pointer-events-auto"
                          title="Editar nome"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-indigo-300 font-bold mt-0.5">
                    Estudante MenteUp
                  </p>
                </div>

                {/* Badges: Patente & Streak */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Patente: {profile.rankTitle}</span>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSuccessSound();
                      setCelebration({
                        active: true,
                        title: `🔥 Sequência de ${studyStreak} Dias de Fogo!`,
                        subtitle: 'Você está mantendo a ofensiva de estudos ativa rumo à nota 1000 no ENEM!',
                        badge: 'Ofensiva Ativa',
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer hover:border-amber-400 transition"
                    title="Clique para celebrar sua sequência"
                  >
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>{studyStreak} dias de Sequência 🔥</span>
                  </motion.button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: META ACADÊMICA */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Meta Acadêmica & Foco de Estudos</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Target Course */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <label className="text-xs font-bold text-slate-300">Curso Desejado:</label>
                <select
                  value={profile.targetCourse}
                  onChange={(e) => {
                    playClickSound();
                    setProfile((prev) => ({ ...prev, targetCourse: e.target.value }));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Exam */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <label className="text-xs font-bold text-slate-300">Exame / Foco Principal:</label>
                <select
                  value={profile.targetExam}
                  onChange={(e) => {
                    playClickSound();
                    setProfile((prev) => ({ ...prev, targetExam: e.target.value }));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {EXAMS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Hours Goal */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Meta Diária de Horas:</label>
                  <span className="text-xs font-black text-amber-400">{profile.dailyHoursGoal}h / dia</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[1, 2, 4, 6, 8].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setProfile((prev) => ({ ...prev, dailyHoursGoal: hrs }));
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer pointer-events-auto ${
                        profile.dailyHoursGoal === hrs
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Questions Goal */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Meta Diária de Questões:</label>
                  <span className="text-xs font-black text-amber-400">{profile.dailyQuestionsGoal} questões</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[10, 20, 30, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setProfile((prev) => ({ ...prev, dailyQuestionsGoal: q }));
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer pointer-events-auto ${
                        profile.dailyQuestionsGoal === q
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: PAINEL DE CONFIGURAÇÕES (TOGGLES) */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Painel de Preferências e Toggles</span>
            </label>

            <div className="space-y-3">
              
              {/* Notification Push Toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Lembrete Diário de Estudos</h4>
                      <p className="text-[11px] text-slate-400">Receba notificações para não perder o streak diário.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleNotification}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer pointer-events-auto ${
                      notifSettings.enabled && notifPermission === 'granted'
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifSettings.enabled && notifPermission === 'granted'
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-700/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Melhor Horário para Lembrete (Streak Reminder):
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={notifSettings.time}
                        onChange={(e) => {
                          playClickSound();
                          handleTimeChange(e.target.value);
                        }}
                        className="bg-slate-950 border border-indigo-500/50 hover:border-indigo-400 rounded-xl px-3 py-1 text-xs font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center space-x-1 cursor-pointer transition pointer-events-auto active:scale-95 shadow-md"
                      >
                        <Send className="w-3 h-3" />
                        <span>Testar Push</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Time Presets */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Atalhos Rápidos de Horário:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIME_PRESETS.map((p) => {
                        const isSelected = notifSettings.time === p.time;
                        return (
                          <button
                            key={p.time}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              handleTimeChange(p.time);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer pointer-events-auto ${
                              isSelected
                                ? 'bg-indigo-600 text-white ring-2 ring-amber-400 font-black shadow-md'
                                : 'bg-slate-950/80 hover:bg-slate-700 text-slate-300 border border-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <span>{p.icon}</span>
                              <span>{p.time}</span>
                            </span>
                            <span className="text-[10px] opacity-80">{p.period}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {notifMsg && (
                  <p className="text-[11px] font-bold text-indigo-300 text-center animate-in fade-in">
                    {notifMsg}
                  </p>
                )}
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Efeitos Sonoros Gerais</h4>
                    <p className="text-[11px] text-slate-400">Sons interativos ao acertar/errar questões e navegar.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer pointer-events-auto"
                  >
                    <Play className="w-3 h-3" />
                    <span>Ouvir</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer pointer-events-auto ${
                      soundOn ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        soundOn ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quiz Success Pling Sound Toggle */}
              <div id="setting-som-de-sucesso-container" className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-slate-800/80 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm shadow-sm">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 id="setting-som-de-sucesso-title" className="text-xs font-bold text-white">Som de Sucesso</h4>
                      <span className="text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                        Pling
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Dispara um efeito sonoro de 'pling' via Web Audio API logo após a conclusão bem-sucedida de um quiz diário.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    id="profile-test-quiz-sound-button"
                    type="button"
                    onClick={handleTestQuizSound}
                    className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer pointer-events-auto transition"
                    title="Testar efeito sonoro de Pling"
                  >
                    <Play className="w-3 h-3" />
                    <span>Ouvir Pling</span>
                  </button>

                  <button
                    id="profile-quiz-sound-toggle-button"
                    type="button"
                    onClick={handleToggleQuizSound}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer pointer-events-auto ${
                      quizSoundOn && soundOn ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        quizSoundOn && soundOn ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Theme Switcher Toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tema Visual</h4>
                    <p className="text-[11px] text-slate-400">Alternar entre Modo Escuro (Noite) e Modo Claro (Dia).</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onToggleTheme();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 cursor-pointer pointer-events-auto ${
                    theme === 'dark'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'Modo Noite' : 'Modo Dia'}</span>
                </button>
              </div>

              {/* Re-open Onboarding Tour */}
              {onOpenOnboarding && (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Tour Inicial de Boas-Vindas</h4>
                      <p className="text-[11px] text-slate-400">Rever o passo a passo com a apresentação da Gabi.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer pointer-events-auto"
                  >
                    Ver Tour
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* SECTION 4: AÇÕES DE CONTA & BOTOES */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {savedSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-2xl text-xs font-extrabold text-center flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Perfil e preferências salvas com sucesso!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSaveAll}
                className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer pointer-events-auto active:scale-95 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="py-3 px-5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-extrabold text-xs transition cursor-pointer pointer-events-auto active:scale-95 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>

        </div>

        {/* LOGOUT CONFIRMATION MODAL OVERLAY */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-white">Deseja realmente sair?</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sua conta continuará salva neste dispositivo. Você poderá se conectar novamente a qualquer momento.
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition cursor-pointer"
                >
                  Confirmar Saída
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
