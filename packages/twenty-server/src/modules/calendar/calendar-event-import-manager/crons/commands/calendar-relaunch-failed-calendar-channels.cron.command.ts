import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CALENDAR_RELAUNCH_FAILED_CALENDAR_CHANNELS_CRON_PATTERN,
  CalendarRelaunchFailedCalendarChannelsCronJob,
} from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-relaunch-failed-calendar-channels.cron.job';

@Command({
  name: 'cron:calendar:relaunch-failed-calendar-channels',
  description:
    'Starts a cron job to relaunch failed calendar channels every 30 minutes',
})
export class CalendarRelaunchFailedCalendarChannelsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CalendarRelaunchFailedCalendarChannelsCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CALENDAR_RELAUNCH_FAILED_CALENDAR_CHANNELS_CRON_PATTERN,
        },
      },
    });
  }
}
