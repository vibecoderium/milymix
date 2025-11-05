/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './WeightKnob'; // Используем существующий компонент ручки

@customElement('custom-prompt-creator')
export class CustomPromptCreator extends LitElement {
    static override styles = css`
        :host {
            display: block;
            padding: 2vmin;
            box-sizing: border-box;
            width: 100%;
        }
        .creator-form {
            display: flex;
            flex-direction: column;
            gap: 2.5vmin;
            align-items: center;
        }
        .main-input-row {
            display: flex;
            gap: 1.5vmin;
            width: 100%;
            align-items: center;
        }
        input[type="text"] {
            flex-grow: 1;
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
        }
        input[type="color"]::-webkit-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        input[type="color"]::-moz-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2vmin;
            width: 100%;
        }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.8vmin;
        }
        .input-group label {
            font-size: 1.4vmin;
            color: #aaa;
            font-weight: 500;
            margin-left: 0.5vmin;
        }
        .knob-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1vmin;
        }
        volume-knob {
            width: 15vmin;
            max-width: 120px;
        }
        .label {
            font-size: 1.6vmin;
            color: #ccc;
            font-weight: 500;
        }
        .add-button {
            padding: 1.2vmin 2.5vmin;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            background: #3c8ce4;
            color: #fff;
            font-weight: 600;
            font-size: 1.8vmin;
            margin-top: 1vmin;
        }
    `;

    @state() private text = '';
    @state() private color = '#ffffff';
    @state() private weight = 0;
    @state() private mood = '';
    @state() private characteristics = '';
    @state() private tempo = '';

    private handleAdd() {
        if (!this.text.trim()) {
            alert('Пожалуйста, введите основной стиль.');
            return;
        }

        const promptParts = [
            this.text.trim(),
            this.mood.trim(),
            this.characteristics.trim(),
            this.tempo.trim()
        ].filter(part => part !== ''); // Отфильтровываем пустые поля

        const finalText = promptParts.join(', ');

        this.dispatchEvent(new CustomEvent('create-custom-prompt', {
            detail: {
                text: finalText,
                color: this.color,
                weight: this.weight,
            },
            bubbles: true,
            composed: true,
        }));
    }

    public reset() {
        this.text = '';
        this.color = '#ffffff';
        this.weight = 0;
        this.mood = '';
        this.characteristics = '';
        this.tempo = '';
    }

    override render() {
        return html`
            <div class="creator-form">
                <div class="main-input-row">
                    <input 
                        type="text" 
                        placeholder="Основной стиль (напр., Techno, Piano)"
                        .value=${this.text}
                        @input=${(e: InputEvent) => this.text = (e.target as HTMLInputElement).value}
                    >
                    <input 
                        type="color" 
                        title="Выбрать цвет"
                        .value=${this.color}
                        @input=${(e: InputEvent) => this.color = (e.target as HTMLInputElement).value}
                    >
                </div>

                <div class="details-grid">
                    <div class="input-group">
                        <label for="mood-input">Настроение</label>
                        <input 
                            id="mood-input"
                            type="text" 
                            placeholder="напр., мрачное, энергичное"
                            .value=${this.mood}
                            @input=${(e: InputEvent) => this.mood = (e.target as HTMLInputElement).value}
                        >
                    </div>
                    <div class="input-group">
                        <label for="char-input">Характеристики</label>
                        <input 
                            id="char-input"
                            type="text" 
                            placeholder="напр., тяжелый бас, арпеджио"
                            .value=${this.characteristics}
                            @input=${(e: InputEvent) => this.characteristics = (e.target as HTMLInputElement).value}
                        >
                    </div>
                    <div class="input-group">
                        <label for="tempo-input">Темп (BPM)</label>
                        <input 
                            id="tempo-input"
                            type="text" 
                            placeholder="напр., 120 bpm, быстрый"
                            .value=${this.tempo}
                            @input=${(e: InputEvent) => this.tempo = (e.target as HTMLInputElement).value}
                        >
                    </div>
                </div>

                <div class="knob-container">
                    <span class="label">Громкость (Вес)</span>
                    <volume-knob
                        .value=${this.weight}
                        .color=${this.color}
                        @input=${(e: CustomEvent<number>) => this.weight = e.detail}
                    ></volume-knob>
                </div>
                <button class="add-button" @click=${this.handleAdd}>Добавить в микс</button>
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-prompt-creator': CustomPromptCreator;
  }
}