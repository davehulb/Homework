import { BADGE_DEFS, getEarnedBadgeIds } from './useStore';
import { playTick, playUntick, playAllDone } from './sounds';

export default function ChildView({ tab, store, onClaim }) {
  return (
    <div className="main">
      {tab === 'tasks'    && <TodayTasks     store={store} />}
      {tab === 'rewards'  && <RewardProgress store={store} onClaim={onClaim} />}
      {tab === 'trophies' && <TrophiesView   store={store} />}
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

  function handleToggle(task) {
    const isDone = store.completedToday.includes(task.id);
    if (!isDone) {
      const willCompleteAll = doneTodayCount + 1 === totalTasks;
      if (willCompleteAll) {
        setTimeout(playAllDone, 200);
      } else {
        playTick();
      }
    } else {
      playUntick();
    }
    store.toggleTask(task);
  }

  return (
    <>
      {totalTasks > 0 && (
        <div className={`card progress-card ${allDone ? 'all-done' : ''}`}>
          {allDone ? (
            <div className="all-done-banner">
              <div className="all-done-emoji">🌟</div>
              <div className="all-done-title">Amazing, Iris!</div>
              <div className="all-done-sub">You finished ALL your tasks today!</div>
              <div className="all-done-points">+{earnedToday} ⭐ stars earned!</div>
            </div>
          ) : (
            <>
              <div className="progress-summary">
                <div>
                  <div className="progress-label-sm">Today&apos;s Progress</div>
                  <div className="progress-big">
                    {doneTodayCount}<span className="progress-of">/{totalTasks}</span>
                  </div>
                  <div className="progress-label-sm">tasks done</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="progress-label-sm">Stars earned</div>
                  <div className="progress-big earned-pts">+{earnedToday}</div>
                  <div className="progress-label-sm">today ⭐</div>
                </div>
              </div>
              <div className="progress-bar-wrap" style={{ marginTop: 14 }}>
                <div
                  className="progress-bar"
                  style={{ width: totalTasks > 0 ? `${(doneTodayCount / totalTasks) * 100}%` : '0%' }}
                />
              </div>
              <div className="progress-keep-going">
                {totalTasks - doneTodayCount} more to go — you can do it! 💪
              </div>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="section-title">📚 Today&apos;s Homework</div>
        {store.tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🌸</div>
            No tasks yet — ask a parent to add some!
          </div>
        ) : store.tasks.map(task => {
          const done = store.completedToday.includes(task.id);
          return (
            <div
              key={task.id}
              className={`task-item ${done ? 'task-done' : ''}`}
              onClick={() => handleToggle(task)}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleToggle(task)}
            >
              <div className={`task-check ${done ? 'checked' : ''}`}>
                {done ? '★' : '☆'}
              </div>
              <span className="item-icon">{task.icon}</span>
              <div className="task-info">
                <div className={`task-name ${done ? 'done' : ''}`}>{task.name}</div>
                <div className="task-pts">+{task.points} ⭐</div>
              </div>
              {done && <span className="task-done-badge">Done! ✓</span>}
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
          No prizes set up yet — ask a parent!
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card prize-intro-card">
        <div className="prize-intro-title">✨ Your Prizes ✨</div>
        <div className="prize-intro-sub">
          You have <strong>{store.totalPoints} ⭐ stars</strong> to spend!
        </div>
      </div>

      {sorted.map(reward => {
        const pct       = Math.min(100, (store.totalPoints / reward.pointsRequired) * 100);
        const canClaim  = store.totalPoints >= reward.pointsRequired;
        const remaining = reward.pointsRequired - store.totalPoints;

        return (
          <div key={reward.id} className={`card reward-card ${canClaim ? 'reward-ready' : ''}`}>
            <div className="reward-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{reward.icon}</span>
                <span className="reward-name">{reward.name}</span>
              </div>
              <span className="reward-cost">{reward.pointsRequired} ⭐</span>
            </div>

            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>

            <div className="progress-meta">
              <span>{store.totalPoints} / {reward.pointsRequired} stars</span>
              {canClaim
                ? <span className="ready-text">Ready! 🎉</span>
                : <span>{remaining} more to go!</span>
              }
            </div>

            {canClaim && (
              <>
                <button className="btn-claim" onClick={() => onClaim(reward)}>
                  🎁 Claim This Prize!
                </button>
                <div className="claim-note">All {store.totalPoints} stars will be spent</div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

function TrophiesView({ store }) {
  const earnedIds   = getEarnedBadgeIds(store, store.streak);
  const earnedCount = earnedIds.size;

  return (
    <>
      <div className="card trophy-header-card">
        <div className="trophy-title">🏆 Iris&apos;s Trophy Cabinet</div>
        <div className="trophy-sub">
          {earnedCount} / {BADGE_DEFS.length} trophies unlocked!
        </div>
        <div className="trophy-progress-bar-wrap">
          <div
            className="trophy-progress-bar"
            style={{ width: `${(earnedCount / BADGE_DEFS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="badges-grid">
        {BADGE_DEFS.map(badge => {
          const earned = earnedIds.has(badge.id);
          return (
            <div key={badge.id} className={`badge-card ${earned ? 'badge-earned' : 'badge-locked'}`}>
              <div className="badge-emoji">{earned ? badge.emoji : '🔒'}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.desc}</div>
              {earned && <div className="badge-unlocked-tag">Unlocked! ✓</div>}
            </div>
          );
        })}
      </div>

      {store.claimedRewards.length > 0 && (
        <div className="card">
          <div className="section-title">🎁 Prizes I&apos;ve Earned</div>
          {[...store.claimedRewards].reverse().map((c, i) => (
            <div key={i} className="history-entry">
              <span>{c.icon} {c.rewardName}</span>
              <div style={{ textAlign: 'right' }}>
                <div className="badge badge-gold">{c.pointsSpent} ⭐ spent</div>
                <div className="history-date">{c.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
