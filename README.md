# JARVIS Web V1.1

Mobile-first JARVIS-style PWA upgraded with a secure server-side Gemini AI brain.

## What changed from V1
- Real Gemini AI conversation through a Node/Express backend.
- Gemini API key stays server-side; it is never shipped to browser JavaScript.
- Multi-turn context is kept locally in the browser and sent in a bounded window.
- Gemini Google Search grounding is enabled for current-information questions.
- Existing V1 features remain: voice input/TTS, English/Hindi, time/date, weather, search, YouTube, Maps, local memory, wake phrase, stop/mute, and confirmation-gated call/message handoffs.
- `/api/health` reports backend readiness without exposing secrets.

## Run locally

1. Install Node.js 20+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Gemini API key in `.env` as `GEMINI_API_KEY=...`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

Do not commit `.env` or your API key.

## Deployment

V1.1 needs a Node-capable host because the AI key must remain on the server. GitHub Pages can still host the static V1 frontend, but it cannot safely run this backend.

A simple option is a Node web service such as Render. Set the environment variable `GEMINI_API_KEY` in the host dashboard and use `npm start` as the start command.

## Security notes

- The browser never receives the Gemini API key.
- The backend limits request size and conversation history.
- The model is not trusted to perform protected device actions.
- Sensitive call/message handoffs remain behind the existing UI authorization dialog.
- Android/device control is intentionally not claimed by this web build.
