/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('toast-message')
// Fix: The class must extend LitElement to be a valid web component.
export class ToastMessage extends LitElement {
  static override styles = css`
    .toast {
      line-height: 1.6;
      position: fixed;
      top: 50%;
      left: 50%;
      /* Начальное состояние: скрыто и смещено вверх */
      transform: translate(-50%, -200%); 
      background-color: #000;
      color: white;
      padding: 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      width: min(450px, 80vw);
      /* Добавлены переходы для opacity и visibility */
      transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s, visibility 0.3s;
      border: 2px solid #fff;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
      text-wrap: pretty;
      z-index: 1000;
      /* Изначально невидимо */
      opacity: 0;
      visibility: hidden;
    }
    .toast.showing {
      /* Когда показывается: видно и по центру */
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, -50%);
    }
    button {
      border-radius: 100px;
      aspect-ratio: 1;
      border: none;
      color: #000;
      cursor: pointer;
    }
    a {
      color: #acacac;
      text-decoration: underline;
    }
  `;

  @property({ type: String }) message = '';
  @property({ type: Boolean }) showing = false;

  @state() private timeoutId: number | undefined;

  private renderMessageWithLinks() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = this.message.split( urlRegex );
    return parts.map( ( part, i ) => {
      if ( i % 2 === 0 ) return part;
      return html`<a href=${part} target="_blank" rel="noopener">${part}</a>`;
    } );
  }

  override render() {
    return html`<div class=${classMap({ showing: this.showing, toast: true })}>
      <div class="message">${this.renderMessageWithLinks()}</div>
      <button @click=${this.hide}>✕</button>
    </div>`;
  }

  show(message: string) {
    this.showing = true;
    this.message = message;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  hide() {
    this.showing = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'toast-message': ToastMessage
  }
}