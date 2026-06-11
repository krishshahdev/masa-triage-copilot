import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import TriageCard from './components/TriageCard';
import ExampleChips from './components/ExampleChips';
import { runTriage } from './lib/triage';
import './App.css';

const WELCOME = {
  role: 'system',
  text: "Hello! I'm the MASA triage assistant. Describe the member's emergency situation and I'll assess coverage eligibility, urgency, and prepare a response for your team.",
};

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [triageData, setTriageData] = useState(null);

  async function handleSubmit() {
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: 'member', text: msg }]);
    setInput('');
    setLoading(true);
    setTriageData(null);

    try {
      const result = await runTriage(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Triage complete. See the assessment card below.' },
      ]);
      setTriageData(result);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `Error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-eyebrow">MASA · Member Services</div>
        <h1>Member Intake & Triage Copilot</h1>
        <p>Describe the emergency situation. The AI will assess coverage, urgency, and draft a response for the claims team.</p>
      </header>

      <ExampleChips onSelect={setInput} />
      <ChatWindow messages={messages} loading={loading} />

      <div className="input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the emergency situation..."
          disabled={loading}
        />
        <button onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? 'Analyzing...' : 'Triage →'}
        </button>
      </div>

      <TriageCard data={triageData} />
    </div>
  );
}
