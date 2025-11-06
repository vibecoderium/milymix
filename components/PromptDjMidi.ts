/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement, svg } from 'lit'; // Добавлен svg
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js'; // Импортируем classMap

import { throttle } from '../utils/throttle';

import './PromptController';
import './PlayPauseButton';
import './PresetManager';
import './VolumeEditor';
import './ChatAssistant';
// import './SynthPanel'; // Удален импорт SynthPanel
import './ActivePromptsDisplay';
import './MasterControls';
// import './ProfileHeader'; // Удален импорт ProfileHeader
import './ActivePromptKnob';
// import './WeightKnob'; // Удален импорт WeightKnob
// import './VerticalSlider'; // Удален импорт VerticalSlider
import './HorizontalSlider'; // Импортируем новый компонент HorizontalSlider
// import './SaveIcon'; // Удален импорт SaveIcon
import './CustomPromptCreator'; // Импортируем новый компонент

import type { CustomPromptCreator } from './CustomPromptCreator';
import type { ChatAssistant } from './ChatAssistant';

import type { Preset } from './PresetManager';
import type { PlaybackState, Prompt } from '../types';
import { MidiDispatcher } from '../utils/MidiDispatcher';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';


interface PromptCategory {
  name: string;
  prompts: Prompt[];
}

