'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Agent } from '@/data/agents';

interface SovereignDossierProps {
  agent: Agent;
  agents: Agent[];
  onClose: () => void;
}

function statusConfig(status: Agent['status']) {
  switch (status) {
    case 'active':
      return { label: 'ACTIVE', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', dot: 'bg-cyan-400' };
    case 'latent':
      return { label: 'LATENT', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', dot: 'bg-purple-400' };
    case 'mutated':
      return { label: 'MUTATED', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' };
  }
}

export default function SovereignDossier({ agent, agents, onClose }: SovereignDossierProps) {
  const parentAgents = useMemo(
    () => agent.parents.map(pid => agents.find(a => a.id === pid)).filter(Boolean) as Agent[],
    [agent, agents]
  );
  const childAgents = useMemo(
    () => agent.children.map(cid => agents.find(a => a.id === cid)).filter(Boolean) as Agent[],
    [agent, agents]
  );
  const sc = statusConfig(agent.status);

  const codeSegments = agent.geneticCode.split('-');
  const mutatedIndices = useMemo(() => {
    const indices = new Set<number>();
    let hash = 0;
    for (let i = 0; i < agent.id.length; i++) {
      hash = ((hash << 5) - hash) + agent.id.charCodeAt(i);
      hash |= 0;
    }
    const count = agent.status === 'mutated' ? 4 : agent.status === 'latent' ? 2 : 1;
    for (let i = 0; i < count; i++) {
      indices.add(Math.abs((hash + i * 31) % codeSegments.length));
    }
    return indices;
  }, [agent.id, agent.status, codeSegments.length]);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50
        bg-[#050505]/90 backdrop-blur-xl border-l border-cyan-500/10
        flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/10">
        <div>
          <p className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase">
            Sovereign Dossier
          </p>
          <h2 className="font-display text-xl font-bold text-cyan-50 mt-0.5">
            {agent.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center
            text-white/40 hover:text-white/80 hover:border-white/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Identity Block */}
        <div className="p-5 space-y-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-md ${sc.bg} border ${sc.border} flex items-center gap-2`}>
              <motion.div
                className={`w-2 h-2 rounded-full ${sc.dot}`}
                animate={agent.status === 'active' ? { opacity: [1, 0.3, 1] } : {}}
                transition={agent.status === 'active' ? { duration: 1.5, repeat: Infinity } : {}}
              />
              <span className={`text-xs font-mono font-bold ${sc.color}`}>{sc.label}</span>
            </div>
            <span className="text-xs font-mono text-white/20">ID: {agent.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InfoCard label="Generation" value={`${agent.generation}`} />
            <InfoCard label="Descendants" value={`${agent.children.length}`} />
          </div>
        </div>

        {/* Genetic Code */}
        <div className="p-5 border-b border-white/5">
          <h3 className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase mb-3">
            Genetic Sequence
          </h3>
          <div className="relative overflow-hidden rounded-lg bg-black/40 border border-white/5 p-3">
            <div className="font-mono text-xs leading-relaxed break-all">
              {codeSegments.map((seg, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-white/10">-</span>}
                  <span className={
                    mutatedIndices.has(i)
                      ? 'text-yellow-400 bg-yellow-400/10 px-0.5 rounded'
                      : 'text-cyan-400/60'
                  }>
                    {seg}
                  </span>
                </span>
              ))}
            </div>
            {mutatedIndices.size > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-yellow-400/60 font-mono">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L9 9H1L5 1Z" stroke="currentColor" strokeWidth="1" />
                  <circle cx="5" cy="7" r="0.5" fill="currentColor" />
                  <line x1="5" y1="4" x2="5" y2="6" stroke="currentColor" strokeWidth="0.8" />
                </svg>
                {mutatedIndices.size} mutation{mutatedIndices.size > 1 ? 's' : ''} detected
              </div>
            )}
          </div>
        </div>

        {/* Capabilities */}
        <div className="p-5 border-b border-white/5">
          <h3 className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase mb-3">
            Capabilities
          </h3>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap, i) => (
              <motion.span
                key={cap}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-2.5 py-1 rounded-md bg-cyan-500/5 border border-cyan-500/15
                  text-xs font-mono text-cyan-400/70"
              >
                [{cap}]
              </motion.span>
            ))}
          </div>
        </div>

        {/* Lineage */}
        <div className="p-5">
          <h3 className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase mb-3">
            Lineage
          </h3>

          {parentAgents.length > 0 && (
            <div className="mb-4">
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider mb-2">Progenitors</p>
              {parentAgents.map(p => (
                <LineageCard key={p.id} agent={p} />
              ))}
            </div>
          )}

          {childAgents.length > 0 && (
            <div>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider mb-2">Progeny</p>
              <div className="space-y-1.5">
                {childAgents.map(c => (
                  <LineageCard key={c.id} agent={c} />
                ))}
              </div>
            </div>
          )}

          {parentAgents.length === 0 && childAgents.length === 0 && (
            <p className="text-xs font-mono text-white/20">No lineage data available</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-mono text-white/15">
          DREAMNET SOVEREIGN REGISTRY v2.4
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-cyan-500/40">CONNECTED</span>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
      <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-display font-bold text-cyan-50 mt-0.5">{value}</p>
    </div>
  );
}

function LineageCard({ agent }: { agent: Agent }) {
  const sc = statusConfig(agent.status);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
      <motion.div
        className={`w-2 h-2 rounded-full ${sc.dot}`}
        animate={agent.status === 'active' ? { opacity: [1, 0.3, 1] } : {}}
        transition={agent.status === 'active' ? { duration: 1.5, repeat: Infinity } : {}}
      />
      <span className="text-xs font-mono text-cyan-50/80">{agent.name}</span>
      <span className="text-[9px] font-mono text-white/20 ml-auto">GEN {agent.generation}</span>
    </div>
  );
}
