export const AGENT_AVATAR_SHAPES = [
  'circle',
  'cookie',
  'cloud',
  'clover',
  'flower',
  'burst',
  'pill',
  'arch',
  'gem',
  'hexagon',
] as const;

export type AgentAvatarShape = (typeof AGENT_AVATAR_SHAPES)[number];
