import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-initial-delay-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JITTER } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-jitter.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-limit.constant';

export const CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JOB_OPTIONS: Pick<
  QueueJobOptions,
  'retryLimit' | 'backoff'
> = {
  retryLimit: CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT,
  backoff: {
    strategy: 'exponential',
    initialDelayMilliseconds:
      CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS,
    jitter: CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JITTER,
  },
};
