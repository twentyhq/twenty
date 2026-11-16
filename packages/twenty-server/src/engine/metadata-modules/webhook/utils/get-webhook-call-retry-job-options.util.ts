import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const getWebhookCallRetryJobOptions = ({
  retryLimit,
  initialDelayMilliseconds,
}: {
  retryLimit: number;
  initialDelayMilliseconds: number;
}): Pick<QueueJobSettings, 'retryLimit' | 'backoff'> => ({
  retryLimit,
  backoff: {
    strategy: 'exponential',
    initialDelayMilliseconds,
    jitter: 0.2,
  },
});
