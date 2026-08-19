export const TIMELINE_ACTIVITY_RULE_RESOLUTIONS = [
  'MATERIALIZED',
  'INHERITED',
] as const;

export type TimelineActivityRuleResolution =
  (typeof TIMELINE_ACTIVITY_RULE_RESOLUTIONS)[number];
