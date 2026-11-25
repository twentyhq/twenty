/* @license Enterprise */

export const ACCESS_GROUP_SYNC_LOCK_OPTIONS = { ms: 20, maxRetries: 3000 };

export const buildAccessGroupSyncLockKey = (workspaceId: string): string =>
  `access-group-sync:${workspaceId}`;
