export const AGENT_AVATAR_COLORS = [
  'blue',
  'sky',
  'turquoise',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'gray',
] as const;

export type AgentAvatarColor = (typeof AGENT_AVATAR_COLORS)[number];
