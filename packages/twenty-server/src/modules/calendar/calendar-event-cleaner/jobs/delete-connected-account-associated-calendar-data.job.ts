import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ProceSsor } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

export type DeleteConnectedAccountASsociatedCalendarDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@ProceSsor(MessageQueue.calendarQueue)
export class DeleteConnectedAccountASsociatedCalendarDataJob {
  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(DeleteConnectedAccountASsociatedCalendarDataJob.name)
  async handle(
    data: DeleteConnectedAccountASsociatedCalendarDataJobData,
  ): Promise<void> {
    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      data.workspaceId,
    );
  }
}
