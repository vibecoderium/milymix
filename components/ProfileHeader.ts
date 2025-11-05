/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('profile-header')
export class ProfileHeader extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    button {
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      color: #fff;
      background: #0002;
      -webkit-font-smoothing: antialiased;
      border: 1.5px solid #fff;
      border-radius: 4px;
      user-select: none;
      padding: 5px 10px;
    }
    button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    button:active {
      transform: scale(0.98);
    }
  `;

  private togglePresets() {
    this.dispatchEvent(new CustomEvent('toggle-presets', { bubbles: true, composed: true }));
  }

  private openSettings() {
    console.log('Settings button clicked');
    // Здесь можно будет добавить логику для открытия настроек
  }

  override render() {
    return html`
      <button @click=${this.togglePresets}>Presets</button>
      <button @click=${this.openSettings}>Settings</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-header': ProfileHeader;
  }
}