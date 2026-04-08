'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PulseEvent {
  id: string;
  timestamp: string;
  type: 'AGENT_BIRTH' | 'MUTATION_DETECTED' | 'STATUS_CHANGE' | 'SUBSTRATE_SYNC';
  message: string;
}

interface PulseFeedProps {
  events: PulseEvent[];
  isOpen: boolean;
  onToggle: () => void;
}

function typeColor(type: PulseEvent['type']): string {
  switch (type) {
    case 'AGENT_BIRTH': return 'text-cyan-400';
    case 'MUTATION_DETECTED': return 'text-yellow-400';
    case 'STATUS_CHANGE': return 'text-purple-400';
    case 'SUBSTRATE_SYNC': return 'text-emerald-400';
  }
}

function typeBg(type: PulseEvent['type']): string {
  switch (type) {
    case 'AGENT_BIRTH': return 'bg-cyan-400/10';
    case 'MUTATION_DETECTED': return 'bg-yellow-400/10';
    case 'STATUS_CHANGE': return 'bg-purple-400/10';
    case 'SUBSTRATE_SYNC': return 'bg-emerald-400/10';
  }
}

export default function PulseFeed({ events, isOpen, onToggle }: PulseFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle Bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2
          bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-cyan-500/10
          hover:bg-[#0a0a0a]/95 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-cyan-400/60 tracking-widest uppercase">
            Pulse Feed
          </span>
          {events.length > 0 && (
            <span className="text-[9px] font-mono text-white/20">
              [{events.length}]
            </span>
          )}
        </div>
        <motion.svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M2 8L6 4L10 8" stroke="#00f2ff" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </button>

      {/* Feed Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 180 }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="overflow-hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/5"
          >
            <div ref={scrollRef} className="h-[180px] overflow-y-auto custom-scrollbar px-4 py-2 space-y-1">
              {events.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs font-mono text-white/15">
                    Awaiting pulse data...
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 py-0.5"
                  >
                    <span className="text-[10px] font-mono text-white/20 shrink-0 tabular-nums">
                      [{event.timestamp}]
                    </span>
                    <span className={`text-[10px] font-mono font-bold shrink-0 px-1 rounded ${typeColor(event.type)} ${typeBg(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-[10px] font-mono text-white/50">
                      {event.message}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Terminal prompt line */}
            <div className="px-4 py-1.5 border-t border-white/5 flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-500/30">&gt;</span>
              <motion.span
                className="w-1.5 h-3.5 bg-cyan-400/40"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
