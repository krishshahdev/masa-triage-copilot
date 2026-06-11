import { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          <div className={`avatar ${msg.role}`}>
            {msg.role === 'member' ? 'M' : '🚁'}
          </div>
          <div className="bubble">{msg.text}</div>
        </div>
      ))}
      {loading && (
        <div className="message system">
          <div className="avatar system">🚁</div>
          <div className="bubble">
            <span className="dots"><span /><span /><span /></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
