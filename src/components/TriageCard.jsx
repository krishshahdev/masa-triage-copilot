const URGENCY_CLASS = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Moderate: 'badge-moderate',
  Low: 'badge-low',
};

const COVERAGE_CLASS = {
  'Covered': 'badge-covered',
  'Likely Covered': 'badge-covered',
  'Needs Review': 'badge-review',
  'Not Covered': 'badge-not-covered',
};

export default function TriageCard({ data }) {
  if (!data) return null;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="triage-card">
      <div className="triage-header">
        <span className="triage-title">Triage Assessment</span>
        <span className="triage-time">{time}</span>
      </div>

      <div className="triage-body">
        <div className="triage-row">
          <div className="triage-field">
            <label>Urgency</label>
            <span className={`badge ${URGENCY_CLASS[data.urgency]}`}>{data.urgency}</span>
          </div>
          <div className="triage-field">
            <label>Coverage status</label>
            <span className={`badge ${COVERAGE_CLASS[data.coverage]}`}>{data.coverage}</span>
          </div>
        </div>

        <div className="triage-field">
          <label>Coverage rationale</label>
          <p>{data.coverage_reason}</p>
        </div>

        <div className="triage-field">
          <label>Recommended action</label>
          <p>{data.recommended_action}</p>
        </div>

        <div className="triage-field">
          <label>Situation summary</label>
          <p>{data.member_summary}</p>
        </div>

        <div className="triage-field">
          <label>Draft member response</label>
          <div className="draft-box">{data.draft_response}</div>
        </div>
      </div>
    </div>
  );
}
