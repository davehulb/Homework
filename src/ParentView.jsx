import { useState } from 'react';

const TASK_ICONS   = ['📚','✏️','🧮','🔬','🎨','🎵','🏃','🧹','🍽️','🐕'];
const REWARD_ICONS = ['🎮','🍦','🎬','🏖️','🎁','🧸','🎯','🎪','🛒','🏅'];

export default function ParentView({ tab, store }) {
  return (
    <div className="main">
      {tab === 'tasks'   && <TaskManager   store={store} />}
      {tab === 'rewards' && <RewardManager store={store} />}
      {tab === 'stats'   && <StatsView     store={store} />}
    </div>
  );
}

function TaskManager({ store }) {
  const [name,   setName]   = useState('');
  const [points, setPoints] = useState('');
  const [icon,   setIcon]   = useState('📚');

  function submit(e) {
    e.preventDefault();
    const pts = parseInt(points, 10);
    if (!name.trim() || !pts || pts < 1) return;
    store.addTask({ name: name.trim(), points: pts, icon });
    setName(''); setPoints('');
  }

  return (
    <>
      <div className="card">
        <div className="section-title">➕ Add Homework Task</div>
        <form onSubmit={submit}>
          <div className="form-row">
            <select
              className="input emoji-select"
              value={icon}
              onChange={e => setIcon(e.target.value)}
            >
              {TASK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input
              className="input"
              placeholder="Task name (e.g. Math worksheet)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="999"
              placeholder="Points"
              value={points}
              onChange={e => setPoints(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Add Task
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">📋 Tasks ({store.tasks.length})</div>
        {store.tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            No tasks yet. Add some above!
          </div>
        ) : store.tasks.map(task => (
          <div key={task.id} className="task-item">
            <span className="item-icon">{task.icon}</span>
            <div className="task-info">
              <div className="task-name">{task.name}</div>
              <div className="task-pts">{task.points} pts per completion</div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => store.removeTask(task.id)}
              aria-label="Delete task"
            >×</button>
          </div>
        ))}
      </div>
    </>
  );
}

function RewardManager({ store }) {
  const [name,   setName]   = useState('');
  const [points, setPoints] = useState('');
  const [icon,   setIcon]   = useState('🎮');

  function submit(e) {
    e.preventDefault();
    const pts = parseInt(points, 10);
    if (!name.trim() || !pts || pts < 1) return;
    store.addReward({ name: name.trim(), pointsRequired: pts, icon });
    setName(''); setPoints('');
  }

  return (
    <>
      <div className="card">
        <div className="section-title">➕ Add Reward</div>
        <form onSubmit={submit}>
          <div className="form-row">
            <select
              className="input emoji-select"
              value={icon}
              onChange={e => setIcon(e.target.value)}
            >
              {REWARD_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input
              className="input"
              placeholder="Reward name (e.g. Movie night)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="9999"
              placeholder="Points"
              value={points}
              onChange={e => setPoints(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Add Reward
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">🎁 Rewards ({store.rewards.length})</div>
        {store.rewards.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎀</div>
            No rewards yet. Add some above!
          </div>
        ) : store.rewards.map(reward => (
          <div key={reward.id} className="task-item">
            <span className="item-icon">{reward.icon}</span>
            <div className="task-info">
              <div className="task-name">{reward.name}</div>
              <div className="task-pts">{reward.pointsRequired} pts to unlock</div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => store.removeReward(reward.id)}
              aria-label="Delete reward"
            >×</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">🏅 Prize History</div>
        {store.claimedRewards.length === 0 ? (
          <div className="empty" style={{ padding: '12px 0' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No prizes claimed yet</span>
          </div>
        ) : [...store.claimedRewards].reverse().map((c, i) => (
          <div key={i} className="history-entry">
            <span>{c.icon} {c.rewardName}</span>
            <div style={{ textAlign: 'right' }}>
              <div className="badge badge-gold">{c.pointsSpent} ⭐ spent</div>
              <div className="history-date">{c.date}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatsView({ store }) {
  const todayCompletions = store.completions.filter(c => c.date === store.todayStr);
  const totalEarned      = store.completions.reduce((s, c) => s + c.points, 0);

  const byDate = {};
  for (const c of store.completions) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }
  const recentDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{store.totalPoints}</div>
          <div className="stat-label">Current Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayCompletions.length}</div>
          <div className="stat-label">Done Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalEarned}</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{store.claimedRewards.length}</div>
          <div className="stat-label">Rewards Claimed</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">📅 Recent Activity</div>
        {recentDates.length === 0 ? (
          <div className="empty" style={{ padding: '12px 0' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No activity yet</span>
          </div>
        ) : recentDates.map(date => (
          <div key={date}>
            <div className="date-header">
              {date === store.todayStr ? 'Today' : date}
            </div>
            {byDate[date].map((c, i) => (
              <div key={i} className="history-entry">
                <span>{c.taskName}</span>
                <span className="badge badge-purple">+{c.points} pts</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
