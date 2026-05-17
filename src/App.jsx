import { useState } from 'react';
import { useStore } from './useStore';
import ParentView from './ParentView';
import ChildView from './ChildView';
import PinModal from './PinModal';
import Celebration from './Celebration';
import './App.css';

const PARENT_TABS = [
  { id: 'tasks',   label: 'Tasks',   emoji: '📋' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'stats',   label: 'Stats',   emoji: '📊' },
];

const CHILD_TABS = [
  { id: 'tasks',   label: 'Today',   emoji: '✅' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
];

export default function App() {
  const store                         = useStore();
  const [mode, setMode]               = useState('child');
  const [showPin, setShowPin]         = useState(false);
  const [tab, setTab]                 = useState('tasks');
  const [celebration, setCelebration] = useState(null);

  const isParent = mode === 'parent';
  const tabs     = isParent ? PARENT_TABS : CHILD_TABS;

  function handleModeToggle() {
    if (isParent) { setMode('child'); setTab('tasks'); }
    else          { setShowPin(true); }
  }

  function onPinSuccess() {
    setShowPin(false);
    setMode('parent');
    setTab('tasks');
  }

  function handleClaim(reward) {
    store.claimReward(reward);
    setCelebration(reward);
  }

  return (
    <div className={`app ${isParent ? 'mode-parent' : 'mode-child'}`}>
      {showPin && (
        <PinModal
          correctPin={store.parentPin}
          onSuccess={onPinSuccess}
          onCancel={() => setShowPin(false)}
        />
      )}
      {celebration && (
        <Celebration reward={celebration} onClose={() => setCelebration(null)} />
      )}

      {/* ── Sidebar / Header ── */}
      <aside className="sidebar">
        <div className="sidebar-inner">

          <div className="brand-row">
            <div className="brand">
              <span className="brand-icon">⭐</span>
              <div>
                <div className="app-title">
                  {isParent ? 'Parent Dashboard' : 'Homework Hero'}
                </div>
                <div className="app-subtitle">
                  {isParent
                    ? 'Manage tasks & rewards'
                    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
            <button className="mode-toggle" onClick={handleModeToggle}>
              {isParent ? '👦 Child' : '🔒 Parent'}
            </button>
          </div>

          {!isParent && (
            <div className="points-banner">
              <div className="points-value">{store.totalPoints}</div>
              <div className="points-meta">
                <span className="points-label">Total Points</span>
                <span className="points-sub">
                  {store.completedToday.length} / {store.tasks.length} tasks done today
                </span>
              </div>
            </div>
          )}

          <nav className="nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`nav-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className="tab-emoji">{t.emoji}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </nav>

        </div>
      </aside>

      {/* ── Content Panel ── */}
      <div className="content-panel">
        {isParent
          ? <ParentView tab={tab} store={store} />
          : <ChildView  tab={tab} store={store} onClaim={handleClaim} />
        }
      </div>
    </div>
  );
}
