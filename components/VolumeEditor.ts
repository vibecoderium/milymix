/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './WeightKnob';

@customElement('volume-editor')
// Fix: The class must extend LitElement to be a valid web component.
export class VolumeEditor extends LitElement {
  static override styles = css`
    .scrim {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .scrim.showing {
      opacity: 1;
      visibility: visible;
    }
    .editor-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2vmin;
    }
    volume-knob {
      width: 50vmin;
      max-width: 300px;
    }
    .prompt-text {
      font-size: 5vmin;
      font-weight: 500;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.5);
      padding: 0.5em 1em;
      border-radius: 8px;
    }
  `;

  @property({ type: Boolean, reflect: true }) showing = false;
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '#fff';
  @property({ type: String }) text = '';
  @property({ type: Number }) audioLevel = 0;

  private onWeightInput(e: CustomEvent<number>) {
    this.dispatchEvent(new CustomEvent('knob-interaction', {
      detail: { text: this.text },
      bubbles: true,
      composed: true,
    }));
    this.dispatchEvent(new CustomEvent('weight-changed', { detail: e.detail }));
  }

  private handleClose() {
    this.dispatchEvent(new CustomEvent('close-editor', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <div class=${classMap({ scrim: true, showing: this.showing })} @click=${this.handleClose}>
        <div class="editor-content" @click=${(e: Event) => e.stopPropagation()}>
          <span class="prompt-text">${this.text}</span>
          <volume-knob
            .value=${this.weight}
            .color=${this.color}
            .audioLevel=${this.audioLevel}
            @input=${this.onWeightInput}>
          </volume-knob>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'volume-editor': VolumeEditor;
  }
}