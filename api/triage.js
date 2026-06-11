import Anthropic from '@anthropic-ai/sdk';

// Server-side only. Reads ANTHROPIC_API_KEY from the environment — the key never
// reaches the browser. This file runs as a Vercel serverless function (/api/triage).
const client = new Anthropic();

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

// Structured outputs guarantee the model returns JSON matching this exact shape,
// so the response is always parseable — no prompt-level "respond only in JSON" needed.
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
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { message } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A "message" string is required.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: TRIAGE_SCHEMA } },
      messages: [{ role: 'user', content: message }],
    });

    const raw = response.content.map((b) => b.text || '').join('');
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error('Triage failed:', err);
    const status = err?.status ?? 500;
    return res.status(status).json({ error: err?.message || 'Triage request failed.' });
  }
}
