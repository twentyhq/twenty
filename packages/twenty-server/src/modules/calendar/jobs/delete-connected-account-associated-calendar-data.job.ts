import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';

export type DeleteConnectedAccountAssociatedCalendarDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Processor(MessageQueue.calendarQueue)
export class DeleteConnectedAccountAssociatedCalendarDataJob {
  private readonly logger = new Logger(
    DeleteConnectedAccountAssociatedCalendarDataJob.name,
  );

  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(DeleteConnectedAccountAssociatedCalendarDataJob.name)
  async handle(
    data: DeleteConnectedAccountAssociatedCalendarDataJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting connected account ${data.connectedAccountId} associated calendar data in workspace ${data.workspaceId}`,
    );

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      data.workspaceId,
    );

    this.logger.log(
      `Deleted connected account ${data.connectedAccountId} associated calendar data in workspace ${data.workspaceId}`,
    );
  }
}
