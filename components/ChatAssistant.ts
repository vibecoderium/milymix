/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { css, html, LitElement, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('chat-assistant')
// Fix: The class must extend LitElement to be a valid web component.
export class ChatAssistant extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background-color: rgba(20, 20, 20, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 25px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      flex-grow: 1;
    }
    #prompt-input {
      flex-grow: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: clamp(14px, 1.8vh, 16px);
      font-family: inherit;
    }
    #prompt-input::placeholder {
      color: #aaa;
    }
    #mic-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    #mic-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    #mic-button.listening svg {
      fill: #ff4d4d;
      animation: pulse 1.5s infinite;
    }
    svg {
      width: 24px;
      height: 24px;
      fill: #fff;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    #loader {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @state() private inputValue = '';
  @state() private isListening = false;
  @state() private isLoading = false;
  // FIX: Changed type from 'SpeechRecognition' to 'any' to resolve 'Cannot find name' error.
  private recognition: any | null = null;

  constructor() {
    super();
    // Fix: Moved SpeechRecognition constant declaration inside the constructor.
    // This resolves a name collision with the global SpeechRecognition type,
    // which caused a TypeScript error on the `recognition` class property.
    // For cross-browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.inputValue += event.results[i][0].transcript;
            this.stopListening();
            this.submitPrompt();
          } else {
            interimTranscript += event.results[i][0].transcript;
            this.inputValue = interimTranscript;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.stopListening();
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.stopListening();
        }
      };
    }
  }

  private handleInputChange(e: Event) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.inputValue.trim() !== '') {
      this.submitPrompt();
    }
  }

  private submitPrompt() {
    if (this.isLoading || !this.inputValue.trim()) return;
    this.isLoading = true;
    this.dispatchEvent(new CustomEvent('submit-prompt', {
      detail: this.inputValue,
      bubbles: true,
      composed: true,
    }));
    this.inputValue = '';
  }

  public finishLoading() {
      this.isLoading = false;
  }
  
  private toggleListen() {
    if (!this.recognition) {
        alert('Voice recognition is not supported in your browser.');
        return;
    }
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening() {
    this.isListening = true;
    this.inputValue = '';
    this.recognition?.start();
  }

  private stopListening() {
    this.isListening = false;
    this.recognition?.stop();
  }

  private renderMicIcon() {
    return svg`
      <svg viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path>
      </svg>
    `;
  }

  override render() {
    return html`
      <input
        id="prompt-input"
        type="text"
        placeholder="Describe the music you want, or use your voice..."
        .value=${this.inputValue}
        @input=${this.handleInputChange}
        @keydown=${this.handleKeyDown}
        ?disabled=${this.isLoading}
      />
      ${this.isLoading 
        ? html`<div id="loader"></div>` 
        : html`<button
            id="mic-button"
            class=${this.isListening ? 'listening' : ''}
            @click=${this.toggleListen}
            title="Use voice input"
        >
            ${this.renderMicIcon()}
        </button>`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-assistant': ChatAssistant;
  }
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
