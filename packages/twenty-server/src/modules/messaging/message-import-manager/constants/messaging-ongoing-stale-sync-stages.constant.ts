import { MessageChannelSyncStage } from 'twenty-shared/types';

export const MESSAGING_ONGOING_STALE_SYNC_STAGES: MessageChannelSyncStage[] = [
  MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
  MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
  MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
  MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
];
