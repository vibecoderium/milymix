/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('horizontal-slider')
export class HorizontalSlider extends LitElement {
  static override styles = css`
    :host {
      cursor: grab;
      position: relative;
      width: 100%;
      height: 2vmin; /* Высота слайдера */
      flex-shrink: 0;
      touch-action: none;
      background: #333;
      border-radius: 4px;
      border: 1px solid #555;
      box-sizing: border-box;
    }
    .fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: #fff; /* Цвет заполнения */
      border-radius: 4px;
      pointer-events: none; /* Не мешает событиям на хосте */
    }
    .thumb {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 1.5vmin; /* Ширина ползунка */
      height: 2.5vmin; /* Высота ползунка */
      background: #fff;
      border-radius: 2px;
      border: 1px solid #888;
      pointer-events: none; /* Не мешает событиям на хосте */
    }
  `;

  @property({ type: Number }) value = 0; // Значение от 0 до 2
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 2;
  @property({ type: Number }) step = 0.01;

  private dragStartPos = 0;
  private dragStartValue = 0;

  constructor() {
    super();
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  private handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    this.dragStartPos = e.clientX;
    this.dragStartValue = this.value;
    document.body.classList.add('dragging');
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  private handlePointerMove(e: PointerEvent) {
    const delta = e.clientX - this.dragStartPos;
    const width = this.offsetWidth;
    const range = this.max - this.min;
    const newValue = this.dragStartValue + (delta / width) * range;
    this.value = Math.max(this.min, Math.min(this.max, newValue));
    this.dispatchEvent(new CustomEvent<number>('input', { detail: this.value }));
  }

  private handlePointerUp() {
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    document.body.classList.remove('dragging');
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY;
    const newValue = this.value + delta * -0.005; // Меньшая чувствительность для колеса
    this.value = Math.max(this.min, Math.min(this.max, newValue));
    this.dispatchEvent(new CustomEvent<number>('input', { detail: this.value }));
  }

  override render() {
    const fillWidth = ((this.value - this.min) / (this.max - this.min)) * 100;
    const thumbLeft = fillWidth;

    const fillStyle = styleMap({
      width: `${fillWidth}%`,
    });

    const thumbStyle = styleMap({
      left: `${thumbLeft}%`,
    });

    return html`
      <div class="fill" style=${fillStyle}></div>
      <div class="thumb" style=${thumbStyle}></div>
      <div
        class="hitbox"
        @pointerdown=${this.handlePointerDown}
        @wheel=${this.handleWheel}
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'horizontal-slider': HorizontalSlider;
  }
}