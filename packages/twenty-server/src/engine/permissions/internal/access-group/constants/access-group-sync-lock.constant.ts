/* @license Enterprise */

export const ACCESS_GROUP_SYNC_LOCK_OPTIONS = { ms: 500, maxRetries: 120 };

// Readers hold the lock for one query and queue behind each other, so they retry fast within the same 60s budget
export const ACCESS_GROUP_SYNC_READ_LOCK_OPTIONS = { ms: 20, maxRetries: 3000 };

export const buildAccessGroupSyncLockKey = (workspaceId: string): string =>
  `access-group-sync:${workspaceId}`;
