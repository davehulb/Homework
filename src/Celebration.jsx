import { useEffect, useRef } from 'react';

const COLORS = ['#bf40ff','#ff4da6','#ffd700','#00d49c','#ff6b9d','#c084fc','#fbbf24','#f472b6'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function drawStar(ctx, size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.42;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export default function Celebration({ reward, onClose }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 180; i++) {
      const isStar = Math.random() < 0.45;
      particles.current.push({
        x:        randomBetween(0, canvas.width),
        y:        randomBetween(-canvas.height * 0.6, 0),
        vx:       randomBetween(-2.5, 2.5),
        vy:       randomBetween(2, 7),
        rotation: randomBetween(0, 360),
        rotSpeed: randomBetween(-5, 5),
        size:     randomBetween(6, 14),
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity:  1,
        isStar,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive = [];
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.06;

        if (p.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.isStar) {
            drawStar(ctx, p.size);
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
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
          <span className="celebration-emoji">{reward.icon || '🏆'}</span>
          <div className="celebration-title">Way to go, Iris! 🌟</div>
          <div className="celebration-msg">
            You&apos;ve earned your prize!<br />
            <span className="celebration-reward">{reward.icon} {reward.name}</span>
          </div>
          <div className="celebration-reset-note">
            Your stars have been reset to 0 — start collecting for your next prize! ✨
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 17, padding: '16px' }}
            onClick={onClose}
          >
            Woohoo! Let&apos;s go! 🎉
          </button>
        </div>
      </div>
    </>
  );
}
