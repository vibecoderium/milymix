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
            padding: 1.5vmin;
            box-sizing: border-box;
        }
        .creator-form {
            display: flex;
            flex-direction: column;
            gap: 2vmin;
            align-items: center;
        }
        .input-row {
            display: flex;
            gap: 1.5vmin;
            width: 100%;
            align-items: center;
        }
        input[type="text"] {
            flex-grow: 1;
            padding: 1vmin;
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
        .knob-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1vmin;
        }
        volume-knob {
            width: 15vmin;
            max-width: 100px;
        }
        .label {
            font-size: 1.4vmin;
            color: #ccc;
            font-weight: 500;
        }
        .add-button {
            padding: 1vmin 2vmin;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            background: #3c8ce4;
            color: #fff;
            font-weight: 600;
            font-size: 1.6vmin;
        }
    `;

    @state() private text = '';
    @state() private color = '#ffffff';
    @state() private weight = 0;

    private handleAdd() {
        if (!this.text.trim()) {
            alert('Пожалуйста, введите название для вашего стиля.');
            return;
        }
        this.dispatchEvent(new CustomEvent('create-custom-prompt', {
            detail: {
                text: this.text.trim(),
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
    }

    override render() {
        return html`
            <div class="creator-form">
                <div class="input-row">
                    <input 
                        type="text" 
                        placeholder="Название стиля или инструмента..."
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