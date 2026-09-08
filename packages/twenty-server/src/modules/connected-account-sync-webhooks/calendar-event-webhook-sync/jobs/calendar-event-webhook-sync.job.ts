import { Logger, Scope } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-initial-delay-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_BUSY_ATTEMPT_LIMIT } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-busy-attempt-limit.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JOB_OPTIONS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-job-options.constant';
import { CalendarEventWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/services/calendar-event-webhook-sync.service';

export type CalendarEventWebhookSyncJobData = {
  calendarChannelId: string;
  workspaceId: string;
  busyAttempt?: number;
};

@Processor({
  queueName: MessageQueue.connectedAccountSyncWebhookQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventWebhookSyncJob {
  private readonly logger = new Logger(CalendarEventWebhookSyncJob.name);

  constructor(
    private readonly calendarEventWebhookSyncService: CalendarEventWebhookSyncService,
    @InjectMessageQueue(MessageQueue.connectedAccountSyncWebhookQueue)
    private readonly connectedAccountSyncWebhookQueueService: MessageQueueService,
  ) {}

  @Process(CalendarEventWebhookSyncJob.name)
  async handle(data: CalendarEventWebhookSyncJobData): Promise<void> {
    const outcome =
      await this.calendarEventWebhookSyncService.processCalendarEventWebhookSync(
        data,
      );

    switch (outcome) {
      case 'SYNC_COMPLETED':
      case 'CHANNEL_NOT_SYNCABLE':
        return;
      case 'CHANNEL_BUSY':
        await this.rescheduleBusyCalendarChannel(data);

        return;
      default:
        return assertUnreachable(outcome);
    }
  }

  private async rescheduleBusyCalendarChannel({
    calendarChannelId,
    workspaceId,
    busyAttempt = 0,
  }: CalendarEventWebhookSyncJobData): Promise<void> {
    if (busyAttempt >= CALENDAR_EVENT_WEBHOOK_SYNC_BUSY_ATTEMPT_LIMIT) {
      this.logger.warn(
        `Calendar channel ${calendarChannelId} in workspace ${workspaceId} was still syncing after ${busyAttempt} webhook sync attempts, leaving it to the fallback cron`,
      );

      return;
    }

    await this.connectedAccountSyncWebhookQueueService.add<CalendarEventWebhookSyncJobData>(
      CalendarEventWebhookSyncJob.name,
      { calendarChannelId, workspaceId, busyAttempt: busyAttempt + 1 },
      {
        delay:
          CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS * 2 ** busyAttempt,
        ...CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JOB_OPTIONS,
      },
    );
  }
}
