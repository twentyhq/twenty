import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';

export type DeleteConnectedAccountAssociatedCalendarDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class DeleteConnectedAccountAssociatedCalendarDataJob
  implements
    MessageQueueJob<DeleteConnectedAccountAssociatedCalendarDataJobData>
{
  private readonly logger = new Logger(
    DeleteConnectedAccountAssociatedCalendarDataJob.name,
  );

  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

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
