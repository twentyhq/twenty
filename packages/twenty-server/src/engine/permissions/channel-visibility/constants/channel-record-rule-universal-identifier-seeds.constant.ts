export const CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS = [
  'attachmentNotOfMessage',
  'callRecordingNotOfCalendarEvent',
] as const;

export type ChannelRecordRuleUniversalIdentifierSeed =
  (typeof CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS)[number];
