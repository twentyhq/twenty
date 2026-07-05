import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarEventsImportJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

import { startChannelSync } from 'test/integration/messaging/utils/query-messaging.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runQueueJobAndWaitForCompletion } from 'test/integration/utils/run-queue-job.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

// The sync crons scan every active workspace's channels, so triggering them from
// a test fans out across co-located suites. These helpers instead drive a SINGLE
// channel through its per-channel leaf job: set the stage the leaf job guards on,
// enqueue it for that channel only, and wait for the queues to drain.
const scheduleChannelStage = async (
  channelEntity: EntityClassOrSchema,
  channelId: string,
  scheduledStage: MessageChannelSyncStage | CalendarChannelSyncStage,
): Promise<string> => {
  const repository = getCoreRepository<{
    id: string;
    workspaceId: string;
    syncStage: MessageChannelSyncStage | CalendarChannelSyncStage;
  }>(channelEntity);
  const channel = await repository.findOneByOrFail({ id: channelId });

  await repository.update({ id: channelId }, { syncStage: scheduledStage });

  return channel.workspaceId;
};

export const runMessageChannelSync = async (
  messageChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    MessageChannelEntity,
    messageChannelId,
    MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
  );

  await runQueueJobAndWaitForCompletion(
    MessageQueue.messagingQueue,
    MessagingMessageListFetchJob.name,
    { workspaceId, messageChannelId },
  );
};

export const runCalendarChannelListFetch = async (
  calendarChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    CalendarChannelEntity,
    calendarChannelId,
    CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
  );

  await runQueueJobAndWaitForCompletion(
    MessageQueue.calendarQueue,
    CalendarEventListFetchJob.name,
    { workspaceId, calendarChannelId },
  );
};

export const runCalendarChannelEventsImport = async (
  calendarChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    CalendarChannelEntity,
    calendarChannelId,
    CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
  );

  await runQueueJobAndWaitForCompletion(
    MessageQueue.calendarQueue,
    CalendarEventsImportJob.name,
    { workspaceId, calendarChannelId },
  );
};

export const startChannelSyncAndAwait = async (
  connectedAccountId: string,
): Promise<void> => {
  await startChannelSync(connectedAccountId);
  await waitForAllJobsToFinish();
};
