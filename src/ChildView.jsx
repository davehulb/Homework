import { useState } from 'react';
import Celebration from './Celebration';

export default function ChildView({ store }) {
  const [tab, setTab]           = useState('tasks');
  const [celebration, setCelebration] = useState(null);

  function handleClaim(reward) {
    store.claimReward(reward);
    setCelebration(reward);
  }

  return (
    <>
      {celebration && (
        <Celebration reward={celebration} onClose={() => setCelebration(null)} />
      )}

      <nav className="nav">
        <button
          className={`nav-tab ${tab === 'tasks' ? 'active' : ''}`}
          onClick={() => setTab('tasks')}
        >
          📋 Today
        </button>
        <button
          className={`nav-tab ${tab === 'rewards' ? 'active' : ''}`}
          onClick={() => setTab('rewards')}
        >
          🎁 Rewards
        </button>
      </nav>

      <div className="main">
        {tab === 'tasks'   && <TodayTasks store={store} />}
        {tab === 'rewards' && <RewardProgress store={store} onClaim={handleClaim} />}
      </div>
    </>
  );
}

function TodayTasks({ store }) {
  const doneTodayCount = store.completedToday.length;
  const totalTasks     = store.tasks.length;
  const earnedToday    = store.completions
    .filter(c => c.date === store.todayStr)
    .reduce((s, c) => s + c.points, 0);

  return (
    <>
      {totalTasks > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg,#f0eeff,#fff)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Today's Progress</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>
                {doneTodayCount} / {totalTasks}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>tasks done</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Earned today</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--success)' }}>+{earnedToday}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>points</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="progress-bar-wrap" style={{ height: 10 }}>
              <div
                className="progress-bar"
                style={{ width: totalTasks > 0 ? `${(doneTodayCount / totalTasks) * 100}%` : '0%' }}
              />
            </div>
            {doneTodayCount === totalTasks && totalTasks > 0 && (
              <div style={{ textAlign: 'center', marginTop: 8, fontWeight: 700, color: 'var(--success)', fontSize: 13 }}>
                🎉 All tasks complete! Great job!
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">📋 Homework Tasks</div>

        {store.tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">😴</div>
            No tasks yet — ask a parent to add some!
          </div>
        ) : store.tasks.map(task => {
          const done = store.completedToday.includes(task.id);
          return (
            <div key={task.id} className="task-item">
              <div
                className={`task-check ${done ? 'checked' : ''}`}
                onClick={() => store.toggleTask(task)}
                role="checkbox"
                aria-checked={done}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && store.toggleTask(task)}
              >
                {done ? '✓' : ''}
              </div>
              <span style={{ fontSize: 22 }}>{task.icon}</span>
              <div className="task-info">
                <div className={`task-name ${done ? 'done' : ''}`}>{task.name}</div>
                <div className="task-pts">+{task.points} pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function RewardProgress({ store, onClaim }) {
  const sorted = [...store.rewards].sort((a, b) => a.pointsRequired - b.pointsRequired);

  return (
    <>
      {store.rewards.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">🎀</div>
            No rewards set up yet — ask a parent!
          </div>
        </div>
      ) : sorted.map(reward => {
        const pct     = Math.min(100, (store.totalPoints / reward.pointsRequired) * 100);
        const canClaim = store.totalPoints >= reward.pointsRequired;
        const remaining = reward.pointsRequired - store.totalPoints;

        return (
          <div key={reward.id} className="card">
            <div className="reward-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{reward.icon}</span>
                <span className="reward-name" style={{ fontSize: 15 }}>{reward.name}</span>
              </div>
              <span className="reward-cost">{reward.pointsRequired} pts</span>
            </div>

            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>

            <div className="progress-label">
              <span>{store.totalPoints} / {reward.pointsRequired} pts</span>
              {canClaim
                ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>Ready! 🎉</span>
                : <span>{remaining} more to go</span>
              }
            </div>

            {canClaim && (
              <button className="btn-claim" onClick={() => onClaim(reward)}>
                🎁 Claim Reward!
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
