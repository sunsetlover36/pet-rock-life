import { BackgroundMusic, Sound } from "~/types";

class SoundManager {
  private context: AudioContext | null = null;
  private buffers: Map<Sound, AudioBuffer> = new Map();

  private currentMusicBuffer: AudioBuffer | null = null;
  private currentTrackName: BackgroundMusic | null = null;

  private enabled = localStorage.getItem("sound-enabled") !== "false";

  private currentMusicSource: AudioBufferSourceNode | null = null;
  private currentMusicGain: GainNode | null = null;
  private musicVolume = 0.3;
  private musicEnabled = localStorage.getItem("music-enabled") !== "false";
  private isBackgroundMode = true;
  private musicTracks: BackgroundMusic[] = [
    BackgroundMusic.TRACK_1,
    BackgroundMusic.TRACK_2,
    BackgroundMusic.TRACK_3,
    BackgroundMusic.TRACK_4,
    BackgroundMusic.TRACK_5,
    BackgroundMusic.TRACK_6,
    BackgroundMusic.TRACK_7,
    BackgroundMusic.TRACK_8,
  ];

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported");
    }
  }

  private async loadSound(sound: Sound): Promise<AudioBuffer | null> {
    if (!this.context) return null;

    if (this.buffers.has(sound)) {
      return this.buffers.get(sound) || null;
    }

    const soundFiles = {
      [Sound.FOOTSTEP_GRASS]: "/sounds/footstep_grass.mp3",
      [Sound.FOOTSTEP_WOOD]: "/sounds/footstep_wood.mp3",
      [Sound.MENU_CLICK]: "/sounds/menu_click.mp3",
      [Sound.POP_1]: "/sounds/pop_1.mp3",
      [Sound.POP_2]: "/sounds/pop_2.mp3",
      [Sound.POP_3]: "/sounds/pop_3.mp3",
      [Sound.TRAMPOLINE_JUMP]: "/sounds/trampoline_jump.mp3",
      [Sound.TWINKLE_1]: "/sounds/twinkle_1.mp3",
      [Sound.TWINKLE_2]: "/sounds/twinkle_2.mp3",
      [Sound.TWINKLE_3]: "/sounds/twinkle_3.mp3",
      [Sound.TWINKLE_4]: "/sounds/twinkle_4.mp3",
      [Sound.SQUEAK]: "/sounds/squeak.mp3",
      [Sound.TALK]: "/sounds/dialog_1.mp3",
      [Sound.STAMP]: "/sounds/stamp.mp3",
      [Sound.DOOR_OPEN]: "/sounds/door_open.mp3",
      [Sound.CAMERA_SHUTTER]: "/sounds/camera_shutter.mp3",
    };

    const url = soundFiles[sound];
    if (!url) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

      this.buffers.set(sound, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound: ${url}`);
      return null;
    }
  }

  private async loadMusicTrack(
    track: BackgroundMusic,
  ): Promise<AudioBuffer | null> {
    if (!this.context) return null;

    if (this.currentTrackName === track && this.currentMusicBuffer) {
      return this.currentMusicBuffer;
    }

    this.currentMusicBuffer = null;
    this.currentTrackName = null;

    const url = `/music/${track}.mp3`;
    try {
      console.log(`Loading music: ${url}`);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

      this.currentMusicBuffer = audioBuffer;
      this.currentTrackName = track;
      console.log(`Music loaded: ${track}`);

      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load music: ${url}`, error);
      return null;
    }
  }

  private async ensureAudioContext() {
    if (!this.context) return false;

    if (this.context.state === "suspended") {
      try {
        await this.context.resume();
      } catch (error) {
        console.warn("Failed to resume audio context");
        return false;
      }
    }

    return true;
  }

  async playSound(sound: Sound, volume = 0.1) {
    if (!this.enabled) return;

    const canPlay = await this.ensureAudioContext();
    if (!canPlay || !this.context) return;

    // Load sound on-demand
    const buffer = await this.loadSound(sound);
    if (!buffer) return;

    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.context.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);

      source.start();
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  }

  setEnabled(enabled: boolean, sound?: Sound) {
    this.enabled = enabled;
    if (sound) {
      this.playSound(sound);
    }
  }

  private getRandomTrack(): BackgroundMusic {
    const randomIndex = Math.floor(Math.random() * this.musicTracks.length);
    return this.musicTracks[randomIndex];
  }

  async startBackgroundMusic() {
    if (!this.musicEnabled || !this.context) return;

    this.stopBackgroundMusic();
    this.isBackgroundMode = true;

    const track = this.getRandomTrack();

    const buffer = await this.loadMusicTrack(track);
    if (!buffer) return;

    const canPlay = await this.ensureAudioContext();
    if (!canPlay) return;

    try {
      this.currentMusicSource = this.context.createBufferSource();
      this.currentMusicGain = this.context.createGain();

      this.currentMusicSource.buffer = buffer;
      this.currentMusicGain.gain.value = this.musicVolume;

      this.currentMusicSource.connect(this.currentMusicGain);
      this.currentMusicGain.connect(this.context.destination);

      this.currentMusicSource.onended = () => {
        if (this.musicEnabled && this.isBackgroundMode) {
          console.log("source ended");
          setTimeout(() => {
            this.startBackgroundMusic();
          }, 1000);
        }
      };

      this.currentMusicSource.start();
      console.log(`Playing background music: ${track}`);
    } catch (error) {
      console.warn("Error playing background music:", error);
    }
  }

  stopBackgroundMusic() {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.onended = null;
        this.currentMusicSource.stop();
      } catch (error) {
        // Already stopped
      }
      this.currentMusicSource = null;
    }
    if (this.currentMusicGain) {
      this.currentMusicGain = null;
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusicGain) {
      this.currentMusicGain.gain.value = this.musicVolume;
    }
  }

  async playMusicTrack(
    track: BackgroundMusic,
    options: {
      loop?: boolean;
      volume?: number;
      fadeIn?: boolean;
    } = {},
  ) {
    if (!this.musicEnabled || !this.context) return;

    const { loop = false, volume = this.musicVolume, fadeIn = false } = options;

    this.stopBackgroundMusic();
    this.isBackgroundMode = false;

    const buffer = await this.loadMusicTrack(track);
    if (!buffer) return;

    const canPlay = await this.ensureAudioContext();
    if (!canPlay) return;

    try {
      this.currentMusicSource = this.context.createBufferSource();
      this.currentMusicGain = this.context.createGain();

      this.currentMusicSource.buffer = buffer;
      this.currentMusicSource.loop = loop;

      // Set initial volume (for fade in effect)
      const targetVolume = Math.max(0, Math.min(1, volume));
      this.currentMusicGain.gain.value = fadeIn ? 0 : targetVolume;

      this.currentMusicSource.connect(this.currentMusicGain);
      this.currentMusicGain.connect(this.context.destination);

      // Handle track ending (only if not looping)
      if (!loop) {
        this.currentMusicSource.onended = () => {
          // Track finished, don't auto-restart unless explicitly requested
          console.log(`Finished playing: ${track}`);
        };
      }

      this.currentMusicSource.start();

      // Fade in effect
      if (fadeIn) {
        this.currentMusicGain.gain.linearRampToValueAtTime(
          targetVolume,
          this.context.currentTime + 1,
        );
      }

      console.log(`Playing specific track: ${track} (loop: ${loop})`);
    } catch (error) {
      console.warn("Error playing music track:", error);
    }
  }

  async resumeBackgroundMusic() {
    if (!this.musicEnabled) return;

    this.stopBackgroundMusic();
    await this.startBackgroundMusic();
    console.log("Resumed background music mode");
  }

  getCurrentTrack(): BackgroundMusic | null {
    return this.currentTrackName;
  }

  isBackgroundMusicMode(): boolean {
    return this.isBackgroundMode;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
      this.currentMusicBuffer = null;
      this.currentTrackName = null;
    } else {
      this.startBackgroundMusic();
    }
  }

  dispose() {
    this.stopBackgroundMusic();
    this.buffers.clear();
    this.currentMusicBuffer = null;
    this.currentTrackName = null;

    if (this.context && this.context.state !== "closed") {
      this.context.close();
    }
    this.context = null;
  }

  async initializeOnUserGesture() {
    if (this.context && this.context.state === "suspended") {
      try {
        await this.context.resume();
        console.log("Audio context resumed");
      } catch (error) {
        console.warn("Failed to resume audio context on user gesture");
      }
    }
  }
}

export const soundManager = new SoundManager();

export const initializeAudio = () => {
  soundManager.initializeOnUserGesture();
};
