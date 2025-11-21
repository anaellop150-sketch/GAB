let globalAudioCtx: AudioContext | null = null;

const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
};

export type SoundType = 'click' | 'pop' | 'success' | 'reveal' | 'alarm' | 'lock' | 'win' | 'lose' | 'achievement';

export const playSoundEffect = (type: SoundType, enabled: boolean) => {
  if (!enabled) return;

  try {
    if (!globalAudioCtx) {
      globalAudioCtx = createAudioContext();
    }

    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    if (!globalAudioCtx) return;

    const ctx = globalAudioCtx;
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'pop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'success': {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.05, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.05);
          o.start(now + i * 0.05);
          o.stop(now + 0.6 + i * 0.05);
        });
        break;
      }

      case 'reveal': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'lock': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'alarm': {
        for(let i=0; i<3; i++) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'square';
          o.frequency.setValueAtTime(880, now + i * 0.4);
          g.gain.setValueAtTime(0.1, now + i * 0.4);
          g.gain.linearRampToValueAtTime(0, now + i * 0.4 + 0.2);
          o.start(now + i * 0.4);
          o.stop(now + i * 0.4 + 0.2);
        }
        break;
      }

      case 'win': {
        const melody = [523.25, 587.33, 659.25, 783.99];
        melody.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.1, now + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.15);
          o.start(now + i * 0.15);
          o.stop(now + 0.6 + i * 0.15);
        });
        break;
      }

      case 'lose': {
        const melody = [392, 349.23, 329.63, 293.66];
        melody.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.08, now + i * 0.2);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.2);
          o.start(now + i * 0.2);
          o.stop(now + 0.7 + i * 0.2);
        });
        break;
      }

      case 'achievement': {
        const notes = [659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.08, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + i * 0.1);
          o.start(now + i * 0.1);
          o.stop(now + 0.8 + i * 0.1);
        });
        break;
      }
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};
