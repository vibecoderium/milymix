/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

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
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      position: relative;
      /* Обновленные отступы для учета новой высоты шапки */
      padding: 9vmin 1.5vmin 10vmin 1.5vmin; 
      gap: 1.5vmin;
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
      width: 100vw; /* Полная ширина экрана */
      height: 9vmin; /* Увеличена высота на 20% (было 7.5vmin, стало 9vmin) */
      display: flex;
      /* justify-content: space-between; */ /* Убрано, чтобы элементы не раздвигались */
      align-items: center;
      gap: 1.5vmin; /* Добавлен отступ между элементами в шапке */
      z-index: 10;
      flex-shrink: 0;
      background-color: rgba(20, 20, 20, 0.7);
      border: none; /* Убираем рамку */
      border-radius: 0; /* Убираем скругление углов */
      padding: 0 1.5vmin; /* Убираем вертикальные отступы, оставляем горизонтальные */
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .header-logo {
      height: calc(100% - 6px); /* Корректируем высоту для учета 3px верхнего и нижнего отступа */
      object-fit: contain; /* Сохраняет пропорции и вписывает изображение */
      padding: 3px; /* 3px отступ со всех сторон */
      /* margin-left: -1.5vmin; */ /* Убран отрицательный отступ, чтобы логотип использовал padding шапки */
    }
    .app-title {
      /* flex-grow: 1; */ /* Убрано, чтобы название не занимало все доступное пространство */
      /* text-align: center; */ /* Убрано, так как теперь оно будет выравниваться по flex-контейнеру */
      color: #fff;
      font-size: clamp(18px, 3vmin, 28px); /* Адаптивный размер шрифта */
      font-weight: 600;
      white-space: nowrap; /* Предотвращает перенос текста */
      overflow: hidden; /* Скрывает переполнение, если текст слишком длинный */
      text-overflow: ellipsis; /* Добавляет многоточие, если текст скрыт */
    }
    #accordions {
      width: 100%;
      height: 100%;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 1vmin;
      overflow: hidden;
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
    }
    .accordion-item.active {
      flex-grow: 1;
      flex-shrink: 1;
    }
    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5vh 2vw;
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
    }
    .accordion-content {
      overflow: hidden;
      transition: opacity 0.4s ease-in-out, max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      opacity: 0;
      height: 100%;
      max-height: 0;
      visibility: hidden;
    }
    .accordion-item.active .accordion-content {
      opacity: 1;
      visibility: visible;
      max-height: 100vh;
    }
    .accordion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11vmin, 1fr));
      gap: 1vmin;
      height: 100%;
      padding: 0 1.5vmin 1.5vmin 1.5vmin;
      box-sizing: border-box;
    }
    #now-playing-container {
      width: 100%;
      display: flex;
      flex-direction: column; /* Основное направление - колонка */
      gap: 1.5vmin;
      flex-shrink: 0;
      z-index: 5;
      /* min-height: 15vmin; */ /* Удалена минимальная высота */
      justify-content: flex-end;
    }
    .active-prompts-wrapper { /* Новый класс для обертки активных промптов */
      width: 100%;
      background-color: rgba(20, 20, 20, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5vmin;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .master-controls-bottom { /* Новый класс для контейнера громкости и сохранения */
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
    .master-volume-horizontal-control { /* Новый класс для горизонтального слайдера */
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center; /* Выравнивание текста по центру */
      gap: 0.5vmin;
    }
    .master-volume-label {
      font-size: 4.8vmin; /* Увеличен в 4 раза (1.2vmin * 4) */
      font-weight: 500;
      color: #fff;
      text-align: center; /* Выравнивание текста по центру */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .save-icon-wrapper { /* Обертка для значка сохранения */
      display: flex;
      align-items: center;
      justify-content: flex-end; /* Прижимаем к правому краю */
      flex-shrink: 0;
    }
    #footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 1.5vmin;
      z-index: 100;
      padding: 0.75vmin;
      box-sizing: border-box;
      background-color: rgba(20, 20, 20, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    play-pause-button {
      width: 9vmin;
      max-width: 55px;
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
  @state() private activeCategory: string | null = null;
  @state() private showEqualizer = false;
  @state() private showCustomCreator = false; // Состояние для нового аккордеона
  @state() private masterVolume = 0.8; // Новое состояние для общей громкости

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

  private handleAccordionToggle(categoryName: string) {
    this.activeCategory = this.activeCategory === categoryName ? null : categoryName;
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
    
    // Safeguard against non-finite values from the slider
    if (typeof sliderValue !== 'number' || isNaN(sliderValue) || !isFinite(sliderValue)) {
      console.error('Received non-finite or invalid volume detail from slider:', e.detail);
      sliderValue = 1.6; // Fallback to a safe default slider value (0.8 * 2)
    }

    // Convert slider's 0-2 range to LiveMusicHelper's 0-1 range
    // And ensure it's clamped between 0 and 1
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

    const creator = this.shadowRoot?.querySelector('custom-prompt-creator');
    if (creator) {
        (creator as CustomPromptCreator).reset();
    }

    this.showCustomCreator = false;
  }

  private reDispatch(e: Event) {
    this.dispatchEvent(new CustomEvent(e.type, { detail: (e as CustomEvent).detail }));
  }

  override render() {
    const bg = styleMap({
      backgroundImage: this.makeBackground(),
    });

    const promptToEdit = this.editingPromptId ? this.prompts.get(this.editingPromptId) : null;

    // Отладочный вывод для проверки пути к логотипу
    console.log('Rendering PromptDjMidi. Logo src:', '/logow.png');

    return html`
      <div id="background" style=${bg}></div>
      <div id="header">
        <img src="/logow.png" alt="Logo" class="header-logo">
        <span class="app-title">Milymix</span>
        <!-- <profile-header
          style="margin-left: auto;"
          @toggle-presets=${() => (this.showPresetManager = !this.showPresetManager)}
          @open-settings=${() => console.log('Settings button clicked')}
        ></profile-header> -->
      </div>
      <div id="accordions" @edit-prompt=${this.handleEditPromptRequest}>
        ${this.renderAccordions()}
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
          ></custom-prompt-creator>
        </div>
      </div>

      <div id="now-playing-container">
        <div class="active-prompts-wrapper">
          <active-prompts-display
            .prompts=${this.prompts}
            .audioLevel=${this.audioLevel}
            @edit-prompt=${this.handleEditPromptRequest}
            @weight-changed=${this.handleActivePromptWeightChange}
          ></active-prompts-display>
        </div>
        
        <div class="master-controls-bottom">
          <div class="master-volume-horizontal-control">
            <span class="master-volume-label">Volume</span>
            <horizontal-slider
              .value=${this.masterVolume * 2}
              @input=${this.handleMasterVolumeChange}
            ></horizontal-slider>
          </div>
          <!-- <div class="save-icon-wrapper">
            <save-icon></save-icon>
          </div> -->
        </div>
        
        <div class="accordion-item ${this.showEqualizer ? 'active' : ''}">
          <button class="accordion-header" @click=${this.handleEqualizerToggle}>
            <span>Graphic Equalizer</span>
            <span class="chevron">${this.showEqualizer ? '−' : '+'}</span>
          </button>
          <div class="accordion-content">
            <master-controls @eq-changed=${this.reDispatch}></master-controls>
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
      `;
  }

  private renderAccordions() {
    return this.promptCategories.map(category => {
      const isActive = this.activeCategory === category.name;
      return html`
        <div class="accordion-item ${isActive ? 'active' : ''}">
          <button class="accordion-header" @click=${() => this.handleAccordionToggle(category.name)}>
            <span>${category.name}</span>
            <span class="chevron">${isActive ? '−' : '+'}</span>
          </button>
          <div class="accordion-content">
            <div class="accordion-grid">
              ${this.renderPromptsForCategory(category)}
            </div>
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