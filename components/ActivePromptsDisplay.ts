/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js'; // Импортируем classMap
import type { Prompt } from '../types';
import './ActivePromptKnob'; // Импортируем новый компонент

@customElement('active-prompts-display')
// Fix: The class must extend LitElement to be a valid web component.
export class ActivePromptsDisplay extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: column; /* Изменено на колонку */
            gap: 1.5vmin; /* Отступ между заголовком и ручками */
            padding: 1.5vmin; /* Общий отступ для всего блока */
            box-sizing: border-box;
            background-color: rgba(20, 20, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            width: 100%;
        }
        .active-prompts-title {
            color: #fff;
            font-size: clamp(18px, 3vmin, 28px); /* Адаптивный размер шрифта */
            font-weight: 600;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0.5vmin 0; /* Вертикальные отступы для заголовка */
            transition: opacity 0.3s ease-out;
            opacity: 1;
        }
        .active-prompts-title.hidden {
            opacity: 0;
        }
        .knobs-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 4vmin; /* Зазор между кружками */
            padding: 4.5vmin; /* Отступы вокруг ручек внутри обертки */
            align-items: center; /* Выравнивание по центру */
            justify-content: center; /* Выравнивание по центру */
            width: 100%;
            box-sizing: border-box;
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

    @state() private activeKnobText: string | null = null; // Состояние для текста активной ручки
    private activeKnobTextTimeout: number | null = null; // Таймер для скрытия текста активной ручки

    private handleKnobInput(e: CustomEvent<number>) {
      const promptId = (e.target as HTMLElement).getAttribute('promptId');
      if (promptId) {
        const prompt = this.prompts.get(promptId);
        if (prompt) {
          this.activeKnobText = prompt.text;
          if (this.activeKnobTextTimeout) {
            clearTimeout(this.activeKnobTextTimeout);
          }
          this.activeKnobTextTimeout = setTimeout(() => {
            this.activeKnobText = null;
          }, 3000); // Скрываем текст через 3 секунды
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
            <div class=${classMap({ 'active-prompts-title': true, 'hidden': !this.activeKnobText })}>
                ${this.activeKnobText || 'Активные стили'}
            </div>
            <div class="knobs-wrapper">
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
                    : html`<span class="placeholder">Нет активных стилей. Поверните ручку, чтобы начать музыку!</span>`
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