import { GoogleGenAI } from '@google/genai';

// Server-side only. The GEMINI_API_KEY is read from the environment and never
// reaches the browser. This runs as a Vercel serverless function (/api/triage).

// Override-able via env so a model rename doesn't require a code change.
// Flash models are on Google's free tier. 2.5-flash is GA with stable free-tier
// capacity; set GEMINI_MODEL=gemini-3.5-flash to use the newer model.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are MASA's AI-powered member triage assistant. MASA (Medical Air Services Association) provides emergency medical transportation coverage to members in the US and Caribbean since 1974.

MASA Emergent Plus coverage includes:
- Emergency ground ambulance transport (911 dispatched)
- Emergency air ambulance (helicopter or fixed-wing)
- Inter-facility medical transport when medically necessary
- Medical repatriation for members hospitalized away from home (domestic and international)
- Coverage for member, spouse, and dependent children

NOT covered:
- Non-emergency or elective transport
- Transport for routine medical appointments
- Transport that is not medically necessary

Assess the member's situation: urgency level, coverage eligibility, the rationale, a recommended next step for the claims team, a plain-language summary, and an empathetic draft response (3-4 sentences) to send to the member or their family.`;

// Gemini structured output: responseMimeType forces JSON and responseSchema
// constrains the shape, so the response is reliably parseable.
const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    urgency: { type: 'string', enum: ['Critical', 'High', 'Moderate', 'Low'] },
    coverage: {
      type: 'string',
      enum: ['Covered', 'Likely Covered', 'Needs Review', 'Not Covered'],
    },
    coverage_reason: { type: 'string' },
    recommended_action: { type: 'string' },
    member_summary: { type: 'string' },
    draft_response: { type: 'string' },
  },
  required: [
    'urgency',
    'coverage',
    'coverage_reason',
    'recommended_action',
    'member_summary',
    'draft_response',
  ],
  propertyOrdering: [
    'urgency',
    'coverage',
    'coverage_reason',
    'recommended_action',
    'member_summary',
    'draft_response',
  ],
};

// Google returns 503/UNAVAILABLE ("high demand") or 429 on transient overload —
// these are worth a quick retry rather than failing the user's request outright.
function isRetryable(err) {
  const status = err?.status ?? err?.code;
  if (status === 429 || status === 500 || status === 503) return true;
  return /UNAVAILABLE|overloaded|high demand|"code":\s*(429|500|503)/i.test(
    String(err?.message ?? ''),
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(ai, params, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || i === attempts - 1) throw err;
      await sleep(500 * 2 ** i); // 500ms, then 1000ms
    }
  }
  throw lastErr;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error:
        'Server is missing GEMINI_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy.',
    });
  }

  const { message } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A "message" string is required.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await generateWithRetry(ai, {
      model: MODEL,
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: TRIAGE_SCHEMA,
        maxOutputTokens: 1000,
      },
    });

    const raw = response.text;
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error('Triage failed:', err);
    if (isRetryable(err)) {
      return res.status(503).json({
        error: 'The AI service is busy right now. Please try again in a moment.',
      });
    }
    const status = typeof err?.status === 'number' ? err.status : 500;
    return res.status(status).json({ error: err?.message || 'Triage request failed.' });
  }
}
