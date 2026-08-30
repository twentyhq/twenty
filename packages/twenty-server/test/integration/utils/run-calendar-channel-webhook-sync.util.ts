import { CalendarChannelSyncStage } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarEventWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';

import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';

export const runCalendarChannelWebhookSync = async (
  calendarChannelId: string,
  startingStage: CalendarChannelSyncStage = CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    CalendarChannelEntity,
    calendarChannelId,
    startingStage,
  );

  await enqueueJobAndDrain(
    MessageQueue.connectedAccountSyncWebhookQueue,
    CalendarEventWebhookSyncJob.name,
    { workspaceId, calendarChannelId },
  );
};
