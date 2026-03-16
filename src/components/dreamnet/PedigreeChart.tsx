'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Agent } from '@/data/agents';

const NODE_W = 136;
const NODE_H = 52;
const H_GAP = 14;
const V_GAP = 90;
const PADDING = 60;

interface PedigreeChartProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: Agent) => void;
}

type Pos = { x: number; y: number };

function calculateLayout(agents: Agent[]): { positions: Map<string, Pos>; width: number; height: number } {
  const byId = new Map(agents.map(a => [a.id, a]));
  const positions = new Map<string, Pos>();
  const root = agents.find(a => a.generation === 0);
  if (!root) return { positions, width: 0, height: 0 };

  const widthCache = new Map<string, number>();

  function subtreeWidth(id: string): number {
    if (widthCache.has(id)) return widthCache.get(id)!;
    const agent = byId.get(id);
    if (!agent || agent.children.length === 0) {
      widthCache.set(id, NODE_W);
      return NODE_W;
    }
    const w = agent.children.reduce(
      (sum, cid, i) => sum + subtreeWidth(cid) + (i > 0 ? H_GAP : 0), 0
    );
    const result = Math.max(NODE_W, w);
    widthCache.set(id, result);
    return result;
  }

  function layout(id: string, left: number, top: number) {
    const agent = byId.get(id);
    if (!agent) return;
    const w = subtreeWidth(id);
    positions.set(id, { x: left + w / 2 - NODE_W / 2, y: top });
    if (agent.children.length > 0) {
      let childLeft = left;
      for (const cid of agent.children) {
        const cw = subtreeWidth(cid);
        layout(cid, childLeft, top + NODE_H + V_GAP);
        childLeft += cw + H_GAP;
      }
    }
  }

  layout(root.id, PADDING, PADDING);

  const totalW = subtreeWidth(root.id) + PADDING * 2;
  const maxGen = Math.max(...agents.map(a => a.generation));
  const totalH = (maxGen + 1) * (NODE_H + V_GAP) - V_GAP + PADDING * 2;

  return { positions, width: totalW, height: totalH };
}

function statusColor(status: Agent['status']): string {
  switch (status) {
    case 'active': return '#00f2ff';
    case 'latent': return '#a855f7';
    case 'mutated': return '#ffcc00';
  }
}

function statusGlow(status: Agent['status']): string {
  switch (status) {
    case 'active': return 'drop-shadow(0 0 4px rgba(0,242,255,0.6))';
    case 'latent': return 'drop-shadow(0 0 4px rgba(168,85,247,0.6))';
    case 'mutated': return 'drop-shadow(0 0 4px rgba(255,204,0,0.6))';
  }
}

