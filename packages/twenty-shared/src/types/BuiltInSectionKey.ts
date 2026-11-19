export const BUILT_IN_SECTION_KEYS = [
  'favorites',
  'aiChatInbox',
  'aiChatFavorites',
  'aiChatChannels',
  'aiChatRecents',
  'aiAgents',
] as const;

export type BuiltInSectionKey = (typeof BUILT_IN_SECTION_KEYS)[number];
