/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

/** Maps prompt weight to halo size. */
const MIN_HALO_SCALE = 1;
const MAX_HALO_SCALE = 1.5; // Slightly less aggressive than main knob

/** The amount of scale to add to the halo based on audio level. */
const HALO_LEVEL_MODIFIER = 0.5; // Less sensitive than main knob

@customElement('active-prompt-knob')
export class ActivePromptKnob extends LitElement {
  static override styles = css`
    :host {
      cursor: grab; /* Изменено на grab для индикации перетаскивания */
      position: relative;
      width: 10vmin; /* Размер кружка */
      height: 10vmin;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 1.2vmin;
      font-weight: 500;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: rgba(0, 0, 0, 0.3);
      box-sizing: border-box;
      transition: transform 0.1s ease;
      overflow: hidden; /* Обрезаем текст, если он слишком длинный */
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-word;
      line-height: 1.2;
      padding: 0.5vmin;
      touch-action: none; /* Предотвращает прокрутку браузера при перетаскивании */
    }
    :host(:hover) {
      transform: scale(1.05);
    }
    #halo {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      mix-blend-mode: lighten;
      transform: scale(1);
      will-change: transform;
      opacity: 0.7;
    }
  `;

  @property({ type: String }) promptId = '';
  @property({ type: String }) text = '';
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '#fff';
  @property({ type: Number }) audioLevel = 0;

  private dragStartPos = 0;
  private dragStartWeight = 0;
  private isDragging = false;

  constructor() {
    super();
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  private handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    this.isDragging = false; // Сброс флага перетаскивания
    this.dragStartPos = e.clientY;
    this.dragStartWeight = this.weight;
    document.body.classList.add('dragging');
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  private handlePointerMove(e: PointerEvent) {
    const delta = this.dragStartPos - e.clientY;
    const newWeight = this.dragStartWeight + delta * 0.01;
    this.weight = Math.max(0, Math.min(2, newWeight));
    this.dispatchEvent(new CustomEvent<number>('weight-changed', { detail: this.weight }));
    this.isDragging = true; // Установить флаг, если произошло движение
  }

  private handlePointerUp() {
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    document.body.classList.remove('dragging');
    // Если не было перетаскивания, это был клик
    if (!this.isDragging) {
      this.handleClick();
    }
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault(); // Предотвратить прокрутку страницы
    const delta = e.deltaY;
    const newWeight = this.weight + delta * -0.0025;
    this.weight = Math.max(0, Math.min(2, newWeight));
    this.dispatchEvent(new CustomEvent<number>('weight-changed', { detail: this.weight }));
  }

  private handleClick() {
    // Открываем редактор только если не было перетаскивания
    this.dispatchEvent(new CustomEvent('edit-prompt', {
      detail: { promptId: this.promptId },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    let scale = (this.weight / 2) * (MAX_HALO_SCALE - MIN_HALO_SCALE);
    scale += MIN_HALO_SCALE;
    scale += this.audioLevel * HALO_LEVEL_MODIFIER;

    const haloStyle = styleMap({
      display: this.weight > 0 ? 'block' : 'none',
      background: this.color,
      transform: `scale(${scale})`,
    });

    return html`
      <div id="halo" style=${haloStyle}></div>
      <span
        @pointerdown=${this.handlePointerDown}
        @wheel=${this.handleWheel}
      >${this.text}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'active-prompt-knob': ActivePromptKnob;
  }
}