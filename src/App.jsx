import { useState } from 'react';
import { useStore } from './useStore';
import ParentView from './ParentView';
import ChildView from './ChildView';
import PinModal from './PinModal';
import './App.css';

export default function App() {
  const store = useStore();
  const [mode, setMode]       = useState('child');
  const [showPin, setShowPin] = useState(false);

  function requestParentMode() {
    if (mode === 'parent') {
      setMode('child');
    } else {
      setShowPin(true);
    }
  }

  function onPinSuccess() {
    setShowPin(false);
    setMode('parent');
  }

  const isParent = mode === 'parent';

  return (
    <div className="app">
      {showPin && (
        <PinModal
          correctPin={store.parentPin}
          onSuccess={onPinSuccess}
          onCancel={() => setShowPin(false)}
        />
      )}

      <header className="header">
        <div className="header-top">
          <div className="app-title">
            {isParent ? '⚙️ Parent Dashboard' : '⭐ Homework Hero'}
          </div>
          <button className="mode-toggle" onClick={requestParentMode}>
            {isParent ? '👦 Child View' : '🔒 Parent'}
          </button>
        </div>
        <div className="header-subtitle">
          {isParent
            ? 'Manage tasks, rewards & stats'
            : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>

        {!isParent && (
          <div className="points-banner">
            <div className="points-value">{store.totalPoints}</div>
            <div className="points-info">
              <span className="points-label">Total Points</span>
              <span className="points-sub">
                {store.completedToday.length} task{store.completedToday.length !== 1 ? 's' : ''} done today
              </span>
            </div>
          </div>
        )}
      </header>

      {isParent
        ? <ParentView store={store} />
        : <ChildView  store={store} />
      }
    </div>
  );
}
