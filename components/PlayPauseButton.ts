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
      flex-direction: column; /* Для размещения текста под кнопкой */
      align-items: center;
      justify-content: center;
      pointer-events: none;
      width: 100%; /* Занимает всю доступную ширину контейнера */
      height: 100%; /* Занимает всю доступную высоту контейнера */
    }
    .button-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1; /* Делает контейнер квадратным */
      border-radius: 50%; /* Делает контейнер круглым */
      pointer-events: all; /* Разрешает события на кнопке */
      cursor: pointer;
    }
    .logo-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%; /* Размер логотипа относительно кнопки */
      height: 60%;
      object-fit: contain;
      transition: transform 0.5s cubic-bezier(0.25, 1.56, 0.32, 0.99);
    }
    .button-wrapper:hover .logo-image:not(.loading) { /* Только масштабирование, если не загружается */
      transform: translate(-50%, -50%) scale(1.2);
    }
    .logo-image.loading {
      animation: spin linear 1s infinite;
    }
    .hitbox {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      /* background: rgba(255,0,0,0.1); /* Для отладки */ */
    }
    .button-text {
      margin-top: 1vmin; /* Отступ текста от кнопки */
      color: #fff;
      font-size: clamp(16px, 2.5vmin, 24px);
      font-weight: 600;
      text-transform: uppercase;
      pointer-events: none; /* Текст не должен перехватывать клики */
    }
    @keyframes spin {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(359deg); }
    }
  `;

  private renderSvgBackground() {
    return html` <svg
      width="140"
      height="140"
      viewBox="0 -10 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="22"
        y="6"
        width="96"
        height="96"
        rx="48"
        fill="black"
        fill-opacity="0.05" />
      <rect
        x="23.5"
        y="7.5"
        width="93"
        height="93"
        rx="46.5"
        stroke="black"
        stroke-opacity="0.3"
        stroke-width="3" />
      <g filter="url(#filter0_ddi_1048_7373)">
        <rect
          x="25"
          y="9"
          width="90"
          height="90"
          rx="45"
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

  override render() {
    const logoClasses = {
      'logo-image': true,
      'loading': this.playbackState === 'loading'
    };

    return html`
      <div class="button-wrapper" @click=${() => this.dispatchEvent(new CustomEvent('click'))}>
        ${this.renderSvgBackground()}
        <img src="/logow.png" alt="Logo" class=${classMap(logoClasses)} />
        <div class="hitbox"></div>
      </div>
      <span class="button-text">Start</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'play-pause-button': PlayPauseButton
  }
}