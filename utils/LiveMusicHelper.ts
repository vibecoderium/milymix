/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { PlaybackState, Prompt } from '../types';
import type { AudioChunk, GoogleGenAI, LiveMusicFilteredPrompt, LiveMusicServerMessage, LiveMusicSession, LiveMusicGenerationConfig } from '@google/genai'; // Import LiveMusicGenerationConfig
import { decode, decodeAudioData } from './audio';
import { throttle } from './throttle';

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class LiveMusicHelper extends EventTarget {

  private ai: GoogleGenAI;
  private model: string;

  private session: LiveMusicSession | null = null;
  private sessionPromise: Promise<LiveMusicSession> | null = null;

  private connectionError = true;

  private filteredPrompts = new Set<string>();
  private nextStartTime = 0;
  private bufferTime = 2;

  public readonly audioContext: AudioContext;
  public extraDestination: AudioNode | null = null;

  private preMasterNode: GainNode | null = null;
  private masterGainNode: GainNode;
  private pannerNode: StereoPannerNode;
  private lowPassFilter: BiquadFilterNode;
  private highPassFilter: BiquadFilterNode;
  private eqNodes: BiquadFilterNode[] = [];


  private playbackState: PlaybackState = 'stopped';

  private prompts: Map<string, Prompt>;

  // New generation settings
  private generationConfig: LiveMusicGenerationConfig = {
    temperature: 1.1,
    guidance: 4.0,
    topK: 40,
    seed: undefined, // 'Auto' will be undefined
    bpm: undefined, // 'Auto' will be undefined
    density: 0.50,
    brightness: 0.50,
    scale: undefined, // 'Auto' will be undefined
    musicGenerationMode: 'QUALITY', // Convert 'Quality' to 'QUALITY' enum
  };

  constructor(ai: GoogleGenAI, model: string) {
    super();
    this.ai = ai;
    this.model = model;
    this.prompts = new Map();
    this.audioContext = new AudioContext({ sampleRate: 48000 });
    
    // Create persistent audio graph nodes
    this.masterGainNode = this.audioContext.createGain();
    this.pannerNode = this.audioContext.createStereoPanner();
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.highPassFilter = this.audioContext.createBiquadFilter();

    // Configure filters
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.value = 20000;
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.value = 20;

    // Configure EQ
    this.eqNodes = EQ_FREQUENCIES.map(freq => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.5;
      filter.gain.value = 0;
      return filter;
    });

    // Set initial volume
    this.masterGainNode.gain.value = 0.8; // Default master volume

    // Connect the persistent audio graph
    // Chain EQ nodes together
    for (let i = 0; i < this.eqNodes.length - 1; i++) {
      this.eqNodes[i].connect(this.eqNodes[i + 1]);
    }
    
    // Connect the full chain
    if (this.eqNodes.length > 0) {
      this.eqNodes[this.eqNodes.length - 1]
        .connect(this.lowPassFilter)
        .connect(this.highPassFilter)
        .connect(this.pannerNode)
        .connect(this.masterGainNode);
    } else { // Fallback if EQ fails
        this.lowPassFilter
        .connect(this.highPassFilter)
        .connect(this.pannerNode)
        .connect(this.masterGainNode);
    }
  }

  private getSession(): Promise<LiveMusicSession> {
    if (!this.sessionPromise) this.sessionPromise = this.connect();
    return this.sessionPromise;
  }

  private async connect(): Promise<LiveMusicSession> {
    this.sessionPromise = this.ai.live.music.connect({
      model: this.model,
      generationConfig: this.generationConfig, // Передаем generationConfig здесь
      callbacks: {
        onmessage: async (e: LiveMusicServerMessage) => {
          if (e.setupComplete) {
            this.connectionError = false;
          }
          if (e.filteredPrompt) {
            this.filteredPrompts = new Set([...this.filteredPrompts, e.filteredPrompt.text!])
            this.dispatchEvent(new CustomEvent<LiveMusicFilteredPrompt>('filtered-prompt', { detail: e.filteredPrompt }));
          }
          if (e.serverContent?.audioChunks) {
            await this.processAudioChunks(e.serverContent.audioChunks);
          }
        },
        onerror: () => {
          this.connectionError = true;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
        },
        onclose: () => {
          this.connectionError = true;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
        },
      },
    });
    return this.sessionPromise;
  }

  private setPlaybackState(state: PlaybackState) {
    this.playbackState = state;
    this.dispatchEvent(new CustomEvent('playback-state-changed', { detail: state }));
  }

  private async processAudioChunks(audioChunks: AudioChunk[]) {
    if (this.playbackState === 'paused' || this.playbackState === 'stopped' || !this.preMasterNode) return;
    const audioBuffer = await decodeAudioData(
      decode(audioChunks[0].data!),
      this.audioContext,
      48000,
      2,
    );
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.preMasterNode);
    if (this.nextStartTime === 0) {
      this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
      setTimeout(() => {
        this.setPlaybackState('playing');
      }, this.bufferTime * 1000);
    }
    if (this.nextStartTime < this.audioContext.currentTime) {
      this.setPlaybackState('loading');
      this.nextStartTime = 0;
      return;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  public get activePrompts() {
    return Array.from(this.prompts.values())
      .filter((p) => {
        return !this.filteredPrompts.has(p.text) && p.weight !== 0;
      })
  }

  public readonly setWeightedPrompts = throttle(async (prompts: Map<string, Prompt>) => {
    this.prompts = prompts;

    if (this.activePrompts.length === 0) {
      this.dispatchEvent(new CustomEvent('error', { detail: 'There needs to be one active prompt to play.' }));
      this.pause();
      return;
    }

    // store the prompts to set later if we haven't connected yet
    // there should be a user interaction before calling setWeightedPrompts
    if (!this.session) return;

    const weightedPrompts = this.activePrompts.map((p) => {
      return {text: p.text, weight: p.weight};
    });
    try {
      await this.session.setWeightedPrompts({
        weightedPrompts,
      });
    } catch (e: any) {
      this.dispatchEvent(new CustomEvent('error', { detail: e.message }));
      this.pause();
    }
  }, 200);

  public async play() {
    this.setPlaybackState('loading');
    this.session = await this.getSession();

    // Удален вызов this.session.setGenerationConfig(this.generationConfig);
    // Конфигурация теперь передается при подключении в методе connect().

    this.preMasterNode = this.audioContext.createGain();
    // Connect source to the start of the EQ chain
    this.preMasterNode.connect(this.eqNodes[0]);

    await this.setWeightedPrompts(this.prompts);
    this.audioContext.resume();
    this.session.play();
    this.masterGainNode.connect(this.audioContext.destination);
    if (this.extraDestination) this.masterGainNode.connect(this.extraDestination);
    this.preMasterNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.preMasterNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
  }

  public pause() {
    if (this.session) this.session.pause();
    this.setPlaybackState('paused');

    if (this.preMasterNode) {
        this.preMasterNode.gain.setValueAtTime(this.preMasterNode.gain.value, this.audioContext.currentTime);
        this.preMasterNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);

        const nodeToDisconnect = this.preMasterNode;
        setTimeout(() => {
            nodeToDisconnect.disconnect();
        }, 200);
        this.preMasterNode = null;
    }
    
    this.nextStartTime = 0;
    
    setTimeout(() => {
        if (this.playbackState === 'paused') {
            try { this.masterGainNode.disconnect(); } catch(e) {}
        }
    }, 200);
  }

  public stop() {
    if (this.session) this.session.stop();
    this.setPlaybackState('stopped');

    if (this.preMasterNode) {
        this.preMasterNode.gain.setValueAtTime(this.preMasterNode.gain.value, this.audioContext.currentTime);
        this.preMasterNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);

        const nodeToDisconnect = this.preMasterNode;
        setTimeout(() => {
            nodeToDisconnect.disconnect();
        }, 200);
        this.preMasterNode = null;
    }

    this.nextStartTime = 0;
    this.session = null;
    this.sessionPromise = null;
    
    setTimeout(() => {
        if (this.playbackState === 'stopped') {
            try { this.masterGainNode.disconnect(); } catch(e) {}
        }
    }, 200);
  }

  public async playPause() {
    switch (this.playbackState) {
      case 'playing':
        return this.pause();
      case 'paused':
      case 'stopped':
        return this.play();
      case 'loading':
        return this.stop();
    }
  }

  public setMasterVolume(level: number) {
    const safeLevel = Math.max(0, Math.min(1, level));
    this.masterGainNode.gain.setTargetAtTime(safeLevel, this.audioContext.currentTime, 0.01);
  }

  public setEq(band: number, gain: number) {
    if (band >= 0 && band < this.eqNodes.length) {
      const safeGain = Math.max(-40, Math.min(40, gain));
      this.eqNodes[band].gain.setTargetAtTime(safeGain, this.audioContext.currentTime, 0.01);
    }
  }

  public setBalance(pan: number) {
    const safePan = Math.max(-1, Math.min(1, pan));
    this.pannerNode.pan.setTargetAtTime(safePan, this.audioContext.currentTime, 0.01);
  }

  public setLowPass(freq: number) {
    const safeFreq = Math.max(20, Math.min(22050, freq));
    this.lowPassFilter.frequency.setTargetAtTime(safeFreq, this.audioContext.currentTime, 0.01);
  }
  
  public setHighPass(freq: number) {
    const safeFreq = Math.max(20, Math.min(22050, freq));
    this.highPassFilter.frequency.setTargetAtTime(safeFreq, this.audioContext.currentTime, 0.01);
  }

  // New method to update generation settings
  public async setGenerationConfig(config: Partial<LiveMusicGenerationConfig>) {
    // Map 'Auto' string to undefined for seed, bpm, scale
    const mappedConfig: Partial<LiveMusicGenerationConfig> = { ...config };
    if (mappedConfig.seed === 'Auto') mappedConfig.seed = undefined;
    if (mappedConfig.bpm === 'Auto') mappedConfig.bpm = undefined;
    if (mappedConfig.scale === 'Auto') mappedConfig.scale = undefined;
    // Convert 'Quality', 'Diversity', 'Vocalization' to uppercase enum values
    if (mappedConfig.musicGenerationMode) {
        mappedConfig.musicGenerationMode = mappedConfig.musicGenerationMode.toUpperCase() as 'QUALITY' | 'DIVERSITY' | 'VOCALIZATION';
    }

    this.generationConfig = { ...this.generationConfig, ...mappedConfig };
    // Изменения в generationConfig теперь будут применяться при следующем вызове connect() (т.е. при запуске новой сессии).
  }
}