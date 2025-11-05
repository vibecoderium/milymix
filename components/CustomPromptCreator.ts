/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js'; // Import map for dropdowns
import { classMap } from 'lit/directives/class-map.js'; // Import classMap for dynamic classes
import './WeightKnob'; // Используем существующий компонент ручки

@customElement('custom-prompt-creator')
export class CustomPromptCreator extends LitElement {
    static override styles = css`
        :host {
            display: block;
            /* padding: 1.5vmin; */ /* Удалено, теперь управляется родительским аккордеоном */
            box-sizing: border-box;
            width: 100%;
        }
        .creator-form {
            display: flex;
            flex-direction: column;
            gap: 2.5vmin;
            align-items: center;
        }
        .section-title {
            font-size: 1.8vmin;
            color: #fff;
            font-weight: 600;
            margin-top: 2vmin;
            margin-bottom: 1vmin;
            width: 100%;
            text-align: left;
            padding-left: 0.5vmin;
        }
        .prompt-creation-controls { /* Новый контейнер для компактной строки */
            display: flex;
            align-items: center;
            gap: 1.5vmin;
            width: 100%;
            justify-content: center; /* Центрируем элементы */
        }
        .name-input-wrapper { /* Обертка для метки и поля ввода названия */
            display: flex;
            align-items: center;
            gap: 0.8vmin; /* Отступ между меткой и полем ввода */
            flex-grow: 1; /* Позволяет занимать доступное пространство */
        }
        .name-input-wrapper .input-label {
            font-size: 1.4vmin; /* Размер метки */
            color: #aaa;
            font-weight: 500;
            white-space: nowrap; /* Предотвращает перенос текста метки */
        }
        .name-input-wrapper input[type="text"] { /* Поле ввода названия */
            flex-grow: 0; /* Не растягивается */
            flex-shrink: 0; /* Не сжимается */
            width: 50%; /* Сокращено в два раза относительно родительской обертки */
            padding: 1.2vmin;
            border-radius: 4px;
            border: 1px solid #555;
            background: #333;
            color: #fff;
            font-size: 1.6vmin;
        }
        input[type="color"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 5vmin;
            height: 5vmin;
            background-color: transparent;
            border: none;
            cursor: pointer;
            flex-shrink: 0; /* Предотвращаем сжатие */
        }
        input[type="color"]::-webkit-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        input[type="color"]::-moz-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        .knob-and-label { /* Контейнер для ручки и её метки */
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5vmin;
            flex-shrink: 0; /* Предотвращаем сжатие */
        }
        .knob-and-label volume-knob { /* Увеличиваем размер ручки в 2 раза */
            width: 16vmin; /* Было 8vmin */
            height: 16vmin; /* Было 8vmin */
            max-width: 120px; /* Было 60px */
            max-height: 120px; /* Было 60px */
        }
        .knob-and-label .label { /* Уменьшаем размер метки ручки */
            font-size: 1.2vmin;
            white-space: nowrap;
        }
        .add-button {
            padding: 1.2vmin 2.5vmin;
            border-radius: 44px;
            border: none;
            cursor: pointer;
            background: #3c8ce4;
            color: #fff;
            font-weight: 600;
            font-size: 1.8vmin;
        }
        .action-row { /* Новый стиль для строки с ручкой и кнопкой */
            display: flex;
            align-items: center;
            gap: 1.5vmin;
            width: 100%;
            justify-content: center; /* Центрируем элементы */
            margin-top: 1vmin; /* Отступ сверху */
        }
        /* Styles for sliders and selects */
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
            background: #8a2be2; /* Purple color for consistency */
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
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13.2-5.4H18.6c-5%200-9.3%201.8-13.2%205.4A17.6%2017.6%200%200%200%200%2082.6c0%204.8%201.8%209.3%205.4%2013.2l128%20128c3.9%203.9%208.4%205.4%2013.2%205.4s9.3-1.8%2013.2-5.4l128-128c3.9-3.9%205.4-8.4%205.4-13.2%200-4.8-1.8-9.3-5.4-13.2z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat;
            background-position: right 0.8em center;
            background-size: 0.8em auto;
            padding-right: 2.5em;
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

        /* Styles for the new collapsible settings section */
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
            margin-top: 2.5vmin; /* Отступ от кнопки "Добавить в микс" */
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
            height: auto;
            max-height: 0px;
            visibility: hidden;
            padding: 0 1.5vmin 1.5vmin 1.5vmin; /* Отступы для содержимого */
        }
        .settings-accordion-item.active .settings-accordion-content {
            opacity: 1;
            visibility: visible;
            max-height: 9999px; /* Большое значение для динамической высоты */
        }
    `;

    // Prompt creation states
    @property({ type: String }) text = '';
    @property({ type: String }) color = '#ffffff';
    @property({ type: Number }) weight = 0;

    // Generation settings states (with default values from screenshots)
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

    // State for the collapsible settings section
    @state() private showGenerationSettings = false; // Свернуто по умолчанию

    private scaleOptions = [
        'Auto', 'C Major / A Minor', 'C# Major / A# Minor', 'D Major / B Minor',
        'D# Major / C Minor', 'E Major / C# Minor', 'F Major / D Minor',
        'F# Major / D# Minor', 'G Major / E Minor', 'G# Major / F Minor',
        'A Major / F# Minor', 'A# Major / G Minor', 'B Major / G# Minor'
    ];

