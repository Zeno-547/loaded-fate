import { GameSettings } from './gameTypes';

class SoundManager {
  private settings: GameSettings = {
    masterVolume: 0.7,
    effectsVolume: 0.8,
    musicVolume: 0.5,
    muted: false,
  };

  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('roulette_sound_settings');
    if (stored) {
      try {
        this.settings = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load sound settings:', e);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('roulette_sound_settings', JSON.stringify(this.settings));
  }

  getSettings(): GameSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  private getEffectiveVolume(): number {
    if (this.settings.muted) return 0;
    return this.settings.masterVolume * this.settings.effectsVolume;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (this.settings.muted) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(this.getEffectiveVolume() * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Failed to play tone:', e);
    }
  }

  private playNoise(duration: number): void {
    if (this.settings.muted) return;

    try {
      const ctx = this.getAudioContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.getEffectiveVolume() * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(ctx.currentTime);
    } catch (e) {
      console.error('Failed to play noise:', e);
    }
  }

  playCock(): void {
    // Mechanical click sound
    this.playTone(800, 0.05, 'square');
    setTimeout(() => this.playTone(600, 0.08, 'square'), 50);
  }

  playEmptyClick(): void {
    // Empty chamber click
    this.playTone(400, 0.1, 'square');
  }

  playGunshot(): void {
    // Explosion-like gunshot
    this.playNoise(0.3);
    this.playTone(100, 0.2, 'sawtooth');
  }

  playHit(): void {
    // Impact sound
    this.playTone(150, 0.15, 'sawtooth');
    setTimeout(() => this.playNoise(0.1), 50);
  }

  playDeath(): void {
    // Dramatic death sound
    this.playTone(200, 0.5, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.4, 'sawtooth'), 200);
    setTimeout(() => this.playTone(100, 0.6, 'sawtooth'), 400);
  }

  playUIClick(): void {
    this.playTone(600, 0.05, 'sine');
  }

  playSuccess(): void {
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
  }

  playError(): void {
    this.playTone(200, 0.2, 'sawtooth');
  }

  playItemUse(): void {
    this.playTone(440, 0.1, 'triangle');
    setTimeout(() => this.playTone(550, 0.1, 'triangle'), 80);
  }

  playNewMessage(): void {
    this.playTone(880, 0.05, 'sine');
  }

  playTurnStart(): void {
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(660, 0.15, 'sine'), 100);
  }

  playVictory(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 150);
    });
  }
}

export const soundManager = new SoundManager();
