import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarEventsImportJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

import { startChannelSync } from 'test/integration/messaging/utils/query-messaging.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

// Enqueues on the real BullMQ queue and waits for every queue to drain, so
// follow-up jobs the worker chains (imports, contact creation, ...) are also
// done when this resolves. Failure-path suites rely on the job being allowed
// to fail: they assert the resulting channel state afterwards.
const enqueueJobAndDrain = async <TData extends MessageQueueJobData>(
  queue: MessageQueue,
  jobName: string,
  data: TData,
): Promise<void> => {
  const messageQueueService = global.app.get<MessageQueueService>(
    getQueueToken(queue),
    { strict: false },
  );

  await messageQueueService.add(jobName, data);
  await waitForAllJobsToFinish();
};

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

  await enqueueJobAndDrain(
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

  await enqueueJobAndDrain(
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

  await enqueueJobAndDrain(
    MessageQueue.calendarQueue,
    CalendarEventsImportJob.name,
    { workspaceId, calendarChannelId },
  );
};

export const runSyncCron = async (cronJob: {
  name: string;
}): Promise<void> => {
  await enqueueJobAndDrain(MessageQueue.cronQueue, cronJob.name, {});
};

export const startChannelSyncAndAwait = async (
  connectedAccountId: string,
): Promise<void> => {
  await startChannelSync(connectedAccountId);
  await waitForAllJobsToFinish();
};
