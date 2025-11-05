/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, '1K', '2K', '4K', '8K', '16K'];

@customElement('master-controls')
// Fix: The class must extend LitElement to be a valid web component.
export class MasterControls extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2vmin;
            background-color: rgba(20, 20, 20, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 1.5vmin 2.5vmin;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .control-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1vmin;
            width: 100%;
        }
        .control-section-label {
            font-size: 1.2vmin;
            color: #aaa;
            text-transform: uppercase;
            font-weight: 500;
        }
        .eq-controls {
            display: flex;
            gap: 2vmin;
            align-items: flex-end;
            justify-content: center;
            height: 12vmin;
            width: 100%;
        }
        .eq-slider-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5vmin;
            height: 100%;
            flex-grow: 1;
        }
        .eq-slider {
            -webkit-appearance: none;
            appearance: none;
            writing-mode: bt-lr;
            -webkit-appearance: slider-vertical;
            width: 8px;
            height: 100%;
            background: #333;
            outline: none;
            border-radius: 4px;
            border: 1px solid #555;
            cursor: ns-resize;
        }
        .eq-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 2.5vmin;
            height: 1.5vmin;
            background: #fff;
            cursor: inherit;
            border-radius: 2px;
            border: 1px solid #888;
        }
    `;

    @state() private eqGains = new Array(10).fill(0);

    private handleEqChange(e: Event, bandIndex: number) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        
        const newGains = [...this.eqGains];
        newGains[bandIndex] = value;
        this.eqGains = newGains;
        
        this.dispatchEvent(new CustomEvent('eq-changed', {
            detail: { band: bandIndex, gain: value },
            bubbles: true,
            composed: true,
        }));
    }
    
    override render() {
        return html`
            <div class="control-section">
                <span class="control-section-label">Graphic Equalizer</span>
                <div class="eq-controls">
                    ${map(this.eqGains, (gain, i) => html`
                        <div class="eq-slider-container">
                            <input 
                                type="range" 
                                min="-12" 
                                max="12" 
                                step="0.1" 
                                .value=${gain} 
                                @input=${(e: Event) => this.handleEqChange(e, i)} 
                                class="eq-slider">
                            <span class="control-section-label">${EQ_FREQUENCIES[i]}</span>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'master-controls': MasterControls;
  }
}
