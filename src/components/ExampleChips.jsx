const EXAMPLES = [
  "My father is a MASA member and just had a heart attack at home. We called 911 and an ambulance is on the way. He's 68 and unconscious. Will his emergency transport be covered?",
  "I was in a serious car accident on the highway. Injuries are severe and paramedics say I need to be airlifted to a trauma center 40 miles away. I've been a MASA member since 2019.",
  "My wife and I are vacationing in Jamaica and she's been hospitalized with a severe infection. The local hospital says she needs medical evacuation back to the US. We've been members for 3 years.",
  "I slipped on ice in my driveway and hurt my ankle. I don't think it's broken but my neighbor wants to call an ambulance. I'm a MASA member — is this kind of transport covered?"
];

export default function ExampleChips({ onSelect }) {
  return (
    <div className="examples">
      <p className="examples-label">Try an example</p>
      <div className="chips">
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="chip" onClick={() => onSelect(ex)}>
            {["Heart attack, ambulance", "Car accident, airlift", "Overseas hospitalization", "Slip and fall"][i]}
          </button>
        ))}
      </div>
    </div>
  );
}
