/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeCSS } from 'lit';

function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/** A single prompt input associated with a MIDI CC. */
@customElement('prompt-controller')
// Fix: The class must extend LitElement to be a valid web component.
export class PromptController extends LitElement {
  static override styles = css`
    .prompt-button {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: transparent;
      color: #fff;
      font-weight: 500;
      font-size: clamp(14px, 2vh, 18px);
      padding: 1.2vmin;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out, transform 0.1s ease;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .prompt-button:hover {
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .prompt-button:active {
      transform: scale(0.95);
    }
    .prompt-button.active {
       border: 2px solid #fff;
       box-shadow: 0 0 10px var(--button-color, #fff);
    }
    .text {
       mix-blend-mode: difference;
    }
  `;

  @property({ type: String }) promptId = '';
  @property({ type: String }) text = '';
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '';
  @property({ type: Boolean }) active = false;


  private requestEdit() {
    this.dispatchEvent(new CustomEvent('edit-prompt', {
        bubbles: true,
        composed: true,
        detail: { promptId: this.promptId }
    }));
  }

  override render() {
    const rgb = hexToRgb(this.color);
    const backgroundStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.weight / 2})` : this.color;

    const styles = styleMap({
      backgroundColor: backgroundStyle,
      '--button-color': this.color,
    });

    return html`
      <button 
        class="prompt-button ${this.active ? 'active' : ''}" 
        style=${styles}
        @click=${this.requestEdit}
      >
        <span class="text">${this.text}</span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompt-controller': PromptController;
  }
}