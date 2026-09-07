# JARVIS Web V1.2 — OpenRouter Edition

V1.2 upgrades the existing V1.1 web/PWA without exposing the OpenRouter key.

## V1.2 architecture

Browser/PWA → JARVIS UI → local natural-command router → security confirmation → browser actions
                                   ↘ OpenRouter backend → AI response
                                   ↘ Memory Core (explicit, local, user-controlled)

### Memory decision
For the current single-device PWA, explicit memories are stored in browser `localStorage`. This is intentionally limited: it is persistent on that device/browser, transparent to the user, and does not require a database yet. The code keeps a repository-like memory boundary so V1.3+ can replace the storage implementation with an encrypted/server database without rewriting the UI or command layer.

Conversation history is separate from persistent memory and is also local. It is bounded and only sent as recent context to the backend.

Do not treat localStorage as a secure vault. Sensitive secrets should never be stored there. V1.2 only stores explicit, ordinary user-requested memories.

## Current information

The backend computes current server date/time dynamically and passes it to the model. There is no hard-coded year. Current-information requests are detected separately. If `OPENROUTER_WEB_SEARCH=true`, V1.2 enables OpenRouter's web plugin for requests that look current; otherwise JARVIS must not pretend it has live web grounding.

## Natural commands

Common browser-capable intents are handled without shortcut buttons: time, date, weather, Google search, YouTube, Maps, remember/forget memory, call preparation, and message preparation. Sensitive actions use the existing confirmation dialog.

Alarms, reliable background reminders, private Android-app control, and deep device control remain native-Android work for later versions; V1.2 does not fake those capabilities.

## Formatting / TTS

AI replies are rendered as safe, lightweight Markdown-like HTML. TTS receives a separate speech-safe representation so it does not speak Markdown markers, headings, or words such as “asterisk”/“hashtag”.

## Render

Build: `npm install`
Start: `npm start`

Environment:
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (default `openrouter/free`)
- `OPENROUTER_WEB_SEARCH` (`false` by default)
- `OPENROUTER_SITE_URL`
- `OPENROUTER_SITE_NAME`

Never commit the API key.
