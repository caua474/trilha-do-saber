import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startAmbientSound,
  stopAmbientSound,
  setAmbientVolume,
  getActiveAmbientType
} from '../utils/ambientAudio';
import { playSuccessSound, playClickSound } from '../utils/audio';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  CloudRain,
  Waves,
  Trees,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Sparkles,
  Coffee,
  Brain,
  Users
} from 'lucide-react';

interface PomodoroFocusSectionProps {
  onAddXp?: (amount: number) => void;
}

export const PomodoroFocusSection: React.FC<PomodoroFocusSectionProps> = ({ onAddXp }) => {
  // Timer State (default 25 min = 1500 sec focus, break = 300 sec)
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalXpEarned, setTotalXpEarned] = useState<number>(0);
  const [showXpCelebration, setShowXpCelebration] = useState<boolean>(false);

  // Audio Ambient State
  const [activeSound, setActiveSound] = useState<'none' | 'chuva' | 'lofi' | 'ruido' | 'floresta'>('none');
  const [volume, setVolume] = useState<number>(0.5);

  // Timer Tick Effect
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Cycle Complete
      playSuccessSound();
      if (mode === 'focus') {
        const bonusXp = 100;
        setCompletedCycles((c) => c + 1);
        setTotalXpEarned((xp) => xp + bonusXp);
        if (onAddXp) onAddXp(bonusXp);
        setShowXpCelebration(true);
        setTimeout(() => setShowXpCelebration(false), 5000);

        // Switch to Break
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        // Switch back to Focus
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
      }
      setIsRunning(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

  // Handle Ambient Sound Selection
  const handleToggleSound = (type: 'chuva' | 'lofi' | 'ruido' | 'floresta') => {
    playClickSound();
    if (activeSound === type) {
      stopAmbientSound();
      setActiveSound('none');
    } else {
      startAmbientSound(type, volume);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  const toggleTimer = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playClickSound();
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    playClickSound();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(
    (( (mode === 'focus' ? FOCUS_TIME : BREAK_TIME) - timeLeft ) / (mode === 'focus' ? FOCUS_TIME : BREAK_TIME)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Timer className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Hiperfoco Gamificado (25m / 5m)
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                ⭐ Recurso PRO
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Modo Foco Pomodoro & Som Ambiente
            </h2>
          </div>
        </div>

        {/* XP Counter */}
        <div className="flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
          <div className="flex items-center space-x-1.5 text-amber-400 font-black text-sm">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>+{totalXpEarned} XP Acumulados</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-xs font-bold text-slate-300">
            🔥 {completedCycles} Ciclos Completos
          </div>
        </div>
      </div>

      {/* Main Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Clock & Controls */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center justify-between space-y-6 relative overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-2 bg-black/50 p-1.5 rounded-2xl border border-white/10 z-10">
            <button
              onClick={() => switchMode('focus')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition flex items-center space-x-1.5 cursor-pointer ${
                mode === 'focus'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Foco (25 min)</span>
            </button>

            <button
              onClick={() => switchMode('break')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition flex items-center space-x-1.5 cursor-pointer ${
                mode === 'break'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Pausa (5 min)</span>
            </button>
          </div>

          {/* Big Clock Circle Display */}
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Outer Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className={`fill-none transition-all duration-500 ${
                  mode === 'focus' ? 'stroke-amber-400' : 'stroke-emerald-400'
                }`}
                strokeWidth="10"
                strokeDasharray="600"
                strokeDashoffset={600 - (600 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-wider font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                {mode === 'focus' ? '🔥 Em Hiperfoco' : '☕ Pausa Merecida'}
              </span>
            </div>
          </div>

          {/* Play/Pause/Reset Controls */}
          <div className="flex items-center space-x-4 z-10">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xl flex items-center space-x-2 ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar Foco</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Sessão</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
              title="Reiniciar Temporizador"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* XP Celebration Modal/Toast Banner */}
          <AnimatePresence>
            {showXpCelebration && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-amber-500 text-slate-950 p-4 rounded-2xl font-black text-center text-xs shadow-2xl flex items-center justify-center space-x-2"
              >
                <Award className="w-5 h-5 text-slate-950" />
                <span>🎉 PARABÉNS! Você concluiu 25 min de foco e ganhou +100 XP Bônus!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Audio Ambient Sound Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-purple-500/20 rounded-3xl p-6 text-white shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>Som Ambiente Relaxante</span>
              </h3>
              {activeSound !== 'none' && (
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Tocando
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Aumente sua concentração bloqueando ruídos externos com sintetizadores de som ambiente em tempo real:
            </p>

            {/* Sound Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'chuva', label: 'Chuva Relaxante', icon: CloudRain, color: 'text-indigo-400' },
                { id: 'lofi', label: 'Rádio Lo-Fi', icon: Radio, color: 'text-amber-400' },
                { id: 'ruido', label: 'Ondas & Ruído', icon: Waves, color: 'text-teal-400' },
                { id: 'floresta', label: 'Floresta Zen', icon: Trees, color: 'text-emerald-400' },
              ].map((sound) => {
                const Icon = sound.icon;
                const isActive = activeSound === sound.id;

                return (
                  <button
                    key={sound.id}
                    onClick={() => handleToggleSound(sound.id as any)}
                    className={`p-3.5 rounded-2xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${sound.color}`} />
                    <span>{sound.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span>Volume do Áudio</span>
              </span>
              <span className="text-amber-400 font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg accent-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SALAS DE POMODORO COLETIVO (ESTUDE COMIGO) */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Salas Virtuais ao Vivo
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 54 Estudo Ativo
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                Salas de Pomodoro Coletivo (Estude Comigo)
              </h3>
            </div>
          </div>

          <div className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            🏆 Bônus Coletivo: +150 XP ao Concluir sem Interrupção
          </div>
        </div>

        {/* Room Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'medicina', title: '🏥 Sala Medicina Foco 50min', members: 18, meta: '50m Foco + 10m Pausa', topic: 'Anatomia & Química Orgânica' },
            { id: 'enem', title: '🚀 Sala Maratonistas ENEM', members: 24, meta: '25m Foco + 5m Pausa', topic: 'Simulado TRI de Matemática' },
            { id: 'humanas', title: '⚖️ Sala Direito & Humanas', members: 12, meta: '25m Foco + 5m Pausa', topic: 'Repertórios & Filosofia' },
          ].map((room) => (
            <div
              key={room.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                  <h4 className="text-white">{room.title}</h4>
                  <span className="text-emerald-400 text-[11px] font-bold">● {room.members} online</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{room.meta}</p>
                <div className="mt-2 text-[10px] font-mono text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Foco Atual: {room.topic}
                </div>
              </div>

              {/* Avatars preview */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex -space-x-2">
                  {['👨‍🎓', '👩‍⚕️', '👨‍💻', '👩‍🔬'].map((emoji, i) => (
                    <span key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                      {emoji}
                    </span>
                  ))}
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[9px] font-black">
                    +{room.members - 4}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSuccessSound();
                    alert(`Você entrou na ${room.title}! Seu temporizador foi sincronizado com a sala.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer active:scale-95"
                >
                  Entrar na Sala
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
