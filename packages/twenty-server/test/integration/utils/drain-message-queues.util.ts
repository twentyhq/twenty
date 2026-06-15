import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const SYNC_PIPELINE_QUEUES = [
  MessageQueue.cronQueue,
  MessageQueue.messagingQueue,
  MessageQueue.calendarQueue,
];

// Real BullMQ jobs persist in Redis beyond the suite (and the run) that enqueued
// them; a stray job executing after the suite's MSW server closes reaches the real
// provider APIs. Draining at suite boundaries keeps every suite hermetic.
export const drainMessageQueues = async (): Promise<void> => {
  const connection = new IORedis(process.env.REDIS_URL ?? '', {
    maxRetriesPerRequest: null,
  });

  try {
    await Promise.all(
      SYNC_PIPELINE_QUEUES.map(async (queueName) => {
        const queue = new Queue(queueName, { connection });

        await queue.obliterate({ force: true });
        await queue.close();
      }),
    );
  } finally {
    await connection.quit();
  }
};
