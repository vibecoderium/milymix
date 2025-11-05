/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement, svg } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('save-icon')
export class SaveIcon extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 9vmin; /* Размер иконки увеличен в 3 раза (было 3vmin, стало 9vmin) */
      height: 9vmin; /* Размер иконки увеличен в 3 раза (было 3vmin, стало 9vmin) */
      color: #fff; /* Цвет иконки */
      cursor: pointer; /* Указываем, что это интерактивный элемент */
      transition: transform 0.2s ease-in-out;
    }
    :host(:hover) {
      transform: scale(1.1);
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor; /* Используем цвет из :host */
    }
  `;

  override render() {
    return html`
      ${svg`
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
        </svg>
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'save-icon': SaveIcon;
  }
}