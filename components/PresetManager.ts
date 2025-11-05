/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Prompt } from '../types';

export interface Preset {
  name: string;
  prompts: Record<string, Prompt>;
}

const LOCAL_STORAGE_KEY = 'promptDjPresets';

@customElement('preset-manager')
// Fix: The class must extend LitElement to be a valid web component.
export class PresetManager extends LitElement {
  static override styles = css`
    .scrim {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .scrim.showing {
      opacity: 1;
      visibility: visible;
    }
    .modal {
      background: #222;
      color: #fff;
      border-radius: 8px;
      padding: 20px;
      width: min(500px, 90vw);
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      gap: 15px;
      border: 1px solid #444;
      box-shadow: 0 4px 30px rgba(0,0,0,0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.5em;
    }
    .close-button {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5em;
      cursor: pointer;
    }
    .save-section {
      display: flex;
      gap: 10px;
    }
    input {
      flex-grow: 1;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #555;
      background: #333;
      color: #fff;
    }
    button {
      padding: 8px 12px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: #4a4a4a;
      color: #fff;
      font-weight: 600;
    }
    .save-button {
      background: #3c8ce4;
    }
    .preset-list {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid #444;
      padding-top: 15px;
    }
    .preset-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #333;
      padding: 10px;
      border-radius: 4px;
    }
    .preset-name {
      font-weight: 500;
    }
    .preset-actions {
      display: flex;
      gap: 10px;
    }
    .delete-button {
      background: #e43c3c;
    }
  `;

  @property({ type: Boolean, reflect: true }) showing = false;
  @property({ type: Object }) currentPrompts: Record<string, Prompt> = {};

  @state() private presets: Preset[] = [];
  @state() private newPresetName = '';

  constructor() {
    super();
    this.loadPresetsFromStorage();
  }

  private loadPresetsFromStorage() {
    try {
      const storedPresets = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPresets) {
        this.presets = JSON.parse(storedPresets);
      }
    } catch (e) {
      console.error("Failed to load presets from localStorage", e);
    }
  }

  private savePresetsToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.presets));
    } catch (e) {
      console.error("Failed to save presets to localStorage", e);
    }
  }

  private handleSave() {
    if (!this.newPresetName.trim()) {
      alert('Please enter a name for the preset.');
      return;
    }
    const newPreset: Preset = {
      name: this.newPresetName.trim(),
      prompts: this.currentPrompts,
    };
    this.presets = [...this.presets, newPreset];
    this.savePresetsToStorage();
    this.newPresetName = '';
  }

  private handleLoad(preset: Preset) {
    this.dispatchEvent(new CustomEvent('load-preset', { detail: preset }));
  }

  private handleDelete(presetNameToDelete: string) {
    if (confirm(`Are you sure you want to delete the preset "${presetNameToDelete}"?`)) {
      this.presets = this.presets.filter(p => p.name !== presetNameToDelete);
      this.savePresetsToStorage();
    }
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  override render() {
    return html`
      <div class=${classMap({ scrim: true, showing: this.showing })} @click=${this.close}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Presets</h2>
            <button class="close-button" @click=${this.close}>✕</button>
          </div>
          <div class="save-section">
            <input
              type="text"
              placeholder="New preset name..."
              .value=${this.newPresetName}
              @input=${(e: InputEvent) => this.newPresetName = (e.target as HTMLInputElement).value}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.handleSave()}
            />
            <button class="save-button" @click=${this.handleSave}>Save Current</button>
          </div>
          <div class="preset-list">
            ${this.presets.length === 0
              ? html`<p>No saved presets yet.</p>`
              : this.presets.map(preset => html`
                <div class="preset-item">
                  <span class="preset-name">${preset.name}</span>
                  <div class="preset-actions">
                    <button @click=${() => this.handleLoad(preset)}>Load</button>
                    <button class="delete-button" @click=${() => this.handleDelete(preset.name)}>Delete</button>
                  </div>
                </div>
              `)
            }
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'preset-manager': PresetManager;
  }
}
