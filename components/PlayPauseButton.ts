/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { svg, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { PlaybackState } from '../types';

@customElement('play-pause-button')
export class PlayPauseButton extends LitElement {

  @property({ type: String }) playbackState: PlaybackState = 'stopped';

  static override styles = css`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      aspect-ratio: 1; /* Гарантируем, что хост всегда квадратный */
      border-radius: 50%; /* Делаем сам компонент круглым */
      overflow: hidden; /* Обрезаем все, что выходит за круг */
      background-color: rgba(0,0,0,0.2); /* Добавляем легкий фон для кнопки */
      transition: background-color 0.2s ease-in-out;
    }
    :host(:hover) {
      background-color: rgba(255,255,255,0.1); /* Изменение фона при наведении */
    }
    .icon-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%; /* Размер иконки относительно кнопки */
      height: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff; /* Цвет иконок */
    }
    .icon-container svg {
      fill: currentColor;
      width: 100%;
      height: 100%;
    }
    .loading-spinner {
      width: 60%;
      height: 60%;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    .hitbox {
      pointer-events: all;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border-radius: 50%;
      cursor: pointer;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  private renderPlayIcon() {
    return svg`<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  private renderPauseIcon() {
    return svg`<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
  }

  private renderLoadingIcon() {
    return html`<div class="loading-spinner"></div>`;
  }

  private renderCurrentStateIcon() {
    switch (this.playbackState) {
      case 'playing':
        return this.renderPauseIcon();
      case 'loading':
        return this.renderLoadingIcon();
      case 'stopped':
      case 'paused':
      default:
        return this.renderPlayIcon();
    }
  }

  override render() {
    return html`
      ${this.renderSvgBackground()}
      <div class="icon-container">
        ${this.renderCurrentStateIcon()}
      </div>
      <div class="hitbox"></div>
    `;
  }

  private renderSvgBackground() {
    return html` <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="70"
        cy="70"
        r="48"
        fill="black"
        fill-opacity="0.05" />
      <circle
        cx="70"
        cy="70"
        r="46.5"
        stroke="black"
        stroke-opacity="0.3"
        stroke-width="3" />
      <g filter="url(#filter0_ddi_1048_7373)">
        <circle
          cx="70"
          cy="70"
          r="45"
          fill="white"
          fill-opacity="0.05"
          shape-rendering="crispEdges" />
      </g>
      <defs>
        <filter
          id="filter0_ddi_1048_7373"
          x="0"
          y="0"
          width="140"
          height="140"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1048_7373" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="16" />
          <feGaussianBlur stdDeviation="12.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1048_7373"
            result="effect2_dropShadow_1048_7373" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1048_7373"
            result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0"
            result="effect3_innerShadow_1048_7373" />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect3_innerShadow_1048_7373" />
        </filter>
      </defs>
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'play-pause-button': PlayPauseButton
  }
}