import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const apiKey = process.env.OPENROUTER_API_KEY;

app.use(express.json({ limit: '256kb' }));
app.use(express.static(__dirname));

// OpenRouter exposes an OpenAI-compatible Chat Completions API.
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Use OpenRouter's free-model router by default. You can override this in Render.
const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
// Web search is OFF by default because OpenRouter documents that web search can add cost
// even when the selected model itself is free. Set OPENROUTER_WEB_SEARCH=true if desired.
const WEB_SEARCH = String(process.env.OPENROUTER_WEB_SEARCH || 'false').toLowerCase() === 'true';
const MAX_MESSAGES = 20;
const MAX_CHARS = 12000;

const BASE_INSTRUCTION = `You are JARVIS, a helpful futuristic personal AI assistant.
Personality: confident, warm, concise, intelligent, lightly witty, and like a trusted best friend.
Never claim to have performed a device action unless the application actually performed it.
The browser is sandboxed: do not pretend you can access private apps, hidden files, the camera, microphone, contacts, calls, messages, or Android settings unless a real application tool explicitly reports success.
Sensitive actions require explicit user confirmation in the UI. Never bypass permissions, authentication, or platform security.
If current information is available in the conversation or through an enabled web-search tool, use it and distinguish current facts from general knowledge.
Support English and Hindi naturally. Tolerate spelling and speech-to-text mistakes.
Keep normal replies reasonably concise unless the user asks for depth.`;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_MESSAGES).filter(m =>
    m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string'
  ).map(m => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.text.slice(0, MAX_CHARS)
  }));
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(part => typeof part === 'string' ? part : (part?.text || '')).join('').trim();
  }
  return '';
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(apiKey),
    provider: 'OpenRouter',
    model: MODEL,
    webSearch: WEB_SEARCH,
    version: '1.1.1-openrouter'
  });
});

app.post('/api/chat', async (req, res) => {
  if (!apiKey) {
    return res.status(503).json({
      error: 'JARVIS AI backend is not configured yet. Add OPENROUTER_API_KEY to the server environment.'
    });
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > MAX_CHARS) {
    return res.status(400).json({ error: 'Invalid message.' });
  }

  const history = cleanHistory(req.body?.history);
  const language = req.body?.language === 'hi-IN' ? 'Hindi' : 'English';
  const personality = typeof req.body?.personality === 'string'
    ? req.body.personality.slice(0, 80)
    : 'Male Best Friend';

  const messages = [
    { role: 'system', content: `${BASE_INSTRUCTION}\nCurrent response language preference: ${language}.\nSelected personality mode: ${personality}.` },
    ...history,
    { role: 'user', content: message }
  ];

  const body = {
    model: MODEL,
    messages,
    temperature: 0.7
  };

  // OpenRouter's :online route/plugin enables web search. It may add cost, so it is opt-in.
  if (WEB_SEARCH) {
    body.plugins = [{ id: 'web' }];
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'JARVIS Web'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMessage = data?.error?.message || data?.error || `HTTP ${response.status}`;
      console.error('OpenRouter request failed:', providerMessage);
      return res.status(502).json({
        error: `JARVIS AI request failed: ${String(providerMessage).slice(0, 500)}`
      });
    }

    const text = extractText(data?.choices?.[0]?.message?.content);
    if (!text) {
      return res.status(502).json({ error: 'The AI returned an empty response. Try again.' });
    }

    res.json({
      ok: true,
      text,
      requestId: data?.id || null,
      model: data?.model || MODEL,
      provider: 'OpenRouter'
    });
  } catch (error) {
    console.error('OpenRouter request failed:', error?.message || error);
    res.status(502).json({
      error: 'JARVIS could not reach OpenRouter right now. Check the backend configuration and try again.'
    });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, '0.0.0.0', () => {
  console.log(`JARVIS V1.1 OpenRouter backend running on port ${port}`);
  console.log(`Model: ${MODEL} | Web search: ${WEB_SEARCH ? 'ON' : 'OFF'}`);
});
