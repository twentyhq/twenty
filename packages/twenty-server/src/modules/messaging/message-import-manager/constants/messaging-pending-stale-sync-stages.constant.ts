import { MessageChannelSyncStage } from 'twenty-shared/types';

// Unlike MESSAGING_ONGOING_STALE_SYNC_STAGES, a channel in one of these
// stages is only considered stale when it carries a real (non-null)
// syncStageStartedAt older than the timeout — see isPendingSyncStale.
export const MESSAGING_PENDING_STALE_SYNC_STAGES: MessageChannelSyncStage[] = [
  MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
  MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
];
