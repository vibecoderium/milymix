/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { Prompt } from '../types';
import './ActivePromptKnob'; // Импортируем новый компонент

@customElement('active-prompts-display')
// Fix: The class must extend LitElement to be a valid web component.
export class ActivePromptsDisplay extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
            gap: 4vmin; /* Увеличен зазор между кружками */
            padding: 6vmin; /* Значительно увеличены отступы для размещения максимального свечения */
            box-sizing: border-box;
            background-color: rgba(20, 20, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            align-items: center; /* Выравнивание по центру */
            justify-content: center; /* Выравнивание по центру */
            width: 100%;
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

    private handleKnobInput(e: CustomEvent<number>) {
      const promptId = (e.target as HTMLElement).getAttribute('promptId');
      if (promptId) {
        const prompt = this.prompts.get(promptId);
        if (prompt) {
          this.dispatchEvent(new CustomEvent('knob-interaction', {
            detail: { text: prompt.text },
            bubbles: true,
            composed: true,
          }));
        }
        this.dispatchEvent(new CustomEvent('weight-changed', {
          detail: { promptId, weight: e.detail },
          bubbles: true,
          composed: true,
        }));
      }
    }

    override render() {
        const activePrompts = [...this.prompts.values()].filter(p => p.weight > 0);

        return html`
            ${activePrompts.length > 0
                ? repeat(activePrompts, (prompt) => prompt.promptId, (prompt) => html`
                    <active-prompt-knob
                        promptId=${prompt.promptId}
                        text=${prompt.text}
                        weight=${prompt.weight}
                        color=${prompt.color}
                        .audioLevel=${this.audioLevel}
                        @input=${this.handleKnobInput}
                    ></active-prompt-knob>
                `)
                : html`<span class="placeholder">No active prompts. Turn up a knob to start the music!</span>`
            }
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'active-prompts-display': ActivePromptsDisplay;
  }
}