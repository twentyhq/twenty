export const CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS = {
  ms: 500,
  maxRetries: 240,
};

export const buildChannelVisibilityRuleSyncLockKey = (
  workspaceId: string,
): string => `channel-visibility-rule-sync:${workspaceId}`;
