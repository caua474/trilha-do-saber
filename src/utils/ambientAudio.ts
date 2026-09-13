// Ambient Audio Generator using Web Audio API

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | OscillatorNode | null = null;
let currentGain: GainNode | null = null;
let currentFilter: BiquadFilterNode | null = null;
let activeType: string | null = null;
let intervalId: any = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate 5-second Pink Noise Buffer for Rain / Wind
function generatePinkNoise(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.08;
    b6 = white * 0.115926;
  }
  return buffer;
}

export function stopAmbientSound() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (currentSource) {
    try {
      (currentSource as any).stop?.();
    } catch {}
    currentSource = null;
  }
  if (currentGain) {
    try {
      currentGain.disconnect();
    } catch {}
    currentGain = null;
  }
  activeType = null;
}

export function startAmbientSound(
  type: 'chuva' | 'lofi' | 'ruido' | 'floresta',
  vol: number = 0.5
) {
  stopAmbientSound();

  const ctx = getContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGain = masterGain;
  activeType = type;

  if (type === 'chuva') {
    // Pink noise + Lowpass filter = Soothing Rain
    const noiseBuffer = generatePinkNoise(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    currentSource = noiseSource;
    currentFilter = filter;
  } else if (type === 'ruido') {
    // Ocean Waves / White Noise LFO
    const noiseBuffer = generatePinkNoise(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to modulate wave frequency slowly
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // wave cycle every ~8 seconds
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(masterGain);

    lfo.start();
    noiseSource.start();
    currentSource = noiseSource;
    currentFilter = filter;
  } else if (type === 'lofi') {
    // Soothing Lo-Fi Chords
    const chordFreqs = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
    const oscs: OscillatorNode[] = [];

    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Tremolo
      oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscs.push(osc);
    });

    currentSource = oscs[0];
  } else if (type === 'floresta') {
    // Zen Forest Chimes + Soft Wind
    const noiseBuffer = generatePinkNoise(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    currentSource = noiseSource;

    // Periodic gentle chimes
    const chimeNotes = [523.25, 659.25, 783.99, 880.0, 1046.5];
    intervalId = setInterval(() => {
      try {
        const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chime.type = 'sine';
        chime.frequency.setValueAtTime(note, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0.08, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        chime.connect(chimeGain);
        chimeGain.connect(masterGain);

        chime.start(ctx.currentTime);
        chime.stop(ctx.currentTime + 2.5);
      } catch {}
    }, 3500);
  }
}

export function setAmbientVolume(vol: number) {
  if (currentGain && audioCtx) {
    currentGain.gain.setValueAtTime(vol, audioCtx.currentTime);
  }
}

export function getActiveAmbientType(): string | null {
  return activeType;
}