export default function PedigreeChart({ agents, selectedAgentId, onSelectAgent }: PedigreeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [fitted, setFitted] = useState(false);

  const { positions, width: treeW, height: treeH } = useMemo(
    () => calculateLayout(agents),
    [agents]
  );

  // Auto-fit on mount
  useEffect(() => {
    if (fitted || !containerRef.current || treeW === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / treeW;
    const scaleY = rect.height / treeH;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    const x = (rect.width - treeW * scale) / 2;
    const y = (rect.height - treeH * scale) / 2;
    setTransform({ x, y, scale });
    setFitted(true);
  }, [treeW, treeH, fitted]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => {
      const newScale = Math.max(0.1, Math.min(3, t.scale * delta));
      const rect = containerRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        scale: newScale,
        x: mx - (mx - t.x) * (newScale / t.scale),
        y: my - (my - t.y) * (newScale / t.scale),
      };
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-agent-node]')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [transform.x, transform.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTransform(t => ({ ...t, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy }));
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; parentStatus: Agent['status'] }[] = [];
    const byId = new Map(agents.map(a => [a.id, a]));
    for (const agent of agents) {
      const pos = positions.get(agent.id);
      if (!pos) continue;
      for (const childId of agent.children) {
        const childPos = positions.get(childId);
        if (!childPos) continue;
        lines.push({
          x1: pos.x + NODE_W / 2,
          y1: pos.y + NODE_H,
          x2: childPos.x + NODE_W / 2,
          y2: childPos.y,
          parentStatus: agent.status,
        });
      }
    }
    return lines;
  }, [agents, positions]);

  const handleFitView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / treeW;
    const scaleY = rect.height / treeH;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    const x = (rect.width - treeW * scale) / 2;
    const y = (rect.height - treeH * scale) / 2;
    setTransform({ x, y, scale });
  }, [treeW, treeH]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
      >
        <defs>
          <filter id="node-glow-cyan">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00f2ff" floodOpacity="0.3" />
          </filter>
          <filter id="node-glow-gold">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffcc00" floodOpacity="0.3" />
          </filter>
          <filter id="node-glow-purple">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.3" />
          </filter>
          <filter id="selected-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00f2ff" floodOpacity="0.6" />
          </filter>
          <linearGradient id="connection-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Generation labels */}
          {Array.from(new Set(agents.map(a => a.generation))).sort().map(gen => (
            <text
              key={`gen-${gen}`}
              x={8}
              y={PADDING + gen * (NODE_H + V_GAP) + NODE_H / 2 + 4}
              fill="#00f2ff"
              fillOpacity="0.15"
              fontSize="10"
              fontFamily="var(--font-mono)"
              className="select-none"
            >
              GEN_{gen}
            </text>
          ))}

          {/* Connections */}
          {connections.map((conn, i) => {
            const midY = (conn.y1 + conn.y2) / 2;
            return (
              <path
                key={`conn-${i}`}
                d={`M ${conn.x1} ${conn.y1} C ${conn.x1} ${midY}, ${conn.x2} ${midY}, ${conn.x2} ${conn.y2}`}
                fill="none"
                stroke={statusColor(conn.parentStatus)}
                strokeOpacity="0.15"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Nodes */}
          {agents.map(agent => {
            const pos = positions.get(agent.id);
            if (!pos) return null;
            const isSelected = selectedAgentId === agent.id;
            const sc = statusColor(agent.status);

            return (
              <g
                key={agent.id}
                data-agent-node
                onClick={() => onSelectAgent(agent)}
                className="cursor-pointer"
                style={{ filter: statusGlow(agent.status) }}
              >
                {/* Glass background */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill="rgba(5,5,5,0.7)"
                  stroke={isSelected ? '#00f2ff' : sc}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeOpacity={isSelected ? 0.9 : 0.3}
                  filter={isSelected ? 'url(#selected-glow)' : undefined}
                />

                {/* Status indicator dot */}
                <circle
                  cx={pos.x + 12}
                  cy={pos.y + NODE_H / 2}
                  r={3.5}
                  fill={sc}
                >
                  {agent.status === 'active' && (
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>

                {/* Agent name */}
                <text
                  x={pos.x + 22}
                  y={pos.y + NODE_H / 2 - 4}
                  fill="#e0f7ff"
                  fontSize="11"
                  fontFamily="var(--font-inter), sans-serif"
                  fontWeight="600"
                  className="select-none"
                >
                  {agent.name.length > 14 ? agent.name.slice(0, 13) + '..' : agent.name}
                </text>

                {/* Generation label */}
                <text
                  x={pos.x + 22}
                  y={pos.y + NODE_H / 2 + 10}
                  fill={sc}
                  fillOpacity="0.5"
                  fontSize="9"
                  fontFamily="var(--font-mono), monospace"
                  className="select-none"
                >
                  GEN {agent.generation} | {agent.status.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Fit View Button */}
      <button
        onClick={handleFitView}
        className="absolute bottom-20 right-4 z-30 px-3 py-2 rounded-lg
          bg-black/50 border border-cyan-500/20 text-cyan-400 text-xs
          font-mono backdrop-blur-md hover:border-cyan-400/40 transition-colors"
      >
        FIT VIEW
      </button>

      {/* Zoom indicator */}
      <div className="absolute bottom-20 left-4 z-30 px-3 py-1.5 rounded-lg
        bg-black/50 border border-white/5 text-white/30 text-[10px] font-mono backdrop-blur-md">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
}
