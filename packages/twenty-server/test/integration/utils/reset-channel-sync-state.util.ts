import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const resetMessageChannelSyncState = async (
  messageChannelId: string,
  syncCursor = 'reset-cursor',
): Promise<void> => {
  await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
    { id: messageChannelId },
    {
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      syncStageStartedAt: null,
      throttleFailureCount: 0,
      throttleRetryAfter: null,
      syncCursor,
    },
  );
};

export const resetCalendarChannelSyncState = async (
  calendarChannelId: string,
  syncCursor = 'reset-cursor',
): Promise<void> => {
  await getCoreRepository<CalendarChannelEntity>(CalendarChannelEntity).update(
    { id: calendarChannelId },
    {
      syncStatus: CalendarChannelSyncStatus.ACTIVE,
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      syncStageStartedAt: null,
      throttleFailureCount: 0,
      syncCursor,
    },
  );
};
