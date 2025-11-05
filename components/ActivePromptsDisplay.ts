/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Prompt } from '../types';

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
            gap: 1vmin;
            padding: 1.5vmin;
            min-height: 5.5vmin;
            box-sizing: border-box;
            background-color: rgba(20, 20, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .prompt-card {
            padding: 0.8vmin 1.2vmin;
            border-radius: 4px;
            font-size: 1.4vmin;
            font-weight: 500;
            color: #fff;
            cursor: pointer;
            transition: transform 0.1s ease;
            mix-blend-mode: lighten;
            -webkit-font-smoothing: antialiased;
        }
        .prompt-card:hover {
            transform: scale(1.05);
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

    private handleCardClick(promptId: string) {
        this.dispatchEvent(new CustomEvent('edit-prompt', {
            detail: { promptId },
            bubbles: true,
            composed: true,
        }));
    }

    override render() {
        const activePrompts = [...this.prompts.values()].filter(p => p.weight > 0);

        return html`
            <div class="container">
                ${activePrompts.length > 0
                    ? map(activePrompts, prompt => {
                        const styles = styleMap({
                            backgroundColor: prompt.color,
                            opacity: String(Math.min(1, prompt.weight / 1.5))
                        });
                        return html`
                            <div
                                class="prompt-card"
                                style=${styles}
                                @click=${() => this.handleCardClick(prompt.promptId)}>
                                ${prompt.text}
                            </div>
                        `;
                    })
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
