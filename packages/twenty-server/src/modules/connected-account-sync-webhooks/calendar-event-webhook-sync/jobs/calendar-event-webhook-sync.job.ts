import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/services/calendar-event-webhook-sync.service';

export type CalendarEventWebhookSyncJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.connectedAccountSyncWebhookQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventWebhookSyncJob {
  constructor(
    private readonly calendarEventWebhookSyncService: CalendarEventWebhookSyncService,
  ) {}

  @Process(CalendarEventWebhookSyncJob.name)
  async handle(data: CalendarEventWebhookSyncJobData): Promise<void> {
    await this.calendarEventWebhookSyncService.processCalendarEventWebhookSync(
      data,
    );
  }
}
