import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';


export const enqueueCronAndAwait = async ({
  cronQueueName,
  cronJobName,
  downstreamQueueName,
}: {
  cronQueueName: MessageQueue;
  cronJobName: string;
  downstreamQueueName: MessageQueue;
}): Promise<void> => {
  const connection = new IORedis(process.env.REDIS_URL ?? '', {
    maxRetriesPerRequest: null,
  });
  const cronQueue = new Queue(cronQueueName, { connection });
  const cronEvents = new QueueEvents(cronQueueName, { connection });
  const downstreamQueue = new Queue(downstreamQueueName, { connection });
  const downstreamEvents = new QueueEvents(downstreamQueueName, { connection });

  try {
    await Promise.all([
      cronEvents.waitUntilReady(),
      downstreamEvents.waitUntilReady(),
    ]);

    const cronJob = await cronQueue.add(
      cronJobName,
      {},
      { removeOnComplete: false, removeOnFail: false },
    );

    // Await the job settling (resolved OR rejected): failure-path suites expect the
    // downstream job to throw (429s, declined tokens) and assert the resulting
    // channel state, so a rejection here is an expected outcome, not a test error.
    await cronJob.waitUntilFinished(cronEvents).catch(() => undefined);

    const downstreamJobs = await downstreamQueue.getJobs([
      'waiting',
      'active',
      'delayed',
      'prioritized',
    ]);

    await Promise.all(
      downstreamJobs.map((job) =>
        job.waitUntilFinished(downstreamEvents).catch(() => undefined),
      ),
    );
  } finally {
    await Promise.all([
      cronQueue.close(),
      cronEvents.close(),
      downstreamQueue.close(),
      downstreamEvents.close(),
    ]);
    await connection.quit();
  }
};
