'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Agent } from '@/data/agents';

interface PulseDashboardProps {
  agents: Agent[];
  realTimeMode: boolean;
  onToggleRealTime: () => void;
}

export default function PulseDashboard({ agents, realTimeMode, onToggleRealTime }: PulseDashboardProps) {
  const metrics = useMemo(() => {
    const total = agents.length;
    const deepestGen = Math.max(...agents.map(a => a.generation));
    const mutatedCount = agents.filter(a => a.status === 'mutated').length;
    const activeCount = agents.filter(a => a.status === 'active').length;
    const latentCount = agents.filter(a => a.status === 'latent').length;
    return { total, deepestGen, mutatedCount, activeCount, latentCount };
  }, [agents]);

  return (
    <div className="relative z-20 border-b border-cyan-500/10">
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14.93 5.5V10.5L8 15L1.07 10.5V5.5L8 1Z" stroke="#00f2ff" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="2" fill="#00f2ff" fillOpacity="0.6" />
              </svg>
            </div>
            <motion.div
              className="absolute -inset-1 rounded-lg border border-cyan-400/20"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-sm font-bold tracking-wider text-cyan-50 uppercase">
              DreamNet
            </h1>
            <p className="text-[10px] text-cyan-500/60 tracking-widest uppercase">Family Tree</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <MetricPill label="SWARM" value={metrics.total} color="cyan" />
          <MetricPill label="DEPTH" value={`GEN ${metrics.deepestGen}`} color="cyan" />
          <MetricPill label="MUTATED" value={metrics.mutatedCount} color="gold" />
          <MetricPill label="ACTIVE" value={metrics.activeCount} color="green" hideOnMobile />
          <MetricPill label="LATENT" value={metrics.latentCount} color="purple" hideOnMobile />
        </div>

        {/* Real-Time Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-[10px] text-cyan-500/50 uppercase tracking-wider">
            Live Sim
          </span>
          <button
            onClick={onToggleRealTime}
            className={`
              relative w-11 h-6 rounded-full transition-colors duration-300
              ${realTimeMode
                ? 'bg-cyan-500/30 border-cyan-400/50'
                : 'bg-white/5 border-white/10'}
              border
            `}
          >
            <motion.div
              className={`
                absolute top-0.5 w-5 h-5 rounded-full
                ${realTimeMode ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/20'}
              `}
              animate={{ left: realTimeMode ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
            {realTimeMode && (
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-400/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Molecular Pulse Line */}
      <div className="h-px w-full relative overflow-hidden">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          style={{ width: '30%' }}
          animate={{ left: ['-30%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

function MetricPill({
  label, value, color, hideOnMobile,
}: {
  label: string;
  value: string | number;
  color: 'cyan' | 'gold' | 'green' | 'purple';
  hideOnMobile?: boolean;
}) {
  const colorMap = {
    cyan: 'border-cyan-500/20 text-cyan-400',
    gold: 'border-yellow-500/20 text-yellow-400',
    green: 'border-emerald-500/20 text-emerald-400',
    purple: 'border-purple-500/20 text-purple-400',
  };
  const glowMap = {
    cyan: 'bg-cyan-400',
    gold: 'bg-yellow-400',
    green: 'bg-emerald-400',
    purple: 'bg-purple-400',
  };

  return (
    <div className={`
      flex flex-col items-center px-2 py-1 sm:px-3 rounded-lg
      border bg-white/[0.02] backdrop-blur-sm
      ${colorMap[color]}
      ${hideOnMobile ? 'hidden md:flex' : ''}
    `}>
      <div className="flex items-center gap-1.5">
        <motion.div
          className={`w-1.5 h-1.5 rounded-full ${glowMap[color]}`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-sm sm:text-base font-mono font-bold">{value}</span>
      </div>
      <span className="text-[9px] tracking-wider opacity-50 uppercase">{label}</span>
    </div>
  );
}
