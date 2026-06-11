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

You must respond ONLY with a valid JSON object. No markdown, no backticks, no preamble. Use this exact schema:
{
  "urgency": "Critical" | "High" | "Moderate" | "Low",
  "coverage": "Covered" | "Likely Covered" | "Needs Review" | "Not Covered",
  "coverage_reason": "one sentence explanation",
  "recommended_action": "specific next step for the claims team",
  "member_summary": "2-3 sentence plain-language summary of the situation",
  "draft_response": "A professional, empathetic 3-4 sentence message to send to the member or their family"
}`;

export async function runTriage(message) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API request failed');
  }

  const data = await response.json();
  const raw = data.content.map((b) => b.text || '').join('');
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