/** The grid of prompt inputs. */
@customElement('prompt-dj-midi')
// Fix: The class must extend LitElement to be a valid web component.
export class PromptDjMidi extends LitElement {
  static override styles = css`
    :host {
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      position: relative; /* For modals */
      background: #111;
      overflow: hidden; /* Prevent host scrolling */
    }
    #background {
      will-change: background-image;
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: -1;
      background: #111;
    }
    #header {
      position: fixed; /* Прикрепляем к верху */
      top: 0;
      left: 0;
      width: 100%;
      height: 9vmin; /* Высота шапки */
      display: flex;
      align-items: center;
      gap: 1.5vmin;
      z-index: 10;
      flex-shrink: 0;
      background-color: rgba(20, 20, 20, 0.7);
      padding: 0 1.5vmin;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .header-logo {
      height: calc(100% - 6px);
      object-fit: contain;
      padding: 3px;
    }
    .app-title {
      color: #fff;
      font-size: clamp(18px, 3vmin, 28px);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .header-button {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.5vmin;
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px; /* Сделано квадратным */
      transition: background-color 0.2s;
      width: 5vmin; /* Задаем фиксированную ширину для квадратной кнопки */
      height: 5vmin; /* Задаем фиксированную высоту для квадратной кнопки */
      min-width: 30px; /* Минимальный размер для кнопки */
      min-height: 30px; /* Минимальный размер для кнопки */
    }
    .header-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .header-button svg { /* Стили для SVG внутри кнопки */
      width: 100%;
      height: 100%;
      fill: currentColor; /* Используем цвет текста кнопки */
    }
    
    #main-area {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5vmin;
      padding: 1.5vmin;
      padding-top: 9vmin; /* Отступ сверху для фиксированной шапки */
      padding-bottom: 49vmin; /* Увеличено для новой высоты нижних фиксированных блоков */
      overflow-y: auto; /* Разрешаем прокрутку только для этой области */
      width: 100%;
      box-sizing: border-box;
    }

    #accordions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1vmin;
    }
    .accordion-item {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background-color: rgba(20, 20, 20, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .accordion-item.active {
      flex-shrink: 1;
    }
    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1vh 2vw;
      font-size: clamp(14px, 2vh, 18px);
      font-weight: 500;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      text-align: left;
      flex-shrink: 0;
    }
    .chevron {
      font-size: clamp(16px, 2.5vh, 20px);
      font-weight: 300;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.3s ease-in-out;
    }
    .accordion-item.active .chevron {
      transform: rotate(180deg);
    }
    .accordion-content {
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-in-out;
      max-height: 0; /* Start collapsed */
      opacity: 0;
      visibility: hidden; /* Hide content completely when collapsed */
    }
    .accordion-item.active .accordion-content {
      max-height: 1000px; /* A large enough value to show content */
      opacity: 1;
      visibility: visible;
    }
    .accordion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11vmin, 1fr));
      gap: 1vmin;
      height: 100%;
      box-sizing: border-box;
      padding: 1.5vmin;
    }
    .category-section { /* New style for inner category sections */
      display: flex;
      flex-direction: column;
      gap: 1vmin;
      margin-bottom: 2vmin;
    }
    .category-title { /* New style for inner category titles */
      font-size: clamp(16px, 2.5vmin, 22px);
      font-weight: 500;
      color: #fff;
      padding: 0.5vmin 1.5vmin;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    #now-playing-container {
      position: fixed; /* Сделано фиксированным */
      bottom: 17vmin; /* Над футером */
      left: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5vmin;
      z-index: 90; /* Ниже модальных окон, выше основного контента */
      padding: 1.5vmin; /* Отступы внутри контейнера */
      box-sizing: border-box;
      background-color: rgba(20, 20, 20, 0.7); /* Фон для всего блока */
      border-top: 1px solid rgba(255, 255, 255, 0.2); /* Верхняя граница */
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .master-controls-bottom {
      display: flex;
      align-items: center;
      gap: 1.5vmin;
      width: 100%;
      background-color: rgba(20, 20, 20, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5vmin;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .master-volume-horizontal-control {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5vmin;
    }
    .master-volume-label {
      font-size: 4.8vmin;
      font-weight: 500;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .save-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
    }
    #footer {
      position: fixed; /* Прикрепляем к низу */
      bottom: 0;
      left: 0;
      width: 100%;
      height: 17vmin; /* Увеличена высота подвала в 2 раза */
      display: flex;
      align-items: center;
      gap: 1.5vmin;
      z-index: 95; /* Ниже модальных окон, выше других фиксированных элементов */
      padding: 0.75vmin; /* Отступы подвала */
      box-sizing: border-box;
      background-color: rgba(20, 20, 20, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }
    #footer play-pause-button { /* Увеличена кнопка Play/Pause */
      height: 100%; /* Занимает всю высоту подвала */
      width: 17vmin; /* Сохраняет квадратные пропорции */
      max-width: 100px; /* Ограничение для больших экранов */
      flex-shrink: 0;
    }
    button {
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      color: #fff;
      background: #0002;
      -webkit-font-smoothing: antialiased;
      border: 1.5px solid #fff;
      border-radius: 4px;
      user-select: none;
      padding: 5px 10px;
      &.active {
        background-color: #fff;
        color: #000;
      }
    }
    select {
      font: inherit;
      padding: 5px;
      background: #fff;
      color: #000;
      border-radius: 4px;
      border: none;
      outline: none;
      cursor: pointer;
    }

    /* Styles for Equalizer Modal */
    .equalizer-scrim {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .equalizer-scrim.showing {
      opacity: 1;
      visibility: visible;
    }
    .equalizer-modal {
      background: #222;
      color: #fff;
      border-radius: 8px;
      padding: 20px;
      width: min(600px, 90vw);
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      gap: 15px;
      border: 1px solid #444;
      box-shadow: 0 4px 30px rgba(0,0,0,0.5);
    }
    .equalizer-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .equalizer-modal-header h2 {
      margin: 0;
      font-size: 1.5em;
    }
    .equalizer-close-button {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5em;
      cursor: pointer;
    }

    #editing-prompt-display {
      position: fixed;
      bottom: 47.5vmin; /* Отступ от низа, учитывая новую высоту подвала и now-playing-container */
      left: 0;
      width: 100%;
      background-color: rgba(20, 20, 20, 0.9);
      color: #fff;
      font-size: clamp(20px, 4vmin, 32px);
      font-weight: 600;
      text-align: center;
      padding: 1.5vmin;
      box-sizing: border-box;
      z-index: 99;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
      opacity: 0;
      visibility: hidden;
    }
    #editing-prompt-display.showing {
      opacity: 1;
      visibility: visible;
    }
  `;

  private prompts: Map<string, Prompt>;
  private promptCategories: PromptCategory[];
  private allPromptTexts: string[];
  private midiDispatcher: MidiDispatcher;

  @property({ type: Boolean }) private showMidi = false;
  @property({ type: String }) public playbackState: PlaybackState = 'stopped';
  @state() public audioLevel = 0;
  @state() private midiInputIds: string[] = [];
  @state() private activeMidiInputId: string | null = null;
  @state() private showPresetManager = false;

