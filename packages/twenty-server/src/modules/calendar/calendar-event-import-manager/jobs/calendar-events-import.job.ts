import { Logger, Scope } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';

export type CalendarEventsImportJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventsImportJob {
  private readonly logger = new Logger(CalendarEventsImportJob.name);

  constructor(
    private readonly googleCalendarSyncService: CalendarEventsImportService,
  ) {}

  @Process(CalendarEventsImportJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    this.logger.log(
      `google calendar sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );

    await this.googleCalendarSyncService.processCalendarEventsImport(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
