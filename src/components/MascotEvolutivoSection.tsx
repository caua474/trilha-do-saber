import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, Award, Zap, Heart, Flame, Shield, Star, RefreshCw, Share2, CheckCircle2, PartyPopper, CheckSquare, BookOpen, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RankInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  avatar: string;
  color: string;
  descricao: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  scale: number;
}

interface FloatingXp {
  id: number;
  amount: number;
  x: number;
  y: number;
}

interface ConfettiItem {
  id: number;
  x: number;
  yOffset: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star' | 'ribbon';
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
  delay: number;
  xSway: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899',
  '#3b82f6', '#8b5cf6', '#f43f5e', '#eab308',
  '#06b6d4', '#d946ef', '#14b8a6', '#f97316'
];

// --- FRAMER MOTION CONFETTI CELEBRATION OVERLAY ---
const FramerConfettiCelebration: React.FC<{ active: boolean }> = ({ active }) => {
  const [pieces, setPieces] = useState<ConfettiItem[]>([]);

  useEffect(() => {
    if (active) {
      const items: ConfettiItem[] = [];
      const count = 80;
      for (let i = 0; i < count; i++) {
        items.push({
          id: Math.random() + i + Date.now(),
          x: Math.random() * 100,
          yOffset: -10 - Math.random() * 20,
          size: 6 + Math.random() * 12,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          shape: (['rect', 'circle', 'star', 'ribbon'] as const)[Math.floor(Math.random() * 4)],
          rotateX: Math.random() * 720 - 360,
          rotateY: Math.random() * 720 - 360,
          rotateZ: Math.random() * 1080 - 540,
          duration: 2.5 + Math.random() * 1.8,
          delay: Math.random() * 0.6,
          xSway: (Math.random() - 0.5) * 140,
        });
      }
      setPieces(items);
    } else {
      setPieces([]);
    }
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              top: `${p.yOffset}%`,
              left: `${p.x}%`,
              scale: 0.8,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
            }}
            animate={{
              opacity: [1, 1, 1, 0],
              top: ['-5%', '45%', '110%'],
              left: [`${p.x}%`, `${p.x + p.xSway * 0.05}%`, `${p.x + p.xSway * 0.1}%`],
              rotateX: p.rotateX,
              rotateY: p.rotateY,
              rotateZ: p.rotateZ,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              position: 'absolute',
              width: p.shape === 'ribbon' ? p.size * 0.4 : p.size,
              height: p.shape === 'ribbon' ? p.size * 2.2 : p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '1px',
              boxShadow: `0 2px 8px ${p.color}80`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const RANKS: RankInfo[] = [
  { level: 1, title: 'Calouro Perdido', minXp: 0, maxXp: 100, avatar: '🐣', color: 'from-slate-400 to-slate-600', descricao: 'Iniciando a jornada rumo à aprovação. Primeiros passos dados!' },
  { level: 2, title: 'Estudante Focado', minXp: 100, maxXp: 250, avatar: '📚', color: 'from-blue-400 to-indigo-600', descricao: 'A rotina de estudos começou a se firmar com constância.' },
  { level: 3, title: 'Mestre dos Resumos', minXp: 250, maxXp: 500, avatar: '📝', color: 'from-emerald-400 to-teal-600', descricao: 'Cadernos organizados e resumos impecáveis!' },
  { level: 4, title: 'Monstro das Exatas', minXp: 500, maxXp: 850, avatar: '📐', color: 'from-amber-400 to-orange-600', descricao: 'Fórmulas e equações já não assustam mais você!' },
  { level: 5, title: 'Estrategista do Edital', minXp: 850, maxXp: 1300, avatar: '🎯', color: 'from-purple-400 to-indigo-700', descricao: 'Domina o peso das disciplinas e planeja cada horário.' },
  { level: 6, title: 'Doutor em Redação', minXp: 1300, maxXp: 1800, avatar: '✍️', color: 'from-rose-400 to-pink-600', descricao: 'Estruturas nota 1000 e repertórios coringa na ponta do lápis.' },
  { level: 7, title: 'Fenômeno das Humanas', minXp: 1800, maxXp: 2400, avatar: '🏛️', color: 'from-amber-500 to-yellow-600', descricao: 'História e Filosofia conectadas com precisão crítica.' },
  { level: 8, title: 'Lenda dos Simulados', minXp: 2400, maxXp: 3100, avatar: '🏆', color: 'from-cyan-400 to-blue-700', descricao: 'Provas cronometradas e alta taxa de acerto no TRI!' },
  { level: 9, title: 'Titã da TRI', minXp: 3100, maxXp: 4000, avatar: '⚡', color: 'from-violet-500 to-purple-800', descricao: 'Consistência total: erra pouquíssimas fáceis e domina a prova!' },
  { level: 10, title: 'Gabaritador Profissional', minXp: 4000, maxXp: 9999, avatar: '👑', color: 'from-amber-300 via-amber-500 to-yellow-600', descricao: 'Aprovação garantida nas primeiras posições do SISU!' },
];

const CELEBRATION_EMOJIS = ['✨', '⭐', '🎉', '🏆', '⚡', '💎', '🌟', '🔥', '🚀', '👑', '💥'];

export interface MascotEvolutivoSectionProps {
  userXp?: number;
  studyStreak?: number;
  onOpenSocialStory?: (type: 'redacao' | 'mascote' | 'streak', data?: any) => void;
  triggerModuleCompletion?: boolean;
  completedModuleName?: string;
  onModuleCompleted?: (moduleTitle: string, xpGain: number) => void;
}

export const MascotEvolutivoSection: React.FC<MascotEvolutivoSectionProps> = ({
  userXp = 680,
  studyStreak = 5,
  onOpenSocialStory,
  triggerModuleCompletion = false,
  completedModuleName,
  onModuleCompleted
}) => {
  const [xp, setXp] = useState<number>(userXp);
  const [mascotMood, setMascotMood] = useState<string>('Normal');
  const [clickCount, setClickCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('Oi! Eu sou o Gabaritão, seu mascote de estudos! Clique em mim para interagir!');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingXps, setFloatingXps] = useState<FloatingXp[]>([]);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [lastCompletedModule, setLastCompletedModule] = useState<string>('');

  const triggerConfettiCelebration = () => {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  };

  const getCurrentRank = (currentXp: number): RankInfo => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (currentXp >= RANKS[i].minXp) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  };

  const currentRank = getCurrentRank(xp);
  const prevRankRef = useRef<RankInfo>(currentRank);

  const nextRank = RANKS.find((r) => r.level === currentRank.level + 1) || currentRank;

  const currentLevelXp = xp - currentRank.minXp;
  const levelRange = nextRank.minXp - currentRank.minXp || 1;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / levelRange) * 100));

  // Trigger level up animation if level increased
  useEffect(() => {
    if (currentRank.level > prevRankRef.current.level) {
      triggerConfettiCelebration();
      triggerParticleExplosion(35);
      setShowLevelUpModal(true);
      setMascotMood('Celebrando');
      setMessage(`🎉 INCRÍVEL! Você subiu para o Nível ${currentRank.level}: ${currentRank.title}!`);
    }
    prevRankRef.current = currentRank;
  }, [currentRank.level]);

  // Handle external module completion prop
  useEffect(() => {
    if (triggerModuleCompletion) {
      const moduleName = completedModuleName || 'Módulo de Estudos Concluído';
      handleCompleteModule(moduleName, 150);
    }
  }, [triggerModuleCompletion, completedModuleName]);

  // Function to burst particles around the container or cursor
  const triggerParticleExplosion = (count = 25, originX = 0, originY = 0) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      newParticles.push({
        id: Math.random() + Date.now(),
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
        scale: 0.8 + Math.random() * 0.8,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1800);
  };

  // Add floating XP text animation
  const addFloatingXp = (amount: number, e?: React.MouseEvent) => {
    const targetX = e ? e.nativeEvent.offsetX - 20 : 0;
    const targetY = e ? e.nativeEvent.offsetY - 20 : -40;

    const newXpItem: FloatingXp = {
      id: Math.random() + Date.now(),
      amount,
      x: targetX,
      y: targetY,
    };

    setFloatingXps((prev) => [...prev, newXpItem]);
    setTimeout(() => {
      setFloatingXps((prev) => prev.filter((item) => item.id !== newXpItem.id));
    }, 1200);
  };

  const handleMascotClick = (e: React.MouseEvent) => {
    setClickCount((prev) => prev + 1);
    const gainXp = 10;
    setXp((prev) => prev + gainXp);

    addFloatingXp(gainXp, e);
    triggerParticleExplosion(12, e.nativeEvent.offsetX - 50, e.nativeEvent.offsetY - 50);

    const msgs = [
      'Bora estudar mais um pouco hoje! Cada questão aproxima você da vaga! 🚀',
      'Sabia que resolver questões anteriores é o método #1 de aprovação? 💡',
      'Não se esqueça de beber água e manter o ritmo no Pomodoro! 💧',
      'Você ganhou +10 XP de motivação por interagir comigo! ✨',
      'Estou orgulhoso da sua dedicação! Continue assim! 🦁',
    ];
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    setMessage(randomMsg);
    setMascotMood('Empolgado');
  };

  const handleCompleteDailyGoal = (goalName: string, xpGain: number) => {
    setXp((prev) => prev + xpGain);
    setGoalTitle(goalName);
    setShowGoalModal(true);
    triggerConfettiCelebration();
    triggerParticleExplosion(30);
    addFloatingXp(xpGain);
  };

  const handleCompleteModule = (moduleName: string, xpGain = 150) => {
    setXp((prev) => prev + xpGain);
    setGoalTitle(moduleName);
    setLastCompletedModule(moduleName);
    setShowGoalModal(true);
    triggerConfettiCelebration();
    triggerParticleExplosion(40);
    addFloatingXp(xpGain);

    if (onModuleCompleted) {
      onModuleCompleted(moduleName, xpGain);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* FRAMER MOTION CONFETTI CELEBRATION SHOWER */}
      <FramerConfettiCelebration active={confettiActive} />

      {/* LEVEL UP POPUP MODAL CELEBRATION */}
      <AnimatePresence>
        {showLevelUpModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <div className="bg-slate-900 border-2 border-amber-400 rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                className="text-7xl mx-auto"
              >
                {currentRank.avatar}
              </motion.div>

              <div className="space-y-2">
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-md">
                  <PartyPopper className="w-4 h-4" /> NOVO NÍVEL ALCANÇADO!
                </span>
                <h3 className="text-2xl font-black text-white">
                  Nível {currentRank.level}: {currentRank.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {currentRank.descricao}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                ⚡ Recompensa desbloqueada: Bônus de Motivação & Nova Insígnia para o seu perfil!
              </div>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer active:scale-95"
              >
                Continuar Rumo ao Nível {nextRank.level} 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAILY GOAL / MODULE COMPLETED MODAL */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-6 max-w-sm bg-slate-900 border-2 border-emerald-400 rounded-3xl shadow-2xl space-y-3"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  🎉 Celebração de Conquista!
                </span>
                <h4 className="text-sm font-black text-white">{goalTitle}</h4>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Você ganhou +150 XP e celebrou sua evolução de estudos com chuva de confetes!
            </p>
            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
            >
              Excelente!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit shadow-md">
              <Trophy className="w-3.5 h-3.5" /> Sistema de XP e Mascote Evolutivo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🦁 O Mascote Gabaritão e suas Patentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Quanto mais você estuda, resolve questões e completa metas, mais XP acumula para evoluir o mascote do Nível 1 ao Nível 10!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <motion.div
              key={currentRank.avatar}
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg"
            >
              {currentRank.avatar}
            </motion.div>
            <div>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                Nível {currentRank.level} • {currentRank.title}
              </span>
              <span className="text-sm font-black text-white">{xp} Total XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUDY MODULES COMPLETION SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Módulos de Estudo do Edital ENEM & Vestibulares
            </h3>
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800 w-fit">
            🎉 Cada módulo concluído dispara chuva de confetes!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleCompleteModule('Módulo: Geometria Espacial & Prismas', 150)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition text-left cursor-pointer group active:scale-95 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📐</span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                +150 XP
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                Matemática
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Geometria Espacial & Prismas
              </p>
            </div>
            <div className="pt-1 flex items-center text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-3 h-3 mr-1" />
              <span>Concluir Módulo</span>
            </div>
          </button>

          <button
            onClick={() => handleCompleteModule('Módulo: Estrutura Dissertativa Nota 1000', 150)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-400 transition text-left cursor-pointer group active:scale-95 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">✍️</span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                +150 XP
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition">
                Redação
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Proposta de Intervenção C5
              </p>
            </div>
            <div className="pt-1 flex items-center text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
              <CheckSquare className="w-3 h-3 mr-1" />
              <span>Concluir Módulo</span>
            </div>
          </button>

          <button
            onClick={() => handleCompleteModule('Módulo: Genética & Leis de Mendel', 150)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition text-left cursor-pointer group active:scale-95 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🧬</span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                +150 XP
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                Biologia
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Genética & Hereditariedade
              </p>
            </div>
            <div className="pt-1 flex items-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
              <CheckSquare className="w-3 h-3 mr-1" />
              <span>Concluir Módulo</span>
            </div>
          </button>

          <button
            onClick={() => handleCompleteModule('Módulo: Era Vargas & Brasil Republicano', 150)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition text-left cursor-pointer group active:scale-95 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🏛️</span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                +150 XP
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                História do Brasil
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Era Vargas & Estado Novo
              </p>
            </div>
            <div className="pt-1 flex items-center text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
              <CheckSquare className="w-3 h-3 mr-1" />
              <span>Concluir Módulo</span>
            </div>
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-800/50 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase text-white tracking-wider">
              Metas Diárias & Conquistas de XP Instantâneas
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
            Feedback Gamificado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleCompleteDailyGoal('Meta de 20 Questões Resolvidas', 100)}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-left transition flex items-center justify-between cursor-pointer active:scale-95 group"
          >
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">Meta Diária #1</span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                🎯 20 Questões ENEM
              </span>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-1 rounded-xl border border-emerald-800">
              +100 XP
            </span>
          </button>

          <button
            onClick={() => handleCompleteDailyGoal('Sessão Pomodoro de 50min Concluída', 150)}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-left transition flex items-center justify-between cursor-pointer active:scale-95 group"
          >
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">Meta Diária #2</span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                ⏱️ Pomodoro de 50 min
              </span>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-1 rounded-xl border border-emerald-800">
              +150 XP
            </span>
          </button>

          <button
            onClick={() => handleCompleteDailyGoal('Revisão Spaced Repetition Concluída', 200)}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-left transition flex items-center justify-between cursor-pointer active:scale-95 group"
          >
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">Meta Diária #3</span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                🧠 Flashcards Leitner
              </span>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-1 rounded-xl border border-emerald-800">
              +200 XP
            </span>
          </button>
        </div>
      </div>

      {/* MASCOT INTERACTIVE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative overflow-hidden">
        
        {/* FRAMER MOTION PARTICLES CONTAINER */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: p.x + 150, y: p.y + 120, scale: p.scale }}
                animate={{
                  opacity: 0,
                  x: p.x + 150 + p.vx * 1.2,
                  y: p.y + 120 + p.vy * 1.2,
                  scale: p.scale * 1.5,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute text-2xl drop-shadow-md"
              >
                {p.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* FLOATING +XP TEXT INDICATORS */}
          <AnimatePresence>
            {floatingXps.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 1, y: f.y + 100, x: f.x + 100, scale: 0.8 }}
                animate={{ opacity: 0, y: f.y + 30, scale: 1.3 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute font-black text-amber-400 text-lg drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] pointer-events-none z-30"
              >
                +{f.amount} XP! ✨
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* MASCOT DISPLAY & CLICK ACTION */}
        <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-950 border border-indigo-100 dark:border-indigo-900/40 relative">
          <motion.button
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMascotClick}
            className="text-7xl sm:text-8xl transition-transform duration-300 cursor-pointer drop-shadow-2xl select-none relative"
            title="Clique para interagir com o Gabaritão e ganhar XP!"
          >
            {currentRank.avatar}
          </motion.button>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>Gabaritão</span>
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                Nível {currentRank.level}
              </span>
            </h3>
            <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              Patente: {currentRank.title}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            "{message}"
          </p>

          {onOpenSocialStory && (
            <button
              type="button"
              onClick={() => onOpenSocialStory('mascote', { mascotName: 'Gabaritão', mascotLevel: currentRank.level, mascotXp: xp })}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar Nível nos Stories</span>
            </button>
          )}
        </div>

        {/* PROGRESS BAR & STATS */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Progresso para Nível {nextRank.level} ({nextRank.title})
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">
                {currentLevelXp} / {levelRange} XP ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${currentRank.color} shadow-sm`}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentRank.descricao}
            </p>
          </div>

          {/* BONUS & STREAK INFO */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sequência Atual</span>
              <span className="text-sm font-black text-amber-500 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500" /> {studyStreak} Dias
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Bônus Multiplicador</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Zap className="w-4 h-4" /> 1.5x XP
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Interações com Mascot</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Heart className="w-4 h-4 fill-emerald-500" /> {clickCount} Cliques
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALL RANKS TIMELINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Escala Completa de Patentes de Estudo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RANKS.map((r) => {
            const isUnlocked = xp >= r.minXp;
            const isCurrent = currentRank.level === r.level;
            return (
              <motion.div
                key={r.level}
                whileHover={{ scale: 1.03 }}
                className={`p-3.5 rounded-2xl border transition space-y-2 ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                    : isUnlocked
                    ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-90'
                    : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{r.avatar}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Lvl {r.level}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    {r.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    {r.minXp} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

