import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';

const CALENDAR_EVENTS_IMPORT_CRON_PATTERN = '*/5 * * * *';

@Command({
  name: 'cron:calendar:calendar-events-import',
  description: 'Starts a cron job to import calendar events',
})
export class CalendarEventsImportCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      CalendarEventsImportCronJob.name,
      undefined,
      {
        repeat: { pattern: CALENDAR_EVENTS_IMPORT_CRON_PATTERN },
      },
    );
  }
}
