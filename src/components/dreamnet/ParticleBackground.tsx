'use client';

import { useMemo } from 'react';

interface Particle {
  id: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity: number;
  dur: number;
  dx: number;
  dy: number;
}

export default function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    const ps: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      ps.push({
        id: i,
        cx: (i * 37 + 13) % 100 * 10,
        cy: (i * 41 + 7) % 100 * 10,
        r: (i % 3) * 0.8 + 0.6,
        color: i % 7 === 0 ? '#ffcc00' : '#00f2ff',
        opacity: 0.08 + (i % 5) * 0.06,
        dur: 18 + (i % 8) * 4,
        dx: ((i * 13) % 60) - 30,
        dy: ((i * 17) % 80) - 40,
      });
    }
    return ps;
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="particle-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
        </defs>

        <rect width="1000" height="1000" fill="url(#bg-gradient)" />

        {/* Grid lines for bio-digital feel */}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0" y1={i * 50} x2="1000" y2={i * 50}
            stroke="#00f2ff" strokeOpacity="0.03" strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 50} y1="0" x2={i * 50} y2="1000"
            stroke="#00f2ff" strokeOpacity="0.03" strokeWidth="0.5"
          />
        ))}

        {/* Floating particles */}
        {particles.map(p => (
          <circle
            key={p.id}
            r={p.r}
            fill={p.color}
            opacity={p.opacity}
            filter="url(#particle-glow)"
          >
            <animate
              attributeName="cx"
              values={`${p.cx};${p.cx + p.dx};${p.cx - p.dx * 0.5};${p.cx}`}
              dur={`${p.dur}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${p.cy};${p.cy + p.dy};${p.cy - p.dy * 0.7};${p.cy}`}
              dur={`${p.dur * 1.3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values={`${p.opacity};${p.opacity * 1.8};${p.opacity * 0.5};${p.opacity}`}
              dur={`${p.dur * 0.8}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Larger molecular rings */}
        {[
          { cx: 150, cy: 200, r: 40, dur: 25 },
          { cx: 750, cy: 350, r: 55, dur: 30 },
          { cx: 400, cy: 700, r: 35, dur: 22 },
          { cx: 850, cy: 800, r: 45, dur: 28 },
        ].map((ring, i) => (
          <circle
            key={`ring-${i}`}
            cx={ring.cx}
            cy={ring.cy}
            r={ring.r}
            fill="none"
            stroke="#00f2ff"
            strokeWidth="0.5"
            strokeOpacity="0.06"
          >
            <animate
              attributeName="r"
              values={`${ring.r};${ring.r + 10};${ring.r}`}
              dur={`${ring.dur}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.06;0.12;0.06"
              dur={`${ring.dur * 0.7}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}
