/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlaybackState, Prompt } from './types';
import { GoogleGenAI, LiveMusicFilteredPrompt } from '@google/genai';
import { PromptDjMidi } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';

declare global {
  interface Window {
    Telegram: any;
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, apiVersion: 'v1alpha' });
const model = 'lyria-realtime-exp';

function isTelegramWebApp(): boolean {
  // Свойство `window.Telegram.WebApp.initData` — это надежный способ
  // проверить, запущено ли приложение в среде Telegram.
  return window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
}

function main() {
  if (!isTelegramWebApp()) {
    document.body.innerHTML = `
      <div style="color: white; text-align: center; padding: 50px; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1>Доступ запрещен</h1>
        <p>Это приложение можно открыть только через Telegram.</p>
      </div>
    `;
    document.body.style.backgroundColor = '#111';
    return;
  }

  const tg = window.Telegram.WebApp;
  const username = tg.initDataUnsafe?.user?.username;

  const { prompts: initialPrompts, categories } = buildInitialPrompts();

  const pdjMidi = new PromptDjMidi(initialPrompts, categories, username);
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  const liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(initialPrompts);

  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;

  pdjMidi.addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    const prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
  }));

  pdjMidi.addEventListener('play-pause', () => {
    liveMusicHelper.playPause();
  });

  // Новый обработчик для события 'restart-playback'
  pdjMidi.addEventListener('restart-playback', async () => {
    liveMusicHelper.stop(); // Останавливаем текущее воспроизведение
    await liveMusicHelper.play(); // Запускаем заново
  });

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<LiveMusicFilteredPrompt>;
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason!)
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  pdjMidi.addEventListener('error', errorToast);

  pdjMidi.addEventListener('master-volume-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    liveMusicHelper.setMasterVolume(level);
  }));
  
  pdjMidi.addEventListener('eq-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{band: number, gain: number}>;
    const { band, gain } = customEvent.detail;
    liveMusicHelper.setEq(band, gain);
  }));
  
  pdjMidi.addEventListener('balance-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const pan = customEvent.detail;
    liveMusicHelper.setBalance(pan);
  }));
  
  pdjMidi.addEventListener('filter-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{type: 'lowpass' | 'highpass', value: number}>;
    const { type, value } = customEvent.detail;
    // convert knob's 0-2 value to frequency's 20-20000 log scale
    const freq = 20 * Math.pow(1000, value / 2);
    if (type === 'lowpass') {
      liveMusicHelper.setLowPass(freq);
    } else {
      liveMusicHelper.setHighPass(freq);
    }
  }));

  // Обработчик для обновления настроек генерации
  pdjMidi.addEventListener('generation-settings-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<any>;
    const settings = customEvent.detail;
    liveMusicHelper.setGenerationConfig(settings);
  }));

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

}

function buildInitialPrompts() {
  const allPromptsFlat = PROMPT_CATEGORIES.flatMap(category => category.prompts);
  const startOn = [...allPromptsFlat]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const promptsMap = new Map<string, Prompt>();
  let ccCounter = 0;

  const categoriesWithFullPrompts = PROMPT_CATEGORIES.map(category => {
    const categoryPrompts: Prompt[] = category.prompts.map(p => {
      const promptId = `prompt-${ccCounter}`;
      const fullPrompt: Prompt = {
        promptId,
        text: p.text,
        color: p.color,
        weight: startOn.some(startP => startP.text === p.text) ? 1 : 0,
        cc: ccCounter,
      };
      promptsMap.set(promptId, fullPrompt);
      ccCounter++;
      return fullPrompt;
    });
    return { name: category.name, prompts: categoryPrompts };
  });

  return { prompts: promptsMap, categories: categoriesWithFullPrompts };
}


const PROMPT_CATEGORIES = [
  {
    name: 'Electronic & Dance',
    prompts: [
      { color: '#333333', text: 'Techno' },
      { color: '#ff66ff', text: 'Synthwave' },
      { color: '#ffdd28', text: 'Dubstep' },
      { color: '#ff25f6', text: 'Drum and Bass' },
      { color: '#4dffdb', text: 'Future Bass' },
      { color: '#e60000', text: 'Hardstyle' },
      { color: '#00e6e6', text: 'Trance' },
      { color: '#b3b3b3', text: 'IDM' },
      { color: '#ff8000', text: 'House' },
    ]
  },
  {
    name: 'Hip Hop & Urban',
    prompts: [
      { color: '#ff4d4d', text: 'Hip Hop' },
      { color: '#4d94ff', text: 'Lo-fi' },
      { color: '#ffc24d', text: 'Trap' },
      { color: '#808080', text: 'Drill' },
      { color: '#d8ff3e', text: 'Neo Soul' },
      { color: '#5200ff', text: 'Trip Hop' },
      { color: '#ff4da6', text: 'R&B' },
      { color: '#666666', text: 'Grime' },
      { color: '#ffa366', text: 'Boom Bap' },
      { color: '#ff6666', text: 'Биты и высокие басы' },
      { color: '#66ccff', text: 'Четкие инструментальные биты' },
      { color: '#cc66ff', text: 'Андеграунд 80-х' },
    ]
  },
  {
    name: 'World & Traditional',
    prompts: [
      { color: '#9900ff', text: 'Bossa Nova' },
      { color: '#009933', text: 'Reggae' },
      { color: '#ff3333', text: 'Salsa' },
      { color: '#ff9900', text: 'Afrobeat' },
      { color: '#ff1aff', text: 'Bollywood' },
      { color: '#ff25f6', text: 'K-Pop' },
      { color: '#cc0000', text: 'Tango' },
      { color: '#33cc33', text: 'Celtic Folk' },
      { color: '#ffff00', text: 'Лезгинка' },
    ]
  },
  {
    name: 'Rock & Alternative',
    prompts: [
      { color: '#2af6de', text: 'Post Punk' },
      { color: '#ffdd28', text: 'Shoegaze' },
      { color: '#ff6600', text: 'Funk' },
      { color: '#cccccc', text: 'Indie Rock' },
      { color: '#cc33ff', text: 'Psychedelic Rock' },
      { color: '#404040', text: 'Metal' },
      { color: '#ff0066', text: 'Punk Rock' },
      { color: '#999999', text: 'Grunge' },
      { color: '#6699ff', text: 'Alt Rock' },
    ]
  },
  {
    name: 'Ambient & Cinematic',
    prompts: [
      { color: '#99e6e6', text: 'Ambient' },
      { color: '#5200ff', text: 'Chillwave' },
      { color: '#9900ff', text: 'Chiptune' },
      { color: '#3dffab', text: 'Lush Strings' },
      { color: '#d8ff3e', text: 'Sparkling Arps' },
      { color: '#c2c2d6', text: 'Orchestral' },
      { color: '#ffb366', text: 'Epic Score' },
      { color: '#8c8c8c', text: 'Soundscape' },
      { color: '#e0e0e0', text: 'Minimalist' },
      { color: '#ff99cc', text: 'Vaporwave' },
    ]
  }
];

main();