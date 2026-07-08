import { type Job, Queue } from 'bullmq';
import IORedis from 'ioredis';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const QUIET_POLL_INTERVAL_MS = 25;
const BUSY_POLL_INTERVAL_MS = 250;
const REQUIRED_CONSECUTIVE_QUIET_CHECKS = 2;
// The workflow worker runs at concurrency 1 on a loaded 2-core runner, so a
// single slow job plus a queued one is normal; 15s produced false stalls.
const STALL_TIMEOUT_MS = 45_000;
const HARD_TIMEOUT_MS = 120_000;
const PENDING_JOB_STATES = [
  'waiting',
  'active',
  'prioritized',
  'waiting-children',
  'delayed',
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

// Jobs scheduled further out than the stall window (e.g. billing's 24h
// UpdateSubscriptionQuantityJob) will never run during the test run; waiting
// on them can only produce false stalls.
const isBlockingJob = (job: Job): boolean => {
  if (!job.delay) {
    return true;
  }

  const remainingDelayMs = job.timestamp + job.delay - Date.now();

  return remainingDelayMs <= STALL_TIMEOUT_MS;
};

type QueueSnapshot = {
  blockingJobsByQueue: Record<string, Job[]>;
  blockingTotal: number;
  fingerprint: string;
};

const getQueueSnapshot = async (): Promise<QueueSnapshot> => {
  const jobsByQueue: Array<[string, Job[]]> = await Promise.all(
    getQueues().map(async (queue): Promise<[string, Job[]]> => {
      const jobCounts = await queue.getJobCounts(...PENDING_JOB_STATES);
      const pendingCount = Object.values(jobCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      if (pendingCount === 0) {
        return [queue.name, []];
      }

      const jobs = await queue.getJobs([...PENDING_JOB_STATES], 0, 100);

      return [
        queue.name,
        jobs.filter((job): job is Job => Boolean(job)).filter(isBlockingJob),
      ];
    }),
  );

  const blockingJobsByQueue: Record<string, Job[]> = Object.fromEntries(
    jobsByQueue.filter(([, jobs]) => jobs.length > 0),
  );

  const blockingTotal = Object.values(blockingJobsByQueue).reduce(
    (sum, jobs) => sum + jobs.length,
    0,
  );

  // Retries keep their job id but increment attemptsMade, so a churning
  // queue registers as progress while a genuinely frozen one does not.
  const fingerprint = Object.entries(blockingJobsByQueue)
    .map(
      ([queueName, jobs]) =>
        `${queueName}:${jobs
          .map(
            (job) =>
              `${job.name}#${job.id}@${job.attemptsMade}:${job.delay ?? 0}`,
          )
          .sort()
          .join(',')}`,
    )
    .sort()
    .join('|');

  return { blockingJobsByQueue, blockingTotal, fingerprint };
};

const describeBlockingJobs = (
  blockingJobsByQueue: Record<string, Job[]>,
): string => {
  return Object.entries(blockingJobsByQueue)
    .map(
      ([queueName, jobs]) =>
        `${queueName}: ${jobs
          .map(
            (job) =>
              `${job.name}(id=${job.id}, attemptsMade=${job.attemptsMade}, delay=${job.delay ?? 0})`,
          )
          .join(', ')}`,
    )
    .join('; ');
};

export const waitForAllJobsToFinish = async (): Promise<void> => {
  const startedAt = Date.now();
  let lastProgressAt = startedAt;
  let lastBusyFingerprint = '';
  let consecutiveQuietChecks = 0;
  let busy = false;

  while (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
    const { blockingJobsByQueue, blockingTotal, fingerprint } =
      await getQueueSnapshot();

    if (blockingTotal === 0) {
      busy = false;
      consecutiveQuietChecks += 1;
    } else {
      busy = true;
      consecutiveQuietChecks = 0;
      const now = Date.now();

      if (fingerprint !== lastBusyFingerprint) {
        lastBusyFingerprint = fingerprint;
        lastProgressAt = now;
      }

      if (now - lastProgressAt > STALL_TIMEOUT_MS) {
        throw new Error(
          `Message queues stalled, no progress for ${STALL_TIMEOUT_MS}ms, pending jobs: ${describeBlockingJobs(
            blockingJobsByQueue,
          )}`,
        );
      }

      if (now - startedAt > HARD_TIMEOUT_MS) {
        throw new Error(
          `Message queues still busy after ${HARD_TIMEOUT_MS}ms, pending jobs: ${describeBlockingJobs(
            blockingJobsByQueue,
          )}`,
        );
      }
    }

    if (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          busy ? BUSY_POLL_INTERVAL_MS : QUIET_POLL_INTERVAL_MS,
        ),
      );
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
