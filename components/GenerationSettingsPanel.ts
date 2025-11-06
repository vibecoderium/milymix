/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('generation-settings-panel')
export class GenerationSettingsPanel extends LitElement {
    static override styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .settings-accordion-item {
            width: 100%;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background-color: rgba(20, 20, 20, 0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            flex-shrink: 0;
        }
        .settings-accordion-header {
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
        .settings-chevron {
            font-size: clamp(16px, 2.5vh, 20px);
            font-weight: 300;
            color: rgba(255, 255, 255, 0.7);
            transition: transform 0.3s ease-in-out;
        }
        .settings-accordion-item.active .settings-chevron {
            transform: rotate(180deg);
        }
        .settings-accordion-content {
            overflow: hidden;
            transition: opacity 0.4s ease-in-out, max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            opacity: 0;
            height: 0;
            max-height: 0px;
            visibility: hidden;
            padding: 0 1.5vmin 1.5vmin 1.5vmin;
        }
        .settings-accordion-item.active .settings-accordion-content {
            opacity: 1;
            visibility: visible;
            height: auto;
            max-height: 9999px;
        }
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2vmin;
            width: 100%;
        }
        .setting-group {
            display: flex;
            flex-direction: column;
            gap: 0.8vmin;
        }
        .setting-label {
            font-size: 1.4vmin;
            color: #aaa;
            font-weight: 500;
            margin-left: 0.5vmin;
        }
        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            background: #333;
            outline: none;
            border-radius: 4px;
            border: 1px solid #555;
            cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 2vmin;
            height: 2vmin;
            background: #8a2be2;
            cursor: pointer;
            border-radius: 50%;
            border: 1px solid #fff;
        }
        input[type="range"]::-moz-range-thumb {
            width: 2vmin;
            height: 2vmin;
            background: #8a2be2;
            cursor: pointer;
            border-radius: 50%;
            border: 1px solid #fff;
        }
        select {
            padding: 1vmin;
            border-radius: 4px;
            border: 1px solid #555;
            background: #333;
            color: #fff;
            font-size: 1.6vmin;
            width: 100%;
            box-sizing: border-box;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13.2-5.4H18.6c-5%200-9.3%201.8-13.2%205.4A17.6%2017.6%200%200%200%200%2082.6c0%204.8%201.8%209.3%205.4%2013.2l128%20128c3.9%203.9%208.4%205.4%2013.2%205.4s9.3-1.8%2013.2-5.4l128-128c3.9%203.9%205.4-8.4%205.4-13.2%200-4.8-1.8-9.3-5.4-13.2z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat;
            background-position: right 0.8em center;
            background-size: 0.8em auto;
            padding-right: 2.5em;
        }
        input[type="text"] {
            width: 100%;
            padding: 1.2vmin;
            border-radius: 4px;
            border: 1px solid #555;
            background: #333;
            color: #fff;
            font-size: 1.6vmin;
            box-sizing: border-box;
        }
        .slider-with-value {
            display: flex;
            align-items: center;
            gap: 1vmin;
        }
        .slider-value {
            font-size: 1.4vmin;
            color: #fff;
            min-width: 3vmin;
            text-align: right;
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5vmin;
            margin-top: 0.5vmin;
        }
        .checkbox-group input[type="checkbox"] {
            width: 1.5vmin;
            height: 1.5vmin;
            accent-color: #8a2be2;
        }
        .checkbox-group label {
            font-size: 1.2vmin;
            color: #ccc;
        }
    `;

    @property({ type: Number }) temperature = 1.1;
    @property({ type: Number }) guidance = 4.0;
    @property({ type: Number }) topK = 40;
    @property({ type: String }) seed = 'Auto';
    @property({ type: String }) bpm = 'Auto';
    @property({ type: Number }) density = 0.50;
    @property({ type: Boolean }) densityAuto = true;
    @property({ type: Number }) brightness = 0.50;
    @property({ type: Boolean }) brightnessAuto = true;
    @property({ type: String }) scale = 'Auto';
    @property({ type: String }) musicGenerationMode = 'Quality';

    @state() private showSettings = false;

    private scaleOptions = [
        'Auto', 'C Major / A Minor', 'C# Major / A# Minor', 'D Major / B Minor',
        'D# Major / C Minor', 'E Major / C# Minor', 'F Major / D Minor',
        'F# Major / D# Minor', 'G Major / E Minor', 'G# Major / F Minor',
        'A Major / F# Minor', 'A# Major / G Minor', 'B Major / G# Minor'
    ];

    private musicGenerationModeOptions = ['Quality', 'Diversity', 'Vocalization'];

    private dispatchSettingChange(propertyName: string, value: any) {
        this.dispatchEvent(new CustomEvent('setting-changed', {
            detail: { [propertyName]: value },
            bubbles: true,
            composed: true,
        }));
    }

    private handleSliderInput(e: Event, propertyName: string) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.dispatchSettingChange(propertyName, value);
    }

    private handleTextInput(e: Event, propertyName: string) {
        const value = (e.target as HTMLInputElement).value;
        this.dispatchSettingChange(propertyName, value);
    }

    private handleSelectInput(e: Event, propertyName: string) {
        const value = (e.target as HTMLSelectElement).value;
        this.dispatchSettingChange(propertyName, value);
    }

    private handleCheckboxChange(e: Event, propertyName: string, sliderPropertyName: string) {
        const checked = (e.target as HTMLInputElement).checked;
        this.dispatchSettingChange(propertyName, checked);
        if (checked) {
            if (sliderPropertyName === 'density') {
                this.dispatchSettingChange('density', 0.50);
            }
            if (sliderPropertyName === 'brightness') {
                this.dispatchSettingChange('brightness', 0.50);
            }
        }
    }

    override render() {
        return html`
            <div class=${classMap({ 'settings-accordion-item': true, 'active': this.showSettings })}>
                <button class="settings-accordion-header" @click=${() => this.showSettings = !this.showSettings}>
                    <span>Настройки генерации</span>
                    <span class="settings-chevron">${this.showSettings ? '−' : '+'}</span>
                </button>
                <div class="settings-accordion-content">
                    <div class="settings-grid">
                        <div class="setting-group">
                            <label class="setting-label">Температура</label>
                            <div class="slider-with-value">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2.0"
                                    step="0.1"
                                    .value=${this.temperature}
                                    @input=${(e: Event) => this.handleSliderInput(e, 'temperature')}
                                />
                                <span class="slider-value">${this.temperature.toFixed(1)}</span>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Направляющая</label>
                            <div class="slider-with-value">
                                <input
                                    type="range"
                                    min="0.0"
                                    max="10.0"
                                    step="0.1"
                                    .value=${this.guidance}
                                    @input=${(e: Event) => this.handleSliderInput(e, 'guidance')}
                                />
                                <span class="slider-value">${this.guidance.toFixed(1)}</span>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Top K</label>
                            <div class="slider-with-value">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    step="1"
                                    .value=${this.topK}
                                    @input=${(e: Event) => this.handleSliderInput(e, 'topK')}
                                />
                                <span class="slider-value">${this.topK}</span>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Seed</label>
                            <input
                                type="text"
                                placeholder="Auto"
                                .value=${this.seed}
                                @input=${(e: Event) => this.handleTextInput(e, 'seed')}
                            />
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">BPM</label>
                            <input
                                type="text"
                                placeholder="Auto"
                                .value=${this.bpm}
                                @input=${(e: Event) => this.handleTextInput(e, 'bpm')}
                            />
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Плотность</label>
                            <div class="slider-with-value">
                                <input
                                    type="range"
                                    min="0.0"
                                    max="1.0"
                                    step="0.01"
                                    .value=${this.density}
                                    ?disabled=${this.densityAuto}
                                    @input=${(e: Event) => this.handleSliderInput(e, 'density')}
                                />
                                <span class="slider-value">${this.density.toFixed(2)}</span>
                            </div>
                            <div class="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="densityAuto"
                                    .checked=${this.densityAuto}
                                    @change=${(e: Event) => this.handleCheckboxChange(e, 'densityAuto', 'density')}
                                />
                                <label for="densityAuto">Авто</label>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Яркость</label>
                            <div class="slider-with-value">
                                <input
                                    type="range"
                                    min="0.0"
                                    max="1.0"
                                    step="0.01"
                                    .value=${this.brightness}
                                    ?disabled=${this.brightnessAuto}
                                    @input=${(e: Event) => this.handleSliderInput(e, 'brightness')}
                                />
                                <span class="slider-value">${this.brightness.toFixed(2)}</span>
                            </div>
                            <div class="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="brightnessAuto"
                                    .checked=${this.brightnessAuto}
                                    @change=${(e: Event) => this.handleCheckboxChange(e, 'brightnessAuto', 'brightness')}
                                />
                                <label for="brightnessAuto">Авто</label>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Гамма</label>
                            <select
                                .value=${this.scale}
                                @change=${(e: Event) => this.handleSelectInput(e, 'scale')}
                            >
                                ${map(this.scaleOptions, (option) => html`
                                    <option value=${option}>${option}</option>
                                `)}
                            </select>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label">Режим генерации музыки</label>
                            <select
                                .value=${this.musicGenerationMode}
                                @change=${(e: Event) => this.handleSelectInput(e, 'musicGenerationMode')}
                            >
                                ${map(this.musicGenerationModeOptions, (option) => html`
                                    <option value=${option}>${option}</option>
                                `)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'generation-settings-panel': GenerationSettingsPanel;
  }
}