  @state() private editingPromptId: string | null = null;
  @state() private editorWeight = 0;
  // Removed @state() private activeCategories = new Set<string>(); // No longer needed for inner categories
  @state() private showEqualizer = false; // Состояние для отображения модального окна эквалайзера
  @state() private showCustomCreator = false; // Состояние для нового аккордеона
  @state() private showSelectStyleAccordion = false; // Состояние для главного аккордеона "Выбрать стиль"
  @state() private masterVolume = 0.8; // Новое состояние для общей громкости
  @state() private currentEditingPromptText = ''; // Новое состояние для текста редактируемого стиля

  // New generation settings states
  @state() private temperature = 1.1;
  @state() private guidance = 4.0;
  @state() private topK = 40;
  @state() private seed = 'Auto';
  @state() private bpm = 'Auto';
  @state() private density = 0.50;
  @state() private densityAuto = true;
  @state() private brightness = 0.50;
  @state() private brightnessAuto = true;
  @state() private scale = 'Auto';
  @state() private musicGenerationMode = 'Quality';


  @property({ type: Object })
  private filteredPrompts = new Set<string>();

  constructor(
    initialPrompts: Map<string, Prompt>,
    promptCategories: PromptCategory[],
  ) {
    super();
    this.prompts = initialPrompts;
    this.promptCategories = promptCategories;
    this.allPromptTexts = promptCategories.flatMap(cat => cat.prompts.map(p => p.text));
    this.midiDispatcher = new MidiDispatcher();
    this.midiDispatcher.addEventListener('cc-message', (e: Event) => {
      const customEvent = e as CustomEvent<{cc: number, value: number}>;
      const { cc, value } = customEvent.detail;
      const promptToControl = [...this.prompts.values()].find(p => p.cc === cc);
      if (promptToControl) {
        promptToControl.weight = (value / 127) * 2;
        this.requestUpdate();
        this.dispatchEvent(
            new CustomEvent('prompts-changed', { detail: this.prompts }),
        );
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  private handleEditPromptRequest(e: CustomEvent<{ promptId: string }>) {
    const requestedPromptId = e.detail.promptId;
    if (this.editingPromptId === requestedPromptId) {
      this.saveAndCloseEditor();
    } else {
      this.openEditorFor(requestedPromptId);
    }
  }

  private openEditorFor(promptId: string) {
    const prompt = this.prompts.get(promptId);
    if (prompt) {
      this.editingPromptId = promptId;
      this.editorWeight = prompt.weight;
      this.currentEditingPromptText = prompt.text;
    }
  }

  private saveAndCloseEditor() {
    if (!this.editingPromptId) return;

    const promptId = this.editingPromptId;
    const weight = this.editorWeight;
    const prompt = this.prompts.get(promptId);

    if (prompt) {
        prompt.weight = weight;
        const newPrompts = new Map(this.prompts);
        newPrompts.set(promptId, prompt);
        this.prompts = newPrompts;

        this.dispatchEvent(
            new CustomEvent('prompts-changed', { detail: this.prompts }),
        );
    }
    this.editingPromptId = null;
    this.currentEditingPromptText = '';
  }

  private handleEditorWeightChange(e: CustomEvent<number>) {
    this.editorWeight = e.detail;
  }

  /** Generates radial gradients for each prompt based on weight and color. */
  private readonly makeBackground = throttle(
    () => {
      const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

      const MAX_WEIGHT = 0.5;
      const MAX_ALPHA = 0.6;

      const bg: string[] = [];
      const numPrompts = this.prompts.size;
      const numCols = Math.ceil(Math.sqrt(numPrompts));

      [...this.prompts.values()].forEach((p, i) => {
        const alphaPct = clamp01(p.weight / MAX_WEIGHT) * MAX_ALPHA;
        const alpha = Math.round(alphaPct * 0xff)
          .toString(16)
          .padStart(2, '0');

        const stop = p.weight / 2;
        const x = (i % numCols) / (numCols - 1);
        const y = Math.floor(i / numCols) / (numCols - 1);
        const s = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${p.color}${alpha} 0px, ${p.color}00 ${stop * 100}%)`;

        bg.push(s);
      });

      return bg.join(', ');
    },
    30, // don't re-render more than once every XXms
  );

  private toggleShowMidi() {
    return this.setShowMidi(!this.showMidi);
  }

  public async setShowMidi(show: boolean) {
    this.showMidi = show;
    if (!this.showMidi) return;
    try {
      const inputIds = await this.midiDispatcher.getMidiAccess();
      this.midiInputIds = inputIds;
      this.activeMidiInputId = this.midiDispatcher.activeMidiInputId;
    } catch (e: any) {
      this.showMidi = false;
      this.dispatchEvent(new CustomEvent('error', {detail: e.message}));
    }
  }

  private handleMidiInputChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newMidiId = selectElement.value;
    this.activeMidiInputId = newMidiId;
    this.midiDispatcher.activeMidiInputId = newMidiId;
  }

  private playPause() {
    this.dispatchEvent(new CustomEvent('play-pause'));
  }

  public addFilteredPrompt(prompt: string) {
    this.filteredPrompts = new Set([...this.filteredPrompts, prompt]);
  }

  private handleLoadPreset(e: CustomEvent<Preset>) {
    const prompts = e.detail.prompts;
    const newPromptsMap = new Map<string, Prompt>();
    for (const promptId in prompts) {
      newPromptsMap.set(promptId, prompts[promptId]);
    }
    this.prompts = newPromptsMap;
    this.showPresetManager = false;
    this.dispatchEvent(
        new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
    this.requestUpdate();
  }

  private getCurrentPromptsAsObject(): Record<string, Prompt> {
    const obj: Record<string, Prompt> = {};
    for (const [key, value] of this.prompts.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  // Removed handleAccordionToggle as inner categories are no longer independent accordions

  private handleMainAccordionToggle() {
    this.showSelectStyleAccordion = !this.showSelectStyleAccordion;
  }

  private handleEqualizerToggle() {
    this.showEqualizer = !this.showEqualizer;
  }

  private handleActivePromptWeightChange(e: CustomEvent<{ promptId: string, weight: number }>) {
    const { promptId, weight } = e.detail;
    const prompt = this.prompts.get(promptId);

    if (prompt) {
      prompt.weight = weight;
      const newPrompts = new Map(this.prompts);
      newPrompts.set(promptId, prompt);
      this.prompts = newPrompts;
      this.dispatchEvent(new CustomEvent('prompts-changed', { detail: this.prompts }));
      this.requestUpdate();
    }
  }

  private handleMasterVolumeChange(e: CustomEvent<number>) {
    let sliderValue = e.detail;
    
    if (typeof sliderValue !== 'number' || isNaN(sliderValue) || !isFinite(sliderValue)) {
      console.error('Received non-finite or invalid volume detail from slider:', e.detail);
      sliderValue = 1.6;
    }

    this.masterVolume = Math.max(0, Math.min(1, sliderValue / 2));
    
    this.dispatchEvent(new CustomEvent('master-volume-changed', {
      detail: this.masterVolume,
      bubbles: true,
      composed: true,
    }));
  }

  private async handleAssistantPrompt(e: CustomEvent<string>) {
    const userPrompt = e.detail;
    const assistant = this.shadowRoot?.querySelector('chat-assistant');
  
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
      const setMusicMixFunctionDeclaration: FunctionDeclaration = {
          name: 'setMusicMix',
          description: 'Sets the volumes for a list of music genres to create a mix.',
          parameters: {
              type: Type.OBJECT,
              properties: {
                  mix: {
                      type: Type.ARRAY,
                      description: 'An array of genre and volume objects. Select up to 5 genres.',
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              genre: {
                                  type: Type.STRING,
                                  description: 'The name of the music genre.',
                                  enum: this.allPromptTexts,
                              },
                              volume: {
                                  type: Type.NUMBER,
                                  description: 'The volume for the genre, from 0.0 to 2.0.',
                              },
                          },
                          required: ['genre', 'volume'],
                      },
                  },
              },
              required: ['mix'],
          },
      };
  
      const systemInstruction = `You are an expert DJ assistant. Your task is to interpret the user's request and create a music mix by selecting up to 5 genres from the provided list and setting their volumes (weights) between 0.0 and 2.0. A higher volume means the genre is more prominent. You must use the setMusicMix function to apply your selections.
  
  Available genres: ${this.allPromptTexts.join(', ')}.`;
  
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: {
              systemInstruction,
              tools: [{ functionDeclarations: [setMusicMixFunctionDeclaration] }],
          },
      });
      
      const functionCall = response.functionCalls?.[0];
  
      if (functionCall?.name === 'setMusicMix') {
          const mix = functionCall.args.mix as { genre: string, volume: number }[];
          
          if (mix && mix.length > 0) {
              const newPrompts = new Map(this.prompts);
              newPrompts.forEach(prompt => {
                  prompt.weight = 0;
              });
  
              mix.forEach(item => {
                  const promptToUpdate = [...newPrompts.values()].find(p => p.text.toLowerCase() === item.genre.toLowerCase());
                  if (promptToUpdate) {
                      promptToUpdate.weight = Math.max(0, Math.min(2, item.volume));
                  }
              });
  
              this.prompts = newPrompts;
              this.dispatchEvent(new CustomEvent('prompts-changed', { detail: this.prompts }));
              this.requestUpdate();
          } else {
               this.dispatchEvent(new CustomEvent('error', { detail: 'The assistant could not find a matching mix.' }));
          }
  
      } else {
           this.dispatchEvent(new CustomEvent('error', { detail: 'The assistant could not process the request.' }));
      }
  
    } catch (error: any) {
      console.error('Error with AI Assistant:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: `Assistant error: ${error.message}` }));
    } finally {
        if(assistant) {
            assistant.finishLoading();
        }
    }
  }

  private handleCreateCustomPrompt(e: CustomEvent<{ text: string, weight: number, color: string }>) {
    const { text, weight, color } = e.detail;

    if (!text) return;

    const maxCc = Math.max(0, ...Array.from(this.prompts.values()).map(p => p.cc));
    const newCc = maxCc + 1;

    const promptId = `custom-${Date.now()}`;

    const newPrompt: Prompt = {
        promptId,
        text,
        color,
        weight,
        cc: newCc,
    };

    const newPrompts = new Map(this.prompts);
    newPrompts.set(promptId, newPrompt);
    this.prompts = newPrompts;

    this.dispatchEvent(
        new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
    this.dispatchEvent(new CustomEvent('restart-playback', { bubbles: true, composed: true }));


    const creator = this.shadowRoot?.querySelector('custom-prompt-creator');
    if (creator) {
        (creator as CustomPromptCreator).resetPromptFields();
    }
  }

  private handleUpdateGenerationSettings(e: CustomEvent<any>) {
    const settings = e.detail;
    for (const key in settings) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
            (this as any)[key] = settings[key];
        }
    }
    this.dispatchEvent(new CustomEvent('generation-settings-changed', {
        detail: {
            temperature: this.temperature,
            guidance: this.guidance,
            topK: this.topK,
            seed: this.seed,
            bpm: this.bpm,
            density: this.density,
            brightness: this.brightness,
            scale: this.scale,
            musicGenerationMode: this.musicGenerationMode,
        },
        bubbles: true,
        composed: true,
    }));
  }

  private reDispatch(e: Event) {
    this.dispatchEvent(new CustomEvent(e.type, { detail: (e as CustomEvent).detail }));
  }

  private renderEqualizerIcon() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M10 20H14V4H10V20ZM4 20H8V12H4V20ZM16 20H20V7H16V20Z"></path>
      </svg>
    `;
  }

  override render() {
    const bg = styleMap({
      backgroundImage: this.makeBackground(),
    });

    const promptToEdit = this.editingPromptId ? this.prompts.get(this.editingPromptId) : null;

    return html`
      <div id="background" style=${bg}></div>
      <div id="header">
        <img src="/logow.png" alt="Logo" class="header-logo">
        <span class="app-title">Milymix</span>
        <button class="header-button" @click=${this.handleEqualizerToggle} title="Graphic Equalizer">
          ${this.renderEqualizerIcon()}
        </button>
      </div>

      <div id="main-area">
        <!-- Main "Select Style" Accordion -->
        <div class="accordion-item ${this.showSelectStyleAccordion ? 'active' : ''}">
          <button class="accordion-header" @click=${this.handleMainAccordionToggle}>
            <span>Выбрать стиль</span>
            <span class="chevron">${this.showSelectStyleAccordion ? '−' : '+'}</span>
          </button>
          <div class="accordion-content">
            <div id="accordions" @edit-prompt=${this.handleEditPromptRequest}>
              ${this.renderCategoriesAsSections()}
            </div>
          </div>
        </div>

        <!-- Панель создания пользовательских стилей -->
        <div class="accordion-item ${this.showCustomCreator ? 'active' : ''}">
          <button class="accordion-header" @click=${() => this.showCustomCreator = !this.showCustomCreator}>
            <span>Создать свой стиль</span>
            <span class="chevron">${this.showCustomCreator ? '−' : '+'}</span>
          </button>
          <div class="accordion-content">
            <custom-prompt-creator 
              @create-custom-prompt=${this.handleCreateCustomPrompt}
              @update-generation-settings=${this.handleUpdateGenerationSettings}
              .temperature=${this.temperature}
              .guidance=${this.guidance}
              .topK=${this.topK}
              .seed=${this.seed}
              .bpm=${this.bpm}
              .density=${this.density}
              .densityAuto=${this.densityAuto}
              .brightness=${this.brightness}
              .brightnessAuto=${this.brightnessAuto}
              .scale=${this.scale}
              .musicGenerationMode=${this.musicGenerationMode}
            ></custom-prompt-creator>
          </div>
        </div>
      </div>

      <div id="editing-prompt-display" class=${classMap({ 'showing': !!this.editingPromptId })}>
        <span>${this.currentEditingPromptText}</span>
      </div>

      <!-- Перемещенный блок now-playing-container -->
      <div id="now-playing-container">
        <active-prompts-display
          .prompts=${this.prompts}
          .audioLevel=${this.audioLevel}
          @edit-prompt=${this.handleEditPromptRequest}
          @weight-changed=${this.handleActivePromptWeightChange}
        ></active-prompts-display>
        
        <div class="master-controls-bottom">
          <div class="master-volume-horizontal-control">
            <span class="master-volume-label">Volume</span>
            <horizontal-slider
              .value=${this.masterVolume * 2}
              @input=${this.handleMasterVolumeChange}
            ></horizontal-slider>
          </div>
        </div>
      </div>

      <div id="footer">
        <chat-assistant @submit-prompt=${this.handleAssistantPrompt}></chat-assistant>
        <play-pause-button .playbackState=${this.playbackState} @click=${this.playPause}></play-pause-button>
      </div>
      <preset-manager
        .showing=${this.showPresetManager}
        .currentPrompts=${this.getCurrentPromptsAsObject()}
        @close=${() => this.showPresetManager = false}
        @load-preset=${this.handleLoadPreset}
      >
      </preset-manager>
      <volume-editor
        .showing=${!!promptToEdit}
        .weight=${this.editorWeight}
        .color=${promptToEdit?.color || '#fff'}
        .text=${promptToEdit?.text || ''}
        .audioLevel=${this.audioLevel}
        @weight-changed=${this.handleEditorWeightChange}
        @close-editor=${this.saveAndCloseEditor}
      >
      </volume-editor>

      <!-- Equalizer Modal -->
      <div class=${classMap({ 'equalizer-scrim': true, 'showing': this.showEqualizer })} @click=${this.handleEqualizerToggle}>
        <div class="equalizer-modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="equalizer-modal-header">
            <h2>Graphic Equalizer</h2>
            <button class="equalizer-close-button" @click=${this.handleEqualizerToggle}>✕</button>
          </div>
          <master-controls @eq-changed=${this.reDispatch}></master-controls>
        </div>
      </div>
      `;
  }

  // Modified to render categories as simple sections, not accordions
  private renderCategoriesAsSections() {
    return this.promptCategories.map(category => {
      return html`
        <div class="category-section">
          <h3 class="category-title">${category.name}</h3>
          <div class="accordion-grid">
            ${this.renderPromptsForCategory(category)}
          </div>
        </div>
      `;
    });
  }

  private renderPromptsForCategory(category: PromptCategory) {
    return category.prompts.map(prompt => {
      if (!prompt) return html``;
      return html`<prompt-controller
        promptId=${prompt.promptId}
        ?filtered=${this.filteredPrompts.has(prompt.text)}
        ?active=${this.editingPromptId === prompt.promptId}
        text=${prompt.text}
        weight=${prompt.weight}
        color=${prompt.color}>
      </prompt-controller>`;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompt-dj-midi': PromptDjMidi;
  }
}