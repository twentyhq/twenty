import { CalendarChannelSyncStage } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';

import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';

export const runCalendarChannelListFetch = async (
  calendarChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    CalendarChannelEntity,
    calendarChannelId,
    CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
  );

  await enqueueJobAndDrain(
    MessageQueue.calendarQueue,
    CalendarEventListFetchJob.name,
    { workspaceId, calendarChannelId },
  );
};
