import { MessageChannelSyncStage } from 'twenty-shared/types';

export const MESSAGING_MESSAGES_IMPORT_SYNC_STAGES: MessageChannelSyncStage[] =
  [
    MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
    MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
  ];
