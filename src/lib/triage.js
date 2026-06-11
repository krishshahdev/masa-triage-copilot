// Calls our own backend (/api/triage), which holds the Anthropic API key
// server-side. The key is never shipped to the browser.
export async function runTriage(message) {
  const response = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    let detail = 'Triage request failed.';
    try {
      const err = await response.json();
      detail = err.error || detail;
    } catch {
      // Error response wasn't JSON — keep the default message.
    }
    throw new Error(detail);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Received an unreadable response from the triage service.');
  }
}
