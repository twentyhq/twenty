import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// With WEBHOOK_CALL_RETRY_LIMIT retries: ~1, 2, 4, 8, 16 min, about 31 min in total.
export const WEBHOOK_CALL_RETRY_BACKOFF = {
  strategy: 'exponential',
  initialDelayMilliseconds: 60_000,
  jitter: 0.2,
} as const satisfies QueueJobBackoffOptions;
