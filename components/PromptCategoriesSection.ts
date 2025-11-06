/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

import './PromptController'; // Ensure PromptController is imported

import type { PlaybackState, Prompt } from '../types';

interface PromptCategory {
  name: string;
  prompts: Prompt[];
}

@customElement('prompt-categories-section')
export class PromptCategoriesSection extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background-color: rgba(20, 20, 20, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      flex-shrink: 0;
    }
    .section-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1vh 2vw;
      font-size: clamp(14px, 2vh, 18px);
      font-weight: 500;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      text-align: left;
      flex-shrink: 0;
    }
    .chevron {
      font-size: clamp(16px, 2.5vh, 20px);
      font-weight: 300;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.3s ease-in-out;
    }
    :host(.active) .chevron {
      transform: rotate(180deg);
    }
    .section-content {
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-in-out;
      max-height: 0;
      opacity: 0;
      visibility: hidden;
      padding: 0 1.5vmin 1.5vmin 1.5vmin;
      display: flex;
      flex-direction: column;
      gap: 1vmin; /* Gap between inner accordions */
    }
    :host(.active) .section-content {
      max-height: 10000px; /* Large enough value to show content */
      opacity: 1;
      visibility: visible;
    }

    /* Styles for inner category accordions */
    .accordion-item {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background-color: rgba(20, 20, 20, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .accordion-item.active {
      flex-shrink: 1;
    }
    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1vh 2vw;
      font-size: clamp(14px, 2vh, 18px);
      font-weight: 500;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      text-align: left;
      flex-shrink: 0;
    }
    .accordion-item .chevron { /* Override for inner chevron */
      font-size: clamp(16px, 2.5vh, 20px);
      font-weight: 300;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.3s ease-in-out;
    }
    .accordion-item.active .accordion-header .chevron {
      transform: rotate(180deg);
    }
    .accordion-content-inner { /* Renamed to avoid conflict */
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-in-out;
      max-height: 0;
      opacity: 0;
      visibility: hidden;
      padding: 0 1.5vmin 1.5vmin 1.5vmin;
    }
    .accordion-item.active .accordion-content-inner {
      max-height: 1000px; /* A large enough value to show content */
      opacity: 1;
      visibility: visible;
    }
    .accordion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11vmin, 1fr));
      gap: 1vmin;
      height: 100%;
      box-sizing: border-box;
    }
  `;

  @property({ attribute: false })
  promptCategories: PromptCategory[] = [];

  @property({ attribute: false })
  prompts: Map<string, Prompt> = new Map();

  @property({ type: Object })
  filteredPrompts = new Set<string>();

  @property({ type: String })
  editingPromptId: string | null = null;

  @state() private showSection = false; // State for the main section's collapse
  @state() private activeCategories = new Set<string>(); // State for inner category accordions

  private toggleSection() {
    this.showSection = !this.showSection;
  }

  private handleAccordionToggle(categoryName: string) {
    const newActiveCategories = new Set(this.activeCategories);
    if (newActiveCategories.has(categoryName)) {
      newActiveCategories.delete(categoryName);
    } else {
      newActiveCategories.add(categoryName);
    }
    this.activeCategories = newActiveCategories;
  }

  private handleEditPromptRequest(e: CustomEvent<{ promptId: string }>) {
    // Re-dispatch the event from the inner prompt controller
    this.dispatchEvent(new CustomEvent('edit-prompt', {
        detail: e.detail,
        bubbles: true,
        composed: true,
    }));
  }

  private renderPromptsForCategory(category: PromptCategory) {
    return category.prompts.map(prompt => {
      if (!prompt) return html``;
      return html`<prompt-controller
        promptId=${prompt.promptId}
        ?filtered=${this.filteredPrompts.has(prompt.text)}
        ?active=${this.editingPromptId === prompt.promptId}
        text=${prompt.text}
        weight=${prompt.weight}
        color=${prompt.color}>
      </prompt-controller>`;
    });
  }

  override render() {
    return html`
      <button class="section-header" @click=${this.toggleSection}>
        <span>Выбор стилей</span>
        <span class="chevron">${this.showSection ? '−' : '+'}</span>
      </button>
      <div class=${classMap({ 'section-content': true, 'active': this.showSection })}>
        ${this.promptCategories.map(category => {
          const isActive = this.activeCategories.has(category.name);
          return html`
            <div class="accordion-item ${isActive ? 'active' : ''}">
              <button class="accordion-header" @click=${() => this.handleAccordionToggle(category.name)}>
                <span>${category.name}</span>
                <span class="chevron">${isActive ? '−' : '+'}</span>
              </button>
              <div class="accordion-content-inner">
                <div class="accordion-grid" @edit-prompt=${this.handleEditPromptRequest}>
                  ${this.renderPromptsForCategory(category)}
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompt-categories-section': PromptCategoriesSection;
  }
}