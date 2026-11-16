import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const WEBHOOK_CALL_RETRY_BACKOFF = {
  strategy: 'exponential',
  initialDelayMilliseconds: 60_000,
  jitter: 0.2,
} as const satisfies QueueJobBackoffOptions;
