import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Headphones, Clock, FileText, Wind, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

export const ExamAmbientSoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.7);

  // Individual ambient layer levels
  const [clockVolume, setClockVolume] = useState<number>(0.6);
  const [pageFlipVolume, setPageFlipVolume] = useState<number>(0.4);
  const [pencilVolume, setPencilVolume] = useState<number>(0.5);
  const [roomHumVolume, setRoomHumVolume] = useState<number>(0.5);

  const [activePreset, setActivePreset] = useState<'enem' | 'silencio' | 'chuva' | 'auditorio'>('enem');

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRefs = useRef<number[]>([]);

  // Initialize Web Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        masterGainRef.current = audioCtxRef.current.createGain();
        masterGainRef.current.gain.value = masterVolume;
        masterGainRef.current.connect(audioCtxRef.current.destination);
      }
    }
  };

  // Sound Synthesizers using Web Audio API
  const playTickSound = () => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.15 * clockVolume * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {
      console.error(e);
    }
  };

  const playPageFlipSound = () => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.25; // 250ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08 * pageFlipVolume * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      whiteNoise.start();
    } catch (e) {
      console.error(e);
    }
  };

  const playPencilScratchSound = () => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05 * pencilVolume * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      whiteNoise.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Start sound loops when playing
  useEffect(() => {
    if (isPlaying) {
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Interval for Clock Ticking (every 1 second)
      const clockInterval = window.setInterval(() => {
        playTickSound();
      }, 1000);

      // Interval for Random Page Flipping (every 8 to 15 seconds)
      const pageInterval = window.setInterval(() => {
        if (Math.random() > 0.4) playPageFlipSound();
      }, 9000);

      // Interval for Pencil Writing (every 3 to 6 seconds)
      const pencilInterval = window.setInterval(() => {
        if (Math.random() > 0.3) playPencilScratchSound();
      }, 4000);

      intervalRefs.current = [clockInterval, pageInterval, pencilInterval];
    } else {
      intervalRefs.current.forEach((id) => clearInterval(id));
      intervalRefs.current = [];
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }

    return () => {
      intervalRefs.current.forEach((id) => clearInterval(id));
    };
  }, [isPlaying, clockVolume, pageFlipVolume, pencilVolume, masterVolume]);

  // Handle Master Volume Change
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        masterVolume,
        audioCtxRef.current.currentTime
      );
    }
  }, [masterVolume]);

  const applyPreset = (presetKey: 'enem' | 'silencio' | 'chuva' | 'auditorio') => {
    setActivePreset(presetKey);
    if (presetKey === 'enem') {
      setClockVolume(0.7);
      setPageFlipVolume(0.5);
      setPencilVolume(0.6);
      setRoomHumVolume(0.4);
    } else if (presetKey === 'silencio') {
      setClockVolume(0.8);
      setPageFlipVolume(0.2);
      setPencilVolume(0.3);
      setRoomHumVolume(0.2);
    } else if (presetKey === 'chuva') {
      setClockVolume(0.5);
      setPageFlipVolume(0.4);
      setPencilVolume(0.4);
      setRoomHumVolume(0.8);
    } else if (presetKey === 'auditorio') {
      setClockVolume(0.6);
      setPageFlipVolume(0.8);
      setPencilVolume(0.7);
      setRoomHumVolume(0.6);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Top Title & Play Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/20 text-xl">
            🎧
          </div>
          <div>
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              Simulação Imersiva
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Simulador de Ambiente e Som de Prova
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sinta a atmosfera real de uma sala de aplicação do ENEM/Vestibulares com ruídos de fundo ajustáveis.
            </p>
          </div>
        </div>

        {/* Play Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          type="button"
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar Som Ambiente</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Som de Prova</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Ambient Profiles */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
          Perfis de Ambiente Pré-configurados:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset('enem')}
            className={`p-3 rounded-2xl text-left border transition ${
              activePreset === 'enem'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-black block">🏫 Sala ENEM Padrão</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Relógio, folhas e caneta</span>
          </button>

          <button
            onClick={() => applyPreset('silencio')}
            className={`p-3 rounded-2xl text-left border transition ${
              activePreset === 'silencio'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-black block">🤫 Sala Silenciosa</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Apenas tique-taque suave</span>
          </button>

          <button
            onClick={() => applyPreset('chuva')}
            className={`p-3 rounded-2xl text-left border transition ${
              activePreset === 'chuva'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-black block">🌧️ Dia de Chuva</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Chuva fraca na janela</span>
          </button>

          <button
            onClick={() => applyPreset('auditorio')}
            className={`p-3 rounded-2xl text-left border transition ${
              activePreset === 'auditorio'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-black block">🏛️ Auditório Lotado</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Maior movimentação</span>
          </button>
        </div>
      </div>

      {/* Sound Layer Mixer Controls */}
      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" /> Mixer Individual de Camadas de Som:
          </span>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-[11px] font-mono text-slate-500">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Layer 1: Clock */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Tique-Taque do Relógio
              </span>
              <span className="text-[10px] font-mono">{Math.round(clockVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={clockVolume}
              onChange={(e) => setClockVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Layer 2: Page Flip */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Virada de Páginas
              </span>
              <span className="text-[10px] font-mono">{Math.round(pageFlipVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pageFlipVolume}
              onChange={(e) => setPageFlipVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Layer 3: Pencil */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Caneta / Lápis no Papel
              </span>
              <span className="text-[10px] font-mono">{Math.round(pencilVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pencilVolume}
              onChange={(e) => setPencilVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Layer 4: Room Hum */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-indigo-500" /> Fundo de Sala de Aula
              </span>
              <span className="text-[10px] font-mono">{Math.round(roomHumVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={roomHumVolume}
              onChange={(e) => setRoomHumVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
