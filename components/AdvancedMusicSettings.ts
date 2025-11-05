/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import './HorizontalSlider'; // Assuming this is the slider component

@customElement('advanced-music-settings')
export class AdvancedMusicSettings extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      background-color: rgba(20, 20, 20, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5vmin;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1vmin;
      cursor: pointer;
    }
    .settings-title {
      font-size: clamp(14px, 2vh, 18px);
      font-weight: 500;
      color: #fff;
    }
    .chevron {
      font-size: clamp(16px, 2.5vh, 20px);
      font-weight: 300;
      color: rgba(255, 255, 255, 0.7);
    }
    .settings-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2vmin;
      padding-top: 1vmin;
      max-height: 0;
      opacity: 0;
      visibility: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-in-out, visibility 0.4s;
    }
    :host(.expanded) .settings-content {
      max-height: 500px; /* Sufficiently large value */
      opacity: 1;
      visibility: visible;
    }
    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 0.5vmin;
    }
    .setting-label {
      font-size: 1.2vmin;
      color: #aaa;
      text-transform: uppercase;
      font-weight: 500;
    }
    .slider-with-value {
      display: flex;
      align-items: center;
      gap: 1vmin;
    }
    .slider-value {
      font-size: 1.2vmin;
      color: #fff;
      min-width: 30px;
      text-align: right;
    }
    input[type="text"] {
      padding: 0.5vmin 1vmin;
      border-radius: 4px;
      border: 1px solid #555;
      background: #333;
      color: #fff;
      font-size: 1.2vmin;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5vmin;
      font-size: 1.2vmin;
      color: #fff;
    }
    input[type="checkbox"] {
      width: 1.5vmin;
      height: 1.5vmin;
      accent-color: #6a0dad; /* Purple accent */
    }
    select {
      padding: 0.5vmin 1vmin;
      border-radius: 4px;
      border: 1px solid #555;
      background: #333;
      color: #fff;
      font-size: 1.2vmin;
      appearance: none; /* Remove default arrow */
      -webkit-appearance: none;
      background-image: url('data:image/svg+xml;utf8,<svg fill="%23fff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
      background-repeat: no-repeat;
      background-position: right 0.5vmin center;
      background-size: 1.5vmin;
      padding-right: 2.5vmin; /* Make space for the custom arrow */
    }
  `;

  @property({ type: Boolean, reflect: true }) expanded = false;

  @property({ type: Number }) temperature = 1.1;
  @property({ type: Number }) guidance = 4.0;
  @property({ type: Number }) topK = 40;
  @property({ type: Number }) density = 0.5;
  @property({ type: Boolean }) densityAuto = true;
  @property({ type: Number }) brightness = 0.5;
  @property({ type: Boolean }) brightnessAuto = true;
  @property({ type: String }) seed = 'Auto';
  @property({ type: String }) bpm = 'Auto';
  @property({ type: String }) scale = 'Auto'; // 'Auto', 'Major', 'Minor', etc.
  @property({ type: String }) musicGenerationMode = 'Quality'; // 'Quality', 'Speed'
  @property({ type: Boolean }) muteBass = false;
  @property({ type: Boolean }) muteDrums = false;
  @property({ type: Boolean }) onlyBassAndDrums = false;

  private toggleExpanded() {
    this.expanded = !this.expanded;
  }

  private dispatchChange(settingName: string, value: any) {
    this.dispatchEvent(new CustomEvent('settings-changed', {
      detail: { settingName, value },
      bubbles: true,
      composed: true,
    }));
  }

  private handleSliderInput(settingName: string, e: CustomEvent<number>) {
    this.dispatchChange(settingName, e.detail);
  }

  private handleTextInput(settingName: string, e: Event) {
    this.dispatchChange(settingName, (e.target as HTMLInputElement).value);
  }

  private handleCheckboxChange(settingName: string, e: Event) {
    this.dispatchChange(settingName, (e.target as HTMLInputElement).checked);
  }

  private handleSelectChange(settingName: string, e: Event) {
    this.dispatchChange(settingName, (e.target as HTMLSelectElement).value);
  }

  override render() {
    return html`
      <div class="settings-header" @click=${this.toggleExpanded}>
        <span class="settings-title">Расширенные настройки музыки</span>
        <span class="chevron">${this.expanded ? '−' : '+'}</span>
      </div>
      <div class="settings-content ${classMap({ expanded: this.expanded })}">
        <div class="setting-group">
          <span class="setting-label">Температура</span>
          <div class="slider-with-value">
            <horizontal-slider
              min="0" max="2" step="0.01"
              .value=${this.temperature}
              @input=${(e: CustomEvent<number>) => this.handleSliderInput('temperature', e)}
            ></horizontal-slider>
            <span class="slider-value">${this.temperature.toFixed(1)}</span>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Руководство</span>
          <div class="slider-with-value">
            <horizontal-slider
              min="0" max="10" step="0.1"
              .value=${this.guidance}
              @input=${(e: CustomEvent<number>) => this.handleSliderInput('guidance', e)}
            ></horizontal-slider>
            <span class="slider-value">${this.guidance.toFixed(1)}</span>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Топ K</span>
          <div class="slider-with-value">
            <horizontal-slider
              min="1" max="100" step="1"
              .value=${this.topK}
              @input=${(e: CustomEvent<number>) => this.handleSliderInput('topK', e)}
            ></horizontal-slider>
            <span class="slider-value">${this.topK.toFixed(0)}</span>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Плотность</span>
          <div class="slider-with-value">
            <horizontal-slider
              min="0" max="1" step="0.01"
              .value=${this.density}
              .disabled=${this.densityAuto}
              @input=${(e: CustomEvent<number>) => this.handleSliderInput('density', e)}
            ></horizontal-slider>
            <span class="slider-value">${this.density.toFixed(2)}</span>
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked=${this.densityAuto}
              @change=${(e: Event) => this.handleCheckboxChange('densityAuto', e)}
            />
            <span>Авто</span>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Яркость</span>
          <div class="slider-with-value">
            <horizontal-slider
              min="0" max="1" step="0.01"
              .value=${this.brightness}
              .disabled=${this.brightnessAuto}
              @input=${(e: CustomEvent<number>) => this.handleSliderInput('brightness', e)}
            ></horizontal-slider>
            <span class="slider-value">${this.brightness.toFixed(2)}</span>
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked=${this.brightnessAuto}
              @change=${(e: Event) => this.handleCheckboxChange('brightnessAuto', e)}
            />
            <span>Авто</span>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Начальное зерно</span>
          <input
            type="text"
            .value=${this.seed}
            @input=${(e: Event) => this.handleTextInput('seed', e)}
            placeholder="Авто"
          />
        </div>

        <div class="setting-group">
          <span class="setting-label">BPM</span>
          <input
            type="text"
            .value=${this.bpm}
            @input=${(e: Event) => this.handleTextInput('bpm', e)}
            placeholder="Авто"
          />
        </div>

        <div class="setting-group">
          <span class="setting-label">Гамма</span>
          <select
            .value=${this.scale}
            @change=${(e: Event) => this.handleSelectChange('scale', e)}
          >
            <option value="Auto">Авто</option>
            <option value="Major">Мажор</option>
            <option value="Minor">Минор</option>
            <option value="Pentatonic">Пентатоника</option>
            <option value="Blues">Блюз</option>
          </select>
        </div>

        <div class="setting-group">
          <span class="setting-label">Режим генерации</span>
          <select
            .value=${this.musicGenerationMode}
            @change=${(e: Event) => this.handleSelectChange('musicGenerationMode', e)}
          >
            <option value="Quality">Качество</option>
            <option value="Speed">Скорость</option>
          </select>
        </div>

        <div class="setting-group">
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked=${this.muteBass}
              @change=${(e: Event) => this.handleCheckboxChange('muteBass', e)}
            />
            <span>Отключить бас</span>
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked=${this.muteDrums}
              @change=${(e: Event) => this.handleCheckboxChange('muteDrums', e)}
            />
            <span>Отключить ударные</span>
          </div>
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked=${this.onlyBassAndDrums}
              @change=${(e: Event) => this.handleCheckboxChange('onlyBassAndDrums', e)}
            />
            <span>Только бас и ударные</span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'advanced-music-settings': AdvancedMusicSettings;
  }
}