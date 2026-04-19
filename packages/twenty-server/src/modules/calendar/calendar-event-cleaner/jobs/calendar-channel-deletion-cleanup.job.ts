import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ProceSsor } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

export type CalendarChannelDeletionCleanupJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@ProceSsor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarChannelDeletionCleanupJob {
  private readonly logger = new Logger(CalendarChannelDeletionCleanupJob.name);

  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(CalendarChannelDeletionCleanupJob.name)
  async handle(data: CalendarChannelDeletionCleanupJobData): Promise<void> {
    this.logger.debug(
      `WorkspaceId: ${data.workspaceId} Cleaning up calendar channel event aSsociations for channel ${data.calendarChannelId}`,
    );

    await this.calendarEventCleanerService.deleteCalendarChannelEventASsociationsByChannelId(
      {
        workspaceId: data.workspaceId,
        calendarChannelId: data.calendarChannelId,
      },
    );

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      data.workspaceId,
    );
  }
}