    private musicGenerationModeOptions = ['Quality', 'Diversity', 'Vocalization'];

    private handleAdd() {
        if (!this.text.trim()) {
            alert('Пожалуйста, введите название для вашего стиля.');
            return;
        }

        const finalText = this.text.trim();

        this.dispatchEvent(new CustomEvent('create-custom-prompt', {
            detail: {
                text: finalText,
                color: this.color,
                weight: this.weight,
            },
            bubbles: true,
            composed: true,
        }));
        this.resetPromptFields(); // Reset only prompt-specific fields
    }

    private dispatchGenerationSettingChange(propertyName: string, value: any) {
        this.dispatchEvent(new CustomEvent('update-generation-settings', {
            detail: { [propertyName]: value },
            bubbles: true,
            composed: true,
        }));
    }

    private handleSliderInput(e: Event, propertyName: string) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        (this as any)[propertyName] = value;
        this.dispatchGenerationSettingChange(propertyName, value);
    }

    private handleTextInput(e: Event, propertyName: string) {
        const value = (e.target as HTMLInputElement).value;
        (this as any)[propertyName] = value;
        this.dispatchGenerationSettingChange(propertyName, value);
    }

    private handleSelectInput(e: Event, propertyName: string) {
        const value = (e.target as HTMLSelectElement).value;
        (this as any)[propertyName] = value;
        this.dispatchGenerationSettingChange(propertyName, value);
    }

    private handleCheckboxChange(e: Event, propertyName: string, sliderPropertyName: string) {
        const checked = (e.target as HTMLInputElement).checked;
        (this as any)[propertyName] = checked;
        this.dispatchGenerationSettingChange(propertyName, checked);
        // If auto is checked, reset slider to default or a neutral value
        if (checked) {
            if (sliderPropertyName === 'density') {
                this.density = 0.50;
                this.dispatchGenerationSettingChange('density', 0.50);
            }
            if (sliderPropertyName === 'brightness') {
                this.brightness = 0.50;
                this.dispatchGenerationSettingChange('brightness', 0.50);
            }
        }
    }

    public reset() {
        this.resetPromptFields();
        this.resetGenerationSettings();
    }

    public resetPromptFields() { // Сделано публичным для вызова из PromptDjMidi
        this.text = '';
        this.color = '#ffffff';
        this.weight = 0;
    }

    private resetGenerationSettings() {
        this.temperature = 1.1;
        this.guidance = 4.0;
        this.topK = 40;
        this.seed = 'Auto';
        this.bpm = 'Auto';
        this.density = 0.50;
        this.densityAuto = true;
        this.brightness = 0.50;
        this.brightnessAuto = true;
        this.scale = 'Auto';
        this.musicGenerationMode = 'Quality';
        // Dispatch changes for all settings to ensure LiveMusicHelper is updated
        this.dispatchGenerationSettingChange('temperature', this.temperature);
        this.dispatchGenerationSettingChange('guidance', this.guidance);
        this.dispatchGenerationSettingChange('topK', this.topK);
        this.dispatchGenerationSettingChange('seed', this.seed);
        this.dispatchGenerationSettingChange('bpm', this.bpm);
        this.dispatchGenerationSettingChange('density', this.density);
        this.dispatchGenerationSettingChange('densityAuto', this.densityAuto);
        this.dispatchGenerationSettingChange('brightness', this.brightness);
        this.dispatchGenerationSettingChange('brightnessAuto', this.brightnessAuto);
        this.dispatchGenerationSettingChange('scale', this.scale);
        this.dispatchGenerationSettingChange('musicGenerationMode', this.musicGenerationMode);
    }

    override render() {
        return html`
            <div class="creator-form">
                <div class="prompt-creation-controls">
                    <div class="name-input-wrapper">
                        <label for="style-name-input" class="input-label">Название</label>
                        <input 
                            id="style-name-input"
                            type="text" 
                            placeholder="Название стиля (напр., Techno, Piano)"
                            .value=${this.text}
                            @input=${(e: InputEvent) => this.text = (e.target as HTMLInputElement).value}
                        >
                    </div>
                    <input 
                        type="color" 
                        title="Выбрать цвет"
                        .value=${this.color}
                        @input=${(e: InputEvent) => this.color = (e.target as HTMLInputElement).value}
                    >
                </div>
                <div class="action-row">
                    <div class="knob-and-label">
                        <span class="label">Громкость</span>
                        <volume-knob
                            .value=${this.weight}
                            .color=${this.color}
                            @input=${(e: CustomEvent<number>) => this.weight = e.detail}
                        ></volume-knob>
                    </div>
                    <button class="add-button" @click=${this.handleAdd}>Добавить в микс</button>
                </div>

                <div class=${classMap({ 'settings-accordion-item': true, 'active': this.showGenerationSettings })}>
                    <button class="settings-accordion-header" @click=${() => this.showGenerationSettings = !this.showGenerationSettings}>
                        <span>Настройки генерации</span>
                        <span class="settings-chevron">${this.showGenerationSettings ? '−' : '+'}</span>
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
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-prompt-creator': CustomPromptCreator;
  }
}