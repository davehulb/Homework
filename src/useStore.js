import { useState, useEffect, useCallback, useMemo } from 'react';

const DEFAULT_STATE = {
  totalPoints: 0,
  tasks: [],
  rewards: [],
  completions: [],
  claimedRewards: [],
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

function calcStreak(completions, tasks) {
  if (!tasks.length) return 0;
  const taskIds = tasks.map(t => t.id);
  const byDate = {};
  for (const c of completions) {
    if (!byDate[c.date]) byDate[c.date] = new Set();
    byDate[c.date].add(c.taskId);
  }

  const isComplete = (ds) => {
    const done = byDate[ds];
    return done && taskIds.every(id => done.has(id));
  };

  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const day = d.getDay(); // 0 = Sun, 6 = Sat

    // Weekends don't count for or against the streak
    if (day === 0 || day === 6) continue;

    const ds = d.toISOString().slice(0, 10);

    // Today being incomplete doesn't break the streak mid-day
    if (ds === todayStr && !isComplete(ds)) continue;

    if (isComplete(ds)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const BADGE_DEFS = [
  { id: 'first_task',   emoji: '⭐', name: 'First Star',    desc: 'Completed your very first task!' },
  { id: 'streak_3',     emoji: '🔥', name: 'On Fire!',       desc: '3 weekdays in a row — amazing!' },
  { id: 'streak_7',     emoji: '🦄', name: 'Unicorn Week',   desc: '7 weekdays in a row — magical!' },
  { id: 'streak_14',    emoji: '👑', name: 'Queen Iris',     desc: '14 weekdays in a row — royalty!' },
  { id: 'points_50',    emoji: '💫', name: 'Star Collector', desc: 'Earned 50 stars total!' },
  { id: 'points_100',   emoji: '🌟', name: 'Superstar',      desc: 'Earned 100 stars total!' },
  { id: 'points_500',   emoji: '✨', name: 'Galaxy Iris',    desc: 'Earned 500 stars total!' },
  { id: 'tasks_10',     emoji: '🎯', name: 'Sharp Iris',     desc: 'Completed 10 tasks!' },
  { id: 'tasks_25',     emoji: '🚀', name: 'Rocket Iris',    desc: 'Completed 25 tasks!' },
  { id: 'tasks_50',     emoji: '🏆', name: 'Champion',       desc: 'Completed 50 tasks!' },
  { id: 'first_reward', emoji: '👸', name: 'Reward Queen',   desc: 'Claimed your first prize!' },
];

export function getEarnedBadgeIds(state, streak) {
  const totalTasks  = state.completions.length;
  const totalPoints = state.completions.reduce((s, c) => s + c.points, 0);
  const earned = new Set();
  if (totalTasks  >= 1)   earned.add('first_task');
  if (streak      >= 3)   earned.add('streak_3');
  if (streak      >= 7)   earned.add('streak_7');
  if (streak      >= 14)  earned.add('streak_14');
  if (totalPoints >= 50)  earned.add('points_50');
  if (totalPoints >= 100) earned.add('points_100');
  if (totalPoints >= 500) earned.add('points_500');
  if (totalTasks  >= 10)  earned.add('tasks_10');
  if (totalTasks  >= 25)  earned.add('tasks_25');
  if (totalTasks  >= 50)  earned.add('tasks_50');
  if (state.claimedRewards.length >= 1) earned.add('first_reward');
  return earned;
}

export function useStore() {
  const [state, setState] = useState(load);

  useEffect(() => { save(state); }, [state]);

  const update = useCallback((updater) => {
    setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  const addTask = useCallback((task) => {
    update(s => ({ ...s, tasks: [...s.tasks, { ...task, id: crypto.randomUUID() }] }));
  }, [update]);

  const removeTask = useCallback((id) => {
    update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, [update]);

  const addReward = useCallback((reward) => {
    update(s => ({ ...s, rewards: [...s.rewards, { ...reward, id: crypto.randomUUID() }] }));
  }, [update]);

  const removeReward = useCallback((id) => {
    update(s => ({ ...s, rewards: s.rewards.filter(r => r.id !== id) }));
  }, [update]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = state.completions.filter(c => c.date === todayStr).map(c => c.taskId);

  const toggleTask = useCallback((task) => {
    update(s => {
      const today = new Date().toISOString().slice(0, 10);
      const alreadyDone = s.completions.some(c => c.taskId === task.id && c.date === today);
      if (alreadyDone) {
        return {
          ...s,
          totalPoints: Math.max(0, s.totalPoints - task.points),
          completions: s.completions.filter(c => !(c.taskId === task.id && c.date === today)),
        };
      }
      return {
        ...s,
        totalPoints: s.totalPoints + task.points,
        completions: [...s.completions, {
          id: crypto.randomUUID(), taskId: task.id, date: today, points: task.points, taskName: task.name,
        }],
      };
    });
  }, [update]);

  const claimReward = useCallback((reward) => {
    update(s => {
      if (s.totalPoints < reward.pointsRequired) return s;
      return {
        ...s,
        totalPoints: 0,
        claimedRewards: [...s.claimedRewards, {
          rewardId:       reward.id,
          date:           new Date().toISOString().slice(0, 10),
          rewardName:     reward.name,
          icon:           reward.icon,
          pointsSpent:    s.totalPoints,
          pointsRequired: reward.pointsRequired,
        }],
      };
    });
  }, [update]);

  const setPin = useCallback((pin) => {
    update(s => ({ ...s, parentPin: pin }));
  }, [update]);

  const streak = useMemo(
    () => calcStreak(state.completions, state.tasks),
    [state.completions, state.tasks]
  );

  return {
    ...state,
    completedToday,
    todayStr,
    streak,
    addTask, removeTask,
    addReward, removeReward,
    toggleTask, claimReward,
    setPin,
  };
}
