# AI Studio App Rules

This document outlines the core technologies and best practices for developing this application.

## Tech Stack Overview

*   **Frontend Framework**: Lit (LitElement, lit-html, lit-css) for building lightweight, performant web components.
*   **Language**: TypeScript for type safety and improved code quality.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **AI Integration**: GoogleGenAI library (`@google/genai`) for all AI-powered features, including Live Music generation and the Chat Assistant.
*   **Audio Processing**: Direct utilization of the Web Audio API for advanced audio manipulation, filtering, and analysis, encapsulated within `LiveMusicHelper` and `AudioAnalyser` utilities.
*   **MIDI Integration**: Direct utilization of the Web MIDI API for connecting and processing MIDI input, encapsulated within the `MidiDispatcher` utility.
*   **State Management**: Lit's `@property` and `@state` decorators for managing component-specific state.
*   **Styling**: Component-scoped CSS using Lit's `css` tagged template literal for styling web components.
*   **Voice Input**: Browser's native SpeechRecognition API for voice-to-text functionality in the chat assistant.
*   **Package Management**: npm for managing project dependencies.

## Library Usage Guidelines

To maintain consistency and leverage the strengths of our chosen tech stack, please adhere to the following guidelines:

*   **UI Components**: All new UI elements should be developed as LitElement web components. Avoid introducing other UI frameworks or component libraries.
*   **Templating**: Use `lit-html` for all component rendering.
*   **Styling**: Apply styles using Lit's `css` tagged template literal within each component. Avoid global stylesheets unless absolutely necessary for base HTML/body styles.
*   **AI Features**: For any interaction with AI models (e.g., music generation, prompt processing), use the `@google/genai` library.
*   **Audio Functionality**: When working with audio, utilize the Web Audio API directly, or extend the existing `LiveMusicHelper` and `AudioAnalyser` utilities.
*   **MIDI Functionality**: For MIDI input and control, use the Web MIDI API, or extend the `MidiDispatcher` utility.
*   **State Management**: For component-level state, rely on Lit's `@property` for reactive properties and `@state` for internal component state.
*   **Utility Functions**: Place general-purpose helper functions in the `utils/` directory.
*   **Voice Recognition**: Use the browser's native `SpeechRecognition` API for any voice input requirements.