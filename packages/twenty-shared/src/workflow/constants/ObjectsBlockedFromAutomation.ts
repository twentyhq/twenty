import { OBJECTS_SYNCED_FROM_CONNECTED_ACCOUNTS } from './ObjectsSyncedFromConnectedAccounts';

// Objects whose records must not be created, updated, or deleted by
// automation callers (workflows and AI tools). Either they back the
// automation runtime itself (recursion risk), gate access/permissions,
// or are owned by background sync (writing to them corrupts state).
export const OBJECTS_BLOCKED_FROM_AUTOMATION = [
  'workflowRun',
  'workspaceMember',
  'dashboard',
  ...OBJECTS_SYNCED_FROM_CONNECTED_ACCOUNTS,
] as const;
