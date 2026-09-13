const SOUND_SETTINGS_KEY = 'gabaritai_sound_effects_enabled_v1';
const QUIZ_SOUND_SETTINGS_KEY = 'gabaritai_quiz_success_sound_v1';

export function getSoundEnabled(): boolean {
  try {
    const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, String(enabled));
  } catch (e) {
    console.error('Erro ao salvar preferência de som:', e);
  }
}

export function getQuizSuccessSoundEnabled(): boolean {
  try {
    const saved = localStorage.getItem(QUIZ_SOUND_SETTINGS_KEY);
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
}

export function setQuizSuccessSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(QUIZ_SOUND_SETTINGS_KEY, String(enabled));
  } catch (e) {
    console.error('Erro ao salvar preferência de som do quiz:', e);
  }
}

/**
 * Plays a crystalline, cheerful "pling" bell chord when completing a quiz or challenge.
 */
export function playQuizSuccessPling(): void {
  if (!getSoundEnabled() || !getQuizSuccessSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Harmonic bell frequencies (F#6, A#6, C#7, F#7)
    const freqs = [1479.98, 1864.66, 2217.46, 2959.96];
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    masterGain.connect(ctx.destination);

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);

      // Attack & decay envelope for each harmonic
      noteGain.gain.setValueAtTime(0.001, now + index * 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.18 / (index + 1), now + index * 0.04 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9 + index * 0.08);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + index * 0.04);
      osc.stop(now + 1.2);
    });
  } catch {
    // AudioContext blocked or unsupported
  }
}

export function playSuccessSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch {
    // AudioContext blocked or unsupported
  }
}

export function playErrorSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(311.13, now); // Eb4
    osc1.frequency.exponentialRampToValueAtTime(233.08, now + 0.15); // Bb3

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch {
    // AudioContext blocked or unsupported
  }
}

export function playClickSound(): void {
  if (!getSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // ignore
  }
}
