/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { Prompt } from '../types';
import './ActivePromptKnob'; // Импортируем новый компонент

@customElement('active-prompts-display')
// Fix: The class must extend LitElement to be a valid web component.
export class ActivePromptsDisplay extends LitElement {
    static override styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5vmin; /* Увеличен зазор между кружками */
            padding: 1.5vmin;
            min-height: 12vmin; /* Увеличена минимальная высота для размещения кружков */
            box-sizing: border-box;
            background-color: rgba(20, 20, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            align-items: center; /* Выравнивание по центру */
            justify-content: center; /* Выравнивание по центру */
        }
        .placeholder {
            color: #888;
            font-style: italic;
            font-size: 1.4vmin;
            align-self: center;
            padding-left: 0.5vmin;
        }
    `;

    @property({ attribute: false })
    prompts: Map<string, Prompt> = new Map();

    @property({ type: Number })
    audioLevel = 0; // Добавляем свойство audioLevel

    // Метод handleCardClick больше не нужен, так как ActivePromptKnob сам диспатчит событие

    override render() {
        const activePrompts = [...this.prompts.values()].filter(p => p.weight > 0);

        return html`
            <div class="container">
                ${activePrompts.length > 0
                    ? map(activePrompts, prompt => html`
                        <active-prompt-knob
                            promptId=${prompt.promptId}
                            text=${prompt.text}
                            weight=${prompt.weight}
                            color=${prompt.color}
                            .audioLevel=${this.audioLevel}
                        ></active-prompt-knob>
                    `)
                    : html`<span class="placeholder">No active prompts. Turn up a knob to start the music!</span>`
                }
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'active-prompts-display': ActivePromptsDisplay;
  }
}