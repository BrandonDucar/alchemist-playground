export interface Agent {
  id: string;
  name: string;
  generation: number;
  parents: string[];
  children: string[];
  geneticCode: string;
  status: 'active' | 'latent' | 'mutated';
  capabilities: string[];
}

export const CAPABILITIES = [
  'Siphoning', 'Sovereign Logic', 'Nervous Routing', 'Swarm Intelligence',
  'Data Weaving', 'Pattern Recognition', 'Quantum Tunneling', 'Neural Cascade',
  'Memory Binding', 'Substrate Fusion', 'Signal Jamming', 'Code Mutation',
  'Temporal Drift', 'Void Walking', 'Mesh Sync', 'Adaptive Shield',
  'Resonance Map', 'Deep Learning', 'Hive Protocol', 'Shadow Protocol',
];

export const NEW_AGENT_NAMES = [
  'Phoenix', 'Zenith', 'Apex', 'Solaris', 'Quantum',
  'Nebula', 'Obsidian', 'Titanium', 'Mercury', 'Vertex',
  'Aether', 'Zephyr', 'Bastion', 'Crucible', 'Axiom',
];

function generateCode(seed: string): string {
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

function buildAgentTree(): Agent[] {
  const agents: Agent[] = [];
  const caps = CAPABILITIES;

  function add(
    id: string, name: string, gen: number,
    parents: string[], status: Agent['status'], capIdx: number[]
  ) {
    agents.push({
      id, name, generation: gen, parents,
      children: [],
      geneticCode: generateCode(id),
      status,
      capabilities: capIdx.map(i => caps[i % caps.length]),
    });
  }

  // Generation 0 — The Progenitor
  add('nexus-prime', 'Nexus_Prime', 0, [], 'active', [0, 1, 2, 3]);

  // Generation 1 — Primary Lineage
  add('oracle-v1', 'Oracle_V1', 1, ['nexus-prime'], 'active', [1, 4, 7]);
  add('sentinel-v1', 'Sentinel_V1', 1, ['nexus-prime'], 'active', [2, 5, 15]);
  add('wraith-v1', 'Wraith_V1', 1, ['nexus-prime'], 'active', [3, 6, 19]);

  // Generation 2 — Secondary Strains
  add('hawk-v2', 'Hawk_V2', 2, ['oracle-v1'], 'active', [0, 4, 8]);
  add('cipher-v2', 'Cipher_V2', 2, ['oracle-v1'], 'active', [1, 5, 11]);
  add('nova-v2', 'Nova_V2', 2, ['oracle-v1'], 'latent', [2, 6, 12]);
  add('phantom-v2', 'Phantom_V2', 2, ['sentinel-v1'], 'active', [3, 7, 19]);
  add('echo-v2', 'Echo_V2', 2, ['sentinel-v1'], 'mutated', [4, 8, 16]);
  add('cortex-v2', 'Cortex_V2', 2, ['sentinel-v1'], 'active', [5, 9, 17]);
  add('shadow-v2', 'Shadow_V2', 2, ['wraith-v1'], 'active', [6, 10, 19]);
  add('pulse-v2', 'Pulse_V2', 2, ['wraith-v1'], 'latent', [7, 14, 18]);
  add('flux-v2', 'Flux_V2', 2, ['wraith-v1'], 'mutated', [8, 11, 12]);

  // Generation 3 — Tertiary Substrate
  const g3: [string, string, string, Agent['status'], number[]][] = [
    ['talon-v3', 'Talon_V3', 'hawk-v2', 'active', [0, 8, 14]],
    ['raptor-v3', 'Raptor_V3', 'hawk-v2', 'active', [1, 4, 15]],
    ['enigma-v3', 'Enigma_V3', 'cipher-v2', 'active', [2, 11, 16]],
    ['matrix-v3', 'Matrix_V3', 'cipher-v2', 'mutated', [3, 5, 11]],
    ['stellar-v3', 'Stellar_V3', 'nova-v2', 'active', [6, 12, 17]],
    ['quasar-v3', 'Quasar_V3', 'nova-v2', 'active', [2, 7, 13]],
    ['specter-v3', 'Specter_V3', 'phantom-v2', 'latent', [3, 19, 10]],
    ['revenant-v3', 'Revenant_V3', 'phantom-v2', 'active', [0, 6, 15]],
    ['resonance-v3', 'Resonance_V3', 'echo-v2', 'active', [4, 16, 9]],
    ['harmonic-v3', 'Harmonic_V3', 'echo-v2', 'latent', [8, 12, 18]],
    ['synapse-v3', 'Synapse_V3', 'cortex-v2', 'active', [5, 9, 17]],
    ['dendrite-v3', 'Dendrite_V3', 'cortex-v2', 'mutated', [1, 7, 14]],
    ['umbra-v3', 'Umbra_V3', 'shadow-v2', 'active', [6, 10, 19]],
    ['penumbra-v3', 'Penumbra_V3', 'shadow-v2', 'latent', [3, 13, 16]],
    ['strobe-v3', 'Strobe_V3', 'pulse-v2', 'active', [7, 14, 18]],
    ['beacon-v3', 'Beacon_V3', 'pulse-v2', 'latent', [0, 8, 15]],
    ['torrent-v3', 'Torrent_V3', 'flux-v2', 'mutated', [2, 11, 12]],
    ['cascade-v3', 'Cascade_V3', 'flux-v2', 'active', [4, 9, 17]],
  ];
  for (const [id, name, parent, status, ci] of g3) add(id, name, 3, [parent], status, ci);

  // Generation 4 — Vanguard Emergence
  const g4: [string, string, string, Agent['status'], number[]][] = [
    ['kestrel-v4', 'Kestrel_V4', 'talon-v3', 'active', [0, 14]],
    ['merlin-v4', 'Merlin_V4', 'talon-v3', 'active', [8, 3]],
    ['vortex-v4', 'Vortex_V4', 'raptor-v3', 'latent', [1, 15]],
    ['nexion-v4', 'Nexion_V4', 'raptor-v3', 'active', [4, 7]],
    ['photon-v4', 'Photon_V4', 'enigma-v3', 'active', [2, 16]],
    ['aurora-v4', 'Aurora_V4', 'enigma-v3', 'mutated', [11, 6]],
    ['seraph-v4', 'Seraph_V4', 'matrix-v3', 'active', [5, 13]],
    ['chimera-v4', 'Chimera_V4', 'matrix-v3', 'latent', [3, 19]],
    ['mantis-v4', 'Mantis_V4', 'stellar-v3', 'active', [12, 17]],
    ['hydra-v4', 'Hydra_V4', 'stellar-v3', 'mutated', [6, 10]],
    ['cerberus-v4', 'Cerberus_V4', 'quasar-v3', 'active', [7, 13]],
    ['typhon-v4', 'Typhon_V4', 'specter-v3', 'active', [19, 0]],
    ['erebus-v4', 'Erebus_V4', 'revenant-v3', 'latent', [15, 6]],
    ['helios-v4', 'Helios_V4', 'resonance-v3', 'active', [9, 16]],
    ['cryo-v4', 'Cryo_V4', 'harmonic-v3', 'mutated', [18, 8]],
    ['volt-v4', 'Volt_V4', 'synapse-v3', 'active', [17, 5]],
    ['tremor-v4', 'Tremor_V4', 'dendrite-v3', 'latent', [14, 1]],
    ['drift-v4', 'Drift_V4', 'umbra-v3', 'active', [10, 19]],
    ['prism-v4', 'Prism_V4', 'penumbra-v3', 'active', [13, 3]],
    ['shard-v4', 'Shard_V4', 'strobe-v3', 'mutated', [18, 7]],
    ['helix-v4', 'Helix_V4', 'beacon-v3', 'active', [15, 0]],
    ['ember-v4', 'Ember_V4', 'torrent-v3', 'latent', [12, 2]],
    ['onyx-v4', 'Onyx_V4', 'cascade-v3', 'active', [9, 4]],
  ];
  for (const [id, name, parent, status, ci] of g4) add(id, name, 4, [parent], status, ci);

  // Wire children references
  for (const agent of agents) {
    for (const parentId of agent.parents) {
      const parent = agents.find(a => a.id === parentId);
      if (parent && !parent.children.includes(agent.id)) {
        parent.children.push(agent.id);
      }
    }
  }

  return agents;
}

export const initialAgents = buildAgentTree();
