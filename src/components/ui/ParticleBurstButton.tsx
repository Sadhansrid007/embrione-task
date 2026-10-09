'use client';

import { useRef, MouseEvent } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export default function ParticleBurstButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const triggerBurst = (e: MouseEvent<HTMLButtonElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    canvas.width = rect.width;
    canvas.height = rect.height;

    const particles: Particle[] = [];
    const colors = ['#818cf8', '#c084fc', '#38bdf8', '#f472b6'];

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        activeCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (activeCount > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    if (onClick) onClick();
  };

  return (
    <button
      onClick={triggerBurst}
      className={`relative overflow-hidden group ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />
      <span className="relative z-0">{children}</span>
    </button>
  );
}