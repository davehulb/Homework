import { useEffect, useRef } from 'react';

const COLORS = ['#6c63ff','#ff6584','#43c678','#ffd166','#f59e0b','#06d6a0','#118ab2'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function Celebration({ reward, onClose }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn confetti
    for (let i = 0; i < 140; i++) {
      particles.current.push({
        x:    randomBetween(0, canvas.width),
        y:    randomBetween(-canvas.height * 0.5, 0),
        vx:   randomBetween(-2, 2),
        vy:   randomBetween(2, 6),
        rotation: randomBetween(0, 360),
        rotSpeed: randomBetween(-4, 4),
        w: randomBetween(8, 14),
        h: randomBetween(4, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive = [];
      for (const p of particles.current) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.1;  // gravity
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.05;

        if (p.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          alive.push(p);
        }
      }
      particles.current = alive;
      if (alive.length > 0) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="confetti-canvas" />
      <div className="celebration-overlay" onClick={onClose}>
        <div className="celebration-card" onClick={e => e.stopPropagation()}>
          <span className="celebration-emoji">🏆</span>
          <div className="celebration-title">You Did It!</div>
          <div className="celebration-msg">
            Amazing work! You earned the reward:<br />
            <span className="celebration-reward">{reward.name}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            Awesome! 🎉
          </button>
        </div>
      </div>
    </>
  );
}
