export const CLIENT_BRIEF_HOSTING_TYPES = ['CLOUD', 'SELF_HOSTING'] as const;

export type ClientBriefHostingType =
  (typeof CLIENT_BRIEF_HOSTING_TYPES)[number];
