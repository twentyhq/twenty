import { type Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

type RetryBackoffTestJobData = {
  marker: string;
};

const RETRY_BACKOFF_TEST_JOB_NAME = 'RetryBackoffTestJob';
const TEST_JOB_DELAY_MILLISECONDS = 60_000;

describe('BullMQDriver retry backoff (integration)', () => {
  let logicFunctionQueue: MessageQueueService;
  let bullMQInspectionQueue: Queue<RetryBackoffTestJobData>;
  let redisConnection: IORedis;

  beforeAll(() => {
    logicFunctionQueue = global.app.get<MessageQueueService>(
      getQueueToken(MessageQueue.logicFunctionQueue),
      { strict: false },
    );

    redisConnection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    bullMQInspectionQueue = new Queue<RetryBackoffTestJobData>(
      MessageQueue.logicFunctionQueue,
      { connection: redisConnection },
    );
  });

  afterAll(async () => {
    await bullMQInspectionQueue.close();
    await redisConnection.quit();
  });

  it('persists portable retry and backoff options on the BullMQ job', async () => {
    const testJobMarker = generateUuid();
    let enqueuedTestJob: Job<RetryBackoffTestJobData> | undefined;

    try {
      await logicFunctionQueue.add(
        RETRY_BACKOFF_TEST_JOB_NAME,
        { marker: testJobMarker },
        {
          id: testJobMarker,
          delay: TEST_JOB_DELAY_MILLISECONDS,
          retryLimit: 3,
          backoff: {
            strategy: 'exponential',
            initialDelayMilliseconds: 1_000,
            jitter: 0.5,
          },
        },
      );

      const delayedJobs = await bullMQInspectionQueue.getDelayed();

      enqueuedTestJob = delayedJobs.find(
        (job) => job.data.marker === testJobMarker,
      );

      expect(enqueuedTestJob).toBeDefined();
      expect(enqueuedTestJob?.opts).toMatchObject({
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 1_000,
          jitter: 0.5,
        },
      });
    } finally {
      enqueuedTestJob ??= (await bullMQInspectionQueue.getDelayed()).find(
        (job) => job.data.marker === testJobMarker,
      );

      if (enqueuedTestJob) {
        await enqueuedTestJob.remove();
      }
    }
  });
});
