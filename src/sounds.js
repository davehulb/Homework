let ctx = null;

function getAC() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function note(freq, startOffset, duration, volume = 0.25, type = 'sine') {
  try {
    const c = getAC();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    const t = c.currentTime + startOffset;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  } catch {
    // Audio not available — silently ignore
  }
}

export function playTick() {
  note(880,  0,    0.06, 0.2, 'sine');
  note(1320, 0.06, 0.12, 0.15, 'sine');
}

export function playUntick() {
  note(440, 0, 0.09, 0.12, 'sine');
}

export function playAllDone() {
  note(523,  0,    0.22, 0.3, 'triangle');
  note(659,  0.13, 0.22, 0.3, 'triangle');
  note(784,  0.26, 0.22, 0.3, 'triangle');
  note(1047, 0.39, 0.4,  0.3, 'triangle');
  note(1568, 0.55, 0.18, 0.2, 'sine');
}

export function playReward() {
  [523, 587, 659, 784, 1047, 1568].forEach((f, i) =>
    note(f, i * 0.07, 0.2, 0.32, 'triangle')
  );
}
