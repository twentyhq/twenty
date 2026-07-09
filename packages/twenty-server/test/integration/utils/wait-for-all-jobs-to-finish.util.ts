import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const POLL_INTERVAL_MS = 25;
const REQUIRED_CONSECUTIVE_QUIET_CHECKS = 2;
const STALL_TIMEOUT_MS = 15_000;
const HARD_TIMEOUT_MS = 120_000;
// Delayed jobs due later than this are intentionally scheduled for the far
// future (e.g. the 24h billing seats settling job) and would otherwise make
// every subsequent hook fail with a stall error; they are not in-flight work,
// so they don't count as pending.
const DELAYED_JOB_DUE_SOON_HORIZON_MS = STALL_TIMEOUT_MS;
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
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    queues = Object.values(MessageQueue).map(
      (queueName) => new Queue(queueName, { connection: redisConnection! }),
    );
  }

  return queues;
};

// BullMQ stores delayed jobs in a zset scored with the due timestamp shifted
// 12 bits left (see bullmq's getDelayedScore.lua), so the score is the source
// of truth for when a job actually runs, including retry/backoff reschedules.
const DELAYED_SCORE_PER_MS = 0x1000;

const getDueSoonDelayedJobCount = async (queue: Queue): Promise<number> => {
  const client = await queue.client;
  const dueSoonThreshold = Date.now() + DELAYED_JOB_DUE_SOON_HORIZON_MS;
  const maxScore = (dueSoonThreshold + 1) * DELAYED_SCORE_PER_MS - 1;

  return client.zcount(queue.toKey('delayed'), 0, maxScore);
};

const getPendingJobCountsByQueue = async (): Promise<
  Record<string, number>
> => {
  const countsByQueue = await Promise.all(
    getQueues().map(async (queue) => {
      const jobCounts = await queue.getJobCounts(...PENDING_JOB_STATES);
      const pendingCount =
        Object.values(jobCounts).reduce((sum, count) => sum + count, 0) +
        (await getDueSoonDelayedJobCount(queue));

      return [queue.name, pendingCount] as const;
    }),
  );

  return Object.fromEntries(
    countsByQueue.filter(([, pendingCount]) => pendingCount > 0),
  );
};

const getActiveJobsFingerprint = async (
  busyQueueNames: string[],
): Promise<string> => {
  const activeJobIdsByQueue = await Promise.all(
    getQueues()
      .filter((queue) => busyQueueNames.includes(queue.name))
      .map(async (queue) => {
        const activeJobs = await queue.getActive(0, 50);

        return `${queue.name}:${activeJobs.map((job) => job.id).join(',')}`;
      }),
  );

  return activeJobIdsByQueue.join('|');
};

export const waitForAllJobsToFinish = async (): Promise<void> => {
  const startedAt = Date.now();
  let lastProgressAt = startedAt;
  let lastBusyFingerprint = '';
  let consecutiveQuietChecks = 0;

  while (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
    const pendingJobCountsByQueue = await getPendingJobCountsByQueue();
    const pendingTotal = Object.values(pendingJobCountsByQueue).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (pendingTotal === 0) {
      consecutiveQuietChecks += 1;
    } else {
      consecutiveQuietChecks = 0;
      const now = Date.now();

      const activeJobsFingerprint = await getActiveJobsFingerprint(
        Object.keys(pendingJobCountsByQueue),
      );
      const busyFingerprint = `${pendingTotal}|${activeJobsFingerprint}`;

      if (busyFingerprint !== lastBusyFingerprint) {
        lastBusyFingerprint = busyFingerprint;
        lastProgressAt = now;
      }

      if (now - lastProgressAt > STALL_TIMEOUT_MS) {
        throw new Error(
          `Message queues stalled, no progress for ${STALL_TIMEOUT_MS}ms, pending jobs: ${JSON.stringify(pendingJobCountsByQueue)}`,
        );
      }

      if (now - startedAt > HARD_TIMEOUT_MS) {
        throw new Error(
          `Message queues still busy after ${HARD_TIMEOUT_MS}ms, pending jobs: ${JSON.stringify(pendingJobCountsByQueue)}`,
        );
      }
    }

    if (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
};

export const closeQueueConnections = async (): Promise<void> => {
  if (queues) {
    await Promise.allSettled(queues.map((queue) => queue.close()));
    queues = null;
  }

  if (redisConnection) {
    await redisConnection.quit().catch(() => redisConnection?.disconnect());
    redisConnection = null;
  }
};
