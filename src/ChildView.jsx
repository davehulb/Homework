export default function ChildView({ tab, store, onClaim }) {
  return (
    <div className="main">
      {tab === 'tasks'   && <TodayTasks    store={store} />}
      {tab === 'rewards' && <RewardProgress store={store} onClaim={onClaim} />}
    </div>
  );
}

function TodayTasks({ store }) {
  const doneTodayCount = store.completedToday.length;
  const totalTasks     = store.tasks.length;
  const earnedToday    = store.completions
    .filter(c => c.date === store.todayStr)
    .reduce((s, c) => s + c.points, 0);
  const allDone = totalTasks > 0 && doneTodayCount === totalTasks;

  return (
    <>
      {totalTasks > 0 && (
        <div className={`card progress-card ${allDone ? 'all-done' : ''}`}>
          <div className="progress-summary">
            <div>
              <div className="progress-label-sm">Today&apos;s Progress</div>
              <div className="progress-big">{doneTodayCount} / {totalTasks}</div>
              <div className="progress-label-sm">tasks done</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="progress-label-sm">Earned today</div>
              <div className="progress-big" style={{ color: 'var(--success)' }}>+{earnedToday}</div>
              <div className="progress-label-sm">points</div>
            </div>
          </div>
          <div className="progress-bar-wrap" style={{ height: 12, marginTop: 12 }}>
            <div
              className="progress-bar"
              style={{ width: totalTasks > 0 ? `${(doneTodayCount / totalTasks) * 100}%` : '0%' }}
            />
          </div>
          {allDone && (
            <div className="all-done-msg">🎉 All tasks complete! Great job!</div>
          )}
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
              <span className="item-icon">{task.icon}</span>
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

  if (store.rewards.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <div className="empty-icon">🎀</div>
          No rewards set up yet — ask a parent!
        </div>
      </div>
    );
  }

  return (
    <>
      {sorted.map(reward => {
        const pct      = Math.min(100, (store.totalPoints / reward.pointsRequired) * 100);
        const canClaim = store.totalPoints >= reward.pointsRequired;
        const remaining = reward.pointsRequired - store.totalPoints;

        return (
          <div key={reward.id} className={`card reward-card ${canClaim ? 'reward-ready' : ''}`}>
            <div className="reward-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{reward.icon}</span>
                <span className="reward-name">{reward.name}</span>
              </div>
              <span className="reward-cost">{reward.pointsRequired} pts</span>
            </div>

            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>

            <div className="progress-meta">
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
