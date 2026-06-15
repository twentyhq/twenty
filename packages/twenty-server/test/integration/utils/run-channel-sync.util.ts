import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
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
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

// Drives a SINGLE channel's sync through its per-channel leaf job rather than the
// workspace-global cron. The cron scans every active workspace's channels, so
// triggering it from a test fans out across co-located suites' workspaces; the leaf
// job only ever touches the one channel we pass. We set the stage the leaf guards
// on, enqueue it for our channel, and await it natively (waitUntilFinished). We
// await it SETTLING (resolve OR reject): failure-path suites expect the job to throw
// (429s, declined tokens) and assert the resulting channel state.
const enqueueLeafAndAwait = async <TData extends object>(
  queueName: MessageQueue,
  leafJobName: string,
  data: TData,
): Promise<void> => {
  const connection = new IORedis(process.env.REDIS_URL ?? '', {
    maxRetriesPerRequest: null,
  });
  const queue = new Queue(queueName, { connection });
  const queueEvents = new QueueEvents(queueName, { connection });

  try {
    await queueEvents.waitUntilReady();

    const job = await queue.add(leafJobName, data, {
      removeOnComplete: false,
      removeOnFail: false,
    });

    await job.waitUntilFinished(queueEvents).catch(() => undefined);
  } finally {
    await queue.close();
    await queueEvents.close();
    await connection.quit();
  }
};

const scheduleChannel = async (
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
  const workspaceId = await scheduleChannel(
    MessageChannelEntity,
    messageChannelId,
    MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
  );

  await enqueueLeafAndAwait(
    MessageQueue.messagingQueue,
    MessagingMessageListFetchJob.name,
    { workspaceId, messageChannelId },
  );
};

export const runCalendarChannelListFetch = async (
  calendarChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannel(
    CalendarChannelEntity,
    calendarChannelId,
    CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
  );

  await enqueueLeafAndAwait(
    MessageQueue.calendarQueue,
    CalendarEventListFetchJob.name,
    { workspaceId, calendarChannelId },
  );
};

export const runCalendarChannelEventsImport = async (
  calendarChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannel(
    CalendarChannelEntity,
    calendarChannelId,
    CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
  );

  await enqueueLeafAndAwait(
    MessageQueue.calendarQueue,
    CalendarEventsImportJob.name,
    { workspaceId, calendarChannelId },
  );
};
