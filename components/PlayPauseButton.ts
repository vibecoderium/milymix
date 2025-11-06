/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { svg, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { PlaybackState } from '../types';

@customElement('play-pause-button')
// Fix: The class must extend LitElement to be a valid web component.
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
      width: 100%;
      height: 100%;
    }
    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5vmin;
      position: relative;
      z-index: 2;
    }
    .logo-image {
      width: 8vmin;
      height: 8vmin;
      object-fit: contain;
      border-radius: 50%;
    }
    .start-text {
      color: #fff;
      font-size: 4vmin;
      font-weight: 600;
      text-transform: uppercase;
      -webkit-font-smoothing: antialiased;
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
      z-index: 1;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
    return html`
      ${this.renderSvgBackground()}
      <div class="button-content">
        <img src="/logow.png" alt="Logo" class="logo-image" />
        <span class="start-text">Start</span>
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