/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './WeightKnob';

@customElement('synth-panel')
// Fix: The class must extend LitElement to be a valid web component.
export class SynthPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      background-color: rgba(20, 20, 20, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5vmin;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .panel-content {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 2vmin;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1vmin;
    }
    .label {
      font-size: 1.2vmin;
      color: #aaa;
      text-transform: uppercase;
      font-weight: 500;
    }
    .knobs {
      display: flex;
      gap: 2vmin;
    }
    .knob-container {
      width: 6vmin;
      height: 6vmin;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5vmin;
    }
    .knob-label {
      font-size: 1.1vmin;
      color: #ccc;
    }
  `;

  @state() private masterVolume = 0.8;
  @state() private balance = 0; // -1 to 1
  @state() private lowPass = 2; // 0 to 2
  @state() private highPass = 0; // 0 to 2

  private handleVolumeChange(e: CustomEvent<number>) {
    const knobValue = e.detail;
    this.masterVolume = knobValue / 2;
    this.dispatchEvent(new CustomEvent('master-volume-changed', {
      detail: this.masterVolume,
      bubbles: true,
      composed: true,
    }));
  }

  private handleBalanceChange(e: CustomEvent<number>) {
    const knobValue = e.detail;
    this.balance = knobValue - 1;
    this.dispatchEvent(new CustomEvent('balance-changed', {
      detail: this.balance,
      bubbles: true,
      composed: true,
    }));
  }

  private handleFilterChange(e: CustomEvent<number>, type: 'lowpass' | 'highpass') {
    const knobValue = e.detail;
    if (type === 'lowpass') this.lowPass = knobValue;
    if (type === 'highpass') this.highPass = knobValue;

    this.dispatchEvent(new CustomEvent('filter-changed', {
      detail: { type, value: knobValue },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="panel-content">
        <div class="control-group">
          <div class="label">Мастер</div>
          <div class="knobs">
            <div class="knob-container">
               <volume-knob
                .value=${this.masterVolume * 2}
                @input=${this.handleVolumeChange}>
              </volume-knob>
              <span class="knob-label">Громкость</span>
            </div>
            <div class="knob-container">
               <volume-knob
                .value=${this.balance + 1}
                @input=${this.handleBalanceChange}>
              </volume-knob>
              <span class="knob-label">Баланс</span>
            </div>
          </div>
        </div>
        <div class="control-group">
          <div class="label">Фильтр</div>
          <div class="knobs">
            <div class="knob-container">
              <volume-knob
                .value=${this.lowPass}
                @input=${(e: CustomEvent<number>) => this.handleFilterChange(e, 'lowpass')}>
              </volume-knob>
              <span class="knob-label">НЧ-фильтр</span>
            </div>
            <div class="knob-container">
              <volume-knob
                .value=${this.highPass}
                @input=${(e: CustomEvent<number>) => this.handleFilterChange(e, 'highpass')}>
              </volume-knob>
              <span class="knob-label">ВЧ-фильтр</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'synth-panel': SynthPanel;
  }
}