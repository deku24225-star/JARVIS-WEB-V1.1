# JARVIS Web V1.1 — OpenRouter Edition

Mobile-first JARVIS web/PWA with a server-side AI backend.

## AI provider

This edition uses **OpenRouter** instead of Gemini. The browser never receives the OpenRouter API key.

Default model:

`openrouter/free`

You can change `OPENROUTER_MODEL` on the server/Render without changing frontend code.

## Local setup

```bash
npm install
```

Create `.env`:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/free
OPENROUTER_WEB_SEARCH=false
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=JARVIS Web
PORT=3000
```

Then:

```bash
npm start
```

Open `http://localhost:3000`.

## Render setup

Create a Node Web Service connected to this repository.

Build command:

`npm install`

Start command:

`npm start`

Environment variables:

- `OPENROUTER_API_KEY` = your OpenRouter key
- `OPENROUTER_MODEL` = `openrouter/free` (default)
- `OPENROUTER_WEB_SEARCH` = `false` initially
- `OPENROUTER_SITE_URL` = your deployed JARVIS URL (optional)
- `OPENROUTER_SITE_NAME` = `JARVIS Web`

Never commit the API key to GitHub or put it in `app.js`/`index.html`.

## Web search

Set `OPENROUTER_WEB_SEARCH=true` only if you want OpenRouter web-search grounding. OpenRouter documents that web search can add cost even when using free models, so it is deliberately opt-in.

## Health check

Open `/api/health` on your deployed service. It should report:

```json
{
  "ok": true,
  "aiConfigured": true,
  "provider": "OpenRouter"
}
```
