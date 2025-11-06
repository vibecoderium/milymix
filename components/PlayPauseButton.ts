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
  @property({ type: String }) buttonText = ''; // Новое свойство для текста

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
    }
    .button-content { /* Новый контейнер для текста */
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(20px, 5vmin, 36px); /* Адаптивный размер текста */
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      transition: transform 0.5s cubic-bezier(0.25, 1.56, 0.32, 0.99);
      border-radius: 50%; /* Делаем контент круглым */
      background-color: rgba(0,0,0,0.2); /* Небольшой фон для текста */
    }
    :host(:hover) .button-content:not(.loading) { /* Только масштабирование, если не загружается */
      transform: translate(-50%, -50%) scale(1.1); /* Уменьшил масштаб для текста */
    }
    /* Удаляем анимацию вращения для .button-content.loading */
    /* @keyframes spin больше не нужен */
    .hitbox {
      pointer-events: all;
      position: absolute;
      width: 100%; /* Расширяем hitbox на весь круг */
      height: 100%;
      top: 0;
      left: 0;
      border-radius: 50%;
      cursor: pointer;
    }
  `;

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

  override render() {
    const contentClasses = {
      'button-content': true,
      // 'loading': this.playbackState === 'loading' // Удалена привязка к состоянию загрузки для вращения
    };

    return html`
      ${this.renderSvgBackground()}
      <div class=${classMap(contentClasses)}>
        ${this.buttonText || (this.playbackState === 'playing' ? 'PAUSE' : 'PLAY')}
      </div>
      <div class="hitbox"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'play-pause-button': PlayPauseButton
  }
}