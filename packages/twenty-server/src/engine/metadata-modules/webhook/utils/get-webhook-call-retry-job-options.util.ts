import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const getWebhookCallRetryJobOptions = (
  twentyConfigService: TwentyConfigService,
): Pick<QueueJobSettings, 'retryLimit' | 'backoff'> => ({
  retryLimit: twentyConfigService.get('WEBHOOK_CALL_RETRY_LIMIT'),
  backoff: {
    strategy: 'exponential',
    initialDelayMilliseconds: twentyConfigService.get(
      'WEBHOOK_CALL_RETRY_INITIAL_DELAY_IN_MS',
    ),
    jitter: 0.2,
  },
});
