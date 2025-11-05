/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('vertical-slider')
export class VerticalSlider extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%; /* Занимает всю доступную высоту */
      width: auto;
    }
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      writing-mode: bt-lr; /* Для вертикальной ориентации */
      -webkit-appearance: slider-vertical;
      width: 8px; /* Ширина дорожки */
      height: 100%; /* Высота ползунка */
      background: #333;
      outline: none;
      border-radius: 4px;
      border: 1px solid #555;
      cursor: ns-resize;
      margin: 0; /* Удаляем стандартные отступы */
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 2.5vmin; /* Ширина ползунка */
      height: 1.5vmin; /* Высота ползунка */
      background: #fff;
      cursor: inherit;
      border-radius: 2px;
      border: 1px solid #888;
    }
    input[type="range"]::-moz-range-thumb {
      width: 2.5vmin;
      height: 1.5vmin;
      background: #fff;
      cursor: inherit;
      border-radius: 2px;
      border: 1px solid #888;
    }
    input[type="range"]::-ms-thumb {
      width: 2.5vmin;
      height: 1.5vmin;
      background: #fff;
      cursor: inherit;
      border-radius: 2px;
      border: 1px solid #888;
    }
  `;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 2; // Диапазон 0-2 для согласованности с ручками
  @property({ type: Number }) step = 0.01; // Точная регулировка

  private handleInput(e: Event) {
    const newValue = parseFloat((e.target as HTMLInputElement).value);
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('input', { detail: newValue }));
  }

  override render() {
    return html`
      <input
        type="range"
        .min=${this.min}
        .max=${this.max}
        .step=${this.step}
        .value=${this.value}
        @input=${this.handleInput}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vertical-slider': VerticalSlider;
  }
}