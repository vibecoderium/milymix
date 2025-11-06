/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './WeightKnob'; // Используем существующий компонент ручки

@customElement('custom-prompt-creator')
export class CustomPromptCreator extends LitElement {
    static override styles = css`
        :host {
            display: block;
            box-sizing: border-box;
            width: 100%;
        }
        .creator-form {
            display: flex;
            flex-direction: column;
            gap: 2.5vmin;
            align-items: center;
        }
        .prompt-creation-controls {
            display: flex;
            align-items: center;
            gap: 1.5vmin;
            width: 100%;
            justify-content: center;
        }
        .input-label {
            font-size: 1.6vmin;
            color: #ccc;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .knob-and-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5vmin;
            flex-shrink: 0;
        }
        .knob-and-label volume-knob {
            width: 16vmin;
            height: 16vmin;
            max-width: 120px;
            max-height: 120px;
        }
        .knob-and-label .label {
            font-size: 1.2vmin;
            white-space: nowrap;
        }
        input[type="text"] {
            width: 40%;
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
            flex-shrink: 0;
        }
        input[type="color"]::-webkit-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        input[type="color"]::-moz-color-swatch {
            border-radius: 50%;
            border: 2px solid #fff;
        }
        .action-row {
            display: flex;
            align-items: center;
            gap: 1.5vmin;
            width: 100%;
            justify-content: center;
            margin-top: 1vmin;
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
        }
    `;

    // Prompt creation states
    @property({ type: String }) text = '';
    @property({ type: String }) color = '#ffffff';
    @property({ type: Number }) weight = 0;

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
        this.resetPromptFields();
    }

    public reset() {
        this.resetPromptFields();
    }

    public resetPromptFields() {
        this.text = '';
        this.color = '#ffffff';
        this.weight = 0;
    }

    override render() {
        return html`
            <div class="creator-form">
                <div class="prompt-creation-controls">
                    <label class="input-label">Название</label>
                    <input 
                        type="text" 
                        placeholder="напр., Techno, Piano"
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
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-prompt-creator': CustomPromptCreator;
  }
}