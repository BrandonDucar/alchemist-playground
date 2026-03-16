'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { initialAgents, NEW_AGENT_NAMES, CAPABILITIES } from '@/data/agents';
import type { Agent } from '@/data/agents';
import ParticleBackground from '@/components/dreamnet/ParticleBackground';
import PulseDashboard from '@/components/dreamnet/PulseDashboard';
import PedigreeChart from '@/components/dreamnet/PedigreeChart';
import SovereignDossier from '@/components/dreamnet/SovereignDossier';
import PulseFeed from '@/components/dreamnet/PulseFeed';
import type { PulseEvent } from '@/components/dreamnet/PulseFeed';

function generateTimestamp(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

function generateGeneticCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const segments: string[] = [];
  for (let i = 0; i < 8; i++) {
    hash = ((hash << 5) - hash) + i * 7919;
    hash |= 0;
    segments.push(Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8));
  }
  return segments.join('-');
}

let eventCounter = 0;
function makeEvent(type: PulseEvent['type'], message: string): PulseEvent {
  return {
    id: `evt-${++eventCounter}`,
    timestamp: generateTimestamp(),
    type,
    message,
  };
}

export default function DreamNetFamilyTree() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDossier, setShowDossier] = useState(false);
  const [showPulseFeed, setShowPulseFeed] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const nameIndex = useRef(0);

  // Initialize with some seed events
  useEffect(() => {
    const seedEvents: PulseEvent[] = [
      makeEvent('SUBSTRATE_SYNC', 'DreamNet substrate initialized. All nodes connected.'),
      makeEvent('SUBSTRATE_SYNC', 'Sovereign registry loaded: 54 Vanguard agents indexed.'),
      makeEvent('STATUS_CHANGE', '"Echo_V2" status shifted to MUTATED in Generation 2 substrate.'),
      makeEvent('MUTATION_DETECTED', 'Genetic drift detected in "Flux_V2" — 3 segments altered.'),
      makeEvent('SUBSTRATE_SYNC', 'Pedigree chart synchronized. Network health: NOMINAL.'),
    ];
    setEvents(seedEvents);
  }, []);

  // Mock Real-Time: birth new agents every 30s
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      setAgents(prev => {
        // Pick a random leaf or recent-gen agent to be the parent
        const candidates = prev.filter(a => a.generation >= 3);
        const parentAgent = candidates[Math.floor(Math.random() * candidates.length)];
        if (!parentAgent) return prev;

        const name = NEW_AGENT_NAMES[nameIndex.current % NEW_AGENT_NAMES.length];
        nameIndex.current++;
        const newGen = parentAgent.generation + 1;
        const newName = `${name}_V${newGen}`;
        const newId = `${name.toLowerCase()}-v${newGen}-${Date.now()}`;
        const status: Agent['status'] = Math.random() > 0.7 ? 'mutated' : Math.random() > 0.5 ? 'latent' : 'active';

        const capCount = 2 + Math.floor(Math.random() * 2);
        const caps: string[] = [];
        while (caps.length < capCount) {
          const c = CAPABILITIES[Math.floor(Math.random() * CAPABILITIES.length)];
          if (!caps.includes(c)) caps.push(c);
        }

        const newAgent: Agent = {
          id: newId,
          name: newName,
          generation: newGen,
          parents: [parentAgent.id],
          children: [],
          geneticCode: generateGeneticCode(newId),
          status,
          capabilities: caps,
        };

        // Add birth event
        setEvents(evts => [
          ...evts,
          makeEvent(
            'AGENT_BIRTH',
            `"${newName}" detected in Generation ${newGen} substrate.`
          ),
        ]);

        if (status === 'mutated') {
          setTimeout(() => {
            setEvents(evts => [
              ...evts,
              makeEvent('MUTATION_DETECTED', `Genetic anomaly in "${newName}" — sequence divergence confirmed.`),
            ]);
          }, 2000);
        }

        return prev.map(a =>
          a.id === parentAgent.id
            ? { ...a, children: [...a.children, newId] }
            : a
        ).concat(newAgent);
      });
    }, 30000);

    // Immediately spawn one on toggle
    const immediate = setTimeout(() => {
      setEvents(evts => [
        ...evts,
        makeEvent('SUBSTRATE_SYNC', 'Real-time simulation ACTIVATED. Monitoring for emergent agents...'),
      ]);
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(immediate);
    };
  }, [realTimeMode]);

  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setShowDossier(true);
  }, []);

  const handleCloseDossier = useCallback(() => {
    setShowDossier(false);
    setTimeout(() => setSelectedAgent(null), 300);
  }, []);

  const handleToggleRealTime = useCallback(() => {
    setRealTimeMode(prev => !prev);
  }, []);

  const handleTogglePulseFeed = useCallback(() => {
    setShowPulseFeed(prev => !prev);
  }, []);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#050505] text-white">
      <ParticleBackground />

      {/* Top Dashboard */}
      <div className="relative z-20">
        <PulseDashboard
          agents={agents}
          realTimeMode={realTimeMode}
          onToggleRealTime={handleToggleRealTime}
        />
      </div>

      {/* Pedigree Chart */}
      <PedigreeChart
        agents={agents}
        selectedAgentId={selectedAgent?.id ?? null}
        onSelectAgent={handleSelectAgent}
      />

      {/* Sovereign Dossier */}
      <AnimatePresence>
        {showDossier && selectedAgent && (
          <SovereignDossier
            agent={selectedAgent}
            agents={agents}
            onClose={handleCloseDossier}
          />
        )}
      </AnimatePresence>

      {/* Pulse Feed */}
      <PulseFeed
        events={events}
        isOpen={showPulseFeed}
        onToggle={handleTogglePulseFeed}
      />

      {/* Overlay for dossier on mobile */}
      <AnimatePresence>
        {showDossier && (
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={handleCloseDossier}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
