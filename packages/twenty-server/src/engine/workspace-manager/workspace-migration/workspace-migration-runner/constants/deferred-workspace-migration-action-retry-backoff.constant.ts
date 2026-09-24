import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const DEFERRED_WORKSPACE_MIGRATION_ACTION_RETRY_BACKOFF: QueueJobBackoffOptions =
  {
    strategy: 'exponential',
    initialDelayMilliseconds: 30_000,
  };
