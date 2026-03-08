export interface EvolutionPath {
  name: string
  visualChanges: string
  grokPrompt: string
}

export interface PostCopy {
  base: string
  farcaster: string
  x: string
}

export interface GenerationResult {
  codename: string
  lore: string
  evolutionPaths: EvolutionPath[]
  postCopy: PostCopy
}

export interface GenerateRequest {
  pfpDescription: string
  evolutionStyle: 'soft' | 'medium' | 'wild'
  platforms: string[]
}
