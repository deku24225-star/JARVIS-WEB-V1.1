import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const apiKey = process.env.GEMINI_API_KEY;

app.use(express.json({ limit: '256kb' }));
app.use(express.static(__dirname));

const MODEL = 'gemini-3.8-flash';
const MAX_MESSAGES = 20;
const MAX_CHARS = 12000;

const BASE_INSTRUCTION = `You are JARVIS, a helpful futuristic personal AI assistant.
Personality: confident, warm, concise, intelligent, lightly witty, and like a trusted best friend.
Never claim to have performed a device action unless the application actually performed it.
The browser is sandboxed: do not pretend you can access private apps, hidden files, the camera, microphone, contacts, calls, messages, or Android settings unless a real application tool explicitly reports success.
Sensitive actions require explicit user confirmation in the UI. Never bypass permissions, authentication, or platform security.
If the user asks for current information, use available search grounding when appropriate and distinguish current facts from general knowledge.
Support English and Hindi naturally. Tolerate spelling and speech-to-text mistakes.
Keep normal replies reasonably concise unless the user asks for depth.`;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_MESSAGES).filter(m =>
    m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string'
  ).map(m => ({
    type: m.role === 'user' ? 'user_input' : 'model_output',
    content: [{ type: 'text', text: m.text.slice(0, MAX_CHARS) }]
  }));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(apiKey), model: MODEL, version: '1.1.0' });
});

app.post('/api/chat', async (req, res) => {
  if (!apiKey) {
    return res.status(503).json({
      error: 'JARVIS AI backend is not configured yet. Add GEMINI_API_KEY to the server environment.'
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

  const systemInstruction = `${BASE_INSTRUCTION}\nCurrent response language preference: ${language}.\nSelected personality mode: ${personality}.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: MODEL,
      system_instruction: systemInstruction,
      input: [...history, {
        type: 'user_input',
        content: [{ type: 'text', text: message }]
      }],
      tools: [{ type: 'google_search' }],
      store: false
    });

    res.json({
      ok: true,
      text: interaction.output_text || 'I could not generate a response.',
      interactionId: interaction.id,
      model: MODEL
    });
  } catch (error) {
    console.error('Gemini request failed:', error?.message || error);
    res.status(502).json({
      error: 'JARVIS could not reach the AI brain right now. Check the backend configuration and try again.'
    });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => {
  console.log(`JARVIS V1.1 running at http://localhost:${port}`);
});
