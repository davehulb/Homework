import { useState } from 'react';

export default function PinModal({ correctPin, onSuccess, onCancel }) {
  const [entered, setEntered] = useState('');
  const [error, setError]     = useState(false);

  function press(digit) {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      if (next === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setEntered(''), 600);
      }
    }
  }

  function del() {
    setEntered(e => e.slice(0, -1));
    setError(false);
  }

  return (
    <div className="pin-overlay" onClick={onCancel}>
      <div className="pin-card" onClick={e => e.stopPropagation()}>
        <div className="pin-title">🔒 Parent Access</div>
        <div className="pin-sub">Enter your 4-digit PIN</div>

        <div className="pin-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${entered.length > i ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="pin-keypad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="pin-key" onClick={() => press(String(n))}>{n}</button>
          ))}
          <button className="pin-key" onClick={onCancel} style={{ fontSize: 14 }}>Cancel</button>
          <button className="pin-key" onClick={() => press('0')}>0</button>
          <button className="pin-key" onClick={del}>⌫</button>
        </div>

        {error && <div className="pin-error">Incorrect PIN. Try again.</div>}
      </div>
    </div>
  );
}
