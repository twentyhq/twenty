import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const POLL_INTERVAL_MS = 25;
const REQUIRED_CONSECUTIVE_QUIET_CHECKS = 2;
const DEFAULT_TIMEOUT_MS = 15_000;
const PENDING_JOB_STATES = [
  'waiting',
  'active',
  'prioritized',
  'waiting-children',
] as const;

let redisConnection: IORedis | null = null;
let queues: Queue[] | null = null;

const getQueues = (): Queue[] => {
  if (!queues) {
    redisConnection = new IORedis(
      process.env.REDIS_URL ?? 'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    queues = Object.values(MessageQueue).map(
      (queueName) => new Queue(queueName, { connection: redisConnection! }),
    );
  }

  return queues;
};

const getPendingJobCountsByQueue = async (): Promise<
  Record<string, number>
> => {
  const countsByQueue = await Promise.all(
    getQueues().map(async (queue) => {
      const jobCounts = await queue.getJobCounts(...PENDING_JOB_STATES);
      const pendingCount = Object.values(jobCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      return [queue.name, pendingCount] as const;
    }),
  );

  return Object.fromEntries(
    countsByQueue.filter(([, pendingCount]) => pendingCount > 0),
  );
};

export const waitForQueueQuiescence = async (
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> => {
  const startedAt = Date.now();
  let consecutiveQuietChecks = 0;

  while (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
    const pendingJobCountsByQueue = await getPendingJobCountsByQueue();

    if (Object.keys(pendingJobCountsByQueue).length === 0) {
      consecutiveQuietChecks += 1;
    } else {
      consecutiveQuietChecks = 0;

      if (Date.now() - startedAt > timeoutMs) {
        throw new Error(
          `Message queues still busy after ${timeoutMs}ms, pending jobs: ${JSON.stringify(pendingJobCountsByQueue)}`,
        );
      }
    }

    if (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
};

export const closeQueueQuiescenceResources = async (): Promise<void> => {
  if (queues) {
    await Promise.all(queues.map((queue) => queue.close()));
    queues = null;
  }

  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
};
