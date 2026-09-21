import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  ShieldCheck,
  Share2,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  PartyPopper,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { CardResumoProdutividadeEnem } from './CardResumoProdutividadeEnem';
import { CelebrationConfetti } from './CelebrationConfetti';
import { playSuccessSound, playQuizSuccessPling, playClickSound } from '../utils/audio';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  progress?: string;
}

interface PerfilXPProps {
  userName?: string;
  userXP?: number;
  level?: number;
  levelTitle?: string;
  streakDays?: number;
  onOpenSettings?: () => void;
  onNavigateToRedacao?: () => void;
  onNavigateToSimulados?: () => void;
  onIncrementStreak?: () => void;
  onAddXPBonus?: (amount: number) => void;
  onLogout?: () => void;
}

export default function PerfilXP({
  userName = 'Estudante ENEM',
  userXP = 1250,
  level = 5,
  levelTitle = 'Mestre dos Simulados',
  streakDays = 7,
  onOpenSettings,
  onNavigateToRedacao,
  onNavigateToSimulados,
  onIncrementStreak,
  onAddXPBonus,
  onLogout,
}: PerfilXPProps) {
  const [copied, setCopied] = useState(false);

  // Local celebration state
  const [celebration, setCelebration] = useState<{
    active: boolean;
    type: 'xp' | 'streak' | 'achievement' | 'general';
    title: string;
    subtitle: string;
    badge: string;
  } | null>(null);

  // Track state transitions to auto-trigger celebratory confetti
  const prevXPRef = useRef(userXP);
  const prevStreakRef = useRef(streakDays);
  const prevLevelRef = useRef(level);

  // Daily streak claim state (stored in localStorage for real persistence)
  const todayKey = new Date().toISOString().slice(0, 10);
  const [claimedToday, setClaimedToday] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`gabaritai_streak_claimed_${todayKey}`) === 'true';
    } catch {
      return false;
    }
  });

  // Check for level ups or external XP boosts
  useEffect(() => {
    if (userXP > prevXPRef.current) {
      const xpGained = userXP - prevXPRef.current;
      // If level also changed
      if (level > prevLevelRef.current) {
        setCelebration({
          active: true,
          type: 'xp',
          title: `🎉 Parabéns! Você subiu para o Nível ${level}!`,
          subtitle: `Nova patente desbloqueada: "${levelTitle}". Você ganhou +${xpGained} XP!`,
          badge: `Nível ${level} Desbloqueado`,
        });
        playSuccessSound();
      } else if (xpGained >= 50) {
        // Significant XP milestone reached
        setCelebration({
          active: true,
          type: 'xp',
          title: `⚡ Nova Meta de XP Atingida! (+${xpGained} XP)`,
          subtitle: `Você atingiu a marca de ${userXP.toLocaleString('pt-BR')} XP nos seus estudos!`,
          badge: 'Meta de XP Conquistada',
        });
        playQuizSuccessPling();
      }
    }
    prevXPRef.current = userXP;
    prevLevelRef.current = level;
  }, [userXP, level, levelTitle]);

  // Check for streak updates
  useEffect(() => {
    if (streakDays > prevStreakRef.current) {
      setCelebration({
        active: true,
        type: 'streak',
        title: `🔥 Dia de Streak Fechado! (${streakDays} Dias de Sequência)`,
        subtitle: `Incrível consistência! Você manteve o ritmo e garantiu seu dia de ofensiva no ENEM!`,
        badge: `${streakDays} Dias Seguidos`,
      });
      playSuccessSound();
    }
    prevStreakRef.current = streakDays;
  }, [streakDays]);

  // Manual streak claim or test celebration trigger
  const handleCompleteDailyStreak = () => {
    playClickSound();
    if (onIncrementStreak) {
      onIncrementStreak();
    }
    try {
      localStorage.setItem(`gabaritai_streak_claimed_${todayKey}`, 'true');
    } catch (e) {
      console.error(e);
    }
    setClaimedToday(true);

    // Fire celebration
    const nextStreak = streakDays + (claimedToday ? 0 : 1);
    setCelebration({
      active: true,
      type: 'streak',
      title: `🔥 Dia de Streak Fechado! (${nextStreak} Dias Consecutivos)`,
      subtitle: 'Meta de estudo de hoje concluída com sucesso! Sua ofensiva continua acesa!',
      badge: 'Streak Diário Garantido',
    });
    playSuccessSound();
  };

  // Trigger test celebration for XP milestone
  const handleTriggerXpMilestone = () => {
    playClickSound();
    if (onAddXPBonus) {
      onAddXPBonus(100);
    } else {
      setCelebration({
        active: true,
        type: 'xp',
        title: `⚡ Meta de 300 XP do Nível Superada!`,
        subtitle: `Excelente desempenho nos simulados e redação! +100 XP adicionados à sua conta.`,
        badge: 'Meta de Produtividade',
      });
      playSuccessSound();
    }
  };

  const conquistas: Achievement[] = [
    {
      id: 'streak-7',
      icon: '🔥',
      title: 'Fogo nos Estudos',
      description: 'Estudou 7 dias seguidos',
      xpReward: 100,
      unlocked: true,
      progress: '7/7 dias',
    },
    {
      id: 'redacao-1000',
      icon: '✍️',
      title: 'Nota 1000',
      description: 'Enviou a primeira redação',
      xpReward: 200,
      unlocked: true,
      progress: '1/1 redação',
    },
    {
      id: 'arena-gladiador',
      icon: '⚔️',
      title: 'Gladiador do X1',
      description: 'Venceu 3 duelos na Arena X1',
      xpReward: 150,
      unlocked: true,
      progress: '3/3 vitórias',
    },
    {
      id: 'simulado-tri',
      icon: '📊',
      title: 'Gabaritando o TRI',
      description: 'Completou um simulado com alta coerência',
      xpReward: 250,
      unlocked: true,
      progress: '100% concluído',
    },
    {
      id: 'mestre-leitner',
      icon: '🎴',
      title: 'Memória Blindada',
      description: 'Revisou 50 flashcards no método Leitner',
      xpReward: 120,
      unlocked: false,
      progress: '38/50 cards',
    },
  ];

  // Cálculo de progresso para o próximo nível
  const xpParaProximoNivel = (level + 1) * 300;
  const xpAtualNivel = userXP % 300;
  const progressoPercent = Math.min(100, Math.round((xpAtualNivel / 300) * 100));

  const handleShare = () => {
    const shareText = `🏆 Meu Perfil no Assistente ENEM:\nNível ${level} (${levelTitle})\n⚡ ${userXP.toLocaleString('pt-BR')} XP Totais\n🔥 Sequência de ${streakDays} dias de estudos!`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="perfil-xp-container" className="p-4 bg-slate-950 text-white min-h-screen pb-28 max-w-7xl mx-auto relative">
      {/* Visual Confetti Celebration Overlay */}
      {celebration && (
        <CelebrationConfetti
          active={celebration.active}
          type={celebration.type}
          title={celebration.title}
          subtitle={celebration.subtitle}
          badge={celebration.badge}
          onComplete={() => setCelebration(null)}
        />
      )}

      {/* Informações do Usuário */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center font-black text-slate-950 text-xl border-2 border-amber-400 shadow-md shadow-amber-500/20"
            >
              {userName.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 text-white flex items-center gap-0.5">
              <span>Nv</span>
              <span>{level}</span>
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>{userName}</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-amber-400 font-semibold">
              Nível {level} • {levelTitle}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {userXP.toLocaleString('pt-BR')} XP Totais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 sm:flex-none text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
          </button>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Editar
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-xs bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Sair da Conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* GRID RESPONSIVO: PROGRESSO DE NÍVEL & STREAK DIÁRIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* BARRA DE PROGRESSO DE NÍVEL & META DE XP COM FRAMER MOTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Progresso para o Nível {level + 1}
              </span>
              <span className="text-amber-400 font-bold font-mono">
                {xpAtualNivel} / 300 XP ({progressoPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressoPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 h-full rounded-full shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-400">
              Faltam <strong className="text-amber-400">{300 - xpAtualNivel} XP</strong> para desbloquear o próximo título de maestria.
            </p>

            {/* Botão de Celebração de Meta de XP */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTriggerXpMilestone}
              type="button"
              className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Celebrar Meta (+100 XP)</span>
            </motion.button>
          </div>
        </motion.div>

        {/* CARD DE CELEBRAÇÃO & FECHAMENTO DO DIA DE STREAK */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 rounded-2xl p-4 shadow-md flex flex-col justify-between gap-3 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -6, 6, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-md shadow-orange-500/10"
            >
              <Flame className="w-6 h-6 fill-orange-500 text-orange-400" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5" /> Sequência de Estudos Diária
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold border border-orange-500/30">
                  {streakDays} dias seguidos
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Feche seu dia de estudos para garantir sua ofensiva, manter sua chama acesa e ganhar confetes!
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCompleteDailyStreak}
            type="button"
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 transition"
          >
            <PartyPopper className="w-4 h-4 text-slate-950" />
            <span>{claimedToday ? 'Celebrar Sequência Hoje 🔥' : 'Fechar Dia de Streak 🔥'}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* CARDS RÁPIDOS DE STATUS COM FRAMER MOTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
      >
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Ofensiva</span>
            <span className="text-sm font-bold text-white">{streakDays} dias</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Conquistas</span>
            <span className="text-sm font-bold text-white">4 / 5</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1"
        >
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Classificação</span>
            <span className="text-sm font-bold text-white">Liga Ouro</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Resumo de Produtividade Semanal das Competências ENEM */}
      <div className="mb-4">
        <CardResumoProdutividadeEnem
          onNavigateToRedacao={onNavigateToRedacao}
          onNavigateToSimulados={onNavigateToSimulados}
        />
      </div>

      {/* Conquistas */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏆</span> Conquistas Desbloqueadas
          </h3>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            +670 XP acumulados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {conquistas.map((conquista) => (
            <motion.div
              key={conquista.id}
              whileHover={{ x: 2 }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                conquista.unlocked
                  ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800">
                  {conquista.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-200">{conquista.title}</p>
                    {!conquista.unlocked && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                        Em progresso
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{conquista.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold ${conquista.unlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                  +{conquista.xpReward} XP
                </span>
                {conquista.progress && (
                  <p className="text-[9px] text-slate-500 font-mono">{conquista.progress}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export { PerfilXP };
