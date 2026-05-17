import { useState, useEffect, useCallback } from 'react';

const DEFAULT_STATE = {
  totalPoints: 0,
  tasks: [],
  rewards: [],
  completions: [],  // { id, taskId, date, points, taskName }
  claimedRewards: [], // { rewardId, date, rewardName, pointsSpent }
  parentPin: '1234',
};

function load() {
  try {
    const raw = localStorage.getItem('homework-app');
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state) {
  localStorage.setItem('homework-app', JSON.stringify(state));
}

export function useStore() {
  const [state, setState] = useState(load);

  useEffect(() => { save(state); }, [state]);

  const update = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  // ── Tasks ──
  const addTask = useCallback((task) => {
    update(s => ({ ...s, tasks: [...s.tasks, { ...task, id: crypto.randomUUID() }] }));
  }, [update]);

  const removeTask = useCallback((id) => {
    update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, [update]);

  // ── Rewards ──
  const addReward = useCallback((reward) => {
    update(s => ({ ...s, rewards: [...s.rewards, { ...reward, id: crypto.randomUUID() }] }));
  }, [update]);

  const removeReward = useCallback((id) => {
    update(s => ({ ...s, rewards: s.rewards.filter(r => r.id !== id) }));
  }, [update]);

  // ── Completions ──
  const todayStr = new Date().toISOString().slice(0, 10);

  const completedToday = state.completions.filter(c => c.date === todayStr).map(c => c.taskId);

  const toggleTask = useCallback((task) => {
    update(s => {
      const today = new Date().toISOString().slice(0, 10);
      const alreadyDone = s.completions.some(c => c.taskId === task.id && c.date === today);
      if (alreadyDone) {
        // un-complete
        return {
          ...s,
          totalPoints: Math.max(0, s.totalPoints - task.points),
          completions: s.completions.filter(c => !(c.taskId === task.id && c.date === today)),
        };
      } else {
        // complete
        return {
          ...s,
          totalPoints: s.totalPoints + task.points,
          completions: [
            ...s.completions,
            { id: crypto.randomUUID(), taskId: task.id, date: today, points: task.points, taskName: task.name },
          ],
        };
      }
    });
  }, [update]);

  // ── Claim reward ──
  const claimReward = useCallback((reward) => {
    update(s => {
      if (s.totalPoints < reward.pointsRequired) return s;
      return {
        ...s,
        totalPoints: s.totalPoints - reward.pointsRequired,
        claimedRewards: [
          ...s.claimedRewards,
          {
            rewardId: reward.id,
            date: new Date().toISOString().slice(0, 10),
            rewardName: reward.name,
            pointsSpent: reward.pointsRequired,
          },
        ],
      };
    });
  }, [update]);

  // ── PIN ──
  const setPin = useCallback((pin) => {
    update(s => ({ ...s, parentPin: pin }));
  }, [update]);

  return {
    ...state,
    completedToday,
    todayStr,
    addTask,
    removeTask,
    addReward,
    removeReward,
    toggleTask,
    claimReward,
    setPin,
  };
}
