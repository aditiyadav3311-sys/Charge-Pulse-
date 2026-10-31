import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. API: Extract structured notice from messy text
app.post('/api/extract-notice', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Notice text is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to local intelligence parser.',
        useFallback: true,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `Analyze this college announcement or forwarded WhatsApp notice:
"""
${text}
"""
Extract the key details. Today's date is ${todayStr}.
Resolve relative dates (like "tomorrow", "this Friday", "next Monday", "by midnight") relative to ${todayStr}.
Provide category strictly as one of: Academic, Events, Clubs, Placement, General.
Urgency:
- "urgent" if the deadline/event is within 48 hours or explicitly marked urgent.
- "upcoming" if in the future beyond 48 hours.
- "expired" if the date has clearly passed before ${todayStr}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Campus Pulse AI, a dedicated assistant for college students. You convert messy forwarded notices, emails, and WhatsApp messages into structured, reliable event cards. Always output valid JSON conforming strictly to the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Clear, concise title of the event, notice, or deadline',
            },
            category: {
              type: Type.STRING,
              description: 'One of: Academic, Events, Clubs, Placement, General',
            },
            date: {
              type: Type.STRING,
              description: 'Date in YYYY-MM-DD format if identifiable, or a clear relative string',
            },
            time: {
              type: Type.STRING,
              description: 'Time or time window (e.g. 10:00 AM - 1:00 PM, 11:59 PM)',
            },
            venue: {
              type: Type.STRING,
              description: 'Physical hall/room or virtual platform (e.g. Audi 2, Lab 402, Zoom, Google Form)',
            },
            summary: {
              type: Type.STRING,
              description: 'Crisp 1-2 sentence student summary of what they actually need to do',
            },
            urgency: {
              type: Type.STRING,
              description: 'urgent, upcoming, or expired',
            },
            actionUrl: {
              type: Type.STRING,
              description: 'Any registration link, submission portal URL, or RSVP link detected in the notice (or empty string)',
            },
            organizer: {
              type: Type.STRING,
              description: 'Club name, Professor, Department, or Council that issued it (or "Campus Admin" if unspecified)',
            },
          },
          required: ['title', 'category', 'date', 'summary', 'urgency'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedJson });
  } catch (err: any) {
    console.error('Extraction error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to extract notice details with Gemini',
      useFallback: true,
    });
  }
});

// 2. API: Weekly Digest Generator
app.post('/api/weekly-digest', async (req, res) => {
  try {
    const { notices } = req.body;
    if (!notices || !Array.isArray(notices) || notices.length === 0) {
      return res.status(400).json({ error: 'At least one notice is required to generate a digest.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API not configured. Falling back to local intelligence digest.',
        useFallback: true,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const simplifiedNotices = notices.map((n: any) => ({
      title: n.title,
      category: n.category,
      date: n.date,
      time: n.time || 'TBD',
      venue: n.venue || 'TBD',
      summary: n.summary,
      urgency: n.urgency,
    }));

    const prompt = `Current student date is ${todayStr}.
Here is the list of active campus notices for the student:
${JSON.stringify(simplifiedNotices, null, 2)}

Provide a concise, ultra-readable weekly executive digest answering "What do I need to know this week?".
Highlight urgent deadlines first, then important academic requirements, and exciting club/campus events.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Campus Pulse AI weekly briefing digest. Write a high-impact, easy-to-skim 3-sentence summary followed by 3 key bullet points and 1 actionable survival tip for the college week. Return valid JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: 'Catchy 4-7 word headline describing this week on campus',
            },
            summary: {
              type: Type.STRING,
              description: 'A 2-3 sentence readable digest of what to expect and prioritize this week',
            },
            criticalDeadlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Up to 3 high-priority deadlines or mandatory events',
            },
            campusHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1-3 social, club, or cultural events happening this week',
            },
            studentTip: {
              type: Type.STRING,
              description: 'A punchy, practical piece of advice for navigating this week smoothly',
            },
          },
          required: ['headline', 'summary', 'criticalDeadlines', 'campusHighlights', 'studentTip'],
        },
      },
    });

    const digestJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, digest: digestJson });
  } catch (err: any) {
    console.error('Digest error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate weekly digest with Gemini',
      useFallback: true,
    });
  }
});

// Vite Middleware for Dev & Static serving for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Campus Pulse server listening on http://0.0.0.0:${port}`);
  });
}

setupServer();
