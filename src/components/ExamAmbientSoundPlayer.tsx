import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Headphones, Clock, FileText, Wind, CloudRain, Users, Sliders, Activity } from 'lucide-react';

export const ExamAmbientSoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.7);

  // Individual ambient layer levels
  const [clockVolume, setClockVolume] = useState<number>(0.65);
  const [pageFlipVolume, setPageFlipVolume] = useState<number>(0.5);
  const [pencilVolume, setPencilVolume] = useState<number>(0.6);
  const [roomHumVolume, setRoomHumVolume] = useState<number>(0.45);
  const [rainVolume, setRainVolume] = useState<number>(0.0);
  const [crowdVolume, setCrowdVolume] = useState<number>(0.0);

  const [activePreset, setActivePreset] = useState<'enem' | 'silencio' | 'chuva' | 'auditorio'>('enem');

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Continuous sound gain nodes
  const rainGainRef = useRef<GainNode | null>(null);
  const crowdGainRef = useRef<GainNode | null>(null);
  const roomHumGainRef = useRef<GainNode | null>(null);

  // Audio source nodes for continuous loops
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const crowdSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const roomHumOscRef = useRef<OscillatorNode | null>(null);
  const roomHumNoiseRef = useRef<AudioBufferSourceNode | null>(null);

  const intervalRefs = useRef<number[]>([]);

  // Initialize Web Audio graph
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Master Gain
        const master = ctx.createGain();
        master.gain.value = masterVolume;
        master.connect(ctx.destination);
        masterGainRef.current = master;

        // Continuous Rain Node setup
        const rainGain = ctx.createGain();
        rainGain.gain.value = rainVolume;
        rainGain.connect(master);
        rainGainRef.current = rainGain;

        // Continuous Crowd Murmur Node setup
        const crowdGain = ctx.createGain();
        crowdGain.gain.value = crowdVolume;
        crowdGain.connect(master);
        crowdGainRef.current = crowdGain;

        // Continuous Room Hum Node setup
        const roomHumGain = ctx.createGain();
        roomHumGain.gain.value = roomHumVolume;
        roomHumGain.connect(master);
        roomHumGainRef.current = roomHumGain;
      }
    }
  };

  // Helper to create noise buffer
  const createNoiseBuffer = (ctx: AudioContext, seconds: number = 3) => {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Start continuous rain audio loop
  const startContinuousRain = (ctx: AudioContext) => {
    stopContinuousRain();
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Filter to sound like soft rainfall on window/roof
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    source.connect(filter);
    if (rainGainRef.current) {
      filter.connect(rainGainRef.current);
    }

    source.start();
    rainSourceRef.current = source;
  };

  const stopContinuousRain = () => {
    if (rainSourceRef.current) {
      try {
        rainSourceRef.current.stop();
        rainSourceRef.current.disconnect();
      } catch {}
      rainSourceRef.current = null;
    }
  };

  // Start continuous crowd murmur loop
  const startContinuousCrowd = (ctx: AudioContext) => {
    stopContinuousCrowd();
    const noiseBuffer = createNoiseBuffer(ctx, 5);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Filter to sound like distant room murmur and human presence
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);

    source.connect(filter);
    if (crowdGainRef.current) {
      filter.connect(crowdGainRef.current);
    }

    source.start();
    crowdSourceRef.current = source;
  };

  const stopContinuousCrowd = () => {
    if (crowdSourceRef.current) {
      try {
        crowdSourceRef.current.stop();
        crowdSourceRef.current.disconnect();
      } catch {}
      crowdSourceRef.current = null;
    }
  };

  // Start continuous room ventilation / hum
  const startContinuousRoomHum = (ctx: AudioContext) => {
    stopContinuousRoomHum();

    // Subtle 60Hz hum
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.connect(oscGain);

    // Brown noise ventilation
    const noiseBuffer = createNoiseBuffer(ctx, 3);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    noiseSource.connect(filter);
    if (roomHumGainRef.current) {
      oscGain.connect(roomHumGainRef.current);
      filter.connect(roomHumGainRef.current);
    }

    osc.start();
    noiseSource.start();

    roomHumOscRef.current = osc;
    roomHumNoiseRef.current = noiseSource;
  };

  const stopContinuousRoomHum = () => {
    if (roomHumOscRef.current) {
      try {
        roomHumOscRef.current.stop();
        roomHumOscRef.current.disconnect();
      } catch {}
      roomHumOscRef.current = null;
    }
    if (roomHumNoiseRef.current) {
      try {
        roomHumNoiseRef.current.stop();
        roomHumNoiseRef.current.disconnect();
      } catch {}
      roomHumNoiseRef.current = null;
    }
  };

  // Sound Synthesizers for discrete events
  const playTickSound = () => {
    if (!audioCtxRef.current || !isPlaying || clockVolume <= 0.01) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.18 * clockVolume, ctx.currentTime);
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
    if (!audioCtxRef.current || !isPlaying || pageFlipVolume <= 0.01) return;
    try {
      const ctx = audioCtxRef.current;
      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12 * pageFlipVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      whiteNoise.start();
    } catch (e) {
      console.error(e);
    }
  };

  const playPencilScratchSound = () => {
    if (!audioCtxRef.current || !isPlaying || pencilVolume <= 0.01) return;
    try {
      const ctx = audioCtxRef.current;
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08 * pencilVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      whiteNoise.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Sync Master Volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current.currentTime);
    }
  }, [masterVolume]);

  // Sync Continuous Layer Volumes
  useEffect(() => {
    if (audioCtxRef.current) {
      const time = audioCtxRef.current.currentTime;
      if (rainGainRef.current) rainGainRef.current.gain.linearRampToValueAtTime(rainVolume, time + 0.1);
      if (crowdGainRef.current) crowdGainRef.current.gain.linearRampToValueAtTime(crowdVolume, time + 0.1);
      if (roomHumGainRef.current) roomHumGainRef.current.gain.linearRampToValueAtTime(roomHumVolume, time + 0.1);
    }
  }, [rainVolume, crowdVolume, roomHumVolume]);

  // Lifecycle control of playing loops
  useEffect(() => {
    if (isPlaying) {
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      if (ctx) {
        startContinuousRain(ctx);
        startContinuousCrowd(ctx);
        startContinuousRoomHum(ctx);
      }

      // Interval cadences adapted to active preset
      const pageIntervalMs = activePreset === 'auditorio' ? 3500 : activePreset === 'silencio' ? 22000 : 8000;
      const pencilIntervalMs = activePreset === 'auditorio' ? 2200 : activePreset === 'silencio' ? 12000 : 4000;

      // Clock Ticking (every 1 second)
      const clockInterval = window.setInterval(() => {
        playTickSound();
      }, 1000);

      // Page Flipping
      const pageInterval = window.setInterval(() => {
        if (Math.random() > 0.3) playPageFlipSound();
      }, pageIntervalMs);

      // Pencil Scratching
      const pencilInterval = window.setInterval(() => {
        if (Math.random() > 0.3) playPencilScratchSound();
      }, pencilIntervalMs);

      intervalRefs.current = [clockInterval, pageInterval, pencilInterval];
    } else {
      intervalRefs.current.forEach((id) => clearInterval(id));
      intervalRefs.current = [];
      stopContinuousRain();
      stopContinuousCrowd();
      stopContinuousRoomHum();
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }

    return () => {
      intervalRefs.current.forEach((id) => clearInterval(id));
      stopContinuousRain();
      stopContinuousCrowd();
      stopContinuousRoomHum();
    };
  }, [isPlaying, activePreset, clockVolume, pageFlipVolume, pencilVolume]);

  const applyPreset = (presetKey: 'enem' | 'silencio' | 'chuva' | 'auditorio') => {
    setActivePreset(presetKey);

    if (presetKey === 'enem') {
      setClockVolume(0.65);
      setPageFlipVolume(0.5);
      setPencilVolume(0.6);
      setRoomHumVolume(0.45);
      setRainVolume(0.0);
      setCrowdVolume(0.0);
    } else if (presetKey === 'silencio') {
      setClockVolume(0.8);
      setPageFlipVolume(0.15);
      setPencilVolume(0.2);
      setRoomHumVolume(0.05);
      setRainVolume(0.0);
      setCrowdVolume(0.0);
    } else if (presetKey === 'chuva') {
      setClockVolume(0.45);
      setPageFlipVolume(0.35);
      setPencilVolume(0.4);
      setRoomHumVolume(0.15);
      setRainVolume(0.75);
      setCrowdVolume(0.0);
    } else if (presetKey === 'auditorio') {
      setClockVolume(0.55);
      setPageFlipVolume(0.85);
      setPencilVolume(0.75);
      setRoomHumVolume(0.55);
      setRainVolume(0.0);
      setCrowdVolume(0.75);
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
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                Simulação Sonora Realista
              </span>
              {isPlaying && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  <Activity className="w-3 h-3" /> Áudio Ativo
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              Simulador de Ambiente e Som de Prova
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adapte sua concentração à atmosfera real do dia da prova com efeitos de áudio sintetizados ao vivo.
            </p>
          </div>
        </div>

        {/* Play Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          type="button"
          className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2.5 shadow-lg cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
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
          Selecione o Perfil de Ambiente:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('enem')}
            className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
              activePreset === 'enem'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black block">🏫 Sala ENEM Padrão</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Relógio, virada de folhas e ar-condicionado
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('silencio')}
            className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
              activePreset === 'silencio'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black block">🤫 Sala Silenciosa</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Foco absoluto: apenas o tique-taque ritmado
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('chuva')}
            className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
              activePreset === 'chuva'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black block">🌧️ Dia de Chuva</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Ruído contínuo e relaxante de chuva na janela
            </span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('auditorio')}
            className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
              activePreset === 'auditorio'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black block">🏛️ Auditório Lotado</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Murmúrio contínuo de pessoas e folhas frequentes
            </span>
          </button>
        </div>
      </div>

      {/* Sound Layer Mixer Controls */}
      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" /> Mixer Individual de Camadas Sonoras:
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
              className="w-24 accent-indigo-600 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-500">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Layer 2: Page Flip */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Virada de Folhas da Prova
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Layer 3: Pencil */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <span className="text-xs">✏️</span> Caneta no Cartão-Resposta
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Layer 4: Room Hum */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-indigo-500" /> Ventilação / Ar-Condicionado
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Layer 5: Rain */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-500" /> Chuva Suave na Janela
              </span>
              <span className="text-[10px] font-mono">{Math.round(rainVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainVolume}
              onChange={(e) => setRainVolume(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Layer 6: Crowd */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-500" /> Presença / Auditório Lotado
              </span>
              <span className="text-[10px] font-mono">{Math.round(crowdVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={crowdVolume}
              onChange={(e) => setCrowdVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
